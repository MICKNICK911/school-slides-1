class Utils {
    constructor() {
        this.DEFAULT_LESSONS = {
            "vowels": {
                "desc": "## Vowels\nThere are [5 Short vowels] and [5 long vowels]. Sometimes _/y/_ can act as a *vowel*.",
                "ex": ["a", "e", "i", "o", "u", "y"]
            },
            "consonants": {
                "desc": "## Consonants\nThere are [21] consonants in English.",
                "ex": ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"]
            },
            "Special Consonants": {
                "desc": "### Letter Magicians\nLetters that *change sounds*:\n- [x] = ks sound (_fox_)\n- [qu] = kw sound (_queen_)\n- [y] = short i sound (_gym_)\n- [y] = e sound (_happy_)\n- [y] = long i sound (_fly_)",
                "ex": ["quit", "queen", "quiz", "gym", "cry", "happy"]
            }
        };
    }
    
    // Format text with custom markers
    formatMarkdown(text) {
        // Split text into lines
        const lines = text.split('\n');
        let output = '';
        let inOrderedList = false;
        let inUnorderedList = false;
        
        for (let line of lines) {
            // Trim whitespace
            line = line.trim();
            
            // Skip empty lines
            if (!line) continue;
            
            // Process main topic (###)
            if (line.startsWith('### ')) {
                output += `<h2 class="markdown-h2">${this.processInlineMarkdown(line.slice(4))}</h2>`;
                continue;
            }
            
            // Process sub-topic (##)
            if (line.startsWith('## ')) {
                output += `<h3 class="markdown-h3">${this.processInlineMarkdown(line.slice(3))}</h3>`;
                continue;
            }
            
            // Process bold (#)
            if (line.startsWith('# ')) {
                output += `<strong class="markdown-strong">${this.processInlineMarkdown(line.slice(2))}</strong>`;
                continue;
            }
            
            // Process ordered list (-)
            if (line.startsWith('- ')) {
                if (!inOrderedList) {
                    output += '<ol class="markdown-ol">';
                    inOrderedList = true;
                }
                output += `<li class="markdown-li">${this.processInlineMarkdown(line.slice(2))}</li>`;
                continue;
            }
            
            // Process unordered list (+)
            if (line.startsWith('+ ')) {
                if (!inUnorderedList) {
                    output += '<ul class="markdown-ul">';
                    inUnorderedList = true;
                }
                output += `<li class="markdown-li">${this.processInlineMarkdown(line.slice(2))}</li>`;
                continue;
            }
            
            // Close lists if needed
            if (inOrderedList) {
                output += '</ol>';
                inOrderedList = false;
            }
            if (inUnorderedList) {
                output += '</ul>';
                inUnorderedList = false;
            }
            
            // Process regular paragraphs
            output += `<p class="markdown-p">${this.processInlineMarkdown(line)}</p>`;
        }
        
        // Close lists if still open
        if (inOrderedList) output += '</ol>';
        if (inUnorderedList) output += '</ul>';
        
        return output;
    }
    
    // Process inline markdown formatting
    processInlineMarkdown(text) {
        // Colored text: [text]
        text = text.replace(/\[([^\]]+)\]/g, '<span class="theme-color">$1</span>');
        
        // Underline: _text_
        text = text.replace(/_([^_]+)_/g, '<u class="markdown-u">$1</u>');
        
        // Italic: *text*
        text = text.replace(/\*([^*]+)\*/g, '<em class="markdown-em">$1</em>');
        
        return text;
    }
    
    // Show notification
    showNotification(message, icon, isError = false, isSuccess = false) {
        const notification = document.getElementById('dictionaryNotification');
        const notificationText = document.getElementById('notificationText');
        const notificationIcon = document.getElementById('notificationIcon');
        
        notificationText.textContent = message;
        notificationIcon.textContent = icon;
        
        if (isError) {
            notification.classList.add('error');
            notification.classList.remove('success');
        } else if (isSuccess) {
            notification.classList.add('success');
            notification.classList.remove('error');
        } else {
            notification.classList.remove('error', 'success');
        }
        
        notification.classList.add('active');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }
    
    // Apply case to text
    applyCase(text, isUpperCase) {
        return isUpperCase ? text.toUpperCase() : text.toLowerCase();
    }
    
    // Format time
    formatTime(date) {
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    // Format date for display
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString();
    }
    
    // Download JSON file
    downloadJSON(data, filename) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Read file as text
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
    
    // Validate JSON structure
    validateDictionary(json) {
        try {
            const data = typeof json === 'string' ? JSON.parse(json) : json;
            
            if (typeof data !== 'object' || data === null) {
                return false;
            }
            
            for (const key in data) {
                if (!data[key].desc || !Array.isArray(data[key].ex)) {
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }
    
    // Debounce function
    debounce(func, wait) {
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
    
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Sanitize input
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
}

// Initialize Utils
let utils;
document.addEventListener('DOMContentLoaded', () => {
    utils = new Utils();
    window.utils = utils;
});