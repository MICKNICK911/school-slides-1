// scripts/modules/dictionary.js
import { db } from './firebaseConfig.js';
import { getCurrentUser } from './auth.js';
import { showNotification } from './uiManager.js';
import { processMarkdown } from './utils.js';

let dictionary = {};
let currentTableId = null;
let unsubscribeDictionary = null;

// Initialize dictionary module
export function initDictionary() {
    console.log('Initializing dictionary module...');
    
    // Listen for table changes
    window.addEventListener('tableChanged', handleTableChange);
    
    // Listen for delete events
    window.addEventListener('deleteItem', handleDeleteItem);
    
    // Listen for export events
    window.addEventListener('exportData', handleExport);
    
    // Set up event listeners
    setupEventListeners();
    
    return {
        getDictionary: () => dictionary
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
    currentTableId = tableId;
    
    // Reset UI
    clearDictionaryForm();
    updateEditDropdown();
    updateEntriesList();
    updateDictionaryPreview();
    
    // If new table selected, load its dictionary
    if (tableId) {
        loadDictionaryEntries(tableId);
    }
}

// Load dictionary entries for a table
function loadDictionaryEntries(tableId) {
    const user = getCurrentUser();
    if (!user || !tableId) return;
    
    try {
        unsubscribeDictionary = db.collection('users').doc(user.uid)
            .collection('tables').doc(tableId)
            .collection('dictionary')
            .onSnapshot((snapshot) => {
                dictionary = {};
                snapshot.forEach(doc => {
                    dictionary[doc.id] = doc.data();
                });
                
                updateEditDropdown();
                updateEntriesList();
                updateDictionaryPreview();
                updateCountBadge();
                
            }, (error) => {
                console.error('Error loading dictionary:', error);
                dictionary = {};
                updateEditDropdown();
                updateEntriesList();
                updateDictionaryPreview();
                updateCountBadge();
            });
    } catch (error) {
        console.error('Error setting up dictionary listener:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Form buttons
    document.getElementById('addBtn').addEventListener('click', addEntry);
    document.getElementById('updateBtn').addEventListener('click', updateEntry);
    document.getElementById('cancelBtn').addEventListener('click', cancelEdit);
    document.getElementById('editId').addEventListener('change', loadEntryForEdit);
    
    // Clear button
    document.getElementById('clearDictBtn').addEventListener('click', clearDictionary);
    
    // Search
    document.getElementById('searchDictInput').addEventListener('input', updateEntriesList);
    
    // Import
    document.getElementById('importDictBtn').addEventListener('click', () => {
        document.getElementById('importDictFile').click();
    });
    
    document.getElementById('importDictFile').addEventListener('change', handleImport);
    
    // Export
    document.getElementById('exportDictBtn').addEventListener('click', () => {
        const tableName = document.getElementById('currentTableName').textContent
            .replace(/\s+/g, '_').toLowerCase();
        document.getElementById('filename').value = `${tableName}_dictionary.json`;
        document.getElementById('exportModal').style.display = 'flex';
    });
}

// Add new entry
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
        showNotification('Topic already exists. Edit the existing one.', 'error');
        return;
    }
    
    const user = getCurrentUser();
    if (!user) {
        showNotification('Please sign in first', 'error');
        return;
    }
    
    const entryData = {
        desc: desc,
        ex: ex ? ex.split(',').map(item => item.trim()).filter(item => item.length > 0) : [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    try {
        await db.collection('users').doc(user.uid)
            .collection('tables').doc(currentTableId)
            .collection('dictionary').doc(topic)
            .set(entryData);
        
        showNotification('Entry added successfully');
        clearDictionaryForm();
        
    } catch (error) {
        console.error('Error adding entry:', error);
        showNotification('Failed to save entry', 'error');
    }
}

// Update entry
async function updateEntry() {
    if (!currentTableId) return;
    
    const selectedTopic = document.getElementById('editId').value;
    const newTopic = document.getElementById('topic').value.trim();
    const desc = document.getElementById('desc').value.trim();
    const ex = document.getElementById('ex').value.trim();
    
    if (!newTopic || !desc) {
        showNotification('Please fill in topic and description', 'error');
        return;
    }
    
    const user = getCurrentUser();
    if (!user) {
        showNotification('Please sign in first', 'error');
        return;
    }
    
    const entryData = {
        desc: desc,
        ex: ex ? ex.split(',').map(item => item.trim()).filter(item => item.length > 0) : [],
        updatedAt: new Date()
    };
    
    try {
        // If topic changed, delete old and create new
        if (selectedTopic !== newTopic) {
            await db.collection('users').doc(user.uid)
                .collection('tables').doc(currentTableId)
                .collection('dictionary').doc(selectedTopic)
                .delete();
        }
        
        await db.collection('users').doc(user.uid)
            .collection('tables').doc(currentTableId)
            .collection('dictionary').doc(newTopic)
            .set(entryData, { merge: true });
        
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
    
    document.getElementById('addBtn').disabled = true;
    document.getElementById('updateBtn').disabled = false;
    document.getElementById('cancelBtn').disabled = false;
}

// Cancel edit
function cancelEdit() {
    clearDictionaryForm();
    document.getElementById('editId').value = "";
    document.getElementById('addBtn').disabled = false;
    document.getElementById('updateBtn').disabled = true;
    document.getElementById('cancelBtn').disabled = true;
}

// Clear form
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

// Update entries list
function updateEntriesList() {
    const searchTerm = document.getElementById('searchDictInput').value.toLowerCase();
    const container = document.getElementById('entriesList');
    
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
    
    // Add event listeners
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
            document.getElementById('deleteTopic').textContent = topic;
            document.getElementById('deleteModal').dataset.type = 'dictionary';
            document.getElementById('deleteModal').dataset.itemId = topic;
            document.getElementById('deleteModal').style.display = 'flex';
        });
    });
}

// Update preview
function updateDictionaryPreview() {
    const container = document.getElementById('dictionary');
    
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
    document.getElementById('dictCount').textContent = Object.keys(dictionary).length;
}

// Handle delete item
async function handleDeleteItem(event) {
    const { type, itemId } = event.detail;
    
    if (type !== 'dictionary' || !currentTableId || !itemId) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        await db.collection('users').doc(user.uid)
            .collection('tables').doc(currentTableId)
            .collection('dictionary').doc(itemId)
            .delete();
        
        showNotification('Entry deleted');
        
    } catch (error) {
        console.error('Error deleting entry:', error);
        showNotification('Delete failed', 'error');
    }
}

// Clear dictionary
async function clearDictionary() {
    if (!currentTableId) return;
    
    const entryCount = Object.keys(dictionary).length;
    if (entryCount === 0) {
        showNotification('No entries to clear', 'info');
        return;
    }
    
    if (!confirm(`Are you sure you want to clear ALL ${entryCount} dictionary entries? This cannot be undone.`)) {
        return;
    }
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const entries = Object.keys(dictionary);
        const deletePromises = entries.map(topic => 
            db.collection('users').doc(user.uid)
                .collection('tables').doc(currentTableId)
                .collection('dictionary').doc(topic)
                .delete()
        );
        
        await Promise.all(deletePromises);
        showNotification('Dictionary cleared successfully');
        
    } catch (error) {
        console.error('Error clearing dictionary:', error);
        showNotification('Failed to clear dictionary', 'error');
    }
}

// Handle import
async function handleImport(event) {
    const file = event.target.files[0];
    if (!file || !currentTableId) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        if (!importData.dictionary) {
            showNotification('Invalid import file', 'error');
            return;
        }
        
        // Show import options
        document.getElementById('importModal').style.display = 'flex';
        
        // Store import data for later
        window.pendingImport = {
            data: importData.dictionary,
            type: 'dictionary'
        };
        
    } catch (error) {
        console.error('Import error:', error);
        showNotification('Invalid JSON file', 'error');
    } finally {
        event.target.value = '';
    }
}

// Handle export
async function handleExport(event) {
    const { filename } = event.detail;
    
    if (!currentTableId || !filename) return;
    
    try {
        const exportData = {
            dictionary: dictionary,
            metadata: {
                exportedAt: new Date().toISOString(),
                tableId: currentTableId,
                tableName: document.getElementById('currentTableName').textContent
            }
        };
        
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Dictionary exported successfully');
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export', 'error');
    }
}

// Listen for import data
window.addEventListener('importData', async (event) => {
    const { action } = event.detail;
    
    if (!window.pendingImport || !currentTableId) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const importData = window.pendingImport.data;
        const batch = db.batch();
        const dictRef = db.collection('users').doc(user.uid)
            .collection('tables').doc(currentTableId)
            .collection('dictionary');
        
        // If replace, delete existing entries
        if (action === 'replace') {
            const existingEntries = Object.keys(dictionary);
            existingEntries.forEach(topic => {
                batch.delete(dictRef.doc(topic));
            });
        }
        
        // Import new entries
        Object.entries(importData).forEach(([topic, data]) => {
            batch.set(dictRef.doc(topic), {
                ...data,
                updatedAt: new Date()
            });
        });
        
        await batch.commit();
        
        showNotification(`Dictionary imported successfully (${action})`);
        
    } catch (error) {
        console.error('Import error:', error);
        showNotification('Import failed', 'error');
    } finally {
        delete window.pendingImport;
    }
});