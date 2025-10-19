# 🌐 Network/Proxy Issue Fix

## Problem
Docker can't download images from Docker Hub due to network/proxy issues:
```
failed to fetch oauth token: Post "https://auth.docker.io/token": 
connecting to 15.65.196.7:8080: dial tcp 15.65.196.7:8080: connectex: 
A connection attempt failed...
```

This suggests Docker is trying to use a proxy (15.65.196.7:8080) that isn't responding.

---

## ✅ Solutions (Try in Order)

### Solution 1: Configure Docker Desktop Proxy Settings

1. **Open Docker Desktop**
2. Click **Settings** (gear icon)
3. Go to **Resources** → **Proxies**
4. Choose one:
   - **Manual proxy**: If you know your corporate proxy details
   - **System proxy**: Use Windows proxy settings
   - **No proxy**: If you don't use a proxy
5. Click **Apply & Restart**

### Solution 2: Check Windows Proxy Settings

```powershell
# Check current proxy settings
netsh winhttp show proxy

# If you see a proxy but don't need it, reset:
netsh winhttp reset proxy

# Then restart Docker Desktop
```

### Solution 3: Pull Images Manually (if proxy persists)

If you can access Docker Hub through a browser, try:

```powershell
# Pull images manually
docker pull mysql:8.0
docker pull redis:7-alpine
docker pull node:20-alpine
docker pull nginx:1.25-alpine-slim
```

Then try `docker-compose up -d` again.

### Solution 4: Use Pre-downloaded Images

If you're behind a strict firewall, ask your IT department to:
- Whitelist `auth.docker.io` and `registry-1.docker.io`
- Or provide access to an internal Docker registry

---

## 🔍 Quick Diagnostic

Run this to see what's happening:

```powershell
# Test Docker Hub connectivity
docker pull hello-world

# Check Docker daemon settings
docker info | Select-String -Pattern "Proxy"
```

---

## 🆘 Alternative: Run Locally Without Docker

If Docker networking is blocked, you can run the app locally:

### Prerequisites
- Java 17: https://adoptium.net/
- Node.js 20: https://nodejs.org/
- MySQL 8: https://dev.mysql.com/downloads/

### Setup

1. **Install MySQL** and create database:
```sql
CREATE DATABASE calendardb;
CREATE USER 'calendaruser'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON calendardb.* TO 'calendaruser'@'localhost';
```

2. **Run Backend**:
```powershell
cd C:\Users\ChNa395\Likitha\calendar\backend
# Edit application.properties with your Google OAuth credentials
mvn spring-boot:run
```

3. **Run Frontend**:
```powershell
cd C:\Users\ChNa395\Likitha\calendar\frontend
npm install
npm run dev
```

See **QUICKSTART.md** for detailed local setup instructions.

---

## 📞 Need Help?

If you're in a corporate environment:
- Contact IT to whitelist Docker Hub domains
- Ask about Docker proxy configuration
- Request access to internal Docker registry

---

**Summary**: Docker Desktop is now running ✅, but network/proxy is blocking image downloads ❌. Try the solutions above!
