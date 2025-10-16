#!/bin/bash

# Production Setup Script for Regulatory Intelligence Platform

set -e

echo "🚀 Setting up Regulatory Intelligence Platform for Production"

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs/nginx
mkdir -p nginx/ssl
mkdir -p backup

# Generate SSL certificates (self-signed for development)
echo "🔐 Generating SSL certificates..."
if [ ! -f "nginx/ssl/cert.pem" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    echo "✅ SSL certificates generated"
else
    echo "✅ SSL certificates already exist"
fi

# Create production environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating production environment file..."
    cat > .env << EOF
# Production Environment Configuration
POSTGRES_USER=regulatory_user
POSTGRES_PASSWORD=$(openssl rand -base64 32)
SECRET_KEY=$(openssl rand -base64 32)
GEMINI_API_KEY=your-gemini-api-key-here
DEBUG=False
FRONTEND_URL=https://your-domain.com
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_SOCKET_URL=https://your-domain.com
DOMAIN=your-domain.com
EMAIL=your-email@domain.com
EOF
    echo "✅ Environment file created. Please update with your actual values."
    echo "⚠️  IMPORTANT: Update the .env file with your actual API keys and domain!"
else
    echo "✅ Environment file already exists"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Test API health
echo "🔍 Testing API health..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API health check failed"
fi

# Test frontend
echo "🔍 Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend health check failed"
fi

echo ""
echo "🎉 Production setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your actual API keys and domain"
echo "2. Configure your domain DNS to point to this server"
echo "3. Set up Let's Encrypt SSL certificates:"
echo "   docker-compose -f docker-compose.prod.yml exec nginx certbot --nginx -d your-domain.com"
echo "4. Access your application at:"
echo "   - Frontend: https://your-domain.com"
echo "   - API: https://your-domain.com/api"
echo "   - API Docs: https://your-domain.com/docs"
echo ""
echo "📊 Monitor your application:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🔄 Update your application:"
echo "   docker-compose -f docker-compose.prod.yml pull"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
