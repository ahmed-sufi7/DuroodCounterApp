# Firebase Database Setup Instructions

## Problem: Global count not updating

Your Firebase Realtime Database might need proper rules configuration.

## Solution Steps:

### 1. Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `duroodcounterapp`

### 2. Configure Database Rules

1. Go to **Realtime Database** in the left sidebar
2. Click on **Rules** tab
3. Replace the existing rules with this configuration:

```json
{
  "rules": {
    "globalCount": {
      ".read": true,
      ".write": true
    },
    "lastUpdated": {
      ".read": true,
      ".write": true
    },
    ".read": false,
    ".write": false
  }
}
```

### 3. Publish Rules

1. Click **Publish** to save the rules
2. Confirm the changes

### 4. Test the App

1. Refresh your web app
2. Click the 🔧 button in the header to test Firebase connection
3. Try adding a durood count using the +1 button or bulk add
4. Check if the global count updates

## Debug Information

- Check browser console for detailed Firebase logs
- The 🔧 button will show connection status and test Firebase operations
- Green dot (🟢) = Connected, Red dot (🔴) = Offline

## Alternative: Initialize Database Manually

If the above doesn't work, you can manually initialize the database:

1. Go to **Realtime Database** > **Data** tab
2. Click on the root node "+"
3. Add these entries:
   - Key: `globalCount`, Value: `0`
   - Key: `lastUpdated`, Value: `1704648000000`

Your database should now work properly!
