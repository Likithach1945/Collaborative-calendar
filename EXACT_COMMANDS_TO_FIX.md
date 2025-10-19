# EXACT COMMANDS TO FIX JITSI TIMEOUT

Copy-paste these commands in order. Takes ~15 minutes.

---

## Terminal 1: Start Local Jitsi

```bash
cd c:\Users\ChNa395\Likitha\calendar
docker-compose -f docker-compose-jitsi.yml up -d
```

**Wait 30-60 seconds for containers to start.**

Verify:
```bash
docker ps
```

Should show: jitsi-meet, jitsi-jicofo, jitsi-prosody, jitsi-jvb

Test:
```
Open browser: http://localhost:8000/test-room-123
Expected: Jitsi interface loads ✓
```

---

## Edit File: Backend Configuration

Open file with text editor:
```
c:\Users\ChNa395\Likitha\calendar\backend\src\main\resources\application.properties
```

Find this line:
```
jitsi.base-url=https://meet.jitsi.org/
```

Change to:
```
jitsi.base-url=http://localhost:8000/
```

Save file (Ctrl+S)

---

## Terminal 2: Start Backend

```bash
cd c:\Users\ChNa395\Likitha\calendar\backend
mvn clean install
mvn spring-boot:run
```

Wait for it to start. Look for:
```
Started Application in X seconds
```

---

## Terminal 3: Start Frontend (Optional)

```bash
cd c:\Users\ChNa395\Likitha\calendar\frontend
npm run dev
```

Or use existing frontend if already running.

---

## Browser: Test

1. Open: `http://localhost:5173`
2. Login
3. Create new event:
   - Title: "Test Video"
   - Time: Any future time
   - Click "Create Event"
4. Click on event
5. Look for "Video Conference" section
6. Click **[Join Meeting]**

**Expected:** Jitsi opens without timeout ✅

---

## Troubleshooting

### Containers won't start
```bash
docker-compose -f docker-compose-jitsi.yml down
docker-compose -f docker-compose-jitsi.yml up -d
docker logs jitsi-meet
```

### Port 8000 already in use
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Backend won't start
```bash
# Make sure config file saved
# Restart backend:
Ctrl+C
mvn clean install
mvn spring-boot:run
```

### Still using jitsi.org link
```bash
# Create NEW event (old ones cached)
# Check backend logs for: "Generated Jitsi Meet link"
```

---

## Verify Success

All checks should pass:

```bash
# 1. Containers running
docker ps | grep jitsi
# ✅ Should show running containers

# 2. Jitsi accessible
curl http://localhost:8000/
# ✅ Should return HTML

# 3. Backend running
curl http://localhost:8443/api/v1/events
# ✅ Should work (or 401 auth)

# 4. Config updated
grep "jitsi.base-url" backend/src/main/resources/application.properties
# ✅ Should show: http://localhost:8000/
```

---

## One-Command Setup (Optional)

If you want everything at once:

```bash
cd c:\Users\ChNa395\Likitha\calendar && docker-compose -f docker-compose-jitsi.yml up -d && timeout /t 30 && cd backend && mvn clean install
```

Then manually start backend in new terminal:
```bash
cd c:\Users\ChNa395\Likitha\calendar\backend
mvn spring-boot:run
```

---

## Expected Results

After following all steps:

| Check | Result |
|-------|--------|
| Docker containers | ✅ Running (4 containers) |
| Local Jitsi | ✅ Accessible at http://localhost:8000 |
| Backend config | ✅ Updated to http://localhost:8000/ |
| Backend started | ✅ Logs show "Started Application" |
| Create event | ✅ Link shows http://localhost:8000/event-... |
| Join Meeting | ✅ Jitsi opens without timeout |
| Video/Audio | ✅ Works perfectly |

**FINAL RESULT: ✅ WORKING VIDEO CONFERENCES** 🎉

---

## Stop Everything (Later)

When you want to stop:

```bash
# Stop backend
# In Terminal 2, press: Ctrl+C

# Stop frontend
# In Terminal 3, press: Ctrl+C

# Stop Jitsi
docker-compose -f docker-compose-jitsi.yml down

# Check all stopped
docker ps
# Should be empty
```

---

## Quick Reference

| Component | Address | Status |
|-----------|---------|--------|
| Frontend | http://localhost:5173 | User interface |
| Backend | http://localhost:8443 | API server |
| Jitsi | http://localhost:8000 | Video conferences |

---

**That's it! Should work now.** 🚀

If any issues: Check troubleshooting section above.

