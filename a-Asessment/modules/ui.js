import { getRemarks } from './utils.js';

export class UIManager {
    constructor(app) {
        this.app = app;
        this.cacheElements();
    }

    cacheElements() {
        // Login elements
        this.loginScreen = document.getElementById('loginScreen');
        this.mainApp = document.getElementById('mainApp');
        this.loginForm = document.getElementById('loginForm');
        this.signupModal = document.getElementById('signupModal');
        this.resetPasswordModal = document.getElementById('resetPasswordModal');
        this.signupForm = document.getElementById('signupForm');
        this.resetPasswordForm = document.getElementById('resetPasswordForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.rememberMeCheckbox = document.getElementById('rememberMe');
        this.forgotPasswordLink = document.getElementById('forgotPassword');
        this.signupBtn = document.getElementById('signupBtn');
        this.guestBtn = document.getElementById('guestBtn');
        this.loginBtn = document.getElementById('loginBtn');
        this.cancelSignup = document.getElementById('cancelSignup');
        this.cancelReset = document.getElementById('cancelReset');
        this.sendResetBtn = document.getElementById('sendResetBtn');
        this.createAccountBtn = document.getElementById('createAccountBtn');

        // User info
        this.userAvatar = document.getElementById('userAvatar');
        this.userEmail = document.getElementById('userEmail');
        this.syncStatus = document.getElementById('syncStatus');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.userType = document.getElementById('userType');
        this.storageLocation = document.getElementById('storageLocation');

        // Cloud buttons
        this.cloudSyncBtn = document.getElementById('cloudSyncBtn');
        this.loadFromCloudBtn = document.getElementById('loadFromCloudBtn');
        this.logoutBtn = document.getElementById('logoutBtn');

        // Main app
        this.tablesContainer = document.getElementById('tablesContainer');
        this.emptyState = document.getElementById('emptyState');
        this.addTableBtn = document.getElementById('addTableBtn');
        this.initialAddTableBtn = document.getElementById('initialAddTable');
        this.importBtn = document.getElementById('importBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.statisticsBtn = document.getElementById('statisticsBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.clearDataBtn = document.getElementById('clearDataBtn');

        this.fileInput = document.getElementById('fileInput');
        this.saveStatus = document.getElementById('saveStatus');
        this.lastSaved = document.getElementById('lastSaved');
        this.firebaseStatus = document.getElementById('firebaseStatus');
        this.cloudStatusText = document.getElementById('cloudStatusText');

        // Modals
        this.statisticsModal = document.getElementById('statisticsModal');
        this.terminalReportModal = document.getElementById('terminalReportModal');
        this.helpModal = document.getElementById('helpModal');
        this.confirmModal = document.getElementById('confirmModal');
        this.statisticsContainer = document.getElementById('statisticsContainer');
        this.terminalReportContainer = document.getElementById('terminalReportContainer');
        this.helpContainer = document.getElementById('helpContainer');
        this.confirmTitle = document.getElementById('confirmTitle');
        this.confirmMessage = document.getElementById('confirmMessage');
        this.confirmOk = document.getElementById('confirmOk');
        this.confirmCancel = document.getElementById('confirmCancel');

        this.notificationToast = document.getElementById('notificationToast');
        this.toastMessage = document.getElementById('toastMessage');
        this.toastClose = document.querySelector('.toast-close');
    }

    // ----- Modal controls -----
    showModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    showConfirmation(title, message, callback) {
        this.confirmTitle.textContent = title;
        this.confirmMessage.textContent = message;
        this.app.confirmCallback = callback;
        this.showModal(this.confirmModal);
    }

    // ----- Notifications -----
    showToast(message, type = 'info') {
        this.toastMessage.textContent = message;
        this.notificationToast.className = `notification-toast show ${type}`;
        setTimeout(() => this.hideToast(), 5000);
    }

    hideToast() {
        this.notificationToast.classList.remove('show');
    }

    // ----- Loading state -----
    setLoadingState(element, isLoading) {
        if (isLoading) {
            element.classList.add('loading');
            element.disabled = true;
            element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${element.textContent}`;
        } else {
            element.classList.remove('loading');
            element.disabled = false;
            // restore icon based on id – simplified
            const icons = {
                loginBtn: '<i class="fas fa-sign-in-alt"></i> Sign In',
                createAccountBtn: '<i class="fas fa-user-plus"></i> Create Account',
                sendResetBtn: '<i class="fas fa-paper-plane"></i> Send Reset Link',
                cloudSyncBtn: '<i class="fas fa-cloud-upload-alt"></i> Sync to Cloud',
                loadFromCloudBtn: '<i class="fas fa-cloud-download-alt"></i> Load from Cloud'
            };
            if (icons[element.id]) element.innerHTML = icons[element.id];
        }
    }

    // ----- Status updates -----
    updateConnectionStatus(online) {
        if (online) {
            this.connectionStatus.innerHTML = '<i class="fas fa-wifi"></i> Online';
            this.connectionStatus.className = 'online';
            this.cloudSyncBtn.disabled = false;
            this.loadFromCloudBtn.disabled = this.app.isGuest;
        } else {
            this.connectionStatus.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
            this.connectionStatus.className = 'offline';
            this.cloudSyncBtn.disabled = true;
            this.loadFromCloudBtn.disabled = true;
        }
    }

    updateCloudStatus(isGuest, online) {
        if (isGuest) {
            this.cloudStatusText.textContent = 'Guest Mode';
            this.firebaseStatus.className = 'offline';
        } else if (online) {
            this.cloudStatusText.textContent = 'Connected';
            this.firebaseStatus.className = 'online';
        } else {
            this.cloudStatusText.textContent = 'Offline';
            this.firebaseStatus.className = 'offline';
        }
    }

    updateSyncStatus(status) {
        const statusMap = {
            syncing: 'Syncing...',
            synced: 'Synced',
            error: 'Sync Error',
            idle: 'Idle'
        };
        this.syncStatus.innerHTML = `<i class="fas fa-circle"></i> ${statusMap[status] || status}`;
        this.syncStatus.className = `sync-status ${status}`;
    }

    // ----- UI rendering -----
    updateUI() {
        if (this.app.tables.length === 0) {
            this.showEmptyState();
        } else {
            this.hideEmptyState();
            this.renderTables();
        }
    }

    showEmptyState() {
        this.emptyState.style.display = 'block';
    }

    hideEmptyState() {
        this.emptyState.style.display = 'none';
    }

    renderTables() {
        this.tablesContainer.innerHTML = '';
        this.app.tables.forEach(table => {
            const el = this.createTableElement(table);
            this.tablesContainer.appendChild(el);
        });
    }

    createTableElement(table) {
        const container = document.createElement('div');
        container.className = 'table-container';
        container.id = table.id;

        // Header
        container.appendChild(this.createTableHeader(table));

        // CAT config section
        container.appendChild(this.createCatConfigSection(table));

        // Table wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        const tbl = document.createElement('table');
        tbl.appendChild(this.createTableHeaderRow(table));
        tbl.appendChild(this.createTableBody(table));
        wrapper.appendChild(tbl);
        container.appendChild(wrapper);

        // Add student section
        container.appendChild(this.createAddStudentSection(table.id));

        return container;
    }

    createTableHeader(table) {
        const header = document.createElement('div');
        header.className = 'table-header';

        const title = document.createElement('div');
        title.className = 'table-title';
        title.contentEditable = true;
        title.textContent = table.name;
        title.addEventListener('blur', e => this.app.tableManager.updateTableName(table.id, e.target.textContent));
        title.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); title.blur(); } });

        const actions = document.createElement('div');
        actions.className = 'table-actions';
        actions.appendChild(this.createButton('btn-info', 'Print', '🖨️', () => this.app.printTable(table.id)));
        actions.appendChild(this.createButton('btn-secondary', 'Clone Names', '📝', () => this.app.tableManager.createTableFromNames(table.id)));
        actions.appendChild(this.createButton('btn-success', 'Edit Name', '✏️', () => { title.focus(); }));
        actions.appendChild(this.createButton('btn-danger', 'Delete', '🗑️', () => this.app.tableManager.deleteTable(table.id)));
        actions.appendChild(this.createButton('btn-warning', 'Reset Marks', '🔄', () => this.app.tableManager.resetTableMarks(table.id)));
        header.append(title, actions);
        return header;
    }

    createCatConfigSection(table) {
        const section = document.createElement('div');
        section.className = 'cat-config';

        const header = document.createElement('div');
        header.className = 'cat-config-header';
        header.innerHTML = '<div class="cat-config-title">CAT Columns Configuration</div>';
        const addBtn = this.createButton('btn-primary', 'Add CAT Column', '➕', () => this.showAddCatForm(table.id));
        header.appendChild(addBtn);
        section.appendChild(header);

        const list = document.createElement('div');
        list.className = 'cat-columns-list';
        table.catColumns.forEach((cat, idx) => {
            const item = document.createElement('div');
            item.className = 'cat-column-item';
            item.innerHTML = `
                <span class="cat-column-name">${cat.name}</span>
                <span class="cat-column-max">Max: ${cat.maxScore}</span>
                <div class="cat-column-actions">
                    <button class="btn btn-secondary" data-action="edit">✏️ Edit</button>
                    <button class="btn btn-danger" data-action="delete">🗑️ Delete</button>
                </div>
            `;
            item.querySelector('[data-action="edit"]').addEventListener('click', () => this.app.tableManager.editCatColumn(table.id, idx));
            item.querySelector('[data-action="delete"]').addEventListener('click', () => this.app.tableManager.deleteCatColumn(table.id, idx));
            list.appendChild(item);
        });
        section.appendChild(list);

        // hidden add form
        const form = document.createElement('div');
        form.className = 'add-cat-form';
        form.id = `add-cat-form-${table.id}`;
        form.style.display = 'none';
        form.innerHTML = `
            <input type="text" class="cat-name-input" placeholder="CAT Name">
            <input type="number" class="cat-max-input" placeholder="Max Score" min="1" value="10">
            <button class="btn btn-success" id="save-cat-${table.id}">💾 Save</button>
            <button class="btn btn-secondary" id="cancel-cat-${table.id}">❌ Cancel</button>
        `;
        form.querySelector(`#save-cat-${table.id}`).addEventListener('click', () => {
            const name = form.querySelector('.cat-name-input').value;
            const max = parseInt(form.querySelector('.cat-max-input').value);
            this.app.tableManager.addCatColumn(table.id, name, max);
            this.hideAddCatForm(table.id);
        });
        form.querySelector(`#cancel-cat-${table.id}`).addEventListener('click', () => this.hideAddCatForm(table.id));
        section.appendChild(form);
        return section;
    }

    showAddCatForm(tableId) {
        const form = document.getElementById(`add-cat-form-${tableId}`);
        if (form) {
            form.style.display = 'flex';
            form.querySelector('.cat-name-input').value = `CAT${this.app.tables.find(t => t.id === tableId)?.catColumns.length + 1 || 1}`;
            form.querySelector('.cat-name-input').focus();
        }
    }

    hideAddCatForm(tableId) {
        const form = document.getElementById(`add-cat-form-${tableId}`);
        if (form) {
            form.style.display = 'none';
            form.querySelector('.cat-name-input').value = '';
            form.querySelector('.cat-max-input').value = '10';
        }
    }

    createTableHeaderRow(table) {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        tr.appendChild(this.createTH('NAMES'));
        table.catColumns.forEach(cat => tr.appendChild(this.createTH(`${cat.name} Marks ${cat.maxScore}`)));
        tr.appendChild(this.createTH('CAT Totals 50'));
        tr.appendChild(this.createTH('EXAM Marks 50'));
        tr.appendChild(this.createTH('TOTAL CAT+EXAM Marks 100'));
        tr.appendChild(this.createTH('POSITION'));
        tr.appendChild(this.createTH('ACTIONS'));
        thead.appendChild(tr);
        return thead;
    }

    createTH(text) {
        const th = document.createElement('th');
        th.textContent = text;
        return th;
    }

    createTableBody(table) {
        const tbody = document.createElement('tbody');
        table.students.forEach((student, idx) => {
            const tr = document.createElement('tr');

            // Name cell
            tr.appendChild(this.createEditableCell(student.name, val => this.app.tableManager.updateStudentName(table.id, idx, val)));

            // CAT marks
            table.catColumns.forEach(cat => {
                tr.appendChild(this.createEditableCell(student.catMarks[cat.id] || 0, val => this.app.tableManager.updateStudentCatMark(table.id, idx, cat.id, val)));
            });

            // CAT Total (static)
            tr.appendChild(this.createStaticCell(student.catTotal));

            // EXAM cell
            tr.appendChild(this.createEditableCell(student.exam, val => this.app.tableManager.updateStudentMark(table.id, idx, 'exam', val)));

            // TOTAL (static)
            tr.appendChild(this.createStaticCell(student.total));

            // Position (static)
            const posCell = document.createElement('td');
            posCell.className = 'position-cell';
            posCell.textContent = student.position;
            tr.appendChild(posCell);

            // Actions
            const actionCell = document.createElement('td');
            const delBtn = this.createButton('btn-danger', 'Delete', '🗑️', () => this.app.tableManager.deleteStudent(table.id, idx));
            actionCell.appendChild(delBtn);
            tr.appendChild(actionCell);

            tbody.appendChild(tr);
        });
        return tbody;
    }

    createEditableCell(value, onBlur) {
        const td = document.createElement('td');
        const span = document.createElement('span');
        span.className = 'editable';
        span.contentEditable = true;
        span.textContent = value;
        span.addEventListener('blur', e => onBlur(e.target.textContent));
        span.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); span.blur(); } });
        td.appendChild(span);
        return td;
    }

    createStaticCell(value) {
        const td = document.createElement('td');
        td.textContent = value;
        return td;
    }

    createButton(className, title, icon, onClick) {
        const btn = document.createElement('button');
        btn.className = `btn ${className}`;
        btn.innerHTML = `${icon} ${title}`;
        btn.addEventListener('click', onClick);
        return btn;
    }

    createAddStudentSection(tableId) {
        const div = document.createElement('div');
        div.style.padding = '15px 20px';
        div.style.borderTop = '1px solid var(--border)';
        div.style.textAlign = 'center';
        const btn = this.createButton('btn-primary', 'Add Student', '➕', () => this.app.tableManager.addStudent(tableId));
        div.appendChild(btn);
        return div;
    }

    // ----- Statistics and reports -----
    showStatistics() {
        if (this.app.tables.length === 0) {
            this.showToast('No tables yet', 'warning');
            return;
        }
        this.renderStatistics();
        this.showModal(this.statisticsModal);
    }

    renderStatistics() {
        const allNames = [...new Set(this.app.tables.flatMap(t => t.students.map(s => s.name)))].sort();
        const data = allNames.map(name => {
            const totals = this.app.tables.map(t => {
                const s = t.students.find(st => st.name === name);
                return s ? s.total : 0;
            });
            const overall = totals.reduce((a, b) => a + b, 0);
            return { name, totals, overall };
        });
        data.sort((a, b) => b.overall - a.overall);
        let pos = 1, prev = null;
        data.forEach((d, i) => {
            if (prev !== null && d.overall === prev) {
                d.position = pos;
            } else {
                pos = i + 1;
                d.position = pos;
            }
            prev = d.overall;
        });

        let html = '<table><tr><th>NAMES</th>';
        this.app.tables.forEach(t => html += `<th>${t.name}</th>`);
        html += '<th>TOTALS</th><th>POSITION</th></tr>';

        data.forEach(d => {
            html += '<tr>';
            html += `<td><span class="clickable-name" data-name="${d.name}">${d.name}</span></td>`;
            d.totals.forEach(t => html += `<td>${t}</td>`);
            html += `<td>${d.overall}</td><td>${d.position}</td></tr>`;
        });
        html += '</table>';

        this.statisticsContainer.innerHTML = html;
        this.statisticsContainer.querySelectorAll('.clickable-name').forEach(el => {
            el.addEventListener('click', () => this.showTerminalReport(el.dataset.name));
        });
    }

    showTerminalReport(studentName) {
        this.closeModal(this.statisticsModal);
        this.renderTerminalReport(studentName);
        this.showModal(this.terminalReportModal);
    }

    renderTerminalReport(studentName) {
        let grandTotal = 0, totalPossible = 0;
        let rows = '';

        this.app.tables.forEach(table => {
            const student = table.students.find(s => s.name === studentName);
            if (student) {
                const remarks = getRemarks(student.total, 100);
                rows += `
                    <tr>
                        <td>${table.name}</td>
                        <td>${student.catTotal}</td>
                        <td>${student.exam}</td>
                        <td>${student.total}</td>
                        <td class="remarks-cell ${remarks.class}">${remarks.text}</td>
                    </tr>
                `;
                grandTotal += student.total;
                totalPossible += 100;
            }
        });

        const overallRemarks = getRemarks(grandTotal, totalPossible || 1);
        const reportHTML = `
            <div class="terminal-report">
                <div style="text-align:center; margin-bottom:20px;">
                    <h2>Terminal Report: ${studentName}</h2>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
                <table>
                    <thead><tr><th>SUBJECT</th><th>CAT TOTAL</th><th>EXAM</th><th>SUBJECT TOTAL</th><th>REMARKS</th></tr></thead>
                    <tbody>
                        ${rows}
                        <tr style="font-weight:bold; background:#f1f5fd;">
                            <td colspan="3">GRAND TOTAL</td>
                            <td>${grandTotal}</td>
                            <td class="remarks-cell ${overallRemarks.class}">${overallRemarks.text}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="comments-section">
                    <h3>Teacher Comments:</h3>
                    <textarea class="comments-textarea" placeholder="Enter comments..."></textarea>
                </div>
                <div class="terminal-report-actions">
                    <button class="btn btn-info" id="print-report">🖨️ Print Report</button>
                    <button class="btn btn-secondary close-report">❌ Close</button>
                </div>
            </div>
        `;
        this.terminalReportContainer.innerHTML = reportHTML;
        this.terminalReportContainer.querySelector('#print-report').addEventListener('click', () => {
            const comments = this.terminalReportContainer.querySelector('.comments-textarea').value;
            this.app.printTerminalReport(studentName, comments);
        });
        this.terminalReportContainer.querySelector('.close-report').addEventListener('click', () => this.closeModal(this.terminalReportModal));
    }
}