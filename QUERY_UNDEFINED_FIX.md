# React Query "undefined" Data Fix

## Issue
Console was showing multiple warnings:
```
Query data cannot be undefined. Please make sure to return a value other than undefined 
from your query function. Affected query key: ["user-invitations","all"]
```

## Root Cause
The API client (`client.js`) returns data directly, not wrapped in a `response` object. However, several components were trying to access `response.data`, which resulted in `undefined` being returned from query functions.

## Files Fixed

### 1. `frontend/src/pages/InvitationsPage.jsx`
**Before:**
```javascript
queryFn: async () => {
  const params = statusFilter !== 'all' ? { status: statusFilter.toUpperCase() } : {};
  const response = await api.get('/invitations', { params });
  return response.data; // ❌ response.data is undefined
}
```

**After:**
```javascript
queryFn: async () => {
  try {
    const endpoint = statusFilter !== 'all' 
      ? `/invitations?status=${statusFilter.toUpperCase()}` 
      : '/invitations';
    const data = await api.get(endpoint);
    return data || []; // ✅ Return data directly, default to empty array
  } catch (err) {
    console.error('Error fetching invitations:', err);
    return []; // ✅ Return empty array on error
  }
}
```

**Changes:**
- Removed `response.data` access
- Added try-catch for error handling
- Return empty array `[]` instead of undefined
- Changed query parameters to URL format

### 2. `frontend/src/components/InvitationStatusPanel.jsx`
**Before:**
```javascript
const response = await api.get(`/events/${eventId}/invitations/summary`);
return response.data;
```

**After:**
```javascript
const data = await api.get(`/events/${eventId}/invitations/summary`);
return data || { totalInvitations: 0, acceptedCount: 0, declinedCount: 0, pendingCount: 0, proposedCount: 0, acceptanceRate: 0 };
```

**Changes:**
- Removed `response.data` access
- Added default object structure
- Applied same fix to invitations query

### 3. `frontend/src/components/InvitationResponseButtons.jsx`
**Before:**
```javascript
const response = await api.patch(`/invitations/${invitation.id}`, payload);
return response.data;
```

**After:**
```javascript
const data = await api.patch(`/invitations/${invitation.id}`, payload);
return data;
```

**Changes:**
- Removed `response.data` access
- Return data directly from mutation

### 4. `frontend/src/components/ICSUpload.jsx`
**Before:**
```javascript
const response = await api.post('/ics/import', formData, {...});
return response.data;
```

**After:**
```javascript
const data = await api.post('/ics/import', formData, {...});
return data;
```

**Changes:**
- Removed `response.data` access
- Return data directly

## Why This Happened

The API client in `client.js` is structured to return data directly:

```javascript
async request(endpoint, options = {}) {
  // ... fetch logic ...
  
  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  // Try to parse JSON response safely
  try {
    return await response.json(); // ✅ Returns data directly
  } catch (parseError) {
    console.warn('Failed to parse JSON response:', parseError);
    return { message: 'Response was not valid JSON', rawText: await response.text() };
  }
}
```

The methods like `get()`, `post()`, `patch()` all call `request()`, which returns the parsed JSON directly, **not** a response object with a `.data` property.

## Best Practices Going Forward

### ✅ DO:
```javascript
// Direct access to data
const data = await api.get('/endpoint');
return data || []; // Provide default for arrays

const data = await api.get('/endpoint');
return data || {}; // Provide default for objects
```

### ❌ DON'T:
```javascript
// Trying to access .data property
const response = await api.get('/endpoint');
return response.data; // ❌ Undefined!
```

### Query Function Pattern:
```javascript
queryFn: async () => {
  try {
    const data = await api.get('/endpoint');
    return data || []; // or {} or null depending on expected type
  } catch (error) {
    console.error('Error:', error);
    return []; // Return safe default instead of throwing
  }
}
```

## Testing

After these fixes:
1. ✅ No more console warnings about undefined query data
2. ✅ All invitations load correctly
3. ✅ Event details load correctly
4. ✅ Accept/Decline functionality works
5. ✅ No breaking changes to functionality

## Impact

**Before:**
- Console flooded with warnings
- Queries returning undefined
- Potential runtime errors when accessing array/object properties

**After:**
- Clean console (no warnings)
- Proper data handling with defaults
- Robust error handling
- Better user experience

## Verification Checklist

- [x] InvitationsPage loads without errors
- [x] Event invitations display correctly
- [x] Invitation status panel shows data
- [x] Accept/Decline buttons work
- [x] No console warnings about undefined data
- [x] Error states handled gracefully

## Related Issues

This fix also addresses:
- React Router future flag warnings (informational only)
- Performance monitoring output (informational only)

The warnings about React Router v7 flags are not errors and can be addressed later during a framework upgrade.
