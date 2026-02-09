import { db } from './firebaseConfig.js';
import { getCurrentUser } from './auth.js';
import { showNotification } from './utils.js';

let currentTableId = null;
let currentTableName = '';
let tables = {};
let tableListener = null;

// Initialize table management
export function initTableManager(onTableChanged) {
    setupTableEventListeners();
    loadUserTables(onTableChanged);
    return {
        getCurrentTableId: () => currentTableId,
        getCurrentTableName: () => currentTableName,
        getTables: () => tables
    };
}

// Load all tables for current user
function loadUserTables(onTableChanged) {
    const user = getCurrentUser();
    if (!user) return;

    // Unsubscribe from previous listener
    if (tableListener) tableListener();

    // Listen for real-time updates to user's tables
    tableListener = db.collection('users').doc(user.uid).collection('tables')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            tables = {};
            const tableOptions = ['<option value="">-- Select a Table --</option>'];
            
            snapshot.forEach(doc => {
                const tableData = doc.data();
                tables[doc.id] = {
                    id: doc.id,
                    name: tableData.name,
                    createdAt: tableData.createdAt?.toDate() || new Date(),
                    updatedAt: tableData.updatedAt?.toDate() || new Date(),
                    entryCount: tableData.entryCount || 0,
                    noteCount: tableData.noteCount || 0
                };
                
                const isSelected = doc.id === currentTableId;
                tableOptions.push(
                    `<option value="${doc.id}" ${isSelected ? 'selected' : ''}>${tableData.name}</option>`
                );
            });
            
            updateTableDropdown(tableOptions);
            
            // If current table was deleted, clear selection
            if (currentTableId && !tables[currentTableId]) {
                clearTableSelection();
                onTableChanged(null, null);
            }
            
            updateTableStats();
        }, (error) => {
            console.error('Error loading tables:', error);
            showNotification('Failed to load tables', 'error');
        });
}

// Create new table
export async function createTable(tableName) {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // Validate table name
    if (!tableName || tableName.trim().length < 2) {
        throw new Error('Table name must be at least 2 characters');
    }
    
    if (tableName.length > 50) {
        throw new Error('Table name must be less than 50 characters');
    }
    
    // Check for duplicate table names (case-insensitive)
    const tableNameLower = tableName.toLowerCase();
    const duplicate = Object.values(tables).find(
        table => table.name.toLowerCase() === tableNameLower
    );
    
    if (duplicate) {
        throw new Error(`Table "${duplicate.name}" already exists`);
    }
    
    try {
        const tableRef = db.collection('users').doc(user.uid).collection('tables').doc();
        
        await tableRef.set({
            name: tableName.trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
            entryCount: 0,
            noteCount: 0
        });
        
        showNotification(`Table "${tableName}" created successfully`);
        return tableRef.id;
    } catch (error) {
        console.error('Error creating table:', error);
        throw new Error(`Failed to create table: ${error.message}`);
    }
}

// Rename table
export async function renameTable(tableId, newName) {
    if (!tableId || !newName) throw new Error('Invalid parameters');
    
    // Validate new name
    if (newName.trim().length < 2) {
        throw new Error('Table name must be at least 2 characters');
    }
    
    if (newName.length > 50) {
        throw new Error('Table name must be less than 50 characters');
    }
    
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    try {
        await db.collection('users').doc(user.uid).collection('tables').doc(tableId).update({
            name: newName.trim(),
            updatedAt: new Date()
        });
        
        showNotification(`Table renamed to "${newName}"`);
    } catch (error) {
        console.error('Error renaming table:', error);
        throw new Error(`Failed to rename table: ${error.message}`);
    }
}

// Delete table and all its contents
export async function deleteTable(tableId) {
    if (!tableId) throw new Error('No table selected');
    
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
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
export function selectTable(tableId) {
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
    document.getElementById('currentTable').value = tableId;
    document.getElementById('currentTableName').textContent = table.name;
    document.getElementById('currentTableNameNotes').textContent = table.name;
    document.getElementById('previewTableName').textContent = table.name;
    
    // Enable form controls
    enableTableControls(true);
    
    updateTableStats();
    
    return table;
}

// Clear table selection
function clearTableSelection() {
    currentTableId = null;
    currentTableName = '';
    
    // Update UI
    document.getElementById('currentTable').value = '';
    document.getElementById('currentTableName').textContent = 'No Table';
    document.getElementById('currentTableNameNotes').textContent = 'No Table';
    document.getElementById('previewTableName').textContent = 'No Table Selected';
    
    // Disable form controls
    enableTableControls(false);
    
    updateTableStats();
}

// Update table dropdown
function updateTableDropdown(options) {
    const select = document.getElementById('currentTable');
    select.innerHTML = options.join('');
    
    // Enable/disable table action buttons
    const hasTables = Object.keys(tables).length > 0;
    document.getElementById('renameTableBtn').disabled = !hasTables || !currentTableId;
    document.getElementById('deleteTableBtn').disabled = !hasTables || !currentTableId;
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
                element.placeholder = enabled ? 
                    (id === 'topic' ? 'Enter topic...' : 
                     id === 'noteTitle' ? 'Enter note title...' : '') : 
                    'Select or create a table first';
            }
        }
    });
    
    // Update select placeholder
    const editSelect = document.getElementById('editId');
    const noteSelect = document.getElementById('noteId');
    
    if (enabled) {
        editSelect.innerHTML = '<option value="">-- Create New Entry --</option>';
        noteSelect.innerHTML = '<option value="">-- Create New Note --</option>';
    } else {
        editSelect.innerHTML = '<option value="">-- Select a Table First --</option>';
        noteSelect.innerHTML = '<option value="">-- Select a Table First --</option>';
    }
}

// Update table statistics display
function updateTableStats() {
    const statsElement = document.getElementById('tableStats');
    
    if (!currentTableId) {
        statsElement.textContent = `No table selected (${Object.keys(tables).length} tables total)`;
        return;
    }
    
    const table = tables[currentTableId];
    if (!table) {
        statsElement.textContent = 'Table not found';
        return;
    }
    
    statsElement.textContent = 
        `${table.name} • ${table.entryCount || 0} entries • ${table.noteCount || 0} notes • ` +
        `Created: ${table.createdAt.toLocaleDateString()}`;
}

// Setup event listeners for table interactions
function setupTableEventListeners() {
    // Table selection
    document.getElementById('currentTable').addEventListener('change', (e) => {
        const tableId = e.target.value;
        if (tableId) {
            selectTable(tableId);
            
            // Notify other modules
            window.dispatchEvent(new CustomEvent('tableChanged', {
                detail: { tableId, tableName: currentTableName }
            }));
        } else {
            clearTableSelection();
            window.dispatchEvent(new CustomEvent('tableChanged', {
                detail: { tableId: null, tableName: null }
            }));
        }
    });
    
    // New table button
    document.getElementById('newTableBtn').addEventListener('click', showCreateTableModal);
    
    // Rename table button
    document.getElementById('renameTableBtn').addEventListener('click', () => {
        if (currentTableId) {
            showRenameTableModal(currentTableId, currentTableName);
        }
    });
    
    // Delete table button
    document.getElementById('deleteTableBtn').addEventListener('click', () => {
        if (currentTableId) {
            showDeleteTableConfirmation(currentTableId, currentTableName);
        }
    });
    
    // Table modal events
    document.getElementById('cancelTableBtn').addEventListener('click', hideTableModal);
    document.getElementById('confirmTableBtn').addEventListener('click', handleTableAction);
    
    // Table delete confirmation events
    document.getElementById('cancelTableDelete').addEventListener('click', hideDeleteTableModal);
    document.getElementById('confirmTableDelete').addEventListener('click', confirmTableDelete);
}

// Show create table modal
function showCreateTableModal() {
    document.getElementById('tableModalTitle').textContent = 'Create New Table';
    document.getElementById('tableName').value = '';
    document.getElementById('tableNameError').textContent = '';
    document.getElementById('confirmTableBtn').textContent = 'Create Table';
    document.getElementById('confirmTableBtn').dataset.action = 'create';
    
    document.getElementById('tableModal').style.display = 'flex';
    document.getElementById('tableName').focus();
}

// Show rename table modal
function showRenameTableModal(tableId, currentName) {
    document.getElementById('tableModalTitle').textContent = 'Rename Table';
    document.getElementById('tableName').value = currentName;
    document.getElementById('tableNameError').textContent = '';
    document.getElementById('confirmTableBtn').textContent = 'Rename Table';
    document.getElementById('confirmTableBtn').dataset.action = 'rename';
    document.getElementById('confirmTableBtn').dataset.tableId = tableId;
    
    document.getElementById('tableModal').style.display = 'flex';
    document.getElementById('tableName').focus();
    document.getElementById('tableName').select();
}

// Show delete table confirmation
function showDeleteTableConfirmation(tableId, tableName) {
    document.getElementById('deleteTableName').textContent = tableName;
    document.getElementById('confirmTableDeleteModal').style.display = 'flex';
}

// Handle table action (create or rename)
async function handleTableAction() {
    const action = this.dataset.action;
    const tableName = document.getElementById('tableName').value.trim();
    const errorElement = document.getElementById('tableNameError');
    
    errorElement.textContent = '';
    
    try {
        if (action === 'create') {
            await createTable(tableName);
        } else if (action === 'rename') {
            const tableId = this.dataset.tableId;
            await renameTable(tableId, tableName);
        }
        
        hideTableModal();
    } catch (error) {
        errorElement.textContent = error.message;
    }
}

// Confirm table deletion
async function confirmTableDelete() {
    const tableId = currentTableId;
    if (!tableId) return;
    
    try {
        await deleteTable(tableId);
        hideDeleteTableModal();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Hide modals
function hideTableModal() {
    document.getElementById('tableModal').style.display = 'none';
}

function hideDeleteTableModal() {
    document.getElementById('confirmTableDeleteModal').style.display = 'none';
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