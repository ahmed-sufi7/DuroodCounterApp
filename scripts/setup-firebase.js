#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Durood Counter App - Firebase Setup');
console.log('=====================================\n');

console.log('To set up Firebase for this app, follow these steps:\n');

console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Create a new project or select an existing one');
console.log('3. Enable Realtime Database');
console.log('4. Go to Project Settings > General');
console.log('5. Scroll down to "Your apps" and click "Add app"');
console.log('6. Choose "Web" and register your app');
console.log('7. Copy the Firebase configuration object\n');

console.log('Then update the config/firebase.ts file with your configuration.\n');

console.log('Example configuration structure:');
console.log(`
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
`);

console.log('\nAlso, make sure to set up your Realtime Database rules:');
console.log(`
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
`);

console.log('\n✅ Setup complete! You can now run "npm start" to launch the app.'); 