class BuilderManager {
    constructor() {
        // DOM Elements
        this.builderContainer = document.getElementById('builderContainer');
        this.exportToggle = document.getElementById('exportToggle');
        
        // Check if elements exist before initializing
        if (!this.builderContainer || !this.exportToggle) {
            console.error('Builder elements not found');
            return;
        }
        
        // Initialize other elements after DOM is ready
        this.initElements();
        this.init();
    }
    
    initElements() {
        // Initialize all builder elements
        this.builderCancel = document.getElementById('builderCancel');
        this.builderExport = document.getElementById('builderExport');
        this.builderSave = document.getElementById('builderSave');
        this.builderTopic = document.getElementById('builderTopic');
        this.builderDesc = document.getElementById('builderDesc');
        this.builderEx = document.getElementById('builderEx');
        this.builderAdd = document.getElementById('builderAdd');
        this.builderPreview = document.getElementById('builderPreview');
        this.builderEntryCount = document.getElementById('builderEntryCount');
        this.previewClear = document.getElementById('previewClear');
        
        // State
        this.builderDictionary = {};
    }
    
    init() {
        console.log('BuilderManager initializing...');
        
        // Event listeners
        this.exportToggle.addEventListener('click', () => this.openBuilder());
        this.builderCancel?.addEventListener('click', () => this.closeBuilder());
        this.builderExport?.addEventListener('click', () => this.exportBuilderDictionary());
        this.builderSave?.addEventListener('click', () => this.saveToCloud());
        this.builderAdd?.addEventListener('click', () => this.addBuilderEntry());
        this.previewClear?.addEventListener('click', () => this.clearBuilderPreview());
        
        // Enter key support
        this.builderTopic?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBuilderEntry();
        });
        
        this.builderDesc?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.addBuilderEntry();
        });
        
        this.builderEx?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBuilderEntry();
        });
        
        console.log('BuilderManager initialized successfully');
    }
    
    openBuilder() {
        console.log('Opening builder...');
        
        // Hide the main app container
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            appContainer.style.display = 'none';
        }
        
        // Show the builder
        this.builderContainer.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on the first input
        setTimeout(() => {
            if (this.builderTopic) {
                this.builderTopic.focus();
            }
        }, 100);
    }
    
    closeBuilder() {
        console.log('Closing builder...');
        
        // Hide the builder
        this.builderContainer.classList.remove('active');
        
        // Show the main app container
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            appContainer.style.display = 'block';
        }
        
        document.body.style.overflow = 'auto';
        this.clearBuilderForm();
        
        // Show home screen
        if (window.uiManager) {
            setTimeout(() => window.uiManager.showHomeScreen(), 50);
        }
    }
    
    clearBuilderForm() {
        if (this.builderTopic) this.builderTopic.value = '';
        if (this.builderDesc) this.builderDesc.value = '';
        if (this.builderEx) this.builderEx.value = '';
    }
    
    addBuilderEntry() {
        if (!this.builderTopic || !this.builderDesc || !this.builderEx) return;
        
        const topic = this.builderTopic.value.trim();
        const desc = this.builderDesc.value.trim();
        const ex = this.builderEx.value.trim();
        
        if (!topic || !desc) {
            alert('Please fill in Topic and Description fields');
            return;
        }
        
        // Initialize dictionary if needed
        if (!this.builderDictionary) {
            this.builderDictionary = {};
        }
        
        // Create or update topic
        this.builderDictionary[topic] = {
            desc: desc,
            ex: ex.split(',').map(item => item.trim()).filter(item => item.length > 0)
        };
        
        // Update preview
        this.updateBuilderPreview();
        
        // Clear inputs
        this.clearBuilderForm();
        
        // Focus back to topic input
        setTimeout(() => {
            if (this.builderTopic) {
                this.builderTopic.focus();
            }
        }, 50);
        
        // Show success message
        window.utils.showNotification(`Added "${topic}" to Notes`, '✅');
    }
    
    updateBuilderPreview() {
        if (!this.builderPreview || !this.builderEntryCount) return;
        
        if (!this.builderDictionary || Object.keys(this.builderDictionary).length === 0) {
            this.builderPreview.textContent = 'No entries yet';
        } else {
            this.builderPreview.textContent = JSON.stringify(this.builderDictionary, null, 2);
        }
        
        const entryCount = Object.keys(this.builderDictionary || {}).length;
        this.builderEntryCount.textContent = `${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`;
    }
    
    clearBuilderPreview() {
        if (!this.builderDictionary || Object.keys(this.builderDictionary).length === 0) {
            return;
        }
        
        if (confirm('Are you sure you want to clear all entries?')) {
            this.builderDictionary = {};
            this.updateBuilderPreview();
            window.utils.showNotification('All entries cleared', '🗑️');
        }
    }
    
    exportBuilderDictionary() {
        if (!this.builderDictionary || Object.keys(this.builderDictionary).length === 0) {
            alert('No entries to export');
            return;
        }
        
        try {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const filename = `E_Notes_${dateStr}.json`;
            
            window.utils.downloadJSON(this.builderDictionary, filename);
            window.utils.showNotification(`Notes exported as ${filename}`, '📤', false, true);
        } catch (error) {
            console.error('Error exporting:', error);
            alert('Error exporting Notes: ' + error.message);
        }
    }
    
    // Update the saveToCloud method in builder.js
    // Update the saveToCloud method in builder.js
async saveToCloud() {
    console.log('=== SAVE TO CLOUD STARTED ===');
    
    if (!this.builderDictionary || Object.keys(this.builderDictionary).length === 0) {
        alert('No entries to save');
        return;
    }
    
    // Check authentication
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        alert('Please log in to save to the cloud');
        return;
    }
    
    console.log('User authenticated:', window.authManager.getCurrentUser().email);
    
    // Show loading state
    const originalText = this.builderSave.textContent;
    this.builderSave.textContent = 'Saving...';
    this.builderSave.disabled = true;
    
    try {
        // Test connection first
        console.log('Testing Firestore connection...');
        const connectionTest = await this.testFirestoreConnection();
        
        if (!connectionTest.connected) {
            alert(`Cannot connect to Firestore: ${connectionTest.error}\n\nPlease check:\n1. Internet connection\n2. Firestore rules\n3. Browser console (F12) for details`);
            return;
        }
        
        console.log('Firestore connection OK, starting save...');
        
        let successCount = 0;
        let errorCount = 0;
        const results = [];
        
        // Save each entry
        for (const [topic, data] of Object.entries(this.builderDictionary)) {
            try {
                console.log(`Saving: "${topic}"`);
                
                const noteData = {
                    topic: topic,
                    desc: data.desc || '',
                    ex: data.ex || []
                };
                
                const noteId = await window.databaseManager.saveNote(noteData);
                
                if (noteId) {
                    successCount++;
                    results.push(`✅ "${topic}" saved`);
                    console.log(`✅ Saved: "${topic}" (ID: ${noteId})`);
                } else {
                    errorCount++;
                    results.push(`❌ "${topic}" failed (null response)`);
                    console.error(`❌ Save returned null for: "${topic}"`);
                }
                
                // Small delay between saves
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
                errorCount++;
                results.push(`❌ "${topic}" error: ${error.code || error.message}`);
                console.error(`❌ Error saving "${topic}":`, error);
            }
        }

        // AFTER SUCCESSFUL SAVE, add this:
            if (successCount > 0) {
                // Refresh data from cloud
                setTimeout(async () => {
                    if (window.cloudDataManager) {
                        console.log('Builder: Refreshing data from cloud after save...');
                        await window.cloudDataManager.forceRefreshFromCloud();
                    }
                }, 1000);
            }
        
        // Show results
        console.log('=== SAVE RESULTS ===');
        console.log(`Success: ${successCount}, Errors: ${errorCount}`);
        results.forEach(r => console.log(r));
        
        // User feedback
        if (successCount === 0 && errorCount > 0) {
            alert(`❌ All saves failed (${errorCount} errors).\nCheck browser console (F12) for details.`);
        } else if (errorCount === 0) {
            alert(`✅ All ${successCount} notes saved successfully!`);
            this.builderDictionary = {};
            this.updateBuilderPreview();
            this.closeBuilder();
        } else {
            alert(`⚠️ ${successCount} saved, ${errorCount} failed.\nCheck browser console (F12) for details.`);
        }
        
        // Update notification
        if (window.utils) {
            window.utils.showNotification(
                `Cloud save: ${successCount} saved, ${errorCount} failed`,
                successCount > 0 ? '☁️' : '❌',
                errorCount > 0,
                successCount > 0
            );
        }
        
    } catch (error) {
        console.error('❌ FATAL ERROR in saveToCloud:', error);
        alert(`Fatal error: ${error.message}\n\nCheck browser console (F12) for details.`);
    } finally {
        // Restore button
        this.builderSave.textContent = originalText;
        this.builderSave.disabled = false;
    }
}

async testFirestoreConnection() {
    try {
        console.log('Testing Firestore write permission...');
        const testId = 'test-' + Date.now();
        
        // Test write
        await window.firebaseServices.db.collection('test').doc(testId).set({
            test: 'connection',
            timestamp: new Date().toISOString(),
            userId: window.authManager.getCurrentUser().uid
        });
        
        console.log('✅ Write test passed');
        
        // Test read
        const doc = await window.firebaseServices.db.collection('test').doc(testId).get();
        if (doc.exists) {
            console.log('✅ Read test passed');
        }
        
        // Clean up
        await window.firebaseServices.db.collection('test').doc(testId).delete();
        console.log('✅ Cleanup test passed');
        
        return { connected: true };
    } catch (error) {
        console.error('❌ Firestore connection test failed:', error);
        return { 
            connected: false, 
            error: `${error.code}: ${error.message}`
        };
    }
}
}

// Initialize with better error handling
let builderManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing BuilderManager...');
    try {
        builderManager = new BuilderManager();
        window.builderManager = builderManager;
        console.log('BuilderManager initialized successfully');
    } catch (error) {
        console.error('Error initializing BuilderManager:', error);
        // Fallback: Create a basic builder manager if initialization fails
        window.builderManager = {
            openBuilder: function() {
                alert('Builder feature is temporarily unavailable. Please refresh the page.');
            }
        };
    }
});