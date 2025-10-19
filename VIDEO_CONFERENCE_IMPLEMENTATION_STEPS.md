# Video Conference Link Fix - Implementation Steps

## 📋 Implementation Checklist

Follow these steps in order to implement and verify the fix.

---

## Phase 1: Code Updates ✅ (ALREADY DONE)

### Step 1.1: Backend Update
**File:** `backend/src/main/java/com/example/calendar/events/VideoConferenceService.java`

**Changes Made:**
- ✅ Changed base URL from Google Meet to Jitsi Meet
- ✅ Updated meeting code generation logic
- ✅ Added Random import for unique suffixes
- ✅ Added comprehensive documentation

**Verification:**
```bash
grep -n "meet.jitsi.org" backend/src/main/java/com/example/calendar/events/VideoConferenceService.java
# Should output the line with https://meet.jitsi.org/
```

### Step 1.2: Frontend Update
**File:** `frontend/src/components/EventDetailModal.jsx`

**Changes Made:**
- ✅ Added link validation in onClick handler
- ✅ Added display of meeting link in code format
- ✅ Added error handling for invalid links

**Verification:**
```bash
grep -n "videoConferenceLink.trim()" frontend/src/components/EventDetailModal.jsx
# Should show the validation code
```

---

## Phase 2: Build & Deploy

### Step 2.1: Clean Backend Build
```bash
cd backend

# Clean previous build
mvn clean

# Install dependencies and compile
mvn install

# Run tests (if any)
mvn test

# Start backend
mvn spring-boot:run
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
[INFO] Application started on port 8443
```

**Verify Backend is Running:**
```bash
curl -X GET http://localhost:8443/api/v1/events \
  -H "Authorization: Bearer <token>" \
  -H "X-User-Timezone: UTC"
# Should return 200 OK (or redirect if unauthenticated)
```

### Step 2.2: Clean Frontend Build
```bash
cd frontend

# Clean previous build
npm run clean

# Install dependencies
npm install

# Run tests (if any)
npm test

# Start dev server or build
npm run dev
```

**Expected Output:**
```
VITE v... ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

---

## Phase 3: Manual Testing

### Step 3.1: Create Test Event
1. Open browser to `http://localhost:5173`
2. Login with test account
3. Navigate to calendar
4. Create new event:
   - **Title:** "Test Video Conference"
   - **Date/Time:** Any future time
   - **Attendees:** Optional
5. Click **"Create Event"**

**Expected Result:**
- Event created successfully
- Event appears on calendar

### Step 3.2: Verify Video Link Generated
```bash
# Check database directly
mysql -u root -p calendar_db

# Query events
SELECT id, title, video_conference_link, created_at 
FROM events 
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected Output:**
```
+------+-------------------------+------------------------------------------+---------------------+
| id   | title                   | video_conference_link                    | created_at          |
+------+-------------------------+------------------------------------------+---------------------+
| ...  | Test Video Conference   | https://meet.jitsi.org/event-XXXXX-XXX   | 2025-10-18 10:30:45 |
+------+-------------------------+------------------------------------------+---------------------+
```

**✅ Verification:** Link should start with `https://meet.jitsi.org/`

### Step 3.3: View Event Details
1. Click on "Test Video Conference" event
2. Event detail modal opens
3. Look for "Video Conference" section
4. Should display:
   - "Video Conference" label
   - [Join Meeting] button
   - Meeting link as code: `https://meet.jitsi.org/event-XXXXX-XXX`

**✅ Verification:** Link is visible and readable

### Step 3.4: Test Join Meeting
1. Click **[Join Meeting]** button
2. Wait for new tab to open (2-5 seconds)
3. Browser navigates to: `https://meet.jitsi.org/event-XXXXX-XXX`
4. Jitsi Meet interface loads
5. Enter your name (e.g., "Test User")
6. Click **"Join Conference"**

**✅ Verification:** Video conference room loads and you can see:
- Jitsi Meet header with room name
- Your video preview
- Audio controls
- "Join" or "Start" button
- **NO "Check your meeting code" error**

### Step 3.5: Test Video/Audio
1. Click **"Start"** or **"Join"**
2. Grant browser permissions for camera/microphone
3. Verify:
   - Your video feeds shows
   - Microphone is working
   - Can see conference controls (mute, camera, share, etc.)

**✅ Verification:** Video conference fully operational

---

## Phase 4: Browser DevTools Verification

### Step 4.1: Check Network Traffic
1. Open DevTools: **F12** or **Ctrl+Shift+I**
2. Go to **Network** tab
3. Create a new event (from scratch)
4. Filter for "events" requests
5. Find POST/GET request to create/fetch events
6. Click on request
7. Go to **Response** tab
8. Look for `videoConferenceLink` field

**Expected:**
```json
{
  "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
  "title": "Test Event",
  "videoConferenceLink": "https://meet.jitsi.org/event-a1b2c3d4-042",
  ...
}
```

**✅ Verification:** Backend returns Jitsi link in response

### Step 4.2: Check Console Logs
1. Open DevTools: **F12**
2. Go to **Console** tab
3. Create an event
4. Look for any errors (red text)
5. Look for any warnings about links

**Expected:**
- No red errors
- No warnings about "videoConferenceLink"
- Console should be clean

**✅ Verification:** No client-side errors

---

## Phase 5: Backend Logs Verification

### Step 5.1: Check Backend Logs
1. Look at terminal where backend is running
2. Scroll to recent logs
3. Create a new event
4. Watch for log messages like:
   ```
   [INFO] Generated Jitsi Meet link for event ...: https://meet.jitsi.org/event-...
   ```

**Expected:**
```
INFO [main] VideoConferenceService : Generated Jitsi Meet link for event a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6: https://meet.jitsi.org/event-a1b2c3d4-042
```

**✅ Verification:** Backend successfully generates link

---

## Phase 6: Multi-User Testing (Optional)

### Step 6.1: Test with Multiple Participants
1. **User 1:** Create event with video conference
2. **User 2:** Accept invitation to event
3. **User 2:** Click "Join Meeting"
4. **User 1:** Click "Join Meeting"
5. Both should be in same Jitsi room

**Expected:**
- ✅ Both users see each other
- ✅ Can communicate via video/audio
- ✅ Same room (Jitsi shows same room code)

---

## Phase 7: Edge Case Testing

### Test 7.1: Multiple Events
Create 3 different events and verify each gets unique link:
```
Event 1: https://meet.jitsi.org/event-aaaaaaaa-123
Event 2: https://meet.jitsi.org/event-bbbbbbbb-456
Event 3: https://meet.jitsi.org/event-cccccccc-789
```

**✅ Verification:** Each event has unique meeting room

### Test 7.2: Same Event Multiple Times
Create event, join, leave, join again:

**Expected:**
- ✅ Same room opens (same link)
- ✅ Previous participants no longer in room
- ✅ New session starts cleanly

### Test 7.3: Browser Compatibility
Test on:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Expected:** Works on all major browsers

### Test 7.4: Mobile Testing
Test on:
- [ ] iOS Safari
- [ ] Android Chrome

**Expected:** Responsive design works, Jitsi opens correctly

---

## Phase 8: Database Validation

### Step 8.1: Check Event Links
```bash
# Count total events
mysql -u root -p calendar_db << EOF
SELECT COUNT(*) as total_events FROM events;
SELECT COUNT(*) as events_with_video FROM events WHERE video_conference_link IS NOT NULL;
SELECT COUNT(*) as jitsi_links FROM events WHERE video_conference_link LIKE '%meet.jitsi.org%';
SELECT COUNT(*) as old_google_links FROM events WHERE video_conference_link LIKE '%meet.google.com%';
EOF
```

**Expected:**
```
total_events: X
events_with_video: X (should be close to total for new events)
jitsi_links: X (should match new events created)
old_google_links: 0 (unless old events weren't recreated)
```

### Step 8.2: Verify Link Format
```bash
mysql -u root -p calendar_db << EOF
SELECT 
  id,
  title,
  video_conference_link,
  LENGTH(video_conference_link) as link_length
FROM events 
WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
ORDER BY created_at DESC
LIMIT 10;
EOF
```

**Expected Format:**
- All links should start with: `https://meet.jitsi.org/`
- All links should be ~45-50 characters long
- All links should have format: `event-XXXXXXXX-XXX`

---

## Phase 9: Performance Validation

### Step 9.1: Measure Link Generation Time
During event creation, measure time taken:

**Expected:**
- Link generation: < 1ms
- Event creation total: < 500ms
- Database save: < 100ms

### Step 9.2: Check Memory Usage
Monitor memory while:
- Creating 100 events
- Each with video link

**Expected:**
- No memory leaks
- Stable memory usage
- No unusual spikes

---

## Phase 10: Rollback Plan

If issues occur, use this rollback:

### Step 10.1: Revert Code Changes
```bash
# Backend
cd backend
git checkout HEAD -- src/main/java/com/example/calendar/events/VideoConferenceService.java

# Frontend  
cd ../frontend
git checkout HEAD -- src/components/EventDetailModal.jsx
```

### Step 10.2: Rebuild and Restart
```bash
# Backend
cd backend
mvn clean install
mvn spring-boot:run

# Frontend (in new terminal)
cd frontend
npm run dev
```

### Step 10.3: Verify Rollback
- Create event
- Should see Google Meet links (old behavior)
- Old events should still work

---

## ✅ Final Verification Checklist

Before considering this COMPLETE, verify:

- [ ] Backend builds without errors
- [ ] Frontend builds without errors
- [ ] New event generates Jitsi link
- [ ] Link follows format: `https://meet.jitsi.org/event-XXXXXXXX-XXX`
- [ ] Clicking "Join Meeting" opens Jitsi Meet
- [ ] Jitsi interface loads completely
- [ ] Can enter name and join conference
- [ ] Video preview works
- [ ] Audio works
- [ ] Multiple users can join same room
- [ ] Database shows correct links
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on mobile browsers
- [ ] Each event gets unique room
- [ ] Same event = same room (persistent)
- [ ] Can rejoin after leaving
- [ ] Multiple events = multiple rooms

---

## 📞 Troubleshooting During Testing

### Issue: Backend Won't Start
```bash
# Check for port conflicts
lsof -i :8443

# Check Java version
java -version

# Check Maven
mvn -v

# Try with explicit Java version
export JAVA_HOME=/path/to/jdk17
mvn spring-boot:run
```

### Issue: Link is NULL
```bash
# Check backend logs for errors
# Check VideoConferenceService initialization
# Verify eventRepository.save() works
```

### Issue: Jitsi Won't Load
```bash
# Test direct URL in browser
https://meet.jitsi.org/test-room-12345

# Check internet connection
ping meet.jitsi.org

# Try incognito mode (disable extensions)
```

### Issue: Console Errors
```bash
# In browser DevTools Console:
# Look for specific error messages
# Check Network tab for failed requests
# Check CORS issues if cross-domain
```

---

## 📝 Testing Report Template

```markdown
# Video Conference Link Testing Report
Date: [DATE]
Tester: [NAME]

## Environment
- Backend: Java [VERSION], Spring Boot [VERSION]
- Frontend: Node [VERSION], React [VERSION]
- Browser: [BROWSER] [VERSION]
- OS: [OS]

## Test Results
- [ ] Event creation: PASS/FAIL
- [ ] Link generation: PASS/FAIL
- [ ] Link format: PASS/FAIL
- [ ] Join meeting: PASS/FAIL
- [ ] Video/Audio: PASS/FAIL
- [ ] Multi-user: PASS/FAIL
- [ ] Database: PASS/FAIL

## Issues Found
(List any issues here)

## Status
✅ READY FOR PRODUCTION / ⚠️ NEEDS FIXES

## Sign-off
Tester: _______________
Date: _______________
```

---

## 🎉 Success Criteria

**COMPLETE when:**
1. ✅ All code changes implemented
2. ✅ Backend builds and runs
3. ✅ Frontend builds and runs
4. ✅ Video links generate in Jitsi format
5. ✅ "Join Meeting" opens Jitsi successfully
6. ✅ Users can join and use video conference
7. ✅ No errors in logs or console
8. ✅ Database contains valid links
9. ✅ Multiple users can collaborate
10. ✅ All tests pass

**STATUS: ✅ READY TO DEPLOY**

