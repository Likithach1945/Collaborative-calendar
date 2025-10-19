# 🔎 Advanced Timezone Debugging

## 🧪 Test Event Time: 6:14 PM in Mumbai (Oct 18, 2025)

I've added extensive debugging to help troubleshoot why your event time isn't changing when you change the timezone. Here's what to look for:

## 🔄 Steps to Debug

1. **Hard refresh** your browser (Ctrl+F5) to get the latest changes
2. **Open DevTools** (F12) → Console tab
3. **Look for these specific logs:**
   - 🌍 WeekView - Browser timezone detection: (Your detected timezone)
   - 🔍 useEvents - Raw events from API: (The raw event data)
   - 🕒 SimpleEventCard - startDateTime: (The event's raw UTC time)
   - ⏰ formatTimeForDisplay - input date/timezone: (Time formatting details)

## 🔎 What to Check in Browser Console

### 1. Verify Browser Timezone Detection
```javascript
// In Console, type:
Intl.DateTimeFormat().resolvedOptions().timeZone
```

### 2. Verify DevTools Override is Working
```javascript
// In Console, type:
new Date().toString()
```
This should show your current timezone abbreviation (BST, IST, EDT, etc.)

### 3. Test Direct Time Conversion
```javascript
// In Console, paste:
const testUTC = new Date("2025-10-18T12:44:00.000Z");  // 6:14 PM IST
const options = { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  hour: 'numeric', minute: 'numeric', hour12: true };
new Intl.DateTimeFormat('en-US', options).format(testUTC);
```

## 🚨 Specific Issues to Look For

1. **Event Data Issue:** Look at raw event data - is startDateTime correct in UTC?
2. **Conversion Issue:** Check SimpleEventCard logs - is the timezone correct?
3. **Rendering Issue:** Check WeekView - is it positioning events correctly?

## 🔍 Visual Debug Elements Added

I've added two visual debug elements:

1. **Timezone Label** on each event card showing the timezone being used
2. **UTC Time Label** above each event showing the raw UTC time

## 🔄 Testing Different Regions

For a **Mumbai event at 6:14 PM (Oct 18)**, you should see:

| Location | Expected Time Display |
|----------|---------------------|
| Mumbai (IST) | 6:14 PM |
| London (BST) | 1:44 PM |
| New York (EDT) | 8:44 AM |

## 🐛 Possible Root Causes

1. **Event stored with wrong UTC time** - Check raw event data
2. **Timezone conversion not working** - Check formatTimeForDisplay logs
3. **DevTools timezone override not working** - Check browser detection logs
4. **Cache issues** - Try clearing all browser cache

## 🔧 Advanced Debugging

If still not working, try this in browser console:

```javascript
// Test direct timezone conversion
const rawTime = "2025-10-18T12:44:00.000Z"; // Your event time
console.table({
  "UTC": new Date(rawTime).toISOString(),
  "Mumbai": new Intl.DateTimeFormat('en-US', {timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'long'}).format(new Date(rawTime)),
  "London": new Intl.DateTimeFormat('en-US', {timeZone: 'Europe/London', dateStyle: 'full', timeStyle: 'long'}).format(new Date(rawTime)),
  "New York": new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'long'}).format(new Date(rawTime))
});
```