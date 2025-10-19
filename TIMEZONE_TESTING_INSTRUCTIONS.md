# Testing Timezone Implementation

This guide provides instructions for testing that the calendar application correctly handles timezones for both organizers and attendees.

## Testing Using Browser Developer Tools

### Chrome/Edge
1. Open Chrome/Edge Developer Tools (F12 or Ctrl+Shift+I)
2. Go to "More tools" > "Sensors" > "Location" tab (in some newer versions, you might need to click the three dots menu in DevTools and find "More tools")
3. Select a different timezone from the dropdown (e.g., "Tokyo, Japan" or "London, UK")
4. Refresh the page and test event creation and display

### Firefox
1. Open Firefox Developer Tools (F12 or Ctrl+Shift+I)
2. Go to "Web Developer" > "Browser Toolbox" (You may need to enable this in developer settings)
3. In the Browser Toolbox console, execute:
   ```javascript
   Services.prefs.setStringPref("intl.timezone.override", "Asia/Tokyo");
   ```
   (Replace "Asia/Tokyo" with any IANA timezone identifier)
4. Refresh the page and test event creation and display
5. To reset to your system timezone:
   ```javascript
   Services.prefs.clearUserPref("intl.timezone.override");
   ```

## Test Scenarios to Verify

1. **Event Creation Test**:
   - Change your browser's timezone to "America/Los_Angeles" (Pacific Time)
   - Create an event for 3:00 PM
   - Verify the timezone preview shows different times in other timezones
   - Submit the event
   - Change your browser timezone to "Asia/Tokyo"
   - View the same event - it should show the corresponding Tokyo time (7:00 AM next day)

2. **Cross-Timezone Event Visibility**:
   - Create events in multiple different simulated timezones
   - Verify that all events appear at the correct local time regardless of which timezone they were created in

3. **Date Boundary Testing**:
   - Create an event near midnight in one timezone
   - Change to a timezone many hours different
   - Verify the event appears on the correct day in calendar views

4. **Multiple Timezones in Same View**:
   - Create events from organizers in different timezones
   - Verify that all events appear at the correct local time

## Console Debugging

While testing, check the browser console for debug logs. Look for messages like:
- 🔧 EventCreateForm - userTimezone prop: [timezone]
- 🌎 Browser timezone: [timezone]
- 📅 utcToTimezone - Input: [date]
- 📅 utcToTimezone - Target timezone: [timezone]

These logs will help verify that the correct timezone conversions are happening.

## Troubleshooting

If times are still displaying incorrectly:
1. Check console for any errors or timezone-related warnings
2. Verify that browser-detected timezone is being correctly used (see timezone info at bottom of forms)
3. Ensure the backend is storing times in UTC format
4. Clear browser cache and reload

## Testing with Real Users

For the most thorough testing:
1. Have team members in different timezones create and view the same events
2. Verify that all participants see the correct local time

## Testing Tools

For developers, you can also use timezone testing utilities like:
- [Timezone Converter](https://www.timeanddate.com/worldclock/converter.html) - To manually verify conversions
- [Every Timezone](https://everytimezone.com/) - Visual comparison of multiple timezones