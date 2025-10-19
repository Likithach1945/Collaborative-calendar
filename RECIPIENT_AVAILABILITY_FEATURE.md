# Recipient Availability Checking Feature

## Overview
The recipient availability checking feature allows users to see conflicts and availability status of recipients **while creating an event**, without needing to switch context or manually check each person's calendar.

## Features

### 1. **Real-time Availability Check**
- Automatically checks availability when you add participant emails and set a meeting time
- No manual action required - just fill in the participants and times

### 2. **Conflict Detection**
- Shows all conflicting events for each recipient
- Displays:
  - Event title
  - Date and time of conflict (in your timezone)
  - Location (if available)

### 3. **Visual Status Indicators**
- **✓ Available** (green) - Recipient has no conflicts
- **⚠ Conflict** (yellow) - Recipient has one or more conflicting events

### 4. **Summary Information**
- Quick overview showing:
  - Total recipients
  - Number available
  - Number with conflicts

### 5. **Graceful Degradation**
- System continues to work even if availability check fails
- You can still create events without waiting for availability data
- Error messages are clear and helpful

## How to Use

### Step 1: Create Event
1. Click "Create Event"
2. Fill in event title, date, and time

### Step 2: Add Recipients
1. In the "Participants" field, add email addresses (comma-separated)
   - Example: `alice@example.com, bob@example.com`
2. As you type, the system automatically validates emails

### Step 3: View Availability
1. Once recipients and times are set, the "Recipient Availability" section appears
2. For each recipient, you'll see:
   - Their name/email
   - Availability status (Available / Conflict)
   - Any conflicting events (if applicable)

### Step 4: Create Event
- You can create the event regardless of conflicts
- Recipients with conflicts will still receive invitations
- Note: Recipients may need to reschedule if they have conflicts

## Component Details

### Frontend Components

#### `RecipientAvailability.jsx`
Component that displays recipient availability information.

**Props:**
- `availabilities`: Array of availability data from API
- `isLoading`: Boolean indicating if data is loading
- `error`: Error object if availability check failed
- `userTimezone`: User's timezone for formatting times

**Key Features:**
- Loading state with spinner
- Error handling with helpful messages
- Expandable conflict list per recipient
- Responsive design for mobile

#### `useCheckAvailability` Hook
React Query hook for fetching availability data.

**Usage:**
```javascript
const { data, isLoading, error } = useCheckAvailability(
  participantEmails,
  startDateTime,
  endDateTime,
  enabled
);
```

**Parameters:**
- `participantEmails`: Array of email addresses to check
- `startDateTime`: Meeting start time (UTC)
- `endDateTime`: Meeting end time (UTC)
- `enabled`: Boolean to enable/disable the query

### Backend Endpoint

#### `POST /api/v1/availability/check`

Checks availability for multiple recipients at a specific time.

**Request Body:**
```json
{
  "participantEmails": ["alice@example.com", "bob@example.com"],
  "startDateTime": "2025-10-20T14:00:00Z",
  "endDateTime": "2025-10-20T15:00:00Z"
}
```

**Response:**
```json
{
  "availabilities": [
    {
      "participantEmail": "alice@example.com",
      "participantName": "Alice Smith",
      "isAvailable": true,
      "conflicts": []
    },
    {
      "participantEmail": "bob@example.com",
      "participantName": "Bob Johnson",
      "isAvailable": false,
      "conflicts": [
        {
          "title": "Team Standup",
          "startDateTime": "2025-10-20T13:30:00Z",
          "endDateTime": "2025-10-20T14:30:00Z",
          "location": "Conference Room A"
        }
      ]
    }
  ]
}
```

### Service Method

#### `AvailabilityService.checkParticipantsAvailability()`

Backend service method for checking availability.

**Method Signature:**
```java
public List<AvailabilityDTO> checkParticipantsAvailability(
    Instant startDateTime,
    Instant endDateTime,
    List<String> participantEmails)
```

**Logic:**
1. For each participant email:
   - Look up user by email
   - If not found, assume available
   - Get all events during the time window
   - Check for time conflicts
   - Return availability status and conflicts

**Conflict Detection:**
- Events that overlap with the proposed meeting time
- Uses UTC timestamps for accurate comparison
- Accounts for daylight saving time

## Technical Implementation

### Data Flow

```
EventCreateForm
    ↓
User enters participants and sets time
    ↓
participantEmails and startUTC/endUTC are computed
    ↓
useCheckAvailability hook is triggered
    ↓
POST /api/v1/availability/check
    ↓
AvailabilityService.checkParticipantsAvailability()
    ↓
Return AvailabilityDTO list
    ↓
RecipientAvailability component renders results
```

### Caching
- Query results are cached for 1 minute
- Prevents unnecessary API calls for the same time/participants
- Cache is invalidated when inputs change

### Error Handling
- Network errors are caught and displayed
- Invalid email addresses are filtered out
- Missing users are assumed available
- Syntax errors in time parsing are handled gracefully

## Performance Considerations

### Optimization
1. **Debouncing**: Changes to form fields are debounced before API call
2. **Caching**: TanStack Query caches results for 1 minute
3. **Lazy Loading**: Availability check only runs when needed
4. **Early Filtering**: Invalid emails are filtered before API call

### API Efficiency
- Single API call for all recipients
- No N+1 queries - participants checked in parallel
- Minimal database queries

### Frontend Efficiency
- Component only renders when data is available
- CSS optimizations for smooth animations
- Responsive images and icons

## User Experience

### Visual Feedback
- **Loading State**: Spinner with "Checking availability..." message
- **Error State**: Warning icon with clear error message
- **Success State**: Green/yellow status indicators with conflict details

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Proper ARIA labels for screen readers
- Focus management for accessibility

### Mobile Experience
- Responsive layout that works on small screens
- Touch-friendly click targets
- Horizontal scrolling for long email lists

## Testing

### Manual Testing Checklist
1. ✓ Add multiple recipients with valid emails
2. ✓ Set a time when some recipients are busy
3. ✓ Verify conflicts are displayed correctly
4. ✓ Check timezone handling in conflict display
5. ✓ Test with non-existent user emails
6. ✓ Test network error handling
7. ✓ Verify event can be created despite conflicts
8. ✓ Test mobile responsiveness

### Edge Cases
- **No participants**: Component doesn't show
- **Invalid emails**: Filtered out automatically
- **Non-existent users**: Shown as available
- **Same time slot**: Multiple overlapping events shown
- **Very long email list**: Component remains responsive

## Future Enhancements

1. **Batch Timezone Conversion**
   - Display conflicts in recipient's timezone
   - Better understanding of impact

2. **Smart Suggestions**
   - Suggest next available time slot for all participants
   - Consider working hours across timezones

3. **Custom Availability Rules**
   - Allow users to set availability preferences
   - Block out personal time
   - Define working hours

4. **Conflict Resolution**
   - Auto-reschedule with attendee consent
   - Propose alternative times
   - Handle recurring events

5. **Calendar Integration**
   - Show more event details (description, attendees)
   - Real-time sync with external calendars
   - Support for multiple calendar sources

## Troubleshooting

### Availability Not Showing
- Ensure all participants have valid email addresses
- Check that start and end times are set
- Wait a moment for the API to respond

### Showing "No conflicts" but you know there's a conflict
- Verify the time is in the correct timezone
- Check that the recipient's event is in the system
- Make sure emails are exactly matching (including domain)

### Getting error message
- Check internet connection
- Verify participant emails are valid
- Try refreshing the page

## Files Modified

### Backend
- `AvailabilityController.java` - Added `/check` endpoint
- `AvailabilityService.java` - Existing service methods used

### Frontend
- `EventCreateForm.jsx` - Integrated availability check
- `RecipientAvailability.jsx` - New component (created)
- `RecipientAvailability.css` - Component styles (created)
- `useCheckAvailability.js` - New hook (created)

### No Breaking Changes
- All existing features continue to work
- Event creation remains unchanged
- Backward compatible with all existing code
