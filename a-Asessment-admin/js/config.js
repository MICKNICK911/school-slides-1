const firebaseConfig = {
  apiKey: "AIzaSyCw1UnzkY4Eq_ImEnRDRFYmUMhSc95T-NU",
  authDomain: "lesson-notes-2025.firebaseapp.com",
  projectId: "lesson-notes-2025",
  storageBucket: "lesson-notes-2025.firebasestorage.app",
  messagingSenderId: "757231923808",
  appId: "1:757231923808:web:3c72026662c8a296134905"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

db.enablePersistence().catch(err => {
    if (err.code === 'failed-precondition') console.warn('Multiple tabs open, persistence disabled');
    else if (err.code === 'unimplemented') console.warn('Browser does not support persistence');
});

const APP_VERSION = '2.0.0';
const STORAGE_KEY = 'studentResultsData';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;
const AUTO_SAVE_DELAY = 500;
const SYNC_INTERVAL = 30000;

const defaultCatColumns = [
    { id: 'cat1', name: 'CAT1', maxScore: 15 },
    { id: 'cat2', name: 'CAT2', maxScore: 20 },
    { id: 'cat3', name: 'CAT3', maxScore: 15 }
];

const initialStudents = [
    "Student 1", "Student 2", "Student 3", "Student 4", "Student 5",
    "Student 6", "Student 7", "Student 8", "Student 9", "Student 10"
];

const gradingScale = [
    { min: 90, max: 100, text: 'Distinction', class: 'remarks-excellent' },
    { min: 80, max: 89, text: 'Excellent', class: 'remarks-excellent' },
    { min: 70, max: 79, text: 'Very Good', class: 'remarks-very-good' },
    { min: 60, max: 69, text: 'Good', class: 'remarks-good' },
    { min: 50, max: 59, text: 'Pass', class: 'remarks-pass' },
    { min: 0, max: 49, text: 'Fail', class: 'remarks-fail' }
];

const errorMessages = {
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    AUTH_ERROR: 'Authentication error. Please log in again.',
    PERMISSION_ERROR: 'You don\'t have permission to perform this action.',
    NOT_FOUND: 'The requested data was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SYNC_ERROR: 'Failed to sync data. Will retry automatically.',
    SAVE_ERROR: 'Failed to save data. Please try again.'
};