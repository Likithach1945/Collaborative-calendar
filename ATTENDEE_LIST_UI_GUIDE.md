# Attendee List UI - Visual Reference

## Component Layout

```
┌─────────────────────────────────────────────────────────┐
│  ATTENDEE LIST                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───┐  John Doe (Organizer)               [Host]     │
│  │ 👤 │  Organizer                                      │
│  └───┘                                                  │
│  ─────────────────────────────────────────────────────  │
│  ┌───┐  jane@example.com (You)    [Accept] [Decline]  │
│  │ ⏰ │  Awaiting response                              │
│  └───┘                                                  │
│  ─────────────────────────────────────────────────────  │
│  ┌───┐  bob@example.com                     ACCEPTED   │
│  │ ✓ │  Attending                                      │
│  └───┘                                                  │
│  ─────────────────────────────────────────────────────  │
│  ┌───┐  alice@example.com                   DECLINED   │
│  │ ✗ │  Not attending                                  │
│  └───┘                                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Color Scheme

### Status Icons (Avatars):
- **Organizer**: Blue background with user icon (👤)
- **Pending**: Orange/yellow background (#fbbc04) with clock icon (⏰)
- **Accepted**: Green background (#34a853) with checkmark icon (✓)
- **Declined**: Red background (#ea4335) with X icon (✗)

### Status Badges:
- **HOST**: Blue background (#1a73e8), white text
- **PENDING**: Light yellow background (#fef7e0), orange text (#ea8600)
- **ACCEPTED**: Light green background (#e6f4ea), green text (#137333)
- **DECLINED**: Light red background (#fce8e6), red text (#c5221f)

### Action Buttons:
- **Accept Button**: 
  - Background: #34a853 (green)
  - Hover: #2d9248 (darker green)
  - Text: White
  - Size: 70px min-width, 6px vertical padding

- **Decline Button**:
  - Background: #ea4335 (red)
  - Hover: #d33426 (darker red)
  - Text: White
  - Size: 70px min-width, 6px vertical padding

## States

### 1. Attendee with Pending Invitation (Current User)
```
┌───┐  you@example.com (You)        [Accept] [Decline]
│ ⏰ │  Awaiting response
└───┘
```
**Features:**
- Orange clock icon
- "(You)" label in primary color
- Two action buttons visible
- "Awaiting response" status text

### 2. Attendee with Accepted Status
```
┌───┐  attendee@example.com                 ACCEPTED
│ ✓ │  Attending
└───┘
```
**Features:**
- Green checkmark icon
- Green "ACCEPTED" badge
- "Attending" status text
- No action buttons (already responded)

### 3. Attendee with Declined Status
```
┌───┐  attendee@example.com                 DECLINED
│ ✗ │  Not attending
└───┘
```
**Features:**
- Red X icon
- Red "DECLINED" badge
- "Not attending" status text
- No action buttons (already responded)

### 4. Organizer (Always First in List)
```
┌───┐  organizer@example.com              [Host]
│ 👤 │  Organizer
└───┘
```
**Features:**
- Blue user icon
- Blue "Host" badge
- "Organizer" status text
- No action buttons (organizers don't have invitations)

## Button States

### Normal State
```
┌──────────┐  ┌───────────┐
│  Accept  │  │  Decline  │
└──────────┘  └───────────┘
```

### Hover State
```
┌──────────┐  ┌───────────┐
│  Accept  │  │  Decline  │  ← Slightly darker + shadow
└──────────┘  └───────────┘
```

### Loading State (Processing Response)
```
┌──────────┐  ┌───────────┐
│   ...    │  │   ...     │  ← Buttons disabled, opacity 0.6
└──────────┘  └───────────┘
```

### Active State (Clicked)
```
┌──────────┐  ┌───────────┐
│  Accept  │  │  Decline  │  ← Slightly scaled down (0.98)
└──────────┘  └───────────┘
```

## Responsive Behavior

### Desktop (>768px):
- Full button text: "Accept" and "Decline"
- Buttons side-by-side with 8px gap
- Attendee name shows full email/display name

### Mobile (<768px):
- Buttons remain same size (min-width: 70px)
- May wrap to new line if screen very narrow
- Attendee names may truncate with ellipsis

## Loading States

### Initial Load (Fetching Invitations)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ⟳ Loading...                        │
│                  (spinning icon)                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────────────────────┐
│  ⚠ Failed to load attendee information.                │
│                                                         │
│  (or specific error message like "Event not found")    │
└─────────────────────────────────────────────────────────┘
```

### Empty State (No Attendees)
```
┌─────────────────────────────────────────────────────────┐
│  ┌───┐  organizer@example.com              [Host]     │
│  │ 👤 │  Organizer                                      │
│  └───┘                                                  │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│         No other attendees for this event.             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Interaction Flow

### Accept Flow:
1. **User clicks "Accept"**
   ```
   [Accept] [Decline]  →  [...] [...]
   ```
   (Both buttons show "...", both disabled)

2. **API request sent**
   ```
   PATCH /api/v1/invitations/{id}
   { "status": "ACCEPTED" }
   ```

3. **Success response received**
   ```
   [...] [...]  →  ACCEPTED
                    ✓ Attending
   ```
   (Buttons disappear, green badge appears)

4. **Cache invalidated, list refetched**
   - Other views update automatically
   - Organizer sees updated status

### Decline Flow:
Same as Accept, but results in DECLINED status with red badge

## Accessibility

- **Keyboard Navigation**: Tab through buttons, Enter to activate
- **Screen Readers**: Buttons announce "Accept invitation" / "Decline invitation"
- **Color Contrast**: All text meets WCAG AA standards
- **Focus States**: Visible focus rings on buttons
- **Loading Feedback**: "Processing..." announced to screen readers

## CSS Classes Reference

```css
.attendee-list-container    → Main container
.attendee-item             → Each row in the list
.attendee-avatar           → Circular icon container
.attendee-details          → Name and status text container
.attendee-name             → Attendee display name/email
.attendee-status           → Status description text
.status-badge              → Status label (PENDING/ACCEPTED/DECLINED)
.organizer-badge           → "Host" badge
.invitation-actions        → Button container
.btn-accept                → Accept button
.btn-decline               → Decline button
```

## Animation Timing

- **Hover transitions**: 0.2s ease
- **Button click scale**: 0.2s ease
- **Loading spinner**: 1s linear infinite
- **Status badge fade-in**: Handled by React Query

## Z-Index Layers

1. Base content: z-index 1
2. Status badges: z-index 2 (if needed)
3. Tooltips (future): z-index 100
4. Modals (future): z-index 1000

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile

## Notes for Developers

1. **User Email Detection**: Uses `localStorage.getItem('user_email')`
2. **Case-Insensitive Matching**: Both user and invitation emails are lowercased for comparison
3. **Optimistic Updates**: Not implemented (waits for server confirmation)
4. **Error Boundaries**: Should be wrapped in ErrorBoundary component
5. **Retry Logic**: Automatic for 5xx errors, up to 3 attempts
