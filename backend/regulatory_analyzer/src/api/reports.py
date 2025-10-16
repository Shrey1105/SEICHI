"""
Reports API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database.session import get_db
from ..database.models import User, Report, CompanyProfile, RegulatoryChange
from ..schemas import (
    ReportCreate, Report, ReportUpdate, 
    RegulatoryChange, AnalysisRequest, AnalysisResult
)
from ..api.auth import get_current_user
from ..core.pipeline.orchestrator import AnalysisOrchestrator

router = APIRouter()

@router.post("/", response_model=Report)
async def create_report(
    report: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new report"""
    # Verify company profile belongs to user
    company_profile = db.query(CompanyProfile).filter(
        CompanyProfile.id == report.company_profile_id,
        CompanyProfile.user_id == current_user.id
    ).first()
    
    if not company_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile not found"
        )
    
    db_report = Report(
        title=report.title,
        analysis_type=report.analysis_type,
        scope=report.scope,
        user_id=current_user.id,
        company_profile_id=report.company_profile_id
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@router.get("/", response_model=List[Report])
async def get_reports(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all reports for current user"""
    reports = db.query(Report).filter(
        Report.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return reports

@router.get("/{report_id}", response_model=Report)
async def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific report"""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return report

@router.put("/{report_id}", response_model=Report)
async def update_report(
    report_id: int,
    report_update: ReportUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a report"""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    for field, value in report_update.dict(exclude_unset=True).items():
        setattr(report, field, value)
    
    db.commit()
    db.refresh(report)
    return report

@router.delete("/{report_id}")
async def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a report"""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}

@router.get("/{report_id}/regulatory-changes", response_model=List[RegulatoryChange])
async def get_report_regulatory_changes(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get regulatory changes for a specific report"""
    # Verify report belongs to user
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    regulatory_changes = db.query(RegulatoryChange).filter(
        RegulatoryChange.report_id == report_id
    ).all()
    
    return regulatory_changes

@router.post("/analyze", response_model=Report)
async def start_analysis(
    analysis_request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new regulatory analysis"""
    # Verify company profile belongs to user
    company_profile = db.query(CompanyProfile).filter(
        CompanyProfile.id == analysis_request.company_profile_id,
        CompanyProfile.user_id == current_user.id
    ).first()
    
    if not company_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile not found"
        )
    
    # Create report
    report = Report(
        title=f"Analysis - {company_profile.company_name}",
        analysis_type=analysis_request.analysis_type,
        scope=analysis_request.scope,
        user_id=current_user.id,
        company_profile_id=analysis_request.company_profile_id,
        status="pending"
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # Start analysis in background
    orchestrator = AnalysisOrchestrator()
    background_tasks.add_task(
        orchestrator.run_analysis,
        report_id=report.id,
        company_profile_id=analysis_request.company_profile_id,
        analysis_type=analysis_request.analysis_type,
        scope=analysis_request.scope,
        keywords=analysis_request.keywords
    )
    
    return report

@router.get("/{report_id}/status")
async def get_analysis_status(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analysis status and progress"""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    regulatory_changes_count = db.query(RegulatoryChange).filter(
        RegulatoryChange.report_id == report_id
    ).count()
    
    return {
        "report_id": report_id,
        "status": report.status,
        "created_at": report.created_at,
        "completed_at": report.completed_at,
        "regulatory_changes_count": regulatory_changes_count
    }
