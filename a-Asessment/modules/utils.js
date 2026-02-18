// Constants
export const STORAGE_KEY = 'studentResultsData_v2';
export const FIREBASE_COLLECTION = 'student_results';
export const VERSION = '2.1';
export const GUEST_USER_ID = 'guest_user';

export const DEFAULT_CAT_COLUMNS = Object.freeze([
    { id: 'cat1', name: 'CAT1', maxScore: 15 },
    { id: 'cat2', name: 'CAT2', maxScore: 20 },
    { id: 'cat3', name: 'CAT3', maxScore: 15 }
]);

export const INITIAL_STUDENTS = Object.freeze([
    "Student 1", "Student 2", "Student 3", "Student 4", "Student 5",
    "Student 6", "Student 7", "Student 8", "Student 9", "Student 10"
]);

export const REMARKS_CONFIG = Object.freeze([
    { min: 90, text: 'Distinction', class: 'remarks-excellent' },
    { min: 80, text: 'Excellent', class: 'remarks-excellent' },
    { min: 70, text: 'Very Good', class: 'remarks-very-good' },
    { min: 60, text: 'Good', class: 'remarks-good' },
    { min: 50, text: 'Pass', class: 'remarks-pass' },
    { min: 0,  text: 'Fail',   class: 'remarks-fail' }
]);

// Helper functions
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function parseMarkInput(input, maxMark) {
    if (input === '' || input == null) return 0;
    const str = String(input).trim();

    // fraction "45/50"
    if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
                const perc = num / den;
                return Math.min(Math.max(Math.round(perc * maxMark), 0), maxMark);
            }
        }
    }

    // percentage "90%"
    if (str.includes('%')) {
        const perc = parseFloat(str);
        if (!isNaN(perc)) {
            return Math.min(Math.max(Math.round((perc / 100) * maxMark), 0), maxMark);
        }
    }

    // plain number
    const num = parseFloat(str);
    if (!isNaN(num)) {
        return Math.min(Math.max(Math.round(num), 0), maxMark);
    }
    return 0;
}

export function getRemarks(score, maxScore = 100) {
    const percentage = (score / maxScore) * 100;
    for (const r of REMARKS_CONFIG) {
        if (percentage >= r.min) return r;
    }
    return REMARKS_CONFIG[REMARKS_CONFIG.length - 1];
}