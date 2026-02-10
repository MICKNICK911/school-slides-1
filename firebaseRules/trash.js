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

class Utils {
    constructor() {
        this.DEFAULT_LESSONS = {
            "vowels": {
                "desc": "## Vowels\nThere are [5 Short vowels] and [5 long vowels]. Sometimes _/y/_ can act as a *vowel*.",
                "ex": ["a", "e", "i", "o", "u", "y"]
            },
            "consonants": {
                "desc": "## Consonants\nThere are [21] consonants in English.",
                "ex": ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"]
            },
            "Special Consonants": {
                "desc": "### Letter Magicians\nLetters that *change sounds*:\n- [x] = ks sound (_fox_)\n- [qu] = kw sound (_queen_)\n- [y] = short i sound (_gym_)\n- [y] = e sound (_happy_)\n- [y] = long i sound (_fly_)",
                "ex": ["quit", "queen", "quiz", "gym", "cry", "happy"]
            }
        };
    }
    
    // Format text with custom markers
    formatMarkdown(text) {
        // Split text into lines
        const lines = text.split('\n');
        let output = '';
        let inOrderedList = false;
        let inUnorderedList = false;
        
        for (let line of lines) {
            // Trim whitespace
            line = line.trim();
            
            // Skip empty lines
            if (!line) continue;
            
            // Process main topic (###)
            if (line.startsWith('### ')) {
                output += `<h2 class="markdown-h2">${this.processInlineMarkdown(line.slice(4))}</h2>`;
                continue;
            }
            
            // Process sub-topic (##)
            if (line.startsWith('## ')) {
                output += `<h3 class="markdown-h3">${this.processInlineMarkdown(line.slice(3))}</h3>`;
                continue;
            }
            
            // Process bold (#)
            if (line.startsWith('# ')) {
                output += `<strong class="markdown-strong">${this.processInlineMarkdown(line.slice(2))}</strong>`;
                continue;
            }
            
            // Process ordered list (-)
            if (line.startsWith('- ')) {
                if (!inOrderedList) {
                    output += '<ol class="markdown-ol">';
                    inOrderedList = true;
                }
                output += `<li class="markdown-li">${this.processInlineMarkdown(line.slice(2))}</li>`;
                continue;
            }
            
            // Process unordered list (+)
            if (line.startsWith('+ ')) {
                if (!inUnorderedList) {
                    output += '<ul class="markdown-ul">';
                    inUnorderedList = true;
                }
                output += `<li class="markdown-li">${this.processInlineMarkdown(line.slice(2))}</li>`;
                continue;
            }
            
            // Close lists if needed
            if (inOrderedList) {
                output += '</ol>';
                inOrderedList = false;
            }
            if (inUnorderedList) {
                output += '</ul>';
                inUnorderedList = false;
            }
            
            // Process regular paragraphs
            output += `<p class="markdown-p">${this.processInlineMarkdown(line)}</p>`;
        }
        
        // Close lists if still open
        if (inOrderedList) output += '</ol>';
        if (inUnorderedList) output += '</ul>';
        
        return output;
    }
    
    // Process inline markdown formatting
    processInlineMarkdown(text) {
        // Colored text: [text]
        text = text.replace(/\[([^\]]+)\]/g, '<span class="theme-color">$1</span>');
        
        // Underline: _text_
        text = text.replace(/_([^_]+)_/g, '<u class="markdown-u">$1</u>');
        
        // Italic: *text*
        text = text.replace(/\*([^*]+)\*/g, '<em class="markdown-em">$1</em>');
        
        return text;
    }
    
    // Show notification
    showNotification(message, icon, isError = false, isSuccess = false) {
        const notification = document.getElementById('dictionaryNotification');
        const notificationText = document.getElementById('notificationText');
        const notificationIcon = document.getElementById('notificationIcon');
        
        notificationText.textContent = message;
        notificationIcon.textContent = icon;
        
        if (isError) {
            notification.classList.add('error');
            notification.classList.remove('success');
        } else if (isSuccess) {
            notification.classList.add('success');
            notification.classList.remove('error');
        } else {
            notification.classList.remove('error', 'success');
        }
        
        notification.classList.add('active');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }
    
    // Apply case to text
    applyCase(text, isUpperCase) {
        return isUpperCase ? text.toUpperCase() : text.toLowerCase();
    }
    
    // Format time
    formatTime(date) {
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    // Format date for display
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString();
    }
    
    // Download JSON file
    downloadJSON(data, filename) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Read file as text
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
    
    // Validate JSON structure
    validateDictionary(json) {
        try {
            const data = typeof json === 'string' ? JSON.parse(json) : json;
            
            if (typeof data !== 'object' || data === null) {
                return false;
            }
            
            for (const key in data) {
                if (!data[key].desc || !Array.isArray(data[key].ex)) {
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Sanitize input
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
}

// Initialize Utils
let utils;
document.addEventListener('DOMContentLoaded', () => {
    utils = new Utils();
    window.utils = utils;
});

// cloud-data-manager.js - SIMPLIFIED
class CloudDataManager {
    constructor() {
        console.log('CloudDataManager: Initializing...');
        
        // Wait a bit then start
        setTimeout(() => {
            this.init();
        }, 2000);
    }
    
    async init() {
        console.log('CloudDataManager: Starting...');
        
        // Wait for auth
        await this.waitForAuth();
        
        // Load data
        await this.loadData();
    }
    
    async waitForAuth() {
        let attempts = 0;
        while (!window.authManager && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.authManager && window.authManager.isAuthenticated()) {
            console.log('CloudDataManager: User authenticated');
            return true;
        }
        
        console.log('CloudDataManager: User not authenticated');
        return false;
    }
    
    async loadData() {
        console.log('CloudDataManager: Loading data...');
        
        // First try cloud
        const cloudData = await this.loadFromCloud();
        
        if (cloudData && Object.keys(cloudData).length > 0) {
            console.log('CloudDataManager: Cloud data loaded');
            this.handleCloudData(cloudData);
        } else {
            console.log('CloudDataManager: No cloud data, trying local');
            this.loadFromLocal();
        }
    }
    
    // Update the loadFromCloud method
async loadFromCloud() {
    const user = window.firebaseServices.auth.currentUser;
    if (!user) {
        console.log('CloudDataManager: No user logged in');
        return null;
    }
    
    console.log('CloudDataManager: Loading notes for user:', user.uid);
    
    try {
        const notes = await window.databaseManager.getUserNotes();
        
        if (notes.length === 0) {
            console.log('CloudDataManager: No notes found for this user');
            return null;
        }
        
        // Convert to dictionary format
        const userDictionary = {};
        notes.forEach(note => {
            if (note.userId === user.uid) { // Double-check it's user's own note
                userDictionary[note.topic] = {
                    desc: note.desc || '',
                    ex: note.ex || []
                };
            }
        });
        
        console.log('CloudDataManager: Loaded user notes:', Object.keys(userDictionary).length);
        return userDictionary;
    } catch (error) {
        console.error('CloudDataManager: Error loading user notes:', error);
        return null;
    }
}
    
    loadFromLocal() {
        console.log('CloudDataManager: Loading from local storage...');
        
        try {
            const saved = localStorage.getItem('customDictionary');
            if (saved) {
                const dict = JSON.parse(saved);
                console.log('CloudDataManager: Local data:', Object.keys(dict).length, 'topics');
                this.handleLocalData(dict);
                return dict;
            } else {
                console.log('CloudDataManager: No local data');
                this.useDefaultData();
                return null;
            }
        } catch (error) {
            console.error('CloudDataManager: Error loading local:', error);
            this.useDefaultData();
            return null;
        }
    }
    
    handleCloudData(dict) {
        console.log('CloudDataManager: Handling cloud data...');
        
        if (!window.uiManager) {
            console.error('CloudDataManager: No UI manager');
            return;
        }
        
        // Merge with defaults
        const merged = {
            ...window.utils.DEFAULT_LESSONS,
            ...dict
        };
        
        // Update UI
        window.uiManager.updateLessons(merged);
        
        // Save to local
        this.saveToLocal(dict);
        
        // Show notification
        if (window.utils) {
            window.utils.showNotification(`Loaded ${Object.keys(dict).length} notes from cloud`, '☁️');
        }
    }
    
    handleLocalData(dict) {
        console.log('CloudDataManager: Handling local data...');
        
        if (!window.uiManager) {
            console.error('CloudDataManager: No UI manager');
            return;
        }
        
        // Merge with defaults
        const merged = {
            ...window.utils.DEFAULT_LESSONS,
            ...dict
        };
        
        // Update UI
        window.uiManager.updateLessons(merged);
        
        // Show notification
        if (window.utils) {
            window.utils.showNotification(`Loaded ${Object.keys(dict).length} notes from local storage`, '💾');
        }
    }
    
    useDefaultData() {
        console.log('CloudDataManager: Using default data');
        
        if (window.uiManager) {
            window.uiManager.updateLessons(window.utils.DEFAULT_LESSONS);
            
            if (window.utils) {
                window.utils.showNotification('Using default notes', '📚');
            }
        }
    }
    
    saveToLocal(dict) {
        try {
            localStorage.setItem('customDictionary', JSON.stringify(dict));
            console.log('CloudDataManager: Saved to local storage');
        } catch (error) {
            console.error('CloudDataManager: Error saving to local:', error);
        }
    }
    
    async forceRefreshFromCloud() {
        console.log('CloudDataManager: Force refreshing from cloud...');
        
        const cloudData = await this.loadFromCloud();
        if (cloudData) {
            this.handleCloudData(cloudData);
            return true;
        }
        
        return false;
    }
}

// Initialize
let cloudDataManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        cloudDataManager = new CloudDataManager();
        window.cloudDataManager = cloudDataManager;
    } catch (error) {
        console.error('Error initializing CloudDataManager:', error);
    }
});

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