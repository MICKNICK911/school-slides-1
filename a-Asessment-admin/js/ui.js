// UI Manager Class
class UIManager {
    constructor() {
        this.currentDataset = null;
        this.initEventListeners();
    }

    // Initialize event listeners
    initEventListeners() {
        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.style.display = 'none';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+S or Cmd+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.manualSave();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });

        // Auto-save on beforeunload
        window.addEventListener('beforeunload', () => {
            if (window.app) {
                window.app.saveCurrentState();
            }
        });
    }

    // Close all modals
    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Manual save
    manualSave() {
        if (window.app) {
            window.app.saveCurrentState();
            showToast('success', 'Saved', 'Data saved successfully');
        }
    }

    // Render tables
    renderTables(dataset) {
        this.currentDataset = dataset;
        const container = document.getElementById('tablesContainer');
        if (!container) return;
        
        if (!dataset || !dataset.tables || dataset.tables.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        container.innerHTML = ''; // Clear container before rendering tables
        
        dataset.tables.forEach(tableData => {
            const tableElement = this.createTableElement(tableData);
            container.appendChild(tableElement);
        });
    }

    // Show empty state
    showEmptyState() {
        const container = document.getElementById('tablesContainer');
        if (!container) return;
        
        // Remove any existing content (except emptyState itself)
        Array.from(container.children).forEach(child => {
            if (child.id !== 'emptyState') {
                child.remove();
            }
        });
        
        let emptyState = document.getElementById('emptyState');
        if (!emptyState) {
            // Create empty state if missing (e.g., after container.innerHTML = '')
            emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.id = 'emptyState';
            emptyState.innerHTML = `
                <i class="fas fa-database" style="font-size: 48px; color: var(--gray); margin-bottom: 20px;"></i>
                <p>No tables created yet. Click "Add New Table" to get started.</p>
                <button id="initialAddTable" class="btn-primary">
                    <i class="fas fa-plus-circle"></i> Create First Table
                </button>
            `;
            container.appendChild(emptyState);
            
            // Attach event listener to the new button
            document.getElementById('initialAddTable').addEventListener('click', () => {
                if (window.app) window.app.addNewTable();
            });
        } else {
            emptyState.style.display = 'block';
        }
    }

    // Hide empty state
    hideEmptyState() {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    // Create table element
    createTableElement(tableData) {
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        tableContainer.id = tableData.id;
        
        // Table header
        tableContainer.appendChild(this.createTableHeader(tableData));
        
        // CAT Configuration
        tableContainer.appendChild(this.createCatConfig(tableData));
        
        // Table
        tableContainer.appendChild(this.createTable(tableData));
        
        // Add student button
        tableContainer.appendChild(this.createAddStudentRow(tableData.id));
        
        return tableContainer;
    }

    // Create table header
    createTableHeader(tableData) {
        const header = document.createElement('div');
        header.className = 'table-header';
        
        const title = document.createElement('div');
        title.className = 'table-title';
        title.setAttribute('contenteditable', 'true');
        title.textContent = tableData.name;
        title.addEventListener('blur', (e) => {
            if (window.app) {
                window.app.updateTableName(tableData.id, e.target.textContent);
            }
        });
        
        const actions = document.createElement('div');
        actions.className = 'table-actions';
        
        actions.appendChild(this.createActionButton('🖨️', 'Print', 'btn-info', () => {
            window.app.printTable(tableData.id);
        }));
        
        actions.appendChild(this.createActionButton('📝', 'Clone Names', 'btn-secondary', () => {
            window.app.createTableFromNames(tableData.id);
        }));
        
        actions.appendChild(this.createActionButton('✏️', 'Edit Name', 'btn-success', () => {
            title.focus();
        }));
        
        actions.appendChild(this.createActionButton('🗑️', 'Delete', 'btn-danger', () => {
            window.app.deleteTable(tableData.id);
        }));
        
        header.appendChild(title);
        header.appendChild(actions);
        
        return header;
    }

    // Create action button
    createActionButton(icon, tooltip, className, onClick) {
        const btn = document.createElement('button');
        btn.className = className;
        btn.innerHTML = icon;
        btn.title = tooltip;
        btn.addEventListener('click', onClick);
        return btn;
    }

    // Create CAT configuration
    createCatConfig(tableData) {
        const section = document.createElement('div');
        section.className = 'cat-config';
        
        const header = document.createElement('div');
        header.className = 'cat-config-header';
        
        const title = document.createElement('div');
        title.className = 'cat-config-title';
        title.innerHTML = '<i class="fas fa-cog"></i> CAT Columns Configuration';
        
        const addBtn = document.createElement('button');
        addBtn.className = 'btn-primary';
        addBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add CAT Column';
        addBtn.addEventListener('click', () => this.showAddCatForm(tableData.id));
        
        header.appendChild(title);
        header.appendChild(addBtn);
        
        const columnsList = document.createElement('div');
        columnsList.className = 'cat-columns-list';
        
        tableData.catColumns.forEach((catColumn, index) => {
            columnsList.appendChild(this.createCatColumnItem(tableData.id, catColumn, index));
        });
        
        const addForm = document.createElement('div');
        addForm.className = 'add-cat-form';
        addForm.id = `add-cat-form-${tableData.id}`;
        addForm.style.display = 'none';
        
        addForm.innerHTML = `
            <input type="text" class="cat-name-input" placeholder="CAT Name (e.g., CAT4)">
            <input type="number" class="cat-max-input" placeholder="Max Score" min="1" value="10">
            <button class="btn-success"><i class="fas fa-save"></i> Save</button>
            <button class="btn-secondary"><i class="fas fa-times"></i> Cancel</button>
        `;
        
        const saveBtn = addForm.querySelector('.btn-success');
        const cancelBtn = addForm.querySelector('.btn-secondary');
        
        saveBtn.addEventListener('click', () => {
            const nameInput = addForm.querySelector('.cat-name-input');
            const maxInput = addForm.querySelector('.cat-max-input');
            window.app.addCatColumn(tableData.id, nameInput.value, parseInt(maxInput.value));
            this.hideAddCatForm(tableData.id);
        });
        
        cancelBtn.addEventListener('click', () => this.hideAddCatForm(tableData.id));
        
        section.appendChild(header);
        section.appendChild(columnsList);
        section.appendChild(addForm);
        
        return section;
    }

    // Create CAT column item
    createCatColumnItem(tableId, catColumn, index) {
        const item = document.createElement('div');
        item.className = 'cat-column-item';
        
        item.innerHTML = `
            <span class="cat-column-name">${catColumn.name}</span>
            <span class="cat-column-max">Max: ${catColumn.maxScore}</span>
            <div class="cat-column-actions">
                <button class="btn-secondary" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-danger" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        
        const editBtn = item.querySelector('.btn-secondary');
        const deleteBtn = item.querySelector('.btn-danger');
        
        editBtn.addEventListener('click', () => window.app.editCatColumn(tableId, index));
        deleteBtn.addEventListener('click', () => window.app.deleteCatColumn(tableId, index));
        
        return item;
    }

    // Show add CAT form
    showAddCatForm(tableId) {
        const form = document.getElementById(`add-cat-form-${tableId}`);
        if (form) {
            form.style.display = 'flex';
            form.querySelector('.cat-name-input').focus();
        }
    }

    // Hide add CAT form
    hideAddCatForm(tableId) {
        const form = document.getElementById(`add-cat-form-${tableId}`);
        if (form) {
            form.style.display = 'none';
            form.querySelector('.cat-name-input').value = '';
            form.querySelector('.cat-max-input').value = '10';
        }
    }

    // Create table
    createTable(tableData) {
        const table = document.createElement('table');
        
        // Header
        table.appendChild(this.createTableHeaderRow(tableData));
        
        // Body
        const tbody = document.createElement('tbody');
        
        tableData.students.forEach((student, index) => {
            tbody.appendChild(this.createStudentRow(tableData, student, index));
        });
        
        table.appendChild(tbody);
        
        return table;
    }

    // Create table header row
    createTableHeaderRow(tableData) {
        const thead = document.createElement('thead');
        const row = document.createElement('tr');
        
        // Name header
        row.appendChild(this.createHeaderCell('NAMES'));
        
        // CAT headers
        tableData.catColumns.forEach(cat => {
            row.appendChild(this.createHeaderCell(`${cat.name} (${cat.maxScore})`));
        });
        
        // Other headers
        row.appendChild(this.createHeaderCell('CAT Total (50)'));
        row.appendChild(this.createHeaderCell('EXAM (50)'));
        row.appendChild(this.createHeaderCell('TOTAL (100)'));
        row.appendChild(this.createHeaderCell('POSITION'));
        row.appendChild(this.createHeaderCell('ACTIONS'));
        
        thead.appendChild(row);
        return thead;
    }

    // Create header cell
    createHeaderCell(text) {
        const th = document.createElement('th');
        th.textContent = text;
        return th;
    }

    // Create student row
    createStudentRow(tableData, student, index) {
        const row = document.createElement('tr');
        
        // Name cell
        row.appendChild(this.createEditableCell(student.name, (value) => {
            window.app.updateStudentName(tableData.id, index, value);
        }));
        
        // CAT cells
        tableData.catColumns.forEach(cat => {
            row.appendChild(this.createEditableCell(
                student.catMarks[cat.id] || 0,
                (value) => {
                    const converted = parseMarkInput(value, cat.maxScore);
                    window.app.updateStudentCatMark(tableData.id, index, cat.id, converted);
                }
            ));
        });
        
        // CAT Total cell
        row.appendChild(this.createStaticCell(student.catTotal));
        
        // EXAM cell
        row.appendChild(this.createEditableCell(student.exam, (value) => {
            const converted = parseMarkInput(value, 50);
            window.app.updateStudentMark(tableData.id, index, 'exam', converted);
        }));
        
        // TOTAL cell
        row.appendChild(this.createStaticCell(student.total));
        
        // POSITION cell
        const positionCell = document.createElement('td');
        positionCell.className = 'position-cell';
        positionCell.textContent = student.position;
        row.appendChild(positionCell);
        
        // Actions cell
        const actionsCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-danger';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = 'Delete Student';
        deleteBtn.addEventListener('click', () => window.app.deleteStudent(tableData.id, index));
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);
        
        return row;
    }

    // Create editable cell
    createEditableCell(value, onChange) {
        const cell = document.createElement('td');
        const span = document.createElement('span');
        span.className = 'editable';
        span.setAttribute('contenteditable', 'true');
        span.textContent = value;
        
        span.addEventListener('blur', (e) => {
            onChange(e.target.textContent);
        });
        
        span.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                span.blur();
            }
        });
        
        cell.appendChild(span);
        return cell;
    }

    // Create static cell
    createStaticCell(value) {
        const cell = document.createElement('td');
        cell.textContent = value;
        return cell;
    }

    // Create add student row
    createAddStudentRow(tableId) {
        const div = document.createElement('div');
        div.style.padding = '15px 20px';
        div.style.borderTop = '1px solid var(--border)';
        div.style.textAlign = 'center';
        
        const btn = document.createElement('button');
        btn.className = 'btn-primary';
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Add Student';
        btn.addEventListener('click', () => window.app.addStudent(tableId));
        
        div.appendChild(btn);
        return div;
    }

    // Render statistics
    renderStatistics(dataset) {
        const container = document.getElementById('statisticsContainer');
        container.innerHTML = '';
        
        if (!dataset || !dataset.tables || dataset.tables.length === 0) {
            container.innerHTML = '<p style="text-align: center;">No data available for statistics.</p>';
            return;
        }
        
        // Get all unique student names
        const allNames = [...new Set(
            dataset.tables.flatMap(table => table.students.map(s => s.name))
        )].sort();
        
        // Create statistics data
        const stats = allNames.map(name => {
            const studentData = { name, totals: [] };
            dataset.tables.forEach(table => {
                const student = table.students.find(s => s.name === name);
                studentData.totals.push(student ? student.total : 0);
            });
            studentData.overallTotal = studentData.totals.reduce((a, b) => a + b, 0);
            return studentData;
        }).sort((a, b) => b.overallTotal - a.overallTotal);
        
        // Assign positions
        let position = 1;
        let prevTotal = null;
        stats.forEach((student, index) => {
            if (prevTotal !== null && student.overallTotal === prevTotal) {
                student.position = position;
            } else {
                position = index + 1;
                student.position = position;
            }
            prevTotal = student.overallTotal;
        });
        
        // Create table
        const table = document.createElement('table');
        table.style.width = '100%';
        
        // Header
        const headerRow = document.createElement('tr');
        headerRow.appendChild(this.createHeaderCell('NAMES'));
        dataset.tables.forEach(table => {
            headerRow.appendChild(this.createHeaderCell(table.name));
        });
        headerRow.appendChild(this.createHeaderCell('TOTAL'));
        headerRow.appendChild(this.createHeaderCell('POSITION'));
        table.appendChild(headerRow);
        
        // Data rows
        stats.forEach(student => {
            const row = document.createElement('tr');
            
            // Name cell (clickable)
            const nameCell = document.createElement('td');
            const nameSpan = document.createElement('span');
            nameSpan.textContent = student.name;
            nameSpan.className = 'clickable-name';
            nameSpan.addEventListener('click', () => {
                document.getElementById('statisticsModal').style.display = 'none';
                this.renderTerminalReport(dataset, student.name);
            });
            nameCell.appendChild(nameSpan);
            row.appendChild(nameCell);
            
            // Table scores
            student.totals.forEach(total => {
                const cell = document.createElement('td');
                cell.textContent = total;
                row.appendChild(cell);
            });
            
            // Overall total
            const totalCell = document.createElement('td');
            totalCell.textContent = student.overallTotal;
            row.appendChild(totalCell);
            
            // Position
            const posCell = document.createElement('td');
            posCell.textContent = student.position;
            row.appendChild(posCell);
            
            table.appendChild(row);
        });
        
        container.appendChild(table);
    }

    // Render terminal report
    renderTerminalReport(dataset, studentName) {
        const container = document.getElementById('terminalReportContainer');
        container.innerHTML = '';
        
        const reportDiv = document.createElement('div');
        reportDiv.className = 'terminal-report';
        
        // Header
        const header = document.createElement('div');
        header.style.textAlign = 'center';
        header.style.marginBottom = '20px';
        header.style.paddingBottom = '15px';
        header.style.borderBottom = '2px solid var(--primary)';
        
        header.innerHTML = `
            <h2 style="color: var(--primary);">
                <i class="fas fa-file-alt"></i> Terminal Report: ${studentName}
            </h2>
            <p style="color: var(--gray);">
                <i class="far fa-calendar-alt"></i> Generated on: ${formatDate()}
            </p>
        `;
        reportDiv.appendChild(header);
        
        // Results table
        const table = document.createElement('table');
        
        // Header row
        const headerRow = document.createElement('tr');
        ['SUBJECT', 'CAT TOTAL', 'EXAM', 'SUBJECT TOTAL', 'REMARKS'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        
        let grandTotal = 0;
        let subjectCount = 0;
        
        // Subject rows
        dataset.tables.forEach(tableData => {
            const student = tableData.students.find(s => s.name === studentName);
            if (student) {
                const remarks = getRemarks(student.total, 100);
                
                const row = document.createElement('tr');
                
                // Subject
                const subjectCell = document.createElement('td');
                subjectCell.textContent = tableData.name;
                row.appendChild(subjectCell);
                
                // CAT Total
                const catCell = document.createElement('td');
                catCell.textContent = student.catTotal;
                row.appendChild(catCell);
                
                // Exam
                const examCell = document.createElement('td');
                examCell.textContent = student.exam;
                row.appendChild(examCell);
                
                // Subject Total
                const totalCell = document.createElement('td');
                totalCell.textContent = student.total;
                row.appendChild(totalCell);
                
                // Remarks
                const remarksCell = document.createElement('td');
                remarksCell.className = `remarks-cell ${remarks.class}`;
                remarksCell.textContent = remarks.text;
                row.appendChild(remarksCell);
                
                table.appendChild(row);
                
                grandTotal += student.total;
                subjectCount++;
            }
        });
        
        // Grand total row
        const overallRemarks = getRemarks(grandTotal, subjectCount * 100);
        const grandRow = document.createElement('tr');
        grandRow.style.fontWeight = 'bold';
        grandRow.style.backgroundColor = '#f1f5fd';
        
        const grandLabel = document.createElement('td');
        grandLabel.textContent = 'GRAND TOTAL';
        grandLabel.colSpan = 3;
        grandRow.appendChild(grandLabel);
        
        const grandTotalCell = document.createElement('td');
        grandTotalCell.textContent = grandTotal;
        grandRow.appendChild(grandTotalCell);
        
        const overallRemarksCell = document.createElement('td');
        overallRemarksCell.className = `remarks-cell ${overallRemarks.class}`;
        overallRemarksCell.textContent = overallRemarks.text;
        grandRow.appendChild(overallRemarksCell);
        
        table.appendChild(grandRow);
        reportDiv.appendChild(table);
        
        // Comments section
        const commentsSection = document.createElement('div');
        commentsSection.className = 'comments-section';
        commentsSection.innerHTML = `
            <h3><i class="fas fa-comment"></i> Teacher Comments:</h3>
            <textarea class="comments-textarea" placeholder="Enter teacher comments here..."></textarea>
        `;
        reportDiv.appendChild(commentsSection);
        
        // Action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'terminal-report-actions';
        
        const printBtn = document.createElement('button');
        printBtn.className = 'btn-info';
        printBtn.innerHTML = '<i class="fas fa-print"></i> Print Report';
        printBtn.addEventListener('click', () => {
            const comments = commentsSection.querySelector('textarea').value;
            this.printTerminalReport(studentName, dataset, comments);
        });
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn-secondary';
        closeBtn.innerHTML = '<i class="fas fa-times"></i> Close';
        closeBtn.addEventListener('click', () => {
            document.getElementById('terminalReportModal').style.display = 'none';
        });
        
        actionsDiv.appendChild(printBtn);
        actionsDiv.appendChild(closeBtn);
        reportDiv.appendChild(actionsDiv);
        
        container.appendChild(reportDiv);
        document.getElementById('terminalReportModal').style.display = 'flex';
    }

    // Print terminal report
    printTerminalReport(studentName, dataset, comments) {
        const printWindow = window.open('', '_blank');
        
        let subjectRows = '';
        let grandTotal = 0;
        let subjectCount = 0;
        
        dataset.tables.forEach(tableData => {
            const student = tableData.students.find(s => s.name === studentName);
            if (student) {
                const remarks = getRemarks(student.total, 100);
                subjectRows += `
                    <tr>
                        <td>${tableData.name}</td>
                        <td>${student.catTotal}</td>
                        <td>${student.exam}</td>
                        <td>${student.total}</td>
                        <td class="remarks-cell ${remarks.class}">${remarks.text}</td>
                    </tr>
                `;
                grandTotal += student.total;
                subjectCount++;
            }
        });
        
        const overallRemarks = getRemarks(grandTotal, subjectCount * 100);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Terminal Report - ${studentName}</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .print-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px; }
                    .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px 10px; text-align: center; }
                    .print-table th { background-color: #f5f5f5; font-weight: bold; }
                    .print-table .remarks-cell { font-weight: bold; }
                    .remarks-excellent { color: #28a745; }
                    .remarks-very-good { color: #20c997; }
                    .remarks-good { color: #17a2b8; }
                    .remarks-pass { color: #ffc107; }
                    .remarks-fail { color: #dc3545; }
                    .comments-section { margin-top: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
                    @page { size: A4 portrait; margin: 0.5cm; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1><i class="fas fa-file-alt"></i> Terminal Report</h1>
                    <h2>${studentName}</h2>
                    <p>Generated on: ${formatDate()}</p>
                </div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>SUBJECT</th>
                            <th>CAT TOTAL</th>
                            <th>EXAM</th>
                            <th>SUBJECT TOTAL</th>
                            <th>REMARKS</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subjectRows}
                        <tr style="font-weight: bold; background-color: #f1f5fd;">
                            <td colspan="3">GRAND TOTAL</td>
                            <td>${grandTotal}</td>
                            <td class="remarks-cell ${overallRemarks.class}">${overallRemarks.text}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="comments-section">
                    <h3><i class="fas fa-comment"></i> Teacher Comments:</h3>
                    <p>${comments || 'No comments provided.'}</p>
                </div>
                <div style="margin-top: 20px; font-size: 12px; text-align: center;">
                    School Stamp & Signature: _________________________
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.onload = () => printWindow.print();
    }

    // Print table
    printTable(tableData) {
        const printWindow = window.open('', '_blank');
        
        let catHeaders = '';
        tableData.catColumns.forEach(cat => {
            catHeaders += `<th>${cat.name} (${cat.maxScore})</th>`;
        });
        
        let studentRows = '';
        tableData.students.forEach(student => {
            let catCells = '';
            tableData.catColumns.forEach(cat => {
                catCells += `<td>${student.catMarks[cat.id] || 0}</td>`;
            });
            
            studentRows += `
                <tr>
                    <td>${student.name}</td>
                    ${catCells}
                    <td>${student.catTotal}</td>
                    <td>${student.exam}</td>
                    <td>${student.total}</td>
                    <td>${student.position}</td>
                </tr>
            `;
        });
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${tableData.name} - Results</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .print-table { width: 100%; border-collapse: collapse; font-size: 14px; }
                    .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px 10px; text-align: center; }
                    .print-table th { background-color: #f5f5f5; font-weight: bold; }
                    @page { size: A4 portrait; margin: 0.5cm; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>${tableData.name}</h1>
                    <p>Student Results Summary</p>
                </div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>NAMES</th>
                            ${catHeaders}
                            <th>CAT TOTAL (50)</th>
                            <th>EXAM (50)</th>
                            <th>TOTAL (100)</th>
                            <th>POSITION</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentRows}
                    </tbody>
                </table>
                <div style="margin-top: 20px; font-size: 12px; text-align: center;">
                    Generated on: ${formatDate()}
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.onload = () => printWindow.print();
    }

    // Render bulk list
    renderBulkList(datasets, currentId) {
        const container = document.getElementById('bulkListContainer');
        container.innerHTML = '';
        
        if (!datasets || datasets.length === 0) {
            container.innerHTML = '<p style="text-align: center;">No datasets available.</p>';
            return;
        }
        
        datasets.forEach(dataset => {
            const item = document.createElement('div');
            item.className = `bulk-list-item ${dataset.id === currentId ? 'active' : ''}`;
            
            const info = document.createElement('div');
            info.className = 'bulk-list-item-info';
            
            const name = document.createElement('div');
            name.className = 'bulk-list-item-name';
            name.innerHTML = `<i class="fas fa-database"></i> ${dataset.name}`;
            
            const details = document.createElement('div');
            details.className = 'bulk-list-item-details';
            const studentCount = dataset.tables.reduce((sum, t) => sum + t.students.length, 0);
            details.textContent = `${dataset.tables.length} table(s), ${studentCount} student(s)`;
            
            info.appendChild(name);
            info.appendChild(details);
            
            const actions = document.createElement('div');
            actions.className = 'bulk-list-item-actions';
            
            const switchBtn = document.createElement('button');
            switchBtn.className = 'btn-primary';
            switchBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Switch';
            switchBtn.addEventListener('click', () => {
                if (window.app) {
                    window.app.switchDataset(dataset.id);
                }
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-danger';
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.app) {
                    window.app.deleteDataset(dataset.id);
                }
            });
            
            actions.appendChild(switchBtn);
            actions.appendChild(deleteBtn);
            
            item.appendChild(info);
            item.appendChild(actions);
            
            item.addEventListener('click', () => {
                if (window.app) {
                    window.app.switchDataset(dataset.id);
                }
            });
            
            container.appendChild(item);
        });
    }

    // Render help content
    renderHelpContent() {
        const container = document.getElementById('helpContainer');
        
        container.innerHTML = `
            <div class="help-section">
                <h3><i class="fas fa-rocket"></i> Getting Started</h3>
                <p>Welcome to Student Results Manager Pro! This application helps teachers manage student grades efficiently with cloud sync and multi-dataset support.</p>
                
                <div class="feature-grid">
                    <div class="feature-card">
                        <h4><i class="fas fa-table"></i> Tables</h4>
                        <p>Create multiple tables for different classes or subjects. Each table has customizable CAT columns.</p>
                    </div>
                    <div class="feature-card">
                        <h4><i class="fas fa-database"></i> Datasets</h4>
                        <p>Organize your data into separate datasets. Perfect for different terms, years, or class levels.</p>
                    </div>
                    <div class="feature-card">
                        <h4><i class="fas fa-cloud-upload-alt"></i> Cloud Sync</h4>
                        <p>Your data automatically syncs to Firebase when you're signed in. Access your data from anywhere!</p>
                    </div>
                    <div class="feature-card">
                        <h4><i class="fas fa-chart-line"></i> Statistics</h4>
                        <p>View comprehensive statistics across all tables and generate detailed terminal reports.</p>
                    </div>
                </div>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-pen"></i> Mark Entry</h3>
                <p>You can enter marks in multiple formats:</p>
                <ul>
                    <li><strong>Fractions:</strong> "45/50" → converts to equivalent score</li>
                    <li><strong>Percentages:</strong> "90%" → converts to 90% of maximum</li>
                    <li><strong>Direct numbers:</strong> "14" → uses the number directly</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-cog"></i> CAT Columns</h3>
                <p>Customize assessment columns for each table:</p>
                <ul>
                    <li>Add, edit, or delete CAT columns as needed</li>
                    <li>Set custom maximum scores for each column</li>
                    <li>CAT totals automatically cap at 50</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-chart-bar"></i> Grading Scale</h3>
                <ul>
                    <li><span class="remarks-excellent">Distinction:</span> 90% and above</li>
                    <li><span class="remarks-excellent">Excellent:</span> 80% - 89%</li>
                    <li><span class="remarks-very-good">Very Good:</span> 70% - 79%</li>
                    <li><span class="remarks-good">Good:</span> 60% - 69%</li>
                    <li><span class="remarks-pass">Pass:</span> 50% - 59%</li>
                    <li><span class="remarks-fail">Fail:</span> Below 50%</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h3>
                <ul>
                    <li><strong>Ctrl+S / Cmd+S:</strong> Manual save</li>
                    <li><strong>Escape:</strong> Close any open modal</li>
                    <li><strong>Enter:</strong> Confirm edit in cell (when editing)</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-print"></i> Printing</h3>
                <ul>
                    <li>Print individual tables using the print button on each table</li>
                    <li>Generate professional terminal reports from the statistics view</li>
                    <li>All printouts are optimized for A4 paper</li>
                </ul>
            </div>

            <div class="help-section" style="text-align: center;">
                <h3><i class="fas fa-star"></i> Pro Tips</h3>
                <p>✓ Use datasets to organize by term or year<br>
                   ✓ Regular backups ensure your data is safe<br>
                   ✓ Sign in to sync data across devices<br>
                   ✓ Use the bulk import for multiple datasets at once</p>
            </div>
        `;
    }

    // Show import summary
    showImportSummary(summary) {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'import-summary';
        
        summaryDiv.innerHTML = `
            <h4><i class="fas fa-check-circle"></i> Import Successful</h4>
            <ul>
                <li>Tables added: ${summary.tablesAdded || 0}</li>
                <li>Tables updated: ${summary.tablesUpdated || 0}</li>
                <li>Students added: ${summary.studentsAdded || 0}</li>
                <li>Students updated: ${summary.studentsUpdated || 0}</li>
            </ul>
        `;
        
        const container = document.getElementById('tablesContainer');
        container.insertBefore(summaryDiv, container.firstChild);
        
        setTimeout(() => {
            if (summaryDiv.parentNode) {
                summaryDiv.remove();
            }
        }, 5000);
    }
}

// Create global UI instance
const ui = new UIManager();