// cloud-data-manager.js - SIMPLIFIED
class CloudDataManager {
    constructor() {
        console.log('CloudDataManager: Initializing...');
        
        // Wait a bit then start
        setTimeout(() => {
            this.init();
        }, 2000);
    }
    
    async init() {
        console.log('CloudDataManager: Starting...');
        
        // Wait for auth
        await this.waitForAuth();
        
        // Load data
        await this.loadData();
    }
    
    async waitForAuth() {
        let attempts = 0;
        while (!window.authManager && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.authManager && window.authManager.isAuthenticated()) {
            console.log('CloudDataManager: User authenticated');
            return true;
        }
        
        console.log('CloudDataManager: User not authenticated');
        return false;
    }
    
    async loadData() {
        console.log('CloudDataManager: Loading data...');
        
        // First try cloud
        const cloudData = await this.loadFromCloud();
        
        if (cloudData && Object.keys(cloudData).length > 0) {
            console.log('CloudDataManager: Cloud data loaded');
            this.handleCloudData(cloudData);
        } else {
            console.log('CloudDataManager: No cloud data, trying local');
            this.loadFromLocal();
        }
    }
    
    // Update the loadFromCloud method
async loadFromCloud() {
    const user = window.firebaseServices.auth.currentUser;
    if (!user) {
        console.log('CloudDataManager: No user logged in');
        return null;
    }
    
    console.log('CloudDataManager: Loading notes for user:', user.uid);
    
    try {
        const notes = await window.databaseManager.getUserNotes();
        
        if (notes.length === 0) {
            console.log('CloudDataManager: No notes found for this user');
            return null;
        }
        
        // Convert to dictionary format
        const userDictionary = {};
        notes.forEach(note => {
            if (note.userId === user.uid) { // Double-check it's user's own note
                userDictionary[note.topic] = {
                    desc: note.desc || '',
                    ex: note.ex || []
                };
            }
        });
        
        console.log('CloudDataManager: Loaded user notes:', Object.keys(userDictionary).length);
        return userDictionary;
    } catch (error) {
        console.error('CloudDataManager: Error loading user notes:', error);
        return null;
    }
}
    
    loadFromLocal() {
        console.log('CloudDataManager: Loading from local storage...');
        
        try {
            const saved = localStorage.getItem('customDictionary');
            if (saved) {
                const dict = JSON.parse(saved);
                console.log('CloudDataManager: Local data:', Object.keys(dict).length, 'topics');
                this.handleLocalData(dict);
                return dict;
            } else {
                console.log('CloudDataManager: No local data');
                this.useDefaultData();
                return null;
            }
        } catch (error) {
            console.error('CloudDataManager: Error loading local:', error);
            this.useDefaultData();
            return null;
        }
    }
    
    handleCloudData(dict) {
        console.log('CloudDataManager: Handling cloud data...');
        
        if (!window.uiManager) {
            console.error('CloudDataManager: No UI manager');
            return;
        }
        
        // Merge with defaults
        const merged = {
            ...window.utils.DEFAULT_LESSONS,
            ...dict
        };
        
        // Update UI
        window.uiManager.updateLessons(merged);
        
        // Save to local
        this.saveToLocal(dict);
        
        // Show notification
        if (window.utils) {
            window.utils.showNotification(`Loaded ${Object.keys(dict).length} notes from cloud`, '☁️');
        }
    }
    
    handleLocalData(dict) {
        console.log('CloudDataManager: Handling local data...');
        
        if (!window.uiManager) {
            console.error('CloudDataManager: No UI manager');
            return;
        }
        
        // Merge with defaults
        const merged = {
            ...window.utils.DEFAULT_LESSONS,
            ...dict
        };
        
        // Update UI
        window.uiManager.updateLessons(merged);
        
        // Show notification
        if (window.utils) {
            window.utils.showNotification(`Loaded ${Object.keys(dict).length} notes from local storage`, '💾');
        }
    }
    
    useDefaultData() {
        console.log('CloudDataManager: Using default data');
        
        if (window.uiManager) {
            window.uiManager.updateLessons(window.utils.DEFAULT_LESSONS);
            
            if (window.utils) {
                window.utils.showNotification('Using default notes', '📚');
            }
        }
    }
    
    saveToLocal(dict) {
        try {
            localStorage.setItem('customDictionary', JSON.stringify(dict));
            console.log('CloudDataManager: Saved to local storage');
        } catch (error) {
            console.error('CloudDataManager: Error saving to local:', error);
        }
    }
    
    async forceRefreshFromCloud() {
        console.log('CloudDataManager: Force refreshing from cloud...');
        
        const cloudData = await this.loadFromCloud();
        if (cloudData) {
            this.handleCloudData(cloudData);
            return true;
        }
        
        return false;
    }
}

// Initialize
let cloudDataManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        cloudDataManager = new CloudDataManager();
        window.cloudDataManager = cloudDataManager;
    } catch (error) {
        console.error('Error initializing CloudDataManager:', error);
    }
});