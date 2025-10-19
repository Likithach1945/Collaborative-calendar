# 🧪 Quick Timezone Test - Do This NOW!

## ⚡ 5-Minute Test (No Setup Required!)

### Step 1: Open DevTools (30 seconds)
```
1. Press F12 (or right-click → Inspect)
2. Press Ctrl+Shift+P (Command Palette)
3. Type: "sensors"
4. Click: "Show Sensors"
```

You should see a "Sensors" tab at the bottom with "Location" settings.

---

### Step 2: Test Timezone Changes (2 minutes)

#### 🇮🇳 Test as India User
```
1. In Sensors tab, set:
   Location: "Mumbai" or "Kolkata"
   OR manually select timezone: Asia/Kolkata

2. Refresh page (F5)

3. Create event at 8:00 AM

4. ✅ Check: Event appears at 8:00 AM in calendar grid
```

#### 🇺🇸 Test as US User
```
1. In Sensors tab, change to:
   Location: "New York"
   OR manually select: America/New_York

2. Refresh page (F5)

3. Look at your 8:00 AM event

4. ✅ Check: Event now shows at 10:30 PM (previous day!)
```

#### 🇬🇧 Test as UK User
```
1. In Sensors tab, change to:
   Location: "London"
   OR manually select: Europe/London

2. Refresh page (F5)

3. Look at the same event

4. ✅ Check: Event shows at 3:30 AM
```

---

### Step 3: Test Timezone Preview (2 minutes)

```
1. Set timezone back to "Mumbai" (Asia/Kolkata)

2. Click "Create Event" button

3. Fill in:
   Title: "Test Meeting"
   Start: Oct 19, 2025 at 8:00 AM
   Participants: test@example.com

4. ✅ Check: Scroll down to see "🌍 Time for participants"

5. ✅ Verify you see:
   - US Eastern (EST/EDT): Thu, Oct 18, 10:30 PM
   - US Pacific (PST/PDT): Thu, Oct 18, 7:30 PM
   - UK (GMT/BST): Fri, Oct 19, 3:30 AM
   - And more timezones...

6. ✅ Check: "Different day" badge on US times
```

---

## ✅ Success Checklist

After the 5-minute test, you should see:

- ✅ Timezone changes in DevTools affect displayed times
- ✅ Event at 8 AM IST → shows 10:30 PM EST
- ✅ Timezone preview appears when adding participants
- ✅ Preview shows 8-12 different timezones
- ✅ "Different day" badge on appropriate times
- ✅ Calendar grid repositions events correctly

---

## 📸 Screenshots to Look For

### 1. DevTools Sensors Tab
```
┌─────────────────────────────────────┐
│ Sensors                             │
├─────────────────────────────────────┤
│ Location                            │
│ [Mumbai ▼]                          │
│ Timezone override:                  │
│ [Asia/Kolkata ▼]                    │
│                                     │
│ Locale override:                    │
│ [None ▼]                            │
└─────────────────────────────────────┘
```

### 2. Timezone Preview in Event Form
```
┌─────────────────────────────────────┐
│ 🌍 Time for participants:           │
├─────────────────────────────────────┤
│ ┌─────────────────────────────┐   │
│ │ US Eastern (EST/EDT)        │   │
│ │ Thu, Oct 18, 10:30 PM       │   │
│ │ [Different day]             │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ US Pacific (PST/PDT)        │   │
│ │ Thu, Oct 18, 7:30 PM        │   │
│ │ [Different day]             │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 3. Calendar Grid with Event
```
India (IST):          US East (EST):       UK (GMT):
8 AM  ┌────────┐     8 PM                 2 AM
      │Event!  │     9 PM                 3 AM  ┌────────┐
9 AM  └────────┘     10 PM ┌────────┐    4 AM  │Event!  │
                            │Event!  │          └────────┘
                     11 PM └────────┘
```

---

## 🎯 Expected Results

### Test Case 1: Create Event at 8:00 AM IST
| Your View | Time Displayed |
|-----------|----------------|
| As India user (IST) | 8:00 AM |
| As US user (EST) | 10:30 PM (previous day) |
| As UK user (GMT) | 3:30 AM |

### Test Case 2: Create Event at 9:00 PM IST
| Your View | Time Displayed |
|-----------|----------------|
| As India user (IST) | 9:00 PM |
| As US user (EST) | 11:30 AM (same day) |
| As UK user (GMT) | 3:30 PM (same day) |

---

## 🚨 If Something's Wrong

### Event doesn't move when changing timezone?
```
1. Make sure you REFRESHED the page (F5) after changing timezone
2. Check browser console for errors (F12 → Console tab)
3. Clear browser cache (Ctrl+Shift+Delete)
```

### Timezone preview not showing?
```
1. Make sure you added an email in "Participants" field
2. Check the form data is valid
3. Scroll down - preview is at the bottom of form
```

### Times seem incorrect?
```
1. Verify DevTools timezone is actually changed
2. Check your computer's system time is correct
3. Look at browser console for timezone errors
```

---

## 🎬 Live Test Video

Want me to walk you through it? Here's the exact sequence:

```
1. Open your app at http://localhost:5173
2. Press F12
3. Press Ctrl+Shift+P
4. Type "sensors" and press Enter
5. At the bottom, you'll see "Sensors" tab
6. Under "Location", select "New York"
7. Press F5 to refresh
8. Click your "Social Event" 
9. It should show at 2:00 PM EST (not 8:11 AM!)
10. Change Location to "Mumbai"
11. Press F5
12. Same event now shows at 8:11 AM IST
```

**That's it! If this works, your timezone system is perfect!** ✅

---

## 📊 Quick Reference Card

| Action | Expected Behavior |
|--------|------------------|
| Change DevTools timezone | All displayed times update after refresh |
| Add participant email | Timezone preview appears in form |
| Create event at 8 AM IST | Preview shows 10:30 PM EST |
| View as different user | Each sees time in their timezone |
| "Different day" badge | Appears when date changes across zones |
| Calendar grid position | Matches the time in current timezone |

---

## ✅ You're Done When:

- ✅ You can change timezone in DevTools
- ✅ Event times change accordingly
- ✅ Timezone preview shows multiple zones
- ✅ Calendar grid shows events at correct times
- ✅ "Different day" badges appear when appropriate

**Estimated Time: 5 minutes**

**Result: Confidence that your timezone system works!** 🎉

---

**Try it now! Open DevTools (F12) and start testing!** 🚀
