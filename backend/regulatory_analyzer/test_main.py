"""
Minimal FastAPI Application for testing
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import uvicorn
import logging
from pydantic import BaseModel
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class User(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool = True

# Mock user data
MOCK_USERS = {
    "admin@supervity.ai": {
        "id": 1,
        "username": "admin",
        "email": "admin@supervity.ai",
        "password": "admin123",  # In real app, this would be hashed
        "is_active": True
    }
}

# Mock reports storage
MOCK_REPORTS = []

security = HTTPBearer()

app = FastAPI(
    title="Regulatory Intelligence Platform",
    description="AI-powered regulatory change monitoring and analysis platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Regulatory Intelligence Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

# Authentication endpoints
@app.post("/api/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """Mock login endpoint"""
    user_email = login_data.username
    password = login_data.password
    
    if user_email in MOCK_USERS and MOCK_USERS[user_email]["password"] == password:
        user = MOCK_USERS[user_email]
        # Generate a simple mock token
        access_token = f"mock_token_{user['id']}_{user['username']}"
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "is_active": user["is_active"]
            }
        )
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/auth/me")
async def get_current_user(token: str = Depends(security)):
    """Get current user info"""
    # Simple token validation for mock
    if token.credentials.startswith("mock_token_"):
        parts = token.credentials.split("_")
        if len(parts) >= 3:
            user_id = int(parts[2])
            # Find user by ID
            for user in MOCK_USERS.values():
                if user["id"] == user_id:
                    return {
                        "id": user["id"],
                        "username": user["username"],
                        "email": user["email"],
                        "is_active": user["is_active"]
                    }
    
    raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/api/auth/logout")
async def logout():
    """Mock logout endpoint"""
    return {"message": "Successfully logged out"}

# Analysis endpoints
class AnalysisRequest(BaseModel):
    title: str
    categories: str
    target_product_path: Optional[str] = None
    start_date: str
    end_date: str
    notification_emails: list = []
    trusted_websites: list = []
    languages: list = ["English"]
    target_country: str = "United States"
    guardrails: Optional[str] = None

@app.post("/api/analysis/create")
async def create_analysis(analysis: AnalysisRequest, token: str = Depends(security)):
    """Mock create analysis endpoint"""
    # Simple token validation
    if not token.credentials.startswith("mock_token_"):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Mock report ID
    import random
    from datetime import datetime
    report_id = random.randint(1000, 9999)
    
    # Create a report object
    report = {
        "id": report_id,
        "title": analysis.title,
        "status": "pending",
        "categories": analysis.categories,
        "start_date": analysis.start_date,
        "end_date": analysis.end_date,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "user_id": 1,
        "analysis_results": None,
        "notification_emails": analysis.notification_emails,
        "trusted_websites": analysis.trusted_websites,
        "languages": analysis.languages,
        "target_country": analysis.target_country,
        "guardrails": analysis.guardrails
    }
    
    # Add to mock storage
    MOCK_REPORTS.append(report)
    
    return {
        "report_id": report_id,
        "status": "pending",
        "message": "Analysis started successfully",
        "title": analysis.title,
        "categories": analysis.categories,
        "start_date": analysis.start_date,
        "end_date": analysis.end_date
    }

# Reports endpoints
@app.get("/api/reports")
async def get_reports(token: str = Depends(security)):
    """Mock get reports endpoint"""
    if not token.credentials.startswith("mock_token_"):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Return all reports sorted by created_at (newest first)
    sorted_reports = sorted(MOCK_REPORTS, key=lambda x: x['created_at'], reverse=True)
    return sorted_reports

@app.get("/api/reports/{report_id}")
async def get_report(report_id: int, token: str = Depends(security)):
    """Mock get single report endpoint"""
    if not token.credentials.startswith("mock_token_"):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Find report by ID
    for report in MOCK_REPORTS:
        if report['id'] == report_id:
            return report
    
    raise HTTPException(status_code=404, detail="Report not found")

@app.put("/api/reports/{report_id}/status")
async def update_report_status(report_id: int, status: str, token: str = Depends(security)):
    """Mock update report status endpoint"""
    if not token.credentials.startswith("mock_token_"):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    from datetime import datetime
    # Find and update report
    for report in MOCK_REPORTS:
        if report['id'] == report_id:
            report['status'] = status
            report['updated_at'] = datetime.now().isoformat()
            return {"message": "Status updated successfully", "report": report}
    
    raise HTTPException(status_code=404, detail="Report not found")

# Management endpoints  
@app.get("/api/management/company-profiles")
async def get_company_profiles(token: str = Depends(security)):
    """Mock get company profiles endpoint"""
    if not token.credentials.startswith("mock_token_"):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return []

if __name__ == "__main__":
    uvicorn.run(
        "test_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
