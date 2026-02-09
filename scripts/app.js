// scripts/app.js
import { initAuth, signUp, signIn, signOut, getCurrentUser } from './modules/auth.js';
import { initTableManager } from './modules/tableManager.js';
import { initDictionary } from './modules/dictionary.js';
import { initNotes } from './modules/notes.js';
import { showNotification } from './modules/uiManager.js';

// Application state
let appState = {
    initialized: false,
    currentTableId: null,
    currentTableName: null,
    user: null,
    modules: {}
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

// Main initialization function
async function initializeApp() {
    if (appState.initialized) {
        console.warn('App already initialized');
        return;
    }
    
    try {
        // Initialize authentication
        console.log('Initializing auth...');
        initAuth();
        
        // Set up global error handling
        setupErrorHandling();
        
        // Set up event listeners
        setupEventListeners();
        
        appState.initialized = true;
        console.log('Application initialized successfully');
        
    } catch (error) {
        console.error('Error during app initialization:', error);
        showNotification('Failed to initialize application', 'error');
    }
}

// Setup global error handling
function setupErrorHandling() {
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        showNotification('An unexpected error occurred', 'error');
    });
    
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        if (!event.message?.includes('Failed to fetch') && !event.message?.includes('Network')) {
            showNotification('A system error occurred', 'error');
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Authentication event listeners
    document.getElementById('signUpBtn').addEventListener('click', handleSignUp);
    document.getElementById('signInBtn').addEventListener('click', handleSignIn);
    document.getElementById('signOutBtn').addEventListener('click', handleSignOut);
    
    // Enter key in login form
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    loginEmail.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignIn();
    });
    
    loginPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignIn();
    });
    
    // Listen for auth state changes
    window.addEventListener('authStateChanged', handleAuthStateChange);
    
    // Listen for table changes
    window.addEventListener('tableChanged', handleTableChanged);
    
    // Listen for export confirmed
    document.getElementById('confirmExport').addEventListener('click', handleExport);
    document.getElementById('cancelExport').addEventListener('click', () => {
        document.getElementById('exportModal').style.display = 'none';
    });
    
    // Listen for delete confirmed
    document.getElementById('confirmDelete').addEventListener('click', handleDelete);
    document.getElementById('cancelDelete').addEventListener('click', () => {
        document.getElementById('deleteModal').style.display = 'none';
    });
    
    // Listen for import options
    document.getElementById('replaceData').addEventListener('click', () => handleImportOption('replace'));
    document.getElementById('mergeData').addEventListener('click', () => handleImportOption('merge'));
    
    // Table management
    document.getElementById('newTableBtn').addEventListener('click', showNewTableModal);
    document.getElementById('renameTableBtn').addEventListener('click', showRenameTableModal);
    document.getElementById('deleteTableBtn').addEventListener('click', showDeleteTableModal);
    document.getElementById('confirmTableBtn').addEventListener('click', handleTableAction);
    document.getElementById('cancelTableBtn').addEventListener('click', () => {
        document.getElementById('tableModal').style.display = 'none';
    });
    document.getElementById('confirmTableDelete').addEventListener('click', handleConfirmTableDelete);
    document.getElementById('cancelTableDelete').addEventListener('click', () => {
        document.getElementById('confirmTableDeleteModal').style.display = 'none';
    });
    
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
}

// Handle authentication
async function handleSignUp() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const messageEl = document.getElementById('loginMessage');
    
    messageEl.textContent = '';
    
    if (!email || !password) {
        messageEl.textContent = 'Please enter email and password.';
        messageEl.style.color = 'var(--danger)';
        return;
    }
    
    if (password.length < 6) {
        messageEl.textContent = 'Password must be at least 6 characters.';
        messageEl.style.color = 'var(--danger)';
        return;
    }
    
    try {
        await signUp(email, password);
    } catch (error) {
        console.error('Sign up error:', error);
    }
}

async function handleSignIn() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const messageEl = document.getElementById('loginMessage');
    
    messageEl.textContent = '';
    
    if (!email || !password) {
        messageEl.textContent = 'Please enter email and password.';
        messageEl.style.color = 'var(--danger)';
        return;
    }
    
    try {
        await signIn(email, password);
    } catch (error) {
        console.error('Sign in error:', error);
    }
}

async function handleSignOut() {
    try {
        await signOut();
    } catch (error) {
        console.error('Sign out error:', error);
        showNotification('Error signing out', 'error');
    }
}

function handleAuthStateChange(event) {
    const user = event.detail.user;
    appState.user = user;
    
    if (user) {
        // User signed in
        document.getElementById('userEmail').textContent = `(${user.email})`;
        
        // Initialize modules
        initializeUserModules(user.uid);
        
    } else {
        // User signed out
        document.getElementById('userEmail').textContent = '';
        cleanupUserModules();
    }
}

function handleTableChanged(event) {
    const { tableId, tableName } = event.detail;
    appState.currentTableId = tableId;
    appState.currentTableName = tableName;
    
    // Update UI
    updateTableUI(!!tableId);
    
    // Update table names
    document.querySelectorAll('.table-name').forEach(el => {
        el.textContent = tableName || 'No Table';
    });
    document.getElementById('previewTableName').textContent = tableName || 'No Table Selected';
}

// Initialize user modules
function initializeUserModules(userId) {
    console.log('Initializing modules for user:', userId);
    
    // Initialize table manager
    appState.modules.tableManager = initTableManager();
    
    // Initialize dictionary module
    appState.modules.dictionary = initDictionary();
    
    // Initialize notes module
    appState.modules.notes = initNotes();
    
    showNotification('Welcome back! Your data has been loaded.', 'success');
}

// Cleanup user modules
function cleanupUserModules() {
    console.log('Cleaning up user modules');
    
    // Reset state
    appState.currentTableId = null;
    appState.currentTableName = null;
    appState.modules = {};
    
    // Update UI
    updateTableUI(false);
    document.getElementById('currentTable').innerHTML = '<option value="">-- Select a Table --</option>';
    document.getElementById('tableStats').textContent = 'No table selected';
    
    showNotification('Signed out successfully', 'info');
}

// Update table UI
function updateTableUI(hasTable) {
    const elements = [
        'editId', 'topic', 'desc', 'ex', 'addBtn', 'updateBtn', 'cancelBtn',
        'noteId', 'noteTitle', 'noteContent', 'addNoteBtn', 'updateNoteBtn', 'cancelNoteBtn',
        'importDictBtn', 'exportDictBtn', 'clearDictBtn',
        'importNotesBtn', 'exportNotesBtn', 'clearNotesBtn',
        'searchDictInput', 'searchNotesInput'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.disabled = !hasTable;
        }
    });
    
    // Update file inputs
    document.getElementById('importDictFile').disabled = !hasTable;
    document.getElementById('importNotesFile').disabled = !hasTable;
    
    // Update selects
    const editSelect = document.getElementById('editId');
    const noteSelect = document.getElementById('noteId');
    
    if (hasTable) {
        editSelect.innerHTML = '<option value="">-- Create New Entry --</option>';
        noteSelect.innerHTML = '<option value="">-- Create New Note --</option>';
    } else {
        editSelect.innerHTML = '<option value="">-- Select a Table First --</option>';
        noteSelect.innerHTML = '<option value="">-- Select a Table First --</option>';
    }
    
    // Update table action buttons
    document.getElementById('renameTableBtn').disabled = !hasTable;
    document.getElementById('deleteTableBtn').disabled = !hasTable;
}

// Table management functions
function showNewTableModal() {
    document.getElementById('tableModalTitle').textContent = 'Create New Table';
    document.getElementById('tableName').value = '';
    document.getElementById('tableNameError').textContent = '';
    document.getElementById('confirmTableBtn').textContent = 'Create Table';
    document.getElementById('confirmTableBtn').dataset.action = 'create';
    document.getElementById('tableModal').style.display = 'flex';
    document.getElementById('tableName').focus();
}

function showRenameTableModal() {
    if (!appState.currentTableId) return;
    
    document.getElementById('tableModalTitle').textContent = 'Rename Table';
    document.getElementById('tableName').value = appState.currentTableName;
    document.getElementById('tableNameError').textContent = '';
    document.getElementById('confirmTableBtn').textContent = 'Rename Table';
    document.getElementById('confirmTableBtn').dataset.action = 'rename';
    document.getElementById('confirmTableBtn').dataset.tableId = appState.currentTableId;
    document.getElementById('tableModal').style.display = 'flex';
    document.getElementById('tableName').focus();
    document.getElementById('tableName').select();
}

function showDeleteTableModal() {
    if (!appState.currentTableId) return;
    
    document.getElementById('deleteTableName').textContent = appState.currentTableName;
    document.getElementById('confirmTableDeleteModal').style.display = 'flex';
}

async function handleTableAction() {
    const action = this.dataset.action;
    const tableName = document.getElementById('tableName').value.trim();
    const errorElement = document.getElementById('tableNameError');
    
    errorElement.textContent = '';
    
    if (!tableName) {
        errorElement.textContent = 'Table name is required';
        return;
    }
    
    if (tableName.length < 2) {
        errorElement.textContent = 'Table name must be at least 2 characters';
        return;
    }
    
    try {
        if (action === 'create') {
            const tableManager = appState.modules.tableManager;
            if (tableManager && tableManager.createTable) {
                await tableManager.createTable(tableName);
            }
        } else if (action === 'rename') {
            const tableId = this.dataset.tableId;
            const tableManager = appState.modules.tableManager;
            if (tableManager && tableManager.renameTable) {
                await tableManager.renameTable(tableId, tableName);
            }
        }
        
        document.getElementById('tableModal').style.display = 'none';
        
    } catch (error) {
        errorElement.textContent = error.message;
    }
}

async function handleConfirmTableDelete() {
    if (!appState.currentTableId) return;
    
    try {
        const tableManager = appState.modules.tableManager;
        if (tableManager && tableManager.deleteTable) {
            await tableManager.deleteTable(appState.currentTableId);
        }
        
        document.getElementById('confirmTableDeleteModal').style.display = 'none';
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Export function
function handleExport() {
    const filename = document.getElementById('filename').value.trim();
    if (!filename) {
        showNotification('Please enter a filename', 'error');
        return;
    }
    
    const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
    
    // Dispatch event for modules to handle
    window.dispatchEvent(new CustomEvent('exportData', {
        detail: { filename: finalFilename }
    }));
    
    document.getElementById('exportModal').style.display = 'none';
}

// Delete function
function handleDelete() {
    const modal = document.getElementById('deleteModal');
    const type = modal.dataset.type;
    const itemId = modal.dataset.itemId;
    
    if (!type || !itemId) return;
    
    // Dispatch event for modules to handle
    window.dispatchEvent(new CustomEvent('deleteItem', {
        detail: { type, itemId }
    }));
    
    document.getElementById('deleteModal').style.display = 'none';
}

// Import function
function handleImportOption(action) {
    window.dispatchEvent(new CustomEvent('importData', {
        detail: { action }
    }));
    
    document.getElementById('importModal').style.display = 'none';
}

// Tab switching
function switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add('active');
    }
}

// Initialize tab
switchTab('dictionary');

// Make app available globally for debugging
window.appState = appState;
window.app = {
    getState: () => ({ ...appState }),
    getCurrentTable: () => ({
        id: appState.currentTableId,
        name: appState.currentTableName
    }),
    getUser: () => getCurrentUser()
};

console.log('App initialized');