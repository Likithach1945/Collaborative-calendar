# 🚀 Quick Start Guide - Development

## Running the Application

### Prerequisites
- ✅ Java 17+ installed
- ✅ Node.js 20+ installed
- ✅ MySQL 8.0 running on localhost:3306
- ✅ Database `calendardb` created

### Start Backend (Terminal 1)
```bash
cd backend
mvn spring-boot:run
```
**Expected**: Server starts on http://localhost:8443

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
**Expected**: Dev server starts on http://localhost:5173

---

## 📋 Common Tasks

### Adding Timezone Display to New Component

```jsx
import { formatInTimeZone } from 'date-fns-tz';
import TimezoneInfo from './TimezoneInfo';
import { useAuth } from '../contexts/AuthContext';

function MyComponent({ event }) {
  const { user } = useAuth();
  const userTimezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  return (
    <div>
      {/* Display time in user's timezone */}
      <p>
        {formatInTimeZone(
          new Date(event.startDateTime), 
          userTimezone, 
          'PPP p'
        )}
      </p>
      
      {/* Show timezone info if different */}
      <TimezoneInfo
        startDateTime={event.startDateTime}
        endDateTime={event.endDateTime}
        organizerTimezone={event.timezone}
        viewerTimezone={userTimezone}
        compact={true}
      />
    </div>
  );
}
```

### Adding Avatar to New Component

```jsx
import Avatar from './Avatar';

function MyComponent({ user, event }) {
  return (
    <div>
      {/* User avatar */}
      <Avatar 
        name={user.displayName} 
        email={user.email}
        size={40}
      />
      
      {/* Organizer avatar */}
      <Avatar 
        name={event.organizerName} 
        email={event.organizerEmail}
        size={32}
      />
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: "Port 8443 already in use"
```bash
# Windows - Find and kill process
netstat -ano | findstr :8443
taskkill /PID <PID> /F
```

**Problem**: "LazyInitializationException"
- ✅ **Fixed**: Using JOIN FETCH in queries
- Ensure EventRepository uses `findByIdWithOrganizer()`

**Problem**: MapStruct not generating code
```bash
cd backend
mvn clean compile -DskipTests
```

### Frontend Issues

**Problem**: Timezone not displaying
- Check user.timezone is set in user object
- Verify event.timezone is present in API response
- Check browser console for date-fns-tz errors

**Problem**: Avatar colors not consistent
- Avatar uses email/name hash for color consistency
- Same email always gets same color

**Problem**: TimezoneInfo not showing
- Only shows when organizer.timezone !== viewer.timezone
- Check both timezone values are valid IANA strings

---

## 📦 Dependencies

### Backend (pom.xml)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
</dependency>
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "date-fns": "^2.30.0",
    "date-fns-tz": "^2.0.0",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0"
  }
}
```

---

## 🧪 Testing

### Manual Test Scenarios

**Test 1: Same Timezone**
1. Login as User A (timezone: EST)
2. Create event for 2:00 PM
3. Login as User B (timezone: EST)
4. View invitation - should show 2:00 PM
5. Verify NO TimezoneInfo component displayed

**Test 2: Different Timezone**
1. Login as User A (timezone: PST)
2. Create event for 2:00 PM PST
3. Login as User B (timezone: EST)
4. View invitation - should show 5:00 PM EST
5. Verify TimezoneInfo shows both timezones

**Test 3: Date Change**
1. Login as User A (timezone: IST)
2. Create event for 11:00 PM IST
3. Login as User B (timezone: PST)
4. Should show 10:30 AM PST (previous day)
5. Verify correct date displayed

---

## 🎨 Styling Guide

### Color Palette (Google Calendar Theme)
```javascript
const colors = {
  primary: '#1a73e8',      // Blue
  success: '#34a853',      // Green
  danger: '#ea4335',       // Red
  warning: '#f9ab00',      // Yellow
  background: '#ffffff',
  textPrimary: '#202124',
  textSecondary: '#5f6368',
  border: '#dadce0',
};
```

### Avatar Colors (10 Colors)
```javascript
const avatarColors = [
  '#1a73e8', '#ea4335', '#34a853', '#f9ab00',
  '#9334e6', '#e37400', '#46bdc6', '#7986cb',
  '#f06292', '#aed581'
];
```

### Spacing (8px grid)
```css
padding: 8px;   /* Small */
padding: 16px;  /* Medium */
padding: 24px;  /* Large */
gap: 8px;       /* Small gap */
gap: 12px;      /* Medium gap */
```

---

## 🔐 Security Notes

### JWT Authentication
- Tokens expire after 24 hours
- Stored in localStorage
- Sent in Authorization header: `Bearer <token>`

### OAuth2 (Google)
- Configured in application.properties
- Redirect URI: http://localhost:5173/auth/callback
- Scopes: profile, email

### CORS
- Allowed origin: http://localhost:5173
- Credentials: true
- Methods: GET, POST, PUT, DELETE, OPTIONS

---

## 📊 Database Schema

### Key Tables

**events**
```sql
id              UUID PRIMARY KEY
organizer_id    UUID NOT NULL
title           VARCHAR(255)
start_date_time TIMESTAMP      -- UTC
end_date_time   TIMESTAMP      -- UTC
timezone        VARCHAR(50)    -- Organizer's timezone
...
```

**users**
```sql
id           UUID PRIMARY KEY
email        VARCHAR(255) UNIQUE
display_name VARCHAR(255)
timezone     VARCHAR(50)         -- User's preferred timezone
...
```

**invitations**
```sql
id            UUID PRIMARY KEY
event_id      UUID
recipient_id  UUID
status        VARCHAR(20)        -- PENDING, ACCEPTED, DECLINED
...
```

---

## 🌍 Timezone Data

### IANA Timezone Examples
```
America/New_York    (EST/EDT)
America/Los_Angeles (PST/PDT)
Europe/London       (GMT/BST)
Asia/Kolkata        (IST)
Australia/Sydney    (AEST/AEDT)
```

### Getting User Timezone
```javascript
// Browser default
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// From user profile
const timezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
```

---

## 📁 Project Structure

```
calendar/
├── backend/
│   ├── src/main/java/com/example/calendar/
│   │   ├── auth/           # Authentication
│   │   ├── events/         # Event management
│   │   ├── invitations/    # Invitation system
│   │   └── config/         # Configuration
│   └── src/main/resources/
│       └── db/migration/   # Flyway migrations
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Avatar.jsx
│   │   │   └── TimezoneInfo.jsx
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Utility functions
│   │       └── dateTime.js # Timezone utilities
│   └── package.json
│
└── Documentation/
    ├── TIMEZONE_IMPLEMENTATION.md
    ├── TIMEZONE_VISUAL_GUIDE.md
    └── IMPLEMENTATION_SUMMARY.md
```

---

## 🚨 Important Notes

### DO's
✅ Always store times as UTC in database  
✅ Always convert to user's timezone for display  
✅ Use `formatInTimeZone` for timezone-aware formatting  
✅ Use JOIN FETCH to prevent lazy loading issues  
✅ Test with different timezones  

### DON'Ts
❌ Don't store local times in database  
❌ Don't forget timezone parameter in formatInTimeZone  
❌ Don't hardcode timezone values  
❌ Don't assume all users are in same timezone  
❌ Don't use plain `format()` for event times  

---

## 🆘 Getting Help

### Resources
- **Date-fns-tz Docs**: https://date-fns.org/docs/Time-Zones
- **MapStruct Docs**: https://mapstruct.org/
- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **React Docs**: https://react.dev/

### Internal Documentation
- `TIMEZONE_IMPLEMENTATION.md` - Technical details
- `TIMEZONE_VISUAL_GUIDE.md` - Visual examples
- `IMPLEMENTATION_SUMMARY.md` - Overview

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No console errors
- [ ] No build warnings (critical ones)
- [ ] Code reviewed

### Functionality
- [ ] Create event works
- [ ] View event in different timezone works
- [ ] Invitations display correctly
- [ ] Time proposals work
- [ ] Avatars display consistently

### Performance
- [ ] Page load time < 3s
- [ ] No memory leaks
- [ ] Database queries optimized
- [ ] Images/assets optimized

### Security
- [ ] JWT validation working
- [ ] OAuth2 configured correctly
- [ ] CORS properly configured
- [ ] SQL injection protected (JPA)

---

**Happy Coding!** 🎉

For questions or issues, refer to the documentation files in the root directory.
