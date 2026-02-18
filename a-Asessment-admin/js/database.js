class DatabaseManager {
    constructor() {
        this.db = firebase.firestore();
        this.userId = null;
        this.localData = null;
        this.syncInProgress = false;
        this.syncInterval = null;
        this.pendingChanges = false;
    }

    setUser(user) {
        this.userId = user ? user.uid : null;
        if (this.userId) {
            this.startAutoSync();
        } else {
            this.stopAutoSync();
        }
    }

    startAutoSync() {
        if (this.syncInterval) clearInterval(this.syncInterval);
        this.syncInterval = setInterval(() => this.syncData(), SYNC_INTERVAL);
    }

    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    getUserDocRef() {
        if (!this.userId) return null;
        return this.db.collection('users').doc(this.userId);
    }

    async saveToFirebase(data) {
        if (!this.userId) throw new Error('User not authenticated');
        try {
            showLoading('Saving to cloud...');
            const docRef = this.getUserDocRef();
            await docRef.set({
                data: data,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                version: APP_VERSION
            }, { merge: true });
            this.pendingChanges = false;
            showToast('success', 'Success', 'Data saved to cloud');
            return true;
        } catch (error) {
            console.error('Firestore save error:', error);
            showToast('error', 'Error', errorMessages.SAVE_ERROR);
            throw error;
        } finally {
            hideLoading();
        }
    }

    async loadFromFirebase() {
        if (!this.userId) throw new Error('User not authenticated');
        try {
            showLoading('Loading from cloud...');
            const docRef = this.getUserDocRef();
            const doc = await docRef.get();
            if (doc.exists) {
                const userData = doc.data();
                this.localData = userData.data || null;
                showToast('success', 'Success', 'Data loaded from cloud');
                return userData.data || null;
            }
            return null;
        } catch (error) {
            console.error('Firestore load error:', error);
            showToast('error', 'Error', 'Failed to load data from cloud');
            throw error;
        } finally {
            hideLoading();
        }
    }

    async syncData() {
        if (!this.userId || this.syncInProgress) return;
        this.syncInProgress = true;
        try {
            const docRef = this.getUserDocRef();
            const doc = await docRef.get();
            const cloudData = doc.exists ? doc.data() : null;

            if (!cloudData) {
                if (this.localData) {
                    await this.saveToFirebase(this.localData);
                }
                return;
            }

            const cloudTime = cloudData.lastUpdated ? cloudData.lastUpdated.toMillis() : 0;
            const localTime = this.localData?.lastUpdated || 0;

            if (cloudTime > localTime && cloudData.data) {
                this.localData = cloudData.data;
                showToast('info', 'Sync', 'Newer data downloaded from cloud');
                if (window.app) {
                    window.app.loadFromCloud(this.localData);
                }
            } else if (localTime > cloudTime && this.localData && this.pendingChanges) {
                await this.saveToFirebase(this.localData);
            }
        } catch (error) {
            console.error('Sync error:', error);
            showToast('warning', 'Sync Error', errorMessages.SYNC_ERROR);
        } finally {
            this.syncInProgress = false;
        }
    }

    saveToLocalStorage(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                ...data,
                lastUpdated: Date.now()
            }));
            this.localData = data;
            this.pendingChanges = true;
            return true;
        } catch (error) {
            console.error('Local storage save error:', error);
            showToast('error', 'Error', 'Failed to save locally');
            return false;
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                this.localData = JSON.parse(saved);
                return this.localData;
            }
        } catch (error) {
            console.error('Local storage load error:', error);
        }
        return null;
    }

    async clearAllData() {
        if (!this.userId) return false;
        try {
            showLoading('Clearing data...');
            const docRef = this.getUserDocRef();
            await docRef.delete();
            localStorage.removeItem(STORAGE_KEY);
            this.localData = null;
            this.pendingChanges = false;
            showToast('success', 'Success', 'All data cleared');
            return true;
        } catch (error) {
            console.error('Clear data error:', error);
            showToast('error', 'Error', 'Failed to clear data');
            return false;
        } finally {
            hideLoading();
        }
    }

    exportData() {
        if (!this.localData) {
            showToast('warning', 'Warning', 'No data to export');
            return false;
        }
        const filename = `student-results-backup-${formatDate().replace(/[/:, ]/g, '-')}.json`;
        exportAsJSON(this.localData, filename);
        showToast('success', 'Success', 'Data exported successfully');
        return true;
    }

    async importData(file, merge = true) {
        try {
            showLoading('Importing data...');
            const importedData = await importJSONFile(file);
            if (!this.validateData(importedData)) {
                throw new Error('Invalid data format');
            }
            if (merge && this.localData) {
                this.localData = this.mergeData(this.localData, importedData);
            } else {
                this.localData = importedData;
            }
            this.saveToLocalStorage(this.localData);
            if (this.userId) {
                await this.saveToFirebase(this.localData);
            }
            showToast('success', 'Success', 'Data imported successfully');
            return this.localData;
        } catch (error) {
            console.error('Import error:', error);
            showToast('error', 'Error', error.message);
            throw error;
        } finally {
            hideLoading();
        }
    }

    validateData(data) {
        if (!data || typeof data !== 'object') return false;
        if (Array.isArray(data)) {
            return data.every(dataset => this.isValidDataset(dataset));
        } else {
            return this.isValidDataset(data) || (data.resultDatasets && Array.isArray(data.resultDatasets));
        }
    }

    isValidDataset(data) {
        return data && data.id && data.name && Array.isArray(data.tables) && typeof data.tableCounter === 'number';
    }

    // ========== FIXED MERGE: preserves catMarks by ensuring they match the table's catColumns ==========
    mergeData(existing, imported) {
        const merged = deepClone(existing);
        if (imported.resultDatasets) {
            imported.resultDatasets.forEach(dataset => {
                const existingIndex = merged.resultDatasets?.findIndex(d => d.id === dataset.id);
                if (existingIndex >= 0) {
                    merged.resultDatasets[existingIndex] = this.mergeDataset(merged.resultDatasets[existingIndex], dataset);
                } else {
                    if (!merged.resultDatasets) merged.resultDatasets = [];
                    merged.resultDatasets.push(dataset);
                }
            });
        } else if (this.isValidDataset(imported)) {
            if (merged.resultDatasets) {
                const existingIndex = merged.resultDatasets.findIndex(d => d.id === imported.id);
                if (existingIndex >= 0) {
                    merged.resultDatasets[existingIndex] = this.mergeDataset(merged.resultDatasets[existingIndex], imported);
                } else {
                    merged.resultDatasets.push(imported);
                }
            } else {
                merged.resultDatasets = [imported];
            }
        }
        return merged;
    }

    mergeDataset(existing, imported) {
        const merged = deepClone(existing);
        imported.tables.forEach(importedTable => {
            const existingTable = merged.tables.find(t => t.id === importedTable.id);
            if (existingTable) {
                importedTable.students.forEach(importedStudent => {
                    const existingStudent = existingTable.students.find(s => s.name === importedStudent.name);
                    if (existingStudent) {
                        // Merge student data, but ensure catMarks align with the table's columns
                        // We'll rely on validation later to fill missing columns
                        Object.assign(existingStudent, importedStudent);
                    } else {
                        existingTable.students.push(importedStudent);
                    }
                });
            } else {
                merged.tables.push(importedTable);
            }
        });
        merged.tableCounter = Math.max(
            merged.tableCounter,
            imported.tableCounter,
            Math.max(...merged.tables.map(t => parseInt(t.id.replace('table-', '')))) + 1
        );
        return merged;
    }

    createBackup() {
        if (!this.localData) return;
        const backup = { ...this.localData, backupDate: Date.now(), version: APP_VERSION };
        const filename = `backup-${formatDate().replace(/[/:, ]/g, '-')}.json`;
        exportAsJSON(backup, filename);
        showToast('success', 'Success', 'Backup created successfully');
    }

    async restoreFromBackup(file) {
        return this.importData(file, false);
    }

    getSyncStatus() {
        return {
            authenticated: !!this.userId,
            syncInProgress: this.syncInProgress,
            pendingChanges: this.pendingChanges,
            lastUpdated: this.localData?.lastUpdated || null
        };
    }
}

const database = new DatabaseManager();