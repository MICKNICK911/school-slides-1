// builder.js - COMPLETE VERSION WITH EDIT/DELETE FEATURES
class BuilderManager {
    constructor() {
        // DOM Elements
        this.builderContainer = document.getElementById('builderContainer');
        this.exportToggle = document.getElementById('exportToggle');
        
        if (!this.builderContainer || !this.exportToggle) {
            console.error('Builder elements not found');
            return;
        }
        
        // Initialize state
        this.builderDictionary = {};
        this.currentEditTopic = null;
        this.isEditMode = false;
        this.previewMode = 'json'; // 'json' or 'table'
        this.cloudNotes = {}; // Store cloud note IDs
        
        // Initialize after DOM is ready
        setTimeout(() => {
            this.initElements();
            this.init();
        }, 100);
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
        
        // New elements for edit/delete
        this.previewModeToggle = document.getElementById('previewModeToggle');
        this.previewTableContainer = document.getElementById('previewTableContainer');
        this.previewContentContainer = document.getElementById('previewContentContainer');
        this.previewTableBody = document.getElementById('previewTableBody');
        this.previewSearch = document.getElementById('previewSearch');
        
        // Edit/Delete form actions
        this.builderFormActions = document.getElementById('builderFormActions');
        this.builderUpdate = document.getElementById('builderUpdate');
        this.builderCancelEdit = document.getElementById('builderCancelEdit');
        this.builderDelete = document.getElementById('builderDelete');
        
        // Cloud action buttons
        this.cloudLoadBtn = document.getElementById('cloudLoadBtn');
        this.cloudSyncBtn = document.getElementById('cloudSyncBtn');
    }
    
    init() {
        console.log('BuilderManager initializing with edit/delete features...');
        
        // Event listeners
        this.exportToggle.addEventListener('click', () => this.openBuilder());
        this.builderCancel?.addEventListener('click', () => this.closeBuilder());
        this.builderExport?.addEventListener('click', () => this.exportBuilderDictionary());
        this.builderSave?.addEventListener('click', () => this.saveToCloud());
        this.builderAdd?.addEventListener('click', () => this.addBuilderEntry());
        this.previewClear?.addEventListener('click', () => this.clearBuilderPreview());
        
        // Preview mode toggle
        this.previewModeToggle?.addEventListener('click', () => this.togglePreviewMode());
        
        // Search functionality
        this.previewSearch?.addEventListener('input', (e) => this.filterPreview(e.target.value));
        
        // Edit/Delete buttons
        this.builderUpdate?.addEventListener('click', () => this.updateBuilderEntry());
        this.builderCancelEdit?.addEventListener('click', () => this.cancelEdit());
        this.builderDelete?.addEventListener('click', () => this.deleteBuilderEntry());
        
        // Cloud buttons
        this.cloudLoadBtn?.addEventListener('click', () => this.loadFromCloud());
        this.cloudSyncBtn?.addEventListener('click', () => this.syncWithCloud());
        
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
    
    // ============ BUILDER OPERATIONS ============
    
    openBuilder() {
        console.log('Opening builder...');
        
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            appContainer.style.display = 'none';
        }
        
        this.builderContainer.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Reset form and mode
        this.resetForm();
        this.switchToAddMode();
        
        // Load existing data
        this.loadLocalDictionary();
        
        setTimeout(() => {
            if (this.builderTopic) {
                this.builderTopic.focus();
            }
        }, 100);
    }
    
    closeBuilder() {
        console.log('Closing builder...');
        
        this.builderContainer.classList.remove('active');
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            appContainer.style.display = 'block';
        }
        
        document.body.style.overflow = 'auto';
        this.resetForm();
        this.switchToAddMode();
        
        // Show home screen
        if (window.uiManager) {
            setTimeout(() => window.uiManager.showHomeScreen(), 50);
        }
    }
    
    // ============ CRUD OPERATIONS ============
    
    addBuilderEntry() {
        if (!this.builderTopic || !this.builderDesc || !this.builderEx) return;
        
        const topic = this.builderTopic.value.trim();
        const desc = this.builderDesc.value.trim();
        const ex = this.builderEx.value.trim();
        
        if (!topic || !desc) {
            alert('Please fill in Topic and Description fields');
            return;
        }
        
        // Check if topic already exists
        if (this.builderDictionary[topic] && !this.isEditMode) {
            if (!confirm(`Topic "${topic}" already exists. Do you want to overwrite it?`)) {
                return;
            }
        }
        
        // Initialize dictionary if needed
        if (!this.builderDictionary) {
            this.builderDictionary = {};
        }
        
        // Create or update topic
        this.builderDictionary[topic] = {
            desc: desc,
            ex: ex.split(',').map(item => item.trim()).filter(item => item.length > 0),
            cloudId: this.builderDictionary[topic]?.cloudId // Preserve cloud ID if exists
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
    
    updateBuilderEntry() {
        if (!this.currentEditTopic || !this.isEditMode) return;
        
        const topic = this.builderTopic.value.trim();
        const desc = this.builderDesc.value.trim();
        const ex = this.builderEx.value.trim();
        
        if (!topic || !desc) {
            alert('Please fill in Topic and Description fields');
            return;
        }
        
        // Check if topic name changed
        if (topic !== this.currentEditTopic) {
            // Remove old entry and add new one
            const cloudId = this.builderDictionary[this.currentEditTopic]?.cloudId;
            delete this.builderDictionary[this.currentEditTopic];
            this.builderDictionary[topic] = {
                desc: desc,
                ex: ex.split(',').map(item => item.trim()).filter(item => item.length > 0),
                cloudId: cloudId // Transfer cloud ID
            };
        } else {
            // Update existing entry
            this.builderDictionary[topic] = {
                desc: desc,
                ex: ex.split(',').map(item => item.trim()).filter(item => item.length > 0),
                cloudId: this.builderDictionary[topic]?.cloudId // Preserve cloud ID
            };
        }
        
        // Update preview
        this.updateBuilderPreview();
        
        // Switch back to add mode
        this.switchToAddMode();
        
        // Show success message
        window.utils.showNotification(`Updated "${topic}"`, '✏️');
    }
    
    deleteBuilderEntry() {
        if (!this.currentEditTopic) return;
        
        const topic = this.currentEditTopic;
        const hasCloudId = !!this.builderDictionary[topic]?.cloudId;
        
        let message = `Are you sure you want to delete "${topic}"?`;
        if (hasCloudId) {
            message += '\n\nThis note also exists in the cloud.';
        }
        message += '\n\nThis cannot be undone.';
        
        if (confirm(message)) {
            // Delete from dictionary
            delete this.builderDictionary[topic];
            
            // Update preview
            this.updateBuilderPreview();
            
            // Switch back to add mode
            this.switchToAddMode();
            
            // Show success message
            window.utils.showNotification(`Deleted "${topic}"`, '🗑️');
        }
    }
    
    editBuilderEntry(topic) {
        if (!topic || !this.builderDictionary[topic]) return;
        
        const entry = this.builderDictionary[topic];
        
        // Populate form fields
        if (this.builderTopic) {
            this.builderTopic.value = topic;
            this.builderTopic.readOnly = false; // Allow editing topic name
        }
        
        if (this.builderDesc) {
            this.builderDesc.value = entry.desc || '';
        }
        
        if (this.builderEx) {
            this.builderEx.value = entry.ex ? entry.ex.join(', ') : '';
        }
        
        // Set edit mode
        this.currentEditTopic = topic;
        this.isEditMode = true;
        
        // Show edit buttons
        this.switchToEditMode();
        
        // Focus on description field
        setTimeout(() => {
            if (this.builderDesc) {
                this.builderDesc.focus();
            }
        }, 50);
        
        console.log(`Editing topic: ${topic}`);
    }
    
    cancelEdit() {
        this.switchToAddMode();
        this.clearBuilderForm();
    }
    
    // ============ PREVIEW MANAGEMENT ============
    
    updateBuilderPreview() {
        if (!this.builderPreview || !this.builderEntryCount) return;
        
        const entryCount = Object.keys(this.builderDictionary || {}).length;
        
        if (entryCount === 0) {
            this.builderPreview.textContent = 'No entries yet';
            this.clearPreviewTable();
        } else {
            // Update JSON preview
            const displayDict = {};
            Object.entries(this.builderDictionary).forEach(([topic, data]) => {
                displayDict[topic] = {
                    desc: data.desc,
                    ex: data.ex
                };
            });
            this.builderPreview.textContent = JSON.stringify(displayDict, null, 2);
            
            // Update table preview
            this.updatePreviewTable();
        }
        
        // Update entry count
        this.builderEntryCount.textContent = `${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`;
        
        // Save to local storage
        this.saveToLocalStorage();
    }
    
    updatePreviewTable() {
        if (!this.previewTableBody) return;
        
        this.previewTableBody.innerHTML = '';
        
        Object.entries(this.builderDictionary || {}).forEach(([topic, data], index) => {
            const row = document.createElement('tr');
            
            // Truncate description for display
            const shortDesc = data.desc.length > 100 ? data.desc.substring(0, 100) + '...' : data.desc;
            const examples = data.ex ? data.ex.join(', ') : '';
            const hasCloudId = !!data.cloudId;
            
            row.innerHTML = `
                <td class="topic-cell">${topic}</td>
                <td class="desc-cell" title="${data.desc}">${shortDesc}</td>
                <td class="examples-cell">${examples}</td>
                <td class="actions-cell">
                    <button class="action-btn edit-btn" data-topic="${topic}" title="Edit">✏️</button>
                    <button class="action-btn delete-btn" data-topic="${topic}" title="Delete">🗑️</button>
                    ${hasCloudId ? `
                        <button class="action-btn cloud-update-btn" data-topic="${topic}" title="Update in Cloud">☁️↑</button>
                        <button class="action-btn cloud-delete-btn" data-topic="${topic}" title="Delete from Cloud">☁️🗑️</button>
                    ` : `
                        <button class="action-btn cloud-save-btn" data-topic="${topic}" title="Save to Cloud">☁️↓</button>
                    `}
                </td>
            `;
            
            this.previewTableBody.appendChild(row);
        });
        
        // Add event listeners to table buttons
        this.addTableEventListeners();
    }
    
    addTableEventListeners() {
        // Edit buttons
        this.previewTableBody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const topic = e.target.dataset.topic;
                this.editBuilderEntry(topic);
            });
        });
        
        // Delete buttons
        this.previewTableBody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const topic = e.target.dataset.topic;
                if (confirm(`Delete "${topic}"?`)) {
                    delete this.builderDictionary[topic];
                    this.updateBuilderPreview();
                    window.utils.showNotification(`Deleted "${topic}"`, '🗑️');
                }
            });
        });
        
        // Cloud save buttons
        this.previewTableBody.querySelectorAll('.cloud-save-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const topic = e.target.dataset.topic;
                await this.saveSingleToCloud(topic);
            });
        });
        
        // Cloud update buttons
        this.previewTableBody.querySelectorAll('.cloud-update-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const topic = e.target.dataset.topic;
                await this.updateInCloud(topic);
            });
        });
        
        // Cloud delete buttons
        this.previewTableBody.querySelectorAll('.cloud-delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const topic = e.target.dataset.topic;
                await this.deleteFromCloud(topic);
            });
        });
    }
    
    clearPreviewTable() {
        if (this.previewTableBody) {
            this.previewTableBody.innerHTML = '';
        }
    }
    
    togglePreviewMode() {
        if (this.previewMode === 'json') {
            this.previewMode = 'table';
            this.previewTableContainer.style.display = 'block';
            this.previewContentContainer.style.display = 'none';
            this.previewModeToggle.textContent = 'JSON View';
            this.updatePreviewTable();
        } else {
            this.previewMode = 'json';
            this.previewTableContainer.style.display = 'none';
            this.previewContentContainer.style.display = 'block';
            this.previewModeToggle.textContent = 'Table View';
        }
    }
    
    filterPreview(searchTerm) {
        if (!searchTerm.trim()) {
            this.updatePreviewTable();
            return;
        }
        
        const filtered = Object.entries(this.builderDictionary || {}).filter(([topic, data]) => {
            return topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   data.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   data.ex.some(ex => ex.toLowerCase().includes(searchTerm.toLowerCase()));
        });
        
        // Update table with filtered results
        if (this.previewTableBody) {
            this.previewTableBody.innerHTML = '';
            
            filtered.forEach(([topic, data]) => {
                const row = document.createElement('tr');
                const shortDesc = data.desc.length > 100 ? data.desc.substring(0, 100) + '...' : data.desc;
                const examples = data.ex ? data.ex.join(', ') : '';
                const hasCloudId = !!data.cloudId;
                
                row.innerHTML = `
                    <td class="topic-cell">${topic}</td>
                    <td class="desc-cell" title="${data.desc}">${shortDesc}</td>
                    <td class="examples-cell">${examples}</td>
                    <td class="actions-cell">
                        <button class="action-btn edit-btn" data-topic="${topic}" title="Edit">✏️</button>
                        <button class="action-btn delete-btn" data-topic="${topic}" title="Delete">🗑️</button>
                        ${hasCloudId ? `
                            <button class="action-btn cloud-update-btn" data-topic="${topic}" title="Update in Cloud">☁️↑</button>
                            <button class="action-btn cloud-delete-btn" data-topic="${topic}" title="Delete from Cloud">☁️🗑️</button>
                        ` : `
                            <button class="action-btn cloud-save-btn" data-topic="${topic}" title="Save to Cloud">☁️↓</button>
                        `}
                    </td>
                `;
                
                this.previewTableBody.appendChild(row);
            });
            
            // Re-add event listeners
            this.addTableEventListeners();
        }
    }
    
    clearBuilderPreview() {
        if (!this.builderDictionary || Object.keys(this.builderDictionary).length === 0) {
            return;
        }
        
        if (confirm('Are you sure you want to clear all entries? This cannot be undone.')) {
            this.builderDictionary = {};
            this.cloudNotes = {};
            this.updateBuilderPreview();
            window.utils.showNotification('All entries cleared', '🗑️');
        }
    }

    // Add these methods to your BuilderManager class
async syncAfterSave() {
    if (window.authManager && window.authManager.isAuthenticated()) {
        if (window.syncManager) {
            // Small delay to ensure data is processed
            setTimeout(() => {
                window.syncManager.sync();
            }, 2000);
        }
    }
}

// Call syncAfterSave after these operations:
// 1. In saveToCloud() - after successful save
// 2. In updateInCloud() - after successful update
// 3. In deleteFromCloud() - after successful delete

// Example update to saveToCloud method:
async saveToCloud() {
    // ... existing code ...
    
    if (success) {
        window.utils.showNotification(message.trim(), '☁️', errors > 0, saved + updated > 0);
        
        // Trigger sync
        this.syncAfterSave();
    }
}
    
    // ============ FORM MANAGEMENT ============
    
    clearBuilderForm() {
        if (this.builderTopic) {
            this.builderTopic.value = '';
            this.builderTopic.readOnly = false;
        }
        if (this.builderDesc) this.builderDesc.value = '';
        if (this.builderEx) this.builderEx.value = '';
    }
    
    resetForm() {
        this.clearBuilderForm();
        this.currentEditTopic = null;
        this.isEditMode = false;
    }
    
    switchToAddMode() {
        this.isEditMode = false;
        this.currentEditTopic = null;
        
        // Show Add button, hide Edit/Delete buttons
        if (this.builderAdd) this.builderAdd.style.display = 'block';
        if (this.builderFormActions) this.builderFormActions.style.display = 'none';
        
        // Update button text
        if (this.builderAdd) {
            this.builderAdd.innerHTML = '<span>+</span> Add Entry';
        }
        
        // Make topic field editable
        if (this.builderTopic) {
            this.builderTopic.readOnly = false;
        }
        
        // Clear form
        this.clearBuilderForm();
    }
    
    switchToEditMode() {
        this.isEditMode = true;
        
        // Hide Add button, show Edit/Delete buttons
        if (this.builderAdd) this.builderAdd.style.display = 'none';
        if (this.builderFormActions) this.builderFormActions.style.display = 'flex';
    }
    
    // ============ CLOUD OPERATIONS ============
    
    async loadFromCloud() {
        if (!window.databaseManager || !window.authManager?.isAuthenticated()) {
            alert('Please log in to load from cloud');
            return;
        }
        
        try {
            const notes = await window.databaseManager.getUserNotes();
            
            if (notes.length === 0) {
                alert('No notes found in your cloud account');
                return;
            }
            
            // Convert notes to dictionary format
            const cloudDictionary = {};
            notes.forEach(note => {
                if (note.topic) {
                    cloudDictionary[note.topic] = {
                        desc: note.desc || '',
                        ex: note.ex || [],
                        cloudId: note.id
                    };
                }
            });
            
            // Merge with existing data
            this.builderDictionary = {
                ...this.builderDictionary,
                ...cloudDictionary
            };
            
            // Store cloud notes separately
            this.cloudNotes = { ...cloudDictionary };
            
            // Update preview
            this.updateBuilderPreview();
            
            window.utils.showNotification(`Loaded ${notes.length} notes from cloud`, '☁️', false, true);
        } catch (error) {
            console.error('Error loading from cloud:', error);
            alert('Error loading from cloud: ' + error.message);
        }
    }
    
    async saveSingleToCloud(topic) {
        if (!window.databaseManager || !window.authManager?.isAuthenticated()) {
            alert('Please log in to save to cloud');
            return false;
        }
        
        if (!this.builderDictionary[topic]) {
            alert('Note not found in builder');
            return false;
        }
        
        try {
            const noteData = {
                topic: topic,
                desc: this.builderDictionary[topic].desc,
                ex: this.builderDictionary[topic].ex
            };
            
            const noteId = await window.databaseManager.saveNote(noteData);
            
            if (noteId) {
                // Store cloud ID
                this.builderDictionary[topic].cloudId = noteId;
                this.cloudNotes[topic] = { ...this.builderDictionary[topic] };
                
                // Update preview to show cloud buttons
                this.updatePreviewTable();
                
                window.utils.showNotification(`Saved "${topic}" to cloud`, '✅', false, true);
                return true;
            } else {
                alert('Failed to save note to cloud');
                return false;
            }
        } catch (error) {
            console.error('Error saving to cloud:', error);
            alert('Error saving to cloud: ' + error.message);
            return false;
        }
    }
    
    async updateInCloud(topic) {
        if (!window.databaseManager || !window.authManager?.isAuthenticated()) {
            alert('Please log in to update in cloud');
            return false;
        }
        
        if (!this.builderDictionary[topic]) {
            alert('Note not found in builder');
            return false;
        }
        
        if (!this.builderDictionary[topic].cloudId) {
            alert('Note not found in cloud. Please save it first.');
            return false;
        }
        
        try {
            const noteData = {
                topic: topic,
                desc: this.builderDictionary[topic].desc,
                ex: this.builderDictionary[topic].ex
            };
            
            const success = await window.databaseManager.updateNote(
                this.builderDictionary[topic].cloudId,
                noteData
            );
            
            if (success) {
                window.utils.showNotification(`Updated "${topic}" in cloud`, '✏️', false, true);
                return true;
            } else {
                alert('Failed to update note in cloud');
                return false;
            }
        } catch (error) {
            console.error('Error updating in cloud:', error);
            alert('Error updating in cloud: ' + error.message);
            return false;
        }
    }
    
    async deleteFromCloud(topic) {
        if (!window.databaseManager || !window.authManager?.isAuthenticated()) {
            alert('Please log in to delete from cloud');
            return false;
        }
        
        if (!this.builderDictionary[topic]?.cloudId) {
            alert('Note not found in cloud');
            return false;
        }
        
        if (!confirm(`Are you sure you want to delete "${topic}" from cloud? This cannot be undone.`)) {
            return false;
        }
        
        try {
            const success = await window.databaseManager.deleteNoteFromCloud(
                this.builderDictionary[topic].cloudId
            );
            
            if (success) {
                // Remove cloud ID from local entry
                delete this.builderDictionary[topic].cloudId;
                delete this.cloudNotes[topic];
                
                // Update preview
                this.updatePreviewTable();
                
                window.utils.showNotification(`Deleted "${topic}" from cloud`, '🗑️');
                return true;
            } else {
                alert('Failed to delete note from cloud');
                return false;
            }
        } catch (error) {
            console.error('Error deleting from cloud:', error);
            alert('Error deleting from cloud: ' + error.message);
            return false;
        }
    }
    
    async syncWithCloud() {
        if (!window.databaseManager || !window.authManager?.isAuthenticated()) {
            alert('Please log in to sync with cloud');
            return;
        }
        
        try {
            // First load from cloud to get latest
            await this.loadFromCloud();
            
            // Then save any local changes to cloud
            let saved = 0;
            let updated = 0;
            
            for (const [topic, data] of Object.entries(this.builderDictionary)) {
                if (data.cloudId) {
                    // Update existing cloud note
                    const success = await this.updateInCloud(topic);
                    if (success) updated++;
                } else {
                    // Save new note to cloud
                    const success = await this.saveSingleToCloud(topic);
                    if (success) saved++;
                }
                
                // Small delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            let message = 'Sync complete!\n';
            if (saved > 0) message += `✅ Saved ${saved} new notes to cloud\n`;
            if (updated > 0) message += `✏️ Updated ${updated} existing notes\n`;
            
            alert(message);
            
        } catch (error) {
            console.error('Error syncing with cloud:', error);
            alert('Error syncing with cloud: ' + error.message);
        }
    }
    
    async saveToCloud() {
        if (!this.builderDictionary || Object.keys(this.builderDictionary).length === 0) {
            alert('No entries to save');
            return;
        }
        
        if (!window.databaseManager || !window.authManager?.isAuthenticated()) {
            alert('Please log in to save to the cloud');
            return;
        }
        
        try {
            let saved = 0;
            let updated = 0;
            let errors = 0;
            
            for (const [topic, data] of Object.entries(this.builderDictionary)) {
                try {
                    if (data.cloudId) {
                        // Update existing note
                        const noteData = {
                            topic: topic,
                            desc: data.desc,
                            ex: data.ex
                        };
                        
                        const success = await window.databaseManager.updateNote(data.cloudId, noteData);
                        if (success) {
                            updated++;
                        } else {
                            errors++;
                        }
                    } else {
                        // Save new note
                        const noteData = {
                            topic: topic,
                            desc: data.desc,
                            ex: data.ex
                        };
                        
                        const noteId = await window.databaseManager.saveNote(noteData);
                        if (noteId) {
                            // Store cloud ID
                            this.builderDictionary[topic].cloudId = noteId;
                            saved++;
                        } else {
                            errors++;
                        }
                    }
                    
                    // Small delay to prevent rate limiting
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (error) {
                    console.error(`Error processing "${topic}":`, error);
                    errors++;
                }
            }
            
            let message = '';
            if (saved > 0) message += `✅ Saved ${saved} new note(s) to the cloud.\n`;
            if (updated > 0) message += `✏️ Updated ${updated} existing note(s).\n`;
            if (errors > 0) message += `❌ Failed to process ${errors} note(s).`;
            
            window.utils.showNotification(message.trim(), '☁️', errors > 0, saved + updated > 0);
            
            // Update preview to show cloud IDs
            this.updatePreviewTable();
            
        } catch (error) {
            console.error('Error saving to cloud:', error);
            window.utils.showNotification('Error saving to cloud: ' + error.message, '❌', true);
        }
    }
    
    // ============ LOCAL STORAGE ============
    
    loadLocalDictionary() {
        try {
            const savedDictionary = localStorage.getItem('customDictionary');
            if (savedDictionary) {
                const dictionary = JSON.parse(savedDictionary);
                this.builderDictionary = dictionary;
                this.updateBuilderPreview();
                console.log('Loaded from local storage:', Object.keys(dictionary).length, 'entries');
            }
        } catch (error) {
            console.error('Error loading from local storage:', error);
        }
    }
    
    saveToLocalStorage() {
        try {
            // Don't save cloud IDs to local storage
            const saveDict = {};
            Object.entries(this.builderDictionary).forEach(([topic, data]) => {
                saveDict[topic] = {
                    desc: data.desc,
                    ex: data.ex
                };
            });
            
            localStorage.setItem('customDictionary', JSON.stringify(saveDict));
        } catch (error) {
            console.error('Error saving to local storage:', error);
        }
    }
    
    // ============ EXPORT ============
    
    exportBuilderDictionary() {
        if (!this.builderDictionary || Object.keys(this.builderDictionary).length === 0) {
            alert('No entries to export');
            return;
        }
        
        try {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const filename = `E_Notes_${dateStr}.json`;
            
            // Don't export cloud IDs
            const exportDict = {};
            Object.entries(this.builderDictionary).forEach(([topic, data]) => {
                exportDict[topic] = {
                    desc: data.desc,
                    ex: data.ex
                };
            });
            
            window.utils.downloadJSON(exportDict, filename);
            window.utils.showNotification(`Notes exported as ${filename}`, '📤', false, true);
        } catch (error) {
            console.error('Error exporting:', error);
            alert('Error exporting Notes: ' + error.message);
        }
    }
    
    // ============ GETTERS ============
    
    getDictionary() {
        return this.builderDictionary;
    }
}

// Initialize BuilderManager
let builderManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing BuilderManager with edit/delete features...');
    try {
        builderManager = new BuilderManager();
        window.builderManager = builderManager;
        console.log('BuilderManager initialized successfully');
    } catch (error) {
        console.error('Error initializing BuilderManager:', error);
    }
});