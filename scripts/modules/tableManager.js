// scripts/modules/tableManager.js
import { db } from './firebaseConfig.js';
import { getCurrentUser } from './auth.js';
import { showNotification } from './uiManager.js';

let tables = {};
let currentTableId = null;
let tableListener = null;

// Initialize table manager
export function initTableManager() {
    console.log('Initializing table manager...');
    
    const user = getCurrentUser();
    if (!user) {
        console.error('No user logged in');
        return null;
    }
    
    // Load tables
    loadUserTables(user.uid);
    
    // Set up table selection listener
    document.getElementById('currentTable').addEventListener('change', (e) => {
        const tableId = e.target.value;
        if (tableId) {
            selectTable(tableId);
        } else {
            clearTableSelection();
        }
    });
    
    return {
        createTable,
        renameTable,
        deleteTable,
        getTables: () => ({ ...tables }),
        getCurrentTableId: () => currentTableId
    };
}

// Load user tables
function loadUserTables(userId) {
    if (tableListener) {
        tableListener();
    }
    
    try {
        tableListener = db.collection('users').doc(userId).collection('tables')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                tables = {};
                const tableOptions = ['<option value="">-- Select a Table --</option>'];
                
                snapshot.forEach(doc => {
                    const tableData = doc.data();
                    tables[doc.id] = {
                        id: doc.id,
                        name: tableData.name,
                        entryCount: tableData.entryCount || 0,
                        noteCount: tableData.noteCount || 0,
                        createdAt: tableData.createdAt?.toDate() || new Date()
                    };
                    
                    tableOptions.push(
                        `<option value="${doc.id}">${tableData.name}</option>`
                    );
                });
                
                // Update dropdown
                const select = document.getElementById('currentTable');
                select.innerHTML = tableOptions.join('');
                
                // Select first table if none selected
                if (!currentTableId && snapshot.docs.length > 0) {
                    const firstTableId = snapshot.docs[0].id;
                    select.value = firstTableId;
                    selectTable(firstTableId);
                }
                
                updateTableStats();
                
            }, (error) => {
                console.error('Error loading tables:', error);
            });
    } catch (error) {
        console.error('Error setting up table listener:', error);
    }
}

// Select table
function selectTable(tableId) {
    const table = tables[tableId];
    if (!table) return;
    
    currentTableId = tableId;
    
    // Update UI
    document.querySelectorAll('.table-name').forEach(el => {
        el.textContent = table.name;
    });
    document.getElementById('previewTableName').textContent = table.name;
    
    // Update table action buttons
    document.getElementById('renameTableBtn').disabled = false;
    document.getElementById('deleteTableBtn').disabled = false;
    
    // Update stats
    updateTableStats();
    
    // Dispatch table changed event
    window.dispatchEvent(new CustomEvent('tableChanged', {
        detail: { tableId, tableName: table.name }
    }));
    
    console.log('Selected table:', table.name);
}

// Clear table selection
function clearTableSelection() {
    currentTableId = null;
    
    // Update UI
    document.querySelectorAll('.table-name').forEach(el => {
        el.textContent = 'No Table';
    });
    document.getElementById('previewTableName').textContent = 'No Table Selected';
    
    // Disable table action buttons
    document.getElementById('renameTableBtn').disabled = true;
    document.getElementById('deleteTableBtn').disabled = true;
    
    // Update stats
    document.getElementById('tableStats').textContent = 'No table selected';
    
    // Dispatch table changed event
    window.dispatchEvent(new CustomEvent('tableChanged', {
        detail: { tableId: null, tableName: null }
    }));
}

// Update table stats
function updateTableStats() {
    if (!currentTableId) {
        document.getElementById('tableStats').textContent = 'No table selected';
        return;
    }
    
    const table = tables[currentTableId];
    if (!table) return;
    
    const createdDate = table.createdAt.toLocaleDateString();
    document.getElementById('tableStats').textContent = 
        `${table.name} • ${table.entryCount || 0} entries • ${table.noteCount || 0} notes • Created: ${createdDate}`;
}

// Create table
export async function createTable(tableName) {
    const user = getCurrentUser();
    if (!user) throw new Error('Please sign in first');
    
    // Validate
    if (!tableName || tableName.trim().length < 2) {
        throw new Error('Table name must be at least 2 characters');
    }
    
    const trimmedName = tableName.trim();
    
    // Check for duplicates
    const duplicate = Object.values(tables).find(
        table => table.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (duplicate) {
        throw new Error(`Table "${trimmedName}" already exists`);
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
    
    const user = getCurrentUser();
    if (!user) throw new Error('Please sign in first');
    
    const trimmedName = newName.trim();
    
    if (trimmedName.length < 2) {
        throw new Error('Table name must be at least 2 characters');
    }
    
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

// Delete table
export async function deleteTable(tableId) {
    if (!tableId) {
        throw new Error('No table selected');
    }
    
    const user = getCurrentUser();
    if (!user) throw new Error('Please sign in first');
    
    const tableName = tables[tableId]?.name || 'Unknown Table';
    
    try {
        // Delete dictionary entries
        const dictEntries = await db.collection('users').doc(user.uid)
            .collection('tables').doc(tableId)
            .collection('dictionary').get();
        
        const dictDeletePromises = dictEntries.docs.map(doc => doc.ref.delete());
        
        // Delete notes
        const notes = await db.collection('users').doc(user.uid)
            .collection('tables').doc(tableId)
            .collection('notes').get();
        
        const noteDeletePromises = notes.docs.map(doc => doc.ref.delete());
        
        // Delete table document
        const tableDeletePromise = db.collection('users').doc(user.uid)
            .collection('tables').doc(tableId).delete();
        
        // Execute all deletions
        await Promise.all([...dictDeletePromises, ...noteDeletePromises, tableDeletePromise]);
        
        showNotification(`Table "${tableName}" deleted successfully`);
        
        // Clear selection
        clearTableSelection();
        
    } catch (error) {
        console.error('Error deleting table:', error);
        throw new Error(`Failed to delete table: ${error.message}`);
    }
}