// scripts/modules/utils.js
import { showNotification as uiShowNotification } from './uiManager.js';

// Markdown processing function
export function processMarkdown(text) {
    if (!text || typeof text !== 'string') return '';
    
    // Store original text for later replacement
    let processed = text;
    
    // Handle bullet points first (they start with + at beginning of line)
    processed = processed.replace(/^\+\s+(.*)$/gm, '<div class="markdown-bullet">$1</div>');
    
    // Replace **bold** or *bold* with strong tag (must handle both formats)
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="markdown-bold">$1</strong>');
    processed = processed.replace(/\*(?!\*)(.*?)\*/g, '<strong class="markdown-bold">$1</strong>');
    
    // Replace _italic_ with em tag
    processed = processed.replace(/_(.*?)_/g, '<em class="markdown-italic">$1</em>');
    
    // Replace -underline- with underline span
    processed = processed.replace(/-(.*?)-/g, '<span class="markdown-underline">$1</span>');
    
    // Replace [colored] with colored span
    processed = processed.replace(/\[(.*?)\]/g, '<span class="markdown-colored">$1</span>');
    
    // Handle line breaks
    processed = processed.replace(/\n/g, '<br>');
    
    return processed;
}

// Email validation
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Debounce function for search inputs
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

// Format date for display
export function formatDate(date, includeTime = true) {
    if (!date) return 'Unknown date';
    
    let dateObj;
    if (date instanceof Date) {
        dateObj = date;
    } else {
        dateObj = new Date(date);
    }
    
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    const dateStr = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    if (!includeTime) return dateStr;
    
    const timeStr = dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `${dateStr} at ${timeStr}`;
}

// Generate unique ID
export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}${timestamp}_${random}`;
}

// Validate table name
export function validateTableName(name) {
    if (!name || name.trim().length < 2) {
        return { valid: false, error: 'Table name must be at least 2 characters' };
    }
    
    if (name.length > 50) {
        return { valid: false, error: 'Table name must be less than 50 characters' };
    }
    
    if (/[<>:"/\\|?*]/.test(name)) {
        return { valid: false, error: 'Table name contains invalid characters' };
    }
    
    return { valid: true, error: '' };
}

// Sanitize input (basic XSS protection)
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Get file extension
export function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

// Validate JSON file
export function validateJsonFile(file, maxSizeMB = 5) {
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }
    
    if (getFileExtension(file.name) !== 'json') {
        return { valid: false, error: 'File must be JSON format' };
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
        return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }
    
    return { valid: true, error: '' };
}

// Deep clone object
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

// Truncate text with ellipsis
export function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Parse comma-separated examples
export function parseExamples(exString) {
    if (!exString) return [];
    
    return exString
        .split(',')
        .map(ex => ex.trim())
        .filter(ex => ex.length > 0);
}

// Export notification function for consistency
export function showNotification(message, type = 'success') {
    return uiShowNotification(message, type);
}

// Check if user is online
export function isOnline() {
    return navigator.onLine;
}

// Queue for offline operations
export class OfflineQueue {
    constructor(storageKey = 'offline_queue') {
        this.storageKey = storageKey;
    }
    
    add(operation) {
        const queue = this.getQueue();
        queue.push({
            ...operation,
            id: generateId('offline_'),
            timestamp: new Date().toISOString(),
            retryCount: 0
        });
        this.saveQueue(queue);
    }
    
    getQueue() {
        const queueJson = localStorage.getItem(this.storageKey);
        return queueJson ? JSON.parse(queueJson) : [];
    }
    
    saveQueue(queue) {
        localStorage.setItem(this.storageKey, JSON.stringify(queue));
    }
    
    remove(operationId) {
        const queue = this.getQueue();
        const filtered = queue.filter(op => op.id !== operationId);
        this.saveQueue(filtered);
    }
    
    clear() {
        localStorage.removeItem(this.storageKey);
    }
}

// Error handler with logging
export function handleError(error, context = '') {
    console.error(`Error ${context}:`, error);
    
    const errorMessage = error.message || 'An unexpected error occurred';
    const userMessage = context ? `${context}: ${errorMessage}` : errorMessage;
    
    showNotification(userMessage, 'error');
    return error;
}

// Promise with timeout
export function promiseWithTimeout(promise, timeoutMs, errorMessage = 'Operation timed out') {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
        )
    ]);
}

// Export all utilities for global access if needed
if (typeof window !== 'undefined') {
    window.utils = {
        processMarkdown,
        isValidEmail,
        debounce,
        formatDate,
        generateId,
        validateTableName,
        sanitizeInput,
        getFileExtension,
        validateJsonFile,
        deepClone,
        truncateText,
        parseExamples,
        showNotification,
        isOnline,
        OfflineQueue,
        handleError,
        promiseWithTimeout
    };
}

export default {
    processMarkdown,
    isValidEmail,
    debounce,
    formatDate,
    generateId,
    validateTableName,
    sanitizeInput,
    getFileExtension,
    validateJsonFile,
    deepClone,
    truncateText,
    parseExamples,
    showNotification,
    isOnline,
    OfflineQueue,
    handleError,
    promiseWithTimeout
};