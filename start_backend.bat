@echo off
cd /d C:\Seichi\backend\regulatory_analyzer
set DATABASE_URL=postgresql://postgres:Shreyas%%402005@localhost:5432/regulatory_intelligence
set SECRET_KEY=your-secret-key-here-change-this-in-production
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
