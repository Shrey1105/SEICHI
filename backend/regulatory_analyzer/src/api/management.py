"""
Management API endpoints for company profiles and trusted sources
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database.session import get_db
from ..database.models import User, CompanyProfile, TrustedSource, Report
from ..schemas import (
    CompanyProfileCreate, CompanyProfile, CompanyProfileUpdate,
    TrustedSourceCreate, TrustedSource, TrustedSourceUpdate
)
from ..api.auth import get_current_user

router = APIRouter()

# Company Profile Management
@router.post("/company-profiles", response_model=CompanyProfile)
async def create_company_profile(
    profile: CompanyProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new company profile"""
    db_profile = CompanyProfile(
        company_name=profile.company_name,
        industry=profile.industry,
        jurisdiction=profile.jurisdiction,
        company_size=profile.company_size,
        description=profile.description,
        keywords=profile.keywords or [],
        trusted_sources=profile.trusted_sources or [],
        user_id=current_user.id
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.get("/company-profiles", response_model=List[CompanyProfile])
async def get_company_profiles(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all company profiles for current user"""
    profiles = db.query(CompanyProfile).filter(
        CompanyProfile.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return profiles

@router.get("/company-profiles/{profile_id}", response_model=CompanyProfile)
async def get_company_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific company profile"""
    profile = db.query(CompanyProfile).filter(
        CompanyProfile.id == profile_id,
        CompanyProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile not found"
        )
    
    return profile

@router.put("/company-profiles/{profile_id}", response_model=CompanyProfile)
async def update_company_profile(
    profile_id: int,
    profile_update: CompanyProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a company profile"""
    profile = db.query(CompanyProfile).filter(
        CompanyProfile.id == profile_id,
        CompanyProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile not found"
        )
    
    for field, value in profile_update.dict(exclude_unset=True).items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/company-profiles/{profile_id}")
async def delete_company_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a company profile"""
    profile = db.query(CompanyProfile).filter(
        CompanyProfile.id == profile_id,
        CompanyProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile not found"
        )
    
    db.delete(profile)
    db.commit()
    return {"message": "Company profile deleted successfully"}

# Trusted Source Management
@router.post("/trusted-sources", response_model=TrustedSource)
async def create_trusted_source(
    source: TrustedSourceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new trusted source"""
    db_source = TrustedSource(
        name=source.name,
        url=source.url,
        source_type=source.source_type,
        jurisdiction=source.jurisdiction,
        reliability_score=source.reliability_score
    )
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

@router.get("/trusted-sources", response_model=List[TrustedSource])
async def get_trusted_sources(
    skip: int = 0,
    limit: int = 100,
    source_type: Optional[str] = None,
    jurisdiction: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get all trusted sources"""
    query = db.query(TrustedSource)
    
    if source_type:
        query = query.filter(TrustedSource.source_type == source_type)
    
    if jurisdiction:
        query = query.filter(TrustedSource.jurisdiction == jurisdiction)
    
    if is_active is not None:
        query = query.filter(TrustedSource.is_active == is_active)
    
    sources = query.offset(skip).limit(limit).all()
    return sources

@router.get("/trusted-sources/{source_id}", response_model=TrustedSource)
async def get_trusted_source(
    source_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific trusted source"""
    source = db.query(TrustedSource).filter(
        TrustedSource.id == source_id
    ).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trusted source not found"
        )
    
    return source

@router.put("/trusted-sources/{source_id}", response_model=TrustedSource)
async def update_trusted_source(
    source_id: int,
    source_update: TrustedSourceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a trusted source"""
    source = db.query(TrustedSource).filter(
        TrustedSource.id == source_id
    ).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trusted source not found"
        )
    
    for field, value in source_update.dict(exclude_unset=True).items():
        setattr(source, field, value)
    
    db.commit()
    db.refresh(source)
    return source

@router.delete("/trusted-sources/{source_id}")
async def delete_trusted_source(
    source_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a trusted source"""
    source = db.query(TrustedSource).filter(
        TrustedSource.id == source_id
    ).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trusted source not found"
        )
    
    db.delete(source)
    db.commit()
    return {"message": "Trusted source deleted successfully"}

# System Management
@router.get("/system/status")
async def get_system_status(
    current_user: User = Depends(get_current_user)
):
    """Get system status and health information"""
    # Only allow superusers to access system status
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": "connected",
        "ai_service": "available",
        "timestamp": "2024-01-01T00:00:00Z"
    }

@router.get("/system/stats")
async def get_system_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get system-wide statistics"""
    # Only allow superusers to access system statistics
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get counts
    total_users = db.query(User).count()
    total_company_profiles = db.query(CompanyProfile).count()
    total_reports = db.query(Report).count()
    total_trusted_sources = db.query(TrustedSource).count()
    
    return {
        "total_users": total_users,
        "total_company_profiles": total_company_profiles,
        "total_reports": total_reports,
        "total_trusted_sources": total_trusted_sources
    }
