// scripts/modules/firebaseConfig.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// ============================================
// YOUR FIREBASE CONFIG (from Firebase Console)
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyCw1UnzkY4Eq_ImEnRDRFYmUMhSc95T-NU",
  authDomain: "lesson-notes-2025.firebaseapp.com",
  projectId: "lesson-notes-2025",
  storageBucket: "lesson-notes-2025.firebasestorage.app",
  messagingSenderId: "757231923808",
  appId: "1:757231923808:web:3c72026662c8a296134905"
};
// ============================================

// Initialize Firebase
let app;
let auth;
let db;

try {
  // Initialize Firebase app
  app = firebase.initializeApp(firebaseConfig);
  
  // Get Firebase services
  auth = firebase.auth();
  db = firebase.firestore();
  
  console.log('✅ Firebase initialized successfully');
  console.log('Project:', firebaseConfig.projectId);
  
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  
  // For debugging: check what went wrong
  if (error.code === 'app/duplicate-app') {
    console.warn('Firebase app already exists. Using existing app.');
    app = firebase.app();
    auth = firebase.auth();
    db = firebase.firestore();
  } else {
    console.error('Fatal Firebase error. Check your configuration.');
    throw error;
  }
}

// Export services
export { firebase, app, auth, db };

// Simple error message helper
export const getFirebaseErrorMessage = (error) => {
  const errorMessages = {
    // Authentication errors
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    
    // Common Firestore errors
    'permission-denied': 'You don\'t have permission to access this data.',
    'unauthenticated': 'Please sign in to continue.',
  };
  
  return errorMessages[error?.code] || error?.message || 'An error occurred';
};

// Quick connection test
export const testFirebaseConnection = async () => {
  try {
    if (!auth || !db) {
      return { success: false, message: 'Firebase not initialized' };
    }
    
    // Test auth
    const authReady = typeof auth.onAuthStateChanged === 'function';
    
    // Test Firestore
    const dbReady = typeof db.collection === 'function';
    
    return {
      success: authReady && dbReady,
      auth: authReady,
      firestore: dbReady,
      projectId: firebaseConfig.projectId
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
};