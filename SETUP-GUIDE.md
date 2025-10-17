# 🚀 Regulatory Intelligence Platform - Setup Guide

This guide will help you set up the complete Regulatory Intelligence platform with PostgreSQL database, backend API, and frontend application.

## 📋 Prerequisites

- **Python 3.8+** installed
- **Node.js 16+** and **npm** installed
- **PostgreSQL 12+** installed and running
- **Git** installed

## 🗄️ Database Setup

### Option 1: Using the Python Setup Script (Recommended)

1. **Navigate to the backend directory:**
   ```bash
   cd backend/regulatory_analyzer
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create your environment file:**
   ```bash
   copy env.example .env
   ```

4. **Edit the `.env` file with your PostgreSQL credentials:**
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/regulatory_intelligence
   ```

5. **Run the database setup script:**
   ```bash
   python setup_database.py
   ```

### Option 2: Using pgAdmin4

1. **Open pgAdmin4**
2. **Connect to your PostgreSQL server** (usually localhost:5432)
3. **Create a new database:**
   - Right-click on "Databases" → "Create" → "Database..."
   - Name: `regulatory_intelligence`
   - Click "Save"

4. **Run the SQL script:**
   - Right-click on the `regulatory_intelligence` database
   - Select "Query Tool"
   - Copy and paste the contents of `database_setup.sql`
   - Click "Execute" (F5)

## 🔧 Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend/regulatory_analyzer
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server:**
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Verify the backend is running:**
   - Open http://localhost:8000/docs in your browser
   - You should see the FastAPI documentation

## 🎨 Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm start
   ```

4. **Verify the frontend is running:**
   - Open http://localhost:3000 in your browser
   - You should see the Regulatory Intelligence dashboard

## 🔐 Default Login Credentials

After setup, you can login with these default credentials:

- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@example.com`

## 🧪 Testing the Setup

### 1. Test Database Connection
```bash
# In the backend directory
python -c "from src.database.session import engine; print('Database connected successfully!' if engine else 'Connection failed')"
```

### 2. Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test authentication
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 3. Test Frontend
- Open http://localhost:3000
- Try logging in with admin credentials
- Create a new analysis
- Check the dashboard for reports

## 🐛 Troubleshooting

### Database Connection Issues

**Error: "password authentication failed"**
- Check your PostgreSQL password in the `.env` file
- Make sure PostgreSQL is running
- Verify the `postgres` user exists

**Error: "database does not exist"**
- Run the database setup script
- Or manually create the database in pgAdmin4

**Error: "connection refused"**
- Make sure PostgreSQL is running
- Check if the port 5432 is correct
- Verify firewall settings

### Backend Issues

**Error: "Module not found"**
- Make sure you're in the correct directory
- Install all requirements: `pip install -r requirements.txt`

**Error: "Port already in use"**
- Change the port in the uvicorn command
- Or kill the process using port 8000

### Frontend Issues

**Error: "Cannot resolve module"**
- Run `npm install` to install dependencies
- Clear npm cache: `npm cache clean --force`

**Error: "Network Error"**
- Make sure the backend is running on port 8000
- Check if the API URL is correct in the frontend config

## 📁 Project Structure

```
regulatory_intelligence/
├── backend/
│   └── regulatory_analyzer/
│       ├── src/
│       │   ├── api/           # API endpoints
│       │   ├── core/          # Core business logic
│       │   ├── database/      # Database models and session
│       │   └── config.py      # Configuration
│       ├── main.py           # FastAPI application
│       ├── setup_database.py # Database setup script
│       └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store
│   │   └── utils/           # Utility functions
│   └── package.json         # Node.js dependencies
├── database_setup.sql       # SQL setup script
└── SETUP-GUIDE.md          # This file
```

## 🚀 Next Steps

1. **Customize the application:**
   - Update company profiles
   - Add trusted sources
   - Configure analysis types

2. **Set up AI integration:**
   - Get a Gemini API key
   - Update the `GEMINI_API_KEY` in your `.env` file

3. **Configure Box API:**
   - Set up Box developer account
   - Update Box credentials in `.env`

4. **Deploy to production:**
   - Set up production database
   - Configure environment variables
   - Set up reverse proxy (nginx)
   - Enable HTTPS

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check the console logs for error messages
4. Ensure all services are running on the correct ports

## 🎉 Success!

Once everything is set up, you should have:
- ✅ PostgreSQL database with all tables
- ✅ Backend API running on port 8000
- ✅ Frontend application running on port 3000
- ✅ Default admin user created
- ✅ Sample data loaded

You can now start using the Regulatory Intelligence platform!