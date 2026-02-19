class AppManager {
    constructor() {
        this.loadToggle = document.getElementById('loadToggle');
        this.dictionaryFileInput = document.getElementById('dictionaryFileInput');
        this.splashScreen = document.getElementById('splashScreen');
        this.loadingProgress = document.getElementById('loadingProgress');
        
        this.init();
    }
    
    init() {

        console.log('AppManager initializing...');
        
        // Check if user is already logged in
        if (window.authManager && window.authManager.isAuthenticated()) {
            console.log('User already logged in');
            this.showMainApp();
            
            // Start cloud sync after app loads
            setTimeout(() => {
                this.startCloudSync();
            }, 3000);
        } else {
            console.log('User not logged in');
            this.hideSplashScreen();
        }

        console.log('AppManager initialized');
        
        // Start loading animation immediately
        if (this.loadingProgress) {
            this.loadingProgress.style.width = '100%';
        }
        
        // Check if user is already logged in
        if (window.authManager && window.authManager.isAuthenticated && window.authManager.isAuthenticated()) {
            console.log('User is already authenticated');
            // User is already logged in, proceed to main app
            this.showMainApp();
        } else {
            console.log('No user authenticated, showing login screen');
            // Show login screen immediately (hide splash screen)
            this.hideSplashScreen();
        }
        
        // Dictionary load event listener
        if (this.loadToggle) {
            this.loadToggle.addEventListener('click', () => {
                this.dictionaryFileInput.click();
            });
        }
        
        if (this.dictionaryFileInput) {
            this.dictionaryFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        // Load custom dictionary from localStorage
        this.loadSavedDictionary();
        
        // Check if instructions have been shown before
        const instructionsShown = localStorage.getItem('instructionsShown');
        if (!instructionsShown) {
            // Show instructions after app loads
            setTimeout(() => {
                if (window.uiManager) {
                    window.uiManager.toggleInstructionsModal();
                }
                localStorage.setItem('instructionsShown', 'true');
            }, 1000);
        }
    }
    
    showMainApp() {
        console.log('Showing main app');
        // Hide splash screen and show app
        setTimeout(() => {
            if (this.splashScreen) {
                this.splashScreen.style.opacity = '0';
                this.splashScreen.style.pointerEvents = 'none';
                
                // Remove splash screen after transition completes
                setTimeout(() => {
                    this.splashScreen.style.display = 'none';
                    const appContainer = document.getElementById('appContainer');
                    if (appContainer) {
                        appContainer.style.display = 'block';
                    }
                    
                    // Initialize UI components
                    if (window.uiManager) {
                        window.uiManager.init();
                    }
                    
                    // Show welcome notification
                    window.utils.showNotification('Welcome to Enhanced Digital Notes!', '📚');
                    
                }, 800);
            }
        }, 1500);
    }
    
    hideSplashScreen() {
        console.log('Hiding splash screen');
        // Hide splash screen immediately
        setTimeout(() => {
            if (this.splashScreen) {
                this.splashScreen.style.opacity = '0';
                this.splashScreen.style.pointerEvents = 'none';
                
                setTimeout(() => {
                    this.splashScreen.style.display = 'none';
                }, 800);
            }
        }, 1000);
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

    async startCloudSync() {
        console.log('AppManager: Starting cloud sync...');
        
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            console.log('AppManager: User not authenticated for cloud sync');
            return;
        }
        
        if (window.cloudDataManager) {
            try {
                // Wait for cloud data manager to initialize
                let attempts = 0;
                while (!window.cloudDataManager.isInitialized && attempts < 20) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                
                // Force refresh from cloud
                const success = await window.cloudDataManager.forceRefreshFromCloud();
                
                if (success) {
                    console.log('AppManager: Cloud sync successful');
                } else {
                    console.log('AppManager: No cloud data available');
                }
            } catch (error) {
                console.error('AppManager: Cloud sync error:', error);
            }
        } else {
            console.log('AppManager: CloudDataManager not available');
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

// Initialize App Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing AppManager');
    try {
        // Initialize all managers in correct order
        if (!window.utils) {
            console.error('Utils not loaded');
            return;
        }
        
        // Initialize AppManager
        const appManager = new AppManager();
        window.appManager = appManager;
        
        // Make sure splash screen eventually hides even if auth fails
        setTimeout(() => {
            const splashScreen = document.getElementById('splashScreen');
            if (splashScreen && splashScreen.style.display !== 'none') {
                console.log('Forcing splash screen hide');
                splashScreen.style.opacity = '0';
                splashScreen.style.pointerEvents = 'none';
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 800);
            }
        }, 10000); // 10 second timeout
        
    } catch (error) {
        console.error('Error initializing AppManager:', error);
        // Force hide splash screen on error
        const splashScreen = document.getElementById('splashScreen');
        if (splashScreen) {
            splashScreen.style.display = 'none';
        }
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.appManager) {
        window.appManager.saveState();
    }
});

// Global error handler to prevent app from getting stuck
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen && splashScreen.style.display !== 'none') {
        splashScreen.style.display = 'none';
    }
});