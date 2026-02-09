// scripts/app.js
import { signUp, signIn, signOut, getCurrentUser, initAuth } from './modules/auth.js';
import { initTableManager, cleanupTableManager } from './modules/tableManager.js';
import { initDictionary, cleanupDictionary } from './modules/dictionary.js';
import { initNotes, cleanupNotes } from './modules/notes.js';
import { initUI, showModal, hideModal, showNotification, updateUIForTable } from './modules/uiManager.js';
import { isValidEmail, handleError } from './modules/utils.js';

// Application state
let appState = {
    initialized: false,
    modules: {
        auth: null,
        tableManager: null,
        dictionary: null,
        notes: null
    },
    currentTableId: null,
    currentTableName: null,
    pendingOperations: []
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeApp();
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showNotification('Failed to initialize application. Please refresh the page.', 'error');
    }
});

// Main initialization function
async function initializeApp() {
    if (appState.initialized) {
        console.warn('App already initialized');
        return;
    }
    
    // Initialize UI first
    initUI();
    
    // Initialize authentication
    appState.modules.auth = await initAuth();
    
    // Set up global error handling
    setupErrorHandling();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up inter-module communication
    setupModuleCommunication();
    
    appState.initialized = true;
    
    // Show welcome message if no user is logged in
    if (!getCurrentUser()) {
        showNotification('Welcome! Please sign in or create an account.', 'info');
    }
}

// Setup global error handling
function setupErrorHandling() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        showNotification('An unexpected error occurred', 'error');
    });
    
    // Global error handler
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        // Don't show notification for network errors to avoid spam
        if (!event.message.includes('Failed to fetch')) {
            showNotification('A system error occurred', 'error');
        }
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
    document.getElementById('signUpBtn').addEventListener('click', handleSignUp);
    
    // Sign in button
    document.getElementById('signInBtn').addEventListener('click', handleSignIn);
    
    // Sign out button
    document.getElementById('signOutBtn').addEventListener('click', handleSignOut);
    
    // Enter key in login form
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    if (loginEmail && loginPassword) {
        const handleEnterKey = (e) => {
            if (e.key === 'Enter') {
                handleSignIn();
            }
        };
        
        loginEmail.addEventListener('keypress', handleEnterKey);
        loginPassword.addEventListener('keypress', handleEnterKey);
    }
    
    // Listen for auth state changes (from auth module)
    window.addEventListener('authStateChanged', handleAuthStateChange);
}

function setupModalEventListeners() {
    // Table delete confirmation
    const confirmTableDelete = document.getElementById('confirmTableDelete');
    const cancelTableDelete = document.getElementById('cancelTableDelete');
    
    if (confirmTableDelete) {
        confirmTableDelete.addEventListener('click', handleConfirmTableDelete);
    }
    
    if (cancelTableDelete) {
        cancelTableDelete.addEventListener('click', () => hideModal('confirmTableDeleteModal'));
    }
    
    // New table button
    const newTableBtn = document.getElementById('newTableBtn');
    if (newTableBtn) {
        newTableBtn.addEventListener('click', () => {
            showModal('tableModal', {
                title: 'Create New Table',
                actionText: 'Create Table'
            });
        });
    }
    
    // Rename table button
    const renameTableBtn = document.getElementById('renameTableBtn');
    if (renameTableBtn) {
        renameTableBtn.addEventListener('click', handleRenameTable);
    }
    
    // Delete table button
    const deleteTableBtn = document.getElementById('deleteTableBtn');
    if (deleteTableBtn) {
        deleteTableBtn.addEventListener('click', handleDeleteTable);
    }
}

function setupTableEventListeners() {
    // Table selection change
    const tableSelect = document.getElementById('currentTable');
    if (tableSelect) {
        tableSelect.addEventListener('change', handleTableSelectionChange);
    }
}

function setupImportExportEventListeners() {
    // File import handlers
    const importDictFile = document.getElementById('importDictFile');
    const importNotesFile = document.getElementById('importNotesFile');
    
    if (importDictFile) {
        importDictFile.addEventListener('change', (e) => handleFileImport(e, 'dictionary'));
    }
    
    if (importNotesFile) {
        importNotesFile.addEventListener('change', (e) => handleFileImport(e, 'notes'));
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
    // Online/offline detection
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // Before unload (save state)
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Visibility change (tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Setup inter-module communication
function setupModuleCommunication() {
    // Auth state change → Initialize/Cleanup modules
    window.addEventListener('authStateChanged', (event) => {
        const user = event.detail.user;
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
    
    // Export confirmed → Handle export
    window.addEventListener('exportConfirmed', async (event) => {
        const { filename, modalType } = event.detail;
        await handleExport(filename, modalType);
    });
    
    // Delete confirmed → Handle deletion
    window.addEventListener('deleteConfirmed', async (event) => {
        const { type, itemId } = event.detail;
        await handleDeletion(type, itemId);
    });
    
    // Import option selected → Handle import
    window.addEventListener('importOptionSelected', async (event) => {
        const { action } = event.detail;
        await handleImportAction(action);
    });
    
    // Table action confirmed → Handle table creation/renaming
    window.addEventListener('tableActionConfirmed', async (event) => {
        const { action, tableName, tableId } = event.detail;
        await handleTableAction(action, tableName, tableId);
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
        if (messageEl) messageEl.textContent = 'Please enter email and password.';
        return;
    }
    
    if (!isValidEmail(email)) {
        if (messageEl) messageEl.textContent = 'Please enter a valid email address.';
        return;
    }
    
    if (password.length < 6) {
        if (messageEl) messageEl.textContent = 'Password must be at least 6 characters.';
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
        if (messageEl) messageEl.textContent = 'Please enter email and password.';
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
        // Success handled by auth state change listener
    } catch (error) {
        console.error('Sign out error:', error);
        showNotification('Error signing out', 'error');
    }
}

function handleAuthStateChange(event) {
    const user = event.detail.user;
    
    if (user) {
        // User signed in
        console.log('User signed in:', user.email);
        document.getElementById('userEmail').textContent = `(${user.email})`;
        
        // Initialize user-specific modules
        initializeUserModules(user.uid);
    } else {
        // User signed out
        console.log('User signed out');
        document.getElementById('userEmail').textContent = '';
        
        // Cleanup user-specific modules
        cleanupUserModules();
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
        actionText: 'Rename Table',
        content: `Current name: ${appState.currentTableName}`
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
        // Call table manager to delete table
        if (appState.modules.tableManager && appState.modules.tableManager.deleteTable) {
            await appState.modules.tableManager.deleteTable(appState.currentTableId);
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

async function handleExport(filename, type) {
    if (!appState.currentTableId) {
        showNotification('Please select a table first', 'error');
        return;
    }
    
    try {
        // Get data from appropriate module
        let data;
        if (type === 'dictionary' && appState.modules.dictionary) {
            data = appState.modules.dictionary.getDictionary();
        } else if (type === 'notes' && appState.modules.notes) {
            data = appState.modules.notes.getNotes();
        } else {
            // Export all table data
            data = {
                tableId: appState.currentTableId,
                tableName: appState.currentTableName,
                dictionary: appState.modules.dictionary?.getDictionary() || {},
                notes: appState.modules.notes?.getNotes() || {},
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
        if (type === 'dictionary' && appState.modules.dictionary) {
            // Dictionary module handles its own deletions via event listener
            window.dispatchEvent(new CustomEvent('deleteDictionaryEntry', {
                detail: { topic: itemId }
            }));
        } else if (type === 'notes' && appState.modules.notes) {
            // Notes module handles its own deletions via event listener
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
        if (action === 'create' && appState.modules.tableManager) {
            const newTableId = await appState.modules.tableManager.createTable(tableName);
            
            // Select the new table
            if (newTableId) {
                const tableSelect = document.getElementById('currentTable');
                if (tableSelect) {
                    tableSelect.value = newTableId;
                    tableSelect.dispatchEvent(new Event('change'));
                }
            }
            
        } else if (action === 'rename' && appState.modules.tableManager) {
            await appState.modules.tableManager.renameTable(tableId, tableName);
            
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
    const count = type === 'dictionary' 
        ? Object.keys(appState.modules.dictionary?.getDictionary() || {}).length
        : Object.keys(appState.modules.notes?.getNotes() || {}).length;
    
    if (count === 0) {
        showNotification(`No ${contentType} to clear`, 'info');
        return;
    }
    
    if (!confirm(`Are you sure you want to clear all ${count} ${contentType} in this table? This cannot be undone.`)) {
        return;
    }
    
    try {
        if (type === 'dictionary' && appState.modules.dictionary) {
            window.dispatchEvent(new CustomEvent('clearDictionary'));
        } else if (type === 'notes' && appState.modules.notes) {
            window.dispatchEvent(new CustomEvent('clearNotes'));
        }
        
        showNotification(`Cleared all ${contentType}`);
        
    } catch (error) {
        console.error('Clear error:', error);
        showNotification(`Failed to clear ${contentType}`, 'error');
    }
}

function handleOnlineStatusChange() {
    const isOnline = navigator.onLine;
    
    if (isOnline) {
        showNotification('Back online. Syncing data...', 'info');
        
        // Try to process pending operations
        processPendingOperations();
    } else {
        showNotification('You are offline. Changes will be saved locally.', 'warning');
    }
}

function handleBeforeUnload(event) {
    // Check for unsaved changes
    const hasUnsavedChanges = checkForUnsavedChanges();
    
    if (hasUnsavedChanges) {
        // Standard confirmation dialog
        event.preventDefault();
        event.returnValue = '';
        
        // Alternatively, save to localStorage
        saveAppState();
    }
}

function handleVisibilityChange() {
    if (!document.hidden) {
        // Tab became active again, check for updates
        console.log('App became visible');
        
        // Refresh data if online
        if (navigator.onLine) {
            refreshData();
        }
    }
}

// Module Management
async function initializeUserModules(userId) {
    try {
        console.log('Initializing modules for user:', userId);
        
        // Initialize table manager
        appState.modules.tableManager = await initTableManager();
        
        // Initialize dictionary module
        appState.modules.dictionary = await initDictionary();
        
        // Initialize notes module
        appState.modules.notes = await initNotes();
        
        // Process any pending operations
        processPendingOperations();
        
        showNotification('Welcome back! Your data has been loaded.', 'success');
        
    } catch (error) {
        console.error('Failed to initialize user modules:', error);
        showNotification('Failed to load your data. Please refresh.', 'error');
    }
}

function cleanupUserModules() {
    console.log('Cleaning up user modules');
    
    // Cleanup modules in reverse order
    if (appState.modules.notes && appState.modules.notes.cleanup) {
        appState.modules.notes.cleanup();
    }
    
    if (appState.modules.dictionary && appState.modules.dictionary.cleanup) {
        appState.modules.dictionary.cleanup();
    }
    
    if (appState.modules.tableManager && appState.modules.tableManager.cleanup) {
        appState.modules.tableManager.cleanup();
    }
    
    // Reset module references
    appState.modules = {
        auth: appState.modules.auth, // Keep auth module
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
function checkForUnsavedChanges() {
    // Check form inputs
    const forms = ['topic', 'desc', 'ex', 'noteTitle', 'noteContent'];
    for (const formId of forms) {
        const element = document.getElementById(formId);
        if (element && element.value.trim() !== '') {
            return true;
        }
    }
    
    // Check edit states
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

function restoreAppState() {
    try {
        const savedState = localStorage.getItem('app_state_backup');
        if (savedState) {
            const state = JSON.parse(savedState);
            
            // Restore table selection if user is logged in
            if (getCurrentUser() && state.currentTableId) {
                const tableSelect = document.getElementById('currentTable');
                if (tableSelect) {
                    tableSelect.value = state.currentTableId;
                    tableSelect.dispatchEvent(new Event('change'));
                }
            }
            
            // Clear backup
            localStorage.removeItem('app_state_backup');
        }
    } catch (error) {
        console.error('Failed to restore app state:', error);
    }
}

async function processPendingOperations() {
    if (!appState.pendingOperations.length || !navigator.onLine) {
        return;
    }
    
    console.log('Processing pending operations:', appState.pendingOperations.length);
    
    // Process operations in order
    for (const operation of appState.pendingOperations) {
        try {
            // Dispatch appropriate event based on operation type
            window.dispatchEvent(new CustomEvent('processPendingOperation', {
                detail: operation
            }));
            
            // Remove from pending list (in real implementation, you'd track success)
            appState.pendingOperations = appState.pendingOperations.filter(op => op !== operation);
            
        } catch (error) {
            console.error('Failed to process pending operation:', error);
        }
    }
}

async function refreshData() {
    if (!appState.currentTableId || !navigator.onLine) {
        return;
    }
    
    console.log('Refreshing data for current table');
    
    // Dispatch refresh events to modules
    window.dispatchEvent(new CustomEvent('refreshData'));
}

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
console.log('App script loaded');