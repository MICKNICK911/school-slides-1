// database.js - Updated with secure queries
class DatabaseManager {
    constructor() {
        this.db = firebaseServices.db;
        this.auth = firebaseServices.auth;
        
        // Collections
        this.USERS_COLLECTION = 'users';
        this.NOTES_COLLECTION = 'notes';
        this.BOOKMARKS_COLLECTION = 'bookmarks';
        this.HISTORY_COLLECTION = 'history';
        
        this.init();
    }
    
    init() {
        console.log('DatabaseManager: Initializing securely...');
        
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('DatabaseManager: User authenticated:', user.uid.substring(0, 8) + '...');
            }
        });
    }
    
    // ============ SECURE USER DATA METHODS ============
    
    async getUserData() {
        const user = this.auth.currentUser;
        if (!user) {
            console.error('DatabaseManager: No user authenticated');
            return null;
        }
        
        try {
            console.log('DatabaseManager: Getting user data for:', user.uid);
            
            const userDoc = await this.db.collection(this.USERS_COLLECTION)
                .doc(user.uid) // Secure: Only user's own document
                .get();
            
            if (userDoc.exists) {
                return userDoc.data();
            }
            
            // Create user document if it doesn't exist
            await this.createUserDocument(user);
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email,
                createdAt: new Date(),
                lastLogin: new Date()
            };
        } catch (error) {
            console.error('DatabaseManager: Error getting user data:', error);
            return null;
        }
    }
    
    // ============ SECURE NOTES METHODS ============
    
    async saveNote(noteData) {
        const user = this.auth.currentUser;
        if (!user) {
            alert('Please log in to save notes');
            return null;
        }
        
        try {
            const noteId = this.generateId();
            
            // Ensure note belongs to current user
            const note = {
                id: noteId,
                userId: user.uid, // Always current user's ID
                topic: noteData.topic || '',
                desc: noteData.desc || '',
                ex: noteData.ex || [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isPublic: false,
                tags: []
            };
            
            console.log('DatabaseManager: Saving note for user:', user.uid);
            
            await this.db.collection(this.NOTES_COLLECTION)
                .doc(noteId)
                .set(note);
            
            console.log('DatabaseManager: ✅ Note saved securely');
            return noteId;
        } catch (error) {
            console.error('DatabaseManager: Error saving note:', error);
            
            if (error.code === 'permission-denied') {
                alert('Permission denied. Please check your Firestore rules.');
            }
            
            return null;
        }
    }
    
    async getUserNotes() {
        const user = this.auth.currentUser;
        if (!user) {
            console.log('DatabaseManager: User not authenticated');
            return [];
        }
        
        try {
            console.log('DatabaseManager: Getting notes for user:', user.uid);
            
            // Secure query: only get notes where userId matches current user
            const snapshot = await this.db.collection(this.NOTES_COLLECTION)
                .where('userId', '==', user.uid)
                .get();
            
            const notes = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    userId: data.userId,
                    topic: data.topic || '',
                    desc: data.desc || '',
                    ex: data.ex || [],
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                };
            });
            
            console.log(`DatabaseManager: Found ${notes.length} notes for user ${user.uid}`);
            
            // Sort by date (newest first)
            notes.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            return notes;
        } catch (error) {
            console.error('DatabaseManager: Error getting notes:', error);
            
            // If it's a permission error, inform the user
            if (error.code === 'permission-denied') {
                console.error('Permission denied. Check Firestore rules.');
            }
            
            return [];
        }
    }
    
    // ============ SECURE BOOKMARKS METHODS ============
    
    async addBookmark(topic) {
        const user = this.auth.currentUser;
        if (!user) {
            alert('Please log in to bookmark');
            return false;
        }
        
        try {
            const bookmarkId = this.generateId();
            const bookmark = {
                id: bookmarkId,
                userId: user.uid, // Current user only
                topic: topic,
                createdAt: new Date()
            };
            
            await this.db.collection(this.BOOKMARKS_COLLECTION)
                .doc(bookmarkId)
                .set(bookmark);
            
            console.log('DatabaseManager: Bookmark added for user:', user.uid);
            return true;
        } catch (error) {
            console.error('DatabaseManager: Error adding bookmark:', error);
            return false;
        }
    }
    
    async getUserBookmarks() {
        const user = this.auth.currentUser;
        if (!user) return [];
        
        try {
            const snapshot = await this.db.collection(this.BOOKMARKS_COLLECTION)
                .where('userId', '==', user.uid)
                .get();
            
            const bookmarks = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.userId === user.uid) { // Double check
                    bookmarks.push(data.topic);
                }
            });
            
            console.log(`DatabaseManager: Found ${bookmarks.length} bookmarks for user ${user.uid}`);
            return bookmarks;
        } catch (error) {
            console.error('DatabaseManager: Error getting bookmarks:', error);
            return [];
        }
    }
    
    // ============ SECURE HISTORY METHODS ============
    
    async addToHistory(searchTerm) {
        const user = this.auth.currentUser;
        if (!user) return false;
        
        try {
            const historyId = this.generateId();
            const historyItem = {
                id: historyId,
                userId: user.uid, // Current user only
                term: searchTerm,
                timestamp: new Date()
            };
            
            await this.db.collection(this.HISTORY_COLLECTION)
                .doc(historyId)
                .set(historyItem);
            
            return true;
        } catch (error) {
            console.error('DatabaseManager: Error adding to history:', error);
            return false;
        }
    }
    
    async getUserHistory(limit = 10) {
        const user = this.auth.currentUser;
        if (!user) return [];
        
        try {
            const snapshot = await this.db.collection(this.HISTORY_COLLECTION)
                .where('userId', '==', user.uid)
                .get();
            
            const history = [];
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.userId === user.uid) { // Double check
                    history.push({
                        term: data.term,
                        time: data.timestamp
                    });
                }
            });
            
            // Sort and limit
            history.sort((a, b) => new Date(b.time) - new Date(a.time));
            return history.slice(0, limit);
        } catch (error) {
            console.error('DatabaseManager: Error getting history:', error);
            return [];
        }
    }
    
    // ============ PUBLIC NOTES (Optional - if you want shared notes) ============
    
    async getPublicNotes(limit = 20) {
        try {
            const snapshot = await this.db.collection(this.NOTES_COLLECTION)
                .where('isPublic', '==', true)
                .get();
            
            const publicNotes = snapshot.docs.map(doc => {
                const data = doc.data();
                // Don't return sensitive data for public notes
                return {
                    topic: data.topic || '',
                    desc: data.desc || '',
                    ex: data.ex || [],
                    createdAt: data.createdAt
                };
            });
            
            console.log(`DatabaseManager: Found ${publicNotes.length} public notes`);
            return publicNotes;
        } catch (error) {
            console.error('DatabaseManager: Error getting public notes:', error);
            return [];
        }
    }
    
    // ============ HELPER METHODS ============
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    async testSecurity() {
        const user = this.auth.currentUser;
        if (!user) {
            console.log('Security test: No user logged in');
            return false;
        }
        
        try {
            console.log('=== SECURITY TEST ===');
            console.log('Current user ID:', user.uid);
            
            // Try to access user's own data
            const ownNotes = await this.getUserNotes();
            console.log(`Can access own notes: ${ownNotes.length} notes`);
            
            // Test permission denied scenario
            try {
                // Try to query all notes (should fail with secure rules)
                const allNotes = await this.db.collection(this.NOTES_COLLECTION).get();
                console.warn('⚠️ SECURITY WARNING: User can access ALL notes!');
                console.warn('Total notes in database:', allNotes.size);
                return false;
            } catch (error) {
                console.log('✅ Good: User cannot access all notes (permission denied)');
                return true;
            }
        } catch (error) {
            console.error('Security test error:', error);
            return false;
        }
    }
    
    // Clear all user data (for testing)
    async clearUserData() {
        const user = this.auth.currentUser;
        if (!user) return;
        
        if (!confirm('Are you sure you want to delete ALL your data? This cannot be undone.')) {
            return;
        }
        
        try {
            // Delete user's notes
            const notesSnapshot = await this.db.collection(this.NOTES_COLLECTION)
                .where('userId', '==', user.uid)
                .get();
            
            const batch1 = this.db.batch();
            notesSnapshot.docs.forEach(doc => batch1.delete(doc.ref));
            await batch1.commit();
            
            // Delete user's bookmarks
            const bookmarksSnapshot = await this.db.collection(this.BOOKMARKS_COLLECTION)
                .where('userId', '==', user.uid)
                .get();
            
            const batch2 = this.db.batch();
            bookmarksSnapshot.docs.forEach(doc => batch2.delete(doc.ref));
            await batch2.commit();
            
            // Delete user's history
            const historySnapshot = await this.db.collection(this.HISTORY_COLLECTION)
                .where('userId', '==', user.uid)
                .get();
            
            const batch3 = this.db.batch();
            historySnapshot.docs.forEach(doc => batch3.delete(doc.ref));
            await batch3.commit();
            
            alert('All your data has been deleted.');
            console.log('User data cleared for:', user.uid);
        } catch (error) {
            console.error('Error clearing user data:', error);
            alert('Error clearing data: ' + error.message);
        }
    }

    // Add these methods to your DatabaseManager class in database.js
async updateNote(noteId, noteData) {
    const user = this.auth.currentUser;
    if (!user) {
        console.error('Cannot update note - no user');
        return false;
    }
    
    try {
        console.log('Updating note:', noteId);
        
        // First, get the note to verify ownership
        const noteDoc = await this.db.collection(this.NOTES_COLLECTION)
            .doc(noteId)
            .get();
        
        if (!noteDoc.exists) {
            console.error('Note not found:', noteId);
            return false;
        }
        
        const existingNote = noteDoc.data();
        if (existingNote.userId !== user.uid) {
            console.error('User not authorized to update note');
            return false;
        }
        
        // Update the note
        await this.db.collection(this.NOTES_COLLECTION)
            .doc(noteId)
            .update({
                topic: noteData.topic || existingNote.topic,
                desc: noteData.desc || existingNote.desc,
                ex: noteData.ex || existingNote.ex,
                updatedAt: new Date()
            });
        
        console.log('Note updated successfully:', noteId);
        return true;
    } catch (error) {
        console.error('Error updating note:', error);
        return false;
    }
}

async deleteNoteFromCloud(noteId) {
    const user = this.auth.currentUser;
    if (!user) {
        console.error('Cannot delete note - no user');
        return false;
    }
    
    try {
        console.log('Deleting note from cloud:', noteId);
        
        // First, get the note to verify ownership
        const noteDoc = await this.db.collection(this.NOTES_COLLECTION)
            .doc(noteId)
            .get();
        
        if (!noteDoc.exists) {
            console.error('Note not found:', noteId);
            return false;
        }
        
        const noteData = noteDoc.data();
        if (noteData.userId !== user.uid) {
            console.error('User not authorized to delete note');
            return false;
        }
        
        // Delete the note
        await this.db.collection(this.NOTES_COLLECTION)
            .doc(noteId)
            .delete();
        
        console.log('Note deleted successfully:', noteId);
        return true;
    } catch (error) {
        console.error('Error deleting note:', error);
        return false;
    }
}

async searchNoteByTopic(topic) {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    try {
        const snapshot = await this.db.collection(this.NOTES_COLLECTION)
            .where('userId', '==', user.uid)
            .where('topic', '==', topic)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            return null;
        }
        
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('Error searching note by topic:', error);
        return null;
    }
}

}

// Initialize Database Manager
let databaseManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        databaseManager = new DatabaseManager();
        window.databaseManager = databaseManager;
        
        // Run security test after login
        setTimeout(() => {
            if (databaseManager.auth.currentUser) {
                databaseManager.testSecurity();
            }
        }, 3000);
    } catch (error) {
        console.error('Error initializing DatabaseManager:', error);
    }
});