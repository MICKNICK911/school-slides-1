class AppManager {
    constructor() {
        this.loadToggle = document.getElementById('loadToggle');
        this.dictionaryFileInput = document.getElementById('dictionaryFileInput');
        
        this.init();
    }
    
    init() {
        // Check if instructions have been shown before
        const instructionsShown = localStorage.getItem('instructionsShown');
        if (!instructionsShown) {
            // Show instructions after splash screen
            setTimeout(() => {
                if (window.uiManager) {
                    window.uiManager.toggleInstructionsModal();
                }
                localStorage.setItem('instructionsShown', 'true');
            }, 3000);
        }
        
        // Dictionary load event listener
        this.loadToggle.addEventListener('click', () => {
            this.dictionaryFileInput.click();
        });
        
        this.dictionaryFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Load custom dictionary from localStorage
        this.loadSavedDictionary();
    }
    
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const content = await window.utils.readFile(file);
            
            if (!window.utils.validateDictionary(content)) {
                throw new Error('Invalid Note structure');
            }
            
            const newDictionary = JSON.parse(content);
            
            // Update the dictionary in UI
            if (window.uiManager) {
                window.uiManager.updateLessons(newDictionary);
            }
            
            // Save to localStorage for persistence
            localStorage.setItem('customDictionary', JSON.stringify(newDictionary));
            
            // Update UI
            window.utils.showNotification('Notes loaded successfully!', '✅');
            
            // Clear the file input
            this.dictionaryFileInput.value = '';
            
            // Reset to home screen
            if (window.uiManager) {
                window.uiManager.showHomeScreen();
            }
        } catch (error) {
            console.error('Error loading Notes:', error);
            window.utils.showNotification('Error loading Notes. Invalid format.', '❌', true);
        }
    }
    
    loadSavedDictionary() {
        const savedDictionary = localStorage.getItem('customDictionary');
        if (savedDictionary) {
            try {
                const dictionary = JSON.parse(savedDictionary);
                if (window.uiManager) {
                    window.uiManager.updateLessons(dictionary);
                }
            } catch (e) {
                console.error('Failed to load saved Notes:', e);
            }
        }
    }
    
    // Save current state
    saveState() {
        if (window.uiManager) {
            window.uiManager.saveState();
        }
    }
    
    // Load state
    loadState() {
        if (window.uiManager) {
            window.uiManager.loadState();
        }
    }
}

// Initialize App Manager
let appManager;
document.addEventListener('DOMContentLoaded', () => {
    appManager = new AppManager();
    window.appManager = appManager;
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.appManager) {
        window.appManager.saveState();
    }
});