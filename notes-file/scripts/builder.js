class BuilderManager {
    constructor() {
        // DOM Elements - use safe accessors
        this.builderContainer = document.getElementById('builderContainer');
        this.exportToggle = document.getElementById('exportToggle');
        this.appContainer = document.getElementById('appContainer');
        
        // Initialize only if elements exist
        if (this.exportToggle && this.builderContainer) {
            this.initElements();
            this.init();
        } else {
            console.warn('Builder elements not found - builder features disabled');
        }
    }
    
    initElements() {
        // Initialize other DOM elements
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
    }
    
    init() {
        // Event listeners with safety checks
        if (this.exportToggle) {
            this.exportToggle.addEventListener('click', () => this.openBuilder());
        }
        
        if (this.builderCancel) {
            this.builderCancel.addEventListener('click', () => this.closeBuilder());
        }
        
        if (this.builderExport) {
            this.builderExport.addEventListener('click', () => this.exportBuilderDictionary());
        }
        
        if (this.builderSave) {
            this.builderSave.addEventListener('click', () => this.saveToCloud());
        }
        
        if (this.builderAdd) {
            this.builderAdd.addEventListener('click', () => this.addBuilderEntry());
        }
        
        if (this.previewClear) {
            this.previewClear.addEventListener('click', () => this.clearBuilderPreview());
        }
        
        // Enter key support
        if (this.builderTopic) {
            this.builderTopic.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addBuilderEntry();
            });
        }
        
        if (this.builderDesc) {
            this.builderDesc.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) this.addBuilderEntry();
            });
        }
        
        if (this.builderEx) {
            this.builderEx.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addBuilderEntry();
            });
        }
    }
    
    openBuilder() {
        if (!this.appContainer || !this.builderContainer) return;
        
        this.appContainer.style.display = 'none';
        this.builderContainer.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (this.builderTopic) {
            setTimeout(() => this.builderTopic.focus(), 100);
        }
    }
    
    closeBuilder() {
        if (!this.appContainer || !this.builderContainer) return;
        
        this.builderContainer.classList.remove('active');
        this.appContainer.style.display = 'block';
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
        
        if (!topic || !desc || !ex) {
            alert('Please fill in all fields');
            return;
        }
        
        // Initialize dictionary if needed
        this.builderDictionary = this.builderDictionary || {};
        
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
        if (this.builderTopic) {
            setTimeout(() => this.builderTopic.focus(), 50);
        }
    }
    
    updateBuilderPreview() {
        if (!this.builderPreview || !this.builderEntryCount) return;
        
        if (!this.builderDictionary || Object.keys(this.builderDictionary).length === 0) {
            this.builderPreview.textContent = 'No entries yet';
        } else {
            this.builderPreview.textContent = JSON.stringify(this.builderDictionary, null, 2);
        }
        this.builderEntryCount.textContent = `${Object.keys(this.builderDictionary || {}).length} entries`;
    }
    
    clearBuilderPreview() {
        if (!this.builderDictionary || Object.keys(this.builderDictionary).length === 0) {
            return;
        }
        
        if (confirm('Are you sure you want to clear all entries?')) {
            this.builderDictionary = {};
            this.updateBuilderPreview();
            window.utils.showNotification('All entries cleared', '🗑️', false, false);
        }
    }
    
    exportBuilderDictionary() {
        if (!this.builderDictionary || Object.keys(this.builderDictionary).length === 0) {
            alert('No entries to export');
            return;
        }
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const filename = `E_Notes_${dateStr}.json`;
        
        if (window.utils && window.utils.downloadJSON) {
            window.utils.downloadJSON(this.builderDictionary, filename);
            window.utils.showNotification(`Notes exported as ${filename}`, '📤', false, true);
        } else {
            alert('Export functionality not available');
        }
    }
    
    async saveToCloud() {
        if (!this.builderDictionary || Object.keys(this.builderDictionary).length === 0) {
            alert('No entries to save');
            return;
        }
        
        if (!window.databaseManager || !window.databaseManager.currentUserId) {
            alert('Please log in to save to the cloud');
            return;
        }
        
        try {
            let successCount = 0;
            let errorCount = 0;
            
            for (const [topic, data] of Object.entries(this.builderDictionary)) {
                const noteData = {
                    topic: topic,
                    desc: data.desc,
                    ex: data.ex
                };
                
                const noteId = await window.databaseManager.saveNote(noteData);
                if (noteId) {
                    successCount++;
                } else {
                    errorCount++;
                }
            }
            
            let message = '';
            if (successCount > 0) {
                message += `Successfully saved ${successCount} note(s) to the cloud. `;
            }
            if (errorCount > 0) {
                message += `Failed to save ${errorCount} note(s).`;
            }
            
            if (window.utils) {
                window.utils.showNotification(message, '☁️', errorCount > 0, successCount > 0);
            } else {
                alert(message);
            }
            
            // Clear builder if all saved successfully
            if (errorCount === 0) {
                this.builderDictionary = {};
                this.updateBuilderPreview();
                this.closeBuilder();
            }
        } catch (error) {
            console.error('Error saving to cloud:', error);
            if (window.utils) {
                window.utils.showNotification('Error saving to cloud', '❌', true);
            } else {
                alert('Error saving to cloud: ' + error.message);
            }
        }
    }
}

// Initialize with error handling
let builderManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        builderManager = new BuilderManager();
        window.builderManager = builderManager;
    } catch (error) {
        console.error('Error initializing BuilderManager:', error);
    }
});