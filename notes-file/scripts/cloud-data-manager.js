// scripts/cloud-data-manager.js
class CloudDataManager {
    constructor() {
        this.cloudDataLoaded = false;
        this.localDataLoaded = false;
    }
    
    async init() {
        console.log('CloudDataManager initializing...');
        
        // Wait for auth to be ready
        await this.waitForAuth();
        
        // Load data with cloud-first strategy
        await this.loadData();
    }
    
    async waitForAuth() {
        // Wait up to 5 seconds for auth to initialize
        let attempts = 0;
        while (!window.authManager && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        return window.authManager;
    }
    
    async loadData() {
        console.log('Starting data loading with cloud-first strategy...');
        
        // First, try to load from cloud
        const cloudData = await this.loadFromCloud();
        
        if (cloudData) {
            console.log('Cloud data loaded successfully');
            this.handleCloudData(cloudData);
        } else {
            console.log('No cloud data available, loading from local storage');
            // Fall back to local storage
            this.loadFromLocal();
        }
    }
    
    async loadFromCloud() {
        if (!window.databaseManager || !window.databaseManager.currentUserId) {
            console.log('No authenticated user, skipping cloud load');
            return null;
        }
        
        try {
            console.log('Loading data from cloud...');
            
            // Load user notes
            const userNotes = await window.databaseManager.getUserNotes();
            console.log('Loaded user notes from cloud:', userNotes.length);
            
            if (userNotes.length === 0) {
                console.log('No notes found in cloud');
                return null;
            }
            
            // Convert notes to dictionary format
            const cloudDictionary = {};
            userNotes.forEach(note => {
                if (note.topic) {
                    cloudDictionary[note.topic] = {
                        desc: note.desc || '',
                        ex: note.ex || []
                    };
                }
            });
            
            console.log('Converted cloud data:', Object.keys(cloudDictionary).length, 'topics');
            return cloudDictionary;
        } catch (error) {
            console.error('Error loading from cloud:', error);
            return null;
        }
    }
    
    loadFromLocal() {
        try {
            console.log('Loading data from local storage...');
            
            // Load from localStorage
            const savedDictionary = localStorage.getItem('customDictionary');
            
            if (savedDictionary) {
                const dictionary = JSON.parse(savedDictionary);
                console.log('Loaded local data:', Object.keys(dictionary).length, 'topics');
                this.handleLocalData(dictionary);
                return dictionary;
            } else {
                console.log('No local data found');
                this.useDefaultData();
                return null;
            }
        } catch (error) {
            console.error('Error loading from local storage:', error);
            this.useDefaultData();
            return null;
        }
    }
    
    handleCloudData(cloudDictionary) {
        this.cloudDataLoaded = true;
        
        // Update UI with cloud data
        if (window.uiManager) {
            // Merge cloud data with default lessons
            const mergedLessons = {
                ...window.utils.DEFAULT_LESSONS,
                ...cloudDictionary
            };
            
            window.uiManager.updateLessons(mergedLessons);
            window.utils.showNotification('Notes loaded from cloud', '☁️');
            
            // Save to local storage as backup
            this.saveToLocalStorage(cloudDictionary);
        }
    }
    
    handleLocalData(localDictionary) {
        this.localDataLoaded = true;
        
        // Update UI with local data
        if (window.uiManager) {
            // Merge local data with default lessons
            const mergedLessons = {
                ...window.utils.DEFAULT_LESSONS,
                ...localDictionary
            };
            
            window.uiManager.updateLessons(mergedLessons);
            window.utils.showNotification('Notes loaded from local storage', '💾');
        }
    }
    
    useDefaultData() {
        console.log('Using default data');
        
        if (window.uiManager) {
            window.uiManager.updateLessons(window.utils.DEFAULT_LESSONS);
            window.utils.showNotification('Using default Notes', '📚');
        }
    }
    
    saveToLocalStorage(dictionary) {
        try {
            localStorage.setItem('customDictionary', JSON.stringify(dictionary));
            console.log('Cloud data saved to local storage as backup');
        } catch (error) {
            console.error('Error saving to local storage:', error);
        }
    }
    
    // Sync local changes to cloud
    async syncToCloud() {
        if (!window.databaseManager || !window.databaseManager.currentUserId) {
            console.log('Not authenticated, skipping sync');
            return;
        }
        
        try {
            console.log('Starting sync to cloud...');
            
            // Load local dictionary
            const savedDictionary = localStorage.getItem('customDictionary');
            if (!savedDictionary) {
                console.log('No local data to sync');
                return;
            }
            
            const localDictionary = JSON.parse(savedDictionary);
            let syncedCount = 0;
            
            // Save each local entry to cloud
            for (const [topic, data] of Object.entries(localDictionary)) {
                try {
                    const noteData = {
                        topic: topic,
                        desc: data.desc || '',
                        ex: data.ex || []
                    };
                    
                    const noteId = await window.databaseManager.saveNote(noteData);
                    if (noteId) {
                        syncedCount++;
                    }
                    
                    // Small delay to prevent rate limiting
                    await new Promise(resolve => setTimeout(resolve, 50));
                } catch (error) {
                    console.error(`Error syncing "${topic}":`, error);
                }
            }
            
            console.log(`Sync complete: ${syncedCount} notes synced`);
            
            if (syncedCount > 0 && window.utils) {
                window.utils.showNotification(`Synced ${syncedCount} notes to cloud`, '🔄');
            }
        } catch (error) {
            console.error('Error during sync:', error);
        }
    }
}

// Initialize CloudDataManager
let cloudDataManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing CloudDataManager...');
    try {
        cloudDataManager = new CloudDataManager();
        window.cloudDataManager = cloudDataManager;
        
        // Start initialization after a short delay
        setTimeout(() => {
            cloudDataManager.init();
        }, 2000);
    } catch (error) {
        console.error('Error initializing CloudDataManager:', error);
    }
});