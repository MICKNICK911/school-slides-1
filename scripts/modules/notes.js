// scripts/modules/notes.js
import { db } from './firebaseConfig.js';
import { getCurrentUser } from './auth.js';
import { showNotification } from './uiManager.js';
import { processMarkdown } from './utils.js';

let notes = {};
let currentTableId = null;
let unsubscribeNotes = null;

// Initialize notes module
export function initNotes() {
    console.log('Initializing notes module...');
    
    // Listen for table changes
    window.addEventListener('tableChanged', handleTableChange);
    
    // Listen for delete events
    window.addEventListener('deleteItem', handleDeleteItem);
    
    // Listen for export events
    window.addEventListener('exportData', handleExport);
    
    // Set up event listeners
    setupEventListeners();
    
    return {
        getNotes: () => notes
    };
}

// Handle table change
function handleTableChange(event) {
    const { tableId } = event.detail;
    
    // Unsubscribe from previous table
    if (unsubscribeNotes) {
        unsubscribeNotes();
        unsubscribeNotes = null;
    }
    
    // Clear current notes
    notes = {};
    currentTableId = tableId;
    
    // Reset UI
    clearNoteForm();
    updateNoteDropdown();
    updateNotesList();
    updateNotesPreview();
    
    // If new table selected, load its notes
    if (tableId) {
        loadUserNotes(tableId);
    }
}

// Load notes for a table
function loadUserNotes(tableId) {
    const user = getCurrentUser();
    if (!user || !tableId) return;
    
    try {
        unsubscribeNotes = db.collection('users').doc(user.uid)
            .collection('tables').doc(tableId)
            .collection('notes')
            .orderBy('updatedAt', 'desc')
            .onSnapshot((snapshot) => {
                notes = {};
                snapshot.forEach(doc => {
                    notes[doc.id] = { id: doc.id, ...doc.data() };
                });
                
                updateNoteDropdown();
                updateNotesList();
                updateNotesPreview();
                updateNotesCountBadge();
                
            }, (error) => {
                console.error('Error loading notes:', error);
                notes = {};
                updateNoteDropdown();
                updateNotesList();
                updateNotesPreview();
                updateNotesCountBadge();
            });
    } catch (error) {
        console.error('Error setting up notes listener:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Form buttons
    document.getElementById('addNoteBtn').addEventListener('click', addNote);
    document.getElementById('updateNoteBtn').addEventListener('click', updateNote);
    document.getElementById('cancelNoteBtn').addEventListener('click', cancelNoteEdit);
    document.getElementById('noteId').addEventListener('change', loadNoteForEdit);
    
    // Clear button
    document.getElementById('clearNotesBtn').addEventListener('click', clearNotes);
    
    // Search
    document.getElementById('searchNotesInput').addEventListener('input', updateNotesList);
    
    // Import
    document.getElementById('importNotesBtn').addEventListener('click', () => {
        document.getElementById('importNotesFile').click();
    });
    
    document.getElementById('importNotesFile').addEventListener('change', handleImport);
    
    // Export
    document.getElementById('exportNotesBtn').addEventListener('click', () => {
        const tableName = document.getElementById('currentTableName').textContent
            .replace(/\s+/g, '_').toLowerCase();
        document.getElementById('filename').value = `${tableName}_notes.json`;
        document.getElementById('exportModal').style.display = 'flex';
    });
}

// Add new note
async function addNote() {
    if (!currentTableId) {
        showNotification('Please select a table first', 'error');
        return;
    }
    
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    
    if (!title) {
        showNotification('Please enter a title', 'error');
        return;
    }
    
    const user = getCurrentUser();
    if (!user) {
        showNotification('Please sign in first', 'error');
        return;
    }
    
    // Generate ID
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const noteData = {
        title: title,
        content: content,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    try {
        await db.collection('users').doc(user.uid)
            .collection('tables').doc(currentTableId)
            .collection('notes').doc(noteId)
            .set(noteData);
        
        showNotification('Note saved successfully');
        clearNoteForm();
        
    } catch (error) {
        console.error('Error saving note:', error);
        showNotification('Failed to save note', 'error');
    }
}

// Update note
async function updateNote() {
    if (!currentTableId) return;
    
    const noteId = document.getElementById('noteId').value;
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    
    if (!noteId || !title) {
        showNotification('Please select a note and enter a title', 'error');
        return;
    }
    
    const user = getCurrentUser();
    if (!user) {
        showNotification('Please sign in first', 'error');
        return;
    }
    
    const noteData = {
        title: title,
        content: content,
        updatedAt: new Date()
    };
    
    try {
        await db.collection('users').doc(user.uid)
            .collection('tables').doc(currentTableId)
            .collection('notes').doc(noteId)
            .set(noteData, { merge: true });
        
        showNotification('Note updated successfully');
        cancelNoteEdit();
        
    } catch (error) {
        console.error('Error updating note:', error);
        showNotification('Update failed', 'error');
    }
}

// Load note for editing
function loadNoteForEdit() {
    const noteId = this.value;
    if (!noteId) {
        cancelNoteEdit();
        return;
    }
    
    const note = notes[noteId];
    if (!note) return;
    
    document.getElementById('noteTitle').value = note.title || '';
    document.getElementById('noteContent').value = note.content || '';
    
    document.getElementById('addNoteBtn').disabled = true;
    document.getElementById('updateNoteBtn').disabled = false;
    document.getElementById('cancelNoteBtn').disabled = false;
}

// Cancel edit
function cancelNoteEdit() {
    clearNoteForm();
    document.getElementById('noteId').value = "";
    document.getElementById('addNoteBtn').disabled = false;
    document.getElementById('updateNoteBtn').disabled = true;
    document.getElementById('cancelNoteBtn').disabled = true;
}

// Clear form
function clearNoteForm() {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
}

// Update note dropdown
function updateNoteDropdown() {
    const select = document.getElementById('noteId');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">-- Create New Note --</option>';
    
    Object.values(notes).forEach(note => {
        const option = document.createElement('option');
        option.value = note.id;
        option.textContent = note.title || 'Untitled Note';
        if (note.id === currentValue) option.selected = true;
        select.appendChild(option);
    });
}

// Update notes list
function updateNotesList() {
    const searchTerm = document.getElementById('searchNotesInput').value.toLowerCase();
    const container = document.getElementById('notesList');
    
    // Filter notes
    const filteredNotes = Object.values(notes).filter(note => {
        if (!searchTerm) return true;
        
        const searchInTitle = (note.title || '').toLowerCase().includes(searchTerm);
        const searchInContent = (note.content || '').toLowerCase().includes(searchTerm);
        
        return searchInTitle || searchInContent;
    });
    
    // Display results
    if (filteredNotes.length === 0) {
        const message = Object.keys(notes).length === 0 ? 
            'No notes in this table' : 
            'No matching notes found';
        container.innerHTML = `<div class="empty-state">${message}</div>`;
        return;
    }
    
    // Create HTML for notes
    const notesHTML = filteredNotes.map(note => {
        const date = note.updatedAt?.toDate ? note.updatedAt.toDate() : new Date(note.updatedAt || Date.now());
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const contentPreview = note.content ? 
            note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '') : 
            'No content';
        
        return `
            <div class="entry-item note-item">
                <div class="entry-info">
                    <div class="entry-topic">${note.title || 'Untitled Note'}</div>
                    <div class="entry-desc">${contentPreview}</div>
                    <div class="entry-examples">Updated: ${dateStr}</div>
                </div>
                <div class="entry-actions">
                    <button class="btn btn-warning edit-btn" data-noteid="${note.id}">Edit</button>
                    <button class="btn btn-danger delete-btn" data-noteid="${note.id}">Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = notesHTML;
    
    // Add event listeners
    container.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const noteId = btn.dataset.noteid;
            document.getElementById('noteId').value = noteId;
            loadNoteForEdit.call(document.getElementById('noteId'));
        });
    });
    
    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const noteId = btn.dataset.noteid;
            const noteTitle = notes[noteId]?.title || 'Untitled Note';
            document.getElementById('deleteTopic').textContent = noteTitle;
            document.getElementById('deleteModal').dataset.type = 'notes';
            document.getElementById('deleteModal').dataset.itemId = noteId;
            document.getElementById('deleteModal').style.display = 'flex';
        });
    });
}

// Update preview
function updateNotesPreview() {
    const container = document.getElementById('notes');
    
    if (Object.keys(notes).length === 0) {
        container.innerHTML = '<div class="empty-state">No notes in this table</div>';
        return;
    }
    
    let markdownHTML = '';
    Object.values(notes).forEach(note => {
        const date = note.updatedAt?.toDate ? note.updatedAt.toDate() : new Date(note.updatedAt || Date.now());
        const dateStr = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        markdownHTML += `
            <div class="note-title">${processMarkdown(note.title || 'Untitled Note')}</div>
            <div class="note-meta">Last updated: ${dateStr}</div>
            <div class="note-content">${processMarkdown(note.content || '')}</div>
            <hr style="margin: 25px 0; border: none; border-top: 2px dashed #e0e0e0;">
        `;
    });
    
    container.innerHTML = markdownHTML;
}

// Update count badge
function updateNotesCountBadge() {
    document.getElementById('notesCount').textContent = Object.keys(notes).length;
}

// Handle delete item
async function handleDeleteItem(event) {
    const { type, itemId } = event.detail;
    
    if (type !== 'notes' || !currentTableId || !itemId) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        await db.collection('users').doc(user.uid)
            .collection('tables').doc(currentTableId)
            .collection('notes').doc(itemId)
            .delete();
        
        showNotification('Note deleted');
        
    } catch (error) {
        console.error('Error deleting note:', error);
        showNotification('Delete failed', 'error');
    }
}

// Clear notes
async function clearNotes() {
    if (!currentTableId) return;
    
    const noteCount = Object.keys(notes).length;
    if (noteCount === 0) {
        showNotification('No notes to clear', 'info');
        return;
    }
    
    if (!confirm(`Are you sure you want to clear ALL ${noteCount} notes? This cannot be undone.`)) {
        return;
    }
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const noteIds = Object.keys(notes);
        const deletePromises = noteIds.map(noteId => 
            db.collection('users').doc(user.uid)
                .collection('tables').doc(currentTableId)
                .collection('notes').doc(noteId)
                .delete()
        );
        
        await Promise.all(deletePromises);
        showNotification('Notes cleared successfully');
        
    } catch (error) {
        console.error('Error clearing notes:', error);
        showNotification('Failed to clear notes', 'error');
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
        
        if (!importData.notes) {
            showNotification('Invalid import file', 'error');
            return;
        }
        
        // Show import options
        document.getElementById('importModal').style.display = 'flex';
        
        // Store import data for later
        window.pendingImport = {
            data: importData.notes,
            type: 'notes'
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
            notes: notes,
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
        
        showNotification('Notes exported successfully');
        
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
        const notesRef = db.collection('users').doc(user.uid)
            .collection('tables').doc(currentTableId)
            .collection('notes');
        
        // If replace, delete existing notes
        if (action === 'replace') {
            const existingNotes = Object.keys(notes);
            existingNotes.forEach(noteId => {
                batch.delete(notesRef.doc(noteId));
            });
        }
        
        // Import new notes
        Object.entries(importData).forEach(([noteId, data]) => {
            batch.set(notesRef.doc(noteId), {
                ...data,
                updatedAt: new Date()
            });
        });
        
        await batch.commit();
        
        showNotification(`Notes imported successfully (${action})`);
        
    } catch (error) {
        console.error('Import error:', error);
        showNotification('Import failed', 'error');
    } finally {
        delete window.pendingImport;
    }
});