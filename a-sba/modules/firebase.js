import { firebaseConfig } from '../firebase-config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();

// Enable offline persistence (with error handling)
db.enablePersistence().catch((err) => {
    console.warn('Firebase persistence failed:', err.code);
    if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open – persistence works only in one tab at a time.');
    } else if (err.code === 'unimplemented') {
        console.warn('Browser does not support offline persistence.');
    }
});