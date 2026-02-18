class App {
    constructor() {
        this.datasets = [];
        this.currentDatasetId = null;
        this.initialized = false;
        this.init = this.init.bind(this);
        this.handleAuthChange = this.handleAuthChange.bind(this);
    }

    async init() {
        if (this.initialized) return;
        try {
            auth.addListener(this.handleAuthChange);
            if (auth.isAuthenticated()) {
                await this.handleAuthChange(auth.getCurrentUser());
            }
            this.initialized = true;
            console.log('App initialized');
        } catch (error) {
            console.error('App initialization error:', error);
            showToast('error', 'Error', 'Failed to initialize application');
        }
    }

    async handleAuthChange(user) {
        if (user) {
            try {
                const cloudData = await database.loadFromFirebase();
                if (cloudData) {
                    this.loadFromCloud(cloudData);
                } else {
                    const localData = database.loadFromLocalStorage();
                    if (localData) {
                        this.loadFromCloud(localData);
                        await database.saveToFirebase(localData);
                    } else {
                        this.createDefaultDataset();
                    }
                }
            } catch (error) {
                console.error('Auth sync error:', error);
                const localData = database.loadFromLocalStorage();
                if (localData) this.loadFromCloud(localData);
                else this.createDefaultDataset();
            }
        } else {
            const localData = database.loadFromLocalStorage();
            if (localData) this.loadFromCloud(localData);
            else this.createDefaultDataset();
        }
    }

    loadFromCloud(data) {
        if (data.resultDatasets) {
            this.datasets = data.resultDatasets;
            this.currentDatasetId = data.currentDatasetId || this.datasets[0]?.id;
        } else if (this.isValidDataset(data)) {
            this.datasets = [data];
            this.currentDatasetId = data.id;
        }
        // Force complete revalidation of all datasets
        this.validateAllDatasets(true);
        this.updateUI();
    }

    createDefaultDataset() {
        const datasetId = generateId();
        const dataset = { 
            id: datasetId, 
            name: 'My Dataset', 
            tables: [], 
            tableCounter: 1 
        };
        this.datasets = [dataset];
        this.currentDatasetId = datasetId;
        this.updateUI();
        this.saveCurrentState();
    }

    getCurrentDataset() {
        return this.datasets.find(d => d.id === this.currentDatasetId);
    }

    getCurrentTables() {
        const dataset = this.getCurrentDataset();
        return dataset ? dataset.tables : [];
    }

    // ========== COMPLETELY FIXED VALIDATION ==========
    validateAllDatasets(forceRebuild = false) {
        this.datasets.forEach(dataset => {
            if (!dataset.tables) dataset.tables = [];
            if (!dataset.tableCounter) dataset.tableCounter = 1;
            
            dataset.tables.forEach(table => {
                // Ensure catColumns exist
                if (!table.catColumns || table.catColumns.length === 0) {
                    table.catColumns = deepClone(defaultCatColumns);
                }
                
                // Ensure students exist
                if (!table.students) table.students = [];
                
                // Process each student
                table.students.forEach(student => {
                    // Ensure catMarks exists
                    if (!student.catMarks) student.catMarks = {};
                    
                    // CRITICAL: For EVERY cat column, ensure a number exists in catMarks
                    table.catColumns.forEach(cat => {
                        if (typeof student.catMarks[cat.id] !== 'number') {
                            // If the mark exists but is not a number, try to parse it
                            if (student.catMarks[cat.id] !== undefined) {
                                const parsed = parseFloat(student.catMarks[cat.id]);
                                student.catMarks[cat.id] = isNaN(parsed) ? 0 : parsed;
                            } else {
                                student.catMarks[cat.id] = 0;
                            }
                        }
                    });
                    
                    // Ensure exam is a number
                    if (typeof student.exam !== 'number') {
                        student.exam = parseFloat(student.exam) || 0;
                    }
                    
                    // Recalculate totals
                    this.recalculateStudentTotals(table, student);
                });
                
                // Update positions for this table
                this.updatePositions(table.id);
            });
        });
    }

    recalculateStudentTotals(table, student) {
        // Calculate CAT total from all cat columns
        student.catTotal = table.catColumns.reduce((sum, cat) => {
            return sum + (student.catMarks[cat.id] || 0);
        }, 0);
        
        // Cap CAT total at 50
        student.catTotal = Math.min(student.catTotal, 50);
        
        // Calculate overall total
        student.total = student.catTotal + (student.exam || 0);
    }

    updatePositions(tableId) {
        const table = this.findTable(tableId);
        if (!table) return;
        
        // Sort students by total marks (descending)
        const sorted = [...table.students].sort((a, b) => b.total - a.total);
        
        let position = 1;
        let prevTotal = null;
        
        sorted.forEach((student, index) => {
            if (prevTotal !== null && student.total === prevTotal) {
                student.position = position;
            } else {
                position = index + 1;
                student.position = position;
            }
            prevTotal = student.total;
        });
    }

    findTable(tableId) {
        for (const dataset of this.datasets) {
            const table = dataset.tables.find(t => t.id === tableId);
            if (table) return table;
        }
        return null;
    }

    findDatasetByTable(tableId) {
        return this.datasets.find(d => d.tables.some(t => t.id === tableId));
    }

    addNewTable() {
        const dataset = this.getCurrentDataset();
        if (!dataset) return;
        
        const tableId = `table-${dataset.tableCounter++}`;
        
        const students = initialStudents.map(name => ({
            name,
            exam: 0,
            catTotal: 0,
            total: 0,
            position: 0,
            catMarks: defaultCatColumns.reduce((acc, cat) => {
                acc[cat.id] = 0;
                return acc;
            }, {})
        }));
        
        dataset.tables.push({
            id: tableId,
            name: `Class ${dataset.tableCounter - 1}`,
            catColumns: deepClone(defaultCatColumns),
            students
        });
        
        this.updateUI();
        this.saveCurrentState();
    }

    createTableFromNames(sourceTableId) {
        const sourceTable = this.findTable(sourceTableId);
        if (!sourceTable) return;
        
        const dataset = this.getCurrentDataset();
        if (!dataset) return;
        
        const tableId = `table-${dataset.tableCounter++}`;
        
        const students = sourceTable.students.map(s => ({
            name: s.name,
            exam: 0,
            catTotal: 0,
            total: 0,
            position: 0,
            catMarks: sourceTable.catColumns.reduce((acc, cat) => {
                acc[cat.id] = 0;
                return acc;
            }, {})
        }));
        
        dataset.tables.push({
            id: tableId,
            name: `${sourceTable.name} (Copy)`,
            catColumns: deepClone(sourceTable.catColumns),
            students
        });
        
        this.updateUI();
        this.saveCurrentState();
    }

    updateTableName(tableId, newName) {
        const table = this.findTable(tableId);
        if (table) {
            table.name = newName || 'Unnamed Table';
            this.saveCurrentState();
        }
    }

    updateStudentName(tableId, index, newName) {
        const table = this.findTable(tableId);
        if (table && table.students[index]) {
            table.students[index].name = newName || 'Unnamed Student';
            this.updateUI();
            this.saveCurrentState();
        }
    }

    updateStudentCatMark(tableId, index, catId, value) {
        const table = this.findTable(tableId);
        if (table && table.students[index]) {
            table.students[index].catMarks[catId] = value;
            this.recalculateStudentTotals(table, table.students[index]);
            this.updatePositions(tableId);
            this.updateUI();
            this.saveCurrentState();
        }
    }

    updateStudentMark(tableId, index, markType, value) {
        const table = this.findTable(tableId);
        if (table && table.students[index]) {
            table.students[index][markType] = value;
            this.recalculateStudentTotals(table, table.students[index]);
            this.updatePositions(tableId);
            this.updateUI();
            this.saveCurrentState();
        }
    }

    addStudent(tableId) {
        const table = this.findTable(tableId);
        if (!table) return;
        
        table.students.push({
            name: 'New Student',
            exam: 0,
            catTotal: 0,
            total: 0,
            position: 0,
            catMarks: table.catColumns.reduce((acc, cat) => {
                acc[cat.id] = 0;
                return acc;
            }, {})
        });
        
        this.updatePositions(tableId);
        this.updateUI();
        this.saveCurrentState();
    }

    deleteStudent(tableId, index) {
        if (!confirm('Delete this student?')) return;
        
        const table = this.findTable(tableId);
        if (table && table.students[index]) {
            table.students.splice(index, 1);
            this.updatePositions(tableId);
            this.updateUI();
            this.saveCurrentState();
        }
    }

    deleteTable(tableId) {
        if (!confirm('Delete this table?')) return;
        
        const dataset = this.findDatasetByTable(tableId);
        if (dataset) {
            dataset.tables = dataset.tables.filter(t => t.id !== tableId);
            this.updateUI();
            this.saveCurrentState();
        }
    }

    addCatColumn(tableId, name, maxScore) {
        if (!name || !maxScore || maxScore <= 0) {
            showToast('warning', 'Invalid Input', 'Please enter valid name and max score');
            return;
        }
        
        const table = this.findTable(tableId);
        if (!table) return;
        
        const id = `cat-${generateId()}`;
        
        table.catColumns.push({ id, name, maxScore });
        
        table.students.forEach(student => {
            student.catMarks[id] = 0;
        });
        
        table.students.forEach(s => this.recalculateStudentTotals(table, s));
        this.updatePositions(tableId);
        this.updateUI();
        this.saveCurrentState();
    }

    editCatColumn(tableId, index) {
        const table = this.findTable(tableId);
        if (!table || !table.catColumns[index]) return;
        
        const cat = table.catColumns[index];
        
        const newName = prompt('Enter new name:', cat.name);
        if (!newName) return;
        
        const newMax = parseInt(prompt('Enter new max score:', cat.maxScore));
        if (isNaN(newMax) || newMax <= 0) {
            showToast('warning', 'Invalid Input', 'Max score must be greater than 0');
            return;
        }
        
        cat.name = newName;
        cat.maxScore = newMax;
        
        // If max score changed, cap existing marks
        table.students.forEach(student => {
            if (student.catMarks[cat.id] > newMax) {
                student.catMarks[cat.id] = newMax;
            }
        });
        
        table.students.forEach(s => this.recalculateStudentTotals(table, s));
        this.updatePositions(tableId);
        this.updateUI();
        this.saveCurrentState();
    }

    deleteCatColumn(tableId, index) {
        const table = this.findTable(tableId);
        if (!table || !table.catColumns[index]) return;
        
        const cat = table.catColumns[index];
        
        if (!confirm(`Delete "${cat.name}" column?`)) return;
        
        table.catColumns.splice(index, 1);
        
        table.students.forEach(student => {
            delete student.catMarks[cat.id];
        });
        
        table.students.forEach(s => this.recalculateStudentTotals(table, s));
        this.updatePositions(tableId);
        this.updateUI();
        this.saveCurrentState();
    }

    switchDataset(datasetId) {
        this.currentDatasetId = datasetId;
        this.updateUI();
        this.saveCurrentState();
        document.getElementById('bulkListModal').style.display = 'none';
    }

    deleteDataset(datasetId) {
        if (this.datasets.length <= 1) {
            showToast('warning', 'Cannot Delete', 'You must keep at least one dataset');
            return;
        }
        
        const dataset = this.datasets.find(d => d.id === datasetId);
        if (!dataset) return;
        
        if (!confirm(`Delete dataset "${dataset.name}"?`)) return;
        
        this.datasets = this.datasets.filter(d => d.id !== datasetId);
        
        if (this.currentDatasetId === datasetId) {
            this.currentDatasetId = this.datasets[0].id;
        }
        
        this.updateUI();
        this.saveCurrentState();
        
        if (document.getElementById('bulkListModal').style.display === 'flex') {
            ui.renderBulkList(this.datasets, this.currentDatasetId);
        }
    }

    createNewDataset() {
        const name = prompt('Enter dataset name:', `Dataset ${this.datasets.length + 1}`);
        if (!name) return;
        
        const dataset = {
            id: generateId(),
            name,
            tables: [],
            tableCounter: 1
        };
        
        this.datasets.push(dataset);
        this.currentDatasetId = dataset.id;
        
        this.updateUI();
        this.saveCurrentState();
        document.getElementById('bulkListModal').style.display = 'none';
    }

    updateUI() {
        const dataset = this.getCurrentDataset();
        
        const indicator = document.getElementById('currentDatasetIndicator');
        const nameSpan = document.getElementById('currentDatasetName');
        
        if (dataset) {
            nameSpan.textContent = dataset.name;
            indicator.style.display = 'inline-flex';
        } else {
            indicator.style.display = 'none';
        }
        
        // Force UI to re-render
        ui.renderTables(dataset);
    }

    saveCurrentState() {
        // Validate before saving
        this.validateAllDatasets();
        
        const data = {
            resultDatasets: this.datasets,
            currentDatasetId: this.currentDatasetId,
            lastUpdated: Date.now()
        };
        
        database.saveToLocalStorage(data);
        
        if (auth.isAuthenticated()) {
            database.saveToFirebase(data).catch(error => {
                console.error('Firebase save error:', error);
            });
        }
    }

    printTable(tableId) {
        const table = this.findTable(tableId);
        if (table) {
            ui.printTable(table);
        }
    }

    showStatistics() {
        const dataset = this.getCurrentDataset();
        if (!dataset || dataset.tables.length === 0) {
            showToast('info', 'No Data', 'Create tables first');
            return;
        }
        
        ui.renderStatistics(dataset);
        document.getElementById('statisticsModal').style.display = 'flex';
    }

    showHelp() {
        ui.renderHelpContent();
        document.getElementById('helpModal').style.display = 'flex';
    }

    showBulkList() {
        ui.renderBulkList(this.datasets, this.currentDatasetId);
        document.getElementById('bulkListModal').style.display = 'flex';
    }

    async importData() {
        document.getElementById('fileInput').click();
    }

    // ========== FIXED SINGLE FILE IMPORT ==========
    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const fileContent = await importJSONFile(file);
            const currentDataset = this.getCurrentDataset();

            if (currentDataset && this.isValidDataset(fileContent)) {
                const importedDataset = fileContent;
                let tablesAdded = 0;

                importedDataset.tables.forEach(importedTable => {
                    const newTableId = `table-${currentDataset.tableCounter++}`;
                    
                    // Ensure catColumns exist
                    const newCatColumns = importedTable.catColumns && importedTable.catColumns.length > 0
                        ? importedTable.catColumns.map(c => ({ ...c }))
                        : deepClone(defaultCatColumns);

                    // Build students with complete catMarks for all columns
                    const newStudents = importedTable.students.map(s => {
                        const catMarks = {};
                        
                        // Initialize with zeros for all columns
                        newCatColumns.forEach(cat => {
                            catMarks[cat.id] = 0;
                        });
                        
                        // Copy over any existing marks
                        if (s.catMarks) {
                            Object.keys(s.catMarks).forEach(key => {
                                if (catMarks.hasOwnProperty(key)) {
                                    const val = parseFloat(s.catMarks[key]);
                                    catMarks[key] = isNaN(val) ? 0 : val;
                                }
                            });
                        }
                        
                        return {
                            name: s.name || 'Unnamed Student',
                            exam: typeof s.exam === 'number' ? s.exam : (parseFloat(s.exam) || 0),
                            catMarks: catMarks,
                            catTotal: 0,
                            total: 0,
                            position: 0
                        };
                    });

                    const newTable = {
                        id: newTableId,
                        name: importedTable.name || 'Imported Table',
                        catColumns: newCatColumns,
                        students: newStudents
                    };

                    // Recalculate totals
                    newTable.students.forEach(s => this.recalculateStudentTotals(newTable, s));
                    currentDataset.tables.push(newTable);
                    tablesAdded++;
                });

                // Update positions for all tables
                currentDataset.tables.forEach(t => this.updatePositions(t.id));
                
                // Force complete revalidation
                this.validateAllDatasets(true);
                this.updateUI();
                this.saveCurrentState();

                showToast('success', 'Import Complete', `Added ${tablesAdded} table(s) to "${currentDataset.name}"`);
            } else {
                // Bulk import format
                const importedData = await database.importData(file, true);
                if (importedData.resultDatasets) {
                    this.datasets = importedData.resultDatasets;
                    this.currentDatasetId = importedData.currentDatasetId || this.datasets[0]?.id;
                } else if (this.isValidDataset(importedData)) {
                    // Check if dataset with same ID exists
                    const existingIndex = this.datasets.findIndex(d => d.id === importedData.id);
                    if (existingIndex >= 0) {
                        this.datasets[existingIndex] = importedData;
                    } else {
                        this.datasets.push(importedData);
                    }
                    this.currentDatasetId = importedData.id;
                }

                // Force complete revalidation
                this.validateAllDatasets(true);
                this.updateUI();
                this.saveCurrentState();

                const totalStudents = this.getCurrentDataset()?.tables.reduce((sum, t) => sum + t.students.length, 0) || 0;
                ui.showImportSummary({
                    tablesAdded: 1,
                    studentsAdded: totalStudents
                });
            }
        } catch (error) {
            console.error('Import error:', error);
            showToast('error', 'Import Failed', error.message);
        }

        event.target.value = '';
    }

    exportData() {
        const dataset = this.getCurrentDataset();
        if (!dataset) {
            showToast('info', 'No Data', 'Nothing to export');
            return;
        }
        
        const filename = `student-results-${dataset.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        exportAsJSON(dataset, filename);
        showToast('success', 'Exported', 'Data exported successfully');
    }

    bulkExportData() {
        if (this.datasets.length === 0) {
            showToast('info', 'No Data', 'Nothing to export');
            return;
        }
        
        const data = {
            resultDatasets: this.datasets,
            currentDatasetId: this.currentDatasetId,
            exportedAt: new Date().toISOString()
        };
        
        exportAsJSON(data, 'student-results-all-datasets.json');
        showToast('success', 'Exported', 'All datasets exported');
    }

    // ========== FIXED BULK IMPORT ==========
    async handleBulkFileImport(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        let importedCount = 0;
        let firstImportedId = null;
        
        for (const file of files) {
            try {
                const fileContent = await importJSONFile(file);
                
                if (fileContent.resultDatasets) {
                    // Bulk export file with multiple datasets
                    fileContent.resultDatasets.forEach(d => {
                        if (!this.datasets.some(existing => existing.id === d.id)) {
                            this.datasets.push(d);
                            importedCount++;
                            if (!firstImportedId) firstImportedId = d.id;
                        }
                    });
                } else if (this.isValidDataset(fileContent)) {
                    // Single dataset file
                    if (!this.datasets.some(existing => existing.id === fileContent.id)) {
                        this.datasets.push(fileContent);
                        importedCount++;
                        if (!firstImportedId) firstImportedId = fileContent.id;
                    }
                }
            } catch (error) {
                console.error('Bulk import error for file:', file.name, error);
            }
        }
        
        if (importedCount > 0) {
            // Switch to the first imported dataset
            if (firstImportedId) {
                this.currentDatasetId = firstImportedId;
            }
            
            // Force complete revalidation
            this.validateAllDatasets(true);
            this.updateUI();
            this.saveCurrentState();
            
            showToast('success', 'Import Complete', `Imported ${importedCount} new dataset(s)`);
        } else {
            showToast('info', 'No New Data', 'All datasets already exist');
        }
        
        event.target.value = '';
    }

    async clearAllData() {
        if (!confirm('Are you sure? This will delete ALL datasets permanently!')) return;
        
        const success = await database.clearAllData();
        
        if (success) {
            this.datasets = [];
            this.currentDatasetId = null;
            this.createDefaultDataset();
            showToast('success', 'Cleared', 'All data has been cleared');
        }
    }

    async syncData() {
        if (!auth.isAuthenticated()) {
            showToast('warning', 'Not Signed In', 'Sign in to sync data');
            return;
        }
        
        await database.syncData();
    }

    isValidDataset(data) {
        return data && 
               typeof data === 'object' && 
               data.id && 
               data.name && 
               Array.isArray(data.tables) &&
               typeof data.tableCounter === 'number';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => window.app.handleFileImport(e));
    }
    
    const bulkFileInput = document.getElementById('bulkFileInput');
    if (bulkFileInput) {
        bulkFileInput.addEventListener('change', (e) => window.app.handleBulkFileImport(e));
    }
    
    const addTableBtn = document.getElementById('addTableBtn');
    if (addTableBtn) {
        addTableBtn.addEventListener('click', () => window.app.addNewTable());
    }
    
    const initialAddTable = document.getElementById('initialAddTable');
    if (initialAddTable) {
        initialAddTable.addEventListener('click', () => window.app.addNewTable());
    }
    
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
        importBtn.addEventListener('click', () => window.app.importData());
    }
    
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => window.app.exportData());
    }
    
    const statisticsBtn = document.getElementById('statisticsBtn');
    if (statisticsBtn) {
        statisticsBtn.addEventListener('click', () => window.app.showStatistics());
    }
    
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => window.app.showHelp());
    }
    
    const bulkImportBtn = document.getElementById('bulkImportBtn');
    if (bulkImportBtn) {
        bulkImportBtn.addEventListener('click', () => document.getElementById('bulkFileInput').click());
    }
    
    const bulkExportBtn = document.getElementById('bulkExportBtn');
    if (bulkExportBtn) {
        bulkExportBtn.addEventListener('click', () => window.app.bulkExportData());
    }
    
    const bulkListBtn = document.getElementById('bulkListBtn');
    if (bulkListBtn) {
        bulkListBtn.addEventListener('click', () => window.app.showBulkList());
    }
    
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => window.app.clearAllData());
    }
    
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.addEventListener('click', () => window.app.syncData());
    }
    
    const createNewDatasetBtn = document.getElementById('createNewDatasetBtn');
    if (createNewDatasetBtn) {
        createNewDatasetBtn.addEventListener('click', () => window.app.createNewDataset());
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => auth.signOut());
    }
}