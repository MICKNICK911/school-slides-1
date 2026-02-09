// scripts/modules/dictionary.js
import { saveDictionaryEntry, deleteDictionaryEntry, loadDictionaryEntries, exportTableData, importTableData } from './dataManager.js';
import { showNotification, processMarkdown } from './utils.js';

let dictionary = {};
let currentEditId = null;
let unsubscribeDictionary = null;
let currentTableId = null;

// Initialize dictionary module
export function initDictionary() {
    setupEventListeners();
    
    // Listen for table changes
    window.addEventListener('tableChanged', handleTableChange);
    
    return {
        getDictionary: () => dictionary,
        getCurrentEditId: () => currentEditId,
        cleanup: cleanupDictionary
    };
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
    document.getElementById('importDictFile').addEventListener('change', handleDictionaryImport);
    
    // Search
    document.getElementById('searchDictInput').addEventListener('input', updateEntriesList);
    
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
    
    if (!topic || !desc || !ex) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (dictionary[topic]) {
        showNotification('Topic already exists in this table. Edit the existing one.', 'error');
        return;
    }
    
    const entryData = {
        desc: desc,
        ex: ex.split(',').map(item => item.trim()),
        createdAt: new Date().toISOString()
    };
    
    try {
        await saveDictionaryEntry(currentTableId, topic, entryData);
        showNotification('Entry added successfully');
        clearDictionaryForm();
    } catch (error) {
        showNotification('Failed to save entry. Please try again.', 'error');
    }
}

// Update existing entry
async function updateEntry() {
    if (!currentTableId || !currentEditId) return;
    
    const newTopic = document.getElementById('topic').value.trim();
    const desc = document.getElementById('desc').value.trim();
    const ex = document.getElementById('ex').value.trim();
    
    if (!newTopic || !desc || !ex) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    const entryData = {
        desc: desc,
        ex: ex.split(',').map(item => item.trim()),
        updatedAt: new Date().toISOString()
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
    document.getElementById('desc').value = entry.desc;
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
    const searchTerm = document.getElementById('searchDictInput').value.toLowerCase();
    const container = document.getElementById('entriesList');
    
    // Filter entries
    const filteredEntries = Object.entries(dictionary).filter(([topic, data]) => {
        if (!searchTerm) return true;
        
        const searchInDesc = data.desc.toLowerCase().includes(searchTerm);
        const searchInExamples = data.ex?.some(ex => 
            ex.toLowerCase().includes(searchTerm)
        ) || false;
        
        return topic.toLowerCase().includes(searchTerm) || 
               searchInDesc || 
               searchInExamples;
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
                <div class="entry-desc">${data.desc}</div>
                <div class="entry-examples">Examples: ${data.ex?.join(', ') || 'None'}</div>
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
    
    if (Object.keys(dictionary).length === 0) {
        container.innerHTML = '<div class="empty-state">No dictionary entries in this table</div>';
        return;
    }
    
    let markdownHTML = '';
    for (const [topic, data] of Object.entries(dictionary)) {
        markdownHTML += `
            <div class="topic">${processMarkdown(topic)}</div>
            <div class="desc">${processMarkdown(data.desc)}</div>
            <div class="examples">
        `;
        
        data.ex?.forEach(example => {
            markdownHTML += `<div class="example-item">${processMarkdown(example)}</div>`;
        }) || '';
        
        markdownHTML += `</div><hr style="margin: 20px 0;">`;
    }
    container.innerHTML = markdownHTML;
}

// Update count badge
function updateCountBadge() {
    const count = Object.keys(dictionary).length;
    document.getElementById('dictCount').textContent = count;
}

// Export dictionary
async function exportDictionary() {
    if (!currentTableId) {
        showNotification('Please select a table first', 'error');
        return;
    }
    
    try {
        const data = await exportTableData(currentTableId);
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        const tableName = document.getElementById('currentTableName').textContent
            .replace(/\s+/g, '_').toLowerCase();
        a.href = url;
        a.download = `${tableName}_dictionary_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Dictionary exported successfully');
    } catch (error) {
        showNotification('Failed to export dictionary', 'error');
    }
}

// Clear dictionary (all entries in current table)
async function clearDictionary() {
    if (!currentTableId) return;
    
    if (!confirm('Are you sure you want to clear ALL dictionary entries in this table? This cannot be undone.')) {
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
        showNotification('Failed to clear dictionary', 'error');
    }
}

// Handle dictionary import
async function handleDictionaryImport(event) {
    if (!currentTableId) {
        showNotification('Please select a table first', 'error');
        return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // Validate import data
            if (!importData.dictionary && !importData.notes) {
                showNotification('Invalid import file: No dictionary data found', 'error');
                return;
            }
            
            // Show import options modal
            showImportModal(importData);
        } catch (error) {
            showNotification('Invalid JSON file', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Show delete confirmation
function showDeleteConfirmation(topic, type) {
    document.getElementById('deleteTopic').textContent = topic;
    document.getElementById('deleteModal').dataset.type = type;
    document.getElementById('deleteModal').dataset.topic = topic;
    document.getElementById('deleteModal').style.display = 'flex';
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
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

// Global delete confirmation handler
window.confirmDeleteAction = async function() {
    const modal = document.getElementById('deleteModal');
    const topic = modal.dataset.topic;
    const type = modal.dataset.type;
    
    if (type === 'dictionary' && currentTableId) {
        try {
            await deleteDictionaryEntry(currentTableId, topic);
            showNotification('Entry deleted');
        } catch (error) {
            showNotification('Delete failed', 'error');
        }
    }
    
    // Hide modal
    modal.style.display = 'none';
};

// Cleanup on logout
export function cleanupDictionary() {
    if (unsubscribeDictionary) {
        unsubscribeDictionary();
        unsubscribeDictionary = null;
    }
    
    dictionary = {};
    currentEditId = null;
    currentTableId = null;
}

// Helper function to show import modal
function showImportModal(importData) {
    window.pendingImportData = importData;
    document.getElementById('importModal').style.display = 'flex';
}