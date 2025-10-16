"""
Background tasks for the Regulatory Intelligence Platform
"""

from celery import current_task
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging

from .celery_app import celery_app
from .database.session import SessionLocal
from .database.models import Report, Schedule
from .core.pipeline.orchestrator import AnalysisOrchestrator

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def run_analysis_task(self, report_id: int, company_profile_id: int, analysis_type: str = "comprehensive"):
    """Run analysis in background task"""
    try:
        # Update task status
        self.update_state(state="PROGRESS", meta={"current": 0, "total": 100, "status": "Starting analysis..."})
        
        # Create orchestrator and run analysis
        orchestrator = AnalysisOrchestrator()
        
        # Run the analysis (this will emit Socket.io events)
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            loop.run_until_complete(
                orchestrator.run_analysis(
                    report_id=report_id,
                    company_profile_id=company_profile_id,
                    analysis_type=analysis_type
                )
            )
        finally:
            loop.close()
        
        return {"status": "completed", "report_id": report_id}
        
    except Exception as e:
        logger.error(f"Analysis task failed: {e}")
        self.update_state(
            state="FAILURE",
            meta={"error": str(e), "report_id": report_id}
        )
        raise e

@celery_app.task
def cleanup_old_reports():
    """Clean up old reports and temporary data"""
    try:
        db = SessionLocal()
        
        # Delete reports older than 90 days
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        old_reports = db.query(Report).filter(
            Report.created_at < cutoff_date,
            Report.status.in_(["completed", "failed"])
        ).all()
        
        for report in old_reports:
            db.delete(report)
        
        db.commit()
        db.close()
        
        logger.info(f"Cleaned up {len(old_reports)} old reports")
        return {"cleaned_reports": len(old_reports)}
        
    except Exception as e:
        logger.error(f"Cleanup task failed: {e}")
        raise e

@celery_app.task
def process_scheduled_analyses():
    """Process scheduled analyses"""
    try:
        db = SessionLocal()
        
        # Find schedules that are due to run
        now = datetime.utcnow()
        due_schedules = db.query(Schedule).filter(
            Schedule.is_active == True,
            Schedule.next_run <= now
        ).all()
        
        processed = 0
        for schedule in due_schedules:
            try:
                # Create a new report for the scheduled analysis
                report = Report(
                    title=f"Scheduled Analysis - {schedule.name}",
                    analysis_type=schedule.analysis_type,
                    scope=f"Automated analysis for {schedule.name}",
                    status="pending",
                    user_id=schedule.user_id,
                    company_profile_id=schedule.company_profile_id
                )
                
                db.add(report)
                db.commit()
                db.refresh(report)
                
                # Start the analysis task
                run_analysis_task.delay(
                    report_id=report.id,
                    company_profile_id=schedule.company_profile_id,
                    analysis_type=schedule.analysis_type
                )
                
                # Update next run time
                if schedule.frequency == "daily":
                    schedule.next_run = now + timedelta(days=1)
                elif schedule.frequency == "weekly":
                    schedule.next_run = now + timedelta(weeks=1)
                elif schedule.frequency == "monthly":
                    schedule.next_run = now + timedelta(days=30)
                elif schedule.frequency == "quarterly":
                    schedule.next_run = now + timedelta(days=90)
                
                schedule.last_run = now
                processed += 1
                
            except Exception as e:
                logger.error(f"Failed to process schedule {schedule.id}: {e}")
        
        db.commit()
        db.close()
        
        logger.info(f"Processed {processed} scheduled analyses")
        return {"processed_schedules": processed}
        
    except Exception as e:
        logger.error(f"Scheduled analysis task failed: {e}")
        raise e
