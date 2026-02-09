// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCw1UnzkY4Eq_ImEnRDRFYmUMhSc95T-NU",
  authDomain: "lesson-notes-2025.firebaseapp.com",
  projectId: "lesson-notes-2025",
  storageBucket: "lesson-notes-2025.firebasestorage.app",
  messagingSenderId: "757231923808",
  appId: "1:757231923808:web:3c72026662c8a296134905"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Firestore collections
const USERS_COLLECTION = 'users';
const NOTES_COLLECTION = 'notes';
const BOOKMARKS_COLLECTION = 'bookmarks';
const HISTORY_COLLECTION = 'history';

// Export Firebase services
window.firebaseServices = {
    auth,
    db,
    storage,
    collections: {
        USERS_COLLECTION,
        NOTES_COLLECTION,
        BOOKMARKS_COLLECTION,
        HISTORY_COLLECTION
    }
};