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
                try {
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
                } catch (error) {
                    console.error(`Error saving "${topic}":`, error);
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
            
            window.utils.showNotification(message, '☁️', errorCount > 0, successCount > 0);
            
            // Clear builder if all saved successfully
            if (errorCount === 0) {
                this.builderDictionary = {};
                this.updateBuilderPreview();
                this.closeBuilder();
            }
        } catch (error) {
            console.error('Error saving to cloud:', error);
            window.utils.showNotification('Error saving to cloud: ' + error.message, '❌', true);
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