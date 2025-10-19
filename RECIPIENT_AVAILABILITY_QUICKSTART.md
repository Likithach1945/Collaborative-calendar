# Quick Start - Recipient Availability Checking

## What's New?
When creating an event, you can now see **at a glance** if your recipients are available or have conflicts!

## How to Use (3 Simple Steps)

### Step 1: Create Event
1. Click "Create Event" on the calendar
2. Fill in event title, date, and time
3. Click next section ↓

### Step 2: Add Recipients
1. In "Participants" field, type email addresses (comma-separated)
   ```
   alice@example.com, bob@example.com, charlie@example.com
   ```
2. The system automatically checks as you type

### Step 3: Check Availability
After adding recipients, a new "Recipient Availability" section appears:

```
✓ Alice Smith         Available
⚠ Bob Johnson         1 conflict
   Team Standup (Mon 2:30 PM - 3:30 PM)
   Conference Room A
✓ Charlie Davis       Available

Summary: 2 available, 1 conflict
```

## That's It! 🎉

You can now:
- ✅ Create the event (even with conflicts)
- ✅ Change the time to find a better slot
- ✅ Remove conflicted recipients
- ✅ Proceed knowing who might need to reschedule

## What Each Status Means

| Status | Meaning | Action |
|--------|---------|--------|
| ✓ **Available** | No conflicts | Proceed with event |
| ⚠ **Conflict** | Has other event at same time | Consider changing time |

## Tips

### 🔍 View Conflicts
- Click on a recipient to see what event they're in
- Shows the conflicting event's time and location

### 🕐 Check Different Times
- Edit the event date/time
- Availability updates automatically
- Find a time that works for everyone

### 📧 Still Create if Needed
- You can create the event even with conflicts
- Recipients with conflicts will still get invited
- They'll need to reschedule or skip

### ♿ Keyboard Navigation
- Tab through all fields
- Enter emails or change times
- All components are fully accessible

## Supported Email Formats
- Valid: `user@example.com` ✓
- Valid: `alice.smith@company.co.uk` ✓
- Invalid: `user@invalid` ✗
- Invalid: `@example.com` ✗

Invalid emails are automatically filtered out.

## Common Scenarios

### Scenario 1: Everyone is Available
```
✓ All 3 available
→ Go ahead and create! Everyone's free.
```

### Scenario 2: One Person Has a Conflict
```
⚠ 1 conflict found
→ Change the time OR create anyway with a note
```

### Scenario 3: Multiple Conflicts
```
⚠ 2 conflicts found
→ Suggest different time to involved people
   OR create and they'll need to reschedule
```

### Scenario 4: Non-existent User
```
✓ unknown@example.com - Assumed Available
→ Treated as available (not in system yet)
```

## Mobile View
The availability section works great on mobile:
- Scrollable conflict list
- Touch-friendly buttons
- Readable text sizes
- Quick status overview

## Real-World Example

**Creating a team standup meeting:**
1. Set time: Monday 10:00 AM - 10:30 AM
2. Add team: `alice@example.com, bob@example.com, charlie@example.com`
3. System shows:
   - Alice: ✓ Available
   - Bob: ⚠ Team planning (9:30-11:00 AM)
   - Charlie: ✓ Available
4. **Decision options:**
   - Change to 10:30 AM (after Bob's planning)
   - Create at 10:00 AM (Bob will need to skip planning)
   - Remove Bob from this standup

## Timezone Note 📍
- Times shown in **YOUR timezone**
- Conflicts displayed when you view them
- Participants see times in their own timezone

## FAQ

**Q: Why can't I see availability for everyone?**
- A: Make sure you typed valid email addresses (includes @ and .)

**Q: What if someone isn't in the system?**
- A: They're assumed available until they join and create events

**Q: Can I create an event if someone has conflicts?**
- A: Yes! You can create regardless. They'll still get invited.

**Q: Does this block event creation?**
- A: No! It's just informational. Create whenever you want.

**Q: Is it real-time?**
- A: Yes! Availability updates as you change the time or participants.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move between fields |
| `Enter` | Confirm (after typing email) |
| `Escape` | Cancel event creation |
| `Shift+Tab` | Move to previous field |

## Troubleshooting

**Availability not showing?**
- Check that you added valid email addresses
- Wait a moment for the system to check
- Make sure times are set correctly

**See errors?**
- Check internet connection
- Try refreshing the page
- Verify email addresses are correct

**Something looks wrong?**
- Try different email addresses
- Test with a known time conflict
- Contact support if issue persists

## Support

For issues or questions:
1. Check the [detailed documentation](./RECIPIENT_AVAILABILITY_FEATURE.md)
2. Review [implementation details](./RECIPIENT_AVAILABILITY_IMPLEMENTATION.md)
3. Contact your calendar administrator

---

**Happy scheduling! 📅**
