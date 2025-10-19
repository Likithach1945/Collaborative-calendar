# Cross-Timezone Meeting Guide

## 🌍 How Cross-Timezone Invitations Work

Your calendar application is fully equipped to handle cross-timezone meetings! Here's exactly how it works when you (in India) invite someone from the US or any other timezone.

---

## 📋 Complete Flow Example

### Scenario: Indian User Invites US Participant

**You (Organizer in India - IST)**
- Location: Mumbai, India
- Timezone: Asia/Kolkata (IST - UTC+5:30)
- Create meeting: October 19, 2025 at 8:00 AM IST

**US Participant (Invitee - EST)**
- Location: New York, USA
- Timezone: America/New_York (EST - UTC-5)

---

## 🔄 Step-by-Step Process

### Step 1: You Create the Event (8:00 AM IST)

```
Event Creation Form (Your View):
┌─────────────────────────────────────────────┐
│ Create New Event                            │
├─────────────────────────────────────────────┤
│ Title: Team Sync Meeting                   │
│ Start: Oct 19, 2025  8:00 AM              │
│ End:   Oct 19, 2025  9:00 AM              │
│                                             │
│ Participants:                               │
│ john.doe@uscompany.com                     │
│                                             │
│ 🌍 Time for participants in other zones:   │
│ ┌─────────────────────────────────────┐   │
│ │ US Eastern (EST/EDT)                │   │
│ │ Thu, Oct 18, 10:30 PM ⚠️Different day│   │
│ ├─────────────────────────────────────┤   │
│ │ US Pacific (PST/PDT)                │   │
│ │ Thu, Oct 18, 7:30 PM ⚠️Different day │   │
│ ├─────────────────────────────────────┤   │
│ │ UK (GMT/BST)                        │   │
│ │ Fri, Oct 19, 3:30 AM                │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ Your timezone: Asia/Kolkata                │
│ [Cancel]  [Create Event]                   │
└─────────────────────────────────────────────┘
```

**What happens behind the scenes:**
1. You enter: 8:00 AM IST
2. System converts to UTC: 2:30 AM UTC
3. Database stores: `2025-10-19T02:30:00.000Z`
4. Organizer timezone saved: `Asia/Kolkata`

---

### Step 2: US Participant Receives Invitation

**Email Notification:**
```
Subject: Invitation: Team Sync Meeting

You've been invited to:
Team Sync Meeting

📅 Thursday, October 18, 2025
🕐 10:30 PM - 11:30 PM EST (Your time)

Organized by: you@company.in

🌍 This event is in a different timezone:
   Organizer's time: 8:00 AM - 9:00 AM IST

[Accept] [Decline] [Tentative]
```

---

### Step 3: US Participant Views in Calendar

**Their Calendar View (EST):**
```
Thursday, October 18, 2025
─────────────────────────
8 AM  │
9 AM  │
10 AM │
11 AM │
12 PM │
1 PM  │
...
8 PM  │
9 PM  │
10 PM │ ┌──────────────────────┐
      │ │ Team Sync Meeting    │  ← Shows at 10:30 PM EST
11 PM │ │ 10:30 PM             │
      │ └──────────────────────┘
```

**When they click the event:**
```
┌─────────────────────────────────────────┐
│ Team Sync Meeting                       │
├─────────────────────────────────────────┤
│ 📅 Thu, Oct 18, 2025                   │
│ 🕐 10:30 PM - 11:30 PM EST            │
│                                         │
│ 🌍 This event is in Asia/Kolkata       │
│ 🕐 For you: 10:30 PM - 11:30 PM EST   │
│ 🕐 Organizer: 8:00 AM - 9:00 AM IST   │
│                                         │
│ 👤 Organized by: you@company.in        │
└─────────────────────────────────────────┘
```

---

## ⏰ Time Conversion Examples

### Morning in India → Evening/Night in US

| Your Time (IST) | US Eastern (EST) | US Pacific (PST) | Day Change |
|-----------------|------------------|------------------|------------|
| 8:00 AM IST     | 10:30 PM (prev)  | 7:30 PM (prev)   | ⚠️ Yes     |
| 9:00 AM IST     | 11:30 PM (prev)  | 8:30 PM (prev)   | ⚠️ Yes     |
| 10:00 AM IST    | 12:30 AM         | 9:30 PM (prev)   | ⚠️ Yes     |
| 12:00 PM IST    | 2:30 AM          | 11:30 PM (prev)  | ⚠️ Yes     |
| 3:00 PM IST     | 5:30 AM          | 2:30 AM          | ✅ Same    |
| 6:00 PM IST     | 8:30 AM          | 5:30 AM          | ✅ Same    |
| 9:00 PM IST     | 11:30 AM         | 8:30 AM          | ✅ Same    |

### Afternoon in India → Morning in US

| Your Time (IST) | US Eastern (EST) | US Pacific (PST) | Best For |
|-----------------|------------------|------------------|----------|
| 6:00 PM IST     | 8:30 AM EST      | 5:30 AM PST      | ⭐ Good  |
| 7:00 PM IST     | 9:30 AM EST      | 6:30 AM PST      | ⭐⭐ Better |
| 8:00 PM IST     | 10:30 AM EST     | 7:30 AM PST      | ⭐⭐⭐ Best |
| 9:00 PM IST     | 11:30 AM EST     | 8:30 AM PST      | ⭐⭐⭐ Best |
| 10:00 PM IST    | 12:30 PM EST     | 9:30 AM PST      | ⭐⭐ Better |

---

## ✅ System Features

### 1. Event Creation Preview
When you add participants' emails, the system automatically shows:
- ✅ Time in 12+ major timezones
- ✅ Date changes highlighted with "Different day" badge
- ✅ Color-coded cards for easy scanning
- ✅ Organized by region (Americas, Europe, Asia, Australia)

### 2. Automatic Timezone Conversion
- ✅ You create event in YOUR timezone (IST)
- ✅ System stores in UTC (universal standard)
- ✅ Each participant sees event in THEIR timezone
- ✅ No manual calculation needed!

### 3. Clear Visual Indicators
- 🌍 Globe icon shows cross-timezone events
- 🕐 Clock icon shows time differences
- ⚠️ "Different day" badge for date changes
- 🎨 Color-coded timezone preview cards

### 4. Smart Timezone Info Component
When participants view the event:
```
┌────────────────────────────────────────┐
│ 🌍 This event is in a different timezone│
│                                         │
│ 🕐 Your time (Eastern Standard Time):  │
│    Thursday, Oct 18, 2025              │
│    10:30 PM - 11:30 PM EST             │
│                                         │
│ 🕐 Organizer's time (India Standard):  │
│    Friday, Oct 19, 2025                │
│    8:00 AM - 9:00 AM IST               │
└────────────────────────────────────────┘
```

---

## 🎯 Best Practices for Cross-Timezone Meetings

### For India → US Meetings

**✅ Good Times (Convenient for both):**
- **7:00 PM - 10:00 PM IST** (Your evening, their morning)
  - 7:00 PM IST = 9:30 AM EST / 6:30 AM PST
  - 8:00 PM IST = 10:30 AM EST / 7:30 AM PST
  - 9:00 PM IST = 11:30 AM EST / 8:30 AM PST
  - 10:00 PM IST = 12:30 PM EST / 9:30 AM PST

**⚠️ Challenging Times:**
- **8:00 AM - 2:00 PM IST** (Your morning, their late night/early morning)
- **11:00 PM - 1:00 AM IST** (Your late night, their afternoon - you'll be tired)

### Using the Timezone Preview

1. **Add participants' emails** in the event form
2. **Check the timezone preview** section that appears
3. **Look for**:
   - ⚠️ "Different day" badges (might cause confusion)
   - 🌙 Very late/early times (10 PM - 6 AM = inconvenient)
   - ☀️ Reasonable working hours (9 AM - 6 PM = best)
4. **Adjust time** if needed to find mutual sweet spot

---

## 📱 Real-World Example

### You're in Mumbai, inviting colleagues from:
- **New York** (john@uscompany.com)
- **London** (sarah@ukcompany.com)
- **Singapore** (wei@sgcompany.com)

**You schedule: Friday, Oct 19 at 8:00 PM IST**

**Timezone Preview Shows:**
```
🌍 Time for participants in other timezones:

┌──────────────────────────────────┐
│ US Eastern (EST/EDT)             │
│ Fri, Oct 19, 10:30 AM            │  ← ⭐ Great for New York!
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ UK (GMT/BST)                     │
│ Fri, Oct 19, 3:30 PM             │  ← ⭐⭐ Perfect for London!
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Singapore (SGT)                  │
│ Fri, Oct 19, 10:30 PM            │  ← ⚠️ A bit late for Singapore
└──────────────────────────────────┘
```

**Result:** This time works well for 2 out of 3 participants!

---

## 🔧 How It Works Technically

### Data Flow
```
1. You enter time in event form
   └─> "Oct 19, 2025 8:00 AM" (local input)

2. Browser/System converts to UTC
   └─> zonedTimeToUtc("8:00 AM IST") = "2:30 AM UTC"

3. Sent to backend API
   └─> { startDateTime: "2025-10-19T02:30:00.000Z", timezone: "Asia/Kolkata" }

4. Stored in database
   └─> start_date_time: TIMESTAMP '2025-10-19 02:30:00' (UTC)
   └─> timezone: VARCHAR 'Asia/Kolkata'

5. US participant fetches event
   └─> GET /api/v1/events/{id}
   └─> Returns: { startDateTime: "2025-10-19T02:30:00.000Z" }

6. US participant's browser converts
   └─> utcToZonedTime("2:30 AM UTC", "America/New_York")
   └─> Result: "Oct 18, 2025 10:30 PM EST"

7. Displayed in their calendar
   └─> "Thu, Oct 18, 10:30 PM - 11:30 PM EST"
```

---

## 🎓 Understanding Timezone Offsets

### IST (India Standard Time)
- **Offset:** UTC+5:30
- **Example:** 8:00 AM IST = 2:30 AM UTC

### EST (US Eastern Standard Time)
- **Offset:** UTC-5
- **Example:** 10:30 PM EST = 3:30 AM UTC (next day)

### PST (US Pacific Standard Time)
- **Offset:** UTC-8
- **Example:** 7:30 PM PST = 3:30 AM UTC (next day)

### GMT/BST (UK)
- **Offset:** UTC+0 (GMT) or UTC+1 (BST in summer)
- **Example:** 3:30 AM GMT = 3:30 AM UTC

---

## ✨ Pro Tips

### 1. **Use the Timezone Preview**
Always add participants' emails before finalizing the time. The preview will help you choose a better slot.

### 2. **Look for "Different Day" Warnings**
If you see multiple "Different day" badges, consider adjusting the time to avoid confusion.

### 3. **Aim for Working Hours Overlap**
- India working hours: 9 AM - 6 PM IST
- US working hours: 9 AM - 6 PM EST/PST
- **Sweet spot:** 7 PM - 10 PM IST (morning in US)

### 4. **Consider DST (Daylight Saving Time)**
US observes DST (March-November), which shifts times by 1 hour:
- EST → EDT (UTC-4 instead of UTC-5)
- PST → PDT (UTC-7 instead of UTC-8)
The system handles this automatically!

### 5. **Use the TimezoneInfo Component**
After sending invitations, click on the event to see how it looks for participants. The TimezoneInfo component shows both perspectives.

---

## 🆘 Common Questions

**Q: What if I don't know my participant's timezone?**
A: The system shows ALL major timezones. Just scroll through the preview to find their region.

**Q: Will my US colleague see the meeting at the right time?**
A: Yes! They'll automatically see it in their local timezone (EST/PST/etc.)

**Q: What if I make a mistake?**
A: You can edit the event, and the system will recalculate all timezones automatically.

**Q: How do I know if it's a good time for them?**
A: Look at the timezone preview. Avoid times like:
- 2:00 AM - 6:00 AM (people are sleeping)
- 11:00 PM - 1:00 AM (too late)

**Q: Does this work for all countries?**
A: Yes! The system supports 100+ timezones worldwide.

---

## ✅ Summary

Your calendar application is **fully equipped** for cross-timezone collaboration:

✅ **Automatic timezone conversion** - No manual math needed  
✅ **Visual timezone preview** - See all participant times before creating  
✅ **Smart indicators** - Date changes and timezone differences highlighted  
✅ **Universal format** - UTC storage ensures accuracy  
✅ **User-friendly display** - Each person sees their local time  

**When you create a meeting at 8:00 AM IST:**
- ✅ You see: 8:00 AM IST
- ✅ US (EST) colleague sees: 10:30 PM EST (previous day)
- ✅ US (PST) colleague sees: 7:30 PM PST (previous day)
- ✅ UK colleague sees: 3:30 AM GMT

**Everything is automatic and accurate!** 🎉

---

**Updated:** October 18, 2025  
**Status:** ✅ Production Ready for Global Teams
