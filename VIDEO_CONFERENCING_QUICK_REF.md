# Quick Reference - Video Conferencing

## Current Implementation
- **Provider**: Jitsi Meet (`https://meet.jit.si/`)
- **Link Format**: `{base-url}{uuid}`
- **Example**: `https://meet.jit.si/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`

## Files
| File | Purpose |
|------|---------|
| `VideoConferenceService.java` | Generates Jitsi links with UUID |
| `application.properties` | Base URL configuration |
| `Event.java` | Stores videoConferenceLink field |
| `EventService.java` | Calls VideoConferenceService after event creation |

## Configuration
```properties
jitsi.base-url=https://meet.jit.si/
```

## Code Flow
```
User creates event
    ↓
EventService.saveEvent()
    ↓
VideoConferenceService.generateMeetingLink()
    ↓
Generate UUID → Build URL → Return link
    ↓
Persist to database
    ↓
Send to frontend/email
    ↓
User clicks link → Opens Jitsi
```

## Key Features
✅ One-liner link generation  
✅ No API keys needed  
✅ Works immediately  
✅ Scalable (1000+ users)  
✅ Self-hostable  

## To Change Jitsi Instance
Update in `application.properties`:
```properties
jitsi.base-url=https://your-instance.com/
```

## Deploy Self-Hosted Jitsi
```bash
docker run -d -p 8000:80 \
  --name jitsi \
  jitsi/web
```
Then update `jitsi.base-url=http://localhost:8000/`
