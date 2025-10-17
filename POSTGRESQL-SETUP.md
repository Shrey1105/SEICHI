# 🐘 PostgreSQL Server Setup Guide (Command Shell)

This guide will help you set up PostgreSQL server and create the database using command shell (PowerShell/CMD).

## 🔍 Step 1: Check if PostgreSQL is Installed

### Check PostgreSQL Installation
```powershell
# Check if PostgreSQL is installed
Get-Service -Name "*postgres*"

# Or check for PostgreSQL processes
Get-Process -Name "*postgres*" -ErrorAction SilentlyContinue

# Check if psql command is available
psql --version
```

### If PostgreSQL is NOT installed:
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. **Remember the password you set for 'postgres' user**

## 🚀 Step 2: Start PostgreSQL Service

### Start PostgreSQL Service
```powershell
# Start PostgreSQL service
Start-Service postgresql-x64-15

# Or if you have a different version
Start-Service postgresql-x64-14
Start-Service postgresql-x64-13

# Check if service is running
Get-Service postgresql-x64-15
```

### Alternative: Start via Services Manager
```powershell
# Open Services Manager
services.msc

# Find "postgresql" service and start it
```

## 🔧 Step 3: Add PostgreSQL to PATH (if needed)

### Find PostgreSQL Installation Path
```powershell
# Search for PostgreSQL installation
Get-ChildItem -Path "C:\Program Files" -Name "*PostgreSQL*" -Directory
Get-ChildItem -Path "C:\Program Files (x86)" -Name "*PostgreSQL*" -Directory

# Common paths:
# C:\Program Files\PostgreSQL\15\bin\
# C:\Program Files\PostgreSQL\14\bin\
# C:\Program Files\PostgreSQL\13\bin\
```

### Add to PATH (Temporary)
```powershell
# Add PostgreSQL bin directory to PATH for current session
$env:PATH += ";C:\Program Files\PostgreSQL\15\bin"

# Verify psql is now available
psql --version
```

### Add to PATH (Permanent)
```powershell
# Add to system PATH permanently
[Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\Program Files\PostgreSQL\15\bin", "Machine")

# Restart PowerShell for changes to take effect
```

## 🗄️ Step 4: Create Database and User

### Connect to PostgreSQL as postgres user
```powershell
# Connect to PostgreSQL (replace 'password' with your actual password)
psql -U postgres -h localhost -p 5432

# You'll be prompted for password
# Enter the password you set during PostgreSQL installation
```

### Create Database and User (in psql shell)
```sql
-- Create the database
CREATE DATABASE regulatory_intelligence;

-- Create a user (optional - you can use postgres user)
CREATE USER regulatory_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE regulatory_intelligence TO regulatory_user;

-- Connect to the new database
\c regulatory_intelligence

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO regulatory_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO regulatory_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO regulatory_user;

-- Exit psql
\q
```

## 🚀 Step 5: Run Database Setup Script

### Option 1: Using Python Script (Recommended)
```powershell
# Navigate to backend directory
cd backend\regulatory_analyzer

# Install Python dependencies
pip install -r requirements.txt

# Run the setup script
python setup_database.py
```

### Option 2: Using SQL Script
```powershell
# Run the SQL script directly
psql -U postgres -h localhost -p 5432 -d regulatory_intelligence -f database_setup.sql

# Or if you created a custom user
psql -U regulatory_user -h localhost -p 5432 -d regulatory_intelligence -f database_setup.sql
```

## 🔍 Step 6: Verify Database Setup

### Check Database Connection
```powershell
# Connect to the database
psql -U postgres -h localhost -p 5432 -d regulatory_intelligence

# Check if tables were created
\dt

# Check if admin user was created
SELECT username, email, is_active FROM users WHERE username = 'admin';

# Exit
\q
```

### Test with Python
```powershell
# Test database connection
python -c "from src.database.session import engine; print('✅ Database connected!' if engine else '❌ Connection failed')"
```

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. "psql: command not found"
```powershell
# Solution: Add PostgreSQL to PATH
$env:PATH += ";C:\Program Files\PostgreSQL\15\bin"
```

#### 2. "password authentication failed"
```powershell
# Check if you're using the correct username
# Default PostgreSQL user is 'postgres', not your Windows username

# Connect with correct user
psql -U postgres -h localhost -p 5432
```

#### 3. "connection refused"
```powershell
# Check if PostgreSQL service is running
Get-Service postgresql-x64-15

# Start the service if it's stopped
Start-Service postgresql-x64-15
```

#### 4. "database does not exist"
```powershell
# Create the database first
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE regulatory_intelligence;"
```

#### 5. "permission denied"
```powershell
# Make sure you're using the postgres user or a user with proper privileges
psql -U postgres -h localhost -p 5432 -d regulatory_intelligence
```

## 📋 Complete Setup Commands (Copy-Paste Ready)

### For Fresh Installation:
```powershell
# 1. Start PostgreSQL service
Start-Service postgresql-x64-15

# 2. Add to PATH (adjust version number)
$env:PATH += ";C:\Program Files\PostgreSQL\15\bin"

# 3. Create database
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE regulatory_intelligence;"

# 4. Navigate to backend
cd backend\regulatory_analyzer

# 5. Install dependencies
pip install -r requirements.txt

# 6. Run setup script
python setup_database.py

# 7. Verify setup
psql -U postgres -h localhost -p 5432 -d regulatory_intelligence -c "SELECT username FROM users WHERE username = 'admin';"
```

## 🎯 Quick Test Commands

### Test PostgreSQL Connection:
```powershell
psql -U postgres -h localhost -p 5432 -c "SELECT version();"
```

### Test Database Exists:
```powershell
psql -U postgres -h localhost -p 5432 -c "\l" | findstr regulatory_intelligence
```

### Test Tables Created:
```powershell
psql -U postgres -h localhost -p 5432 -d regulatory_intelligence -c "\dt"
```

## 🚀 Start Your Application

### Backend:
```powershell
cd backend\regulatory_analyzer
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend:
```powershell
cd frontend
npm start
```

## 🎉 Success!

If everything is set up correctly, you should see:
- ✅ PostgreSQL service running
- ✅ Database `regulatory_intelligence` created
- ✅ All tables created
- ✅ Admin user created
- ✅ Backend API running on port 8000
- ✅ Frontend running on port 3000

**Default Login:**
- Username: `admin`
- Password: `admin123`
