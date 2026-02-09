// scripts/modules/uiManager.js
import { showNotification as showNotif } from './utils.js';

// UI State Management
let currentTab = 'dictionary-preview';
let activeModal = null;
let notificationTimeout = null;

// Initialize all UI components
export function initUI() {
    initTabs();
    initModals();
    initNotifications();
    initKeyboardShortcuts();
    initResponsiveDesign();
    initExportModal();
    initDeleteModal();
    initImportModal();
    initTableModal();
    initTableDeleteModal();
}

// Tab Management
export function initTabs() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            if (tabName) {
                switchTab(tabName);
            }
        });
    });
    
    // Set initial tab
    switchTab('dictionary-preview');
}

export function switchTab(tabName) {
    // Validate tab exists
    let tabContent = document.getElementById(tabName);
    if (!tabContent) {
        tabContent = document.getElementById(`${tabName}-preview`);
    }
    
    if (!tabContent) {
        console.warn(`Tab "${tabName}" not found`);
        return;
    }
    
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
    
    tabContent.classList.add('active');
    currentTab = tabName;
    
    // Dispatch custom event for other modules
    window.dispatchEvent(new CustomEvent('tabChanged', {
        detail: { tab: tabName }
    }));
}

// Modal Management
function initModals() {
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeModal) {
            hideModal(activeModal);
        }
    });
}

function initExportModal() {
    const cancelBtn = document.getElementById('cancelExport');
    const confirmBtn = document.getElementById('confirmExport');
    const filenameInput = document.getElementById('filename');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => hideModal('exportModal'));
    }
    
    if (confirmBtn && filenameInput) {
        confirmBtn.addEventListener('click', () => {
            const filename = filenameInput.value.trim();
            if (!filename) {
                showNotification('Please enter a filename', 'error');
                return;
            }
            
            // Validate filename
            if (/[<>:"/\\|?*]/.test(filename)) {
                showNotification('Filename contains invalid characters', 'error');
                return;
            }
            
            const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
            
            // Dispatch event for app.js to handle
            window.dispatchEvent(new CustomEvent('exportConfirmed', {
                detail: { filename: finalFilename }
            }));
            
            hideModal('exportModal');
        });
        
        // Enter key in filename input
        filenameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        });
    }
}

function initDeleteModal() {
    const cancelBtn = document.getElementById('cancelDelete');
    const confirmBtn = document.getElementById('confirmDelete');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => hideModal('deleteModal'));
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const modal = document.getElementById('deleteModal');
            const type = modal.dataset.type;
            const itemId = modal.dataset.topic || modal.dataset.noteId;
            
            if (!type || !itemId) {
                console.error('Delete modal missing data');
                hideModal('deleteModal');
                return;
            }
            
            // Dispatch event for app.js to handle
            window.dispatchEvent(new CustomEvent('deleteConfirmed', {
                detail: { type, itemId }
            }));
            
            hideModal('deleteModal');
        });
    }
}

function initImportModal() {
    const replaceBtn = document.getElementById('replaceData');
    const mergeBtn = document.getElementById('mergeData');
    
    if (replaceBtn) {
        replaceBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('importOptionSelected', {
                detail: { action: 'replace' }
            }));
            hideModal('importModal');
        });
    }
    
    if (mergeBtn) {
        mergeBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('importOptionSelected', {
                detail: { action: 'merge' }
            }));
            hideModal('importModal');
        });
    }
}

function initTableModal() {
    const cancelBtn = document.getElementById('cancelTableBtn');
    const confirmBtn = document.getElementById('confirmTableBtn');
    const tableNameInput = document.getElementById('tableName');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => hideModal('tableModal'));
    }
    
    if (confirmBtn && tableNameInput) {
        confirmBtn.addEventListener('click', async () => {
            const tableName = tableNameInput.value.trim();
            const action = confirmBtn.dataset.action;
            const tableId = confirmBtn.dataset.tableId;
            const errorElement = document.getElementById('tableNameError');
            
            if (errorElement) errorElement.textContent = '';
            
            // Validate table name
            if (!tableName) {
                if (errorElement) errorElement.textContent = 'Table name is required';
                return;
            }
            
            if (tableName.length < 2) {
                if (errorElement) errorElement.textContent = 'Table name must be at least 2 characters';
                return;
            }
            
            if (tableName.length > 50) {
                if (errorElement) errorElement.textContent = 'Table name must be less than 50 characters';
                return;
            }
            
            // Dispatch event for app.js to handle
            window.dispatchEvent(new CustomEvent('tableActionConfirmed', {
                detail: { action, tableName, tableId }
            }));
            
            hideModal('tableModal');
            tableNameInput.value = '';
        });
        
        // Enter key in table name input
        tableNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        });
    }
}

function initTableDeleteModal() {
    const cancelBtn = document.getElementById('cancelTableDelete');
    const confirmBtn = document.getElementById('confirmTableDelete');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => hideModal('confirmTableDeleteModal'));
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('confirmTableDelete'));
            hideModal('confirmTableDeleteModal');
        });
    }
}

// Modal show/hide functions
export function showModal(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal ${modalId} not found`);
        return;
    }
    
    modal.style.display = 'flex';
    activeModal = modalId;
    
    // Focus first input if any
    setTimeout(() => {
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
    }, 50);
    
    // Set modal title if provided
    if (options.title) {
        const titleEl = modal.querySelector('.modal-title');
        if (titleEl) titleEl.textContent = options.title;
    }
    
    // Set modal content if provided
    if (options.content) {
        const contentEl = modal.querySelector('.modal-content > p');
        if (contentEl) contentEl.textContent = options.content;
    }
    
    // Set action button text if provided
    if (options.actionText) {
        const actionBtn = modal.querySelector('.modal-actions .btn-primary');
        if (actionBtn) actionBtn.textContent = options.actionText;
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('modalShown', {
        detail: { modalId, options }
    }));
}

export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Clear any input errors
        const errorEl = modal.querySelector('.error-message');
        if (errorEl) errorEl.textContent = '';
    }
    
    if (activeModal === modalId) {
        activeModal = null;
    }
    
    window.dispatchEvent(new CustomEvent('modalHidden', {
        detail: { modalId }
    }));
}

// Notification System
function initNotifications() {
    // Auto-hide notifications on click
    const notification = document.getElementById('notification');
    if (notification) {
        notification.addEventListener('click', () => {
            hideNotification();
        });
    }
}

export function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    // Clear previous timeout
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }
    
    // Set notification content and style
    notification.textContent = message;
    notification.className = 'notification';
    
    // Set type-specific styling
    switch (type) {
        case 'success':
            notification.style.backgroundColor = 'var(--secondary)';
            break;
        case 'error':
            notification.style.backgroundColor = 'var(--danger)';
            break;
        case 'warning':
            notification.style.backgroundColor = 'var(--warning)';
            notification.style.color = 'var(--dark)';
            break;
        case 'info':
            notification.style.backgroundColor = 'var(--primary)';
            break;
        default:
            notification.style.backgroundColor = 'var(--secondary)';
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide after 4 seconds
    notificationTimeout = setTimeout(() => {
        hideNotification();
    }, 4000);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('notificationShown', {
        detail: { message, type }
    }));
}

export function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.remove('show');
    }
    
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts if user is typing in an input/textarea
        if (e.target.matches('input, textarea, select')) {
            return;
        }
        
        // Ctrl/Cmd + N: New table
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            showModal('tableModal', { 
                title: 'Create New Table',
                actionText: 'Create Table' 
            });
        }
        
        // Ctrl/Cmd + E: Export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            showModal('exportModal');
        }
        
        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-box input');
            if (searchInput) searchInput.focus();
        }
        
        // Escape: Close modal or clear search
        if (e.key === 'Escape') {
            if (activeModal) {
                hideModal(activeModal);
            } else {
                // Clear search inputs
                document.querySelectorAll('.search-box input').forEach(input => {
                    input.value = '';
                    const event = new Event('input', { bubbles: true });
                    input.dispatchEvent(event);
                });
            }
        }
    });
}

// Responsive Design
function initResponsiveDesign() {
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });
    
    // Initial check
    handleResize();
}

function handleResize() {
    const width = window.innerWidth;
    const container = document.querySelector('.container');
    
    if (!container) return;
    
    // Adjust layout for mobile
    if (width < 768) {
        container.style.padding = '15px';
    } else {
        container.style.padding = '30px';
    }
    
    // Dispatch resize event for other components
    window.dispatchEvent(new CustomEvent('appResize', {
        detail: { width }
    }));
}

// Update UI based on table selection
export function updateUIForTable(hasTable) {
    const elements = [
        'addBtn', 'updateBtn', 'cancelBtn', 'addNoteBtn', 'updateNoteBtn', 'cancelNoteBtn',
        'exportDictBtn', 'clearDictBtn', 'exportNotesBtn', 'clearNotesBtn',
        'importDictBtn', 'importNotesBtn'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.disabled = !hasTable;
        }
    });
    
    // Update search inputs
    const searchInputs = document.querySelectorAll('.search-box input');
    searchInputs.forEach(input => {
        input.disabled = !hasTable;
        if (!hasTable) {
            input.placeholder = 'Select a table first';
        }
    });
    
    // Update selects
    const selects = document.querySelectorAll('select:not(#currentTable)');
    selects.forEach(select => {
        select.disabled = !hasTable;
    });
    
    // Update placeholders
    const placeholders = {
        'topic': hasTable ? 'Enter topic...' : 'Select a table first',
        'desc': hasTable ? 'Enter description...' : '',
        'ex': hasTable ? 'Enter examples, separated by commas...' : '',
        'noteTitle': hasTable ? 'Enter note title...' : 'Select a table first',
        'noteContent': hasTable ? 'Enter note content...' : ''
    };
    
    Object.keys(placeholders).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.disabled = !hasTable;
            element.placeholder = placeholders[id];
        }
    });
}

// Update preview section header
export function updatePreviewHeader(tableName) {
    const header = document.getElementById('previewTableName');
    if (header) {
        header.textContent = tableName || 'No Table Selected';
    }
}

// Clear all forms
export function clearAllForms() {
    const forms = ['topic', 'desc', 'ex', 'noteTitle', 'noteContent'];
    forms.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    const selects = ['editId', 'noteId'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) select.value = '';
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
} else {
    initUI();
}

// Export for global access
if (typeof window !== 'undefined') {
    window.uiManager = {
        initUI,
        switchTab,
        showModal,
        hideModal,
        showNotification,
        hideNotification,
        updateUIForTable,
        updatePreviewHeader,
        clearAllForms,
        getCurrentTab: () => currentTab,
        getActiveModal: () => activeModal
    };
}

export default {
    initUI,
    switchTab,
    showModal,
    hideModal,
    showNotification,
    hideNotification,
    updateUIForTable,
    updatePreviewHeader,
    clearAllForms
};