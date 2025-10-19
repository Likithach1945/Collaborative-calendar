# Timezone Testing Checklist

Use this checklist to verify that our timezone implementation is working correctly. The application should display event times in each user's local timezone rather than in UTC.

## Preparation

1. Open the calendar application
2. Ensure the backend server is running (`cd backend && mvn spring-boot:run`)
3. Make sure the frontend server is running (`cd frontend && npm run dev`)

## Quick Timezone Verification Tests

- [ ] Locate the Timezone Debugger tool (bottom right corner of the application)
- [ ] Click to expand it and verify it shows your current browser timezone
- [ ] Check that the current time displayed matches your system time

## Testing Event Creation

- [ ] Create a new event in your current timezone
- [ ] Verify the time inputs show your local timezone
- [ ] Check that the timezone preview correctly shows times in other timezones

## Testing Timezone Changes

1. Using the Timezone Debugger:
   - [ ] Select a different timezone from the dropdown (e.g., "America/New_York")
   - [ ] Click "Change Timezone" and reload the page
   - [ ] Create a new event and verify times are now in the selected timezone
   - [ ] Return to your browser's timezone using "Reset to Browser"

2. Using Browser Developer Tools (Advanced):
   - [ ] Open browser developer tools and use the console
   - [ ] Run `testTimezoneConversions()` to see current time in various timezones
   - [ ] Run `simulateEventTimezoneScenario()` to see how event times translate between timezones

## Cross-Timezone Scenarios

Test these scenarios using the Time Converter in the Timezone Debugger:

1. Organizer in Tokyo, Attendee in New York:
   - [ ] Select "Asia/Tokyo" as Organizer timezone
   - [ ] Select "America/New_York" as Viewer timezone
   - [ ] Set a time (e.g., 9:00 AM Tokyo time) 
   - [ ] Verify it shows the correct converted time for New York (8:00 PM previous day)

2. Organizer in London, Attendee in Los Angeles:
   - [ ] Select "Europe/London" as Organizer timezone
   - [ ] Select "America/Los_Angeles" as Viewer timezone
   - [ ] Set a time (e.g., 2:00 PM London time)
   - [ ] Verify it shows the correct converted time for Los Angeles (6:00 AM same day)

## Date Boundary Testing

Test events that cross date boundaries:

- [ ] Create an event at 11:30 PM in your local timezone
- [ ] Change to a timezone that's at least 1 hour ahead
- [ ] Verify the event appears on the correct day (the previous day)
- [ ] Change to a timezone that's at least 1 hour behind
- [ ] Verify the event appears on the correct day (the same day)

## Verification Via Browser Console

For developers, use these console commands to verify timezone handling:

```javascript
// Test current time in multiple timezones
testTimezoneConversions();

// Test a specific datetime in multiple timezones
testTimezoneConversions('2025-10-20T15:00:00');

// Simulate event view between Tokyo and Los Angeles
simulateEventTimezoneScenario();
```

## Troubleshooting Common Issues

If you encounter timezone problems:

1. **Times displayed in UTC instead of local timezone:**
   - Check browser console for errors
   - Verify the browser's timezone is detected correctly
   - Clear browser cache and reload

2. **Events showing on wrong dates:**
   - Check if event crosses midnight in either timezone
   - Verify timezone conversion in the debugger

3. **Inconsistent timezone display:**
   - Make sure both frontend and backend are using the same timezone libraries
   - Check that timezone IDs are standardized (IANA format)

## Final Validation

- [ ] Verify that when viewing an event, both the organizer and attendees see the event at the correct time in their respective timezones
- [ ] Confirm that time displays include the timezone indicator
- [ ] Verify event cards show correct local time regardless of which timezone they were created in