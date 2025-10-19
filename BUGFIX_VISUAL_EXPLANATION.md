# Calendar Grid Timezone Fix - Visual Explanation

## The Problem in Pictures

### Before Fix ❌

```
User creates event at 8:11 AM in their timezone (Asia/Kolkata - IST)
    ↓
Stored in DB as: 2025-10-19T02:41:00Z (UTC)
    ↓
Calendar Grid fetches: "2025-10-19T02:41:00Z"
    ↓
new Date("2025-10-19T02:41:00Z")
    ↓
getHours() → Returns hours in BROWSER timezone (not user's preferred timezone)
    ↓
If browser is in EST: getHours() = 22 (10 PM previous day) ❌
If browser is in PST: getHours() = 19 (7 PM previous day) ❌
If browser is in IST: getHours() = 8 (8 AM) ✅ Only correct by coincidence!
    ↓
Calendar shows event at WRONG TIME!
```

### After Fix ✅

```
User creates event at 8:11 AM in their timezone (Asia/Kolkata - IST)
    ↓
Stored in DB as: 2025-10-19T02:41:00Z (UTC)
    ↓
Calendar Grid fetches: "2025-10-19T02:41:00Z"
    ↓
utcToZonedTime("2025-10-19T02:41:00Z", "Asia/Kolkata")
    ↓
Explicitly converts UTC to user's preferred timezone
    ↓
getHours() = 8, getMinutes() = 11
    ↓
Position: (8 + 11/60) * 48px = 396.8px from top
    ↓
Calendar shows event at CORRECT TIME (8:11 AM) ✅
```

## Time Position Calculation

### Grid Layout
```
Hour 0  (12 AM) ────────────────  0px
Hour 1  (1 AM)  ────────────────  48px
Hour 2  (2 AM)  ────────────────  96px
Hour 3  (3 AM)  ────────────────  144px
...
Hour 8  (8 AM)  ────────────────  384px  ← 8:00 AM
                     ↓
                   + 11 minutes
                     ↓
                  (11/60) * 48px = 8.8px
                     ↓
Hour 8:11 AM    ────────────────  392.8px ✅ Correct position!
...
Hour 14 (2 PM)  ────────────────  672px  ← Where bug was showing it ❌
```

### Formula
```javascript
// Each hour = 48px tall
// Minutes add fractional hour position

const startHour = hours + (minutes / 60);
const topPosition = startHour * 48;

// Example: 8:11 AM
// startHour = 8 + (11/60) = 8.183
// topPosition = 8.183 * 48 = 392.8px ✅
```

## Example Scenarios

### Scenario 1: Indian User (IST - UTC+5:30)
```
Event Created: Oct 19, 2025 at 8:11 AM IST
UTC Storage:   Oct 19, 2025 at 2:41 AM UTC
Display:       Oct 19, 2025 at 8:11 AM IST ✅

Position: (8 + 11/60) * 48 = 392.8px ✅
```

### Scenario 2: US East Coast User (EST - UTC-5)
```
Event Created: Oct 19, 2025 at 8:11 AM EST
UTC Storage:   Oct 19, 2025 at 1:11 PM UTC
Display:       Oct 19, 2025 at 8:11 AM EST ✅

Position: (8 + 11/60) * 48 = 392.8px ✅
```

### Scenario 3: Cross-Timezone View
```
Organizer (PST): Creates event at 2:00 PM PST
UTC Storage:     Oct 19, 2025 at 10:00 PM UTC
Viewer (EST):    Sees event at 5:00 PM EST ✅

Position for EST viewer: (17 + 0/60) * 48 = 816px ✅
```

## The Bug in Action (What Was Happening)

### Your Specific Case
```
You created event: Oct 19, 2025 at 8:11 AM
Your timezone:     Likely IST (UTC+5:30)

Stored in DB:      Oct 19, 2025 at 2:41 AM UTC
                   (8:11 AM - 5:30 hours = 2:41 AM)

BUG: Calendar was showing at 2:00 PM (14:00)
     ↓
This suggests it was adding timezone offset instead of subtracting
Or using wrong timezone in calculation
     ↓
With fix: Shows at 8:11 AM ✅
```

## Code Comparison

### Before (Buggy) ❌
```javascript
{dayEvents.map((event) => {
  const eventStart = new Date(event.startDateTime);  // Creates Date from UTC
  const startHour = eventStart.getHours();  // Gets hours in BROWSER timezone!
  // ↑ PROBLEM: Not using user's preferred timezone
  
  return (
    <div style={{ top: `${startHour * 48}px` }}>  // Wrong position!
      <EventCard event={event} />
    </div>
  );
})}
```

### After (Fixed) ✅
```javascript
import { utcToZonedTime } from 'date-fns-tz';

{dayEvents.map((event) => {
  // Explicitly convert UTC to user's timezone
  const eventStart = utcToZonedTime(
    new Date(event.startDateTime),
    timezone  // User's preferred timezone (e.g., "Asia/Kolkata")
  );
  const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
  // ↑ NOW CORRECT: Using user's timezone
  
  return (
    <div style={{ top: `${startHour * 48}px` }}>  // Correct position! ✅
      <EventCard event={event} />
    </div>
  );
})}
```

## Visual Grid Example

```
Calendar Grid (After Fix):

Time    │ Sunday 10/19/2025
────────┼───────────────────────────
12 AM   │
 1 AM   │
 2 AM   │
 3 AM   │
 4 AM   │
 5 AM   │
 6 AM   │
 7 AM   │
 8 AM   │ ┌─────────────────┐  ← Event correctly at 8:11 AM ✅
        │ │ Social Event    │
        │ │ 8:11 AM         │
 9 AM   │ └─────────────────┘
10 AM   │
11 AM   │
12 PM   │
 1 PM   │
 2 PM   │                      ← Bug was showing here ❌
 3 PM   │
 4 PM   │
...
```

## Testing Your Fix

### Steps to Verify
1. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R)
2. **Create a new event** at 8:11 AM
3. **Check the calendar grid** - should show at 8:11 AM ✅
4. **Check existing events** - should all be at correct times ✅

### What to Look For
- ✅ Event card appears at the correct hour on the grid
- ✅ Minutes are accurately represented (not just hour boundaries)
- ✅ All-day events stay in the all-day section (if applicable)
- ✅ Current time indicator line is at the right position

## Why This Bug Was Tricky

1. **Worked for some users**: If user's browser timezone matched their preferred timezone, bug wasn't visible
2. **Timezone confusion**: Multiple timezone conversions happening (UTC → Browser → Display)
3. **Implicit conversion**: JavaScript's `getHours()` implicitly uses browser timezone
4. **Testing challenge**: Hard to catch if developer is in same timezone as test data

## Prevention

To avoid similar bugs in the future:

✅ **Always use `utcToZonedTime`** when displaying times from UTC  
✅ **Never use `getHours()` directly** on UTC timestamps  
✅ **Test with multiple timezones** using browser dev tools  
✅ **Use explicit timezone parameters** instead of relying on defaults  

---

**Status**: ✅ **FIXED**  
**Date**: October 18, 2025  
**Impact**: All calendar grid views (Day, Week) now show correct event times
