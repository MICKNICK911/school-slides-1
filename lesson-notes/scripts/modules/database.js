import { db } from './firebaseConfig.js';
import { getCurrentUser } from './auth.js';

// Get reference to current table
function getCurrentTableRef(tableId, subcollection = '') {
    const user = getCurrentUser();
    if (!user) throw new Error('No user logged in');
    if (!tableId) throw new Error('No table selected');
    
    const baseRef = db.collection('users').doc(user.uid).collection('tables').doc(tableId);
    return subcollection ? baseRef.collection(subcollection) : baseRef;
}

// Update table counters
async function updateTableCounters(tableId, dictDelta = 0, notesDelta = 0) {
    if (!tableId) return;
    
    try {
        const tableRef = getCurrentTableRef(tableId);
        const updates = {};
        
        if (dictDelta !== 0) {
            updates.entryCount = db.FieldValue.increment(dictDelta);
        }
        
        if (notesDelta !== 0) {
            updates.noteCount = db.FieldValue.increment(notesDelta);
        }
        
        updates.updatedAt = new Date();
        
        await tableRef.update(updates);
    } catch (error) {
        console.error('Error updating table counters:', error);
    }
}

// Dictionary Operations (now table-specific)
export async function saveDictionaryEntry(tableId, topic, data) {
    try {
        const entryRef = getCurrentTableRef(tableId, 'dictionary').doc(topic);
        
        // Check if this is an update or new entry
        const existing = await entryRef.get();
        const isUpdate = existing.exists;
        
        await entryRef.set({
            ...data,
            updatedAt: new Date(),
            createdAt: isUpdate ? existing.data().createdAt : new Date()
        });
        
        // Update table counter if new entry
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
        const entryRef = getCurrentTableRef(tableId, 'dictionary').doc(topic);
        const doc = await entryRef.get();
        
        if (doc.exists) {
            await entryRef.delete();
            await updateTableCounters(tableId, -1, 0);
        }
        
        return true;
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
}

export function loadDictionaryEntries(tableId, callback) {
    if (!tableId) return () => {};
    
    const entriesRef = getCurrentTableRef(tableId, 'dictionary');
    
    const unsubscribe = entriesRef.onSnapshot((snapshot) => {
        const entries = {};
        snapshot.forEach(doc => {
            entries[doc.id] = doc.data();
        });
        callback(entries);
    }, (error) => {
        console.error('Error loading dictionary:', error);
        callback({});
    });
    
    return unsubscribe;
}

// Notes Operations (now table-specific)
export async function saveUserNote(tableId, noteId, title, content) {
    try {
        const noteRef = getCurrentTableRef(tableId, 'notes').doc(noteId);
        
        // Check if this is an update or new note
        const existing = await noteRef.get();
        const isUpdate = existing.exists;
        
        await noteRef.set({
            title,
            content,
            updatedAt: new Date(),
            createdAt: isUpdate ? existing.data().createdAt : new Date()
        });
        
        // Update table counter if new note
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
        const noteRef = getCurrentTableRef(tableId, 'notes').doc(noteId);
        const doc = await noteRef.get();
        
        if (doc.exists) {
            await noteRef.delete();
            await updateTableCounters(tableId, 0, -1);
        }
        
        return true;
    } catch (error) {
        console.error('Delete note error:', error);
        throw error;
    }
}

export function loadUserNotes(tableId, callback) {
    if (!tableId) return () => {};
    
    const notesRef = getCurrentTableRef(tableId, 'notes').orderBy('updatedAt', 'desc');
    
    const unsubscribe = notesRef.onSnapshot((snapshot) => {
        const notes = {};
        snapshot.forEach(doc => {
            notes[doc.id] = { id: doc.id, ...doc.data() };
        });
        callback(notes);
    }, (error) => {
        console.error('Error loading notes:', error);
        callback({});
    });
    
    return unsubscribe;
}

// Export/Import operations for specific table
export async function exportTableData(tableId) {
    if (!tableId) throw new Error('No table selected');
    
    try {
        const [dictSnapshot, notesSnapshot] = await Promise.all([
            getCurrentTableRef(tableId, 'dictionary').get(),
            getCurrentTableRef(tableId, 'notes').get()
        ]);
        
        const data = {
            dictionary: {},
            notes: {},
            metadata: {
                exportedAt: new Date().toISOString(),
                tableId: tableId
            }
        };
        
        dictSnapshot.forEach(doc => {
            data.dictionary[doc.id] = doc.data();
        });
        
        notesSnapshot.forEach(doc => {
            data.notes[doc.id] = doc.data();
        });
        
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
        const batch = db.batch();
        const dictRef = getCurrentTableRef(tableId, 'dictionary');
        const notesRef = getCurrentTableRef(tableId, 'notes');
        
        let newEntries = 0;
        let newNotes = 0;
        
        // Import dictionary entries
        if (importData.dictionary) {
            Object.entries(importData.dictionary).forEach(([topic, entryData]) => {
                const docRef = dictRef.doc(topic);
                batch.set(docRef, {
                    ...entryData,
                    updatedAt: new Date(),
                    createdAt: entryData.createdAt || new Date()
                });
                newEntries++;
            });
        }
        
        // Import notes
        if (importData.notes) {
            Object.entries(importData.notes).forEach(([noteId, noteData]) => {
                const docRef = notesRef.doc(noteId);
                batch.set(docRef, {
                    ...noteData,
                    updatedAt: new Date(),
                    createdAt: noteData.createdAt || new Date()
                });
                newNotes++;
            });
        }
        
        await batch.commit();
        
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