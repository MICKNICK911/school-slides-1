// Utility Functions

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Parse mark input with various formats
function parseMarkInput(input, maxMark) {
    if (input === '' || input === null || input === undefined) {
        return 0;
    }
    
    const strInput = String(input).trim();
    
    // Handle fraction format (e.g., "45/50")
    if (strInput.includes('/')) {
        const parts = strInput.split('/');
        if (parts.length === 2) {
            const numerator = parseFloat(parts[0]);
            const denominator = parseFloat(parts[1]);
            
            if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                const percentage = numerator / denominator;
                const convertedMark = percentage * maxMark;
                return Math.min(Math.max(Math.round(convertedMark * 100) / 100, 0), maxMark);
            }
        }
    }
    
    // Handle percentage format (e.g., "90%")
    if (strInput.includes('%')) {
        const percentage = parseFloat(strInput);
        if (!isNaN(percentage)) {
            const convertedMark = (percentage / 100) * maxMark;
            return Math.min(Math.max(Math.round(convertedMark * 100) / 100, 0), maxMark);
        }
    }
    
    // Handle decimal numbers
    const numValue = parseFloat(strInput);
    if (!isNaN(numValue)) {
        return Math.min(Math.max(Math.round(numValue * 100) / 100, 0), maxMark);
    }
    
    return 0;
}

// Get remarks based on score
function getRemarks(score, maxScore = 100) {
    const percentage = (score / maxScore) * 100;
    
    for (const grade of gradingScale) {
        if (percentage >= grade.min && percentage <= grade.max) {
            return { text: grade.text, class: grade.class };
        }
    }
    
    return { text: 'Fail', class: 'remarks-fail' };
}

// Debounce function
function debounce(func, wait) {
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

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Deep clone object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Compare two objects
function deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

// Format date
function formatDate(date = new Date()) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show toast notification
function showToast(type, title, message, duration = 5000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after duration
    const timeout = setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, duration);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timeout);
        toast.remove();
    });
}

// Show loading overlay
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    overlay.querySelector('p').textContent = message;
    overlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password strength
function isStrongPassword(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
}

// Retry function with exponential backoff
async function retry(fn, attempts = MAX_RETRY_ATTEMPTS, delay = RETRY_DELAY) {
    try {
        return await fn();
    } catch (error) {
        if (attempts <= 1) throw error;
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, attempts - 1, delay * 2);
    }
}

// Export data as JSON
function exportAsJSON(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Import JSON file
async function importJSONFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
    });
}

// Group array by key
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
}

// Sort array by key
function sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        } else {
            return a[key] < b[key] ? 1 : -1;
        }
    });
}

// Calculate statistics
function calculateStatistics(numbers) {
    if (numbers.length === 0) return null;
    
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const mode = findMode(numbers);
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    
    return { sum, mean, median, mode, min, max };
}

// Find mode in array
function findMode(arr) {
    const frequency = {};
    let maxFreq = 0;
    let mode = [];
    
    arr.forEach(value => {
        frequency[value] = (frequency[value] || 0) + 1;
        if (frequency[value] > maxFreq) {
            maxFreq = frequency[value];
            mode = [value];
        } else if (frequency[value] === maxFreq) {
            mode.push(value);
        }
    });
    
    return mode.length === arr.length ? null : mode;
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Truncate string
function truncate(str, length) {
    if (str.length <= length) return str;
    return str.substr(0, length) + '...';
}