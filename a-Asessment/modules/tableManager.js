import { DEFAULT_CAT_COLUMNS, INITIAL_STUDENTS, parseMarkInput, getRemarks } from './utils.js';

export class TableManager {
    constructor(app) {
        this.app = app;
    }

    // ----- Table lifecycle -----
    addNewTable() {
        const id = `table-${this.app.tableCounter++}`;
        const students = INITIAL_STUDENTS.map(name => ({
            name,
            exam: 0,
            catTotal: 0,
            total: 0,
            position: 0,
            catMarks: DEFAULT_CAT_COLUMNS.reduce((acc, cat) => { acc[cat.id] = 0; return acc; }, {})
        }));
        const table = {
            id,
            name: `Class ${this.app.tableCounter - 1}`,
            catColumns: JSON.parse(JSON.stringify(DEFAULT_CAT_COLUMNS)),
            students
        };
        this.app.tables.push(table);
        this.app.ui.updateUI();
        this.app.storage.saveToLocalStorage(); // triggers dirty flag
    }

    createTableFromNames(sourceId) {
        const source = this.app.tables.find(t => t.id === sourceId);
        if (!source) return;
        const id = `table-${this.app.tableCounter++}`;
        const students = source.students.map(s => ({
            name: s.name,
            exam: 0,
            catTotal: 0,
            total: 0,
            position: 0,
            catMarks: source.catColumns.reduce((acc, cat) => { acc[cat.id] = 0; return acc; }, {})
        }));
        const table = {
            id,
            name: `${source.name} (Copy)`,
            catColumns: JSON.parse(JSON.stringify(source.catColumns)),
            students
        };
        this.app.tables.push(table);
        this.app.ui.updateUI();
        this.app.storage.saveToLocalStorage();
    }

    deleteTable(id) {
        this.app.showConfirmation('Delete Table', 'Are you sure?', () => {
            this.app.tables = this.app.tables.filter(t => t.id !== id);
            this.app.ui.updateUI();
            this.app.storage.saveToLocalStorage();
        });
    }

    updateTableName(id, newName) {
        const t = this.app.tables.find(t => t.id === id);
        if (t) {
            t.name = newName || `Class ${this.app.tableCounter}`;
            this.app.storage.saveToLocalStorage();
        }
    }

    // ----- NEW: Reset all marks to 0 -----
    resetTableMarks(tableId) {
        const table = this.app.tables.find(t => t.id === tableId);
        if (!table) return;

        // Reset exam and all CAT marks to 0 for every student
        table.students.forEach(student => {
            student.exam = 0;
            table.catColumns.forEach(cat => {
                student.catMarks[cat.id] = 0;
            });
            this.recalculateStudentTotals(table, student);
        });

        // Update positions after reset
        this.updateTablePositions(tableId);

        // Refresh UI and save
        this.app.ui.updateUI();
        this.app.storage.saveToLocalStorage();
    }

    // ----- Student management -----
    addStudent(tableId) {
        const t = this.app.tables.find(t => t.id === tableId);
        if (!t) return;
        const student = {
            name: 'New Student',
            exam: 0,
            catTotal: 0,
            total: 0,
            position: 0,
            catMarks: t.catColumns.reduce((acc, cat) => { acc[cat.id] = 0; return acc; }, {})
        };
        t.students.push(student);
        this.updateTablePositions(tableId);
        this.app.ui.updateUI();
        this.app.storage.saveToLocalStorage();
    }

    deleteStudent(tableId, index) {
        this.app.showConfirmation('Delete Student', 'Are you sure?', () => {
            const t = this.app.tables.find(t => t.id === tableId);
            if (t && t.students[index]) {
                t.students.splice(index, 1);
                this.updateTablePositions(tableId);
                this.app.ui.updateUI();
                this.app.storage.saveToLocalStorage();
            }
        });
    }

    updateStudentName(tableId, index, newName) {
        const t = this.app.tables.find(t => t.id === tableId);
        if (t && t.students[index]) {
            t.students[index].name = newName || 'Unnamed';
            this.app.ui.updateUI();
            this.app.storage.saveToLocalStorage();
        }
    }

    updateStudentMark(tableId, index, markType, rawValue) {
        const t = this.app.tables.find(t => t.id === tableId);
        if (!t || !t.students[index]) return;
        const student = t.students[index];
        if (markType === 'exam') {
            student.exam = parseMarkInput(rawValue, 50);
        }
        this.recalculateStudentTotals(t, student);
        this.updateTablePositions(tableId);
        this.app.ui.updateUI();
        this.app.storage.saveToLocalStorage();
    }

    updateStudentCatMark(tableId, index, catId, rawValue) {
        const t = this.app.tables.find(t => t.id === tableId);
        if (!t || !t.students[index]) return;
        const cat = t.catColumns.find(c => c.id === catId);
        if (!cat) return;
        const student = t.students[index];
        student.catMarks[catId] = parseMarkInput(rawValue, cat.maxScore);
        this.recalculateStudentTotals(t, student);
        this.updateTablePositions(tableId);
        this.app.ui.updateUI();
        this.app.storage.saveToLocalStorage();
    }

    recalculateStudentTotals(table, student) {
        const catTotal = table.catColumns.reduce((sum, cat) => sum + (student.catMarks[cat.id] || 0), 0);
        student.catTotal = Math.min(catTotal, 50);
        student.total = student.catTotal + student.exam;
    }

    updateTablePositions(tableId) {
        const t = this.app.tables.find(t => t.id === tableId);
        if (!t) return;
        const sorted = [...t.students].sort((a, b) => b.total - a.total);
        let pos = 1, prevTotal = null;
        sorted.forEach((s, idx) => {
            if (prevTotal !== null && s.total === prevTotal) {
                s.position = pos;
            } else {
                pos = idx + 1;
                s.position = pos;
            }
            prevTotal = s.total;
        });
    }

    validateTableData(table) {
        if (!table.catColumns) table.catColumns = JSON.parse(JSON.stringify(DEFAULT_CAT_COLUMNS));
        if (!table.students) table.students = [];
        table.students.forEach(s => {
            if (!s.catMarks) {
                s.catMarks = {};
                table.catColumns.forEach(cat => s.catMarks[cat.id] = 0);
            }
            s.exam = Number(s.exam) || 0;
            s.catTotal = Number(s.catTotal) || 0;
            s.total = Number(s.total) || 0;
            this.recalculateStudentTotals(table, s);
        });
        this.updateTablePositions(table.id);
    }

    // ----- CAT column management -----
    addCatColumn(tableId, name, maxScore) {
        if (!name || maxScore <= 0) {
            alert('Valid name and max score required');
            return;
        }
        const t = this.app.tables.find(t => t.id === tableId);
        if (!t) return;
        if (t.catColumns.some(c => c.name === name)) {
            alert('Column with that name already exists');
            return;
        }
        const id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        t.catColumns.push({ id, name, maxScore: Number(maxScore) });
        t.students.forEach(s => s.catMarks[id] = 0);
        t.students.forEach(s => this.recalculateStudentTotals(t, s));
        this.updateTablePositions(tableId);
        this.app.ui.updateUI();
        this.app.storage.saveToLocalStorage();
    }

    editCatColumn(tableId, index) {
        const t = this.app.tables.find(t => t.id === tableId);
        if (!t || !t.catColumns[index]) return;
        const cat = t.catColumns[index];
        const newName = prompt('Enter new name:', cat.name);
        if (newName === null) return;
        const newMax = parseInt(prompt('Enter new max score:', cat.maxScore));
        if (isNaN(newMax) || newMax <= 0) {
            alert('Invalid max score');
            return;
        }
        const oldMax = cat.maxScore;
        cat.name = newName;
        cat.maxScore = newMax;
        if (newMax !== oldMax) {
            t.students.forEach(s => {
                if (s.catMarks[cat.id] > newMax) s.catMarks[cat.id] = newMax;
            });
        }
        t.students.forEach(s => this.recalculateStudentTotals(t, s));
        this.updateTablePositions(tableId);
        this.app.ui.updateUI();
        this.app.storage.saveToLocalStorage();
    }

    deleteCatColumn(tableId, index) {
        const t = this.app.tables.find(t => t.id === tableId);
        if (!t || !t.catColumns[index]) return;
        const cat = t.catColumns[index];
        this.app.showConfirmation('Delete CAT Column', `Delete "${cat.name}"?`, () => {
            t.catColumns.splice(index, 1);
            t.students.forEach(s => delete s.catMarks[cat.id]);
            t.students.forEach(s => this.recalculateStudentTotals(t, s));
            this.updateTablePositions(tableId);
            this.app.ui.updateUI();
            this.app.storage.saveToLocalStorage();
        });
    }
}