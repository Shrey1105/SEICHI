"""
Regulatory Intelligence Platform - Main FastAPI Application
"""

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import uvicorn
from contextlib import asynccontextmanager
import logging

from src.api import auth, reports, history, schedules, management, analysis, box
from src.database.session import engine
from src.database.models import Base
from src.core.pipeline.orchestrator import AnalysisOrchestrator
from src.socketio_server import socket_app, sio
from src.config import DEBUG, HOST, PORT
from src.monitoring import metrics_collector, setup_logging

# Configure logging
setup_logging("INFO" if not DEBUG else "DEBUG")
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Regulatory Intelligence Platform...")
    yield
    # Shutdown
    logger.info("Shutting down Regulatory Intelligence Platform...")

app = FastAPI(
    title="Regulatory Intelligence Platform",
    description="AI-powered regulatory change monitoring and analysis platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],  # Add production domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(schedules.router, prefix="/api/schedules", tags=["Schedules"])
app.include_router(management.router, prefix="/api/management", tags=["Management"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(box.router, prefix="/api", tags=["Box"])

@app.get("/")
async def root():
    return {"message": "Regulatory Intelligence Platform API"}

@app.get("/health")
async def health_check():
    return metrics_collector.get_health_status()

@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    from fastapi import Response
    return Response(
        content=metrics_collector.get_metrics(),
        media_type="text/plain"
    )

# Mount Socket.io app
app.mount("/socket.io", socket_app)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG
    )
