"""
Pydantic Schemas for API Validation and Serialization
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Company Profile Schemas
class CompanyProfileBase(BaseModel):
    company_name: str
    industry: Optional[str] = None
    jurisdiction: Optional[str] = None
    company_size: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[List[str]] = None
    trusted_sources: Optional[List[str]] = None

class CompanyProfileCreate(CompanyProfileBase):
    pass

class CompanyProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    jurisdiction: Optional[str] = None
    company_size: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[List[str]] = None
    trusted_sources: Optional[List[str]] = None

class CompanyProfile(CompanyProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Report Schemas
class ReportBase(BaseModel):
    title: str
    analysis_type: str
    scope: Optional[str] = None

class ReportCreate(ReportBase):
    company_profile_id: int

class ReportUpdate(BaseModel):
    title: Optional[str] = None
    analysis_type: Optional[str] = None
    scope: Optional[str] = None
    status: Optional[str] = None

class Report(ReportBase):
    id: int
    user_id: int
    company_profile_id: int
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ReportResponse(Report):
    """Extended report response with additional fields"""
    regulatory_changes_count: Optional[int] = 0
    progress_percentage: Optional[int] = 0
    current_stage: Optional[str] = None

# Regulatory Change Schemas
class RegulatoryChangeBase(BaseModel):
    source_url: str
    title: str
    summary: Optional[str] = None
    impact_assessment: Optional[str] = None
    compliance_requirements: Optional[str] = None
    implementation_timeline: Optional[str] = None
    risk_level: Optional[str] = None
    confidence_score: Optional[float] = None
    relevant_sections: Optional[List[str]] = None
    affected_areas: Optional[List[str]] = None
    action_items: Optional[List[str]] = None

class RegulatoryChangeCreate(RegulatoryChangeBase):
    report_id: int

class RegulatoryChange(RegulatoryChangeBase):
    id: int
    report_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Trusted Source Schemas
class TrustedSourceBase(BaseModel):
    name: str
    url: str
    source_type: Optional[str] = None
    jurisdiction: Optional[str] = None
    reliability_score: Optional[float] = 0.8

class TrustedSourceCreate(TrustedSourceBase):
    pass

class TrustedSourceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    source_type: Optional[str] = None
    jurisdiction: Optional[str] = None
    reliability_score: Optional[float] = None
    is_active: Optional[bool] = None

class TrustedSource(TrustedSourceBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schedule Schemas
class ScheduleBase(BaseModel):
    name: str
    frequency: str
    analysis_type: str

class ScheduleCreate(ScheduleBase):
    company_profile_id: int

class ScheduleUpdate(BaseModel):
    name: Optional[str] = None
    frequency: Optional[str] = None
    analysis_type: Optional[str] = None
    is_active: Optional[bool] = None

class Schedule(ScheduleBase):
    id: int
    user_id: int
    company_profile_id: int
    is_active: bool
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Analysis Request Schema
class AnalysisRequest(BaseModel):
    company_profile_id: int
    analysis_type: str = "comprehensive"
    scope: Optional[str] = None
    keywords: Optional[List[str]] = None

# API Response Schemas
class AnalysisProgress(BaseModel):
    report_id: int
    status: str
    progress_percentage: int
    current_stage: str
    message: str

class AnalysisResult(BaseModel):
    report_id: int
    status: str
    regulatory_changes: List[RegulatoryChange]
    summary: Dict[str, Any]

# Box API Schemas
class BoxDocumentBase(BaseModel):
    filename: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    description: Optional[str] = None
    document_category: Optional[str] = "regulatory_document"
    is_public: Optional[bool] = False

class BoxDocumentCreate(BoxDocumentBase):
    box_file_id: str
    box_folder_id: Optional[str] = None
    report_id: Optional[int] = None
    shared_link: Optional[str] = None
    download_url: Optional[str] = None

class BoxDocumentUpdate(BaseModel):
    description: Optional[str] = None
    document_category: Optional[str] = None
    is_public: Optional[bool] = None

class BoxDocumentResponse(BoxDocumentBase):
    id: int
    box_file_id: str
    box_folder_id: Optional[str] = None
    report_id: Optional[int] = None
    shared_link: Optional[str] = None
    download_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class BoxFolderBase(BaseModel):
    folder_name: str
    folder_type: Optional[str] = "regulatory_documents"
    description: Optional[str] = None

class BoxFolderCreate(BoxFolderBase):
    box_folder_id: str
    parent_folder_id: Optional[str] = None
    company_profile_id: Optional[int] = None

class BoxFolderUpdate(BaseModel):
    folder_name: Optional[str] = None
    folder_type: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class BoxFolderResponse(BoxFolderBase):
    id: int
    box_folder_id: str
    parent_folder_id: Optional[str] = None
    company_profile_id: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class BoxUploadResponse(BaseModel):
    id: int
    box_file_id: str
    filename: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    shared_link: Optional[str] = None
    download_url: Optional[str] = None
    document_category: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
