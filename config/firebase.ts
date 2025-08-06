import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0b1C2d3E4f5G6h7I8j9K0l1M2n3O4p5Q",
  authDomain: "duroodcounterapp.firebaseapp.com",
  databaseURL: "https://duroodcounterapp.firebaseio.com",
  projectId: "duroodcounterapp",
  storageBucket: "duroodcounterapp.firebasestorage.app",
  messagingSenderId: "221557639831",
  appId: "1:221557639831:web:aBcDeFgHiJkLmNoPqRsTuVwXyZ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);

export default app; 