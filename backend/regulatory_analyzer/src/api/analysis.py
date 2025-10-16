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
    target_product_path: str
    start_date: str
    end_date: str
    notification_emails: List[str] = []
    trusted_websites: List[str] = []
    languages: List[str] = ["English"]
    target_country: str = "United States"
    guardrails: str = ""

class AnalysisResponse(BaseModel):
    report_id: int
    status: str
    message: str

# Mock analysis orchestrator for demo
class MockAnalysisOrchestrator:
    def __init__(self):
        self.active_analyses = {}
    
    async def start_analysis(self, report_id: int, analysis_request: AnalysisRequest):
        """Start a mock analysis process"""
        self.active_analyses[report_id] = {
            "status": "in_progress",
            "progress": 0,
            "current_stage": "Initializing",
            "message": "Starting analysis..."
        }
        
        # Simulate analysis stages
        stages = [
            ("Query Generation", 20),
            ("Data Acquisition", 40),
            ("Content Filtering", 60),
            ("AI Analysis", 80),
            ("Report Generation", 100)
        ]
        
        for stage_name, progress in stages:
            await asyncio.sleep(2)  # Simulate processing time
            self.active_analyses[report_id].update({
                "current_stage": stage_name,
                "progress": progress,
                "message": f"Processing {stage_name.lower()}..."
            })
        
        # Mark as completed
        self.active_analyses[report_id].update({
            "status": "completed",
            "progress": 100,
            "current_stage": "Completed",
            "message": "Analysis completed successfully!"
        })

mock_orchestrator = MockAnalysisOrchestrator()

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
            mock_orchestrator.start_analysis,
            report.id,
            analysis_request
        )
        
        return AnalysisResponse(
            report_id=report.id,
            status="started",
            message="Analysis started successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/progress/{report_id}")
async def get_analysis_progress(report_id: int):
    """Get analysis progress for a specific report"""
    if report_id not in mock_orchestrator.active_analyses:
        return {
            "report_id": report_id,
            "status": "not_found",
            "progress": 0,
            "current_stage": "Unknown",
            "message": "Analysis not found"
        }
    
    return {
        "report_id": report_id,
        **mock_orchestrator.active_analyses[report_id]
    }

@router.get("/active")
async def get_active_analyses():
    """Get all active analyses"""
    return {
        "active_analyses": len(mock_orchestrator.active_analyses),
        "analyses": list(mock_orchestrator.active_analyses.keys())
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
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "active_analyses": len(mock_orchestrator.active_analyses)
    }
