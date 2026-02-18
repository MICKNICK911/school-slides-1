import { auth, db } from './modules/firebase.js';
import { AuthManager } from './modules/auth.js';
import { StorageManager } from './modules/storage.js';
import { TableManager } from './modules/tableManager.js';
import { UIManager } from './modules/ui.js';
import { VERSION } from './modules/utils.js';

class StudentResultsManager {
    constructor() {
        this.tables = [];
        this.tableCounter = 1;
        this.currentUser = null;
        this.isGuest = true;
        this.isOnline = navigator.onLine;
        this.confirmCallback = null;

        // Initialize sub‑managers
        this.ui = new UIManager(this);
        this.authManager = new AuthManager(this);
        this.storage = new StorageManager(this);
        this.tableManager = new TableManager(this);

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNetworkListener();
        this.setCurrentYear();
        this.checkRememberedEmail();
    }

    setupEventListeners() {
        // Login form
        this.ui.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.authManager.handleLogin(
                this.ui.emailInput.value.trim(),
                this.ui.passwordInput.value,
                this.ui.rememberMeCheckbox.checked
            );
        });

        this.ui.signupBtn.addEventListener('click', () => this.ui.showModal(this.ui.signupModal));
        this.ui.guestBtn.addEventListener('click', () => this.authManager.loginAsGuest());
        this.ui.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        this.ui.forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.ui.showModal(this.ui.resetPasswordModal);
        });

        // Signup
        this.ui.signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value.trim();
            const pwd = document.getElementById('signupPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('termsAgreement').checked;
            this.authManager.handleSignup(email, pwd, confirm, terms);
        });
        this.ui.cancelSignup.addEventListener('click', () => this.ui.closeModal(this.ui.signupModal));

        // Reset password
        this.ui.resetPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value.trim();
            this.authManager.handleResetPassword(email);
        });
        this.ui.cancelReset.addEventListener('click', () => this.ui.closeModal(this.ui.resetPasswordModal));

        // Cloud buttons
        this.ui.cloudSyncBtn.addEventListener('click', () => this.storage.saveToFirebase());
        this.ui.loadFromCloudBtn.addEventListener('click', () => this.storage.loadFromFirebase());
        this.ui.logoutBtn.addEventListener('click', () => this.authManager.handleLogout());

        // Main app buttons
        this.ui.addTableBtn.addEventListener('click', () => this.tableManager.addNewTable());
        this.ui.initialAddTableBtn.addEventListener('click', () => this.tableManager.addNewTable());
        this.ui.importBtn.addEventListener('click', () => this.ui.fileInput.click());
        this.ui.exportBtn.addEventListener('click', () => this.exportData());
        this.ui.statisticsBtn.addEventListener('click', () => this.ui.showStatistics());
        this.ui.helpBtn.addEventListener('click', () => this.showHelp());
        this.ui.clearDataBtn.addEventListener('click', () => this.confirmClearAllData());

        this.ui.fileInput.addEventListener('change', (e) => this.handleFileImport(e));

        // Modal close
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => this.ui.closeModal(e.target.closest('.modal-overlay')));
        });
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) this.ui.closeModal(e.target);
        });

        // Confirm modal
        this.ui.confirmOk.addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
                this.confirmCallback = null;
            }
            this.ui.closeModal(this.ui.confirmModal);
        });
        this.ui.confirmCancel.addEventListener('click', () => {
            this.confirmCallback = null;
            this.ui.closeModal(this.ui.confirmModal);
        });

        // Toast close
        this.ui.toastClose.addEventListener('click', () => this.ui.hideToast());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    setupNetworkListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.ui.updateConnectionStatus(true);
            this.ui.updateCloudStatus(this.isGuest, true);
            this.ui.showToast('Back online', 'success');
            this.storage.startPeriodicSync();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.ui.updateConnectionStatus(false);
            this.ui.updateCloudStatus(this.isGuest, false);
            this.ui.showToast('Offline', 'warning');
            this.storage.stopPeriodicSync();
        });
        this.ui.updateConnectionStatus(this.isOnline);
        this.ui.updateCloudStatus(this.isGuest, this.isOnline);
    }

    checkRememberedEmail() {
        const remembered = localStorage.getItem('rememberedEmail');
        if (remembered && this.ui.emailInput) {
            this.ui.emailInput.value = remembered;
            this.ui.rememberMeCheckbox.checked = true;
        }
    }

    setCurrentYear() {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }

    togglePasswordVisibility() {
        const type = this.ui.passwordInput.type === 'password' ? 'text' : 'password';
        this.ui.passwordInput.type = type;
        this.ui.togglePasswordBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    }

    // Called after login or guest
    handleUserLogin(user) {
        this.ui.userEmail.textContent = user.email || 'Guest User';
        this.ui.userType.textContent = this.isGuest ? 'Guest Mode' : 'Authenticated';
        this.ui.userType.className = this.isGuest ? 'guest' : 'authenticated';
        if (user.photoURL) {
            this.ui.userAvatar.innerHTML = `<img src="${user.photoURL}" alt="Profile">`;
        } else {
            const initial = user.email ? user.email.charAt(0).toUpperCase() : 'G';
            this.ui.userAvatar.innerHTML = `<span>${initial}</span>`;
        }

        this.showMainApp();
        this.loadUserData();
        this.storage.startPeriodicSync();


      

    if (this.ui && this.ui.loginScreen && this.ui.mainApp) {
        this.ui.loginScreen.classList.add('hidden');
        this.ui.mainApp.style.display = 'block';
    } else {
        console.warn('UI elements not ready – cannot switch view');
    }

    this.loadUserData();
    this.storage.startPeriodicSync();

    }

    showMainApp() {
        this.ui.loginScreen.classList.add('hidden');
        this.ui.mainApp.style.display = 'block';
        this.ui.updateCloudStatus(this.isGuest, this.isOnline);
        // Set up Firestore listener for real‑time updates (optional)
        this.setupFirebaseListener();
    }

    showLoginScreen() {
    if (this.ui && this.ui.loginScreen) {
        this.ui.loginScreen.classList.remove('hidden');
    }
    if (this.ui && this.ui.mainApp) {
        this.ui.mainApp.style.display = 'none';
    }
    this.clearFormInputs();
}

    clearFormInputs() {
        this.ui.loginForm.reset();
        this.ui.signupForm.reset();
        this.ui.resetPasswordForm.reset();
        const remembered = localStorage.getItem('rememberedEmail');
        if (remembered && this.ui.emailInput) {
            this.ui.emailInput.value = remembered;
            this.ui.rememberMeCheckbox.checked = true;
        }
    }

    async loadUserData() {
        this.ui.showToast('Loading data...', 'info');
        let loaded = false;
        if (!this.isGuest && this.isOnline) {
            try {
                loaded = await this.storage.loadFromFirebase();
                if (loaded) {
                    this.ui.storageLocation.textContent = 'Cloud Storage';
                    this.ui.showToast('Data loaded from cloud', 'success');
                }
            } catch (e) {
                console.warn('Cloud load failed, trying local', e);
            }
        }
        if (!loaded) {
            loaded = this.storage.loadFromLocalStorage();
            if (loaded) {
                this.ui.storageLocation.textContent = this.isGuest ? 'Local Storage (Guest)' : 'Local Storage';
            } else {
                this.ui.storageLocation.textContent = 'Fresh Start';
            }
        }
        this.ui.updateUI();
    }

    setupFirebaseListener() {
        if (this.firebaseListener) this.firebaseListener();
        if (!this.isGuest && this.isOnline) {
            this.firebaseListener = db.collection('student_results').doc(this.currentUser.uid)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const remoteData = doc.data();
                        const remoteTime = remoteData.lastUpdated?.toMillis() || 0;
                        const localTime = this.getLocalLastSavedTimestamp();
                        if (remoteTime > localTime + 5000) {
                            this.ui.showToast('Data updated from cloud', 'info');
                            this.tables = remoteData.tables || [];
                            this.tableCounter = remoteData.tableCounter || 1;
                            this.ui.updateUI();
                            this.storage.saveToLocalStorage(); // backup
                        }
                    }
                }, (err) => console.warn('Firestore listener error', err));
        }
    }

    getLocalLastSavedTimestamp() {
        try {
            const data = localStorage.getItem('studentResultsData_v2');
            if (data) return new Date(JSON.parse(data).lastSaved || 0).getTime();
        } catch (e) {}
        return 0;
    }

    // ----- Import / Export -----
    exportData() {
        if (this.tables.length === 0) {
            this.ui.showToast('No data to export', 'warning');
            return;
        }
        const data = {
            version: VERSION,
            tables: this.tables,
            tableCounter: this.tableCounter,
            exportedAt: new Date().toISOString(),
            exportedBy: this.currentUser?.email || 'guest'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student-results-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.ui.showToast('Exported', 'success');
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            this.ui.showToast('File too large', 'error');
            event.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (!Array.isArray(imported.tables)) throw new Error('Invalid format');
                const summary = this.mergeImportedData(imported);
                this.ui.updateUI();
                this.storage.saveToLocalStorage();
                this.showImportSummary(summary);
            } catch (err) {
                this.ui.showToast('Import failed: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    mergeImportedData(imported) {
        const summary = { tablesAdded:0, tablesUpdated:0, studentsAdded:0, studentsUpdated:0 };
        const maxId = this.tables.reduce((m, t) => Math.max(m, parseInt(t.id.replace('table-','')) || 0), 0);
        this.tableCounter = Math.max(this.tableCounter, maxId + 1);

        imported.tables.forEach(impTable => {
            const existing = this.tables.find(t => t.name === impTable.name);
            if (existing) {
                summary.tablesUpdated++;
                impTable.students.forEach(stud => {
                    const existStud = existing.students.find(s => s.name === stud.name);
                    if (existStud) {
                        Object.assign(existStud, stud);
                        summary.studentsUpdated++;
                    } else {
                        existing.students.push(stud);
                        summary.studentsAdded++;
                    }
                });
                this.tableManager.updateTablePositions(existing.id);
            } else {
                impTable.id = `table-${this.tableCounter++}`;
                this.tables.push(impTable);
                summary.tablesAdded++;
                summary.studentsAdded += impTable.students.length;
            }
        });
        return summary;
    }

    showImportSummary(summary) {
        const div = document.createElement('div');
        div.className = 'import-summary';
        div.innerHTML = `
            <h4>Import Successful</h4>
            <ul>
                <li>Tables added: ${summary.tablesAdded}</li>
                <li>Tables updated: ${summary.tablesUpdated}</li>
                <li>Students added: ${summary.studentsAdded}</li>
                <li>Students updated: ${summary.studentsUpdated}</li>
            </ul>
        `;
        this.ui.tablesContainer.prepend(div);
        setTimeout(() => div.remove(), 5000);
    }

    confirmClearAllData() {
        this.ui.showConfirmation('Clear All Data', 'Delete everything?', () => {
            this.tables = [];
            this.tableCounter = 1;
            localStorage.removeItem('studentResultsData_v2');
            this.ui.updateUI();
            this.ui.saveStatus.textContent = 'All data cleared';
            this.ui.showToast('Data cleared', 'success');
        });
    }

    // ----- Help -----
    showHelp() {
        const helpHTML = `
            <div class="help-section">
                <h3><i class="fas fa-rocket"></i> Getting Started</h3>
                <p>Welcome to the Student Results Manager! This application helps teachers and school administrators manage student grades efficiently.</p>
                
                <div class="feature-grid">
                    <div class="feature-card">
                        <h4><i class="fas fa-plus"></i> Add New Table</h4>
                        <p>Create a new class or subject table with default student names.</p>
                    </div>
                    <div class="feature-card">
                        <h4><i class="fas fa-copy"></i> Clone Names</h4>
                        <p>Create a new table with student names from an existing table (marks reset to 0).</p>
                    </div>
                    <div class="feature-card">
                        <h4><i class="fas fa-edit"></i> Edit Content</h4>
                        <p>Click on any cell to edit student names or marks. Changes save automatically.</p>
                    </div>
                    <div class="feature-card">
                        <h4><i class="fas fa-user-plus"></i> Add Student</h4>
                        <p>Add new students to any table using the button at the bottom of each table.</p>
                    </div>
                </div>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-cloud"></i> Cloud Features</h3>
                <ul>
                    <li><strong>Authentication:</strong> Sign up or login to save your data in the cloud</li>
                    <li><strong>Cloud Sync:</strong> Click "Sync to Cloud" to save your data to Firebase</li>
                    <li><strong>Load from Cloud:</strong> Click "Load from Cloud" to fetch your latest data</li>
                    <li><strong>Guest Mode:</strong> Use without account (data stored locally only)</li>
                    <li><strong>Auto-sync:</strong> Changes automatically sync when online (authenticated users)</li>
                    <li><strong>Offline Support:</strong> Works without internet connection</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-calculator"></i> Flexible Mark Input</h3>
                <p>You can enter marks in several formats and they will be automatically converted:</p>
                <ul>
                    <li><strong>Fractions:</strong> e.g., "45/50" will be converted to the equivalent mark out of the category maximum</li>
                    <li><strong>Percentages:</strong> e.g., "90%" will be converted to 90% of the category maximum</li>
                    <li><strong>Direct numbers:</strong> e.g., "14" will be used directly (if within the allowed maximum)</li>
                </ul>
                <p><strong>Examples:</strong></p>
                <ul>
                    <li>For CAT1 (max 15): "12/15" → 12, "80%" → 12, "14" → 14</li>
                    <li>For EXAM (max 50): "45/50" → 45, "90%" → 45, "48" → 48</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-sliders-h"></i> Dynamic CAT Columns</h3>
                <p>You can now customize the CAT columns for each table:</p>
                <ul>
                    <li><strong>Add CAT Columns:</strong> Use the "Add CAT Column" button to create new assessment columns</li>
                    <li><strong>Set Maximum Scores:</strong> Define the maximum score for each CAT column</li>
                    <li><strong>Edit CAT Columns:</strong> Click the edit button to change a CAT column's name or maximum score</li>
                    <li><strong>Delete CAT Columns:</strong> Remove CAT columns you no longer need</li>
                </ul>
                <p><strong>Note:</strong> When you delete a CAT column, all marks for that column will be permanently removed.</p>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-database"></i> Data Management</h3>
                <ul>
                    <li><strong>Automatic Saving:</strong> All changes are automatically saved to your browser's storage.</li>
                    <li><strong>Export Data:</strong> Download all your data as a JSON file for backup or transfer.</li>
                    <li><strong>Import Data:</strong> Merge data from JSON files with your existing data:
                        <ul>
                            <li>Tables with the same name will be merged (students updated/added)</li>
                            <li>New tables will be added to your existing data</li>
                            <li>Student records with the same name will be updated</li>
                        </ul>
                    </li>
                    <li><strong>Clear Data:</strong> Remove all tables and start fresh (use with caution!).</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-chart-line"></i> Statistics & Reports</h3>
                <ul>
                    <li><strong>Statistics View:</strong> See an overview of all students across all tables with their total scores and positions.</li>
                    <li><strong>Terminal Reports:</strong> Click on any student name in the statistics view to generate a detailed report card.</li>
                    <li><strong>Print Reports:</strong> Generate professional A4-sized reports for parent meetings or student records.</li>
                    <li><strong>Automatic Calculations:</strong> CAT totals, overall scores, and positions are calculated automatically.</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-print"></i> Printing</h3>
                <ul>
                    <li><strong>Table Printing:</strong> Print individual class tables using the print button on each table.</li>
                    <li><strong>Report Printing:</strong> Generate and print professional terminal reports for students.</li>
                    <li><strong>A4 Optimization:</strong> All print outputs are optimized for standard A4 paper size.</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-graduation-cap"></i> Grading System</h3>
                <ul>
                    <li><strong>CAT Marks:</strong> Each CAT column has its own maximum score that you define</li>
                    <li><strong>Exam Marks:</strong> Maximum of 50 marks per subject</li>
                    <li><strong>Total Calculation:</strong> CAT Total + Exam = Subject Total (out of 100)</li>
                    <li><strong>Automatic Remarks:</strong>
                        <ul>
                            <li>Distinction: 90% and above</li>
                            <li>Excellent: 80% - 89%</li>
                            <li>Very Good: 70% - 79%</li>
                            <li>Good: 60% - 69%</li>
                            <li>Pass: 50% - 59%</li>
                            <li>Fail: Below 50%</li>
                        </ul>
                    </li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-lightbulb"></i> Tips & Best Practices</h3>
                <ul>
                    <li>Use descriptive table names (e.g., "Mathematics Grade 7" instead of "Class 1")</li>
                    <li>Regularly export your data as backup</li>
                    <li>Use the statistics view to identify students who need extra help</li>
                    <li>Add personalized comments in terminal reports for better parent communication</li>
                    <li>Use the clone feature to create similar classes with the same student roster</li>
                    <li>Take advantage of flexible mark input to enter marks in your preferred format</li>
                    <li>Customize CAT columns to match your school's assessment structure</li>
                    <li>Sign in to save your data in the cloud and access it from anywhere</li>
                </ul>
            </div>

            <div class="help-section">
                <h3><i class="fas fa-cogs"></i> Technical Information</h3>
                <ul>
                    <li>This app works entirely in your browser - no server required</li>
                    <li>Data is stored locally in your browser's storage</li>
                    <li>Cloud data is stored securely in Firebase</li>
                    <li>Works offline once loaded</li>
                    <li>Compatible with modern browsers (Chrome, Firefox, Safari, Edge)</li>
                    <li>Responsive design works on desktop, tablet, and mobile devices</li>
                    <li>Version: ${VERSION}</li>
                </ul>
            </div>
        `;
        this.ui.helpContainer.innerHTML = helpHTML;
        this.ui.showModal(this.ui.helpModal);
    }

    // ----- Printing -----
    printTable(tableId) {
        const table = this.tables.find(t => t.id === tableId);
        if (!table) return;
        const printWindow = window.open('', '_blank');
        let catHeaders = '';
        table.catColumns.forEach(cat => {
            catHeaders += `<th>${cat.name} Marks ${cat.maxScore}</th>`;
        });
        const rows = table.students.map(s => {
            let catMarks = '';
            table.catColumns.forEach(cat => {
                catMarks += `<td>${s.catMarks[cat.id] || 0}</td>`;
            });
            return `
                <tr>
                    <td>${s.name}</td>
                    ${catMarks}
                    <td>${s.catTotal}</td>
                    <td>${s.exam}</td>
                    <td>${s.total}</td>
                    <td class="position-cell">${s.position}</td>
                </tr>
            `;
        }).join('');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${table.name} - Student Results</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .print-table { width: 100%; border-collapse: collapse; font-size: 14px; }
                    .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px 10px; text-align: center; }
                    .print-table th { background-color: #f5f5f5; font-weight: bold; }
                    .print-table .position-cell { font-weight: bold; }
                    @page { size: A4 portrait; margin: 0.5cm; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>${table.name}</h1>
                    <p>Student Results Summary</p>
                </div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>NAMES</th>
                            ${catHeaders}
                            <th>CAT Totals 50</th>
                            <th>EXAM Marks 50</th>
                            <th>TOTAL CAT+EXAM Marks 100</th>
                            <th>POSITION</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
                <div style="margin-top:20px; font-size:12px; text-align:center;">
                    Generated on ${new Date().toLocaleDateString()}
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.onload = () => printWindow.print();
    }

    printTerminalReport(studentName, comments) {
        const printWindow = window.open('', '_blank');
        let grandTotal = 0, totalPossible = 0;
        let rows = '';
        this.tables.forEach(table => {
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
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Terminal Report - ${studentName}</title>
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
                    <h1>Terminal Report</h1>
                    <h2>${studentName}</h2>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
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
                    <p>${comments || 'No comments provided.'}</p>
                </div>
                <div style="margin-top:20px; font-size:12px; text-align:center;">
                    School Stamp & Signature: _________________________
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.onload = () => printWindow.print();
    }

    // ----- Keyboard shortcuts -----
    handleKeyboardShortcuts(e) {
        if (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); this.tableManager.addNewTable(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); this.storage.saveToLocalStorage(); this.ui.showToast('Saved', 'success'); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') { e.preventDefault(); this.exportData(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); this.ui.fileInput.click(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'l' && !this.isGuest) { e.preventDefault(); this.storage.loadFromFirebase(); }
        if (e.key === 'Escape') {
            const active = document.querySelector('.modal-overlay.active');
            if (active) this.ui.closeModal(active);
        }
    }

    // Delegate methods to UI for convenience
    showToast(msg, type) { this.ui.showToast(msg, type); }
    showConfirmation(title, msg, cb) { this.ui.showConfirmation(title, msg, cb); }
    setLoadingState(el, isLoading) { this.ui.setLoadingState(el, isLoading); }
    updateSyncStatus(status) { this.ui.updateSyncStatus(status); }
    stopPeriodicSync() { this.storage.stopPeriodicSync(); }
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudentResultsManager();
});