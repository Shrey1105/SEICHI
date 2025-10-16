"""
Analysis Orchestrator - Coordinates the 4-stage AI analysis pipeline
"""

import asyncio
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
import logging

from ...database.session import SessionLocal
from ...database.models import Report, CompanyProfile, RegulatoryChange
from ...schemas import AnalysisProgress
from ...socketio_server import emit_analysis_progress, emit_analysis_complete, emit_analysis_error
from .query_generator import QueryGenerator
from .data_acquirer import DataAcquirer
from .content_filter import ContentFilter
from .ai_analyst import AIAnalyst

logger = logging.getLogger(__name__)

class AnalysisOrchestrator:
    """Orchestrates the complete regulatory analysis pipeline"""
    
    def __init__(self):
        self.query_generator = QueryGenerator()
        self.data_acquirer = DataAcquirer()
        self.content_filter = ContentFilter()
        self.ai_analyst = AIAnalyst()
    
    async def run_analysis(
        self,
        report_id: int,
        company_profile_id: int,
        analysis_type: str = "comprehensive",
        scope: Optional[str] = None,
        keywords: Optional[List[str]] = None
    ):
        """Run the complete analysis pipeline"""
        db = SessionLocal()
        try:
            # Get report and company profile
            report = db.query(Report).filter(Report.id == report_id).first()
            company_profile = db.query(CompanyProfile).filter(
                CompanyProfile.id == company_profile_id
            ).first()
            
            if not report or not company_profile:
                raise ValueError("Report or company profile not found")
            
            # Update report status
            report.status = "in_progress"
            db.commit()
            
            # Stage 1: Query Generation
            await self._update_progress(db, report_id, 10, "query_generation", "Generating search queries...")
            queries = await self.query_generator.generate_queries(
                company_profile=company_profile,
                analysis_type=analysis_type,
                scope=scope,
                keywords=keywords
            )
            
            # Stage 2: Data Acquisition
            await self._update_progress(db, report_id, 30, "data_acquisition", "Acquiring regulatory data...")
            raw_data = await self.data_acquirer.acquire_data(queries)
            
            # Stage 3: Content Filtering
            await self._update_progress(db, report_id, 60, "content_filtering", "Filtering relevant content...")
            filtered_data = await self.content_filter.filter_content(
                raw_data, company_profile, analysis_type
            )
            
            # Stage 4: AI Analysis
            await self._update_progress(db, report_id, 80, "ai_analysis", "Analyzing regulatory changes...")
            regulatory_changes = await self.ai_analyst.analyze_changes(
                filtered_data, company_profile, analysis_type
            )
            
            # Save regulatory changes to database
            await self._save_regulatory_changes(db, report_id, regulatory_changes)
            
            # Complete analysis
            await self._update_progress(db, report_id, 100, "completed", "Analysis completed successfully")
            report.status = "completed"
            report.completed_at = datetime.utcnow()
            db.commit()
            
            # Emit completion event
            completion_data = {
                'report_id': report_id,
                'status': 'completed',
                'message': 'Analysis completed successfully',
                'completed_at': report.completed_at.isoformat(),
                'regulatory_changes_count': len(regulatory_changes)
            }
            await emit_analysis_complete(report_id, completion_data)
            
        except Exception as e:
            # Handle errors
            logger.error(f"Analysis failed for report {report_id}: {str(e)}")
            report.status = "failed"
            db.commit()
            await self._update_progress(
                db, report_id, 0, "failed", f"Analysis failed: {str(e)}"
            )
            
            # Emit error event
            error_data = {
                'report_id': report_id,
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
            await emit_analysis_error(report_id, error_data)
            raise e
        finally:
            db.close()
    
    async def _update_progress(
        self,
        db: Session,
        report_id: int,
        progress_percentage: int,
        current_stage: str,
        message: str
    ):
        """Update analysis progress"""
        logger.info(f"Report {report_id}: {progress_percentage}% - {current_stage} - {message}")
        
        # Emit Socket.io event for real-time updates
        progress_data = {
            'report_id': report_id,
            'progress_percentage': progress_percentage,
            'current_stage': current_stage,
            'message': message,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        try:
            await emit_analysis_progress(report_id, progress_data)
        except Exception as e:
            logger.error(f"Failed to emit progress update: {e}")
    
    async def _save_regulatory_changes(
        self,
        db: Session,
        report_id: int,
        regulatory_changes: List[Dict[str, Any]]
    ):
        """Save regulatory changes to database"""
        for change_data in regulatory_changes:
            regulatory_change = RegulatoryChange(
                report_id=report_id,
                source_url=change_data.get("source_url", ""),
                title=change_data.get("title", ""),
                summary=change_data.get("summary", ""),
                impact_assessment=change_data.get("impact_assessment", ""),
                compliance_requirements=change_data.get("compliance_requirements", ""),
                implementation_timeline=change_data.get("implementation_timeline", ""),
                risk_level=change_data.get("risk_level", "medium"),
                confidence_score=change_data.get("confidence_score", 0.5),
                relevant_sections=change_data.get("relevant_sections", []),
                affected_areas=change_data.get("affected_areas", []),
                action_items=change_data.get("action_items", [])
            )
            db.add(regulatory_change)
        
        db.commit()
