# Quick Test Guide - Manual Availability Check

## 🎯 What Changed?

The availability checking now works like **Microsoft Teams**:
1. User enters attendee emails
2. User clicks "📋 Check Availability" button
3. See only "✓ Available" or "⚠ Unavailable" status
4. **No event details** are shown (privacy protected)

## ✅ Testing Checklist

### Visual Elements
- [ ] Button appears when emails + times are set
- [ ] Button shows "📋 Check Availability" text
- [ ] Button is blue with light blue background
- [ ] Button has loading spinner when clicked
- [ ] Button text changes to "✓ Checking availability" during load

### Functionality
- [ ] Button does NOT appear without participant emails
- [ ] Button does NOT appear without start/end times
- [ ] Clicking button triggers availability check
- [ ] Results show within 1-2 seconds
- [ ] Results disappear if you uncheck the button

### Results Display
- [ ] Shows participant name and email
- [ ] Shows "✓ Available" with green checkmark
- [ ] Shows "⚠ Unavailable" with red warning icon
- [ ] **NO** event titles visible
- [ ] **NO** conflict time ranges shown
- [ ] **NO** location information visible
- [ ] Summary shows count: "All 3 available" or "1 conflict"

### Team Suggestions
- [ ] Suggested collaborators still appear above button
- [ ] Can click to add suggested users to participants
- [ ] Suggestions don't interfere with availability check

### Error Handling
- [ ] Works with 1 participant
- [ ] Works with multiple participants
- [ ] Handles email addresses with special characters
- [ ] Gracefully handles unknown users (shows unavailable)
- [ ] Shows error message if check fails

## 🧪 Test Scenarios

### Test 1: Single Available Attendee
```
1. Create event: 2 PM - 3 PM tomorrow
2. Add participant: alice@example.com
3. Click "Check Availability"
✓ Expected: Shows "All 1 available"
```

### Test 2: Multiple Attendees (Mixed)
```
1. Create event: 2 PM - 3 PM tomorrow  
2. Add participants: alice@example.com, bob@example.com
3. Click "Check Availability"
✓ Expected: Shows specific counts if some are busy
✓ Expected: No event details shown, just status
```

### Test 3: Toggle On/Off
```
1. Click "Check Availability" → See results
2. Click button again → Results hide
3. Click again → Results show
✓ Expected: Toggle works smoothly
```

### Test 4: Time Change
```
1. Enter two times and check availability
2. Change the end time to different time
3. Results should still be visible
4. Click button again to re-check at new time
✓ Expected: No automatic re-check, manual only
```

### Test 5: Team Suggestions
```
1. Enter participant email
2. See team suggestions above button
3. Click suggested person to add them
4. Both participants are in list
5. Click button to check both
✓ Expected: Suggestions work alongside manual check
```

## 📝 Expected Output Format

When you click the button, you should see:

```
Recipient Availability

✓ alice@example.com (Alice Smith)    Available

⚠ bob@example.com (Bob Johnson)       Unavailable

Summary: 1 conflict
```

**What you should NOT see:**
- ❌ Event titles like "Team Meeting", "1:1 Sync"
- ❌ Times like "2:30 PM - 3:00 PM"
- ❌ Locations like "Conference Room A"
- ❌ Any details about why someone is unavailable

## 🔍 Debugging Tips

### Button Not Appearing?
- Check: Are emails entered in "Participants" field?
- Check: Is start time and end time set?
- Try: Add at least one valid email address

### Results Taking Too Long?
- Check backend logs for errors
- Ensure backend is running on port 8080
- Network request might be slow

### Results Showing Old Data?
- Button might still be in "checked" state
- Click again to toggle off and on
- Or refresh page

### Wrong Availability Shown?
- Organizer calendar might have events
- System checks attendee calendars, not organizer
- Try with different attendee accounts

## 📊 Build Verification

After pull/changes:

```bash
# Frontend build should complete with no errors
npm run build
✓ Should see: "built in X.XXs"

# Backend should compile
mvn clean compile -q
✓ Should see: No output (success = quiet)
```

## 🚀 Deployment Notes

**Breaking Changes**: None  
**Migration Needed**: No  
**Database Changes**: No  
**API Changes**: None (only UI changes)  
**Browser Support**: All modern browsers  
**Mobile Friendly**: Yes, responsive design  

## 📞 Common Questions

**Q: Why don't I see event details anymore?**
A: For privacy - organizer shouldn't see attendee calendar details.

**Q: Can I still create an event if someone is unavailable?**
A: Yes! The feature only shows status. You can still create and send invitations.

**Q: Does this work with Google Calendar sync?**
A: Only if attendee is in the system. First invitation adds them.

**Q: Is there a way to see all times when everyone is available?**
A: Not yet - that's a future enhancement.

## 🔒 Privacy Verification

The feature protects privacy by:
- ✅ Not sending event titles in API response to UI
- ✅ Not displaying location information  
- ✅ Not showing time of conflicts
- ✅ Only showing binary available/unavailable status
- ✅ Preventing attendee calendar exposure

## 📱 Mobile Testing

Test on mobile devices:
- [ ] Button is visible and clickable
- [ ] Responsive layout works
- [ ] Results display properly on small screens
- [ ] No horizontal scrolling needed
