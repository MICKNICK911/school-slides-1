// Update the DatabaseManager in database.js with better error handling
class DatabaseManager {
    constructor() {
        this.db = firebaseServices.db;
        this.auth = firebaseServices.auth;
        this.currentUserId = null;
        
        // Collections
        this.USERS_COLLECTION = 'users';
        this.NOTES_COLLECTION = 'notes';
        this.BOOKMARKS_COLLECTION = 'bookmarks';
        this.HISTORY_COLLECTION = 'history';
        
        this.init();
    }
    
    init() {
        // Listen for auth state changes
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUserId = user.uid;
                console.log('User authenticated:', user.email, 'UID:', user.uid);
            } else {
                this.currentUserId = null;
                console.log('User not authenticated');
            }
        });
    }
    
    // Test Firestore connection
    async testFirestoreConnection() {
        try {
            console.log('Testing Firestore connection...');
            const testRef = this.db.collection('test').doc('connection');
            await testRef.set({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                test: 'connection'
            });
            console.log('Firestore connection successful');
            await testRef.delete();
            return true;
        } catch (error) {
            console.error('Firestore connection failed:', error);
            return false;
        }
    }
    
    // User operations
    async getUserData() {
        if (!this.currentUserId) {
            console.log('No current user ID for getUserData');
            return null;
        }
        
        try {
            console.log('Fetching user data for UID:', this.currentUserId);
            const userDoc = await this.db.collection(this.USERS_COLLECTION)
                .doc(this.currentUserId)
                .get();
            
            if (userDoc.exists) {
                console.log('User data found:', userDoc.data());
                return userDoc.data();
            }
            console.log('User document does not exist');
            return null;
        } catch (error) {
            console.error('Error getting user data:', error);
            console.error('Error details:', error.code, error.message);
            return null;
        }
    }
    
    async updateUserPreferences(preferences) {
        if (!this.currentUserId) return false;
        
        try {
            await this.db.collection(this.USERS_COLLECTION)
                .doc(this.currentUserId)
                .update({
                    'preferences': preferences
                });
            console.log('User preferences updated');
            return true;
        } catch (error) {
            console.error('Error updating user preferences:', error);
            return false;
        }
    }
    
    async incrementUserStat(stat) {
        if (!this.currentUserId) return false;
        
        try {
            await this.db.collection(this.USERS_COLLECTION)
                .doc(this.currentUserId)
                .update({
                    [stat]: firebase.firestore.FieldValue.increment(1)
                });
            console.log(`User stat ${stat} incremented`);
            return true;
        } catch (error) {
            console.error(`Error incrementing ${stat}:`, error);
            return false;
        }
    }
    
    // Notes operations - FIXED VERSION
    async saveNote(noteData) {
        if (!this.currentUserId) {
            console.error('Cannot save note: No user ID');
            return null;
        }
        
        try {
            console.log('Starting to save note:', noteData);
            
            // Generate a simpler ID
            const noteId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            
            // Create the note object with proper structure
            const note = {
                id: noteId,
                userId: this.currentUserId,
                topic: noteData.topic || '',
                desc: noteData.desc || '',
                ex: Array.isArray(noteData.ex) ? noteData.ex : [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isPublic: false,
                tags: []
            };
            
            console.log('Note object to save:', note);
            
            // Save to Firestore
            await this.db.collection(this.NOTES_COLLECTION)
                .doc(noteId)
                .set(note);
            
            console.log('Note saved successfully to Firestore:', noteId);
            
            // Update user stats
            try {
                await this.incrementUserStat('notesCount');
                console.log('User stats updated');
            } catch (statsError) {
                console.warn('Could not update user stats:', statsError);
                // Continue even if stats update fails
            }
            
            return noteId;
        } catch (error) {
            console.error('ERROR in saveNote:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error details:', error);
            return null;
        }
    }
    
    async getUserNotes() {
        if (!this.currentUserId) {
            console.log('No user ID for getUserNotes');
            return [];
        }
        
        try {
            console.log('Fetching user notes for UID:', this.currentUserId);
            const snapshot = await this.db.collection(this.NOTES_COLLECTION)
                .where('userId', '==', this.currentUserId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const notes = snapshot.docs.map(doc => {
                const data = doc.data();
                // Convert Firestore timestamps to Date objects
                return {
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
                };
            });
            
            console.log(`Found ${notes.length} user notes`);
            return notes;
        } catch (error) {
            console.error('Error getting user notes:', error);
            return [];
        }
    }
    
    async deleteNote(noteId) {
        if (!this.currentUserId) return false;
        
        try {
            const noteDoc = await this.db.collection(this.NOTES_COLLECTION)
                .doc(noteId)
                .get();
            
            if (!noteDoc.exists) {
                console.log('Note not found:', noteId);
                return false;
            }
            
            const noteData = noteDoc.data();
            if (noteData.userId !== this.currentUserId) {
                console.log('User not authorized to delete note:', noteId);
                return false;
            }
            
            await this.db.collection(this.NOTES_COLLECTION)
                .doc(noteId)
                .delete();
            
            console.log('Note deleted:', noteId);
            return true;
        } catch (error) {
            console.error('Error deleting note:', error);
            return false;
        }
    }
    
    // Bookmarks operations
    async addBookmark(topic) {
        if (!this.currentUserId) return false;
        
        try {
            const bookmarkId = this.generateId();
            const bookmark = {
                id: bookmarkId,
                userId: this.currentUserId,
                topic: topic,
                createdAt: new Date()
            };
            
            await this.db.collection(this.BOOKMARKS_COLLECTION)
                .doc(bookmarkId)
                .set(bookmark);
            
            console.log('Bookmark added:', topic);
            return true;
        } catch (error) {
            console.error('Error adding bookmark:', error);
            return false;
        }
    }
    
    async removeBookmark(topic) {
        if (!this.currentUserId) return false;
        
        try {
            const snapshot = await this.db.collection(this.BOOKMARKS_COLLECTION)
                .where('userId', '==', this.currentUserId)
                .where('topic', '==', topic)
                .get();
            
            if (snapshot.empty) {
                console.log('No bookmark found to remove:', topic);
                return false;
            }
            
            const batch = this.db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            console.log('Bookmark removed:', topic);
            return true;
        } catch (error) {
            console.error('Error removing bookmark:', error);
            return false;
        }
    }
    
    async getUserBookmarks() {
        if (!this.currentUserId) return [];
        
        try {
            const snapshot = await this.db.collection(this.BOOKMARKS_COLLECTION)
                .where('userId', '==', this.currentUserId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const topics = snapshot.docs.map(doc => doc.data().topic);
            console.log(`Found ${topics.length} bookmarks`);
            return topics;
        } catch (error) {
            console.error('Error getting bookmarks:', error);
            return [];
        }
    }
    
    async isBookmarked(topic) {
        if (!this.currentUserId) return false;
        
        try {
            const snapshot = await this.db.collection(this.BOOKMARKS_COLLECTION)
                .where('userId', '==', this.currentUserId)
                .where('topic', '==', topic)
                .limit(1)
                .get();
            
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking bookmark:', error);
            return false;
        }
    }
    
    // History operations
    async addToHistory(searchTerm) {
        if (!this.currentUserId) return false;
        
        try {
            const historyId = this.generateId();
            const historyItem = {
                id: historyId,
                userId: this.currentUserId,
                term: searchTerm,
                timestamp: new Date()
            };
            
            await this.db.collection(this.HISTORY_COLLECTION)
                .doc(historyId)
                .set(historyItem);
            
            console.log('Added to history:', searchTerm);
            return true;
        } catch (error) {
            console.error('Error adding to history:', error);
            return false;
        }
    }
    
    async getUserHistory(limit = 10) {
        if (!this.currentUserId) return [];
        
        try {
            const snapshot = await this.db.collection(this.HISTORY_COLLECTION)
                .where('userId', '==', this.currentUserId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            const history = snapshot.docs.map(doc => ({
                term: doc.data().term,
                time: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : doc.data().timestamp
            }));
            
            console.log(`Found ${history.length} history items`);
            return history;
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }
    
    async clearUserHistory() {
        if (!this.currentUserId) return false;
        
        try {
            const snapshot = await this.db.collection(this.HISTORY_COLLECTION)
                .where('userId', '==', this.currentUserId)
                .get();
            
            const batch = this.db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            console.log('History cleared');
            return true;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
    }
    
    // Test method to check if notes are being saved
    async testSaveNote() {
        const testNote = {
            topic: 'Test Note',
            desc: 'This is a test note to check if Firestore is working.',
            ex: ['test1', 'test2', 'test3']
        };
        
        console.log('Testing note save...');
        const noteId = await this.saveNote(testNote);
        
        if (noteId) {
            console.log('Test note saved successfully! ID:', noteId);
            
            // Try to retrieve it
            const noteDoc = await this.db.collection(this.NOTES_COLLECTION)
                .doc(noteId)
                .get();
            
            if (noteDoc.exists) {
                console.log('Test note retrieved:', noteDoc.data());
                // Delete test note
                await noteDoc.ref.delete();
                console.log('Test note deleted');
            }
            
            return true;
        } else {
            console.log('Test note save failed');
            return false;
        }
    }
    
    // Helper methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Initialize Database Manager
let databaseManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing DatabaseManager...');
    try {
        databaseManager = new DatabaseManager();
        window.databaseManager = databaseManager;
        
        // Test Firestore after initialization
        setTimeout(async () => {
            console.log('Testing Firestore connection...');
            if (databaseManager.currentUserId) {
                await databaseManager.testFirestoreConnection();
                await databaseManager.testSaveNote();
            }
        }, 3000);
    } catch (error) {
        console.error('Error initializing DatabaseManager:', error);
    }
});