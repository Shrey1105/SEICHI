from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import uuid
import asyncio

from ..database.session import get_db
from ..database.models import Report, User, CompanyProfile
from ..core.pipeline.orchestrator import AnalysisOrchestrator
from ..schemas import ReportCreate, ReportResponse, AnalysisRequest, AnalysisProgress

router = APIRouter()

class AnalysisCreateRequest(BaseModel):
    title: str
    categories: str
    target_product_path: Optional[str] = ""
    start_date: str
    end_date: str
    notification_emails: Optional[List[str]] = []
    trusted_websites: Optional[List[str]] = []
    languages: Optional[List[str]] = ["English"]
    target_country: Optional[str] = "United States"
    guardrails: Optional[str] = ""

class AnalysisResponse(BaseModel):
    report_id: int
    status: str
    message: str

# Use real analysis orchestrator
orchestrator = AnalysisOrchestrator()

@router.post("/create", response_model=AnalysisResponse)
async def create_analysis(
    request: AnalysisCreateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create a new regulatory analysis"""
    try:
        # Create a new report record
        report = Report(
            title=request.title,
            analysis_type="comprehensive",
            scope=f"Analysis for {request.categories} from {request.start_date} to {request.end_date}",
            status="pending",
            user_id=1,  # Mock user ID
            company_profile_id=1,  # Mock company profile ID
            created_at=datetime.utcnow()
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        # Create analysis request
        analysis_request = AnalysisRequest(
            company_profile_id=1,
            analysis_type="comprehensive",
            scope=report.scope,
            keywords=[request.categories]
        )
        
        # Start analysis in background
        background_tasks.add_task(
            orchestrator.run_analysis,
            report_id=report.id,
            company_profile_id=1,
            analysis_type="comprehensive",
            scope=report.scope,
            keywords=[request.categories]
        )
        
        return AnalysisResponse(
            report_id=report.id,
            status="started",
            message="Analysis started successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/progress/{report_id}")
async def get_analysis_progress(report_id: int, db: Session = Depends(get_db)):
    """Get analysis progress for a specific report"""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        return {
            "report_id": report_id,
            "status": "not_found",
            "progress": 0,
            "current_stage": "Unknown",
            "message": "Analysis not found"
        }
    
    return {
        "report_id": report_id,
        "status": report.status,
        "progress": 100 if report.status == "completed" else 50 if report.status == "in_progress" else 0,
        "current_stage": "Completed" if report.status == "completed" else "In Progress" if report.status == "in_progress" else "Pending",
        "message": f"Analysis {report.status}"
    }

@router.get("/active")
async def get_active_analyses(db: Session = Depends(get_db)):
    """Get all active analyses"""
    active_reports = db.query(Report).filter(Report.status.in_(["pending", "in_progress"])).all()
    return {
        "active_analyses": len(active_reports),
        "analyses": [report.id for report in active_reports]
    }

@router.get("/reports", response_model=List[ReportResponse])
async def get_reports(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all reports with pagination"""
    reports = db.query(Report).offset(skip).limit(limit).all()
    return reports

@router.get("/reports/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db: Session = Depends(get_db)):
    """Get a specific report by ID"""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.delete("/reports/{report_id}")
async def delete_report(report_id: int, db: Session = Depends(get_db)):
    """Delete a report"""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    db.delete(report)
    db.commit()
    
    return {"message": "Report deleted successfully"}

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    active_reports = db.query(Report).filter(Report.status.in_(["pending", "in_progress"])).count()
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "active_analyses": active_reports
    }
