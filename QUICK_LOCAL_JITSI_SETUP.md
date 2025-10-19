# Quick Fix: Local Jitsi Setup (5 Minutes)

## Problem
```
✗ https://meet.jitsi.org/event-XXXX 
  Error 522: Connection timed out
  Cloudflare blocking access
```

## Solution: Use Local Docker Jitsi

### Step 1: Start Jitsi Locally (2 min)

```bash
# Make sure Docker is running

# Navigate to project
cd c:\Users\ChNa395\Likitha\calendar

# Start Jitsi
docker-compose -f docker-compose-jitsi.yml up -d

# Wait for containers to start
# Should see: Jitsi web service running
```

**Verify it started:**
```bash
docker ps | grep jitsi
# Should show running containers
```

### Step 2: Test Jitsi Directly (1 min)

Open browser and go to:
```
http://localhost:8000/test-room-123
```

**Expected:**
- ✅ Jitsi Meet interface loads
- ✅ Can enter room name
- ✅ Can join conference

If this works, Jitsi is running locally!

### Step 3: Configure Backend (1 min)

**Option A: Update application.properties**
```bash
# Edit: backend/src/main/resources/application.properties

# Add or update:
jitsi.base-url=http://localhost:8000/
```

**Option B: Create local config**
```bash
# Already created: application-jitsi-local.properties
# Just use it:
```

### Step 4: Restart Backend (1 min)

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Look for log:**
```
INFO VideoConferenceService : Generated Jitsi Meet link...
```

### Step 5: Test in Calendar (instant)

1. Create event
2. Check video link: `http://localhost:8000/event-XXXXXXXX-XXX`
3. Click "Join Meeting"
4. **Expected:** ✅ Local Jitsi opens!

---

## Troubleshooting

### Docker won't start?
```bash
# Make sure Docker daemon is running
# Windows: Start Docker Desktop from taskbar

# Check if port 8000 is available
netstat -ano | findstr :8000
# If something else uses it, kill it or change port in docker-compose
```

### Still getting timeout?
```bash
# Check if container is actually running
docker logs jitsi-meet

# If errors, restart
docker-compose -f docker-compose-jitsi.yml restart

# Or rebuild
docker-compose -f docker-compose-jitsi.yml down
docker-compose -f docker-compose-jitsi.yml up -d
```

### Backend won't see local Jitsi?
1. Verify `http://localhost:8000/` works in browser first
2. Check `application.properties` has: `jitsi.base-url=http://localhost:8000/`
3. Restart backend after config change
4. Look for log: `Generated Jitsi Meet link...`

---

## Success Criteria

✅ Docker containers running: `docker ps | grep jitsi`  
✅ Can access http://localhost:8000 directly  
✅ Backend starts without errors  
✅ Event links are `http://localhost:8000/event-...`  
✅ Clicking "Join Meeting" opens local Jitsi  
✅ Can join conference room  

---

## One-Command Setup (Fastest)

```bash
# All in one command
cd c:\Users\ChNa395\Likitha\calendar && docker-compose -f docker-compose-jitsi.yml up -d && cd backend && mvn clean install && mvn spring-boot:run
```

Then test: http://localhost:5173 → Create event → Click "Join Meeting"

---

## What Changed

1. ✅ `VideoConferenceService.java` - Now uses configurable URL
2. ✅ `application-jitsi-local.properties` - Local config
3. ✅ `docker-compose-jitsi.yml` - Self-hosted Jitsi

**Result:** Works locally without depending on external jitsi.org 🎉

