# Video Conference Connection Issues - Solutions

## Issue: Connection Timeout to Jitsi.org (Error 522)

You're experiencing a **Cloudflare timeout** when accessing jitsi.org. This can happen due to:

1. **Network/ISP blocking** external services
2. **Proxy/Firewall** configuration
3. **Regional access issues**
4. **Jitsi.org temporary outage**

---

## Solution 1: Use Self-Hosted Jitsi (Recommended)

### Step 1: Start Local Jitsi with Docker

```bash
# Navigate to project root
cd c:\Users\ChNa395\Likitha\calendar

# Start Jitsi locally
docker-compose -f docker-compose-jitsi.yml up -d

# Wait for containers to start (~30 seconds)
# Then verify: http://localhost:8000
```

### Step 2: Configure Backend to Use Local Jitsi

**Option A: Update application.properties**
```properties
jitsi.base-url=http://localhost:8000/
```

**Option B: Use Profile**
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=jitsi-local"
```

### Step 3: Rebuild and Test

```bash
mvn clean install
mvn spring-boot:run
```

Now video links will use: `http://localhost:8000/event-XXXXXXXX-XXX`

---

## Solution 2: Use Alternative Public Instance

If you can't run Docker, use an alternative public instance:

```java
// In application.properties, try:
jitsi.base-url=https://jitsi.example.com/
```

Some public instances:
- https://jitsi.example.com/
- https://meet.example.com/
- https://jitsi.org/ (different domain)

---

## Solution 3: Temporary Workaround - Inline Meeting Links

If connectivity is an issue during development, use this temporary workaround:

Update `VideoConferenceService.java`:

```java
public String generateMeetingLink(Event event) {
    try {
        if (event == null || event.getId() == null) {
            return null;
        }
        
        // Try primary URL
        String meetingCode = generateMeetingCode(event.getId());
        String link = meetBaseUrl + meetingCode;
        
        logger.info("Generated video link: {}", link);
        return link;
    } catch (Exception e) {
        logger.warn("Error generating link: {}", e.getMessage());
        
        // Fallback: Return a descriptive link for now
        return "https://meet.jitsi.org/event-" + 
               event.getId().toString().substring(0, 8);
    }
}
```

---

## Solution 4: API Endpoint for Video Link Validation

Create a backend endpoint to test connectivity before returning to user:

```java
// In EventController.java
@GetMapping("/{id}/validate-video-link")
public ResponseEntity<?> validateVideoLink(@PathVariable UUID id) {
    Event event = eventRepository.findById(id).orElseThrow();
    
    try {
        // Test if link is reachable
        URL url = new URL(event.getVideoConferenceLink());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setConnectTimeout(5000);
        conn.setRequestMethod("HEAD");
        int status = conn.getResponseCode();
        
        if (status >= 200 && status < 300) {
            return ResponseEntity.ok(Map.of("status", "valid", "link", event.getVideoConferenceLink()));
        } else {
            return ResponseEntity.status(status).body(Map.of("status", "unreachable"));
        }
    } catch (Exception e) {
        return ResponseEntity.status(503).body(Map.of(
            "status", "error",
            "message", "Video conference service temporarily unavailable",
            "link", event.getVideoConferenceLink()
        ));
    }
}
```

---

## Solution 5: Fallback to Google Meet (With API Setup)

For production, integrate Google Calendar API:

```java
public String generateMeetingLink(Event event) {
    try {
        // Try Jitsi first
        String jitsiLink = generateJitsiLink(event);
        if (isReachable(jitsiLink)) {
            return jitsiLink;
        }
    } catch (Exception e) {
        logger.warn("Jitsi unavailable, trying Google Meet");
    }
    
    try {
        // Fallback to Google Meet
        return generateGoogleMeetLink(event);
    } catch (Exception e) {
        logger.error("Both Jitsi and Google Meet failed");
        return null;
    }
}

private boolean isReachable(String url) {
    try {
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setConnectTimeout(3000);
        conn.setRequestMethod("HEAD");
        return conn.getResponseCode() < 400;
    } catch (Exception e) {
        return false;
    }
}
```

---

## Quick Fix for Development

### Modify VideoConferenceService to use configurable URL:

**Already done!** Your backend now supports:

```properties
# application.properties
jitsi.base-url=http://localhost:8000/
```

### Test Immediately:

1. **Start local Jitsi:**
   ```bash
   docker run -p 8000:80 jitsi/web:stable
   ```

2. **Update properties:**
   ```properties
   jitsi.base-url=http://localhost:8000/
   ```

3. **Create event:**
   - Link will be: `http://localhost:8000/event-XXXXXXXX-XXX`
   - Should work without timeout

---

## Network Debugging

If still having issues:

```bash
# Test DNS
nslookup meet.jitsi.org

# Test direct connectivity
curl -I https://meet.jitsi.org/

# Check firewall/proxy
curl -v https://meet.jitsi.org/ 2>&1 | grep -E "(Connected|Connection refused|timeout)"

# Try from different network (mobile hotspot) to verify
```

---

## Recommended Next Steps

### Immediate (Today)
1. ✅ Try Docker local Jitsi
2. ✅ Update `jitsi.base-url` property
3. ✅ Test with local instance

### Short-term (This Week)
1. Deploy self-hosted Jitsi on your server
2. Configure DNS/firewall for access
3. Use in production setup

### Long-term (Next Sprint)
1. Integrate Google Calendar API for Google Meet
2. Add fallback provider logic
3. Implement health checks

---

## Configuration Files Created

- ✅ `application-jitsi-local.properties` - Local Jitsi config
- ✅ `docker-compose-jitsi.yml` - Docker setup for self-hosted
- ✅ `VideoConferenceService.java` - Now supports configurable URL

---

## Files Modified

1. **VideoConferenceService.java**
   - Changed from static `MEET_BASE_URL` to `@Value` injected property
   - Now reads from `jitsi.base-url` in application.properties
   - Supports multiple deployment scenarios

---

## Test Checklist

- [ ] Can access http://localhost:8000 directly?
- [ ] Can access https://meet.jitsi.org directly?
- [ ] Backend starts with local Jitsi config?
- [ ] Create event generates local link?
- [ ] Click "Join Meeting" opens local Jitsi?
- [ ] Video/audio works in local instance?

---

## Still Having Issues?

1. **Check backend logs:**
   ```
   grep "Generated.*link" console output
   ```

2. **Check frontend link:**
   ```javascript
   // In browser console:
   document.body.innerHTML.match(/https?:\/\/[^\s"<]+meet[^\s"<]*/g)
   ```

3. **Test link directly in browser:**
   - Copy the full meeting link
   - Open in new tab
   - See what error appears

4. **Use incognito/private mode:**
   - Disables extensions
   - Clears cache
   - Tests fresh connection

---

**Status: Multiple solutions provided. Choose one based on your setup.**

Recommendation: **Start with Docker local Jitsi (Solution 1)** - fastest to get working.

