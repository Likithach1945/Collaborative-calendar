# Cross-Timezone Meeting Scheduler Guide

## How It Works in Our Calendar App

Our calendar app already handles cross-timezone meetings similar to Microsoft Teams. Here's how it works:

### For User A in India (Asia/Kolkata):

1. **Creating an event:**
   - User A selects their local time (e.g., 3:00 PM IST)
   - The system stores this in UTC (e.g., 9:30 AM UTC)
   - User A can see a timezone preview showing how it appears for participants in different timezones

2. **Inviting participants:**
   - When User A adds participant emails (e.g., User B in London), invitations are sent
   - The invitation contains the UTC time, which is the source of truth

### For User B in London (Europe/London):

1. **Receiving an invitation:**
   - User B receives the invitation with the event in UTC
   - The calendar app automatically converts this to London time (e.g., 10:30 AM BST)

2. **Viewing the calendar:**
   - User B sees the event at 10:30 AM in their local time
   - The event appears in the correct position in their calendar grid
   - The city name "London" appears beneath the time

## Testing Cross-Timezone Functionality

### Method 1: DevTools Location Override

1. **Create an event in one timezone:**
   - Set DevTools timezone to Mumbai (IST)
   - Create an event for 3:00 PM
   - Note the timezone preview showing times in other zones

2. **View the event in another timezone:**
   - Change DevTools timezone to London
   - Refresh the page
   - The event should now show at ~10:30 AM with "London" beneath it

### Method 2: Simulating Two Users

1. **First browser (User A in India):**
   - Regular browser with no timezone override
   - Create an event at 3:00 PM
   - Add a test participant email

2. **Second browser in private/incognito mode (User B in London):**
   - Use DevTools to set timezone to Europe/London
   - Log in with the participant email
   - Event should appear at ~10:30 AM London time

## Behind the Scenes

The calendar system uses three key functions to handle timezones:

1. **zonedTimeToUtc:**
   ```javascript
   // Converting from local time to UTC for storage
   const startUTC = zonedTimeToUtc(startLocal, userTimezone);
   ```

2. **utcToZonedTime:**
   ```javascript
   // Converting UTC back to local time for display
   const localTime = utcToZonedTime(utcTime, userTimezone);
   ```

3. **formatInTimeZone:**
   ```javascript
   // Formatting a date in a specific timezone
   formatInTimeZone(date, timezone, 'EEE, MMM d, h:mm a');
   ```

## Timezone Preview Feature

When creating an event with participants, our system shows a "Timezone Preview" that displays:

1. How the meeting time appears in major timezones
2. Clear indicators when the meeting is on a different day in another timezone
3. Regional grouping to easily scan times by continent

This helps schedulers pick appropriate times that work for global participants.

## Technical Implementation

1. **Storage:** All event times are stored in UTC on the server
2. **Display:** Times are converted to the user's local timezone for display
3. **User Timezone:** Determined from:
   - User's profile setting
   - Browser timezone detection (fallback)
4. **Conversion:** Uses date-fns-tz library for reliable timezone math

## Best Practices for Cross-Timezone Scheduling

1. **Include timezone in communications:**
   - "The meeting is at 3:00 PM IST / 10:30 AM BST"

2. **Use the timezone preview:**
   - Check how your meeting time appears for participants
   - Avoid scheduling during inappropriate hours

3. **Consider "golden hours":**
   - For India-UK: ~12:30-15:00 IST / ~8:00-10:30 BST
   - For India-US East: ~19:30-22:00 IST / ~10:00-12:30 EST
   - For India-US West: ~21:30-00:00 IST / ~9:00-11:30 PST