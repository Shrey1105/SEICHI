@echo off
REM Production Setup Script for Regulatory Intelligence Platform (Windows)

echo 🚀 Setting up Regulatory Intelligence Platform for Production

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "logs\nginx" mkdir logs\nginx
if not exist "nginx\ssl" mkdir nginx\ssl
if not exist "backup" mkdir backup

REM Generate SSL certificates (self-signed for development)
echo 🔐 Generating SSL certificates...
if not exist "nginx\ssl\cert.pem" (
    echo Generating self-signed SSL certificate...
    echo You may need to install OpenSSL or use a different method for production
    echo For now, using placeholder certificates
    echo. > nginx\ssl\cert.pem
    echo. > nginx\ssl\key.pem
    echo ✅ SSL certificate placeholders created
) else (
    echo ✅ SSL certificates already exist
)

REM Create production environment file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating production environment file...
    (
        echo # Production Environment Configuration
        echo POSTGRES_USER=regulatory_user
        echo POSTGRES_PASSWORD=secure-password-change-me
        echo SECRET_KEY=your-secret-key-change-me-minimum-32-characters
        echo GEMINI_API_KEY=your-gemini-api-key-here
        echo DEBUG=False
        echo FRONTEND_URL=https://your-domain.com
        echo REACT_APP_API_URL=https://your-domain.com/api
        echo REACT_APP_SOCKET_URL=https://your-domain.com
        echo DOMAIN=your-domain.com
        echo EMAIL=your-email@domain.com
    ) > .env
    echo ✅ Environment file created. Please update with your actual values.
    echo ⚠️  IMPORTANT: Update the .env file with your actual API keys and domain!
) else (
    echo ✅ Environment file already exists
)

REM Build and start services
echo 🔨 Building and starting services...
docker-compose -f docker-compose.prod.yml build

echo 🚀 Starting production services...
docker-compose -f docker-compose.prod.yml up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check service health
echo 🏥 Checking service health...
docker-compose -f docker-compose.prod.yml ps

REM Test API health
echo 🔍 Testing API health...
curl -f http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API is healthy
) else (
    echo ❌ Backend API health check failed
)

REM Test frontend
echo 🔍 Testing frontend...
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is accessible
) else (
    echo ❌ Frontend health check failed
)

echo.
echo 🎉 Production setup complete!
echo.
echo 📋 Next steps:
echo 1. Update .env file with your actual API keys and domain
echo 2. Configure your domain DNS to point to this server
echo 3. Set up SSL certificates for production
echo 4. Access your application at:
echo    - Frontend: http://localhost:3000
echo    - API: http://localhost:8000/api
echo    - API Docs: http://localhost:8000/docs
echo.
echo 📊 Monitor your application:
echo    docker-compose -f docker-compose.prod.yml logs -f
echo.
echo 🔄 Update your application:
echo    docker-compose -f docker-compose.prod.yml pull
echo    docker-compose -f docker-compose.prod.yml up -d
echo.
pause
