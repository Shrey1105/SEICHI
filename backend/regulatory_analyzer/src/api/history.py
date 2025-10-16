"""
History API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..database.session import get_db
from ..database.models import User, Report, RegulatoryChange
from ..schemas import Report, RegulatoryChange
from ..api.auth import get_current_user

router = APIRouter()

@router.get("/reports", response_model=List[Report])
async def get_analysis_history(
    skip: int = 0,
    limit: int = 100,
    days: Optional[int] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analysis history for current user"""
    query = db.query(Report).filter(Report.user_id == current_user.id)
    
    # Filter by date range
    if days:
        start_date = datetime.utcnow() - timedelta(days=days)
        query = query.filter(Report.created_at >= start_date)
    
    # Filter by status
    if status:
        query = query.filter(Report.status == status)
    
    reports = query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    return reports

@router.get("/regulatory-changes", response_model=List[RegulatoryChange])
async def get_regulatory_changes_history(
    skip: int = 0,
    limit: int = 100,
    days: Optional[int] = None,
    risk_level: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get regulatory changes history for current user"""
    # Join with reports to filter by user
    query = db.query(RegulatoryChange).join(Report).filter(
        Report.user_id == current_user.id
    )
    
    # Filter by date range
    if days:
        start_date = datetime.utcnow() - timedelta(days=days)
        query = query.filter(RegulatoryChange.created_at >= start_date)
    
    # Filter by risk level
    if risk_level:
        query = query.filter(RegulatoryChange.risk_level == risk_level)
    
    regulatory_changes = query.order_by(
        RegulatoryChange.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return regulatory_changes

@router.get("/reports/{report_id}/timeline")
async def get_report_timeline(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get timeline of events for a specific report"""
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
    
    # Get regulatory changes for the report
    regulatory_changes = db.query(RegulatoryChange).filter(
        RegulatoryChange.report_id == report_id
    ).order_by(RegulatoryChange.created_at).all()
    
    timeline = []
    
    # Add report creation event
    timeline.append({
        "timestamp": report.created_at,
        "event_type": "report_created",
        "description": f"Analysis '{report.title}' was created",
        "data": {"report_id": report.id, "status": report.status}
    })
    
    # Add regulatory changes
    for change in regulatory_changes:
        timeline.append({
            "timestamp": change.created_at,
            "event_type": "regulatory_change_found",
            "description": f"New regulatory change: {change.title}",
            "data": {
                "change_id": change.id,
                "risk_level": change.risk_level,
                "confidence_score": change.confidence_score
            }
        })
    
    # Add completion event if report is completed
    if report.completed_at:
        timeline.append({
            "timestamp": report.completed_at,
            "event_type": "analysis_completed",
            "description": f"Analysis '{report.title}' was completed",
            "data": {"report_id": report.id, "status": report.status}
        })
    
    # Sort timeline by timestamp
    timeline.sort(key=lambda x: x["timestamp"])
    
    return {
        "report_id": report_id,
        "timeline": timeline,
        "total_events": len(timeline)
    }

@router.get("/statistics")
async def get_analysis_statistics(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analysis statistics for current user"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get reports in date range
    reports = db.query(Report).filter(
        Report.user_id == current_user.id,
        Report.created_at >= start_date
    ).all()
    
    # Get regulatory changes in date range
    regulatory_changes = db.query(RegulatoryChange).join(Report).filter(
        Report.user_id == current_user.id,
        RegulatoryChange.created_at >= start_date
    ).all()
    
    # Calculate statistics
    total_reports = len(reports)
    completed_reports = len([r for r in reports if r.status == "completed"])
    total_regulatory_changes = len(regulatory_changes)
    
    # Risk level distribution
    risk_levels = {}
    for change in regulatory_changes:
        risk_level = change.risk_level or "unknown"
        risk_levels[risk_level] = risk_levels.get(risk_level, 0) + 1
    
    # Average confidence score
    confidence_scores = [c.confidence_score for c in regulatory_changes if c.confidence_score]
    avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
    
    return {
        "period_days": days,
        "total_reports": total_reports,
        "completed_reports": completed_reports,
        "completion_rate": (completed_reports / total_reports * 100) if total_reports > 0 else 0,
        "total_regulatory_changes": total_regulatory_changes,
        "risk_level_distribution": risk_levels,
        "average_confidence_score": round(avg_confidence, 2),
        "reports_per_day": round(total_reports / days, 2),
        "changes_per_report": round(total_regulatory_changes / total_reports, 2) if total_reports > 0 else 0
    }
