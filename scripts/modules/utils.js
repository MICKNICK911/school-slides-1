// scripts/modules/utils.js
import { showNotification as uiShowNotification } from './uiManager.js';

// Markdown processing
export function processMarkdown(text) {
    if (!text || typeof text !== 'string') return '';
    
    let processed = text;
    
    // Handle bullet points
    processed = processed.replace(/^\+\s+(.*)$/gm, '<div class="markdown-bullet">$1</div>');
    
    // Bold
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="markdown-bold">$1</strong>');
    processed = processed.replace(/\*(?!\*)(.*?)\*/g, '<strong class="markdown-bold">$1</strong>');
    
    // Italic
    processed = processed.replace(/_(.*?)_/g, '<em class="markdown-italic">$1</em>');
    
    // Underline
    processed = processed.replace(/-(.*?)-/g, '<span class="markdown-underline">$1</span>');
    
    // Colored
    processed = processed.replace(/\[(.*?)\]/g, '<span class="markdown-colored">$1</span>');
    
    // Line breaks
    processed = processed.replace(/\n/g, '<br>');
    
    // Escape HTML
    processed = processed
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    
    return processed;
}

// Email validation
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Debounce
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show notification
export function showNotification(message, type = 'success') {
    return uiShowNotification(message, type);
}

// Check online status
export function isOnline() {
    return navigator.onLine;
}

// Error handler
export function handleError(error, context = '') {
    console.error(`Error ${context}:`, error);
    const errorMessage = error.message || 'An unexpected error occurred';
    const userMessage = context ? `${context}: ${errorMessage}` : errorMessage;
    showNotification(userMessage, 'error');
    return error;
}