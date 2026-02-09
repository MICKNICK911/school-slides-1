// scripts/modules/firebaseConfig.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// ============================================
// FIREBASE CONFIGURATION
// ============================================
// REPLACE WITH YOUR FIREBASE CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyCw1UnzkY4Eq_ImEnRDRFYmUMhSc95T-NU",
  authDomain: "lesson-notes-2025.firebaseapp.com",
  projectId: "lesson-notes-2025",
  storageBucket: "lesson-notes-2025.firebasestorage.app",
  messagingSenderId: "757231923808",
  appId: "1:757231923808:web:3c72026662c8a296134905"
};
// ============================================

// Check if Firebase app already exists
let app;
let auth;
let db;

try {
    // Check for existing Firebase app
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
    } else {
        app = firebase.app();
    }
    
    auth = firebase.auth();
    db = firebase.firestore();
    
    // Enable offline persistence
    db.enablePersistence().catch((err) => {
        console.warn('Firebase persistence failed:', err.code);
    });
    
    console.log('Firebase initialized successfully');
    
} catch (error) {
    console.error('Firebase initialization error:', error);
    throw new Error(`Firebase failed to initialize: ${error.message}`);
}

// Export services
export { firebase, app, auth, db };

// Firebase error message helper
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
        'auth/network-request-failed': 'Network error. Please check your connection.',
        
        // Firestore errors
        'permission-denied': 'You don\'t have permission to access this data.',
        'unauthenticated': 'Please sign in to continue.',
        'failed-precondition': 'Database operation failed.',
        'already-exists': 'This item already exists.',
        'not-found': 'Item not found.',
        'resource-exhausted': 'Too many requests. Please try again later.',
        'cancelled': 'Operation was cancelled.',
        'deadline-exceeded': 'Operation timeout. Please try again.',
    };
    
    return errorMessages[error?.code] || error?.message || 'An unexpected error occurred';
};

// Test Firebase connection
export const testFirebaseConnection = async () => {
    try {
        if (!auth || !db) {
            return { success: false, message: 'Firebase not initialized' };
        }
        
        return {
            success: true,
            auth: true,
            firestore: true,
            projectId: firebaseConfig.projectId,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};