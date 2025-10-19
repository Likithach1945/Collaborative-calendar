# Fix Jitsi Connection Timeout - Step-by-Step

## Problem
```
Jitsi.org connection timing out (Error 522)
Cannot join video conferences
Need local/alternative solution
```

---

## Solution: Use Local Docker Jitsi

### Step 1: Verify Docker is Installed

```bash
# Check if Docker is installed
docker --version

# Output should be:
# Docker version 20.10.x or higher
```

**If Docker not installed:**
- Download: https://www.docker.com/products/docker-desktop
- Install Docker Desktop
- Restart computer

---

### Step 2: Start Jitsi Locally

```bash
# Navigate to project
cd c:\Users\ChNa395\Likitha\calendar

# Start Jitsi containers
docker-compose -f docker-compose-jitsi.yml up -d

# Wait 30 seconds for containers to start
```

**Verify containers are running:**
```bash
docker ps

# You should see:
# jitsi-meet (port 8000)
# jitsi-jicofo
# jitsi-prosody
# jitsi-jvb
```

---

### Step 3: Test Jitsi Directly

Open browser and visit:
```
http://localhost:8000/test-room-123
```

**Expected:**
- ✅ Jitsi Meet interface loads
- ✅ Can see video preview
- ✅ Can enter name and join

**If this doesn't work:**
- Check Docker is running: `docker ps`
- Check port 8000 is free: `netstat -ano | findstr :8000`
- Wait another 30 seconds for containers to fully start
- Check logs: `docker logs jitsi-meet`

---

### Step 4: Update Backend Configuration

**Edit file:** `backend/src/main/resources/application.properties`

**Find this section:**
```properties
# Video Conference Settings
jitsi.base-url=https://meet.jitsi.org/
```

**Change to:**
```properties
# Video Conference Settings
jitsi.base-url=http://localhost:8000/
```

**Save the file.**

---

### Step 5: Rebuild Backend

```bash
# Navigate to backend
cd c:\Users\ChNa395\Likitha\calendar\backend

# Clean build
mvn clean install

# Expected output:
# [INFO] BUILD SUCCESS
```

---

### Step 6: Start Backend

```bash
# Start Spring Boot
mvn spring-boot:run

# Expected to see:
# [INFO] Tomcat initialized with port(s): 8443 (https)
# [INFO] Started Application in X seconds
```

---

### Step 7: Test in Calendar

**Open browser:**
```
http://localhost:5173
```

**Steps:**
1. Login to calendar
2. Create new event
   - Title: "Test Video"
   - Time: Any future time
   - Click "Create Event"
3. Click on the event
4. Look for "Video Conference" section
5. Verify link shows: `http://localhost:8000/event-XXXXXXXX-XXX`
6. Click **[Join Meeting]**

**Expected:**
- ✅ New tab opens
- ✅ Loads `http://localhost:8000/event-XXXXXXXX-XXX`
- ✅ Jitsi Meet interface appears
- ✅ Can join conference
- ✅ **No timeout error** ✅

---

## ✅ Success Indicators

All should be GREEN:

- [ ] Docker containers running: `docker ps | grep jitsi`
- [ ] Can access http://localhost:8000 directly
- [ ] Backend starts without errors
- [ ] Backend logs show: "Generated Jitsi Meet link"
- [ ] Event video link format: `http://localhost:8000/event-...`
- [ ] Clicking "Join Meeting" opens Jitsi
- [ ] Jitsi loads without timeout
- [ ] Can join conference successfully

---

## 🚨 Troubleshooting

### Issue 1: Docker containers won't start

**Error:** `docker: command not found`
- Solution: Install Docker Desktop
- Restart computer after installation

**Error:** `Container already exists`
```bash
# Remove old containers
docker-compose -f docker-compose-jitsi.yml down
# Try again
docker-compose -f docker-compose-jitsi.yml up -d
```

**Error:** `Port 8000 already in use`
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual)
taskkill /PID <PID> /F

# Or change port in docker-compose-jitsi.yml:
# ports: ["8001:80"]  <- Change to 8001
```

### Issue 2: Jitsi won't load at http://localhost:8000

**Wait longer:**
- Containers take 30-60 seconds to fully start
- Check logs: `docker logs jitsi-meet`
- Wait another 30 seconds and try again

**Check firewall:**
```bash
# Windows Firewall might block local connections
# Temporarily disable and retry
# Or add exception for localhost
```

### Issue 3: Backend won't start

**Error:** `Failed to bind to port 8443`
- Another app using 8443
- Solution: Kill the process or restart computer

**Error:** `jitsi.base-url property not found`
- Verify you edited `application.properties` correctly
- Check file is saved
- Restart backend: `Ctrl+C` then `mvn spring-boot:run`

### Issue 4: Event link still shows https://meet.jitsi.org/

**Problem:** Backend cached old configuration

**Solution:**
1. Stop backend: `Ctrl+C`
2. Clean build: `mvn clean install`
3. Start backend: `mvn spring-boot:run`
4. Create NEW event
5. Check link format

### Issue 5: Join Meeting opens but nothing loads

**Try:**
1. Wait 5-10 seconds (first load is slow)
2. Refresh browser: `F5`
3. Try incognito mode: `Ctrl+Shift+N`
4. Disable browser extensions temporarily
5. Check browser console for errors: `F12 → Console`

---

## 🔄 Complete Setup Script

If you want to automate everything:

**Create file:** `setup-local-jitsi.bat`

```batch
@echo off
echo Starting local Jitsi setup...

echo Step 1: Starting Docker containers
docker-compose -f docker-compose-jitsi.yml up -d
timeout /t 5

echo Step 2: Checking if containers are running
docker ps | findstr jitsi

echo Step 3: Waiting for Jitsi to fully start
timeout /t 30
echo Containers should be ready now

echo Step 4: Building backend
cd backend
mvn clean install
echo Build complete

echo Step 5: Starting backend
echo Backend will start in new command prompt
start cmd /k "mvn spring-boot:run"

echo Step 6: Setup complete!
echo Frontend: http://localhost:5173
echo Jitsi: http://localhost:8000
echo Backend: http://localhost:8443
pause
```

**Run it:**
```bash
setup-local-jitsi.bat
```

---

## 📊 Final Configuration

**Location:** `backend/src/main/resources/application.properties`

```properties
# ===== Video Conference Configuration =====
# For local development with Docker
jitsi.base-url=http://localhost:8000/

# For public Jitsi (if accessible)
# jitsi.base-url=https://meet.jitsi.org/

# For self-hosted server
# jitsi.base-url=https://your-jitsi-server.com/
```

---

## ✅ Verification Checklist

After setup, verify each step:

```bash
# 1. Docker containers
docker ps | grep jitsi
# ✅ Should show running containers

# 2. Jitsi web interface
curl http://localhost:8000/
# ✅ Should return HTML

# 3. Backend running
curl http://localhost:8443/api/v1/events
# ✅ Should return events or 401 (auth)

# 4. Configuration
grep "jitsi.base-url" backend/src/main/resources/application.properties
# ✅ Should show: jitsi.base-url=http://localhost:8000/
```

---

## 🎯 Success Timeline

| Step | Time | Action |
|------|------|--------|
| 1 | 1 min | Check Docker installed |
| 2 | 2 min | Start containers |
| 3 | 2 min | Wait for startup |
| 4 | 1 min | Test Jitsi directly |
| 5 | 2 min | Update config |
| 6 | 3 min | Rebuild backend |
| 7 | 1 min | Start backend |
| 8 | 2 min | Create & test event |
| **TOTAL** | **~15 min** | **Working video conferences** |

---

## 🎉 Expected Result

After these steps:

1. ✅ Local Docker Jitsi running
2. ✅ Backend configured for local Jitsi
3. ✅ Create events → Links show `http://localhost:8000/event-...`
4. ✅ Click "Join Meeting" → Jitsi opens
5. ✅ Join conference → Works immediately
6. ✅ **No connection timeouts** ✅
7. ✅ Video/audio working

---

## 🚀 Next Phase

After local testing works:

1. **Deploy to staging** with your server
2. **Update jitsi.base-url** to your server address
3. **Test with team members**
4. **Deploy to production**

---

**Status: Ready to implement!** 

Follow the steps in order. Should be working in ~15 minutes. 🚀

