// scripts/sync-manager.js
class SyncManager {
    constructor() {
        this.syncInterval = null;
        this.isSyncing = false;
    }
    
    init() {
        console.log('SyncManager initializing...');
        
        // Start periodic sync (every 5 minutes)
        this.startPeriodicSync(5 * 60 * 1000);
        
        // Sync when coming back online
        window.addEventListener('online', () => {
            console.log('Device is back online, syncing...');
            this.syncNow();
        });
        
        // Sync when user becomes active
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('User is active, syncing...');
                this.syncNow();
            }
        });
    }
    
    startPeriodicSync(interval) {
        // Clear any existing interval
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        // Start new interval
        this.syncInterval = setInterval(() => {
            this.syncNow();
        }, interval);
        
        console.log(`Periodic sync started (every ${interval / 1000 / 60} minutes)`);
    }
    
    async syncNow() {
        if (this.isSyncing) {
            console.log('Sync already in progress, skipping...');
            return;
        }
        
        // Don't sync if offline
        if (!navigator.onLine) {
            console.log('Device is offline, skipping sync');
            return;
        }
        
        // Don't sync if not authenticated
        if (!window.databaseManager || !window.databaseManager.currentUserId) {
            console.log('User not authenticated, skipping sync');
            return;
        }
        
        this.isSyncing = true;
        
        try {
            console.log('Starting manual sync...');
            
            // Use CloudDataManager for syncing
            if (window.cloudDataManager) {
                await window.cloudDataManager.syncToCloud();
            } else {
                console.log('CloudDataManager not available for sync');
            }
            
            console.log('Manual sync completed');
        } catch (error) {
            console.error('Error during manual sync:', error);
        } finally {
            this.isSyncing = false;
        }
    }
    
    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('Periodic sync stopped');
        }
    }
}

// Initialize SyncManager
let syncManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        syncManager = new SyncManager();
        window.syncManager = syncManager;
        
        // Start sync manager after app initialization
        setTimeout(() => {
            syncManager.init();
        }, 3000);
    } catch (error) {
        console.error('Error initializing SyncManager:', error);
    }
});