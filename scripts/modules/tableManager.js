// scripts/modules/tableManager.js
import { db } from './firebaseConfig.js';
import { getCurrentUser } from './auth.js';
import { showNotification } from './utils.js';
import { showModal, hideModal } from './uiManager.js';

let currentTableId = null;
let currentTableName = '';
let tables = {};
let tableListener = null;

// Initialize table management
export function initTableManager() {
    const user = getCurrentUser();
    if (!user) {
        console.error('No user logged in');
        return null;
    }
    
    setupTableEventListeners();
    loadUserTables();
    
    const manager = {
        getCurrentTableId: () => currentTableId,
        getCurrentTableName: () => currentTableName,
        getTables: () => ({ ...tables }),
        createTable,
        renameTable,
        deleteTable,
        cleanup: cleanupTableManager
    };
    
    // Store reference globally for other modules
    window.tableManager = manager;
    
    return manager;
}

// Load all tables for current user
function loadUserTables() {
    const user = getCurrentUser();
    if (!user) {
        console.error('No user logged in for table loading');
        return;
    }

    // Unsubscribe from previous listener
    if (tableListener) {
        tableListener();
        tableListener = null;
    }

    // Listen for real-time updates to user's tables
    try {
        tableListener = db.collection('users').doc(user.uid).collection('tables')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                tables = {};
                const tableOptions = ['<option value="">-- Select a Table --</option>'];
                
                snapshot.forEach(doc => {
                    const tableData = doc.data();
                    tables[doc.id] = {
                        id: doc.id,
                        name: tableData.name || 'Unnamed Table',
                        createdAt: tableData.createdAt?.toDate() || new Date(),
                        updatedAt: tableData.updatedAt?.toDate() || new Date(),
                        entryCount: tableData.entryCount || 0,
                        noteCount: tableData.noteCount || 0
                    };
                    
                    const isSelected = doc.id === currentTableId;
                    tableOptions.push(
                        `<option value="${doc.id}" ${isSelected ? 'selected' : ''}>${tableData.name || 'Unnamed Table'}</option>`
                    );
                });
                
                updateTableDropdown(tableOptions);
                
                // If current table was deleted, clear selection
                if (currentTableId && !tables[currentTableId]) {
                    clearTableSelection();
                    dispatchTableChanged(null, null);
                }
                
                updateTableStats();
                
            }, (error) => {
                console.error('Error loading tables:', error);
                showNotification('Failed to load tables', 'error');
            });
    } catch (error) {
        console.error('Error setting up table listener:', error);
        showNotification('Failed to load tables', 'error');
    }
}

// Create new table
export async function createTable(tableName) {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    // Validate table name
    if (!tableName || tableName.trim().length < 2) {
        throw new Error('Table name must be at least 2 characters');
    }
    
    if (tableName.length > 50) {
        throw new Error('Table name must be less than 50 characters');
    }
    
    const trimmedName = tableName.trim();
    
    // Check for duplicate table names (case-insensitive)
    const tableNameLower = trimmedName.toLowerCase();
    const duplicate = Object.values(tables).find(
        table => table.name.toLowerCase() === tableNameLower
    );
    
    if (duplicate) {
        throw new Error(`Table "${duplicate.name}" already exists`);
    }
    
    try {
        const tableRef = db.collection('users').doc(user.uid).collection('tables').doc();
        
        await tableRef.set({
            name: trimmedName,
            createdAt: new Date(),
            updatedAt: new Date(),
            entryCount: 0,
            noteCount: 0
        });
        
        showNotification(`Table "${trimmedName}" created successfully`);
        return tableRef.id;
    } catch (error) {
        console.error('Error creating table:', error);
        throw new Error(`Failed to create table: ${error.message}`);
    }
}

// Rename table
export async function renameTable(tableId, newName) {
    if (!tableId || !newName) {
        throw new Error('Invalid parameters');
    }
    
    // Validate new name
    if (newName.trim().length < 2) {
        throw new Error('Table name must be at least 2 characters');
    }
    
    if (newName.length > 50) {
        throw new Error('Table name must be less than 50 characters');
    }
    
    const user = getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    const trimmedName = newName.trim();
    
    try {
        await db.collection('users').doc(user.uid).collection('tables').doc(tableId).update({
            name: trimmedName,
            updatedAt: new Date()
        });
        
        showNotification(`Table renamed to "${trimmedName}"`);
    } catch (error) {
        console.error('Error renaming table:', error);
        throw new Error(`Failed to rename table: ${error.message}`);
    }
}

// Delete table and all its contents
export async function deleteTable(tableId) {
    if (!tableId) {
        throw new Error('No table selected');
    }
    
    const user = getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    const tableName = tables[tableId]?.name || 'Unknown Table';
    
    try {
        // Start a batch write for atomic deletion
        const batch = db.batch();
        const tableRef = db.collection('users').doc(user.uid).collection('tables').doc(tableId);
        
        // Delete all dictionary entries in this table
        const dictEntries = await tableRef.collection('dictionary').get();
        dictEntries.docs.forEach(doc => batch.delete(doc.ref));
        
        // Delete all notes in this table
        const notes = await tableRef.collection('notes').get();
        notes.docs.forEach(doc => batch.delete(doc.ref));
        
        // Delete the table document itself
        batch.delete(tableRef);
        
        await batch.commit();
        
        showNotification(`Table "${tableName}" deleted successfully`);
        return true;
    } catch (error) {
        console.error('Error deleting table:', error);
        throw new Error(`Failed to delete table: ${error.message}`);
    }
}

// Select a table
function selectTable(tableId) {
    if (!tableId) {
        clearTableSelection();
        return null;
    }
    
    const table = tables[tableId];
    if (!table) {
        showNotification('Table not found', 'error');
        return null;
    }
    
    currentTableId = tableId;
    currentTableName = table.name;
    
    // Update UI
    const tableSelect = document.getElementById('currentTable');
    if (tableSelect) tableSelect.value = tableId;
    
    document.getElementById('currentTableName').textContent = table.name;
    document.getElementById('currentTableNameNotes').textContent = table.name;
    document.getElementById('previewTableName').textContent = table.name;
    
    // Enable form controls
    enableTableControls(true);
    
    updateTableStats();
    
    // Dispatch table changed event
    dispatchTableChanged(tableId, table.name);
    
    return table;
}

// Clear table selection
function clearTableSelection() {
    currentTableId = null;
    currentTableName = '';
    
    // Update UI
    const tableSelect = document.getElementById('currentTable');
    if (tableSelect) tableSelect.value = '';
    
    document.getElementById('currentTableName').textContent = 'No Table';
    document.getElementById('currentTableNameNotes').textContent = 'No Table';
    document.getElementById('previewTableName').textContent = 'No Table Selected';
    
    // Disable form controls
    enableTableControls(false);
    
    updateTableStats();
    
    // Dispatch table changed event
    dispatchTableChanged(null, null);
}

// Update table dropdown
function updateTableDropdown(options) {
    const select = document.getElementById('currentTable');
    if (select) {
        select.innerHTML = options.join('');
        
        // Enable/disable table action buttons
        const hasTables = Object.keys(tables).length > 0;
        const renameBtn = document.getElementById('renameTableBtn');
        const deleteBtn = document.getElementById('deleteTableBtn');
        
        if (renameBtn) renameBtn.disabled = !hasTables || !currentTableId;
        if (deleteBtn) deleteBtn.disabled = !hasTables || !currentTableId;
    }
}

// Enable/disable form controls based on table selection
function enableTableControls(enabled) {
    const controls = [
        'editId', 'topic', 'desc', 'ex', 'addBtn', 'updateBtn', 'cancelBtn',
        'noteId', 'noteTitle', 'noteContent', 'addNoteBtn', 'updateNoteBtn', 'cancelNoteBtn',
        'importDictBtn', 'exportDictBtn', 'clearDictBtn', 'importDictFile',
        'importNotesBtn', 'exportNotesBtn', 'clearNotesBtn', 'importNotesFile',
        'searchDictInput', 'searchNotesInput'
    ];
    
    controls.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.disabled = !enabled;
            
            // Update placeholders for inputs
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (!enabled) {
                    element.placeholder = 'Select or create a table first';
                }
            }
        }
    });
    
    // Update select placeholders
    const editSelect = document.getElementById('editId');
    const noteSelect = document.getElementById('noteId');
    
    if (editSelect) {
        editSelect.innerHTML = enabled ? 
            '<option value="">-- Create New Entry --</option>' : 
            '<option value="">-- Select a Table First --</option>';
    }
    
    if (noteSelect) {
        noteSelect.innerHTML = enabled ? 
            '<option value="">-- Create New Note --</option>' : 
            '<option value="">-- Select a Table First --</option>';
    }
}

// Update table statistics display
function updateTableStats() {
    const statsElement = document.getElementById('tableStats');
    if (!statsElement) return;
    
    if (!currentTableId) {
        statsElement.textContent = `No table selected (${Object.keys(tables).length} tables total)`;
        return;
    }
    
    const table = tables[currentTableId];
    if (!table) {
        statsElement.textContent = 'Table not found';
        return;
    }
    
    const createdDate = table.createdAt.toLocaleDateString();
    statsElement.textContent = 
        `${table.name} • ${table.entryCount || 0} entries • ${table.noteCount || 0} notes • ` +
        `Created: ${createdDate}`;
}

// Dispatch table changed event
function dispatchTableChanged(tableId, tableName) {
    window.dispatchEvent(new CustomEvent('tableChanged', {
        detail: { tableId, tableName }
    }));
}

// Setup event listeners for table interactions
function setupTableEventListeners() {
    // Table selection
    const tableSelect = document.getElementById('currentTable');
    if (tableSelect) {
        tableSelect.addEventListener('change', (e) => {
            const tableId = e.target.value;
            if (tableId) {
                selectTable(tableId);
            } else {
                clearTableSelection();
            }
        });
    }
    
    // New table button
    const newTableBtn = document.getElementById('newTableBtn');
    if (newTableBtn) {
        newTableBtn.addEventListener('click', () => {
            showModal('tableModal', {
                title: 'Create New Table',
                actionText: 'Create Table'
            });
        });
    }
    
    // Rename table button
    const renameTableBtn = document.getElementById('renameTableBtn');
    if (renameTableBtn) {
        renameTableBtn.addEventListener('click', () => {
            if (currentTableId) {
                showModal('tableModal', {
                    title: 'Rename Table',
                    actionText: 'Rename Table'
                });
                
                // Set current name in input
                const tableNameInput = document.getElementById('tableName');
                if (tableNameInput) {
                    tableNameInput.value = currentTableName;
                    
                    // Set action and tableId on confirm button
                    const confirmBtn = document.getElementById('confirmTableBtn');
                    if (confirmBtn) {
                        confirmBtn.dataset.action = 'rename';
                        confirmBtn.dataset.tableId = currentTableId;
                    }
                }
            }
        });
    }
    
    // Delete table button
    const deleteTableBtn = document.getElementById('deleteTableBtn');
    if (deleteTableBtn) {
        deleteTableBtn.addEventListener('click', () => {
            if (currentTableId) {
                const deleteTableNameEl = document.getElementById('deleteTableName');
                if (deleteTableNameEl) {
                    deleteTableNameEl.textContent = currentTableName;
                }
                showModal('confirmTableDeleteModal');
            }
        });
    }
    
    // Table modal events
    const cancelTableBtn = document.getElementById('cancelTableBtn');
    const confirmTableBtn = document.getElementById('confirmTableBtn');
    
    if (cancelTableBtn) {
        cancelTableBtn.addEventListener('click', () => hideModal('tableModal'));
    }
    
    if (confirmTableBtn) {
        confirmTableBtn.addEventListener('click', handleTableAction);
    }
    
    // Table delete confirmation events
    const cancelTableDelete = document.getElementById('cancelTableDelete');
    const confirmTableDelete = document.getElementById('confirmTableDelete');
    
    if (cancelTableDelete) {
        cancelTableDelete.addEventListener('click', () => hideModal('confirmTableDeleteModal'));
    }
    
    if (confirmTableDelete) {
        confirmTableDelete.addEventListener('click', confirmTableDeleteAction);
    }
}

// Handle table action (create or rename)
async function handleTableAction() {
    const action = this.dataset.action;
    const tableNameInput = document.getElementById('tableName');
    const errorElement = document.getElementById('tableNameError');
    
    if (!tableNameInput) return;
    
    const tableName = tableNameInput.value.trim();
    
    if (errorElement) errorElement.textContent = '';
    
    try {
        if (action === 'create') {
            await createTable(tableName);
        } else if (action === 'rename') {
            const tableId = this.dataset.tableId;
            await renameTable(tableId, tableName);
        }
        
        hideModal('tableModal');
        
        // Clear the input
        tableNameInput.value = '';
        
    } catch (error) {
        if (errorElement) {
            errorElement.textContent = error.message;
        }
    }
}

// Confirm table deletion
async function confirmTableDeleteAction() {
    if (!currentTableId) return;
    
    try {
        await deleteTable(currentTableId);
        hideModal('confirmTableDeleteModal');
        
        // Clear selection
        clearTableSelection();
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Cleanup on logout
export function cleanupTableManager() {
    if (tableListener) {
        tableListener();
        tableListener = null;
    }
    
    currentTableId = null;
    currentTableName = '';
    tables = {};
    
    clearTableSelection();
}

// Initialize on load
console.log('Table manager module loaded');