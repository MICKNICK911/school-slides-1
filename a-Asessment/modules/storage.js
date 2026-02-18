import { db } from './firebase.js';
import { STORAGE_KEY, FIREBASE_COLLECTION, GUEST_USER_ID, VERSION, DEFAULT_CAT_COLUMNS } from './utils.js';

export class StorageManager {
    constructor(app) {
        this.app = app;
        this.hasUnsavedChanges = false;        // dirty flag
        this.lastFirebaseSync = 0;
        this.syncInterval = null;
        this.firebaseSaveTimeout = null;
    }

    // ---------- Local Storage ----------
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return false;

            const data = JSON.parse(saved);
            const savedUserId = data.userId;
            const currentUserId = this.app.isGuest ? GUEST_USER_ID : (this.app.currentUser?.uid || '');

            if (savedUserId && currentUserId && savedUserId !== currentUserId) {
                console.warn('Data belongs to different user – starting fresh');
                return false;
            }

            if (data.version !== VERSION) {
                console.warn('Version mismatch – migrating');
                this.migrateData(data);
            } else {
                this.app.tables = data.tables || [];
                this.app.tableCounter = data.tableCounter || 1;
                if (data.lastSaved) {
                    this.app.ui.lastSaved.textContent = `Last saved: ${new Date(data.lastSaved).toLocaleString()}`;
                }
            }

            // Ensure data integrity
            this.app.tables.forEach(t => this.app.tableManager.validateTableData(t));
            this.hasUnsavedChanges = false;   // local storage is in sync
            return true;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return false;
        }
    }

    saveToLocalStorage() {
        if (this.app.ui.saveTimeout) clearTimeout(this.app.ui.saveTimeout);

        this.app.ui.saveStatus.textContent = 'Saving...';
        this.app.ui.saveStatus.className = '';

        this.app.ui.saveTimeout = setTimeout(() => {
            try {
                const data = {
                    version: VERSION,
                    tables: this.app.tables,
                    tableCounter: this.app.tableCounter,
                    lastSaved: new Date().toISOString(),
                    userId: this.app.currentUser?.uid || GUEST_USER_ID,
                    email: this.app.currentUser?.email || 'guest'
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

                this.app.ui.saveStatus.textContent = 'All changes saved';
                this.app.ui.saveStatus.className = 'saved-indicator';
                this.app.ui.lastSaved.textContent = `Last saved: ${new Date().toLocaleString()}`;

                // Mark that local is saved, but cloud may be behind
                this.hasUnsavedChanges = true;   // because we haven't synced to cloud yet
                console.log('Local storage saved');
            } catch (e) {
                console.error('Error saving to localStorage:', e);
                this.app.ui.saveStatus.textContent = 'Error saving data';
                if (e.name === 'QuotaExceededError') {
                    this.app.showToast('Storage full – export and clear some data', 'error');
                }
            }
        }, 500);
    }

    // ---------- Cloud Sync (Firestore) ----------
    async saveToFirebase() {
        if (this.app.isGuest) {
            this.app.showToast('Sign in to save to cloud', 'warning');
            return false;
        }
        if (!this.app.isOnline) {
            this.app.showToast('Offline – cannot sync', 'warning');
            return false;
        }

        // Rate limit: at most once every 2 seconds
        const now = Date.now();
        if (now - this.lastFirebaseSync < 2000) {
            // Silently ignore – not an error
            return false;
        }

        try {
            this.app.setLoadingState(this.app.ui.cloudSyncBtn, true);
            this.app.updateSyncStatus('syncing');

            const data = {
                version: VERSION,
                tables: this.app.tables,
                tableCounter: this.app.tableCounter,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: new Date().toISOString(),
                tableCount: this.app.tables.length
            };

            await db.collection(FIREBASE_COLLECTION).doc(this.app.currentUser.uid).set(data, { merge: true });

            this.lastFirebaseSync = now;
            this.hasUnsavedChanges = false;   // now cloud is in sync
            this.app.showToast('Synced to cloud', 'success');
            this.app.updateSyncStatus('synced');
            return true;
        } catch (error) {
            console.error('Firebase save error:', error);
            let msg = 'Cloud sync failed';
            if (error.code === 'permission-denied') msg = 'Permission denied';
            else if (error.code === 'unavailable') msg = 'Cloud service unavailable';
            this.app.showToast(msg, 'error');
            this.app.updateSyncStatus('error');
            return false;
        } finally {
            this.app.setLoadingState(this.app.ui.cloudSyncBtn, false);
            setTimeout(() => this.app.updateSyncStatus('idle'), 3000);
        }
    }

    async loadFromFirebase() {
        if (this.app.isGuest) {
            this.app.showToast('Guest cannot load from cloud', 'warning');
            return false;
        }
        if (!this.app.isOnline) {
            this.app.showToast('Offline – cannot load', 'warning');
            return false;
        }

        try {
            this.app.setLoadingState(this.app.ui.loadFromCloudBtn, true);
            this.app.updateSyncStatus('syncing');

            const doc = await db.collection(FIREBASE_COLLECTION).doc(this.app.currentUser.uid).get();
            if (doc.exists) {
                const data = doc.data();
                if (data.version !== VERSION) {
                    this.app.showToast('Data format changed – may need migration', 'warning');
                }
                if (data.tables && Array.isArray(data.tables)) {
                    this.app.tables = data.tables;
                    this.app.tableCounter = data.tableCounter || 1;
                    this.app.tables.forEach(t => this.app.tableManager.validateTableData(t));
                    this.saveToLocalStorage();          // backup to local
                    this.hasUnsavedChanges = false;    // now in sync
                    return true;
                } else {
                    throw new Error('Invalid data structure');
                }
            } else {
                // No cloud data yet
                return false;
            }
        } catch (error) {
            console.error('Firebase load error:', error);
            this.app.showToast('Failed to load from cloud', 'error');
            return false;
        } finally {
            this.app.setLoadingState(this.app.ui.loadFromCloudBtn, false);
            this.app.updateSyncStatus('idle');
        }
    }

    // ---------- Periodic Sync (every minute) ----------
    startPeriodicSync() {
        if (this.syncInterval) clearInterval(this.syncInterval);
        if (!this.app.isGuest && this.app.isOnline) {
            this.syncInterval = setInterval(() => {
                // Only sync if there are unsaved changes
                if (this.hasUnsavedChanges) {
                    this.saveToFirebase();
                }
            }, 60000); // 1 minute
        }
    }

    stopPeriodicSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // ---------- Migration (from older versions) ----------
    migrateData(oldData) {
        this.app.tables = oldData.tables || [];
        this.app.tableCounter = oldData.tableCounter || 1;
        // Ensure tables have catColumns etc.
        this.app.tables.forEach(t => {
            if (!t.catColumns) t.catColumns = JSON.parse(JSON.stringify(DEFAULT_CAT_COLUMNS));
            if (!t.students) t.students = [];
            t.students.forEach(s => {
                if (!s.catMarks) {
                    s.catMarks = {};
                    t.catColumns.forEach(cat => s.catMarks[cat.id] = 0);
                }
                this.app.tableManager.recalculateStudentTotals(t, s);
            });
            this.app.tableManager.updateTablePositions(t.id);
        });
        this.app.showToast('Data migrated to new version', 'info');
    }
}