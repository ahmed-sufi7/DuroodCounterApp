import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Database, getDatabase } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0b1C2d3E4f5G6h7I8j9K0l1M2n3O4p5Q",
  authDomain: "duroodcounterapp.firebaseapp.com",
  databaseURL: "https://duroodcounterapp-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "duroodcounterapp",
  storageBucket: "duroodcounterapp.firebasestorage.app",
  messagingSenderId: "221557639831",
  appId: "1:221557639831:web:aBcDeFgHiJkLmNoPqRsTuVwXyZ0"
};

// Initialize Firebase with proper error handling for hot reloading
let app: FirebaseApp;

try {
  // Check if Firebase app already exists
  const existingApps = getApps();
  
  if (existingApps.length === 0) {
    // No existing apps, safe to initialize
    app = initializeApp(firebaseConfig);
    if (__DEV__) {
      console.log('✅ Firebase initialized successfully');
    }
  } else {
    // App already exists, use the existing one
    app = getApp();
    if (__DEV__) {
      console.log('✅ Using existing Firebase app');
    }
  }
} catch (error) {
  if (__DEV__) {
    console.error('❌ Firebase initialization error:', error);
  }
  
  // Fallback: try to get existing app
  try {
    app = getApp();
  } catch {
    // Last resort: force initialize (this should rarely happen)
    app = initializeApp(firebaseConfig);
  }
}

// Initialize Realtime Database
export const database: Database = getDatabase(app);

export default app; 