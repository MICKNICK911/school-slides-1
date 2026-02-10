// scripts/sync-manager.js - ENHANCED WITH MERGE LOGIC
class SyncManager {
    constructor() {
        this.db = window.firebaseServices ? window.firebaseServices.db : null;
        this.auth = window.firebaseServices ? window.firebaseServices.auth : null;
        this.isSyncing = false;
        this.lastSyncTime = null;
        
        // Constants
        this.LOCAL_STORAGE_KEY = 'customDictionary';
        this.CLOUD_COLLECTION = 'notes';
        this.SYNC_STATE_KEY = 'dictionarySyncState';
        this.LAST_SYNC_KEY = 'lastDictionarySync';
        
        // Sync conflict resolution strategy
        this.CONFLICT_STRATEGY = 'latest'; // 'latest', 'cloud', or 'local'
        
        // Track local changes for better sync
        this.localChanges = this.getLocalChanges();
        
        console.log('SyncManager initialized');
    }
    
    async sync() {
        if (this.isSyncing) {
            console.log('Sync already in progress');
            return { success: false, message: 'Sync in progress' };
        }
        
        if (!this.auth || !this.auth.currentUser) {
            console.log('User not authenticated, cannot sync');
            return { success: false, message: 'User not authenticated' };
        }
        
        if (!navigator.onLine) {
            console.log('Device offline, cannot sync');
            return { success: false, message: 'Device offline' };
        }
        
        this.isSyncing = true;
        
        try {
            console.log('Starting sync process...');
            
            // Show loading indicator
            this.showSyncStatus('Syncing... ⏳');
            
            // Step 1: Get data from both sources
            const [localData, cloudData] = await Promise.all([
                this.getLocalData(),
                this.getCloudData()
            ]);
            
            console.log(`Local: ${Object.keys(localData).length} topics`);
            console.log(`Cloud: ${Object.keys(cloudData).length} topics`);
            
            // Step 2: Merge data with intelligent conflict resolution
            const mergedData = await this.mergeAndResolveConflicts(localData, cloudData);
            
            // Step 3: Save merged data to both sources
            const [localSaved, cloudSaved] = await Promise.all([
                this.saveToLocal(mergedData),
                this.saveToCloud(mergedData)
            ]);
            
            // Step 4: Update sync state and track changes
            this.updateSyncState(mergedData);
            this.updateLastSync();
            
            // Step 5: Update UI and builder data
            await this.updateUIAndBuilder(mergedData);
            
            this.lastSyncTime = new Date();
            
            const totalTopics = Object.keys(mergedData).length;
            const message = `Synced ${totalTopics} topics successfully!`;
            
            console.log('Sync completed successfully:', message);
            
            // Show success notification
            this.showSyncStatus('Sync complete! ✅', true);
            setTimeout(() => this.hideSyncStatus(), 3000);
            
            return { 
                success: true, 
                message: message,
                stats: {
                    localTopics: Object.keys(localData).length,
                    cloudTopics: Object.keys(cloudData).length,
                    mergedTopics: totalTopics,
                    conflictsResolved: mergedData.conflictCount || 0
                }
            };
            
        } catch (error) {
            console.error('Sync failed:', error);
            
            // Show error status
            this.showSyncStatus('Sync failed! ❌', false);
            setTimeout(() => this.hideSyncStatus(), 3000);
            
            return { 
                success: false, 
                message: 'Sync failed: ' + error.message 
            };
        } finally {
            this.isSyncing = false;
        }
    }
    
    async getLocalData() {
        try {
            const saved = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            if (!saved) return {};
            
            const dictionary = JSON.parse(saved);
            return this.convertToSyncFormat(dictionary, 'local');
        } catch (error) {
            console.error('Error getting local data:', error);
            return {};
        }
    }
    
    async getCloudData() {
        if (!this.db || !this.auth.currentUser) {
            return {};
        }
        
        try {
            const snapshot = await this.db.collection(this.CLOUD_COLLECTION)
                .where('userId', '==', this.auth.currentUser.uid)
                .get();
            
            const cloudData = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const topic = data.topic || doc.id;
                
                // Ensure data structure is consistent
                cloudData[topic] = {
                    id: doc.id,
                    topic: topic,
                    desc: data.desc || '',
                    ex: Array.isArray(data.ex) ? data.ex : [],
                    userId: data.userId,
                    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
                    updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt) || new Date(),
                    source: 'cloud',
                    cloudId: doc.id,
                    lastModified: data.updatedAt?.toDate?.() || new Date()
                };
            });
            
            console.log(`Loaded ${Object.keys(cloudData).length} topics from cloud`);
            return cloudData;
        } catch (error) {
            console.error('Error getting cloud data:', error);
            return {};
        }
    }
    
    convertToSyncFormat(dictionary, source) {
        const syncData = {};
        
        Object.entries(dictionary).forEach(([topic, data]) => {
            // Ensure consistent data structure
            syncData[topic] = {
                id: `local_${topic}`.replace(/\s+/g, '_'),
                topic: topic,
                desc: data.desc || '',
                ex: Array.isArray(data.ex) ? data.ex : [],
                userId: this.auth.currentUser?.uid || 'local',
                createdAt: new Date(data.createdAt || Date.now()),
                updatedAt: new Date(data.updatedAt || Date.now()),
                source: source,
                lastModified: new Date(data.updatedAt || Date.now())
            };
        });
        
        return syncData;
    }
    
    async mergeAndResolveConflicts(localData, cloudData) {
        console.log('Merging data with conflict resolution...');
        
        const merged = {};
        let conflictCount = 0;
        
        // Get all unique topics from both sources
        const allTopics = new Set([
            ...Object.keys(localData),
            ...Object.keys(cloudData)
        ]);
        
        console.log(`Total unique topics to merge: ${allTopics.size}`);
        
        for (const topic of allTopics) {
            const local = localData[topic];
            const cloud = cloudData[topic];
            
            if (local && !cloud) {
                // Only in local - mark for cloud upload
                merged[topic] = {
                    ...local,
                    source: 'local',
                    needsCloudSync: true,
                    action: 'upload'
                };
            } else if (!local && cloud) {
                // Only in cloud - mark for local download
                merged[topic] = {
                    ...cloud,
                    source: 'cloud',
                    needsLocalSync: true,
                    action: 'download'
                };
            } else {
                // In both - resolve conflict
                const resolved = this.resolveConflict(local, cloud);
                merged[topic] = resolved;
                
                if (resolved.conflictResolved) {
                    conflictCount++;
                }
            }
        }
        
        // Add conflict count to merged data
        merged.conflictCount = conflictCount;
        
        console.log(`Merged ${Object.keys(merged).length} topics, resolved ${conflictCount} conflicts`);
        return merged;
    }
    
    resolveConflict(local, cloud) {
        const localTime = new Date(local.lastModified || local.updatedAt || local.createdAt);
        const cloudTime = new Date(cloud.lastModified || cloud.updatedAt || cloud.createdAt);
        
        let resolved;
        let conflictResolved = false;
        
        if (this.CONFLICT_STRATEGY === 'latest') {
            conflictResolved = true;
            resolved = localTime > cloudTime ? local : cloud;
            resolved.conflictWinner = localTime > cloudTime ? 'local' : 'cloud';
        } else if (this.CONFLICT_STRATEGY === 'cloud') {
            resolved = cloud;
            resolved.conflictWinner = 'cloud';
        } else if (this.CONFLICT_STRATEGY === 'local') {
            resolved = local;
            resolved.conflictWinner = 'local';
        } else {
            // Default to latest
            conflictResolved = true;
            resolved = localTime > cloudTime ? local : cloud;
            resolved.conflictWinner = localTime > cloudTime ? 'local' : 'cloud';
        }
        
        return {
            ...resolved,
            source: 'merged',
            conflictResolved: conflictResolved,
            localVersion: local,
            cloudVersion: cloud,
            mergedAt: new Date(),
            localTimestamp: localTime,
            cloudTimestamp: cloudTime,
            action: localTime > cloudTime ? 'upload' : 'download'
        };
    }
    
    async saveToLocal(mergedData) {
        try {
            // Convert back to original format for local storage
            const dictionary = {};
            
            Object.entries(mergedData).forEach(([topic, data]) => {
                // Skip the conflictCount property
                if (topic === 'conflictCount') return;
                
                dictionary[topic] = {
                    desc: data.desc || '',
                    ex: data.ex || [],
                    updatedAt: data.updatedAt || new Date(),
                    syncedAt: new Date(),
                    cloudId: data.cloudId || null,
                    source: data.source
                };
            });
            
            // Save to localStorage
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(dictionary));
            
            console.log(`Saved ${Object.keys(dictionary).length} topics to local storage`);
            
            return true;
        } catch (error) {
            console.error('Error saving to local:', error);
            return false;
        }
    }
    
    async saveToCloud(mergedData) {
        if (!this.db || !this.auth.currentUser) {
            return false;
        }
        
        try {
            const userId = this.auth.currentUser.uid;
            const batch = this.db.batch();
            let operations = 0;
            
            Object.entries(mergedData).forEach(([topic, item]) => {
                // Skip the conflictCount property
                if (topic === 'conflictCount') return;
                
                const noteData = {
                    topic: topic,
                    desc: item.desc || '',
                    ex: item.ex || [],
                    userId: userId,
                    updatedAt: new Date(),
                    syncedAt: new Date()
                };
                
                if (item.cloudId) {
                    // Update existing note in cloud
                    const docRef = this.db.collection(this.CLOUD_COLLECTION).doc(item.cloudId);
                    batch.update(docRef, noteData);
                    operations++;
                } else if (item.needsCloudSync || item.source === 'local') {
                    // Create new note in cloud
                    const docRef = this.db.collection(this.CLOUD_COLLECTION).doc();
                    noteData.createdAt = new Date();
                    batch.set(docRef, noteData);
                    operations++;
                    
                    // Store the new cloud ID in merged data for UI update
                    item.cloudId = docRef.id;
                }
            });
            
            if (operations > 0) {
                await batch.commit();
                console.log(`Saved ${operations} notes to cloud`);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving to cloud:', error);
            return false;
        }
    }
    
    updateSyncState(mergedData) {
        const syncState = {
            lastSync: new Date().toISOString(),
            totalTopics: Object.keys(mergedData).length - (mergedData.conflictCount !== undefined ? 1 : 0),
            localOnly: Object.values(mergedData).filter(d => d.source === 'local').length,
            cloudOnly: Object.values(mergedData).filter(d => d.source === 'cloud').length,
            merged: Object.values(mergedData).filter(d => d.source === 'merged').length,
            conflictsResolved: mergedData.conflictCount || 0,
            strategy: this.CONFLICT_STRATEGY
        };
        
        localStorage.setItem(this.SYNC_STATE_KEY, JSON.stringify(syncState));
        console.log('Sync state updated:', syncState);
    }
    
    updateLastSync() {
        localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
    }
    
    async updateUIAndBuilder(mergedData) {
        try {
            // Convert merged data to lessons format
            const lessons = {};
            Object.entries(mergedData).forEach(([topic, data]) => {
                if (topic === 'conflictCount') return;
                
                lessons[topic] = {
                    desc: data.desc || '',
                    ex: data.ex || []
                };
            });
            
            // Update UIManager if available
            if (window.uiManager && typeof window.uiManager.updateLessons === 'function') {
                window.uiManager.updateLessons(lessons);
                console.log('UI lessons updated');
            }
            
            // Update BuilderManager if available
            if (window.builderManager) {
                // Update builder dictionary with cloud IDs
                const builderDict = window.builderManager.getDictionary();
                Object.entries(mergedData).forEach(([topic, data]) => {
                    if (topic === 'conflictCount') return;
                    
                    if (builderDict[topic]) {
                        builderDict[topic].cloudId = data.cloudId || null;
                    }
                });
                
                // Refresh builder preview if builder is open
                if (window.builderManager.updateBuilderPreview) {
                    window.builderManager.updateBuilderPreview();
                }
                
                console.log('Builder manager updated with cloud IDs');
            }
            
            // Update cloudDataManager
            if (window.cloudDataManager) {
                window.cloudDataManager.saveToLocal(lessons);
            }
            
        } catch (error) {
            console.error('Error updating UI and builder:', error);
        }
    }
    
    // ============ HELPER METHODS ============
    
    showSyncStatus(message, isSuccess = true) {
        // Remove any existing status indicator
        this.hideSyncStatus();
        
        // Create status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.id = 'syncStatusIndicator';
        statusIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${isSuccess ? '#27ae60' : '#e74c3c'};
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        statusIndicator.innerHTML = `
            <span>${isSuccess ? '✅' : '❌'}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(statusIndicator);
    }
    
    hideSyncStatus() {
        const existing = document.getElementById('syncStatusIndicator');
        if (existing) {
            existing.remove();
        }
    }
    
    getLocalChanges() {
        try {
            const changes = localStorage.getItem('localChanges');
            return changes ? JSON.parse(changes) : [];
        } catch (error) {
            return [];
        }
    }
    
    markLocalChange(topic, action) {
        this.localChanges.push({
            topic: topic,
            action: action,
            timestamp: new Date().toISOString()
        });
        
        // Keep only recent changes (last 100)
        if (this.localChanges.length > 100) {
            this.localChanges = this.localChanges.slice(-100);
        }
        
        localStorage.setItem('localChanges', JSON.stringify(this.localChanges));
    }
    
    getSyncStatus() {
        try {
            const syncState = localStorage.getItem(this.SYNC_STATE_KEY);
            const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
            
            return {
                state: syncState ? JSON.parse(syncState) : null,
                lastSync: lastSync ? new Date(lastSync) : null,
                isSyncing: this.isSyncing,
                isOnline: navigator.onLine,
                isAuthenticated: this.auth && !!this.auth.currentUser
            };
        } catch (error) {
            console.error('Error getting sync status:', error);
            return {
                state: null,
                lastSync: null,
                isSyncing: false,
                isOnline: navigator.onLine,
                isAuthenticated: false
            };
        }
    }
    
    // ============ PUBLIC API ============
    
    async forceSync() {
        console.log('Force sync requested');
        const result = await this.sync();
        
        if (result.success) {
            window.utils.showNotification(result.message, '✅', false, true);
        } else {
            window.utils.showNotification(result.message, '❌', true);
        }
        
        return result;
    }
    
    async manualSync() {
        const button = document.getElementById('syncButton');
        if (button) {
            const originalHTML = button.innerHTML;
            button.innerHTML = '⏳';
            button.style.opacity = '0.7';
            button.classList.add('syncing');
            
            const result = await this.forceSync();
            
            button.innerHTML = originalHTML;
            button.style.opacity = '1';
            button.classList.remove('syncing');
            
            if (result.success) {
                button.classList.add('sync-success');
                setTimeout(() => button.classList.remove('sync-success'), 2000);
            } else {
                button.classList.add('sync-error');
                setTimeout(() => button.classList.remove('sync-error'), 2000);
            }
        } else {
            await this.forceSync();
        }
    }
    
    startAutoSync(intervalMinutes = 5) {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
        }
        
        this.autoSyncInterval = setInterval(() => {
            if (this.auth.currentUser && navigator.onLine) {
                this.sync();
            }
        }, intervalMinutes * 60 * 1000);
        
        console.log(`Auto-sync started (every ${intervalMinutes} minutes)`);
    }
    
    stopAutoSync() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
            this.autoSyncInterval = null;
            console.log('Auto-sync stopped');
        }
    }
    
    // Add sync info to UI
    addSyncInfoToUI() {
        // Create sync info panel
        const syncInfo = document.createElement('div');
        syncInfo.id = 'syncInfoPanel';
        syncInfo.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 9999;
            display: none;
        `;
        
        syncInfo.innerHTML = `
            <div>Cloud: <span id="syncCloudStatus">❓</span></div>
            <div id="syncLastTime">Last sync: Never</div>
        `;
        
        document.body.appendChild(syncInfo);
        
        // Update sync info periodically
        setInterval(() => this.updateSyncInfo(), 10000);
        this.updateSyncInfo();
    }
    
    updateSyncInfo() {
        const syncInfo = document.getElementById('syncInfoPanel');
        const cloudStatus = document.getElementById('syncCloudStatus');
        const lastTime = document.getElementById('syncLastTime');
        
        if (!syncInfo || !cloudStatus || !lastTime) return;
        
        const syncStatus = this.getSyncStatus();
        
        if (syncStatus.isAuthenticated) {
            syncInfo.style.display = 'block';
            cloudStatus.textContent = syncStatus.isOnline ? '✅' : '📴';
            
            if (syncStatus.lastSync) {
                const timeAgo = Math.floor((new Date() - syncStatus.lastSync) / 60000);
                if (timeAgo < 1) {
                    lastTime.textContent = 'Last sync: Just now';
                } else if (timeAgo < 60) {
                    lastTime.textContent = `Last sync: ${timeAgo}m ago`;
                } else {
                    lastTime.textContent = `Last sync: ${Math.floor(timeAgo / 60)}h ago`;
                }
            } else {
                lastTime.textContent = 'Last sync: Never';
            }
        } else {
            syncInfo.style.display = 'none';
        }
    }
}

// Initialize SyncManager
let syncManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        syncManager = new SyncManager();
        window.syncManager = syncManager;
        
        console.log('SyncManager initialized');
        
        // Add sync button to UI
        setTimeout(() => addSyncButton(), 1000);
        
        // Start auto-sync after 5 seconds
        setTimeout(() => {
            if (window.firebaseServices && window.firebaseServices.auth.currentUser) {
                syncManager.startAutoSync(5); // Sync every 5 minutes
                syncManager.addSyncInfoToUI();
            }
        }, 5000);
        
        // Listen for auth changes to start/stop auto-sync
        if (window.firebaseServices) {
            window.firebaseServices.auth.onAuthStateChanged((user) => {
                if (user) {
                    syncManager.startAutoSync(5);
                    syncManager.addSyncInfoToUI();
                } else {
                    syncManager.stopAutoSync();
                }
            });
        }
        
    } catch (error) {
        console.error('Error initializing SyncManager:', error);
    }
});

function addSyncButton() {
    const controls = document.querySelector('.controls');
    if (!controls) return;
    
    // Check if button already exists
    if (document.getElementById('syncButton')) return;
    
    const syncButton = document.createElement('div');
    syncButton.id = 'syncButton';
    syncButton.className = 'theme-toggle';
    syncButton.title = 'Sync with Cloud';
    syncButton.innerHTML = '➕';
    syncButton.style.cursor = 'pointer';
    
    syncButton.addEventListener('click', async () => {
        if (window.syncManager) {
            await window.syncManager.manualSync();
        }
    });
    
    // Insert before profile toggle
    const profileToggle = document.getElementById('profileToggle');
    if (profileToggle) {
        controls.insertBefore(syncButton, profileToggle);
    } else {
        controls.appendChild(syncButton);
    }
    
    // Add CSS for sync button states
    const style = document.createElement('style');
    style.textContent = `
        #syncButton.sync-success {
            background-color: #27ae60;
            color: white;
            animation: pulse 0.5s ease-in-out;
        }
        
        #syncButton.sync-error {
            background-color: #e74c3c;
            color: white;
        }
        
        #syncButton.syncing {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}