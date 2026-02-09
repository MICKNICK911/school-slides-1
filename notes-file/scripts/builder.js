class BuilderManager {
    constructor() {
        // DOM Elements
        this.builderContainer = document.getElementById('builderContainer');
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
        this.exportToggle = document.getElementById('exportToggle');
        this.appContainer = document.getElementById('appContainer');
        
        // State
        this.builderDictionary = {};
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.exportToggle.addEventListener('click', () => this.openBuilder());
        this.builderCancel.addEventListener('click', () => this.closeBuilder());
        this.builderExport.addEventListener('click', () => this.exportBuilderDictionary());
        this.builderSave.addEventListener('click', () => this.saveToCloud());
        this.builderAdd.addEventListener('click', () => this.addBuilderEntry());
        this.previewClear.addEventListener('click', () => this.clearBuilderPreview());
        
        // Enter key support
        this.builderTopic.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBuilderEntry();
        });
        this.builderDesc.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.addBuilderEntry();
        });
        this.builderEx.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBuilderEntry();
        });
    }
    
    openBuilder() {
        this.appContainer.style.display = 'none';
        this.builderContainer.classList.add('active');
        this.builderTopic.focus();
    }
    
    closeBuilder() {
        this.builderContainer.classList.remove('active');
        this.appContainer.style.display = 'block';
        this.clearBuilderForm();
    }
    
    clearBuilderForm() {
        this.builderTopic.value = '';
        this.builderDesc.value = '';
        this.builderEx.value = '';
    }
    
    addBuilderEntry() {
        const topic = this.builderTopic.value.trim();
        const desc = this.builderDesc.value.trim();
        const ex = this.builderEx.value.trim();
        
        if (!topic || !desc || !ex) {
            alert('Please fill in all fields');
            return;
        }
        
        // Create or update topic
        this.builderDictionary[topic] = {
            desc: desc,
            ex: ex.split(',').map(item => item.trim())
        };
        
        // Update preview
        this.updateBuilderPreview();
        
        // Clear inputs
        this.clearBuilderForm();
        
        // Focus back to topic input
        this.builderTopic.focus();
    }
    
    updateBuilderPreview() {
        if (Object.keys(this.builderDictionary).length === 0) {
            this.builderPreview.textContent = 'No entries yet';
        } else {
            this.builderPreview.textContent = JSON.stringify(this.builderDictionary, null, 2);
        }
        this.builderEntryCount.textContent = `${Object.keys(this.builderDictionary).length} entries`;
    }
    
    clearBuilderPreview() {
        if (Object.keys(this.builderDictionary).length > 0 && confirm('Are you sure you want to clear all entries?')) {
            this.builderDictionary = {};
            this.updateBuilderPreview();
        }
    }
    
    exportBuilderDictionary() {
        if (Object.keys(this.builderDictionary).length === 0) {
            alert('No entries to export');
            return;
        }
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const filename = `E_Notes_${dateStr}.json`;
        
        window.utils.downloadJSON(this.builderDictionary, filename);
        window.utils.showNotification(`Notes exported as ${filename}`, '📤', false, true);
    }
    
    async saveToCloud() {
        if (Object.keys(this.builderDictionary).length === 0) {
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
            
            window.utils.showNotification(message, '☁️', errorCount > 0, successCount > 0);
            
            // Clear builder if all saved successfully
            if (errorCount === 0) {
                this.builderDictionary = {};
                this.updateBuilderPreview();
                this.closeBuilder();
            }
        } catch (error) {
            console.error('Error saving to cloud:', error);
            window.utils.showNotification('Error saving to cloud', '❌', true);
        }
    }
    
    // Load dictionary into builder
    loadDictionary(dictionary) {
        this.builderDictionary = { ...dictionary };
        this.updateBuilderPreview();
    }
    
    // Get current builder dictionary
    getDictionary() {
        return this.builderDictionary;
    }
}

// Initialize Builder Manager
let builderManager;
document.addEventListener('DOMContentLoaded', () => {
    builderManager = new BuilderManager();
    window.builderManager = builderManager;
});