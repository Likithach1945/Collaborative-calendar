# Video Conference Link Error - Root Cause & Solutions

## Problem
When clicking "Join Meeting", Google Meet displays the error:
```
Check your meeting code
Make sure that you've entered the correct meeting code in the URL, e.g. https://meet.google.com/xxx-yyyy-zzz
```

## Root Cause
The current implementation **generates arbitrary meeting codes** that are NOT valid Google Meet codes. The codes are created from the event UUID but don't follow Google Meet's actual code generation rules or require authentication through Google's API.

**Current implementation example:**
```
Generated code: abc-defg-hij123
Full URL: https://meet.google.com/abc-defg-hij123
Result: ❌ Invalid - Google Meet rejects this code
```

## Solutions

### Solution 1: Google Calendar API Integration (Recommended for Production)
**Best long-term approach** - Integrate with Google Calendar API to create real video conference links.

**Steps:**
1. Implement Google Calendar API integration
2. When creating an event, use `conferenceData.createRequest`:
   ```java
   ConferenceData conferenceData = new ConferenceData();
   ConferenceRequest request = new ConferenceRequest();
   request.setRequestId(UUID.randomUUID().toString());
   request.setConferenceSolutionKey(new ConferenceSolutionKey());
   request.getConferenceSolutionKey().setConferenceSolution("eventHangout");
   conferenceData.setCreateRequest(request);
   event.setConferenceData(conferenceData);
   ```
3. Google Calendar API will generate and return a valid Meet link
4. Store this link in the database

**Pros:**
- ✅ Google generates real, valid meeting links
- ✅ Automatically creates the actual Google Meet space
- ✅ Handles authentication and authorization
- ✅ Production-ready

**Cons:**
- ❌ Requires Google API credentials
- ❌ Requires OAuth2 setup
- ❌ Additional API calls = slightly slower

---

### Solution 2: Use Jitsi Meet (Open Source Alternative)
**Faster to implement** - Use an open-source video conferencing platform.

**Implementation:**
```java
private String generateMeetingLink(Event event) {
    String meetingCode = generateUniqueMeetingCode();
    String link = "https://meet.jitsi.org/" + meetingCode;
    // Optional: Use your own Jitsi instance
    // String link = "https://your-jitsi-instance.com/" + meetingCode;
    return link;
}
```

**Pros:**
- ✅ Works immediately without API setup
- ✅ Open source and self-hostable
- ✅ No authentication required for basic usage
- ✅ Free to use

**Cons:**
- ❌ Not Google Meet (users familiar with Google Meet might prefer it)
- ❌ Requires public Jitsi instance or self-hosting

---

### Solution 3: Generate Room URLs for External Integration
**Hybrid approach** - Generate standardized URLs for different services.

**Implementation:**
```java
public enum VideoConferenceProvider {
    GOOGLE_MEET("https://meet.google.com/"),
    JITSI("https://meet.jitsi.org/"),
    ZOOM("https://zoom.us/j/");
    
    private final String baseUrl;
    VideoConferenceProvider(String baseUrl) {
        this.baseUrl = baseUrl;
    }
    public String getBaseUrl() { return baseUrl; }
}

public String generateMeetingLink(Event event, VideoConferenceProvider provider) {
    String roomCode = UUID.randomUUID().toString()
        .replace("-", "")
        .substring(0, 10)
        .toLowerCase();
    
    if (provider == VideoConferenceProvider.GOOGLE_MEET) {
        // Format: abc-defg-hij (Google Meet format)
        return provider.getBaseUrl() + 
            roomCode.substring(0, 3) + "-" + 
            roomCode.substring(3, 7) + "-" + 
            roomCode.substring(7);
    }
    return provider.getBaseUrl() + roomCode;
}
```

**Pros:**
- ✅ Flexible - can support multiple providers
- ✅ Easy to switch providers
- ✅ Generator creates unique codes

**Cons:**
- ❌ Google Meet codes still won't be "real" without API
- ❌ Requires user management for provider selection

---

### Solution 4: Backend + Frontend URL Strategy (Current Fix)
**Immediate workaround** - Use a backend endpoint to handle redirects.

**Implementation:**

**Backend:**
```java
@GetMapping("/api/v1/events/{id}/join-meeting")
public RedirectView joinMeeting(@PathVariable UUID id) {
    Event event = eventRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    
    if (event.getVideoConferenceLink() == null) {
        return new RedirectView("/events/" + id + "?error=no-meeting");
    }
    
    return new RedirectView(event.getVideoConferenceLink());
}
```

**Frontend:**
```jsx
<button
  onClick={() => {
    if (event.videoConferenceLink) {
      // Route through backend endpoint for logging/tracking
      window.location.href = `/api/v1/events/${event.id}/join-meeting`;
    }
  }}
>
  Join Meeting
</button>
```

**Pros:**
- ✅ Server-side tracking of meeting joins
- ✅ Can add logging and analytics
- ✅ Easier to switch providers later

**Cons:**
- ❌ Google Meet codes still invalid without API

---

## Recommended Implementation Order

### Immediate (This Sprint)
1. **Implement Solution 4** (Backend redirect endpoint)
2. Add logging to track meeting link usage
3. Add frontend validation for link format

### Short-term (Next Sprint)
1. **Switch to Jitsi Meet** (Solution 2) for working MVP
2. Test with real video conferencing
3. Get user feedback

### Long-term (Future)
1. **Integrate Google Calendar API** (Solution 1)
2. Generate real Google Meet links
3. Production-ready implementation

---

## Current Code Changes

### Backend Changes
**File:** `backend/src/main/java/com/example/calendar/events/VideoConferenceService.java`

Added:
- ✅ Better documentation
- ✅ Random suffix for collision avoidance
- ✅ Notes about Google API integration
- ✅ Enhanced logging

### Frontend Changes
**File:** `frontend/src/components/EventDetailModal.jsx`

Added:
- ✅ Link validation on click
- ✅ Display meeting link as code
- ✅ Error handling for invalid links
- ✅ User feedback

---

## Testing

### To Test Current Implementation

**Expected Behavior:**
1. Create an event with video conference
2. Meeting link is generated: `https://meet.google.com/abc-defg-hij123`
3. When clicking "Join Meeting", opens the link
4. **Result:** Google Meet shows "Check your meeting code" error

**Reason:** The code `abc-defg-hij123` is not a real Google Meet code generated by Google's infrastructure.

### To Test After Jitsi Integration

1. Update `VideoConferenceService`:
```java
private static final String MEET_BASE_URL = "https://meet.jitsi.org/";
```

2. Create an event
3. Click "Join Meeting"
4. **Expected Result:** ✅ Real Jitsi video conference room opens

---

## Database Migration

If switching from Google Meet to Jitsi:
```sql
-- Update existing links in database
UPDATE events 
SET video_conference_link = REPLACE(
    video_conference_link, 
    'https://meet.google.com/', 
    'https://meet.jitsi.org/'
)
WHERE video_conference_link IS NOT NULL 
AND video_conference_link LIKE '%meet.google.com%';
```

---

## References

1. **Google Calendar API - Conference Data**
   - https://developers.google.com/calendar/api/guides/create-events#conference_data
   
2. **Jitsi Meet**
   - https://jitsi.org/
   - https://github.com/jitsi/jitsi-meet
   
3. **Google Meet API**
   - https://developers.google.com/meet/api/guides/meeting-codes
   - Note: Google Meet doesn't have a public API for generating meeting links without Calendar API

---

## Summary

The error occurs because we're generating **fake Google Meet codes** without Google API integration. 

**Quick Fix:** Update frontend to show the generated link and use Jitsi instead.

**Proper Fix:** Integrate Google Calendar API to generate real meeting links.
