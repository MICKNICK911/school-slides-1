// scripts/modules/dictionary.js
import { saveDictionaryEntry, deleteDictionaryEntry, loadDictionaryEntries, 
         exportTableData, importTableData } from './database.js';
import { showNotification, processMarkdown } from './utils.js';
import { showModal, hideModal } from './uiManager.js';

let dictionary = {};
let currentEditId = null;
let unsubscribeDictionary = null;
let currentTableId = null;
let searchTerm = '';

// Initialize dictionary module
export function initDictionary() {
    setupEventListeners();
    
    // Listen for table changes
    window.addEventListener('tableChanged', handleTableChange);
    
    // Listen for delete events
    window.addEventListener('deleteDictionaryEntry', handleDeleteEntry);
    window.addEventListener('clearDictionary', handleClearDictionary);
    
    // Listen for import events
    window.addEventListener('dictionaryImport', handleDictionaryImport);
    
    const module = {
        getDictionary: () => dictionary,
        getCurrentEditId: () => currentEditId,
        cleanup: cleanupDictionary
    };
    
    // Store reference globally for other modules
    window.dictionaryModule = module;
    
    return module;
}

// Handle table change
function handleTableChange(event) {
    const { tableId } = event.detail;
    
    // Unsubscribe from previous table
    if (unsubscribeDictionary) {
        unsubscribeDictionary();
        unsubscribeDictionary = null;
    }
    
    // Clear current dictionary
    dictionary = {};
    currentEditId = null;
    currentTableId = tableId;
    
    // Reset form
    clearDictionaryForm();
    updateEditDropdown();
    updateEntriesList();
    updateDictionaryPreview();
    
    // If new table selected, load its dictionary
    if (tableId) {
        unsubscribeDictionary = loadDictionaryEntries(tableId, (entries) => {
            dictionary = entries;
            updateEditDropdown();
            updateEntriesList();
            updateDictionaryPreview();
            updateCountBadge();
        });
    } else {
        // No table selected
        updateCountBadge();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form buttons
    document.getElementById('addBtn').addEventListener('click', addEntry);
    document.getElementById('updateBtn').addEventListener('click', updateEntry);
    document.getElementById('cancelBtn').addEventListener('click', cancelEdit);
    document.getElementById('editId').addEventListener('change', loadEntryForEdit);
    
    // Import/Export buttons
    document.getElementById('exportDictBtn').addEventListener('click', exportDictionary);
    document.getElementById('clearDictBtn').addEventListener('click', clearDictionary);
    
    // Search
    const searchInput = document.getElementById('searchDictInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            updateEntriesList();
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Add new dictionary entry
async function addEntry() {
    if (!currentTableId) {
        showNotification('Please select a table first', 'error');
        return;
    }
    
    const topic = document.getElementById('topic').value.trim();
    const desc = document.getElementById('desc').value.trim();
    const ex = document.getElementById('ex').value.trim();
    
    if (!topic || !desc) {
        showNotification('Please fill in topic and description', 'error');
        return;
    }
    
    if (dictionary[topic]) {
        showNotification('Topic already exists in this table. Edit the existing one.', 'error');
        return;
    }
    
    const entryData = {
        desc: desc,
        ex: ex ? ex.split(',').map(item => item.trim()).filter(item => item.length > 0) : [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    try {
        await saveDictionaryEntry(currentTableId, topic, entryData);
        showNotification('Entry added successfully');
        clearDictionaryForm();
    } catch (error) {
        console.error('Error adding entry:', error);
        showNotification('Failed to save entry. Check connection.', 'error');
    }
}

// Update existing entry
async function updateEntry() {
    if (!currentTableId || !currentEditId) return;
    
    const newTopic = document.getElementById('topic').value.trim();
    const desc = document.getElementById('desc').value.trim();
    const ex = document.getElementById('ex').value.trim();
    
    if (!newTopic || !desc) {
        showNotification('Please fill in topic and description', 'error');
        return;
    }
    
    const entryData = {
        desc: desc,
        ex: ex ? ex.split(',').map(item => item.trim()).filter(item => item.length > 0) : [],
        updatedAt: new Date()
    };
    
    try {
        // If topic name changed, delete old and create new
        if (currentEditId !== newTopic) {
            await deleteDictionaryEntry(currentTableId, currentEditId);
        }
        
        await saveDictionaryEntry(currentTableId, newTopic, entryData);
        showNotification('Entry updated successfully');
        cancelEdit();
    } catch (error) {
        console.error('Error updating entry:', error);
        showNotification('Update failed', 'error');
    }
}

// Load entry for editing
function loadEntryForEdit() {
    const selectedTopic = this.value;
    if (!selectedTopic) {
        cancelEdit();
        return;
    }
    
    const entry = dictionary[selectedTopic];
    if (!entry) return;
    
    document.getElementById('topic').value = selectedTopic;
    document.getElementById('desc').value = entry.desc || '';
    document.getElementById('ex').value = entry.ex ? entry.ex.join(', ') : '';
    
    currentEditId = selectedTopic;
    document.getElementById('addBtn').disabled = true;
    document.getElementById('updateBtn').disabled = false;
    document.getElementById('cancelBtn').disabled = false;
    document.getElementById('topic').focus();
}

// Cancel edit mode
function cancelEdit() {
    clearDictionaryForm();
    document.getElementById('editId').value = "";
    currentEditId = null;
    document.getElementById('addBtn').disabled = false;
    document.getElementById('updateBtn').disabled = true;
    document.getElementById('cancelBtn').disabled = true;
}

// Clear dictionary form
function clearDictionaryForm() {
    document.getElementById('topic').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('ex').value = '';
}

// Update edit dropdown
function updateEditDropdown() {
    const select = document.getElementById('editId');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">-- Create New Entry --</option>';
    
    Object.keys(dictionary).sort().forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        if (topic === currentValue) option.selected = true;
        select.appendChild(option);
    });
}

// Update entries list with search filtering
function updateEntriesList() {
    const container = document.getElementById('entriesList');
    if (!container) return;
    
    // Filter entries
    const filteredEntries = Object.entries(dictionary).filter(([topic, data]) => {
        if (!searchTerm) return true;
        
        const searchInTopic = topic.toLowerCase().includes(searchTerm);
        const searchInDesc = (data.desc || '').toLowerCase().includes(searchTerm);
        const searchInExamples = (data.ex || []).some(ex => 
            ex.toLowerCase().includes(searchTerm)
        );
        
        return searchInTopic || searchInDesc || searchInExamples;
    });
    
    // Display results
    if (filteredEntries.length === 0) {
        const message = Object.keys(dictionary).length === 0 ? 
            'No entries in this table' : 
            'No matching entries found';
        container.innerHTML = `<div class="empty-state">${message}</div>`;
        return;
    }
    
    // Create HTML for entries
    const entriesHTML = filteredEntries.map(([topic, data]) => `
        <div class="entry-item">
            <div class="entry-info">
                <div class="entry-topic">${topic}</div>
                <div class="entry-desc">${data.desc || ''}</div>
                <div class="entry-examples">Examples: ${(data.ex || []).join(', ') || 'None'}</div>
            </div>
            <div class="entry-actions">
                <button class="btn btn-warning edit-btn" data-topic="${topic}">Edit</button>
                <button class="btn btn-danger delete-btn" data-topic="${topic}">Delete</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = entriesHTML;
    
    // Add event listeners to action buttons
    container.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const topic = btn.dataset.topic;
            document.getElementById('editId').value = topic;
            loadEntryForEdit.call(document.getElementById('editId'));
        });
    });
    
    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const topic = btn.dataset.topic;
            showDeleteConfirmation(topic, 'dictionary');
        });
    });
}

// Update dictionary preview
function updateDictionaryPreview() {
    const container = document.getElementById('dictionary-preview');
    if (!container) return;
    
    if (Object.keys(dictionary).length === 0) {
        container.innerHTML = '<div class="empty-state">No dictionary entries in this table</div>';
        return;
    }
    
    let markdownHTML = '';
    Object.entries(dictionary).forEach(([topic, data]) => {
        markdownHTML += `
            <div class="topic">${processMarkdown(topic)}</div>
            <div class="desc">${processMarkdown(data.desc || '')}</div>
        `;
        
        if (data.ex && data.ex.length > 0) {
            markdownHTML += `<div class="examples">`;
            data.ex.forEach(example => {
                markdownHTML += `<div class="example-item">${processMarkdown(example)}</div>`;
            });
            markdownHTML += `</div>`;
        }
        
        markdownHTML += `<hr style="margin: 20px 0;">`;
    });
    
    container.innerHTML = markdownHTML;
}

// Update count badge
function updateCountBadge() {
    const countElement = document.getElementById('dictCount');
    if (countElement) {
        countElement.textContent = Object.keys(dictionary).length;
    }
}

// Export dictionary
async function exportDictionary() {
    if (!currentTableId) {
        showNotification('Please select a table first', 'error');
        return;
    }
    
    try {
        const data = await exportTableData(currentTableId);
        const exportData = {
            dictionary: data.dictionary || {},
            metadata: {
                exportedAt: new Date().toISOString(),
                tableId: currentTableId,
                tableName: document.getElementById('currentTableName')?.textContent || 'Unknown',
                count: Object.keys(dictionary).length
            }
        };
        
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        const tableName = (document.getElementById('currentTableName')?.textContent || 'dictionary')
            .replace(/\s+/g, '_').toLowerCase();
        a.href = url;
        a.download = `${tableName}_dictionary_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Dictionary exported successfully');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export dictionary', 'error');
    }
}

// Clear dictionary (all entries in current table)
async function clearDictionary() {
    if (!currentTableId) return;
    
    const entryCount = Object.keys(dictionary).length;
    if (entryCount === 0) {
        showNotification('No entries to clear', 'info');
        return;
    }
    
    if (!confirm(`Are you sure you want to clear ALL ${entryCount} dictionary entries in this table? This cannot be undone.`)) {
        return;
    }
    
    try {
        const entries = Object.keys(dictionary);
        const deletePromises = entries.map(topic => 
            deleteDictionaryEntry(currentTableId, topic)
        );
        
        await Promise.all(deletePromises);
        showNotification('Dictionary cleared successfully');
    } catch (error) {
        console.error('Error clearing dictionary:', error);
        showNotification('Failed to clear dictionary', 'error');
    }
}

// Handle dictionary import
async function handleDictionaryImport(event) {
    const { data: importData, action } = event.detail;
    
    if (!currentTableId || !importData) return;
    
    try {
        const result = await importTableData(currentTableId, { dictionary: importData.dictionary });
        showNotification(`Imported ${result.importedEntries} dictionary entries (${action})`);
    } catch (error) {
        console.error('Import error:', error);
        showNotification('Failed to import dictionary', 'error');
    }
}

// Show delete confirmation
function showDeleteConfirmation(topic, type) {
    document.getElementById('deleteTopic').textContent = topic;
    document.getElementById('deleteModal').dataset.type = type;
    document.getElementById('deleteModal').dataset.topic = topic;
    showModal('deleteModal');
}

// Handle delete entry from event
async function handleDeleteEntry(event) {
    const { topic } = event.detail;
    
    if (!currentTableId || !topic) return;
    
    try {
        await deleteDictionaryEntry(currentTableId, topic);
        showNotification('Entry deleted');
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Delete failed', 'error');
    }
}

// Handle clear dictionary from event
async function handleClearDictionary() {
    if (!currentTableId) return;
    
    const entryCount = Object.keys(dictionary).length;
    if (entryCount === 0) return;
    
    try {
        const entries = Object.keys(dictionary);
        const deletePromises = entries.map(topic => 
            deleteDictionaryEntry(currentTableId, topic)
        );
        
        await Promise.all(deletePromises);
        showNotification('Dictionary cleared successfully');
    } catch (error) {
        console.error('Error clearing dictionary:', error);
        showNotification('Failed to clear dictionary', 'error');
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Only process if we're in dictionary context
    const topicFocused = document.activeElement.id === 'topic';
    const descFocused = document.activeElement.id === 'desc';
    const exFocused = document.activeElement.id === 'ex';
    
    if (!topicFocused && !descFocused && !exFocused) return;
    
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!document.getElementById('updateBtn').disabled) {
            document.getElementById('updateBtn').click();
        } else if (!document.getElementById('addBtn').disabled) {
            document.getElementById('addBtn').click();
        }
    }
    
    // Escape to cancel edit
    if (e.key === 'Escape' && !document.getElementById('cancelBtn').disabled) {
        document.getElementById('cancelBtn').click();
    }
}

// Cleanup on logout
export function cleanupDictionary() {
    if (unsubscribeDictionary) {
        unsubscribeDictionary();
        unsubscribeDictionary = null;
    }
    
    dictionary = {};
    currentEditId = null;
    currentTableId = null;
    searchTerm = '';
    
    // Clear UI
    const container = document.getElementById('entriesList');
    if (container) {
        container.innerHTML = '<div class="empty-state">Select a table to view entries</div>';
    }
    
    const preview = document.getElementById('dictionary-preview');
    if (preview) {
        preview.innerHTML = 'Select a table to preview dictionary entries';
    }
    
    const countElement = document.getElementById('dictCount');
    if (countElement) {
        countElement.textContent = '0';
    }
    
    // Clear form
    clearDictionaryForm();
}

// Initialize on load
console.log('Dictionary module loaded');