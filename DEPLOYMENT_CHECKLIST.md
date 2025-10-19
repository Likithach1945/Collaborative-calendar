# 🚀 Calendar Application - Production Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] **Server Requirements Met**
  - [ ] Docker 20.10+ installed
  - [ ] Docker Compose 2.0+ installed
  - [ ] Minimum 4GB RAM available
  - [ ] Minimum 20GB disk space
  - [ ] Ports 80, 443, 3306, 6379, 8443, 8444 available

### 2. Domain & SSL Configuration
- [ ] **Domain Setup**
  - [ ] Domain name configured and pointing to server
  - [ ] DNS A records set correctly
  - [ ] SSL certificate obtained (Let's Encrypt recommended)
  - [ ] SSL certificate files placed in `./ssl-certs/`

### 3. Google OAuth Setup
- [ ] **Google Cloud Console Configuration**
  - [ ] Project created in Google Cloud Console
  - [ ] OAuth 2.0 credentials created
  - [ ] Authorized redirect URIs configured:
    - `https://yourdomain.com/login/oauth2/code/google`
  - [ ] Client ID and Client Secret obtained

### 4. Environment Variables
- [ ] **Configuration Files**
  - [ ] Copy `.env.production` to `.env`
  - [ ] Update all placeholder values in `.env`:
    - [ ] `DB_ROOT_PASSWORD` - Strong MySQL root password
    - [ ] `DB_PASSWORD` - Strong MySQL user password  
    - [ ] `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID`
    - [ ] `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET`
    - [ ] `JWT_SECRET` - 64+ character random string
    - [ ] `GOOGLE_OAUTH_REDIRECT_URI` - Your domain redirect URI
    - [ ] `REDIS_PASSWORD` - Strong Redis password (if using Redis)
    - [ ] Email settings (if using email notifications)

### 5. Security Hardening
- [ ] **Server Security**
  - [ ] Firewall configured (only necessary ports open)
  - [ ] SSH key-based authentication enabled
  - [ ] Regular security updates enabled
  - [ ] Non-root user for deployment
  - [ ] Docker daemon secured

### 6. Backup Strategy
- [ ] **Database Backups**
  - [ ] Backup directory created: `./backups/`
  - [ ] Backup script permissions set: `chmod +x scripts/backup.sh`
  - [ ] Backup schedule configured (cron job recommended)
  - [ ] Backup restoration procedure tested

## Deployment Process

### 1. Pre-deployment Testing
```bash
# Test environment configuration
docker-compose -f docker-compose.prod.yml config

# Validate environment variables
./scripts/deploy.sh status
```

### 2. Initial Deployment
```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh deploy
```

### 3. Post-deployment Verification
- [ ] **Service Health Checks**
  - [ ] Frontend accessible: `https://yourdomain.com`
  - [ ] Backend health: `https://yourdomain.com:8444/actuator/health`
  - [ ] Database connection working
  - [ ] Redis connection working (if enabled)
  - [ ] Google OAuth login functional

### 4. Application Testing
- [ ] **Functional Testing**
  - [ ] User registration/login works
  - [ ] Calendar creation and viewing
  - [ ] Event creation, editing, deletion
  - [ ] Timezone handling correct
  - [ ] Video conference links working
  - [ ] Email notifications (if configured)
  - [ ] Cross-browser compatibility

### 5. Performance Testing
- [ ] **Load Testing**
  - [ ] Application responds under load
  - [ ] Database performance acceptable
  - [ ] Memory usage within limits
  - [ ] No memory leaks observed

## Monitoring & Maintenance

### 1. Log Monitoring
- [ ] **Log Setup**
  - [ ] Application logs accessible: `docker-compose logs -f backend`
  - [ ] Database logs monitored
  - [ ] Nginx access/error logs reviewed
  - [ ] Log rotation configured

### 2. Health Monitoring
- [ ] **Monitoring Setup**
  - [ ] Health check endpoints responding
  - [ ] Prometheus metrics (if enabled)
  - [ ] Disk space monitoring
  - [ ] Memory usage monitoring

### 3. Backup Verification
- [ ] **Backup Testing**
  - [ ] Automated backups running
  - [ ] Backup restoration tested
  - [ ] Backup integrity verified
  - [ ] Offsite backup storage configured

### 4. Security Monitoring
- [ ] **Security Checks**
  - [ ] SSL certificate expiry monitoring
  - [ ] Security headers verified
  - [ ] Access logs reviewed for anomalies
  - [ ] Dependency vulnerability scanning

## Maintenance Procedures

### Regular Tasks (Weekly)
- [ ] Review application logs
- [ ] Check disk space usage
- [ ] Verify backup integrity
- [ ] Update dependencies (if needed)

### Regular Tasks (Monthly)
- [ ] Security audit
- [ ] Performance review
- [ ] SSL certificate expiry check
- [ ] Database optimization

### Emergency Procedures
- [ ] **Rollback Plan**
  - [ ] Previous version backup available
  - [ ] Rollback procedure documented
  - [ ] Database rollback strategy

- [ ] **Incident Response**
  - [ ] Monitoring alerts configured
  - [ ] Contact information updated
  - [ ] Escalation procedures defined

## Troubleshooting

### Common Issues
1. **Service Won't Start**
   - Check environment variables
   - Verify Docker image builds
   - Review container logs

2. **Database Connection Fails**
   - Verify database credentials
   - Check network connectivity
   - Review database logs

3. **OAuth Login Issues**
   - Verify Google OAuth configuration
   - Check redirect URI settings
   - Review backend logs

4. **SSL/HTTPS Issues**
   - Verify certificate files
   - Check Nginx configuration
   - Review SSL certificate validity

### Useful Commands
```bash
# View all service status
docker-compose -f docker-compose.prod.yml ps

# View service logs
docker-compose -f docker-compose.prod.yml logs -f [service_name]

# Restart specific service
docker-compose -f docker-compose.prod.yml restart [service_name]

# Create database backup
./scripts/deploy.sh backup

# Monitor resource usage
docker stats

# Check application health
curl -f https://yourdomain.com/health
curl -f https://yourdomain.com:8444/actuator/health
```

## Support & Documentation

### Resources
- [ ] Application documentation updated
- [ ] API documentation accessible
- [ ] Deployment procedures documented
- [ ] Troubleshooting guide available

### Contacts
- [ ] Development team contact information
- [ ] System administrator contacts
- [ ] Hosting provider support details
- [ ] Domain registrar information

---

## Deployment Sign-off

**Deployed by:** ________________________  
**Date:** ________________________  
**Version:** ________________________  
**Environment:** Production  

**Verification:**
- [ ] All checklist items completed
- [ ] Application fully functional
- [ ] Monitoring in place
- [ ] Backup strategy verified
- [ ] Documentation updated

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________