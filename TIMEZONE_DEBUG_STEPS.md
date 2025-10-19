# 🐛 Timezone Debugging Steps

## ⚠️ Important: Server is on Port 5174

Your dev server is running on **port 5174**, not 5173!

**Access your app at:**
```
http://localhost:5174
```

---

## 🧪 Step-by-Step Testing

### Step 1: Clear Everything & Refresh

1. **Close all browser tabs** with the calendar app
2. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete`
   - Select "Cached images and files"
   - Click "Clear data"
3. **Open NEW tab** → Go to `http://localhost:5174`

### Step 2: Check Console for Debug Logs

1. **Press F12** to open DevTools
2. **Click Console tab**
3. **Look for these logs:**

You should see:
```
🌍 WeekView Timezone: Asia/Kolkata
👤 User timezone from DB: null
🔍 useEvents - Timezone: Asia/Kolkata
🔍 useEvents - Raw events from API: [...]
📅 First event processed: {
  title: "Social Event",
  startDateTime: "2025-10-19T02:41:00.000Z",
  startLocal: 2025-10-19T08:11:00.000+05:30,
  timezone: "Asia/Kolkata"
}
```

**What to check:**
- ✅ "WeekView Timezone" should show your current timezone (NOT "UTC")
- ✅ "User timezone from DB" will show `null` (that's expected)
- ✅ "useEvents - Timezone" should match WeekView timezone
- ✅ "startLocal" should show your timezone offset (e.g., +05:30 for India)

---

### Step 3: Verify Browser Timezone Detection

In the **Console tab**, type:
```javascript
Intl.DateTimeFormat().resolvedOptions().timeZone
```

Press Enter. You should see:
```
"Asia/Kolkata"
```
or whatever your system timezone is.

---

### Step 4: Test Timezone Changes with DevTools

#### 4a. Open Sensors Panel
```
1. Press Ctrl+Shift+P
2. Type: "sensors"
3. Select "Show Sensors"
4. Sensors panel opens at bottom
```

#### 4b. Change to New York
```
1. In Sensors panel, under "Location", click dropdown
2. Select "New York"
3. Press F5 to refresh page
4. Check Console logs again
```

You should now see:
```
🌍 WeekView Timezone: America/New_York
👤 User timezone from DB: null
📅 First event processed: {
  startLocal: 2025-10-18T22:41:00.000-04:00  ← Different time!
}
```

Your 8:11 AM event should now show as **10:41 PM (previous day)**

#### 4c. Change to London
```
1. In Sensors, select "London"
2. Press F5 to refresh
3. Check Console
```

Should show:
```
🌍 WeekView Timezone: Europe/London
📅 First event processed: {
  startLocal: 2025-10-19T03:41:00.000+01:00  ← 3:41 AM
}
```

#### 4d. Change to Tokyo
```
1. In Sensors, select "Tokyo"
2. Press F5 to refresh
3. Check Console
```

Should show:
```
🌍 WeekView Timezone: Asia/Tokyo
📅 First event processed: {
  startLocal: 2025-10-19T11:41:00.000+09:00  ← 11:41 AM
}
```

---

## 🔍 What to Look For in the Calendar Grid

### Visual Test:

| Timezone | Event Time Displayed | Grid Position |
|----------|---------------------|---------------|
| **Mumbai (Asia/Kolkata)** | 8:11 AM | Top of 8:00 AM hour |
| **New York (America/New_York)** | 10:41 PM | Top of 10:00 PM hour |
| **London (Europe/London)** | 3:41 AM | Top of 3:00 AM hour |
| **Tokyo (Asia/Tokyo)** | 11:41 AM | Top of 11:00 AM hour |

**The event should physically move to different time slots!**

---

## ❌ Troubleshooting

### Problem 1: Still seeing "UTC" in console

**Solution:**
```
1. Check you're on http://localhost:5174 (NOT 5173)
2. Hard refresh: Ctrl+F5
3. Clear browser cache completely
4. Restart browser
```

### Problem 2: Console shows correct timezone, but event time doesn't change

**Possible causes:**
1. **Old cached JavaScript** - Clear cache and hard refresh
2. **Event stored incorrectly in DB** - Check raw event data in console
3. **Timezone conversion not working** - Check `startLocal` in console logs

**Debug:**
Look at the console log:
```javascript
📅 First event processed: {
  title: "Social Event",
  startDateTime: "2025-10-19T02:41:00.000Z",  ← UTC time from database
  startLocal: 2025-10-19T08:11:00.000+05:30,  ← Converted to your TZ
  timezone: "Asia/Kolkata"                     ← Your timezone
}
```

If `startLocal` is correct but grid shows wrong time:
- Problem is in the rendering logic, not timezone conversion
- Check `SimpleEventCard.jsx` component

### Problem 3: DevTools timezone change doesn't work

**Try this:**
```
1. F12 → Sensors tab
2. Change timezone
3. In Console, type:
   new Date().toString()
4. Press Enter
```

Should show the new timezone:
```
"Sat Oct 19 2025 10:41:00 GMT-0400 (Eastern Daylight Time)"
```

If it doesn't change, try:
```
1. Close DevTools
2. Restart browser
3. Open DevTools fresh
4. Try again
```

### Problem 4: No console logs appearing

**Check:**
1. ✅ You're on `http://localhost:5174`
2. ✅ Page has fully loaded
3. ✅ Console filter is set to "All levels" (not "Errors only")
4. ✅ You have events in your calendar to trigger the logs

**Create a test event if needed:**
```
1. Click any time slot
2. Create event: "Timezone Test"
3. Time: Tomorrow at 8:00 AM
4. Click Save
5. Check console for logs
```

---

## 📊 Expected Console Output (Full Example)

When you load the page with Mumbai timezone:

```javascript
// From WeekView component
🌍 WeekView Timezone: Asia/Kolkata
👤 User timezone from DB: null

// From useEvents hook (when data loads)
🔍 useEvents - Timezone: Asia/Kolkata
🔍 useEvents - Raw events from API: Array(1)
  [0]: {
    id: 123,
    title: "Social Event",
    startDateTime: "2025-10-19T02:41:00.000Z",  // UTC from database
    endDateTime: "2025-10-19T03:41:00.000Z",
    ...
  }

📅 First event processed: {
  title: "Social Event",
  startDateTime: "2025-10-19T02:41:00.000Z",
  startLocal: Sun Oct 19 2025 08:11:00 GMT+0530 (India Standard Time),
  timezone: "Asia/Kolkata"
}
```

---

## ✅ Success Checklist

After testing, you should confirm:

- [ ] Console shows correct timezone (not "UTC")
- [ ] Console shows "User timezone from DB: null"
- [ ] `startLocal` has correct timezone offset
- [ ] Event appears at correct time in grid
- [ ] Changing DevTools timezone changes console logs
- [ ] Changing DevTools timezone changes event display time
- [ ] Event physically moves in the grid
- [ ] No JavaScript errors in console

---

## 🎬 Quick Video Test

Do this 30-second test:

```
1. Go to http://localhost:5174
2. F12 → Console
3. Look for timezone logs
4. Screenshot the console output
5. Ctrl+Shift+P → "sensors" → Show Sensors
6. Change to "New York"
7. F5 (refresh)
8. Screenshot the console again
9. Compare the two screenshots
```

**The timezone and startLocal should be different!**

---

## 📝 Report Back

After testing, tell me:

1. **What timezone do you see in console?**
   ```
   🌍 WeekView Timezone: ???
   ```

2. **What does startLocal show?**
   ```
   startLocal: ???
   ```

3. **When you change to New York, does it change?**
   - Yes / No
   - If yes, what's the new time?

4. **Does the event move in the grid?**
   - Yes / No

5. **Any errors in console?**
   - Copy/paste them

---

## 🚀 Next Steps

If it works:
- ✅ Timezone detection is working!
- ✅ We can remove debug logs
- ✅ Move on to testing cross-timezone invitations

If it doesn't work:
- 📋 Share console output
- 📋 Share screenshot of event in grid
- 📋 Share your system timezone setting
- 🔧 We'll debug further

---

**Start testing now at http://localhost:5174!** 🎯
