"""
Configuration settings for the Regulatory Intelligence Platform
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/regulatory_intelligence")

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Google Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDgkpNwPCqWo2DoroIAwqd9JQPJXwLSMPY")

# Application Configuration
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Socket.io Configuration
SOCKET_IO_CORS_ALLOWED_ORIGINS = [FRONTEND_URL]

# Analysis Pipeline Configuration
MAX_CONCURRENT_ANALYSES = int(os.getenv("MAX_CONCURRENT_ANALYSES", "5"))
ANALYSIS_TIMEOUT_MINUTES = int(os.getenv("ANALYSIS_TIMEOUT_MINUTES", "60"))

# File Upload Configuration
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
ALLOWED_FILE_TYPES = ["pdf", "doc", "docx", "txt"]
