import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return (
    process.env.REACT_APP_FIREBASE_API_KEY &&
    process.env.REACT_APP_FIREBASE_PROJECT_ID &&
    process.env.REACT_APP_FIREBASE_API_KEY !== 'your_firebase_api_key' &&
    process.env.REACT_APP_FIREBASE_PROJECT_ID !== 'your_project_id'
  );
};

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:abcdef'
};

// Initialize Firebase only if configured
let app = null;
let db = null;
let analytics = null;

try {
  if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
    console.log('✅ Firebase initialized successfully');
  } else {
    console.warn('⚠️ Firebase not configured - running in demo mode. Create a .env file with your Firebase credentials.');
  }
} catch (error) {
  console.warn('⚠️ Firebase initialization failed - running in demo mode:', error.message);
}

export { db, analytics, isFirebaseConfigured };
export default app;
