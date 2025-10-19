# Testing Checklist - Invitation Response Feature

## Pre-Test Setup
- [ ] Backend is running on port 8443
- [ ] Frontend is running on port 5173
- [ ] Database migrations are up to date (version 3)
- [ ] At least one event exists with multiple attendees
- [ ] Test user is logged in with valid JWT token

## Test Scenario 1: Attendee Can See Accept/Decline Buttons

### Setup:
- User A (organizer) creates an event
- User B (attendee) is invited to the event
- Invitation status is PENDING

### Steps:
1. [ ] Login as User B (attendee)
2. [ ] Navigate to calendar view
3. [ ] Click on the event to open details
4. [ ] Scroll to attendee list section

### Expected Results:
- [ ] User B sees their name with "(You)" label
- [ ] Two buttons are visible: "Accept" and "Decline"
- [ ] Buttons are green and red respectively
- [ ] Buttons are enabled (not disabled/greyed out)
- [ ] Status shows "Awaiting response" with clock icon
- [ ] Avatar has orange/yellow background

## Test Scenario 2: Attendee Can Accept Invitation

### Steps:
1. [ ] From the event details (as User B)
2. [ ] Click the "Accept" button
3. [ ] Wait for response

### Expected Results:
- [ ] Buttons change to "..." while processing
- [ ] Both buttons are disabled during processing
- [ ] After ~1 second, buttons disappear
- [ ] Green "ACCEPTED" badge appears
- [ ] Status text changes to "Attending"
- [ ] Avatar background turns green
- [ ] Check mark icon appears in avatar
- [ ] No console errors

### Backend Verification:
```sql
SELECT status, responded_at FROM invitations 
WHERE recipient_email = 'userb@example.com' 
AND event_id = 'event-id-here';
-- Should show: status = 'ACCEPTED', responded_at = recent timestamp
```

## Test Scenario 3: Attendee Can Decline Invitation

### Setup:
- Create new event with User B as attendee
- User B's invitation is PENDING

### Steps:
1. [ ] Login as User B
2. [ ] Open event details
3. [ ] Click "Decline" button
4. [ ] Wait for response

### Expected Results:
- [ ] Buttons show "..." while processing
- [ ] Both buttons disabled during processing
- [ ] After processing, buttons disappear
- [ ] Red "DECLINED" badge appears
- [ ] Status text shows "Not attending"
- [ ] Avatar background turns red
- [ ] X icon appears in avatar

## Test Scenario 4: Organizer Can See All Statuses

### Setup:
- Event has 5 attendees:
  - User B: PENDING
  - User C: ACCEPTED
  - User D: DECLINED
  - User E: PENDING
  - User F: ACCEPTED

### Steps:
1. [ ] Login as User A (organizer)
2. [ ] Click on the event
3. [ ] View attendee list

### Expected Results:
- [ ] Organizer appears first with blue "Host" badge
- [ ] All 5 attendees are listed
- [ ] User B shows orange "PENDING" badge
- [ ] User C shows green "ACCEPTED" badge
- [ ] User D shows red "DECLINED" badge
- [ ] User E shows orange "PENDING" badge
- [ ] User F shows green "ACCEPTED" badge
- [ ] NO accept/decline buttons visible for organizer
- [ ] Correct status icons for each attendee

## Test Scenario 5: Already Responded Invitations

### Setup:
- User B has already accepted invitation (status = ACCEPTED)

### Steps:
1. [ ] Login as User B
2. [ ] Open event details
3. [ ] View attendee list

### Expected Results:
- [ ] User B's name shows "(You)" label
- [ ] Green "ACCEPTED" badge visible
- [ ] "Attending" status text
- [ ] NO accept/decline buttons (already responded)
- [ ] Green checkmark icon
- [ ] Green avatar background

## Test Scenario 6: Error Handling - Network Failure

### Steps:
1. [ ] Open browser DevTools
2. [ ] Go to Network tab
3. [ ] Enable "Offline" mode
4. [ ] Login as User B (if not cached, login before going offline)
5. [ ] Click "Accept" button

### Expected Results:
- [ ] Buttons show "..." initially
- [ ] After retry attempts fail, error message appears
- [ ] Original buttons reappear (not stuck in loading state)
- [ ] Console shows error message
- [ ] User can retry by clicking button again

## Test Scenario 7: Error Handling - Permission Denied

### Setup:
- User B tries to respond to User C's invitation

### Steps:
1. [ ] Use browser DevTools to modify invitation ID in request
2. [ ] Try to respond to another user's invitation

### Expected Results:
- [ ] Backend returns 403 Forbidden
- [ ] Frontend displays error message
- [ ] No database update occurs

## Test Scenario 8: Real-Time Updates

### Setup:
- Two browser windows open
- Window 1: User A (organizer) viewing event
- Window 2: User B (attendee) viewing event

### Steps:
1. [ ] In Window 2, click "Accept"
2. [ ] Watch Window 1 (organizer's view)

### Expected Results:
- [ ] Window 2 updates immediately
- [ ] Window 1 updates when:
  - User refreshes the page, OR
  - User closes and reopens the event modal
- [ ] After refresh, organizer sees User B's status as ACCEPTED

## Test Scenario 9: Multiple Pending Invitations

### Setup:
- User B has 3 pending invitations for 3 different events

### Steps:
1. [ ] Login as User B
2. [ ] Open Event 1, accept invitation
3. [ ] Open Event 2, decline invitation
4. [ ] Open Event 3, accept invitation

### Expected Results:
- [ ] Each event shows correct buttons initially
- [ ] After responding, each updates independently
- [ ] Event 1 shows ACCEPTED
- [ ] Event 2 shows DECLINED
- [ ] Event 3 shows ACCEPTED
- [ ] All database records updated correctly

## Test Scenario 10: UI/UX Quality

### Steps:
1. [ ] Hover over "Accept" button
2. [ ] Hover over "Decline" button
3. [ ] Click and hold "Accept" button
4. [ ] Tab through interface with keyboard
5. [ ] Test on mobile viewport (< 768px)

### Expected Results:
- [ ] Hover shows darker color + shadow
- [ ] Click shows scale-down effect (0.98)
- [ ] Keyboard focus is visible
- [ ] Tab order is logical
- [ ] Mobile view: buttons don't overflow
- [ ] All animations are smooth (0.2s ease)

## Test Scenario 11: Edge Cases

### Test 11a: No Attendees
1. [ ] Create event with no attendees
2. [ ] View as organizer
3. [ ] Should show: "No other attendees for this event"

### Test 11b: Event Not Found
1. [ ] Navigate to /events/invalid-id
2. [ ] Should show: "The event was not found"

### Test 11c: Unauthorized Access
1. [ ] Try to view invitations for event user is not part of
2. [ ] Should show: 403 error or redirect

### Test 11d: Rapid Clicking
1. [ ] Click "Accept" button 5 times rapidly
2. [ ] Should only send one request
3. [ ] Button should be disabled after first click

## Performance Tests

### Test P1: Load Time
- [ ] Attendee list loads in < 1 second
- [ ] No unnecessary API calls (check Network tab)
- [ ] Response mutation completes in < 500ms

### Test P2: Large Attendee List
- [ ] Create event with 50 attendees
- [ ] View attendee list
- [ ] Should render without lag
- [ ] Scrolling should be smooth

### Test P3: Concurrent Updates
- [ ] 3 attendees respond simultaneously
- [ ] All responses should succeed
- [ ] No race conditions
- [ ] Final state is consistent

## Security Tests

### Test S1: JWT Token Validation
- [ ] Remove auth token from localStorage
- [ ] Try to view invitations
- [ ] Should redirect to login or show 401 error

### Test S2: SQL Injection
- [ ] Try malicious input in invitation ID
- [ ] Backend should sanitize and reject

### Test S3: XSS Protection
- [ ] Create user with name: `<script>alert('xss')</script>`
- [ ] View attendee list
- [ ] Name should be escaped, no alert popup

## Accessibility Tests

### Test A1: Screen Reader
- [ ] Use NVDA/JAWS screen reader
- [ ] Navigate to attendee list
- [ ] Buttons should announce purpose clearly
- [ ] Status changes should be announced

### Test A2: Keyboard Navigation
- [ ] Tab to "Accept" button
- [ ] Press Enter
- [ ] Should activate button
- [ ] Tab to "Decline" button
- [ ] Press Enter
- [ ] Should activate button

### Test A3: Color Contrast
- [ ] Check all text has sufficient contrast
- [ ] Use browser contrast checker
- [ ] All colors should pass WCAG AA

## Browser Compatibility

- [ ] Chrome (latest): All tests pass
- [ ] Firefox (latest): All tests pass
- [ ] Safari (latest): All tests pass
- [ ] Edge (latest): All tests pass
- [ ] Chrome Mobile: All tests pass
- [ ] Safari iOS: All tests pass

## Regression Tests

- [ ] Existing event creation still works
- [ ] Event editing still works
- [ ] Event deletion still works
- [ ] Calendar view still loads events
- [ ] Other invitation features (proposals) still work

## Sign-Off

### Functional Requirements
- [ ] All core features work as expected
- [ ] No critical bugs found
- [ ] Error handling is robust

### Non-Functional Requirements
- [ ] Performance is acceptable
- [ ] UI is responsive and polished
- [ ] Accessibility standards met
- [ ] Security measures in place

### Documentation
- [ ] Feature documentation completed
- [ ] UI guide created
- [ ] API endpoints documented
- [ ] Code comments added

### Deployment Readiness
- [ ] Database migrations tested
- [ ] Backend tests pass
- [ ] Frontend tests pass
- [ ] No console errors/warnings

## Notes
- Document any issues found during testing
- Include steps to reproduce bugs
- Assign severity levels (Critical/Major/Minor)
- Track in issue tracker
