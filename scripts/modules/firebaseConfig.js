// scripts/modules/firebaseConfig.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/database'; // Keep for compatibility if needed

// ============================================
// FIREBASE CONFIGURATION
// ============================================
// REPLACE WITH YOUR ACTUAL FIREBASE CONFIG FROM FIREBASE CONSOLE
// Go to: Firebase Console → Project Settings → General → Your apps → Firebase SDK snippet
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

// Firebase initialization with error handling
let app;
let auth;
let db;
let rtdb; // Realtime Database (optional)

try {
    // Initialize Firebase
    app = firebase.initializeApp(firebaseConfig);
    
    // Initialize services
    auth = firebase.auth();
    db = firebase.firestore();
    
    // Optional: Initialize Realtime Database if you plan to use it
    // rtdb = firebase.database();
    
    // Firestore settings for better offline support (optional)
    if (typeof window !== 'undefined') {
        // Enable offline persistence
        db.enablePersistence()
            .catch((err) => {
                console.warn('Firestore offline persistence not supported:', err.code);
                if (err.code === 'failed-precondition') {
                    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
                } else if (err.code === 'unimplemented') {
                    console.warn('The current browser doesn\'t support offline persistence.');
                }
            });
        
        // Set Firestore settings (optional)
        db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });
    }
    
    console.log('Firebase initialized successfully');
    
} catch (error) {
    console.error('Firebase initialization error:', error);
    
    // Handle initialization errors gracefully
    if (!app) {
        console.error('Failed to initialize Firebase. Please check your configuration.');
        
        // Create mock services for development/fallback (optional)
        if (process.env.NODE_ENV === 'development') {
            console.warn('Creating mock Firebase services for development');
            
            // Mock auth service
            auth = {
                currentUser: null,
                onAuthStateChanged: (callback) => {
                    console.warn('Mock auth: No real authentication available');
                    callback(null);
                    return () => {};
                },
                signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not initialized')),
                createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not initialized')),
                signOut: () => Promise.reject(new Error('Firebase not initialized'))
            };
            
            // Mock firestore service
            db = {
                collection: () => ({
                    doc: () => ({
                        get: () => Promise.reject(new Error('Firebase not initialized')),
                        set: () => Promise.reject(new Error('Firebase not initialized')),
                        update: () => Promise.reject(new Error('Firebase not initialized')),
                        delete: () => Promise.reject(new Error('Firebase not initialized')),
                        onSnapshot: () => () => {}
                    })
                })
            };
        }
    }
}

// Firebase service exports
export { firebase, app, auth, db };

// Optional: Export Realtime Database if initialized
// export { rtdb };

// Helper function to check Firebase connection
export const checkFirebaseConnection = async () => {
    if (!app) {
        return { connected: false, error: 'Firebase not initialized' };
    }
    
    try {
        // Simple check by trying to get server timestamp
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        return { connected: true, timestamp: timestamp };
    } catch (error) {
        return { connected: false, error: error.message };
    }
};

// Firebase error code to human-readable message mapping
export const firebaseErrorMessages = {
    // Auth errors
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    
    // Firestore errors
    'permission-denied': 'You don\'t have permission to access this data.',
    'not-found': 'The requested document was not found.',
    'already-exists': 'A document with this ID already exists.',
    'resource-exhausted': 'Operation limit exceeded. Please try again later.',
    'failed-precondition': 'Operation failed due to a precondition.',
    'aborted': 'Operation was aborted.',
    'out-of-range': 'Value is out of range.',
    'unimplemented': 'Operation is not implemented.',
    'internal': 'An internal error occurred.',
    'unavailable': 'Service is temporarily unavailable.',
    'data-loss': 'Unrecoverable data loss or corruption.',
    'unauthenticated': 'User is not authenticated.'
};

// Helper to get user-friendly error message
export const getFirebaseErrorMessage = (error) => {
    if (!error || !error.code) {
        return 'An unexpected error occurred.';
    }
    
    // Check if we have a custom message for this error code
    if (firebaseErrorMessages[error.code]) {
        return firebaseErrorMessages[error.code];
    }
    
    // Default to the original error message
    return error.message || 'An unexpected error occurred.';
};

// Initialize Firebase Emulators for local development (optional)
export const initializeEmulators = () => {
    if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_USE_EMULATORS === 'true') {
        try {
            // Uncomment and configure if using Firebase Emulators
            /*
            console.log('Initializing Firebase Emulators...');
            
            // Auth Emulator
            auth.useEmulator('http://localhost:9099');
            
            // Firestore Emulator
            db.useEmulator('localhost', 8080);
            
            // Realtime Database Emulator
            // rtdb.useEmulator('localhost', 9000);
            
            console.log('Firebase Emulators initialized');
            */
        } catch (error) {
            console.warn('Failed to initialize emulators:', error);
        }
    }
};

// Cleanup function (for testing/teardown)
export const cleanupFirebase = async () => {
    try {
        if (app) {
            await app.delete();
            console.log('Firebase app cleaned up');
        }
    } catch (error) {
        console.error('Error cleaning up Firebase:', error);
    }
};

// Default export
export default {
    firebase,
    app,
    auth,
    db,
    checkFirebaseConnection,
    getFirebaseErrorMessage,
    firebaseErrorMessages,
    cleanupFirebase
};