# Production Deployment Guide

This guide provides comprehensive instructions for deploying the Regulatory Intelligence Platform to production.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Domain name configured
- SSL certificates (Let's Encrypt recommended)
- Google Gemini API key

### Automated Setup (Recommended)

**Windows:**
```bash
scripts\setup-production.bat
```

**Linux/macOS:**
```bash
chmod +x scripts/setup-production.sh
./scripts/setup-production.sh
```

### Manual Setup

1. **Create environment file:**
```bash
cp backend/regulatory_analyzer/env.example .env
```

2. **Update environment variables:**
```env
# Required - Update these values
SECRET_KEY=your-very-secure-secret-key-here-minimum-32-characters
GEMINI_API_KEY=your-actual-gemini-api-key-here
POSTGRES_PASSWORD=your-secure-database-password
FRONTEND_URL=https://your-domain.com
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_SOCKET_URL=https://your-domain.com
```

3. **Start production services:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Production Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SECRET_KEY` | JWT secret key (min 32 chars) | ✅ | `openssl rand -base64 32` |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ | `AIza...` |
| `POSTGRES_PASSWORD` | Database password | ✅ | `secure-password` |
| `FRONTEND_URL` | Frontend domain | ✅ | `https://your-domain.com` |
| `DEBUG` | Debug mode | ❌ | `False` |
| `LOG_LEVEL` | Logging level | ❌ | `INFO` |

### SSL/TLS Configuration

#### Option 1: Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Option 2: Custom Certificates
1. Place your certificates in `nginx/ssl/`:
   - `cert.pem` - Certificate file
   - `key.pem` - Private key file

2. Update nginx configuration if needed

### Database Configuration

#### Production Database Setup
```sql
-- Create production database
CREATE DATABASE regulatory_intelligence_prod;
CREATE USER regulatory_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE regulatory_intelligence_prod TO regulatory_user;
```

#### Database Backups
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U regulatory_user regulatory_intelligence > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U regulatory_user regulatory_intelligence < backup.sql
```

## 📊 Monitoring and Logging

### Application Monitoring

#### Health Checks
- **Backend API:** `https://your-domain.com/health`
- **Frontend:** `https://your-domain.com`
- **Database:** Built-in PostgreSQL health checks

#### Log Monitoring
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

#### Performance Monitoring
```bash
# Check resource usage
docker stats

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

### Log Management

#### Log Rotation
Create `/etc/logrotate.d/regulatory-platform`:
```
/var/log/regulatory-platform/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /path/to/docker-compose.prod.yml restart nginx
    endscript
}
```

## 🔒 Security Configuration

### Firewall Setup
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Security Headers
The nginx configuration includes:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`
- `Referrer-Policy`

### Rate Limiting
- API endpoints: 10 requests/second
- Login endpoints: 5 requests/minute
- Burst handling with nodelay

## 🚀 Deployment Strategies

### Blue-Green Deployment
```bash
# Deploy to staging
docker-compose -f docker-compose.staging.yml up -d

# Test staging
curl https://staging.your-domain.com/health

# Switch to production
docker-compose -f docker-compose.prod.yml up -d
```

### Rolling Updates
```bash
# Update images
docker-compose -f docker-compose.prod.yml pull

# Rolling restart
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
```

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
    # ... other config
```

### Load Balancer Configuration
```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}
```

### Database Scaling
- **Read Replicas:** Configure PostgreSQL read replicas
- **Connection Pooling:** Use PgBouncer for connection pooling
- **Caching:** Redis for session and data caching

## 🔄 Maintenance

### Regular Maintenance Tasks

#### Daily
- Monitor application logs
- Check disk space
- Verify backup completion

#### Weekly
- Review security logs
- Update dependencies
- Performance analysis

#### Monthly
- Security updates
- Database optimization
- Log cleanup

### Update Process
```bash
# 1. Backup current state
docker-compose -f docker-compose.prod.yml exec db pg_dump -U regulatory_user regulatory_intelligence > backup_$(date +%Y%m%d).sql

# 2. Pull latest images
docker-compose -f docker-compose.prod.yml pull

# 3. Update services
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify deployment
curl https://your-domain.com/health
```

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
docker-compose -f docker-compose.prod.yml exec db pg_isready -U regulatory_user

# Check database logs
docker-compose -f docker-compose.prod.yml logs db
```

#### Backend API Issues
```bash
# Check backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Test API endpoints
curl https://your-domain.com/health
curl https://your-domain.com/api/docs
```

#### Frontend Issues
```bash
# Check frontend logs
docker-compose -f docker-compose.prod.yml logs frontend

# Test frontend
curl https://your-domain.com
```

#### WebSocket Issues
```bash
# Check WebSocket connection
# Use browser developer tools Network tab
# Look for WebSocket connection status
```

### Performance Issues

#### High Memory Usage
```bash
# Check memory usage
docker stats

# Restart services if needed
docker-compose -f docker-compose.prod.yml restart backend
```

#### Slow Database Queries
```bash
# Check database performance
docker-compose -f docker-compose.prod.yml exec db psql -U regulatory_user -d regulatory_intelligence -c "SELECT * FROM pg_stat_activity;"
```

## 📞 Support

### Getting Help
1. Check the logs first: `docker-compose -f docker-compose.prod.yml logs -f`
2. Verify environment configuration
3. Check service health endpoints
4. Review this documentation

### Emergency Procedures
```bash
# Quick restart
docker-compose -f docker-compose.prod.yml restart

# Full restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Rollback to previous version
docker-compose -f docker-compose.prod.yml down
# Restore from backup
docker-compose -f docker-compose.prod.yml up -d
```

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Log rotation set up
- [ ] Health checks working
- [ ] API documentation accessible
- [ ] WebSocket connections working
- [ ] AI integration tested
- [ ] Performance benchmarks met

## 📋 Post-Deployment

After successful deployment:

1. **Test all functionality:**
   - User registration/login
   - Company profile creation
   - Analysis execution
   - Report generation
   - Real-time updates

2. **Monitor performance:**
   - Response times
   - Memory usage
   - Database performance
   - Error rates

3. **Set up alerts:**
   - Service downtime
   - High error rates
   - Resource usage
   - Security events

4. **Document access:**
   - API documentation: `https://your-domain.com/docs`
   - Health check: `https://your-domain.com/health`
   - Application: `https://your-domain.com`

Your Regulatory Intelligence Platform is now production-ready! 🎉
