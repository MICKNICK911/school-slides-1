// js/storage.js
import { DEFAULT_LESSONS } from './data.js';

let lessons = { ...DEFAULT_LESSONS };
let isUpperCase = false;

export function getLessons() {
    return lessons;
}

export function setLessons(newLessons) {
    lessons = { ...DEFAULT_LESSONS, ...newLessons };
}

export function getUpperCase() {
    return isUpperCase;
}

export function setUpperCase(value) {
    isUpperCase = value;
}

export function loadFromLocal() {
    const saved = localStorage.getItem('customDictionary');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            setLessons(parsed);
            return true;
        } catch (e) {
            console.error("Invalid saved dictionary", e);
        }
    }
    return false;
}

export function saveToLocal() {
    localStorage.setItem('customDictionary', JSON.stringify(lessons));
}