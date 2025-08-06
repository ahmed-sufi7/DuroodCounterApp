# Durood Counter App

A React Native mobile application built with Expo for counting Durood recitations with a collective goal of 15 crore (150 million) before Milad un Nabi 2025.

## Features

- **Real-time Counter**: Large tally counter button for incrementing durood count
- **Global Progress**: Display current global count from all users
- **Personal Tracking**: Track your personal durood count locally
- **Bulk Upload**: Manual input field to add bulk durood counts
- **Progress Bar**: Visual progress towards the 15 crore target
- **Countdown Timer**: Time remaining until Milad un Nabi 2025
- **Real-time Updates**: Global counter updates in real-time when any user increments

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Realtime Database
3. Update the Firebase configuration in `config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  databaseURL: "your-database-url",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};
```

### 3. Database Rules

Set up your Firebase Realtime Database rules:

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
    }
  }
}
```

### 4. Run the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Technical Stack

- **Framework**: React Native with Expo
- **Database**: Firebase Realtime Database
- **Local Storage**: AsyncStorage
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Navigation**: Expo Router

## Project Structure

```
├── app/
│   └── (tabs)/
│       ├── _layout.tsx          # Tab navigation layout
│       └── index.tsx            # Main counter screen
├── components/
│   └── DuroodCounter.tsx        # Main counter component
├── config/
│   └── firebase.ts              # Firebase configuration
├── hooks/
│   ├── useDuroodCounter.ts      # Counter logic hook
│   └── useCountdown.ts          # Countdown timer hook
├── services/
│   ├── firebaseService.ts       # Firebase operations
│   └── storageService.ts        # Local storage operations
└── utils/
    └── helpers.ts               # Utility functions
```

## Features in Detail

### Main Counter Screen

- Large, easily tappable counter button
- Real-time global count display
- Personal count tracking
- Progress bar showing percentage towards target
- Countdown timer to Milad un Nabi 2025

### Manual Upload Feature

- Input field to manually add bulk durood count
- Confirmation dialog for large numbers (>10,000)
- Validation for valid numeric input

### Real-time Updates

- Global counter updates instantly when any user increments
- Local counter persists even when offline
- Automatic sync when connection is restored

### Data Storage

- No authentication required (anonymous users)
- Personal count stored locally using AsyncStorage
- Global count stored in Firebase Realtime Database
- Each increment/upload updates both local and global counters

## Target Goal

The app aims to reach **15 crore (150 million)** Durood recitations before Milad un Nabi 2025. The progress is tracked globally across all users in real-time.

## Contributing

This is a simple, focused app designed to help Muslims track their Durood recitations collectively. The app is intentionally kept simple without complex features like user authentication, leaderboards, or social features to maintain focus on the core purpose.

## License

This project is open source and available under the MIT License.
