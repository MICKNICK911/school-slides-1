// scripts/cloud-sync.js
class CloudSyncManager {
    constructor() {
        this.isSyncing = false;
        this.lastSyncTime = null;
        this.syncCallbacks = [];
        
        this.init();
    }
    
    init() {
        console.log('CloudSyncManager: Initializing...');
        
        // Listen for auth changes
        if (window.firebaseServices && window.firebaseServices.auth) {
            window.firebaseServices.auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('CloudSyncManager: User logged in, starting sync');
                    this.syncFromCloud();
                }
            });
        }
        
        // Setup sync button
        this.setupSyncUI();
    }
    
    setupSyncUI() {
        // Add sync button
        setTimeout(() => {
            const syncBtn = document.createElement('div');
            syncBtn.className = 'theme-toggle';
            syncBtn.id = 'cloudSyncBtn';
            syncBtn.innerHTML = '🔄';
            syncBtn.title = 'Sync from Cloud';
            syncBtn.style.cursor = 'pointer';
            
            syncBtn.addEventListener('click', () => {
                this.syncFromCloud(true);
            });
            
            const controls = document.querySelector('.controls');
            if (controls) {
                controls.appendChild(syncBtn);
            }
        }, 2000);
    }
    
    async syncFromCloud(force = false) {
        if (this.isSyncing) {
            console.log('CloudSyncManager: Sync already in progress');
            return;
        }
        
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            console.log('CloudSyncManager: User not authenticated, skipping sync');
            return;
        }
        
        if (!window.databaseManager) {
            console.log('CloudSyncManager: Database manager not available');
            return;
        }
        
        console.log('CloudSyncManager: Starting cloud sync...');
        this.isSyncing = true;
        
        try {
            // Show loading indicator
            this.showSyncStatus('Syncing from cloud...');
            
            // Get notes from cloud
            const notes = await window.databaseManager.getUserNotes();
            console.log('CloudSyncManager: Retrieved notes from cloud:', notes.length);
            
            if (notes.length === 0) {
                console.log('CloudSyncManager: No notes found in cloud');
                
                // Check if we have local data
                const localData = localStorage.getItem('customDictionary');
                if (localData) {
                    console.log('CloudSyncManager: Found local data, uploading to cloud...');
                    await this.uploadLocalToCloud();
                }
                
                this.showSyncStatus('No cloud data found', 'info');
                this.isSyncing = false;
                return;
            }
            
            // Convert notes to dictionary format
            const cloudDictionary = {};
            notes.forEach(note => {
                if (note.topic) {
                    cloudDictionary[note.topic] = {
                        desc: note.desc || '',
                        ex: note.ex || []
                    };
                }
            });
            
            console.log('CloudSyncManager: Converted to dictionary:', Object.keys(cloudDictionary).length, 'topics');
            
            // Update UI with cloud data
            await this.updateUIWithCloudData(cloudDictionary);
            
            // Save to local storage as backup
            this.saveToLocalStorage(cloudDictionary);
            
            this.lastSyncTime = new Date();
            this.showSyncStatus(`Synced ${notes.length} notes from cloud`, 'success');
            
            // Notify callbacks
            this.notifySyncComplete(cloudDictionary);
            
        } catch (error) {
            console.error('CloudSyncManager: Sync error:', error);
            this.showSyncStatus('Sync failed: ' + error.message, 'error');
        } finally {
            this.isSyncing = false;
        }
    }
    
    async updateUIWithCloudData(cloudDictionary) {
        console.log('CloudSyncManager: Updating UI with cloud data...');
        
        if (!window.uiManager) {
            console.error('CloudSyncManager: UI Manager not available');
            return false;
        }
        
        if (!window.utils) {
            console.error('CloudSyncManager: Utils not available');
            return false;
        }
        
        try {
            // Merge with default lessons
            const mergedLessons = {
                //...window.utils.DEFAULT_LESSONS,
                ...cloudDictionary
            };
            
            console.log('CloudSyncManager: Merged lessons:', Object.keys(mergedLessons).length);
            
            // Update UI manager
            window.uiManager.updateLessons(mergedLessons);
            
            // Update topics panel
            window.uiManager.renderTopicsList();
            
            // Show home screen
            setTimeout(() => {
                if (window.uiManager.showHomeScreen) {
                    window.uiManager.showHomeScreen();
                }
            }, 100);
            
            console.log('CloudSyncManager: UI updated successfully');
            return true;
            
        } catch (error) {
            console.error('CloudSyncManager: Error updating UI:', error);
            return false;
        }
    }
    
    async uploadLocalToCloud() {
        try {
            const localData = localStorage.getItem('customDictionary');
            if (!localData) {
                console.log('CloudSyncManager: No local data to upload');
                return;
            }
            
            const localDictionary = JSON.parse(localData);
            const topics = Object.keys(localDictionary);
            
            console.log('CloudSyncManager: Uploading local data to cloud:', topics.length, 'topics');
            
            let uploaded = 0;
            let errors = 0;
            
            for (const topic of topics) {
                try {
                    const data = localDictionary[topic];
                    
                    const noteData = {
                        topic: topic,
                        desc: data.desc || '',
                        ex: data.ex || []
                    };
                    
                    const noteId = await window.databaseManager.saveNote(noteData);
                    if (noteId) {
                        uploaded++;
                    } else {
                        errors++;
                    }
                    
                    // Delay to prevent rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    console.error(`CloudSyncManager: Error uploading "${topic}":`, error);
                    errors++;
                }
            }
            
            console.log(`CloudSyncManager: Upload complete: ${uploaded} uploaded, ${errors} errors`);
            
            if (uploaded > 0) {
                window.utils.showNotification(`Uploaded ${uploaded} notes to cloud`, '☁️', false, true);
            }
            
        } catch (error) {
            console.error('CloudSyncManager: Error in uploadLocalToCloud:', error);
        }
    }
    
    saveToLocalStorage(dictionary) {
        try {
            localStorage.setItem('customDictionary', JSON.stringify(dictionary));
            console.log('CloudSyncManager: Saved to local storage');
        } catch (error) {
            console.error('CloudSyncManager: Error saving to local storage:', error);
        }
    }
    
    showSyncStatus(message, type = 'info') {
        console.log('CloudSyncManager: Status:', message);
        
        if (!window.utils) return;
        
        let icon = '🔄';
        let isError = false;
        let isSuccess = false;
        
        switch (type) {
            case 'success':
                icon = '✅';
                isSuccess = true;
                break;
            case 'error':
                icon = '❌';
                isError = true;
                break;
            case 'info':
                icon = 'ℹ️';
                break;
        }
        
        window.utils.showNotification(message, icon, isError, isSuccess);
    }
    
    notifySyncComplete(data) {
        this.syncCallbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('CloudSyncManager: Callback error:', error);
            }
        });
    }
    
    onSyncComplete(callback) {
        this.syncCallbacks.push(callback);
    }
    
    getLastSyncTime() {
        return this.lastSyncTime;
    }
    
    isSyncingNow() {
        return this.isSyncing;
    }
}

// Initialize CloudSyncManager
let cloudSyncManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        cloudSyncManager = new CloudSyncManager();
        window.cloudSyncManager = cloudSyncManager;
    } catch (error) {
        console.error('Error initializing CloudSyncManager:', error);
    }
});