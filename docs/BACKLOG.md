# Product Backlog: Deferred Features

This document outlines features that were identified during development but deferred for future iterations.

## Recurrence & Recurring Events

### Feature Overview
Support for recurring events (daily, weekly, monthly, yearly) with the ability to:
- Create recurring event patterns
- Modify single instances or entire series
- Handle exceptions to recurrence rules
- Suggest meeting times that respect recurring availability blocks

### Business Value
- **High**: Many business meetings recur weekly/monthly
- **User Impact**: Reduces repetitive event creation
- **Complexity**: High (RRULE parsing, exception handling, UI/UX for series vs instance)

### Technical Approach

#### Backend
```java
// Event.java
@Entity
public class Event {
    // ... existing fields
    
    @Column(name = "recurrence_rule")
    private String recurrenceRule; // iCalendar RRULE format (RFC 5545)
    
    @Column(name = "recurrence_id")
    private Instant recurrenceId; // For modified instances
    
    @ManyToOne
    @JoinColumn(name = "parent_event_id")
    private Event parentEvent; // Link to original recurring event
}

// Recurrence parsing with ical4j
import net.fortuna.ical4j.model.Recur;
import net.fortuna.ical4j.model.property.RRule;

public class RecurrenceService {
    public List<Instant> generateOccurrences(String rrule, Instant start, Instant end) {
        // Use ical4j to parse RRULE and generate occurrences
    }
    
    public void updateSingleInstance(UUID eventId, Instant recurrenceId, EventDTO updates) {
        // Create exception event
    }
    
    public void updateSeries(UUID eventId, EventDTO updates) {
        // Update parent and all non-exception instances
    }
}
```

#### Frontend
```javascript
// RecurrenceForm.jsx
const RecurrenceForm = () => {
  const [frequency, setFrequency] = useState('DAILY'); // DAILY, WEEKLY, MONTHLY, YEARLY
  const [interval, setInterval] = useState(1);
  const [until, setUntil] = useState(null);
  const [count, setCount] = useState(null);
  const [byDay, setByDay] = useState([]); // For weekly: ['MO', 'WE', 'FR']
  
  // Generate RRULE string
  const buildRRule = () => {
    return `FREQ=${frequency};INTERVAL=${interval}${until ? `;UNTIL=${until}` : ''}`;
  };
};

// RecurrenceDialog.jsx
// When editing recurring event, show:
// - "Edit this event only"
// - "Edit this and following events"
// - "Edit all events in series"
```

#### Database Migration
```sql
-- V11__add_recurrence_support.sql
ALTER TABLE events ADD COLUMN recurrence_rule VARCHAR(500);
ALTER TABLE events ADD COLUMN recurrence_id TIMESTAMP;
ALTER TABLE events ADD COLUMN parent_event_id BINARY(16);
ALTER TABLE events ADD INDEX idx_recurrence_id (recurrence_id);
ALTER TABLE events ADD INDEX idx_parent_event_id (parent_event_id);
```

### Availability Integration

When checking availability with recurring events:
```java
public class AvailabilityService {
    public List<TimeSlot> computeAvailability(...) {
        // Expand recurring events in date range
        List<Event> expandedEvents = recurrenceService
            .expandRecurringEvents(allEvents, start, end);
        
        // Use expanded events for free/busy calculation
    }
}
```

### UI/UX Considerations

1. **Calendar View**
   - Show recurring indicator (🔁 icon)
   - Allow drag-and-drop to reschedule instance or series
   - Tooltip shows recurrence pattern

2. **Edit Dialog**
   - Clear choice between "this event", "this and following", "all events"
   - Preview of next 5 occurrences
   - Warning when editing series affects invitations

3. **Recurrence Patterns**
   - Simple options (Daily, Weekly, Monthly, Yearly)
   - Advanced options (custom intervals, specific days, nth weekday of month)
   - Visual recurrence builder (similar to Google Calendar)

### Edge Cases

1. **Timezone Changes**: Recurrence in user's timezone vs UTC
2. **Daylight Saving Time**: Handle DST transitions correctly
3. **Month-end Recurrence**: "Last day of month" vs "31st day"
4. **Invitation Responses**: Track responses per instance
5. **Time Proposals**: Propose change to single instance or series?

### Alternatives Considered

1. **Simple Repeat Count**: Instead of RRULE, just "repeat 10 times"
   - Pros: Simpler to implement
   - Cons: Less flexible, no standard format

2. **Pre-generate Instances**: Create individual events for each occurrence
   - Pros: Simpler queries, existing code works
   - Cons: Database bloat, hard to modify series, complex exception handling

3. **Virtual Expansion**: Don't store instances, expand on-the-fly
   - Pros: Minimal storage, easy to modify
   - Cons: Complex queries, performance impact

### Dependencies

- **ical4j library** (already included): RFC 5545 RRULE parsing
- **Frontend date library**: date-fns doesn't have built-in RRULE support, may need `rrule.js`

### Effort Estimate

- **Backend (RRULE parsing, expansion, exceptions)**: 5-8 days
- **Frontend (RecurrenceForm, edit dialog)**: 5-7 days
- **Availability integration**: 3-4 days
- **Invitation handling per instance**: 3-4 days
- **Testing (unit, integration, E2E)**: 4-5 days
- **Total**: 20-28 days (4-6 sprints)

### Acceptance Criteria

- [ ] User can create recurring events with RRULE patterns
- [ ] User can edit single instance without affecting series
- [ ] User can edit entire series
- [ ] Calendar displays recurring events correctly
- [ ] Availability calculation includes expanded recurrences
- [ ] Invitations work for recurring events
- [ ] Time proposals supported for recurring events
- [ ] Timezone handling is correct across DST boundaries
- [ ] ICS import/export supports RRULE

### Testing Strategy

1. **Unit Tests**: RRULE parsing, occurrence generation
2. **Integration Tests**: Database operations, API endpoints
3. **E2E Tests**: Create recurring event, modify instance, check calendar
4. **Timezone Tests**: Test across multiple timezones and DST transitions
5. **Performance Tests**: Large date ranges, complex RRULEs

### Documentation

- [ ] User guide: Creating and managing recurring events
- [ ] API documentation: RRULE format, endpoints
- [ ] Developer guide: Recurrence architecture

### References

- [RFC 5545 (iCalendar)](https://datatracker.ietf.org/doc/html/rfc5545)
- [ical4j Documentation](https://www.ical4j.org/)
- [rrule.js](https://github.com/jakubroztocil/rrule)
- [Google Calendar Recurrence](https://support.google.com/calendar/answer/37115)

---

## Other Deferred Features

### Smart Scheduling AI
- Use ML to suggest optimal meeting times based on historical data
- Predict meeting duration based on title/participants
- Effort: 10-15 days

### Mobile Apps
- Native iOS and Android apps
- Push notifications for invitations
- Effort: 60-90 days

### Calendar Integrations
- Two-way sync with Google Calendar, Outlook
- Effort: 20-30 days

### Meeting Rooms
- Book physical meeting rooms
- Check room availability
- Effort: 10-15 days

### Video Conferencing Integration
- Auto-generate Zoom/Teams links (beyond Google Meet)
- Effort: 5-7 days

### Advanced Permissions
- Delegate calendar access
- Share calendars with view/edit permissions
- Effort: 10-15 days

### Analytics Dashboard
- Meeting statistics, busiest times
- Team collaboration metrics
- Effort: 15-20 days
