# Deployment Guide

This guide covers various deployment options for the Regulatory Intelligence Platform.

## Prerequisites

- Docker and Docker Compose
- PostgreSQL 12+ (if not using Docker)
- Python 3.8+ (for backend)
- Node.js 16+ (for frontend)
- SSL certificates (for production)

## Quick Start with Docker Compose

The easiest way to deploy the platform is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd regulatory-intelligence-platform

# Copy and configure environment variables
cp backend/regulatory_analyzer/env.example backend/regulatory_analyzer/.env
# Edit the .env file with your configuration

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

The platform will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Production Deployment

### 1. Environment Configuration

Create production environment files:

**Backend (.env)**
```env
DATABASE_URL=postgresql://username:password@your-db-host:5432/regulatory_intelligence
SECRET_KEY=your-very-secure-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=your-gemini-api-key
DEBUG=False
HOST=0.0.0.0
PORT=8000
```

**Frontend (.env.production)**
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_SOCKET_URL=https://your-api-domain.com
```

### 2. Database Setup

#### Using PostgreSQL with Docker
```bash
# Create a dedicated PostgreSQL container
docker run -d \
  --name regulatory-db \
  -e POSTGRES_DB=regulatory_intelligence \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=secure-password \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15
```

#### Using External PostgreSQL
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE regulatory_intelligence;
CREATE USER regulatory_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE regulatory_intelligence TO regulatory_user;
\q
```

### 3. Backend Deployment

#### Using Docker
```bash
# Build production image
cd backend/regulatory_analyzer
docker build -t regulatory-backend .

# Run container
docker run -d \
  --name regulatory-backend \
  --env-file .env \
  -p 8000:8000 \
  regulatory-backend
```

#### Using Gunicorn (Recommended for Production)
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn main:app \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --access-logfile - \
  --error-logfile -
```

### 4. Frontend Deployment

#### Using Docker
```bash
# Build production image
cd frontend
docker build -t regulatory-frontend .

# Run container
docker run -d \
  --name regulatory-frontend \
  -p 3000:80 \
  regulatory-frontend
```

#### Using Nginx
```bash
# Build the application
npm run build

# Copy build files to nginx directory
sudo cp -r build/* /var/www/html/

# Configure nginx (see nginx.conf example)
sudo cp nginx.conf /etc/nginx/sites-available/regulatory-platform
sudo ln -s /etc/nginx/sites-available/regulatory-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL/HTTPS Setup

#### Using Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Using Cloudflare
1. Add your domain to Cloudflare
2. Update DNS records to point to your server
3. Enable SSL/TLS encryption mode: "Full (strict)"

### 6. Reverse Proxy Configuration

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:8000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Cloud Deployment

### AWS Deployment

#### Using AWS ECS
1. Create ECS cluster
2. Create task definitions for backend and frontend
3. Create services and load balancers
4. Configure RDS for PostgreSQL

#### Using AWS EC2
1. Launch EC2 instance
2. Install Docker and Docker Compose
3. Follow the Docker Compose deployment steps
4. Configure security groups and load balancer

### Google Cloud Platform

#### Using Google Cloud Run
1. Build and push Docker images to Google Container Registry
2. Deploy services to Cloud Run
3. Configure Cloud SQL for PostgreSQL
4. Set up load balancing

### Azure Deployment

#### Using Azure Container Instances
1. Create container groups
2. Deploy backend and frontend containers
3. Configure Azure Database for PostgreSQL
4. Set up Application Gateway

## Monitoring and Logging

### Application Monitoring
```bash
# Install monitoring tools
pip install prometheus-client
npm install --save @prometheus/client

# Configure logging
# Backend: Use Python logging with structured logging
# Frontend: Use console logging and error tracking
```

### Health Checks
```bash
# Backend health check
curl http://localhost:8000/health

# Frontend health check
curl http://localhost:3000
```

### Log Management
```bash
# Using Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Using systemd journal
journalctl -u your-service-name -f
```

## Backup and Recovery

### Database Backup
```bash
# Create backup
pg_dump -h localhost -U postgres regulatory_intelligence > backup.sql

# Restore backup
psql -h localhost -U postgres regulatory_intelligence < backup.sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U postgres regulatory_intelligence > /backups/backup_$DATE.sql
find /backups -name "backup_*.sql" -mtime +7 -delete
```

### Application Backup
```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d).tar.gz /path/to/application

# Backup configuration files
cp -r /etc/nginx/sites-available/regulatory-platform /backups/
```

## Security Considerations

### Environment Security
- Use strong passwords and secrets
- Enable firewall and restrict access
- Keep systems updated
- Use HTTPS in production
- Implement rate limiting

### Application Security
- Validate all inputs
- Use parameterized queries
- Implement proper authentication
- Enable CORS appropriately
- Use security headers

### Database Security
- Use connection encryption
- Implement access controls
- Regular security updates
- Monitor database access

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
docker-compose ps db
docker-compose logs db

# Test connection
psql -h localhost -U postgres -d regulatory_intelligence
```

#### Backend Issues
```bash
# Check backend logs
docker-compose logs backend

# Test API endpoints
curl http://localhost:8000/health
curl http://localhost:8000/docs
```

#### Frontend Issues
```bash
# Check frontend logs
docker-compose logs frontend

# Test frontend
curl http://localhost:3000
```

#### WebSocket Issues
```bash
# Check WebSocket connection
# Use browser developer tools Network tab
# Look for WebSocket connection status
```

### Performance Optimization

#### Backend Optimization
- Use connection pooling
- Implement caching (Redis)
- Optimize database queries
- Use async/await properly

#### Frontend Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading
- Optimize bundle size

## Maintenance

### Regular Maintenance Tasks
- Update dependencies
- Monitor system resources
- Review and rotate logs
- Backup data regularly
- Security updates
- Performance monitoring

### Scaling Considerations
- Horizontal scaling with load balancers
- Database read replicas
- Caching layers
- CDN for static assets
- Microservices architecture for large deployments
