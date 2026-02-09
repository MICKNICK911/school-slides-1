// scripts/app.js
import { initAuth, getCurrentUser, signUp, signIn, signOut } from './modules/auth.js';
import { initTableManager, cleanupTableManager } from './modules/tableManager.js';
import { initDictionary, cleanupDictionary } from './modules/dictionary.js';
import { initNotes, cleanupNotes } from './modules/notes.js';
import { initUI, showModal, hideModal, showNotification, updateUIForTable } from './modules/uiManager.js';
import { isValidEmail } from './modules/utils.js';

// Application state
let appState = {
    initialized: false,
    currentTableId: null,
    currentTableName: null,
    user: null,
    modules: {
        auth: null,
        tableManager: null,
        dictionary: null,
        notes: null
    },
    pendingOperations: [],
    offlineMode: false
};

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing application...');
        await initializeApp();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showNotification('Failed to initialize application. Please refresh.', 'error');
        
        // Show error in UI
        const loginMessage = document.getElementById('loginMessage');
        if (loginMessage) {
            loginMessage.textContent = 'App initialization failed. Please refresh.';
            loginMessage.style.color = 'var(--danger)';
        }
    }
});

// Main initialization function
async function initializeApp() {
    if (appState.initialized) {
        console.warn('App already initialized');
        return;
    }
    
    try {
        // Initialize UI first
        initUI();
        
        // Initialize authentication
        initAuth();
        
        // Set up global error handling
        setupErrorHandling();
        
        // Set up event listeners
        setupEventListeners();
        
        // Set up inter-module communication
        setupModuleCommunication();
        
        // Check online status
        checkOnlineStatus();
        
        appState.initialized = true;
        console.log('Application initialized successfully');
        
        // Show welcome message
        if (!getCurrentUser()) {
            showNotification('Welcome to Lesson Builder! Sign in or create an account.', 'info');
        }
        
    } catch (error) {
        console.error('Error during app initialization:', error);
        throw error;
    }
}

// Setup global error handling
function setupErrorHandling() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        showNotification('An unexpected error occurred. Please try again.', 'error');
        event.preventDefault();
    });
    
    // Global error handler
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        // Don't show notification for network errors to avoid spam
        if (!event.message?.includes('Failed to fetch') && !event.message?.includes('Network')) {
            showNotification('A system error occurred', 'error');
        }
        event.preventDefault();
    });
}

// Check online status
function checkOnlineStatus() {
    appState.offlineMode = !navigator.onLine;
    
    if (appState.offlineMode) {
        showNotification('You are offline. Changes will be saved locally.', 'warning');
    }
    
    window.addEventListener('online', () => {
        appState.offlineMode = false;
        showNotification('Back online. Syncing data...', 'info');
        syncPendingOperations();
    });
    
    window.addEventListener('offline', () => {
        appState.offlineMode = true;
        showNotification('You are offline. Changes will be saved locally.', 'warning');
    });
}

// Setup event listeners
function setupEventListeners() {
    // Authentication event listeners
    setupAuthEventListeners();
    
    // Modal event listeners
    setupModalEventListeners();
    
    // Table event listeners
    setupTableEventListeners();
    
    // Import/Export event listeners
    setupImportExportEventListeners();
    
    // Window event listeners
    setupWindowEventListeners();
}

function setupAuthEventListeners() {
    // Sign up button
    const signUpBtn = document.getElementById('signUpBtn');
    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    
    if (signUpBtn) {
        signUpBtn.addEventListener('click', handleSignUp);
    } else {
        console.error('Sign Up button not found!');
    }
    
    if (signInBtn) {
        signInBtn.addEventListener('click', handleSignIn);
    } else {
        console.error('Sign In button not found!');
    }
    
    if (signOutBtn) {
        signOutBtn.addEventListener('click', handleSignOut);
    }
    
    // Enter key in login form
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    if (loginEmail && loginPassword) {
        const handleEnterKey = (e) => {
            if (e.key === 'Enter') {
                if (signInBtn && !signInBtn.disabled) {
                    handleSignIn();
                }
            }
        };
        
        loginEmail.addEventListener('keypress', handleEnterKey);
        loginPassword.addEventListener('keypress', handleEnterKey);
    }
    
    // Listen for auth state changes
    window.addEventListener('authStateChanged', handleAuthStateChange);
}

function setupModalEventListeners() {
    // Table management buttons
    const newTableBtn = document.getElementById('newTableBtn');
    const renameTableBtn = document.getElementById('renameTableBtn');
    const deleteTableBtn = document.getElementById('deleteTableBtn');
    
    if (newTableBtn) {
        newTableBtn.addEventListener('click', () => {
            showModal('tableModal', {
                title: 'Create New Table',
                actionText: 'Create Table'
            });
        });
    }
    
    if (renameTableBtn) {
        renameTableBtn.addEventListener('click', handleRenameTable);
    }
    
    if (deleteTableBtn) {
        deleteTableBtn.addEventListener('click', handleDeleteTable);
    }
    
    // Table delete confirmation
    const cancelTableDelete = document.getElementById('cancelTableDelete');
    const confirmTableDelete = document.getElementById('confirmTableDelete');
    
    if (cancelTableDelete) {
        cancelTableDelete.addEventListener('click', () => hideModal('confirmTableDeleteModal'));
    }
    
    if (confirmTableDelete) {
        confirmTableDelete.addEventListener('click', handleConfirmTableDelete);
    }
}

function setupTableEventListeners() {
    const tableSelect = document.getElementById('currentTable');
    if (tableSelect) {
        tableSelect.addEventListener('change', handleTableSelectionChange);
    }
}

function setupImportExportEventListeners() {
    // File imports
    const importDictBtn = document.getElementById('importDictBtn');
    const importNotesBtn = document.getElementById('importNotesBtn');
    
    if (importDictBtn) {
        importDictBtn.addEventListener('click', () => {
            document.getElementById('importDictFile').click();
        });
    }
    
    if (importNotesBtn) {
        importNotesBtn.addEventListener('click', () => {
            document.getElementById('importNotesFile').click();
        });
    }
    
    // File input handlers
    const importDictFile = document.getElementById('importDictFile');
    const importNotesFile = document.getElementById('importNotesFile');
    
    if (importDictFile) {
        importDictFile.addEventListener('change', (e) => handleFileImport(e, 'dictionary'));
    }
    
    if (importNotesFile) {
        importNotesFile.addEventListener('change', (e) => handleFileImport(e, 'notes'));
    }
    
    // Export buttons
    const exportDictBtn = document.getElementById('exportDictBtn');
    const exportNotesBtn = document.getElementById('exportNotesBtn');
    
    if (exportDictBtn) {
        exportDictBtn.addEventListener('click', () => showExportModal('dictionary'));
    }
    
    if (exportNotesBtn) {
        exportNotesBtn.addEventListener('click', () => showExportModal('notes'));
    }
    
    // Clear buttons
    const clearDictBtn = document.getElementById('clearDictBtn');
    const clearNotesBtn = document.getElementById('clearNotesBtn');
    
    if (clearDictBtn) {
        clearDictBtn.addEventListener('click', () => handleClearContent('dictionary'));
    }
    
    if (clearNotesBtn) {
        clearNotesBtn.addEventListener('click', () => handleClearContent('notes'));
    }
}

function setupWindowEventListeners() {
    // Before unload (save state)
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            saveAppState();
        }
    });
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && navigator.onLine) {
            refreshData();
        }
    });
}

// Setup inter-module communication
function setupModuleCommunication() {
    // Auth state change → Initialize/Cleanup modules
    window.addEventListener('authStateChanged', (event) => {
        const user = event.detail.user;
        appState.user = user;
        
        if (user) {
            initializeUserModules(user.uid);
        } else {
            cleanupUserModules();
        }
    });
    
    // Table change → Update UI and notify modules
    window.addEventListener('tableChanged', (event) => {
        const { tableId, tableName } = event.detail;
        appState.currentTableId = tableId;
        appState.currentTableName = tableName;
        
        // Update UI
        updateUIForTable(!!tableId);
        
        // Notify modules
        window.dispatchEvent(new CustomEvent('activeTableChanged', {
            detail: { tableId, tableName }
        }));
    });
}

// Event Handlers
async function handleSignUp() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const messageEl = document.getElementById('loginMessage');
    
    if (messageEl) messageEl.textContent = '';
    
    // Validation
    if (!email || !password) {
        if (messageEl) {
            messageEl.textContent = 'Please enter email and password.';
            messageEl.style.color = 'var(--danger)';
        }
        return;
    }
    
    if (!isValidEmail(email)) {
        if (messageEl) {
            messageEl.textContent = 'Please enter a valid email address.';
            messageEl.style.color = 'var(--danger)';
        }
        return;
    }
    
    if (password.length < 6) {
        if (messageEl) {
            messageEl.textContent = 'Password must be at least 6 characters.';
            messageEl.style.color = 'var(--danger)';
        }
        return;
    }
    
    try {
        await signUp(email, password);
        // Success handled by auth state change listener
    } catch (error) {
        // Error displayed by auth module
        console.error('Sign up error:', error);
    }
}

async function handleSignIn() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const messageEl = document.getElementById('loginMessage');
    
    if (messageEl) messageEl.textContent = '';
    
    if (!email || !password) {
        if (messageEl) {
            messageEl.textContent = 'Please enter email and password.';
            messageEl.style.color = 'var(--danger)';
        }
        return;
    }
    
    try {
        await signIn(email, password);
        // Success handled by auth state change listener
    } catch (error) {
        // Error displayed by auth module
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
    
    if (user) {
        // User signed in
        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) {
            userEmailEl.textContent = `(${user.email})`;
        }
    } else {
        // User signed out
        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) {
            userEmailEl.textContent = '';
        }
    }
}

async function handleTableSelectionChange(event) {
    const tableId = event.target.value;
    
    if (!tableId) {
        // Clear table selection
        appState.currentTableId = null;
        appState.currentTableName = null;
        updateUIForTable(false);
        return;
    }
    
    // Get table name from option text
    const selectedOption = event.target.options[event.target.selectedIndex];
    const tableName = selectedOption.textContent;
    
    // Update state
    appState.currentTableId = tableId;
    appState.currentTableName = tableName;
    
    // Notify modules via event
    window.dispatchEvent(new CustomEvent('tableChanged', {
        detail: { tableId, tableName }
    }));
    
    showNotification(`Switched to table: ${tableName}`);
}

async function handleRenameTable() {
    if (!appState.currentTableId || !appState.currentTableName) {
        showNotification('No table selected', 'error');
        return;
    }
    
    showModal('tableModal', {
        title: 'Rename Table',
        actionText: 'Rename Table'
    });
    
    // Set current name in input
    const tableNameInput = document.getElementById('tableName');
    if (tableNameInput) {
        tableNameInput.value = appState.currentTableName;
        
        // Set action and tableId on confirm button
        const confirmBtn = document.getElementById('confirmTableBtn');
        if (confirmBtn) {
            confirmBtn.dataset.action = 'rename';
            confirmBtn.dataset.tableId = appState.currentTableId;
        }
    }
}

async function handleDeleteTable() {
    if (!appState.currentTableId || !appState.currentTableName) {
        showNotification('No table selected', 'error');
        return;
    }
    
    // Show confirmation modal
    const deleteTableNameEl = document.getElementById('deleteTableName');
    if (deleteTableNameEl) {
        deleteTableNameEl.textContent = appState.currentTableName;
    }
    
    showModal('confirmTableDeleteModal');
}

async function handleConfirmTableDelete() {
    if (!appState.currentTableId) return;
    
    try {
        // Get table manager from window
        if (window.tableManager && window.tableManager.deleteTable) {
            await window.tableManager.deleteTable(appState.currentTableId);
            showNotification(`Table "${appState.currentTableName}" deleted successfully`);
        }
        
        hideModal('confirmTableDeleteModal');
        
        // Clear table selection
        appState.currentTableId = null;
        appState.currentTableName = null;
        updateUIForTable(false);
        
        // Reset table select
        const tableSelect = document.getElementById('currentTable');
        if (tableSelect) tableSelect.value = '';
        
    } catch (error) {
        console.error('Error deleting table:', error);
        showNotification('Failed to delete table', 'error');
    }
}

async function handleFileImport(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Store file and type for import modal
    appState.pendingImport = { file, type };
    
    // Show import options modal
    showModal('importModal', {
        title: `Import ${type === 'dictionary' ? 'Dictionary' : 'Notes'} Data`,
        content: `How would you like to import the ${type} data from "${file.name}"?`
    });
}

async function handleImportAction(action) {
    if (!appState.pendingImport || !appState.currentTableId) {
        showNotification('No import data or table selected', 'error');
        return;
    }
    
    const { file, type } = appState.pendingImport;
    
    try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        // Dispatch to appropriate module
        window.dispatchEvent(new CustomEvent(`${type}Import`, {
            detail: { data: importData, action }
        }));
        
        showNotification(`${type} imported successfully (${action})`);
        
    } catch (error) {
        console.error('Import error:', error);
        showNotification('Failed to import file', 'error');
    } finally {
        // Clear pending import
        appState.pendingImport = null;
        
        // Reset file inputs
        document.querySelectorAll('.file-input').forEach(input => {
            input.value = '';
        });
    }
}

function showExportModal(type) {
    const tableName = document.getElementById('currentTableName').textContent
        .replace(/\s+/g, '_').toLowerCase();
    
    const defaultName = type === 'dictionary' 
        ? `${tableName}_dictionary.json` 
        : `${tableName}_notes.json`;
    
    document.getElementById('filename').value = defaultName;
    document.getElementById('exportModal').dataset.exportType = type;
    showModal('exportModal');
}

async function handleExport(filename) {
    if (!appState.currentTableId) {
        showNotification('Please select a table first', 'error');
        return;
    }
    
    const exportType = document.getElementById('exportModal').dataset.exportType;
    
    try {
        let data;
        
        if (exportType === 'dictionary' && window.dictionaryModule) {
            data = window.dictionaryModule.getDictionary();
        } else if (exportType === 'notes' && window.notesModule) {
            data = window.notesModule.getNotes();
        } else {
            // Export all table data
            data = {
                tableId: appState.currentTableId,
                tableName: appState.currentTableName,
                dictionary: window.dictionaryModule?.getDictionary() || {},
                notes: window.notesModule?.getNotes() || {},
                exportedAt: new Date().toISOString()
            };
        }
        
        // Create and download file
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification(`Exported successfully to ${filename}`);
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export', 'error');
    }
}

async function handleDeletion(type, itemId) {
    if (!appState.currentTableId) {
        showNotification('No table selected', 'error');
        return;
    }
    
    try {
        if (type === 'dictionary' && window.dictionaryModule) {
            window.dispatchEvent(new CustomEvent('deleteDictionaryEntry', {
                detail: { topic: itemId }
            }));
        } else if (type === 'notes' && window.notesModule) {
            window.dispatchEvent(new CustomEvent('deleteNote', {
                detail: { noteId: itemId }
            }));
        }
    } catch (error) {
        console.error('Deletion error:', error);
        showNotification('Failed to delete item', 'error');
    }
}

async function handleTableAction(action, tableName, tableId) {
    try {
        if (action === 'create' && window.tableManager) {
            const newTableId = await window.tableManager.createTable(tableName);
            
            // Select the new table
            if (newTableId) {
                const tableSelect = document.getElementById('currentTable');
                if (tableSelect) {
                    tableSelect.value = newTableId;
                    handleTableSelectionChange({ target: tableSelect });
                }
            }
            
        } else if (action === 'rename' && window.tableManager) {
            await window.tableManager.renameTable(tableId, tableName);
            
            // Update current table name
            appState.currentTableName = tableName;
            
            // Update UI
            const tableNameElements = document.querySelectorAll('.table-name');
            tableNameElements.forEach(el => {
                el.textContent = tableName;
            });
        }
        
    } catch (error) {
        console.error('Table action error:', error);
        showNotification(`Failed to ${action} table`, 'error');
    }
}

async function handleClearContent(type) {
    if (!appState.currentTableId) {
        showNotification('Please select a table first', 'error');
        return;
    }
    
    const contentType = type === 'dictionary' ? 'dictionary entries' : 'notes';
    
    if (!confirm(`Are you sure you want to clear ALL ${contentType} in this table? This cannot be undone.`)) {
        return;
    }
    
    try {
        if (type === 'dictionary' && window.dictionaryModule) {
            window.dispatchEvent(new CustomEvent('clearDictionary'));
        } else if (type === 'notes' && window.notesModule) {
            window.dispatchEvent(new CustomEvent('clearNotes'));
        }
        
        showNotification(`Cleared all ${contentType}`);
        
    } catch (error) {
        console.error('Clear error:', error);
        showNotification(`Failed to clear ${contentType}`, 'error');
    }
}

// Module Management
async function initializeUserModules(userId) {
    try {
        console.log('Initializing modules for user:', userId);
        
        // Initialize table manager
        appState.modules.tableManager = initTableManager();
        
        // Initialize dictionary module
        appState.modules.dictionary = initDictionary();
        
        // Initialize notes module
        appState.modules.notes = initNotes();
        
        // Sync any pending operations
        syncPendingOperations();
        
        showNotification('Welcome back! Your data has been loaded.', 'success');
        
    } catch (error) {
        console.error('Failed to initialize user modules:', error);
        showNotification('Failed to load your data. Please refresh.', 'error');
    }
}

function cleanupUserModules() {
    console.log('Cleaning up user modules');
    
    // Cleanup modules
    if (appState.modules.notes && typeof appState.modules.notes.cleanup === 'function') {
        appState.modules.notes.cleanup();
    }
    
    if (appState.modules.dictionary && typeof appState.modules.dictionary.cleanup === 'function') {
        appState.modules.dictionary.cleanup();
    }
    
    if (appState.modules.tableManager && typeof appState.modules.tableManager.cleanup === 'function') {
        appState.modules.tableManager.cleanup();
    }
    
    // Reset module references
    appState.modules = {
        tableManager: null,
        dictionary: null,
        notes: null
    };
    
    // Reset table state
    appState.currentTableId = null;
    appState.currentTableName = null;
    
    // Clear UI
    updateUIForTable(false);
    
    // Clear any pending operations
    appState.pendingOperations = [];
    
    showNotification('Signed out successfully', 'info');
}

// Utility Functions
function hasUnsavedChanges() {
    const forms = ['topic', 'desc', 'ex', 'noteTitle', 'noteContent'];
    for (const formId of forms) {
        const element = document.getElementById(formId);
        if (element && element.value.trim() !== '') {
            return true;
        }
    }
    
    const isEditingDictionary = document.getElementById('updateBtn')?.disabled === false;
    const isEditingNotes = document.getElementById('updateNoteBtn')?.disabled === false;
    
    return isEditingDictionary || isEditingNotes;
}

function saveAppState() {
    try {
        const stateToSave = {
            currentTableId: appState.currentTableId,
            currentTableName: appState.currentTableName,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('app_state_backup', JSON.stringify(stateToSave));
    } catch (error) {
        console.error('Failed to save app state:', error);
    }
}

function syncPendingOperations() {
    if (!appState.pendingOperations.length || !navigator.onLine) {
        return;
    }
    
    console.log('Syncing pending operations:', appState.pendingOperations.length);
    
    // Process pending operations
    appState.pendingOperations.forEach(operation => {
        window.dispatchEvent(new CustomEvent('syncPendingOperation', {
            detail: operation
        }));
    });
    
    // Clear pending operations
    appState.pendingOperations = [];
}

async function refreshData() {
    if (!appState.currentTableId || !navigator.onLine) {
        return;
    }
    
    console.log('Refreshing data for current table');
    
    // Dispatch refresh events to modules
    window.dispatchEvent(new CustomEvent('refreshData'));
}

// Global event listeners for inter-module communication
window.addEventListener('exportConfirmed', (event) => {
    const { filename } = event.detail;
    handleExport(filename);
});

window.addEventListener('deleteConfirmed', (event) => {
    const { type, itemId } = event.detail;
    handleDeletion(type, itemId);
});

window.addEventListener('importOptionSelected', (event) => {
    const { action } = event.detail;
    handleImportAction(action);
});

window.addEventListener('tableActionConfirmed', (event) => {
    const { action, tableName, tableId } = event.detail;
    handleTableAction(action, tableName, tableId);
});

// Public API for other modules
window.app = {
    getState: () => ({ ...appState }),
    getCurrentTable: () => ({
        id: appState.currentTableId,
        name: appState.currentTableName
    }),
    getUser: () => getCurrentUser(),
    showNotification,
    showModal,
    hideModal,
    addPendingOperation: (operation) => {
        appState.pendingOperations.push(operation);
    }
};

// Initialize
console.log('App module loaded');