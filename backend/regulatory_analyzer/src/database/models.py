"""
Database Models for Regulatory Intelligence Platform
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    company_profiles = relationship("CompanyProfile", back_populates="user")
    reports = relationship("Report", back_populates="user")

class CompanyProfile(Base):
    __tablename__ = "company_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String(255), nullable=False)
    industry = Column(String(100))
    jurisdiction = Column(String(100))
    company_size = Column(String(50))  # small, medium, large
    description = Column(Text)
    keywords = Column(JSON)  # List of relevant keywords
    trusted_sources = Column(JSON)  # List of trusted source URLs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="company_profiles")
    reports = relationship("Report", back_populates="company_profile")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_profile_id = Column(Integer, ForeignKey("company_profiles.id"), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="pending")  # pending, in_progress, completed, failed
    analysis_type = Column(String(100))  # comprehensive, targeted, monitoring
    scope = Column(Text)  # Description of analysis scope
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="reports")
    company_profile = relationship("CompanyProfile", back_populates="reports")
    regulatory_changes = relationship("RegulatoryChange", back_populates="report")

class RegulatoryChange(Base):
    __tablename__ = "regulatory_changes"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    source_url = Column(String(500), nullable=False)
    title = Column(String(500), nullable=False)
    summary = Column(Text)
    impact_assessment = Column(Text)
    compliance_requirements = Column(Text)
    implementation_timeline = Column(Text)
    risk_level = Column(String(20))  # low, medium, high, critical
    confidence_score = Column(Float)  # 0.0 to 1.0
    relevant_sections = Column(JSON)  # List of relevant regulatory sections
    affected_areas = Column(JSON)  # List of affected business areas
    action_items = Column(JSON)  # List of recommended actions
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    report = relationship("Report", back_populates="regulatory_changes")

class TrustedSource(Base):
    __tablename__ = "trusted_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    source_type = Column(String(100))  # government, regulatory_body, news, industry
    jurisdiction = Column(String(100))
    reliability_score = Column(Float, default=0.8)  # 0.0 to 1.0
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Schedule(Base):
    __tablename__ = "schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_profile_id = Column(Integer, ForeignKey("company_profiles.id"), nullable=False)
    name = Column(String(255), nullable=False)
    frequency = Column(String(50))  # daily, weekly, monthly, quarterly
    analysis_type = Column(String(100))
    is_active = Column(Boolean, default=True)
    last_run = Column(DateTime(timezone=True))
    next_run = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    company_profile = relationship("CompanyProfile")
