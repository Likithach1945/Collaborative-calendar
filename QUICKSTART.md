# 🚀 Quick Start Guide

## Prerequisites Check

Before running the app, ensure you have:

- [ ] **Docker Desktop** installed and running ([Download](https://www.docker.com/products/docker-desktop/))
- [ ] **Google OAuth credentials** from [Google Cloud Console](https://console.cloud.google.com/)

**OR** (for local development without Docker):

- [ ] **Java 17+** installed
- [ ] **Node.js 20+** installed
- [ ] **MySQL 8.0+** installed and running
- [ ] **Maven** installed (or use Maven wrapper)

---

## 🐳 Option 1: Docker (Recommended - Easiest!)

This is the **fastest way** to run the entire application with one command.

### Step 1: Configure Environment

```powershell
# Navigate to project directory
cd C:\Users\ChNa395\Likitha\calendar

# Copy environment template
Copy-Item .env.example .env

# Edit .env file with your credentials
notepad .env
```

**Required in `.env`:**
```env
# Set strong passwords
DB_ROOT_PASSWORD=your_secure_root_password
DB_PASSWORD=your_secure_user_password

# Get these from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Enable Redis caching
# APP_CACHE_REDIS_ENABLED=true

# Optional: Configure email notifications
# SMTP_USERNAME=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
```

### Step 2: Start All Services

```powershell
# Start everything (database, backend, frontend)
docker-compose up -d

# View logs (optional)
docker-compose logs -f

# Check status
docker-compose ps
```

### Step 3: Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8443
- **Health Check**: http://localhost:8443/actuator/health
- **Metrics**: http://localhost:8443/actuator/prometheus

### Step 4: Sign In

1. Open http://localhost in your browser
2. Click "Sign in with Google"
3. Authorize with your Google account
4. Start using the calendar!

### Stopping the App

```powershell
# Stop all services
docker-compose down

# Stop and remove all data (including database)
docker-compose down -v
```

---

## 💻 Option 2: Local Development (Advanced)

Run backend and frontend separately for development.

### Backend Setup

#### 1. Configure MySQL Database

```powershell
# Connect to MySQL (adjust credentials as needed)
mysql -u root -p

# Create database and user
CREATE DATABASE calendardb;
CREATE USER 'calendaruser'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON calendardb.* TO 'calendaruser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 2. Configure Application Properties

Edit `backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/calendardb
spring.datasource.username=calendaruser
spring.datasource.password=yourpassword

# Google OAuth (REQUIRED)
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8443/login/oauth2/code/google

# Optional: Redis (if you have Redis running)
# spring.data.redis.host=localhost
# spring.data.redis.port=6379
# app.cache.redis.enabled=true

# Optional: SMTP Email
# spring.mail.host=smtp.gmail.com
# spring.mail.port=587
# spring.mail.username=your-email@gmail.com
# spring.mail.password=your-app-password
# spring.mail.properties.mail.smtp.auth=true
# spring.mail.properties.mail.smtp.starttls.enable=true
```

#### 3. Run Backend

```powershell
cd C:\Users\ChNa395\Likitha\calendar\backend

# Using Maven wrapper (if available)
.\mvnw.cmd spring-boot:run

# OR using Maven directly
mvn spring-boot:run
```

Backend runs on: **https://localhost:8443**

### Frontend Setup

#### 1. Install Dependencies

```powershell
cd C:\Users\ChNa395\Likitha\calendar\frontend

# Install packages
npm install
```

#### 2. Configure API Endpoint

Create `frontend/.env.local`:

```env
VITE_API_BASE_URL=https://localhost:8443
```

#### 3. Run Frontend

```powershell
# Start development server
npm run dev
```

Frontend runs on: **http://localhost:5173**

Open http://localhost:5173 in your browser.

---

## 🔑 Google OAuth Setup

You need OAuth credentials to enable Google Sign-In.

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Name it (e.g., "Calendar App")

### 2. Enable Google APIs

1. Navigate to **APIs & Services** → **Library**
2. Search for "**Google+ API**" → Click **Enable**

### 3. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure **OAuth consent screen**:
   - User Type: **External** (for testing)
   - App name: "Calendar Application"
   - User support email: your email
   - Add your email as test user
4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Calendar App"
   - **Authorized redirect URIs**:
     - `http://localhost:8443/login/oauth2/code/google` (for local dev)
     - `http://localhost:8443/login/oauth2/code/google` (for Docker)
     - Add production URL when deploying

### 4. Copy Credentials

- Copy **Client ID** and **Client Secret**
- Add them to your `.env` file (Docker) or `application.properties` (local)

---

## 🧪 Testing the App

### Verify Backend is Running

```powershell
# Health check
curl http://localhost:8443/actuator/health

# Expected response:
# {"status":"UP"}
```

### Verify Frontend is Running

```powershell
# Check frontend
curl http://localhost

# Should return HTML page
```

### Test Authentication Flow

1. Open http://localhost (or http://localhost:5173 for local dev)
2. Click "Sign in with Google"
3. Authorize with Google account
4. Should redirect to calendar view

### Test Core Features

- ✅ Create an event
- ✅ View day/week/month calendar
- ✅ Check availability for multiple users
- ✅ Send invitation to event
- ✅ Respond to invitation (Accept/Decline/Tentative)
- ✅ Propose alternative time
- ✅ Import .ics calendar file

---

## 🐛 Troubleshooting

### Docker Issues

**Problem**: Docker containers won't start
```powershell
# Check Docker is running
docker version

# Check container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Problem**: "Port already in use"
```powershell
# Check what's using ports 80, 8443, 3306
netstat -ano | findstr "80"
netstat -ano | findstr "8443"
netstat -ano | findstr "3306"

# Stop conflicting services or change ports in docker-compose.yml
```

### Backend Issues

**Problem**: "Connection refused" to MySQL
```powershell
# Verify MySQL is running
mysql -u root -p

# Check database exists
SHOW DATABASES;

# Check user permissions
SELECT user, host FROM mysql.user WHERE user = 'calendaruser';
```

**Problem**: OAuth redirect URI mismatch
- Verify redirect URI in Google Cloud Console matches **exactly**:
  - `http://localhost:8443/login/oauth2/code/google`
- Check `application.properties` has correct redirect-uri

**Problem**: Backend won't start - "Port 8443 in use"
```powershell
# Find process using port 8443
netstat -ano | findstr "8443"

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Frontend Issues

**Problem**: "Cannot connect to backend"
- Verify backend is running: `curl http://localhost:8443/actuator/health`
- Check CORS settings in `SecurityHeadersConfig.java`
- Verify `.env.local` has correct `VITE_API_BASE_URL`

**Problem**: Blank page / white screen
```powershell
# Check console for errors (F12 in browser)
# Rebuild frontend
npm run build

# Clear browser cache (Ctrl+Shift+Delete)
```

### OAuth Issues

**Problem**: "redirect_uri_mismatch" error
- **Solution**: Ensure redirect URI in Google Cloud Console includes:
  - `http://localhost:8443/login/oauth2/code/google`
- Must match **exactly** (including http/https, port, path)

**Problem**: "Invalid client" error
- **Solution**: Verify Client ID and Secret are correct in `.env` or `application.properties`

---

## 📊 Monitoring & Observability

### Health Check Endpoints

```powershell
# Application health
curl http://localhost:8443/actuator/health

# Detailed health (requires authentication)
curl http://localhost:8443/actuator/health/db
curl http://localhost:8443/actuator/health/redis

# Application info
curl http://localhost:8443/actuator/info
```

### Prometheus Metrics

```powershell
# Metrics endpoint
curl http://localhost:8443/actuator/prometheus

# Key metrics:
# - jvm_memory_used_bytes
# - http_server_requests_seconds
# - jdbc_connections_active
# - cache_gets_total
```

### View Logs

**Docker:**
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

**Local Development:**
- Backend logs appear in terminal where you ran `mvn spring-boot:run`
- Frontend logs appear in browser console (F12)

---

## 🚀 Next Steps

Once the app is running:

1. **Create your first event**
   - Click "Create Event"
   - Fill in details (title, time, location)
   - Add invitees (optional)

2. **Test availability checking**
   - Navigate to "Availability"
   - Select participants and date range
   - View suggested meeting times

3. **Import existing calendar**
   - Export .ics file from Google Calendar or Outlook
   - Click "Import ICS"
   - Upload your .ics file

4. **Invite others**
   - Create an event with invitees
   - Invitees receive email (if SMTP configured)
   - They can Accept/Decline/Tentative

5. **Explore features**
   - Switch between Day/Week/Month views
   - Propose alternative meeting times
   - Check calendar on mobile (responsive design)

---

## 📚 Additional Documentation

- 🐳 [Docker Deployment Guide](docs/DOCKER-DEPLOYMENT.md) - Production deployment
- 🔐 [Authentication Guide](docs/AUTHENTICATION.md) - OAuth setup details
- 📖 [API Documentation](docs/API.md) - REST API reference
- 🧪 [Testing Guide](docs/TESTING.md) - Running tests
- ♿ [Accessibility Report](docs/ACCESSIBILITY.md) - Accessibility features
- 📦 [Backlog](docs/BACKLOG.md) - Future features roadmap

---

## 💡 Tips

### For Development

- Use **Docker** for quick setup and testing
- Use **Local Development** for debugging and code changes
- Enable **Redis** for better performance with multiple users
- Configure **SMTP** to test email notifications

### For Production

- See [DOCKER-DEPLOYMENT.md](docs/DOCKER-DEPLOYMENT.md) for production setup
- Use strong passwords in `.env`
- Configure HTTPS/TLS (reverse proxy)
- Enable monitoring (Prometheus + Grafana)
- Set up database backups
- Use managed services (RDS, Cloud SQL) for database

---

## 🎉 Success!

If you see the calendar interface after signing in with Google, **congratulations!** Your calendar application is running successfully.

**Need help?** Check the troubleshooting section above or review the detailed documentation.

---

**Last Updated**: October 16, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
