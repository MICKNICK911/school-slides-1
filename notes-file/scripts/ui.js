class UIManager {
    constructor() {
        this.currentTopic = null;
        this.isUpperCase = false;
        this.isDarkTheme = false;
        
        // DOM Elements
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.themeToggle = document.getElementById('themeToggle');
        this.fontToggle = document.getElementById('fontToggle');
        this.caseToggle = document.getElementById('caseToggle');
        this.bookmarkToggle = document.getElementById('bookmarkToggle');
        this.profileToggle = document.getElementById('profileToggle');
        this.historyToggle = document.getElementById('historyToggle');
        this.topicsToggle = document.getElementById('topicsToggle');
        this.helpToggle = document.getElementById('helpToggle');
        this.appLogo = document.getElementById('appLogo');
        this.historyPanel = document.getElementById('historyPanel');
        this.topicsPanel = document.getElementById('topicsPanel');
        this.bookmarksPanel = document.getElementById('bookmarksPanel');
        this.profilePanel = document.getElementById('profilePanel');
        this.topicsList = document.getElementById('topicsList');
        this.bookmarksList = document.getElementById('bookmarksList');
        this.historyList = document.getElementById('historyList');
        this.closeHistory = document.getElementById('closeHistory');
        this.closeTopics = document.getElementById('closeTopics');
        this.closeBookmarks = document.getElementById('closeBookmarks');
        this.closeProfile = document.getElementById('closeProfile');
        this.overlay = document.getElementById('overlay');
        this.instructionsModal = document.getElementById('instructionsModal');
        this.closeModal = document.getElementById('closeModal');
        this.fontControls = document.querySelector('.font-controls');
        this.fontSizeBtns = document.querySelectorAll('.font-size-btn');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        // State
        this.lessons = { ...window.utils.DEFAULT_LESSONS };
        this.bookmarks = [];
        this.searchHistory = [];
        
        this.init();
    }
    
    init() {
        // Load saved state
        this.loadState();
        
        // Event listeners
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.fontToggle.addEventListener('click', () => this.toggleFontControls());
        this.caseToggle.addEventListener('click', () => this.toggleCase());
        this.bookmarkToggle.addEventListener('click', () => this.toggleBookmarksPanel());
        this.profileToggle.addEventListener('click', () => this.toggleProfilePanel());
        this.historyToggle.addEventListener('click', () => this.toggleHistoryPanel());
        this.topicsToggle.addEventListener('click', () => this.toggleTopicsPanel());
        this.helpToggle.addEventListener('click', () => this.toggleInstructionsModal());
        
        this.appLogo.addEventListener('click', () => this.showHomeScreen());
        this.closeHistory.addEventListener('click', () => this.toggleHistoryPanel());
        this.closeTopics.addEventListener('click', () => this.toggleTopicsPanel());
        this.closeBookmarks.addEventListener('click', () => this.toggleBookmarksPanel());
        this.closeProfile.addEventListener('click', () => this.toggleProfilePanel());
        this.closeModal.addEventListener('click', () => this.toggleInstructionsModal());
        this.overlay.addEventListener('click', () => this.closeAllPanels());
        this.logoutBtn.addEventListener('click', () => this.logout());
        
        // Font size controls
        this.fontSizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const size = btn.dataset.size;
                this.setFontSize(size);
            });
        });
        
        // Initialize panels
        this.renderTopicsList();
        this.loadBookmarks();
        this.loadHistory();
    }
    
    // Search functionality
    async handleSearch() {
        const searchTerm = this.searchInput.value.trim();
        if (!searchTerm) return;
        
        // Add to search history
        this.addToHistory(searchTerm);
        
        // Save to database if user is logged in
        if (window.databaseManager && window.databaseManager.currentUserId) {
            await window.databaseManager.addToHistory(searchTerm);
        }
        
        // Display results
        this.displayResults(searchTerm);
    }
    
    displayResults(term) {
        this.currentTopic = term;
        const topic = this.lessons[term];
        
        if (!topic) {
            this.showNotFound(term);
            return;
        }
        
        // Apply case transformation if needed
        let displayDesc = topic.desc;
        let displayEx = topic.ex;
        
        if (this.isUpperCase) {
            displayDesc = displayDesc.toUpperCase();
            displayEx = displayEx.map(ex => ex.toUpperCase());
        } else {
            displayDesc = displayDesc.toLowerCase();
            displayEx = displayEx.map(ex => ex.toLowerCase());
        }
        
        this.resultsContainer.innerHTML = `
            <div class="entry-card">
                <div class="entry-header">
                    <h1>${window.utils.applyCase(term, this.isUpperCase)}</h1>
                    <div class="entry-actions">
                        <button class="bookmark-action" id="bookmarkAction">
                            ${this.isBookmarked(term) ? '★' : '☆'}
                        </button>
                    </div>
                </div>
                <div class="entry-desc">${window.utils.formatMarkdown(displayDesc)}</div>
                
                <h3>Examples & Word Bank:</h3>
                <div class="examples-grid">
                    ${displayEx.map((example, index) => 
                        `<div class="example-item" data-index="${index}">${example}</div>`
                    ).join('')}
                </div>
                
                <button class="clear-selection" id="clearSelection">
                    <span>✕</span> Clear Selection
                </button>
            </div>
        `;
        
        // Add click handlers to example items
        document.querySelectorAll('.example-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
            });
        });
        
        // Add clear selection button handler
        document.getElementById('clearSelection').addEventListener('click', () => {
            document.querySelectorAll('.example-item').forEach(item => {
                item.classList.remove('selected');
            });
        });
        
        // Add bookmark button handler
        const bookmarkAction = document.getElementById('bookmarkAction');
        bookmarkAction.addEventListener('click', async () => {
            await this.toggleBookmark(term);
            bookmarkAction.textContent = this.isBookmarked(term) ? '★' : '☆';
        });
    }
    
    showNotFound(term) {
        this.resultsContainer.innerHTML = `
            <div class="no-results">
                <span>🔍</span>
                <h2>Topic Not Found</h2>
                <p>No results found for "${term}". Try one of these:</p>
                <div class="search-history">
                    ${Object.keys(this.lessons).slice(0, 4).map(key => 
                        `<div class="history-item">🔍 ${key}</div>`
                    ).join('')}
                </div>
                
                <div class="font-controls">
                    <span class="font-label">Font Size:</span>
                    ${Array.from(this.fontSizeBtns).map(btn => btn.outerHTML).join('')}
                </div>
            </div>
            
            <div class="feature-highlight">
                <h2>📚 Browse All Topics</h2>
                <p>Click the topics icon 📚 in the top right corner to view all available topics</p>
            </div>
        `;
        
        // Re-add event listeners
        this.rebindEventListeners();
    }
    
    showHomeScreen() {
        this.resultsContainer.innerHTML = `
            <div class="no-results">
                <span>📖</span>
                <h2>Enhanced Digital Notes</h2>
                <p>Search for topics to see their details and examples</p>
                <p>Try these examples:</p>
                <div class="search-history">
                    ${Object.keys(this.lessons).slice(0, 4).map(key => 
                        `<div class="history-item">🔍 ${key}</div>`
                    ).join('')}
                </div>
                
                <div class="font-controls">
                    <span class="font-label">Font Size:</span>
                    ${Array.from(this.fontSizeBtns).map(btn => btn.outerHTML).join('')}
                </div>
            </div>
            
            <div class="feature-highlight">
                <h2>📚 Browse All Topics</h2>
                <p>Click the topics icon 📚 in the top right corner to view all available topics</p>
            </div>
        `;
        
        // Re-add event listeners
        this.rebindEventListeners();
    }
    
    // Theme management
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.body.classList.toggle('dark-theme', this.isDarkTheme);
        this.themeToggle.textContent = this.isDarkTheme ? '☀️' : '🌙';
        this.saveState();
    }
    
    // Case management
    toggleCase() {
        this.isUpperCase = !this.isUpperCase;
        this.caseToggle.classList.toggle('active', this.isUpperCase);
        this.saveState();
        
        // Re-render current topic if any
        if (this.currentTopic) {
            this.displayResults(this.currentTopic);
        }
    }
    
    // Font size management
    setFontSize(size) {
        document.documentElement.style.setProperty('--font-base', size);
        
        // Update active button
        this.fontSizeBtns.forEach(b => b.classList.remove('active'));
        const activeBtn = Array.from(this.fontSizeBtns).find(btn => btn.dataset.size === size);
        if (activeBtn) activeBtn.classList.add('active');
        
        this.saveState();
        
        // Re-render current topic if any
        if (this.currentTopic) {
            this.displayResults(this.currentTopic);
        }
    }
    
    toggleFontControls() {
        this.fontControls.style.display = this.fontControls.style.display === 'flex' ? 'none' : 'flex';
    }
    
    // Panel management
    toggleHistoryPanel() {
        this.historyPanel.classList.toggle('active');
        this.overlay.classList.toggle('active');
        document.body.style.overflow = this.historyPanel.classList.contains('active') ? 'hidden' : 'auto';
        this.closeOtherPanels(this.historyPanel);
    }
    
    toggleTopicsPanel() {
        this.topicsPanel.classList.toggle('active');
        this.overlay.classList.toggle('active');
        document.body.style.overflow = this.topicsPanel.classList.contains('active') ? 'hidden' : 'auto';
        this.closeOtherPanels(this.topicsPanel);
    }
    
    toggleBookmarksPanel() {
        this.bookmarksPanel.classList.toggle('active');
        this.overlay.classList.toggle('active');
        document.body.style.overflow = this.bookmarksPanel.classList.contains('active') ? 'hidden' : 'auto';
        this.closeOtherPanels(this.bookmarksPanel);
    }
    
    toggleProfilePanel() {
        this.profilePanel.classList.toggle('active');
        this.overlay.classList.toggle('active');
        document.body.style.overflow = this.profilePanel.classList.contains('active') ? 'hidden' : 'auto';
        this.closeOtherPanels(this.profilePanel);
        
        // Load profile data
        if (this.profilePanel.classList.contains('active')) {
            this.loadProfileData();
        }
    }
    
    toggleInstructionsModal() {
        this.instructionsModal.classList.toggle('active');
        this.overlay.classList.toggle('active');
        document.body.style.overflow = this.instructionsModal.classList.contains('active') ? 'hidden' : 'auto';
    }
    
    closeAllPanels() {
        this.historyPanel.classList.remove('active');
        this.topicsPanel.classList.remove('active');
        this.bookmarksPanel.classList.remove('active');
        this.profilePanel.classList.remove('active');
        this.instructionsModal.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    closeOtherPanels(activePanel) {
        const panels = [this.historyPanel, this.topicsPanel, this.bookmarksPanel, this.profilePanel];
        panels.forEach(panel => {
            if (panel !== activePanel) {
                panel.classList.remove('active');
            }
        });
    }
    
    // Bookmarks management
    async loadBookmarks() {
        if (window.databaseManager && window.databaseManager.currentUserId) {
            this.bookmarks = await window.databaseManager.getUserBookmarks();
        } else {
            this.bookmarks = JSON.parse(localStorage.getItem('dictionaryBookmarks')) || [];
        }
        this.renderBookmarksList();
    }
    
    async toggleBookmark(topic) {
        if (!topic) return;
        
        if (window.databaseManager && window.databaseManager.currentUserId) {
            if (this.isBookmarked(topic)) {
                await window.databaseManager.removeBookmark(topic);
            } else {
                await window.databaseManager.addBookmark(topic);
            }
            await this.loadBookmarks();
        } else {
            const index = this.bookmarks.indexOf(topic);
            if (index === -1) {
                this.bookmarks.unshift(topic);
                window.utils.showNotification(`Bookmarked "${topic}"`, '🔖');
            } else {
                this.bookmarks.splice(index, 1);
                window.utils.showNotification(`Removed "${topic}" from bookmarks`, '✕');
            }
            localStorage.setItem('dictionaryBookmarks', JSON.stringify(this.bookmarks));
            this.renderBookmarksList();
        }
        
        // Update bookmark button state
        this.updateBookmarkButton(topic);
    }
    
    isBookmarked(topic) {
        return this.bookmarks.includes(topic);
    }
    
    updateBookmarkButton(topic) {
        this.bookmarkToggle.classList.toggle('active', this.isBookmarked(topic));
    }
    
    renderBookmarksList() {
        this.bookmarksList.innerHTML = '';
        
        if (this.bookmarks.length === 0) {
            this.bookmarksList.innerHTML = '<p>No bookmarks yet. Click the bookmark icon on a topic to save it here.</p>';
            return;
        }
        
        this.bookmarks.forEach((bookmark, index) => {
            const bookmarkItem = document.createElement('div');
            bookmarkItem.className = 'bookmark-item';
            bookmarkItem.innerHTML = `
                <span>🔖</span>
                <div>${bookmark}</div>
                <button class="remove-bookmark" data-index="${index}">✕</button>
            `;
            
            bookmarkItem.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-bookmark')) return;
                this.searchInput.value = bookmark;
                this.handleSearch();
                this.closeAllPanels();
            });
            
            const removeBtn = bookmarkItem.querySelector('.remove-bookmark');
            removeBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.removeBookmark(index);
            });
            
            this.bookmarksList.appendChild(bookmarkItem);
        });
    }
    
    async removeBookmark(index) {
        const topic = this.bookmarks[index];
        
        if (window.databaseManager && window.databaseManager.currentUserId) {
            await window.databaseManager.removeBookmark(topic);
            await this.loadBookmarks();
        } else {
            this.bookmarks.splice(index, 1);
            localStorage.setItem('dictionaryBookmarks', JSON.stringify(this.bookmarks));
            this.renderBookmarksList();
        }
        
        if (this.currentTopic === topic) {
            this.updateBookmarkButton(topic);
        }
        
        window.utils.showNotification(`Removed "${topic}" from bookmarks`, '✕');
    }
    
    // History management
    async loadHistory() {
        if (window.databaseManager && window.databaseManager.currentUserId) {
            const history = await window.databaseManager.getUserHistory();
            this.searchHistory = history.map(item => ({
                term: item.term,
                time: item.time
            }));
        } else {
            this.searchHistory = JSON.parse(localStorage.getItem('dictionarySearchHistory')) || [];
        }
        this.renderHistoryPanel();
    }
    
    async addToHistory(term) {
        if (!this.searchHistory.some(item => item.term === term)) {
            const historyItem = {
                term: term,
                time: new Date().toISOString()
            };
            
            this.searchHistory.unshift(historyItem);
            
            // Keep only the last 10 searches
            if (this.searchHistory.length > 10) {
                this.searchHistory.pop();
            }
            
            if (!window.databaseManager || !window.databaseManager.currentUserId) {
                localStorage.setItem('dictionarySearchHistory', JSON.stringify(this.searchHistory));
            }
            
            this.renderHistoryPanel();
        }
    }
    
    renderHistoryPanel() {
        this.historyList.innerHTML = '';
        
        if (this.searchHistory.length === 0) {
            this.historyList.innerHTML = '<p>No search history yet</p>';
            return;
        }
        
        this.searchHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item-panel';
            historyItem.innerHTML = `
                <div class="term">🔍 ${item.term}</div>
                <div class="time">${window.utils.formatTime(new Date(item.time))}</div>
            `;
            
            historyItem.addEventListener('click', () => {
                this.searchInput.value = item.term;
                this.handleSearch();
                this.closeAllPanels();
            });
            
            this.historyList.appendChild(historyItem);
        });
    }
    
    // Topics management
    renderTopicsList() {
        this.topicsList.innerHTML = '';
        
        Object.keys(this.lessons).forEach(topic => {
            const topicItem = document.createElement('div');
            topicItem.className = 'topic-item';
            topicItem.innerHTML = `
                <span>📄</span>
                <div>${topic}</div>
            `;
            
            topicItem.addEventListener('click', () => {
                this.searchInput.value = topic;
                this.handleSearch();
                this.closeAllPanels();
            });
            
            this.topicsList.appendChild(topicItem);
        });
    }
    
    // Profile management
    async loadProfileData() {
        if (!window.databaseManager || !window.databaseManager.currentUserId) {
            return;
        }
        
        const userData = await window.databaseManager.getUserData();
        if (userData) {
            document.getElementById('profileName').textContent = userData.displayName || 'User';
            document.getElementById('profileEmail').textContent = userData.email || 'user@example.com';
            document.getElementById('bookmarksCount').textContent = userData.bookmarksCount || 0;
            document.getElementById('historyCount').textContent = userData.historyCount || 0;
            document.getElementById('createdCount').textContent = userData.notesCount || 0;
        }
    }
    
    // State management
    saveState() {
        const state = {
            theme: this.isDarkTheme ? 'dark' : 'light',
            fontSize: getComputedStyle(document.documentElement).getPropertyValue('--font-base'),
            case: this.isUpperCase ? 'uppercase' : 'normal'
        };
        
        localStorage.setItem('dictionaryState', JSON.stringify(state));
        
        // Save to database if user is logged in
        if (window.databaseManager && window.databaseManager.currentUserId) {
            window.databaseManager.updateUserPreferences({
                theme: state.theme,
                fontSize: parseFloat(state.fontSize),
                case: state.case
            });
        }
    }
    
    loadState() {
        const savedState = JSON.parse(localStorage.getItem('dictionaryState'));
        
        if (savedState) {
            this.isDarkTheme = savedState.theme === 'dark';
            this.isUpperCase = savedState.case === 'uppercase';
            
            // Apply theme
            if (this.isDarkTheme) {
                document.body.classList.add('dark-theme');
                this.themeToggle.textContent = '☀️';
            }
            
            // Apply font size
            if (savedState.fontSize) {
                this.setFontSize(savedState.fontSize);
            }
            
            // Apply case
            if (this.isUpperCase) {
                this.caseToggle.classList.add('active');
            }
        }
    }
    
    // Utility methods
    rebindEventListeners() {
        // Re-add event listeners to history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                this.searchInput.value = item.textContent.trim().replace('🔍', '');
                this.handleSearch();
            });
        });
        
        // Re-add event listeners to font size buttons
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const size = btn.dataset.size;
                this.setFontSize(size);
            });
        });
    }
    
    // In ui.js, update the loadSavedDictionary method or add a new method
async loadUserData() {
    console.log('Loading user data...');
    
    // First check if we have cloud data manager
    if (window.cloudDataManager) {
        console.log('Using cloud data manager for data loading');
        // CloudDataManager will handle everything
        return;
    }
    
    // Fallback: load from local storage
    this.loadSavedDictionary();
}

loadSavedDictionary() {
    const savedDictionary = localStorage.getItem('customDictionary');
    if (savedDictionary) {
        try {
            const dictionary = JSON.parse(savedDictionary);
            this.updateLessons(dictionary);
        } catch (e) {
            console.error('Failed to load saved Notes:', e);
        }
    }
}
    
    logout() {
        if (window.authManager) {
            window.authManager.logout();
        }
    }
    
    // Update lessons
    updateLessons(newLessons) {
        this.lessons = newLessons;
        this.renderTopicsList();
    }
}

// Initialize UI Manager
let uiManager;
document.addEventListener('DOMContentLoaded', () => {
    uiManager = new UIManager();
    window.uiManager = uiManager;
});

// Add this to your ui.js or create a new file scripts/data-sync-ui.js
class DataSyncUI {
    constructor() {
        this.setupSyncUI();
    }
    
    setupSyncUI() {
        // Add sync button to controls
        setTimeout(() => {
            const syncButton = document.createElement('div');
            syncButton.className = 'theme-toggle';
            syncButton.id = 'syncButton';
            syncButton.innerHTML = '🔄';
            syncButton.title = 'Sync with Cloud';
            syncButton.style.cursor = 'pointer';
            
            syncButton.addEventListener('click', () => this.syncWithCloud());
            
            // Add to controls
            const controls = document.querySelector('.controls');
            if (controls) {
                controls.appendChild(syncButton);
            }
            
            // Add sync status indicator
            this.addSyncStatus();
        }, 2000);
    }
    
    async syncWithCloud() {
        console.log('DataSyncUI: Syncing with cloud...');
        
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            alert('Please log in to sync with cloud');
            return;
        }
        
        if (!window.cloudDataManager) {
            alert('Cloud sync not available');
            return;
        }
        
        // Show loading
        const syncButton = document.getElementById('syncButton');
        const originalText = syncButton.innerHTML;
        syncButton.innerHTML = '⏳';
        
        try {
            // Force refresh from cloud
            const success = await window.cloudDataManager.forceRefreshFromCloud();
            
            if (success) {
                window.utils.showNotification('Synced with cloud successfully!', '✅', false, true);
            } else {
                window.utils.showNotification('No cloud data found', '⚠️');
            }
        } catch (error) {
            console.error('DataSyncUI: Sync error:', error);
            window.utils.showNotification('Sync failed: ' + error.message, '❌', true);
        } finally {
            // Restore button
            syncButton.innerHTML = originalText;
        }
    }
    
    addSyncStatus() {
        // Add a small status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.id = 'syncStatus';
        statusIndicator.style.position = 'fixed';
        statusIndicator.style.bottom = '10px';
        statusIndicator.style.left = '10px';
        statusIndicator.style.background = '#29c702';
        statusIndicator.style.color = 'white';
        statusIndicator.style.padding = '5px 10px';
        statusIndicator.style.borderRadius = '4px';
        statusIndicator.style.fontSize = '12px';
        statusIndicator.style.zIndex = '9999';
        statusIndicator.style.display = 'none';
        statusIndicator.textContent = 'Cloud: ✅';
        
        document.body.appendChild(statusIndicator);
        
        // Update status periodically
        setInterval(() => this.updateSyncStatus(), 5000);
    }
    
    updateSyncStatus() {
        const statusIndicator = document.getElementById('syncStatus');
        if (!statusIndicator) return;
        
        if (window.authManager && window.authManager.isAuthenticated()) {
            statusIndicator.style.display = 'block';
            statusIndicator.textContent = 'Cloud: ✅';
            statusIndicator.style.background = '#29c702';
        } else {
            statusIndicator.style.display = 'none';
        }
    }
}

// Initialize DataSyncUI
let dataSyncUI;
document.addEventListener('DOMContentLoaded', () => {
    dataSyncUI = new DataSyncUI();
});