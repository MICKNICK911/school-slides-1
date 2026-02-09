// scripts/modules/dataManager.js
import { showNotification } from './utils.js';

// Data storage using localStorage
const STORAGE_PREFIX = 'multi_table_builder_';

// Helper functions for localStorage
function getStorageKey(tableId, subcollection = '') {
    if (subcollection) {
        return `${STORAGE_PREFIX}${tableId}_${subcollection}`;
    }
    return `${STORAGE_PREFIX}${tableId}`;
}

// Tables storage
const TABLES_STORAGE_KEY = `${STORAGE_PREFIX}tables`;

// Dictionary Operations
export async function saveDictionaryEntry(tableId, topic, data) {
    try {
        const storageKey = getStorageKey(tableId, 'dictionary');
        
        // Load existing dictionary
        const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        // Check if this is an update or new entry
        const isUpdate = existingData.hasOwnProperty(topic);
        
        // Update the entry
        existingData[topic] = {
            ...data,
            updatedAt: new Date().toISOString(),
            createdAt: isUpdate ? existingData[topic].createdAt : new Date().toISOString()
        };
        
        // Save back to localStorage
        localStorage.setItem(storageKey, JSON.stringify(existingData));
        
        // Update table counters
        if (!isUpdate) {
            await updateTableCounters(tableId, 1, 0);
        }
        
        return true;
    } catch (error) {
        console.error('Save error:', error);
        throw error;
    }
}

export async function deleteDictionaryEntry(tableId, topic) {
    try {
        const storageKey = getStorageKey(tableId, 'dictionary');
        
        const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        if (existingData.hasOwnProperty(topic)) {
            delete existingData[topic];
            localStorage.setItem(storageKey, JSON.stringify(existingData));
            await updateTableCounters(tableId, -1, 0);
        }
        
        return true;
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
}

export function loadDictionaryEntries(tableId, callback) {
    if (!tableId) {
        callback({});
        return () => {}; // Return empty unsubscribe function
    }
    
    const storageKey = getStorageKey(tableId, 'dictionary');
    
    // Load data immediately
    const loadData = () => {
        try {
            const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
            callback(data);
        } catch (error) {
            console.error('Load error:', error);
            callback({});
        }
    };
    
    // Load initial data
    loadData();
    
    // Simulate real-time updates by checking localStorage periodically
    const intervalId = setInterval(loadData, 1000);
    
    // Return unsubscribe function
    return () => clearInterval(intervalId);
}

// Notes Operations
export async function saveUserNote(tableId, noteId, title, content) {
    try {
        const storageKey = getStorageKey(tableId, 'notes');
        
        // Load existing notes
        const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        // Check if this is an update or new note
        const isUpdate = existingData.hasOwnProperty(noteId);
        
        // Update the note
        existingData[noteId] = {
            title,
            content,
            updatedAt: new Date().toISOString(),
            createdAt: isUpdate ? existingData[noteId].createdAt : new Date().toISOString()
        };
        
        // Save back to localStorage
        localStorage.setItem(storageKey, JSON.stringify(existingData));
        
        // Update table counters
        if (!isUpdate) {
            await updateTableCounters(tableId, 0, 1);
        }
        
        return true;
    } catch (error) {
        console.error('Save note error:', error);
        throw error;
    }
}

export async function deleteUserNote(tableId, noteId) {
    try {
        const storageKey = getStorageKey(tableId, 'notes');
        
        const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        if (existingData.hasOwnProperty(noteId)) {
            delete existingData[noteId];
            localStorage.setItem(storageKey, JSON.stringify(existingData));
            await updateTableCounters(tableId, 0, -1);
        }
        
        return true;
    } catch (error) {
        console.error('Delete note error:', error);
        throw error;
    }
}

export function loadUserNotes(tableId, callback) {
    if (!tableId) {
        callback({});
        return () => {}; // Return empty unsubscribe function
    }
    
    const storageKey = getStorageKey(tableId, 'notes');
    
    // Load data immediately
    const loadData = () => {
        try {
            const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
            
            // Sort notes by updatedAt
            const sortedEntries = Object.entries(data).sort((a, b) => {
                const dateA = new Date(a[1].updatedAt || a[1].createdAt || 0);
                const dateB = new Date(b[1].updatedAt || b[1].createdAt || 0);
                return dateB - dateA; // Newest first
            });
            
            // Convert back to object
            const sortedData = {};
            sortedEntries.forEach(([key, value]) => {
                sortedData[key] = value;
            });
            
            callback(sortedData);
        } catch (error) {
            console.error('Load notes error:', error);
            callback({});
        }
    };
    
    // Load initial data
    loadData();
    
    // Simulate real-time updates
    const intervalId = setInterval(loadData, 1000);
    
    // Return unsubscribe function
    return () => clearInterval(intervalId);
}

// Update table counters
async function updateTableCounters(tableId, dictDelta = 0, notesDelta = 0) {
    if (!tableId) return;
    
    try {
        // Load tables
        const tables = JSON.parse(localStorage.getItem(TABLES_STORAGE_KEY) || '{}');
        
        if (tables[tableId]) {
            // Update counters
            tables[tableId].entryCount = (tables[tableId].entryCount || 0) + dictDelta;
            tables[tableId].noteCount = (tables[tableId].noteCount || 0) + notesDelta;
            tables[tableId].updatedAt = new Date().toISOString();
            
            // Save back
            localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(tables));
            
            // Trigger table update event
            window.dispatchEvent(new CustomEvent('tablesUpdated'));
        }
    } catch (error) {
        console.error('Error updating table counters:', error);
    }
}

// Export/Import operations
export async function exportTableData(tableId) {
    if (!tableId) throw new Error('No table selected');
    
    try {
        const dictKey = getStorageKey(tableId, 'dictionary');
        const notesKey = getStorageKey(tableId, 'notes');
        
        const dictionary = JSON.parse(localStorage.getItem(dictKey) || '{}');
        const notes = JSON.parse(localStorage.getItem(notesKey) || '{}');
        
        const data = {
            dictionary,
            notes,
            metadata: {
                exportedAt: new Date().toISOString(),
                tableId: tableId,
                version: '1.0'
            }
        };
        
        return data;
    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
}

// Import data into table
export async function importTableData(tableId, importData) {
    if (!tableId) throw new Error('No table selected');
    
    try {
        const dictKey = getStorageKey(tableId, 'dictionary');
        const notesKey = getStorageKey(tableId, 'notes');
        
        let newEntries = 0;
        let newNotes = 0;
        
        // Import dictionary entries
        if (importData.dictionary) {
            const existingDict = JSON.parse(localStorage.getItem(dictKey) || '{}');
            Object.entries(importData.dictionary).forEach(([topic, entryData]) => {
                if (!existingDict[topic]) newEntries++;
                existingDict[topic] = {
                    ...entryData,
                    updatedAt: new Date().toISOString(),
                    createdAt: entryData.createdAt || new Date().toISOString()
                };
            });
            localStorage.setItem(dictKey, JSON.stringify(existingDict));
        }
        
        // Import notes
        if (importData.notes) {
            const existingNotes = JSON.parse(localStorage.getItem(notesKey) || '{}');
            Object.entries(importData.notes).forEach(([noteId, noteData]) => {
                if (!existingNotes[noteId]) newNotes++;
                existingNotes[noteId] = {
                    ...noteData,
                    updatedAt: new Date().toISOString(),
                    createdAt: noteData.createdAt || new Date().toISOString()
                };
            });
            localStorage.setItem(notesKey, JSON.stringify(existingNotes));
        }
        
        // Update table counters
        if (newEntries > 0 || newNotes > 0) {
            await updateTableCounters(tableId, newEntries, newNotes);
        }
        
        return { importedEntries: newEntries, importedNotes: newNotes };
    } catch (error) {
        console.error('Import error:', error);
        throw error;
    }
}

// Table management functions
export function loadTables(callback) {
    const loadData = () => {
        try {
            const tables = JSON.parse(localStorage.getItem(TABLES_STORAGE_KEY) || '{}');
            callback(tables);
        } catch (error) {
            console.error('Load tables error:', error);
            callback({});
        }
    };
    
    // Load initial data
    loadData();
    
    // Listen for storage events
    const handleStorageChange = (e) => {
        if (e.key === TABLES_STORAGE_KEY) {
            loadData();
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Return unsubscribe function
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
}

export async function saveTable(tableId, tableData) {
    try {
        const tables = JSON.parse(localStorage.getItem(TABLES_STORAGE_KEY) || '{}');
        tables[tableId] = {
            ...tableData,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(tables));
        return tableId;
    } catch (error) {
        console.error('Save table error:', error);
        throw error;
    }
}

export async function deleteTableData(tableId) {
    try {
        // Delete table data
        const tables = JSON.parse(localStorage.getItem(TABLES_STORAGE_KEY) || '{}');
        if (tables[tableId]) {
            delete tables[tableId];
            localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(tables));
        }
        
        // Delete dictionary entries
        localStorage.removeItem(getStorageKey(tableId, 'dictionary'));
        
        // Delete notes
        localStorage.removeItem(getStorageKey(tableId, 'notes'));
        
        return true;
    } catch (error) {
        console.error('Delete table error:', error);
        throw error;
    }
}

// Initialize with sample data if empty
export function initializeSampleData() {
    const tables = JSON.parse(localStorage.getItem(TABLES_STORAGE_KEY) || '{}');
    
    if (Object.keys(tables).length === 0) {
        // Create a sample table
        const sampleTableId = 'sample_table_1';
        const sampleTable = {
            name: 'Sample Vocabulary',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            entryCount: 3,
            noteCount: 1
        };
        
        tables[sampleTableId] = sampleTable;
        localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(tables));
        
        // Add sample dictionary entries
        const sampleDict = {
            'JavaScript': {
                desc: 'A programming language for web development',
                ex: ['console.log("Hello World")', 'function add(a, b) { return a + b; }'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            'API': {
                desc: 'Application Programming Interface',
                ex: ['REST API', 'GraphQL API', 'Fetching data from server'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            'LocalStorage': {
                desc: 'Web storage API for storing data locally in browser',
                ex: ['localStorage.setItem("key", "value")', 'localStorage.getItem("key")'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };
        
        localStorage.setItem(getStorageKey(sampleTableId, 'dictionary'), JSON.stringify(sampleDict));
        
        // Add sample note
        const sampleNotes = {
            'welcome_note': {
                title: 'Welcome to Multi-Table Builder',
                content: 'This is a sample note. You can:\n* Add your own tables\n* Create dictionary entries\n* Write notes with markdown\n* Export and import data\n\nAll data is stored locally in your browser.',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };
        
        localStorage.setItem(getStorageKey(sampleTableId, 'notes'), JSON.stringify(sampleNotes));
        
        console.log('Sample data initialized');
        return sampleTableId;
    }
    
    return null;
}

// Clear all data (for debugging/reset)
export function clearAllData() {
    // Clear all localStorage items with our prefix
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    showNotification('All local data cleared', 'info');
}