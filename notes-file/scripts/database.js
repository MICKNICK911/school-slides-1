class DatabaseManager {
    constructor() {
        this.db = firebaseServices.db;
        this.auth = firebaseServices.auth;
        this.currentUserId = null;
        
        // Collections
        this.USERS_COLLECTION = firebaseServices.collections.USERS_COLLECTION;
        this.NOTES_COLLECTION = firebaseServices.collections.NOTES_COLLECTION;
        this.BOOKMARKS_COLLECTION = firebaseServices.collections.BOOKMARKS_COLLECTION;
        this.HISTORY_COLLECTION = firebaseServices.collections.HISTORY_COLLECTION;
        
        this.init();
    }
    
    init() {
        // Listen for auth state changes
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUserId = user.uid;
            } else {
                this.currentUserId = null;
            }
        });
    }
    
    // User operations
    async getUserData() {
        if (!this.currentUserId) return null;
        
        try {
            const userDoc = await this.db.collection(this.USERS_COLLECTION)
                .doc(this.currentUserId)
                .get();
            
            if (userDoc.exists) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting user data:', error);
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
            return true;
        } catch (error) {
            console.error(`Error incrementing ${stat}:`, error);
            return false;
        }
    }
    
    // Notes operations
    async saveNote(noteData) {
        if (!this.currentUserId) return null;
        
        try {
            const noteId = this.generateId();
            const note = {
                id: noteId,
                userId: this.currentUserId,
                topic: noteData.topic,
                desc: noteData.desc,
                ex: noteData.ex,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                isPublic: false,
                tags: []
            };
            
            await this.db.collection(this.NOTES_COLLECTION)
                .doc(noteId)
                .set(note);
            
            // Update user stats
            await this.incrementUserStat('notesCount');
            
            return noteId;
        } catch (error) {
            console.error('Error saving note:', error);
            return null;
        }
    }
    
    async getUserNotes() {
        if (!this.currentUserId) return [];
        
        try {
            const snapshot = await this.db.collection(this.NOTES_COLLECTION)
                .where('userId', '==', this.currentUserId)
                .orderBy('createdAt', 'desc')
                .get();
            
            return snapshot.docs.map(doc => doc.data());
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
            
            if (!noteDoc.exists || noteDoc.data().userId !== this.currentUserId) {
                return false;
            }
            
            await this.db.collection(this.NOTES_COLLECTION)
                .doc(noteId)
                .delete();
            
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
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await this.db.collection(this.BOOKMARKS_COLLECTION)
                .doc(bookmarkId)
                .set(bookmark);
            
            // Update user stats
            await this.incrementUserStat('bookmarksCount');
            
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
            
            if (snapshot.empty) return false;
            
            const batch = this.db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
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
            
            return snapshot.docs.map(doc => doc.data().topic);
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
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await this.db.collection(this.HISTORY_COLLECTION)
                .doc(historyId)
                .set(historyItem);
            
            // Update user stats
            await this.incrementUserStat('historyCount');
            
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
            
            return snapshot.docs.map(doc => ({
                term: doc.data().term,
                time: doc.data().timestamp.toDate()
            }));
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
            return true;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
    }
    
    // Public notes operations
    async getPublicNotes(limit = 20) {
        try {
            const snapshot = await this.db.collection(this.NOTES_COLLECTION)
                .where('isPublic', '==', true)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting public notes:', error);
            return [];
        }
    }
    
    async searchPublicNotes(query) {
        try {
            const snapshot = await this.db.collection(this.NOTES_COLLECTION)
                .where('isPublic', '==', true)
                .orderBy('topic')
                .startAt(query)
                .endAt(query + '\uf8ff')
                .limit(10)
                .get();
            
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error searching public notes:', error);
            return [];
        }
    }
    
    // Helper methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    formatDate(date) {
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
}

// Initialize Database Manager
let databaseManager;
document.addEventListener('DOMContentLoaded', () => {
    databaseManager = new DatabaseManager();
    window.databaseManager = databaseManager;
});