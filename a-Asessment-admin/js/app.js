// Main Application Class
class App {
    constructor() {
        this.datasets = [];
        this.currentDatasetId = null;
        this.initialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleAuthChange = this.handleAuthChange.bind(this);
    }

    // Initialize application
    async init() {
        if (this.initialized) return;
        
        try {
            // Add auth listener
            auth.addListener(this.handleAuthChange);
            
            // Check if user is already authenticated
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

    // Handle authentication change
    async handleAuthChange(user) {
        if (user) {
            // User signed in
            try {
                // Try to load from Firebase first
                const cloudData = await database.loadFromFirebase();
                
                if (cloudData) {
                    // Use cloud data
                    this.loadFromCloud(cloudData);
                } else {
                    // No cloud data, try local storage
                    const localData = database.loadFromLocalStorage();
                    
                    if (localData) {
                        // Upload local data to cloud
                        this.loadFromCloud(localData);
                        await database.saveToFirebase(localData);
                    } else {
                        // No data anywhere, create default
                        this.createDefaultDataset();
                    }
                }
            } catch (error) {
                console.error('Auth sync error:', error);
                // Fallback to local storage
                const localData = database.loadFromLocalStorage();
                if (localData) {
                    this.loadFromCloud(localData);
                } else {
                    this.createDefaultDataset();
                }
            }
        } else {
            // User signed out, use local storage only
            const localData = database.loadFromLocalStorage();
            if (localData) {
                this.loadFromCloud(localData);
            } else {
                this.createDefaultDataset();
            }
        }
    }

    // Load data from cloud/local
    loadFromCloud(data) {
        if (data.resultDatasets) {
            this.datasets = data.resultDatasets;
            this.currentDatasetId = data.currentDatasetId || this.datasets[0]?.id;
        } else if (this.isValidDataset(data)) {
            this.datasets = [data];
            this.currentDatasetId = data.id;
        }
        
        this.validateAllDatasets();
        this.updateUI();
    }

    // Create default dataset
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

    // Get current dataset
    getCurrentDataset() {
        return this.datasets.find(d => d.id === this.currentDatasetId);
    }

    // Get current tables
    getCurrentTables() {
        const dataset = this.getCurrentDataset();
        return dataset ? dataset.tables : [];
    }

    // Validate all datasets
    validateAllDatasets() {
        this.datasets.forEach(dataset => {
            if (!dataset.tables) dataset.tables = [];
            if (!dataset.tableCounter) dataset.tableCounter = 1;
            
            dataset.tables.forEach(table => {
                if (!table.catColumns) table.catColumns = deepClone(defaultCatColumns);
                if (!table.students) table.students = [];
                
                table.students.forEach(student => {
                    if (!student.catMarks) {
                        student.catMarks = {};
                        table.catColumns.forEach(cat => {
                            student.catMarks[cat.id] = 0;
                        });
                    }
                    this.recalculateStudentTotals(table, student);
                });
                this.updatePositions(table.id);
            });
        });
    }

    // Recalculate student totals
    recalculateStudentTotals(table, student) {
        student.catTotal = table.catColumns.reduce((sum, cat) => {
            return sum + (student.catMarks[cat.id] || 0);
        }, 0);
        
        student.catTotal = Math.min(student.catTotal, 50);
        student.total = student.catTotal + (student.exam || 0);
    }

    // Update positions
    updatePositions(tableId) {
        const table = this.findTable(tableId);
        if (!table) return;
        
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

    // Find table by ID
    findTable(tableId) {
        for (const dataset of this.datasets) {
            const table = dataset.tables.find(t => t.id === tableId);
            if (table) return table;
        }
        return null;
    }

    // Find dataset containing table
    findDatasetByTable(tableId) {
        return this.datasets.find(d => d.tables.some(t => t.id === tableId));
    }

    // Add new table
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

    // Create table from names
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

    // Update table name
    updateTableName(tableId, newName) {
        const table = this.findTable(tableId);
        if (table) {
            table.name = newName || 'Unnamed Table';
            this.saveCurrentState();
        }
    }

    // Update student name
    updateStudentName(tableId, index, newName) {
        const table = this.findTable(tableId);
        if (table && table.students[index]) {
            table.students[index].name = newName || 'Unnamed Student';
            this.updateUI();
            this.saveCurrentState();
        }
    }

    // Update student CAT mark
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

    // Update student mark
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

    // Add student
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

    // Delete student
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

    // Delete table
    deleteTable(tableId) {
        if (!confirm('Delete this table?')) return;
        
        const dataset = this.findDatasetByTable(tableId);
        if (dataset) {
            dataset.tables = dataset.tables.filter(t => t.id !== tableId);
            this.updateUI();
            this.saveCurrentState();
        }
    }

    // Add CAT column
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

    // Edit CAT column
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
        
        table.students.forEach(s => this.recalculateStudentTotals(table, s));
        this.updatePositions(tableId);
        this.updateUI();
        this.saveCurrentState();
    }

    // Delete CAT column
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

    // Switch dataset
    switchDataset(datasetId) {
        this.currentDatasetId = datasetId;
        this.updateUI();
        this.saveCurrentState();
        document.getElementById('bulkListModal').style.display = 'none';
    }

    // Delete dataset
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
        
        // Update bulk list if open
        ui.renderBulkList(this.datasets, this.currentDatasetId);
    }

    // Create new dataset
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

    // Update UI
    updateUI() {
        const dataset = this.getCurrentDataset();
        
        // Update dataset indicator
        const indicator = document.getElementById('currentDatasetIndicator');
        const nameSpan = document.getElementById('currentDatasetName');
        
        if (dataset) {
            nameSpan.textContent = dataset.name;
            indicator.style.display = 'inline-flex';
        } else {
            indicator.style.display = 'none';
        }
        
        // Render tables
        ui.renderTables(dataset);
    }

    // Save current state
    saveCurrentState() {
        // Validate all datasets
        this.validateAllDatasets();
        
        // Prepare data for saving
        const data = {
            resultDatasets: this.datasets,
            currentDatasetId: this.currentDatasetId,
            lastUpdated: Date.now()
        };
        
        // Save to local storage
        database.saveToLocalStorage(data);
        
        // Save to Firebase if authenticated
        if (auth.isAuthenticated()) {
            database.saveToFirebase(data).catch(error => {
                console.error('Firebase save error:', error);
            });
        }
    }

    // Print table
    printTable(tableId) {
        const table = this.findTable(tableId);
        if (table) {
            ui.printTable(table);
        }
    }

    // Show statistics
    showStatistics() {
        const dataset = this.getCurrentDataset();
        if (!dataset || dataset.tables.length === 0) {
            showToast('info', 'No Data', 'Create tables first');
            return;
        }
        
        ui.renderStatistics(dataset);
        document.getElementById('statisticsModal').style.display = 'flex';
    }

    // Show help
    showHelp() {
        ui.renderHelpContent();
        document.getElementById('helpModal').style.display = 'flex';
    }

    // Show bulk list
    showBulkList() {
        ui.renderBulkList(this.datasets, this.currentDatasetId);
        document.getElementById('bulkListModal').style.display = 'flex';
    }

    // Import data
    async importData() {
        document.getElementById('fileInput').click();
    }

    // Handle file import
    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const importedData = await database.importData(file, true);
            
            if (importedData.resultDatasets) {
                this.datasets = importedData.resultDatasets;
                this.currentDatasetId = importedData.currentDatasetId || this.datasets[0].id;
            } else if (this.isValidDataset(importedData)) {
                this.datasets = [importedData];
                this.currentDatasetId = importedData.id;
            }
            
            this.validateAllDatasets();
            this.updateUI();
            this.saveCurrentState();
            
            ui.showImportSummary({
                tablesAdded: 1,
                studentsAdded: importedData.tables?.reduce((sum, t) => sum + t.students.length, 0) || 0
            });
        } catch (error) {
            console.error('Import error:', error);
            showToast('error', 'Import Failed', error.message);
        }
        
        event.target.value = '';
    }

    // Export data
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

    // Bulk export
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

    // Bulk import
    async handleBulkFileImport(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        let importedCount = 0;
        
        for (const file of files) {
            try {
                const importedData = await database.importData(file, true);
                
                if (importedData.resultDatasets) {
                    importedData.resultDatasets.forEach(d => {
                        if (!this.datasets.some(existing => existing.id === d.id)) {
                            this.datasets.push(d);
                            importedCount++;
                        }
                    });
                } else if (this.isValidDataset(importedData)) {
                    if (!this.datasets.some(existing => existing.id === importedData.id)) {
                        this.datasets.push(importedData);
                        importedCount++;
                    }
                }
            } catch (error) {
                console.error('Bulk import error:', error);
            }
        }
        
        this.validateAllDatasets();
        this.updateUI();
        this.saveCurrentState();
        
        showToast('success', 'Import Complete', `Imported ${importedCount} new dataset(s)`);
        event.target.value = '';
    }

    // Clear all data
    async clearAllData() {
        if (!confirm('Are you sure? This will delete ALL datasets permanently!')) return;
        
        const success = await database.clearAllData();
        
        if (success) {
            this.datasets = [];
            this.currentDatasetId = null;
            this.createDefaultDataset();
        }
    }

    // Manual sync
    async syncData() {
        if (!auth.isAuthenticated()) {
            showToast('warning', 'Not Signed In', 'Sign in to sync data');
            return;
        }
        
        await database.syncData();
    }

    // Validate dataset
    isValidDataset(data) {
        return data && data.id && data.name && Array.isArray(data.tables);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.app = new App();
    
    // Initialize app
    window.app.init();
    
    // Set up event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // File inputs
    document.getElementById('fileInput').addEventListener('change', (e) => window.app.handleFileImport(e));
    document.getElementById('bulkFileInput').addEventListener('change', (e) => window.app.handleBulkFileImport(e));
    
    // Buttons
    document.getElementById('addTableBtn').addEventListener('click', () => window.app.addNewTable());
    document.getElementById('initialAddTable').addEventListener('click', () => window.app.addNewTable());
    document.getElementById('importBtn').addEventListener('click', () => window.app.importData());
    document.getElementById('exportBtn').addEventListener('click', () => window.app.exportData());
    document.getElementById('statisticsBtn').addEventListener('click', () => window.app.showStatistics());
    document.getElementById('helpBtn').addEventListener('click', () => window.app.showHelp());
    document.getElementById('bulkImportBtn').addEventListener('click', () => document.getElementById('bulkFileInput').click());
    document.getElementById('bulkExportBtn').addEventListener('click', () => window.app.bulkExportData());
    document.getElementById('bulkListBtn').addEventListener('click', () => window.app.showBulkList());
    document.getElementById('clearDataBtn').addEventListener('click', () => window.app.clearAllData());
    document.getElementById('syncBtn').addEventListener('click', () => window.app.syncData());
    
    // Create new dataset button
    document.getElementById('createNewDatasetBtn').addEventListener('click', () => window.app.createNewDataset());
}