import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDSQtqZ1IXy0a2ZDH4-OJFZOPCGdn33Vtw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dimentiaapp-2f0fb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dimentiaapp-2f0fb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dimentiaapp-2f0fb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "584455965650",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:584455965650:web:de26a8fc28d4c5db67560b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-S96KH44BW6"
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Firestore with IndexedDB multi-tab persistence enabled
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
};
