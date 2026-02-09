// scripts/modules/notes.js
import { saveUserNote, deleteUserNote, loadUserNotes, exportTableData, importTableData } from './dataManager.js';
import { showNotification, processMarkdown, debounce } from './utils.js';

let notes = {};
let currentNoteId = null;
let unsubscribeNotes = null;
let currentTableId = null;
let noteSearchTerm = '';

// Initialize notes module
export function initNotes() {
    setupEventListeners();
    
    // Listen for table changes
    window.addEventListener('tableChanged', handleTableChange);
    
    // Handle delete confirmation for notes
    window.confirmNoteDelete = confirmNoteDeleteAction;
    
    return {
        getNotes: () => notes,
        getCurrentNoteId: () => currentNoteId,
        cleanup: cleanupNotes
    };
}

// Handle table change event
function handleTableChange(event) {
    const { tableId } = event.detail;
    
    // Unsubscribe from previous table's notes
    if (unsubscribeNotes) {
        unsubscribeNotes();
        unsubscribeNotes = null;
    }
    
    // Clear current state
    notes = {};
    currentNoteId = null;
    currentTableId = tableId;
    
    // Reset UI
    clearNoteForm();
    updateNoteDropdown();
    updateNotesList();
    updateNotesPreview();
    updateNotesCountBadge();
    
    // If a new table is selected, load its notes
    if (tableId) {
        unsubscribeNotes = loadUserNotes(tableId, (loadedNotes) => {
            notes = loadedNotes;
            updateNoteDropdown();
            updateNotesList();
            updateNotesPreview();
            updateNotesCountBadge();
            updateRawPreview();
        });
    }
}

// Setup all event listeners for notes
function setupEventListeners() {
    // Form buttons
    document.getElementById('addNoteBtn').addEventListener('click', addNote);
    document.getElementById('updateNoteBtn').addEventListener('click', updateNote);
    document.getElementById('cancelNoteBtn').addEventListener('click', cancelNoteEdit);
    document.getElementById('noteId').addEventListener('change', loadNoteForEdit);
    
    // Import/Export buttons
    document.getElementById('exportNotesBtn').addEventListener('click', exportNotes);
    document.getElementById('clearNotesBtn').addEventListener('click', clearNotes);
    document.getElementById('importNotesFile').addEventListener('change', handleNotesImport);
    
    // Search with debounce for performance
    const searchInput = document.getElementById('searchNotesInput');
    const debouncedSearch = debounce((e) => {
        noteSearchTerm = e.target.value.toLowerCase();
        updateNotesList();
    }, 300);
    searchInput.addEventListener('input', debouncedSearch);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleNoteKeyboardShortcuts);
}

// Add a new note
async function addNote() {
    if (!currentTableId) {
        showNotification('Please select a table first', 'error');
        return;
    }
    
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    
    if (!title || !content) {
        showNotification('Please fill in both title and content', 'error');
        return;
    }
    
    // Generate a unique ID for the note
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const noteData = {
        title: title,
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        await saveUserNote(currentTableId, noteId, title, content);
        showNotification('Note saved successfully');
        clearNoteForm();
        // Focus back on title for quick next entry
        document.getElementById('noteTitle').focus();
    } catch (error) {
        console.error('Error saving note:', error);
        showNotification('Failed to save note. Please try again.', 'error');
    }
}

// Update an existing note
async function updateNote() {
    if (!currentTableId || !currentNoteId) return;
    
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    
    if (!title || !content) {
        showNotification('Please fill in both title and content', 'error');
        return;
    }
    
    try {
        await saveUserNote(currentTableId, currentNoteId, title, content);
        showNotification('Note updated successfully');
        cancelNoteEdit();
    } catch (error) {
        console.error('Error updating note:', error);
        showNotification('Update failed. Please try again.', 'error');
    }
}

// Load a note for editing
function loadNoteForEdit() {
    const selectedNoteId = this.value;
    if (!selectedNoteId) {
        cancelNoteEdit();
        return;
    }
    
    const note = notes[selectedNoteId];
    if (!note) {
        showNotification('Note not found', 'error');
        return;
    }
    
    document.getElementById('noteTitle').value = note.title || '';
    document.getElementById('noteContent').value = note.content || '';
    
    currentNoteId = selectedNoteId;
    
    // Update button states
    document.getElementById('addNoteBtn').disabled = true;
    document.getElementById('updateNoteBtn').disabled = false;
    document.getElementById('cancelNoteBtn').disabled = false;
    
    // Focus on title for quick editing
    document.getElementById('noteTitle').focus();
}

// Cancel note edit mode
function cancelNoteEdit() {
    clearNoteForm();
    document.getElementById('noteId').value = "";
    currentNoteId = null;
    
    // Reset button states
    document.getElementById('addNoteBtn').disabled = false;
    document.getElementById('updateNoteBtn').disabled = true;
    document.getElementById('cancelNoteBtn').disabled = true;
}

// Clear note form
function clearNoteForm() {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
}

// Update the note selection dropdown
function updateNoteDropdown() {
    const select = document.getElementById('noteId');
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">-- Create New Note --</option>';
    
    // Sort notes by update date (newest first)
    const sortedNotes = Object.entries(notes).sort((a, b) => {
        const dateA = new Date(a[1].updatedAt || a[1].createdAt || 0);
        const dateB = new Date(b[1].updatedAt || b[1].createdAt || 0);
        return dateB - dateA;
    });
    
    sortedNotes.forEach(([noteId, note]) => {
        const option = document.createElement('option');
        option.value = noteId;
        option.textContent = note.title || 'Untitled Note';
        if (noteId === currentValue) option.selected = true;
        select.appendChild(option);
    });
}

// Update the notes list with search filtering
function updateNotesList() {
    const container = document.getElementById('notesList');
    
    // Filter notes based on search term
    const filteredNotes = Object.entries(notes).filter(([noteId, note]) => {
        if (!noteSearchTerm) return true;
        
        const titleMatch = note.title?.toLowerCase().includes(noteSearchTerm) || false;
        const contentMatch = note.content?.toLowerCase().includes(noteSearchTerm) || false;
        
        return titleMatch || contentMatch;
    });
    
    // Display results
    if (filteredNotes.length === 0) {
        const message = Object.keys(notes).length === 0 ? 
            'No notes in this table' : 
            'No matching notes found';
        container.innerHTML = `<div class="empty-state">${message}</div>`;
        return;
    }
    
    // Sort by update date
    const sortedNotes = filteredNotes.sort((a, b) => {
        const dateA = new Date(a[1].updatedAt || a[1].createdAt || 0);
        const dateB = new Date(b[1].updatedAt || b[1].createdAt || 0);
        return dateB - dateA;
    });
    
    // Create HTML for notes list
    const notesHTML = sortedNotes.map(([noteId, note]) => {
        const updatedDate = new Date(note.updatedAt || note.createdAt || Date.now());
        const dateStr = updatedDate.toLocaleDateString() + ' ' + updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Preview snippet (first 100 chars)
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
                    <button class="btn btn-warning edit-note-btn" data-noteid="${noteId}">Edit</button>
                    <button class="btn btn-danger delete-note-btn" data-noteid="${noteId}">Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = notesHTML;
    
    // Add event listeners to action buttons
    container.querySelectorAll('.edit-note-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const noteId = btn.dataset.noteid;
            document.getElementById('noteId').value = noteId;
            loadNoteForEdit.call(document.getElementById('noteId'));
        });
    });
    
    container.querySelectorAll('.delete-note-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const noteId = btn.dataset.noteid;
            const noteTitle = notes[noteId]?.title || 'Untitled Note';
            showNoteDeleteConfirmation(noteId, noteTitle);
        });
    });
}

// Update notes preview in markdown format
function updateNotesPreview() {
    const container = document.getElementById('notes-preview');
    
    if (Object.keys(notes).length === 0) {
        container.innerHTML = '<div class="empty-state">No notes in this table</div>';
        return;
    }
    
    // Sort by update date
    const sortedNotes = Object.entries(notes).sort((a, b) => {
        const dateA = new Date(a[1].updatedAt || a[1].createdAt || 0);
        const dateB = new Date(b[1].updatedAt || b[1].createdAt || 0);
        return dateB - dateA;
    });
    
    let markdownHTML = '';
    sortedNotes.forEach(([noteId, note]) => {
        const updatedDate = new Date(note.updatedAt || note.createdAt || Date.now());
        const dateStr = updatedDate.toLocaleDateString() + ' at ' + updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        markdownHTML += `
            <div class="note-title">${processMarkdown(note.title || 'Untitled Note')}</div>
            <div class="note-meta">Last updated: ${dateStr}</div>
            <div class="note-content">${processMarkdown(note.content || '')}</div>
            <hr style="margin: 25px 0; border: none; border-top: 2px dashed #e0e0e0;">
        `;
    });
    
    container.innerHTML = markdownHTML;
}

// Update notes count badge
function updateNotesCountBadge() {
    const count = Object.keys(notes).length;
    document.getElementById('notesCount').textContent = count;
}

// Update raw data preview (shared between dictionary and notes)
function updateRawPreview() {
    const container = document.getElementById('preview');
    const activeTab = document.querySelector('.tab-button.active')?.dataset.tab;
    
    if (activeTab === 'raw-data') {
        const allData = {
            tableId: currentTableId,
            tableName: document.getElementById('currentTableName').textContent,
            dictionary: window.dictionaryModule?.getDictionary() || {},
            notes: notes,
            metadata: {
                lastUpdated: new Date().toISOString(),
                counts: {
                    dictionary: Object.keys(window.dictionaryModule?.getDictionary() || {}).length,
                    notes: Object.keys(notes).length
                }
            }
        };
        
        container.textContent = JSON.stringify(allData, null, 2);
    }
}

// Export notes for current table
async function exportNotes() {
    if (!currentTableId) {
        showNotification('Please select a table first', 'error');
        return;
    }
    
    try {
        const data = await exportTableData(currentTableId);
        // Only export notes if that's what we want, or export everything
        const exportData = {
            notes: data.notes,
            metadata: {
                exportedAt: new Date().toISOString(),
                tableId: currentTableId,
                tableName: document.getElementById('currentTableName').textContent,
                exportType: 'notes'
            }
        };
        
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        const tableName = document.getElementById('currentTableName').textContent
            .replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.href = url;
        a.download = `${tableName}_notes_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Notes exported successfully');
    } catch (error) {
        console.error('Error exporting notes:', error);
        showNotification('Failed to export notes', 'error');
    }
}

// Clear all notes in current table
async function clearNotes() {
    if (!currentTableId) return;
    
    const noteCount = Object.keys(notes).length;
    if (noteCount === 0) {
        showNotification('No notes to clear', 'info');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ALL ${noteCount} notes in this table? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const deletePromises = Object.keys(notes).map(noteId => 
            deleteUserNote(currentTableId, noteId)
        );
        
        await Promise.all(deletePromises);
        showNotification(`Successfully deleted ${noteCount} notes`);
    } catch (error) {
        console.error('Error clearing notes:', error);
        showNotification('Failed to clear notes. Please try again.', 'error');
    }
}

// Handle notes import
async function handleNotesImport(event) {
    if (!currentTableId) {
        showNotification('Please select a table first', 'error');
        return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File too large. Maximum size is 5MB.', 'error');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // Validate import data structure
            if (!importData.notes && !importData.dictionary) {
                showNotification('Invalid import file: No notes data found', 'error');
                return;
            }
            
            // Determine import type
            const hasNotes = !!importData.notes;
            const hasDictionary = !!importData.dictionary;
            
            if (hasNotes && hasDictionary) {
                // Show import options modal
                showImportModal(importData, 'mixed');
            } else if (hasNotes) {
                // Import notes only
                await importNotesData(importData);
            } else {
                showNotification('File does not contain notes data', 'error');
            }
        } catch (error) {
            console.error('Error parsing import file:', error);
            showNotification('Invalid JSON file format', 'error');
        }
    };
    
    reader.onerror = () => {
        showNotification('Error reading file', 'error');
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Import notes data
async function importNotesData(importData) {
    if (!importData.notes) return;
    
    try {
        const result = await importTableData(currentTableId, { notes: importData.notes });
        showNotification(`Successfully imported ${result.importedNotes} notes`);
    } catch (error) {
        console.error('Error importing notes:', error);
        showNotification(`Import failed: ${error.message}`, 'error');
    }
}

// Show note delete confirmation
function showNoteDeleteConfirmation(noteId, noteTitle) {
    // Use the existing delete modal
    document.getElementById('deleteTopic').textContent = noteTitle;
    document.getElementById('deleteModal').dataset.type = 'note';
    document.getElementById('deleteModal').dataset.noteId = noteId;
    document.getElementById('deleteModal').style.display = 'flex';
}

// Global note delete confirmation handler
async function confirmNoteDeleteAction(noteId) {
    if (!currentTableId || !noteId) return;
    
    try {
        await deleteUserNote(currentTableId, noteId);
        showNotification('Note deleted');
        
        // If we were editing this note, cancel edit mode
        if (currentNoteId === noteId) {
            cancelNoteEdit();
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        showNotification('Delete failed', 'error');
    }
}

// Handle keyboard shortcuts for notes
function handleNoteKeyboardShortcuts(e) {
    // Only process if we're in notes context
    const noteTitleFocused = document.activeElement.id === 'noteTitle';
    const noteContentFocused = document.activeElement.id === 'noteContent';
    
    if (!noteTitleFocused && !noteContentFocused) return;
    
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!document.getElementById('updateNoteBtn').disabled) {
            document.getElementById('updateNoteBtn').click();
        } else if (!document.getElementById('addNoteBtn').disabled) {
            document.getElementById('addNoteBtn').click();
        }
    }
    
    // Escape to cancel edit
    if (e.key === 'Escape' && !document.getElementById('cancelNoteBtn').disabled) {
        document.getElementById('cancelNoteBtn').click();
    }
    
    // Tab in content field should insert 2 spaces (for markdown)
    if (noteContentFocused && e.key === 'Tab') {
        e.preventDefault();
        const textarea = document.getElementById('noteContent');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        // Insert 2 spaces at cursor
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        
        // Move cursor
        textarea.selectionStart = textarea.selectionEnd = start + 2;
    }
}

// Cleanup on logout or table change
function cleanupNotes() {
    if (unsubscribeNotes) {
        unsubscribeNotes();
        unsubscribeNotes = null;
    }
    
    notes = {};
    currentNoteId = null;
    currentTableId = null;
    noteSearchTerm = '';
    
    // Clear UI
    const container = document.getElementById('notesList');
    if (container) {
        container.innerHTML = '<div class="empty-state">Select a table to view notes</div>';
    }
    
    const preview = document.getElementById('notes-preview');
    if (preview) {
        preview.innerHTML = 'Select a table to preview notes';
    }
    
    document.getElementById('notesCount').textContent = '0';
}

// Helper function to show import modal
function showImportModal(importData, type = 'notes') {
    window.pendingImportData = importData;
    window.pendingImportType = type;
    document.getElementById('importModal').style.display = 'flex';
}