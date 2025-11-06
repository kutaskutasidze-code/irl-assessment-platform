# FIX #2: Dashboard Visibility Functions

## Problem
Console errors showed:
```
loadNotifications is not defined!
updateSearchBarVisibility is not defined!
```

## Solution
Created `/js/dashboard-ui.js` file with:
- `window.loadNotifications()` - Shows notification bell and loads connection notifications
- `window.updateSearchBarVisibility()` - Shows search bar for startups only
- Both functions are now globally accessible via window object

## Manual Step Required
Add this line to `index.html` in the `<head>` section after the `dashboard-api.js` line:

```html
<script src="/irl-assessment-platform/js/dashboard-ui.js"></script>
```

The file should already be in the repository at `/js/dashboard-ui.js`.

## What This Fixes
✅ Notification bell will be visible
✅ Search bar will be visible for startups
✅ No more "function not defined" errors in console
✅ Connection system will work properly

## Testing
After adding the script tag:
1. Clear browser cache
2. Log in as a startup → should see notification bell AND search bar
3. Log in as organization → should see notification bell only
4. Check console → no more errors about undefined functions
