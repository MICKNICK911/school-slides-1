// scripts/cloud-data-manager.js - UPDATED VERSION
class CloudDataManager {
    constructor() {
        this.cloudDataLoaded = false;
        this.localDataLoaded = false;
        this.isInitialized = false;
        
        // Initialize when ready
        this.init();
    }
    
    async init() {
        console.log('CloudDataManager: Starting initialization...');
        
        // Wait for auth to be ready
        await this.waitForAuth();
        
        // Start data loading
        await this.loadData();
        
        this.isInitialized = true;
        console.log('CloudDataManager: Initialization complete');
    }
    
    async waitForAuth() {
        console.log('CloudDataManager: Waiting for auth...');
        
        // Wait for auth manager
        let attempts = 0;
        while (!window.authManager && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.authManager) {
            console.log('CloudDataManager: Auth manager not available');
            return false;
        }
        
        // Wait for auth state
        attempts = 0;
        while (!window.authManager.isAuthenticated() && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        return window.authManager.isAuthenticated();
    }
    
    async loadData() {
        console.log('CloudDataManager: Loading data...');
        
        // Always try cloud first
        console.log('CloudDataManager: Attempting to load from cloud...');
        const cloudData = await this.loadFromCloud();
        
        if (cloudData && Object.keys(cloudData).length > 0) {
            console.log('CloudDataManager: Cloud data loaded successfully');
            this.handleCloudData(cloudData);
        } else {
            console.log('CloudDataManager: No cloud data, loading from local...');
            this.loadFromLocal();
        }
    }
    
    async loadFromCloud() {
        try {
            console.log('CloudDataManager: Loading from Firestore...');
            
            // Check if we have database manager
            if (!window.databaseManager || !window.databaseManager.currentUserId) {
                console.log('CloudDataManager: No user authenticated for cloud load');
                return null;
            }
            
            console.log('CloudDataManager: User ID:', window.databaseManager.currentUserId);
            
            // Load user notes from Firestore
            const userNotes = await window.databaseManager.getUserNotes();
            console.log('CloudDataManager: Retrieved notes from Firestore:', userNotes.length);
            
            if (userNotes.length === 0) {
                console.log('CloudDataManager: No notes found in Firestore');
                return null;
            }
            
            // Convert notes to the dictionary format used by the app
            const cloudDictionary = {};
            userNotes.forEach(note => {
                if (note && note.topic) {
                    cloudDictionary[note.topic] = {
                        desc: note.desc || '',
                        ex: note.ex || []
                    };
                }
            });
            
            console.log('CloudDataManager: Converted to dictionary:', Object.keys(cloudDictionary).length, 'topics');
            console.log('CloudDataManager: Topics:', Object.keys(cloudDictionary));
            
            return cloudDictionary;
        } catch (error) {
            console.error('CloudDataManager: Error loading from cloud:', error);
            return null;
        }
    }
    
    loadFromLocal() {
        console.log('CloudDataManager: Loading from local storage...');
        
        try {
            const savedDictionary = localStorage.getItem('customDictionary');
            
            if (savedDictionary) {
                const dictionary = JSON.parse(savedDictionary);
                console.log('CloudDataManager: Local data loaded:', Object.keys(dictionary).length, 'topics');
                this.handleLocalData(dictionary);
                return dictionary;
            } else {
                console.log('CloudDataManager: No local data found');
                this.useDefaultData();
                return null;
            }
        } catch (error) {
            console.error('CloudDataManager: Error loading from local:', error);
            this.useDefaultData();
            return null;
        }
    }
    
    handleCloudData(cloudDictionary) {
        console.log('CloudDataManager: Processing cloud data...');
        this.cloudDataLoaded = true;
        
        if (!window.uiManager) {
            console.error('CloudDataManager: UI Manager not available');
            return;
        }
        
        // Merge cloud data with default lessons
        const mergedLessons = {
            ...window.utils.DEFAULT_LESSONS,
            ...cloudDictionary
        };
        
        console.log('CloudDataManager: Merged lessons total:', Object.keys(mergedLessons).length, 'topics');
        
        // Update the UI with merged data
        window.uiManager.updateLessons(mergedLessons);
        
        // Save to local storage as backup
        this.saveToLocalStorage(cloudDictionary);
        
        // Show notification
        if (window.utils) {
            setTimeout(() => {
                window.utils.showNotification(`Loaded ${Object.keys(cloudDictionary).length} notes from cloud`, '☁️', false, true);
            }, 1000);
        }
    }
    
    handleLocalData(localDictionary) {
        console.log('CloudDataManager: Processing local data...');
        this.localDataLoaded = true;
        
        if (!window.uiManager) {
            console.error('CloudDataManager: UI Manager not available');
            return;
        }
        
        // Merge local data with default lessons
        const mergedLessons = {
            ...window.utils.DEFAULT_LESSONS,
            ...localDictionary
        };
        
        console.log('CloudDataManager: Merged local lessons:', Object.keys(mergedLessons).length, 'topics');
        
        // Update the UI with merged data
        window.uiManager.updateLessons(mergedLessons);
        
        // Show notification
        if (window.utils) {
            window.utils.showNotification(`Loaded ${Object.keys(localDictionary).length} notes from local storage`, '💾');
        }
    }
    
    useDefaultData() {
        console.log('CloudDataManager: Using default data');
        
        if (!window.uiManager) {
            console.error('CloudDataManager: UI Manager not available');
            return;
        }
        
        window.uiManager.updateLessons(window.utils.DEFAULT_LESSONS);
        
        if (window.utils) {
            window.utils.showNotification('Using default Notes', '📚');
        }
    }
    
    saveToLocalStorage(dictionary) {
        try {
            localStorage.setItem('customDictionary', JSON.stringify(dictionary));
            console.log('CloudDataManager: Saved cloud data to local storage');
        } catch (error) {
            console.error('CloudDataManager: Error saving to local storage:', error);
        }
    }
    
    async syncToCloud() {
        console.log('CloudDataManager: Syncing to cloud...');
        
        if (!window.databaseManager || !window.databaseManager.currentUserId) {
            console.log('CloudDataManager: Not authenticated, skipping sync');
            return;
        }
        
        try {
            // Load local dictionary
            const savedDictionary = localStorage.getItem('customDictionary');
            if (!savedDictionary) {
                console.log('CloudDataManager: No local data to sync');
                return;
            }
            
            const localDictionary = JSON.parse(savedDictionary);
            let syncedCount = 0;
            
            console.log('CloudDataManager: Local data to sync:', Object.keys(localDictionary).length, 'topics');
            
            // Save each local entry to cloud
            for (const [topic, data] of Object.entries(localDictionary)) {
                try {
                    // Check if this note already exists in cloud
                    const existingNotes = await window.databaseManager.getUserNotes();
                    const noteExists = existingNotes.some(note => note.topic === topic);
                    
                    if (!noteExists) {
                        const noteData = {
                            topic: topic,
                            desc: data.desc || '',
                            ex: data.ex || []
                        };
                        
                        const noteId = await window.databaseManager.saveNote(noteData);
                        if (noteId) {
                            syncedCount++;
                            console.log(`CloudDataManager: Synced "${topic}" to cloud`);
                        }
                        
                        // Small delay to prevent rate limiting
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } else {
                        console.log(`CloudDataManager: Note "${topic}" already exists in cloud`);
                    }
                } catch (error) {
                    console.error(`CloudDataManager: Error syncing "${topic}":`, error);
                }
            }
            
            console.log(`CloudDataManager: Sync complete: ${syncedCount} notes synced`);
            
            if (syncedCount > 0 && window.utils) {
                window.utils.showNotification(`Synced ${syncedCount} notes to cloud`, '🔄');
            }
        } catch (error) {
            console.error('CloudDataManager: Error during sync:', error);
        }
    }
    
    // Force refresh from cloud
    async forceRefreshFromCloud() {
        console.log('CloudDataManager: Force refreshing from cloud...');
        const cloudData = await this.loadFromCloud();
        
        if (cloudData && Object.keys(cloudData).length > 0) {
            this.handleCloudData(cloudData);
            return true;
        }
        
        return false;
    }
}

// Initialize CloudDataManager
let cloudDataManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - Initializing CloudDataManager');
    try {
        cloudDataManager = new CloudDataManager();
        window.cloudDataManager = cloudDataManager;
    } catch (error) {
        console.error('Error initializing CloudDataManager:', error);
    }
});