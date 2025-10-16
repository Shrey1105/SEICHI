"""
Schedules API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..database.session import get_db
from ..database.models import User, Schedule, CompanyProfile
from ..schemas import ScheduleCreate, Schedule, ScheduleUpdate
from ..api.auth import get_current_user

router = APIRouter()

def calculate_next_run(frequency: str, last_run: datetime = None) -> datetime:
    """Calculate next run time based on frequency"""
    base_time = last_run or datetime.utcnow()
    
    if frequency == "daily":
        return base_time + timedelta(days=1)
    elif frequency == "weekly":
        return base_time + timedelta(weeks=1)
    elif frequency == "monthly":
        return base_time + timedelta(days=30)
    elif frequency == "quarterly":
        return base_time + timedelta(days=90)
    else:
        return base_time + timedelta(days=1)

@router.post("/", response_model=Schedule)
async def create_schedule(
    schedule: ScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new analysis schedule"""
    # Verify company profile belongs to user
    company_profile = db.query(CompanyProfile).filter(
        CompanyProfile.id == schedule.company_profile_id,
        CompanyProfile.user_id == current_user.id
    ).first()
    
    if not company_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile not found"
        )
    
    # Calculate next run time
    next_run = calculate_next_run(schedule.frequency)
    
    db_schedule = Schedule(
        name=schedule.name,
        frequency=schedule.frequency,
        analysis_type=schedule.analysis_type,
        user_id=current_user.id,
        company_profile_id=schedule.company_profile_id,
        next_run=next_run
    )
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@router.get("/", response_model=List[Schedule])
async def get_schedules(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all schedules for current user"""
    query = db.query(Schedule).filter(Schedule.user_id == current_user.id)
    
    if is_active is not None:
        query = query.filter(Schedule.is_active == is_active)
    
    schedules = query.offset(skip).limit(limit).all()
    return schedules

@router.get("/{schedule_id}", response_model=Schedule)
async def get_schedule(
    schedule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific schedule"""
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.user_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )
    
    return schedule

@router.put("/{schedule_id}", response_model=Schedule)
async def update_schedule(
    schedule_id: int,
    schedule_update: ScheduleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a schedule"""
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.user_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )
    
    # Update fields
    for field, value in schedule_update.dict(exclude_unset=True).items():
        setattr(schedule, field, value)
    
    # Recalculate next run if frequency changed
    if "frequency" in schedule_update.dict(exclude_unset=True):
        schedule.next_run = calculate_next_run(schedule.frequency, schedule.last_run)
    
    db.commit()
    db.refresh(schedule)
    return schedule

@router.delete("/{schedule_id}")
async def delete_schedule(
    schedule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a schedule"""
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.user_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )
    
    db.delete(schedule)
    db.commit()
    return {"message": "Schedule deleted successfully"}

@router.post("/{schedule_id}/run")
async def run_schedule_manually(
    schedule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually trigger a scheduled analysis"""
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.user_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )
    
    if not schedule.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Schedule is not active"
        )
    
    # Update last run time and calculate next run
    schedule.last_run = datetime.utcnow()
    schedule.next_run = calculate_next_run(schedule.frequency, schedule.last_run)
    db.commit()
    
    # TODO: Trigger actual analysis here
    # This would typically involve calling the analysis orchestrator
    
    return {
        "message": "Schedule triggered successfully",
        "next_run": schedule.next_run
    }

@router.get("/{schedule_id}/history")
async def get_schedule_history(
    schedule_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get execution history for a schedule"""
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.user_id == current_user.id
    ).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )
    
    # TODO: Implement schedule execution history
    # This would require a new table to track schedule executions
    
    return {
        "schedule_id": schedule_id,
        "history": [],
        "message": "Schedule history not yet implemented"
    }
