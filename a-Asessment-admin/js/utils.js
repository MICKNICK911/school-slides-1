function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function parseMarkInput(input, maxMark) {
    if (input === '' || input === null || input === undefined) return 0;
    const strInput = String(input).trim();
    if (strInput.includes('/')) {
        const parts = strInput.split('/');
        if (parts.length === 2) {
            const numerator = parseFloat(parts[0]);
            const denominator = parseFloat(parts[1]);
            if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                const percentage = numerator / denominator;
                return Math.min(Math.max(Math.round(percentage * maxMark * 100) / 100, 0), maxMark);
            }
        }
    }
    if (strInput.includes('%')) {
        const percentage = parseFloat(strInput);
        if (!isNaN(percentage)) {
            return Math.min(Math.max(Math.round((percentage / 100) * maxMark * 100) / 100, 0), maxMark);
        }
    }
    const numValue = parseFloat(strInput);
    if (!isNaN(numValue)) {
        return Math.min(Math.max(Math.round(numValue * 100) / 100, 0), maxMark);
    }
    return 0;
}

function getRemarks(score, maxScore = 100) {
    const percentage = (score / maxScore) * 100;
    for (const grade of gradingScale) {
        if (percentage >= grade.min && percentage <= grade.max) {
            return { text: grade.text, class: grade.class };
        }
    }
    return { text: 'Fail', class: 'remarks-fail' };
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

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

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function formatDate(date = new Date()) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

function showToast(type, title, message, duration = 5000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <div class="toast-content"><div class="toast-title">${title}</div><div class="toast-message">${message}</div></div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(toast);
    const timeout = setTimeout(() => toast.remove(), duration);
    toast.querySelector('.toast-close').addEventListener('click', () => { clearTimeout(timeout); toast.remove(); });
}

function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    overlay.querySelector('p').textContent = message;
    overlay.style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
}

async function retry(fn, attempts = MAX_RETRY_ATTEMPTS, delay = RETRY_DELAY) {
    try {
        return await fn();
    } catch (error) {
        if (attempts <= 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, attempts - 1, delay * 2);
    }
}

function exportAsJSON(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function importJSONFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            try { resolve(JSON.parse(e.target.result)); }
            catch (error) { reject(new Error('Invalid JSON file')); }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
    });
}