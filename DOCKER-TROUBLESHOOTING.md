# 🐳 Docker Issue - Quick Fix Guide

## Problem: Docker Desktop Not Running

You're seeing this error:
```
unable to get image 'mysql:8.0': error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/images/mysql:8.0/json": 
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

This means **Docker Desktop is not running** on your Windows machine.

---

## ✅ Solution: Start Docker Desktop

### Option 1: Start Docker Desktop GUI

1. **Press Windows key** and search for "**Docker Desktop**"
2. **Click to open** Docker Desktop
3. **Wait 30-60 seconds** for Docker to fully start
4. You'll see the Docker icon in your system tray (bottom-right)
5. When the icon stops animating, Docker is ready

### Option 2: Check if Docker Desktop is Installed

If you can't find Docker Desktop:

1. **Download Docker Desktop for Windows**:
   - Go to: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"
   - Run the installer
   - Follow installation prompts
   - **Restart your computer** after installation

2. **System Requirements**:
   - Windows 10 64-bit: Pro, Enterprise, or Education (Build 19041 or higher)
   - OR Windows 11 64-bit
   - WSL 2 feature enabled
   - Virtualization enabled in BIOS

---

## 🔍 Verify Docker is Running

After starting Docker Desktop, verify it's working:

```powershell
# Check Docker version
docker --version

# Check Docker is responsive
docker ps

# Expected output: List of containers (may be empty)
```

If you see version info and no errors, Docker is ready!

---

## 🚀 Try Again

Once Docker Desktop is running:

```powershell
cd C:\Users\ChNa395\Likitha\calendar

# Try starting the application again
docker-compose up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## 📝 Note: docker-compose.yml Warning

I've also fixed the warning about `version: '3.8'` being obsolete. Modern Docker Compose doesn't need the version field anymore (it's removed from the file).

---

## 🆘 Alternative: Run Without Docker

If you can't use Docker, you can run the app locally:

### 1. Install Prerequisites

- **Java 17**: https://adoptium.net/
- **Node.js 20**: https://nodejs.org/
- **MySQL 8**: https://dev.mysql.com/downloads/

### 2. Setup Database

```sql
-- Run in MySQL
CREATE DATABASE calendardb;
CREATE USER 'calendaruser'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON calendardb.* TO 'calendaruser'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Run Backend

```powershell
cd C:\Users\ChNa395\Likitha\calendar\backend

# Edit application.properties with your DB credentials and Google OAuth

mvn spring-boot:run
```

### 4. Run Frontend

```powershell
cd C:\Users\ChNa395\Likitha\calendar\frontend

npm install
npm run dev
```

---

## 🎯 Summary

**Problem**: Docker Desktop not running  
**Quick Fix**: Start Docker Desktop from Windows Start menu  
**Wait**: 30-60 seconds for Docker to initialize  
**Verify**: Run `docker --version`  
**Then**: Run `docker-compose up -d` again

---

**Need more help?** See QUICKSTART.md for detailed instructions!
