# How to Test Cross-Timezone Meetings in the Calendar App

## Scenario: User A (India) invites User B (London) to a meeting

Let's simulate a real-world scenario where a user in India schedules a meeting with a user in London.

## Prerequisites

1. Two different browsers or one regular browser and one incognito window
2. Access to browser DevTools

## Setup: The Two Users

### User A (Meeting Organizer in India)

1. **Regular browser window**
2. Calendar timezone will be detected as **Asia/Kolkata**
3. Will create a meeting at **3:00 PM IST**

### User B (Meeting Participant in London)

1. **Incognito/Private window** or a different browser
2. Set DevTools timezone to **Europe/London**
3. Should see the meeting at **10:30 AM BST** (British Summer Time)

## Steps to Test

### Step 1: Set Up User A (India)

1. Open the calendar app in your regular browser
2. Verify your timezone is set to Asia/Kolkata:
   - Check bottom of event creation form for "Your timezone: Asia/Kolkata"
   - If not correct, use DevTools to set Location to Mumbai

### Step 2: Create a Meeting as User A

1. Click "+" button to create a new event
2. Set the meeting details:
   - Title: "Cross-Timezone Test Meeting"
   - Date: Tomorrow
   - Time: 3:00 PM - 4:00 PM
3. Add User B's email in the participants field
4. Notice the timezone preview that appears:
   - It will show 10:30 AM for UK (GMT/BST)
5. Click "Create Event"

### Step 3: Set Up User B (London)

1. Open a private/incognito browser window
2. Navigate to the calendar app
3. Set DevTools timezone to London:
   - Press F12 to open DevTools
   - Press Ctrl+Shift+P, type "sensors"
   - Select "Show Sensors" from the command palette
   - Under "Location", select "London"
   - Refresh the page
4. Log in as User B

### Step 4: Verify the Meeting Appears Correctly for User B

1. Check User B's calendar for the event
2. Verify that:
   - The event appears at 10:30 AM (not 3:00 PM)
   - The timezone indicator under the event shows "London"
   - The event is positioned correctly in the calendar grid

## Expected Results

- **For User A in India**: Meeting shows at 3:00 PM with "Kolkata" timezone
- **For User B in London**: Same meeting shows at 10:30 AM with "London" timezone

## How This Works Behind the Scenes

1. When User A creates the event:
   - 3:00 PM IST is converted to UTC (9:30 AM UTC)
   - The UTC time is stored in the database

2. When User B views the calendar:
   - The UTC time (9:30 AM UTC) is retrieved from the database
   - It is converted to London time (10:30 AM BST)
   - The event is displayed at 10:30 AM in User B's calendar

## Troubleshooting

If the event appears at the wrong time:

1. **Check timezone settings:**
   - Verify both users have the correct timezone set
   - Look at the timezone indicator under event times

2. **Check browser timezone:**
   - In console type: `Intl.DateTimeFormat().resolvedOptions().timeZone`
   - Should show "Asia/Kolkata" for User A and "Europe/London" for User B

3. **Check event storage:**
   - Look at the event's startDateTime in the API response
   - Should be in UTC format (e.g., "2025-10-19T09:30:00.000Z")

4. **Clear caches:**
   - Hard refresh (Ctrl+F5) both browsers
   - Check timezone again in the Console

## Real-World Applications

This functionality ensures that:

1. Global teams can schedule meetings without confusion
2. Meeting times are always shown in the participant's local timezone
3. Calendar displays provide visual context (like "Different day" badges)
4. Users don't need to manually convert times across timezones