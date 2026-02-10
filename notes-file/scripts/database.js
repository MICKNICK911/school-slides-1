// database.js - Complete Database Manager
class DatabaseManager {
    constructor() {
        this.db = firebaseServices.db;
        this.auth = firebaseServices.auth;
        
        // Collections
        this.USERS_COLLECTION = 'users';
        this.NOTES_COLLECTION = 'notes';
        this.BOOKMARKS_COLLECTION = 'bookmarks';
        this.HISTORY_COLLECTION = 'history';
        
        // Throttling for count updates
        this.lastCountUpdate = 0;
        this.UPDATE_THROTTLE_MS = 30000; // Update every 30 seconds max
        
        this.init();
    }
    
    init() {
        console.log('DatabaseManager: Initializing...');
        
        // Listen for auth state changes
        this.auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log('DatabaseManager: User authenticated:', user.uid.substring(0, 8) + '...');
                this.currentUserId = user.uid;
                
                // Ensure user document exists
                await this.ensureUserDocument(user);
                
                // Trigger initial counts update
                setTimeout(() => this.updateUserCounts(), 1000);
            } else {
                console.log('DatabaseManager: User signed out');
                this.currentUserId = null;
            }
        });
    }
    
    // ============ USER DATA METHODS ============
    
    async ensureUserDocument(user) {
        try {
            const userDoc = await this.db.collection(this.USERS_COLLECTION)
                .doc(user.uid)
                .get();
            
            if (!userDoc.exists) {
                await this.createUserDocument(user);
            }
        } catch (error) {
            console.error('Error ensuring user document:', error);
        }
    }
    
    async createUserDocument(user) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            bookmarksCount: 0,
            historyCount: 0,
            notesCount: 0,
            createdAt: new Date(),
            lastLogin: new Date(),
            lastUpdated: new Date()
        };
        
        try {
            await this.db.collection(this.USERS_COLLECTION)
                .doc(user.uid)
                .set(userData);
            
            console.log('DatabaseManager: User document created');
            return userData;
        } catch (error) {
            console.error('Error creating user document:', error);
            throw error;
        }
    }
    
    async getUserData() {
        const user = this.auth.currentUser;
        if (!user) {
            console.error('No user authenticated');
            return null;
        }
        
        try {
            // Get user document
            const userDoc = await this.db.collection(this.USERS_COLLECTION)
                .doc(user.uid)
                .get();
            
            if (!userDoc.exists) {
                return await this.createUserDocument(user);
            }
            
            const userData = userDoc.data();
            
            // Get fresh counts
            const counts = await this.getUserCounts(user.uid);
            
            // Merge user data with fresh counts
            return {
                displayName: userData.displayName || user.email,
                email: userData.email || user.email,
                ...userData,
                ...counts // Fresh counts override stored counts
            };
            
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }
    
    async getUserCounts(userId) {
        try {
            console.log('Getting counts for user:', userId);
            
            // Execute all count queries in parallel
            const [bookmarksSnapshot, notesSnapshot, historySnapshot] = await Promise.all([
                this.db.collection(this.BOOKMARKS_COLLECTION)
                    .where('userId', '==', userId)
                    .get(),
                this.db.collection(this.NOTES_COLLECTION)
                    .where('userId', '==', userId)
                    .get(),
                this.db.collection(this.HISTORY_COLLECTION)
                    .where('userId', '==', userId)
                    .get()
            ]);
            
            return {
                bookmarksCount: bookmarksSnapshot.size || 0,
                notesCount: notesSnapshot.size || 0,
                historyCount: historySnapshot.size || 0
            };
        } catch (error) {
            console.error('Error getting user counts:', error);
            return {
                bookmarksCount: 0,
                notesCount: 0,
                historyCount: 0
            };
        }
    }
    
    async updateUserCounts() {
        const user = this.auth.currentUser;
        if (!user) {
            console.warn('No user to update counts for');
            return;
        }
        
        // Throttle updates
        const now = Date.now();
        if (now - this.lastCountUpdate < this.UPDATE_THROTTLE_MS) {
            return;
        }
        
        try {
            const counts = await this.getUserCounts(user.uid);
            
            await this.db.collection(this.USERS_COLLECTION)
                .doc(user.uid)
                .update({
                    bookmarksCount: counts.bookmarksCount,
                    notesCount: counts.notesCount,
                    historyCount: counts.historyCount,
                    lastUpdated: new Date()
                });
            
            this.lastCountUpdate = now;
            
            // Dispatch event for UI updates
            this.dispatchEvent('userCountsUpdated', { counts });
            
            console.log('User counts updated:', counts);
            
        } catch (error) {
            console.error('Error updating user counts:', error);
        }
    }
    
    // ============ NOTES METHODS ============
    
    async saveNote(noteData) {
        const user = this.auth.currentUser;
        if (!user) {
            alert('Please log in to save notes');
            return null;
        }
        
        try {
            const noteId = this.generateId();
            
            const note = {
                id: noteId,
                userId: user.uid,
                topic: noteData.topic || '',
                desc: noteData.desc || '',
                ex: noteData.ex || [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isPublic: false,
                tags: noteData.tags || []
            };
            
            await this.db.collection(this.NOTES_COLLECTION)
                .doc(noteId)
                .set(note);
            
            // Update counts
            await this.updateUserCounts();
            
            console.log('Note saved:', noteId);
            return noteId;
            
        } catch (error) {
            console.error('Error saving note:', error);
            if (error.code === 'permission-denied') {
                alert('Permission denied. Please check Firestore rules.');
            }
            return null;
        }
    }
    
    async getUserNotes() {
        const user = this.auth.currentUser;
        if (!user) {
            return [];
        }
        
        try {
            const snapshot = await this.db.collection(this.NOTES_COLLECTION)
                .where('userId', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .get();
            
            const notes = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data
                };
            });
            
            console.log(`Found ${notes.length} notes for user`);
            return notes;
        } catch (error) {
            console.error('Error getting user notes:', error);
            return [];
        }
    }
    
    async updateNote(noteId, noteData) {
        const user = this.auth.currentUser;
        if (!user) {
            return false;
        }
        
        try {
            // Verify ownership
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
            
            // Update note
            await this.db.collection(this.NOTES_COLLECTION)
                .doc(noteId)
                .update({
                    topic: noteData.topic || existingNote.topic,
                    desc: noteData.desc || existingNote.desc,
                    ex: noteData.ex || existingNote.ex,
                    tags: noteData.tags || existingNote.tags,
                    updatedAt: new Date()
                });
            
            console.log('Note updated:', noteId);
            return true;
            
        } catch (error) {
            console.error('Error updating note:', error);
            return false;
        }
    }
    
    async deleteNoteFromCloud(noteId) {
        const user = this.auth.currentUser;
        if (!user) {
            return false;
        }
        
        try {
            // Verify ownership
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
            
            // Delete note
            await this.db.collection(this.NOTES_COLLECTION)
                .doc(noteId)
                .delete();
            
            // Update counts
            await this.updateUserCounts();
            
            console.log('Note deleted:', noteId);
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
    
    // ============ BOOKMARKS METHODS ============
    
    async addBookmark(topic) {
        const user = this.auth.currentUser;
        if (!user) {
            alert('Please log in to bookmark');
            return false;
        }
        
        try {
            // Check if already bookmarked
            const existing = await this.db.collection(this.BOOKMARKS_COLLECTION)
                .where('userId', '==', user.uid)
                .where('topic', '==', topic)
                .limit(1)
                .get();
            
            if (!existing.empty) {
                console.log('Already bookmarked:', topic);
                return false;
            }
            
            const bookmarkId = this.generateId();
            const bookmark = {
                id: bookmarkId,
                userId: user.uid,
                topic: topic,
                createdAt: new Date()
            };
            
            await this.db.collection(this.BOOKMARKS_COLLECTION)
                .doc(bookmarkId)
                .set(bookmark);
            
            // Update counts
            await this.updateUserCounts();
            
            console.log('Bookmark added:', topic);
            return true;
            
        } catch (error) {
            console.error('Error adding bookmark:', error);
            return false;
        }
    }
    
    async removeBookmark(topic) {
        const user = this.auth.currentUser;
        if (!user) return false;
        
        try {
            // Find the bookmark
            const snapshot = await this.db.collection(this.BOOKMARKS_COLLECTION)
                .where('userId', '==', user.uid)
                .where('topic', '==', topic)
                .limit(1)
                .get();
            
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                await doc.ref.delete();
                
                // Update counts
                await this.updateUserCounts();
                
                console.log('Bookmark removed:', topic);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing bookmark:', error);
            return false;
        }
    }
    
    async isBookmarked(topic) {
        const user = this.auth.currentUser;
        if (!user) return false;
        
        try {
            const snapshot = await this.db.collection(this.BOOKMARKS_COLLECTION)
                .where('userId', '==', user.uid)
                .where('topic', '==', topic)
                .limit(1)
                .get();
            
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking bookmark:', error);
            return false;
        }
    }
    
    async getUserBookmarks() {
        const user = this.auth.currentUser;
        if (!user) return [];
        
        try {
            const snapshot = await this.db.collection(this.BOOKMARKS_COLLECTION)
                .where('userId', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .get();
            
            const bookmarks = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data
                };
            });
            
            console.log(`Found ${bookmarks.length} bookmarks`);
            return bookmarks;
        } catch (error) {
            console.error('Error getting bookmarks:', error);
            return [];
        }
    }
    
    // ============ HISTORY METHODS ============
    
    async addToHistory(searchTerm) {
        const user = this.auth.currentUser;
        if (!user) return false;
        
        try {
            const historyId = this.generateId();
            const historyItem = {
                id: historyId,
                userId: user.uid,
                term: searchTerm,
                timestamp: new Date()
            };
            
            await this.db.collection(this.HISTORY_COLLECTION)
                .doc(historyId)
                .set(historyItem);
            
            // Update counts (throttled)
            await this.updateUserCounts();
            
            return true;
        } catch (error) {
            console.error('Error adding to history:', error);
            return false;
        }
    }
    
    async getUserHistory(limit = 10) {
        const user = this.auth.currentUser;
        if (!user) return [];
        
        try {
            const snapshot = await this.db.collection(this.HISTORY_COLLECTION)
                .where('userId', '==', user.uid)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            const history = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data
                };
            });
            
            return history;
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }
    
    async clearHistory() {
        const user = this.auth.currentUser;
        if (!user) return false;
        
        try {
            const snapshot = await this.db.collection(this.HISTORY_COLLECTION)
                .where('userId', '==', user.uid)
                .get();
            
            const batch = this.db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            
            // Update counts
            await this.updateUserCounts();
            
            console.log('History cleared');
            return true;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
    }
    
    // ============ PUBLIC NOTES METHODS ============
    
    async getPublicNotes(limit = 20) {
        try {
            const snapshot = await this.db.collection(this.NOTES_COLLECTION)
                .where('isPublic', '==', true)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            
            const publicNotes = snapshot.docs.map(doc => {
                const data = doc.data();
                // Return only public-safe data
                return {
                    id: doc.id,
                    topic: data.topic || '',
                    desc: data.desc || '',
                    ex: data.ex || [],
                    createdAt: data.createdAt,
                    tags: data.tags || []
                };
            });
            
            return publicNotes;
        } catch (error) {
            console.error('Error getting public notes:', error);
            return [];
        }
    }
    
    // ============ HELPER METHODS ============
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
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
            
            // Test accessing own data
            const ownNotes = await this.getUserNotes();
            console.log(`Can access own notes: ${ownNotes.length} notes`);
            
            // Test permission denied (try to access all notes)
            try {
                const allNotes = await this.db.collection(this.NOTES_COLLECTION).get();
                console.warn('⚠️ SECURITY WARNING: User can access ALL notes!');
                console.warn('Total notes in database:', allNotes.size);
                return false;
            } catch (error) {
                console.log('✅ Good: User cannot access all notes');
                return true;
            }
        } catch (error) {
            console.error('Security test error:', error);
            return false;
        }
    }
    
    async clearUserData() {
        const user = this.auth.currentUser;
        if (!user) return;
        
        if (!confirm('Are you sure you want to delete ALL your data? This cannot be undone.')) {
            return;
        }
        
        try {
            // Delete notes
            const notesSnapshot = await this.db.collection(this.NOTES_COLLECTION)
                .where('userId', '==', user.uid)
                .get();
            
            const batch1 = this.db.batch();
            notesSnapshot.docs.forEach(doc => batch1.delete(doc.ref));
            await batch1.commit();
            
            // Delete bookmarks
            const bookmarksSnapshot = await this.db.collection(this.BOOKMARKS_COLLECTION)
                .where('userId', '==', user.uid)
                .get();
            
            const batch2 = this.db.batch();
            bookmarksSnapshot.docs.forEach(doc => batch2.delete(doc.ref));
            await batch2.commit();
            
            // Delete history
            const historySnapshot = await this.db.collection(this.HISTORY_COLLECTION)
                .where('userId', '==', user.uid)
                .get();
            
            const batch3 = this.db.batch();
            historySnapshot.docs.forEach(doc => batch3.delete(doc.ref));
            await batch3.commit();
            
            // Delete user document
            await this.db.collection(this.USERS_COLLECTION)
                .doc(user.uid)
                .delete();
            
            alert('All your data has been deleted.');
            console.log('User data cleared');
        } catch (error) {
            console.error('Error clearing user data:', error);
            alert('Error clearing data: ' + error.message);
        }
    }
}

// Initialize Database Manager
let databaseManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        databaseManager = new DatabaseManager();
        window.databaseManager = databaseManager;
        
        console.log('DatabaseManager initialized successfully');
        
        // Listen for auth state changes to trigger UI updates
        databaseManager.auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('User logged in, updating UI...');
                // Dispatch login event for UI
                document.dispatchEvent(new CustomEvent('userLoggedIn'));
            } else {
                document.dispatchEvent(new CustomEvent('userLoggedOut'));
            }
        });
        
        // Listen for counts updates
        document.addEventListener('userCountsUpdated', (event) => {
            console.log('Counts updated, refreshing profile...');
            if (window.uiManager && typeof window.uiManager.loadProfileData === 'function') {
                window.uiManager.loadProfileData();
            }
        });
        
    } catch (error) {
        console.error('Error initializing DatabaseManager:', error);
    }
});