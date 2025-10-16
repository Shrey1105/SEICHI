"""
Simple FastAPI server for testing the frontend integration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime
import asyncio

app = FastAPI(title="Regulatory Intelligence Platform - Simple Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data storage
mock_reports = []
mock_analyses = {}

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

class ReportResponse(BaseModel):
    id: int
    title: str
    analysis_type: str
    scope: str
    status: str
    created_at: str
    completed_at: Optional[str] = None
    user_id: int
    company_profile_id: int

@app.get("/")
async def root():
    return {"message": "Regulatory Intelligence Platform API - Simple Backend"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "active_analyses": len(mock_analyses)
    }

@app.post("/api/analysis/create", response_model=AnalysisResponse)
async def create_analysis(request: AnalysisCreateRequest):
    """Create a new regulatory analysis"""
    try:
        # Create a new report
        report_id = len(mock_reports) + 1
        report = ReportResponse(
            id=report_id,
            title=request.title,
            analysis_type="comprehensive",
            scope=f"Analysis for {request.categories} from {request.start_date} to {request.end_date}",
            status="in_progress",
            created_at=datetime.utcnow().isoformat(),
            user_id=1,
            company_profile_id=1
        )
        
        mock_reports.append(report)
        
        # Start mock analysis process
        mock_analyses[report_id] = {
            "status": "in_progress",
            "progress": 0,
            "current_stage": "Initializing",
            "message": "Starting analysis..."
        }
        
        # Simulate analysis in background
        asyncio.create_task(simulate_analysis(report_id))
        
        return AnalysisResponse(
            report_id=report_id,
            status="started",
            message="Analysis started successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def simulate_analysis(report_id: int):
    """Simulate analysis process"""
    stages = [
        ("Query Generation", 20),
        ("Data Acquisition", 40),
        ("Content Filtering", 60),
        ("AI Analysis", 80),
        ("Report Generation", 100)
    ]
    
    for stage_name, progress in stages:
        await asyncio.sleep(3)  # Simulate processing time
        mock_analyses[report_id].update({
            "current_stage": stage_name,
            "progress": progress,
            "message": f"Processing {stage_name.lower()}..."
        })
    
    # Mark as completed
    mock_analyses[report_id].update({
        "status": "completed",
        "progress": 100,
        "current_stage": "Completed",
        "message": "Analysis completed successfully!"
    })
    
    # Update report status
    for report in mock_reports:
        if report.id == report_id:
            report.status = "completed"
            report.completed_at = datetime.utcnow().isoformat()
            break

@app.get("/api/analysis/progress/{report_id}")
async def get_analysis_progress(report_id: int):
    """Get analysis progress for a specific report"""
    if report_id not in mock_analyses:
        return {
            "report_id": report_id,
            "status": "not_found",
            "progress": 0,
            "current_stage": "Unknown",
            "message": "Analysis not found"
        }
    
    return {
        "report_id": report_id,
        **mock_analyses[report_id]
    }

@app.get("/api/analysis/reports", response_model=List[ReportResponse])
async def get_reports():
    """Get all reports"""
    return mock_reports

@app.get("/api/analysis/reports/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int):
    """Get a specific report by ID"""
    for report in mock_reports:
        if report.id == report_id:
            return report
    raise HTTPException(status_code=404, detail="Report not found")

@app.delete("/api/analysis/reports/{report_id}")
async def delete_report(report_id: int):
    """Delete a report"""
    global mock_reports
    mock_reports = [r for r in mock_reports if r.id != report_id]
    if report_id in mock_analyses:
        del mock_analyses[report_id]
    return {"message": "Report deleted successfully"}

@app.get("/api/analysis/active")
async def get_active_analyses():
    """Get all active analyses"""
    return {
        "active_analyses": len(mock_analyses),
        "analyses": list(mock_analyses.keys())
    }

if __name__ == "__main__":
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
