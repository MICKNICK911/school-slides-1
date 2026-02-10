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
    
   async init() {
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
    
    // Load data
    await this.loadBookmarks();
    await this.loadHistory();
    
    // Load initial data after a short delay
    setTimeout(() => {
        this.loadInitialData();
    }, 1000);
}

    async loadInitialData() {
        console.log('UIManager: Loading initial data...');
        
        if (window.authManager && window.authManager.isAuthenticated()) {
            console.log('UIManager: User authenticated, loading cloud data');
            await this.loadCloudData();
        } else {
            console.log('UIManager: User not authenticated, loading local data');
            this.loadLocalData();
        }
    }

    displayResults(term) {
    this.currentTopic = term;
    
    // Find matching topic (case-insensitive search)
    const normalizedTerm = term.toLowerCase().trim();
    const matchingTopics = Object.keys(this.lessons).filter(topic => 
        topic.toLowerCase() === normalizedTerm
    );
    
    let topicKey;
    if (matchingTopics.length > 0) {
        topicKey = matchingTopics[0]; // Use the original case from lessons
    } else {
        // Try partial match
        const partialMatches = Object.keys(this.lessons).filter(topic => 
            topic.toLowerCase().includes(normalizedTerm)
        );
        topicKey = partialMatches.length > 0 ? partialMatches[0] : null;
    }
    
    if (!topicKey || !this.lessons[topicKey]) {
        this.showNotFound(term);
        return;
    }
    
    const topic = this.lessons[topicKey];
    
    // Apply case transformation
    let displayTopic = this.isUpperCase ? topicKey.toUpperCase() : topicKey.toLowerCase();
    let displayDesc = this.isUpperCase ? topic.desc.toUpperCase() : topic.desc.toLowerCase();
    let displayEx = this.isUpperCase 
        ? topic.ex.map(ex => ex.toUpperCase())
        : topic.ex.map(ex => ex.toLowerCase());
    
    this.resultsContainer.innerHTML = `
        <div class="entry-card">
            <div class="entry-header">
                <h1>${displayTopic}</h1>
                <div class="entry-actions">
                    <button class="bookmark-action" id="bookmarkAction" title="${this.isBookmarked(topicKey) ? 'Remove bookmark' : 'Add bookmark'}">
                        ${this.isBookmarked(topicKey) ? '★' : '☆'}
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
    if (bookmarkAction) {
        bookmarkAction.addEventListener('click', async () => {
            await this.toggleBookmark(topicKey);
        });
    }
}

     async loadCloudData() {
        console.log('UIManager: Loading cloud data...');
        
        if (!window.databaseManager) {
            console.log('UIManager: Database manager not available');
            return;
        }
        
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            console.log('UIManager: User not authenticated');
            return;
        }
        
        try {
            // Show loading indicator
            this.showLoading(true);
            
            // Get notes from cloud
            const notes = await window.databaseManager.getUserNotes();
            console.log('UIManager: Notes from cloud:', notes.length);
            
            if (notes.length === 0) {
                console.log('UIManager: No cloud data found');
                this.loadLocalData();
                return;
            }
            
            // Convert to dictionary format
            const cloudDictionary = {};
            notes.forEach(note => {
                if (note.topic) {
                    cloudDictionary[note.topic] = {
                        desc: note.desc || '',
                        ex: note.ex || []
                    };
                }
            });
            
            console.log('UIManager: Cloud dictionary:', Object.keys(cloudDictionary).length);
            
            // Update lessons
            this.updateLessons(cloudDictionary);
            
            // Update local storage
            localStorage.setItem('customDictionary', JSON.stringify(cloudDictionary));
            
            // Show success
            window.utils.showNotification(`Loaded ${notes.length} notes from cloud`, '☁️', false, true);
            
        } catch (error) {
            console.error('UIManager: Error loading cloud data:', error);
            this.loadLocalData();
        } finally {
            this.showLoading(false);
        }
    }

    loadLocalData() {
        console.log('UIManager: Loading local data...');
        
        try {
            const savedDictionary = localStorage.getItem('customDictionary');
            
            if (savedDictionary) {
                const dictionary = JSON.parse(savedDictionary);
                console.log('UIManager: Local data loaded:', Object.keys(dictionary).length);
                
                // Update lessons
                this.updateLessons(dictionary);
                
                window.utils.showNotification(`Loaded ${Object.keys(dictionary).length} notes from local storage`, '💾');
            } else {
                console.log('UIManager: No local data found');
                window.utils.showNotification('Using default Notes', '📚');
            }
        } catch (error) {
            console.error('UIManager: Error loading local data:', error);
        }
    }
    
    showLoading(show) {
        const loadingEl = document.getElementById('loadingIndicator');
        if (loadingEl) {
            loadingEl.style.display = show ? 'block' : 'none';
        }
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
    
    async loadBookmarks() {
    console.log('Loading bookmarks...');
    
    if (window.databaseManager && window.authManager?.isAuthenticated()) {
        try {
            console.log('Loading bookmarks from cloud...');
            const bookmarks = await window.databaseManager.getUserBookmarks();
            this.bookmarks = bookmarks.map(item => item.topic || item);
            console.log(`Loaded ${this.bookmarks.length} bookmarks from cloud`);
        } catch (error) {
            console.error('Error loading bookmarks from cloud:', error);
            this.bookmarks = JSON.parse(localStorage.getItem('dictionaryBookmarks')) || [];
        }
    } else {
        this.bookmarks = JSON.parse(localStorage.getItem('dictionaryBookmarks')) || [];
    }
    
    this.renderBookmarksList();
    return this.bookmarks;
}

async toggleBookmark(topic) {
    if (!topic) {
        console.error('No topic provided for bookmark');
        return;
    }
    
    console.log(`Toggling bookmark for: ${topic}`);
    
    try {
        const isCurrentlyBookmarked = this.isBookmarked(topic);
        
        if (window.databaseManager && window.authManager?.isAuthenticated()) {
            // Use database manager
            if (isCurrentlyBookmarked) {
                const success = await window.databaseManager.removeBookmark(topic);
                if (success) {
                    // Remove from local array
                    const index = this.bookmarks.indexOf(topic);
                    if (index !== -1) {
                        this.bookmarks.splice(index, 1);
                    }
                    window.utils.showNotification(`Removed "${topic}" from bookmarks`, '✕');
                }
            } else {
                const success = await window.databaseManager.addBookmark(topic);
                if (success) {
                    // Add to local array
                    this.bookmarks.unshift(topic);
                    window.utils.showNotification(`Bookmarked "${topic}"`, '🔖');
                }
            }
            
            // Update counts in database
            await window.databaseManager.updateUserCounts();
            
            // Refresh profile data
            await this.loadProfileData();
            
        } else {
            // Use local storage only
            if (isCurrentlyBookmarked) {
                // Remove bookmark
                const index = this.bookmarks.indexOf(topic);
                if (index !== -1) {
                    this.bookmarks.splice(index, 1);
                }
                window.utils.showNotification(`Removed "${topic}" from bookmarks`, '✕');
            } else {
                // Add bookmark
                this.bookmarks.unshift(topic);
                window.utils.showNotification(`Bookmarked "${topic}"`, '🔖');
            }
            
            // Save to local storage
            localStorage.setItem('dictionaryBookmarks', JSON.stringify(this.bookmarks));
        }
        
        // Update UI
        this.renderBookmarksList();
        this.updateBookmarkButton(topic);
        
        console.log(`Bookmark toggled. Now bookmarked: ${!isCurrentlyBookmarked}`);
        
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        window.utils.showNotification('Error updating bookmark', '❌', true);
    }
}

isBookmarked(topic) {
    return this.bookmarks.includes(topic);
}

updateBookmarkButton(topic) {
    const bookmarkAction = document.getElementById('bookmarkAction');
    if (bookmarkAction && topic) {
        bookmarkAction.textContent = this.isBookmarked(topic) ? '★' : '☆';
        bookmarkAction.title = this.isBookmarked(topic) ? 'Remove bookmark' : 'Add bookmark';
    }
}

renderBookmarksList() {
    if (!this.bookmarksList) return;
    
    this.bookmarksList.innerHTML = '';
    
    if (this.bookmarks.length === 0) {
        this.bookmarksList.innerHTML = `
            <div class="empty-state">
                <span>🔖</span>
                <p>No bookmarks yet</p>
                <p class="hint">Click the bookmark icon on any topic to save it here</p>
            </div>
        `;
        return;
    }
    
    this.bookmarks.forEach((bookmark, index) => {
        const bookmarkItem = document.createElement('div');
        bookmarkItem.className = 'bookmark-item';
        bookmarkItem.innerHTML = `
            <div class="bookmark-content">
                <span class="bookmark-icon">🔖</span>
                <div class="bookmark-text">${bookmark}</div>
            </div>
            <button class="remove-bookmark" data-index="${index}" title="Remove bookmark">
                ✕
            </button>
        `;
        
        // Click on bookmark to search it
        bookmarkItem.querySelector('.bookmark-content').addEventListener('click', () => {
            this.searchInput.value = bookmark;
            this.handleSearch();
            this.closeAllPanels();
        });
        
        // Click remove button
        bookmarkItem.querySelector('.remove-bookmark').addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.removeBookmark(bookmark);
        });
        
        this.bookmarksList.appendChild(bookmarkItem);
    });
}

async removeBookmark(topic) {
    if (!topic) return;
    
    console.log(`Removing bookmark: ${topic}`);
    
    if (window.databaseManager && window.authManager?.isAuthenticated()) {
        // Remove from cloud
        await window.databaseManager.removeBookmark(topic);
        await window.databaseManager.updateUserCounts();
    }
    
    // Remove from local array
    const index = this.bookmarks.indexOf(topic);
    if (index !== -1) {
        this.bookmarks.splice(index, 1);
    }
    
    // Save to local storage
    localStorage.setItem('dictionaryBookmarks', JSON.stringify(this.bookmarks));
    
    // Update UI
    this.renderBookmarksList();
    this.updateBookmarkButton(topic);
    
    // Refresh profile
    await this.loadProfileData();
    
    window.utils.showNotification(`Removed "${topic}" from bookmarks`, '✕');
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

    forceUpdateCase() {
    // Force update the entire UI
    if (this.currentTopic) {
        // Re-display the current topic with new case
        const tempTopic = this.currentTopic;
        this.currentTopic = null; // Force refresh
        setTimeout(() => {
            this.displayResults(tempTopic);
        }, 50);
    } else {
        // Refresh home screen
        this.showHomeScreen();
    }
    
    // Update panels
    this.renderTopicsList();
    this.renderBookmarksList();
    this.renderHistoryPanel();
}

    toggleCase() {
        this.isUpperCase = !this.isUpperCase;
        this.caseToggle.classList.toggle('active', this.isUpperCase);
        this.saveState();
        
        // // Re-render current topic if any
        // if (this.currentTopic) {
        //     this.displayResults(this.currentTopic);
        // }

    // Force update the entire UI
        this.forceUpdateCase();

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
    console.log('Loading bookmarks...');
    
    if (window.databaseManager && window.authManager?.isAuthenticated()) {
        try {
            console.log('Loading bookmarks from cloud...');
            const bookmarks = await window.databaseManager.getUserBookmarks();
            this.bookmarks = bookmarks.map(item => item.topic || item);
            console.log(`Loaded ${this.bookmarks.length} bookmarks from cloud`);
        } catch (error) {
            console.error('Error loading bookmarks from cloud:', error);
            this.bookmarks = JSON.parse(localStorage.getItem('dictionaryBookmarks')) || [];
        }
    } else {
        this.bookmarks = JSON.parse(localStorage.getItem('dictionaryBookmarks')) || [];
    }
    
    this.renderBookmarksList();
    return this.bookmarks;
}

async toggleBookmark(topic) {
    if (!topic) {
        console.error('No topic provided for bookmark');
        return;
    }
    
    console.log(`Toggling bookmark for: ${topic}`);
    
    try {
        const isCurrentlyBookmarked = this.isBookmarked(topic);
        
        if (window.databaseManager && window.authManager?.isAuthenticated()) {
            // Use database manager
            if (isCurrentlyBookmarked) {
                const success = await window.databaseManager.removeBookmark(topic);
                if (success) {
                    // Remove from local array
                    const index = this.bookmarks.indexOf(topic);
                    if (index !== -1) {
                        this.bookmarks.splice(index, 1);
                    }
                    window.utils.showNotification(`Removed "${topic}" from bookmarks`, '✕');
                }
            } else {
                const success = await window.databaseManager.addBookmark(topic);
                if (success) {
                    // Add to local array
                    this.bookmarks.unshift(topic);
                    window.utils.showNotification(`Bookmarked "${topic}"`, '🔖');
                }
            }
            
            // Update counts in database
            await window.databaseManager.updateUserCounts();
            
            // Refresh profile data
            await this.loadProfileData();
            
        } else {
            // Use local storage only
            if (isCurrentlyBookmarked) {
                // Remove bookmark
                const index = this.bookmarks.indexOf(topic);
                if (index !== -1) {
                    this.bookmarks.splice(index, 1);
                }
                window.utils.showNotification(`Removed "${topic}" from bookmarks`, '✕');
            } else {
                // Add bookmark
                this.bookmarks.unshift(topic);
                window.utils.showNotification(`Bookmarked "${topic}"`, '🔖');
            }
            
            // Save to local storage
            localStorage.setItem('dictionaryBookmarks', JSON.stringify(this.bookmarks));
        }
        
        // Update UI
        this.renderBookmarksList();
        this.updateBookmarkButton(topic);
        
        console.log(`Bookmark toggled. Now bookmarked: ${!isCurrentlyBookmarked}`);
        
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        window.utils.showNotification('Error updating bookmark', '❌', true);
    }
}

isBookmarked(topic) {
    return this.bookmarks.includes(topic);
}

updateBookmarkButton(topic) {
    const bookmarkAction = document.getElementById('bookmarkAction');
    if (bookmarkAction && topic) {
        bookmarkAction.textContent = this.isBookmarked(topic) ? '★' : '☆';
        bookmarkAction.title = this.isBookmarked(topic) ? 'Remove bookmark' : 'Add bookmark';
    }
}

renderBookmarksList() {
    if (!this.bookmarksList) return;
    
    this.bookmarksList.innerHTML = '';
    
    if (this.bookmarks.length === 0) {
        this.bookmarksList.innerHTML = `
            <div class="empty-state">
                <span>🔖</span>
                <p>No bookmarks yet</p>
                <p class="hint">Click the bookmark icon on any topic to save it here</p>
            </div>
        `;
        return;
    }
    
    this.bookmarks.forEach((bookmark, index) => {
        const bookmarkItem = document.createElement('div');
        bookmarkItem.className = 'bookmark-item';
        bookmarkItem.innerHTML = `
            <div class="bookmark-content">
                <span class="bookmark-icon">🔖</span>
                <div class="bookmark-text">${bookmark}</div>
            </div>
            <button class="remove-bookmark" data-index="${index}" title="Remove bookmark">
                ✕
            </button>
        `;
        
        // Click on bookmark to search it
        bookmarkItem.querySelector('.bookmark-content').addEventListener('click', () => {
            this.searchInput.value = bookmark;
            this.handleSearch();
            this.closeAllPanels();
        });
        
        // Click remove button
        bookmarkItem.querySelector('.remove-bookmark').addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.removeBookmark(bookmark);
        });
        
        this.bookmarksList.appendChild(bookmarkItem);
    });
}

async removeBookmark(topic) {
    if (!topic) return;
    
    console.log(`Removing bookmark: ${topic}`);
    
    if (window.databaseManager && window.authManager?.isAuthenticated()) {
        // Remove from cloud
        await window.databaseManager.removeBookmark(topic);
        await window.databaseManager.updateUserCounts();
    }
    
    // Remove from local array
    const index = this.bookmarks.indexOf(topic);
    if (index !== -1) {
        this.bookmarks.splice(index, 1);
    }
    
    // Save to local storage
    localStorage.setItem('dictionaryBookmarks', JSON.stringify(this.bookmarks));
    
    // Update UI
    this.renderBookmarksList();
    this.updateBookmarkButton(topic);
    
    // Refresh profile
    await this.loadProfileData();
    
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
    
   // In ui.js, update the loadProfileData method
// In ui.js - Update the loadProfileData method
async loadProfileData() {
    if (!window.databaseManager) {
        console.warn('Database manager not available');
        return;
    }
    
    try {
        const userData = await window.databaseManager.getUserData();
        if (!userData) {
            console.warn('No user data available');
            return;
        }
        
        console.log('Loading profile data:', userData);
        
        // Update all profile elements
        this.updateElementText('profileName', userData.displayName || 'User');
        this.updateElementText('profileEmail', userData.email || 'user@example.com');
        this.updateElementText('bookmarksCount', userData.bookmarksCount || 0);
        this.updateElementText('historyCount', userData.historyCount || 0);
        this.updateElementText('createdCount', userData.notesCount || 0);
        
        // Update avatar
        const avatar = document.getElementById('profileAvatar');
        if (avatar && userData.displayName) {
            avatar.textContent = userData.displayName.charAt(0).toUpperCase();
        }
        
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`Element ${elementId} not found`);
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
    
    // Optional: Save to cloud if available (but don't fail if method doesn't exist)
    this.safeSaveToCloud(state);
}

async safeSaveToCloud(state) {
    if (!window.databaseManager || !window.databaseManager.currentUserId) {
        return;
    }
    
    try {
        // Check if method exists
        if (window.databaseManager.updateUserPreferences) {
            await window.databaseManager.updateUserPreferences({
                theme: state.theme,
                fontSize: parseFloat(state.fontSize),
                case: state.case
            });
        }
    } catch (error) {
        console.warn('Could not save preferences to cloud:', error);
        // Don't throw error - just log it
    }
}
    
    loadState() {
    try {
        const savedState = JSON.parse(localStorage.getItem('dictionaryState'));
        
        if (savedState) {
            this.isDarkTheme = savedState.theme === 'dark';
            this.isUpperCase = savedState.case === 'uppercase';
            
            // Apply theme
            if (this.isDarkTheme) {
                document.body.classList.add('dark-theme');
                this.themeToggle.textContent = '☀️';
            } else {
                this.themeToggle.textContent = '🌙';
            }
            
            // Apply font size
            if (savedState.fontSize) {
                this.setFontSize(savedState.fontSize);
            }
            
            // Apply case
            if (this.isUpperCase) {
                this.caseToggle.classList.add('active');
            }
            
            console.log('Loaded saved state:', savedState);
        }
    } catch (error) {
        console.error('Error loading saved state:', error);
        // Use defaults if error occurs
        this.setDefaultState();
    }
}

setDefaultState() {
    this.isDarkTheme = false;
    this.isUpperCase = false;
    document.body.classList.remove('dark-theme');
    this.themeToggle.textContent = '🌙';
    this.caseToggle.classList.remove('active');
    this.setFontSize('1'); // Medium font size
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
        console.log('UIManager: Updating lessons with', Object.keys(newLessons).length, 'topics');
        
        // Merge with default lessons
        this.lessons = {
            //...window.utils.DEFAULT_LESSONS,
            ...newLessons
        };
        
        // Update topics list
        this.renderTopicsList();
        
        // Update current view if needed
        if (this.currentTopic && this.lessons[this.currentTopic]) {
            this.displayResults(this.currentTopic);
        }
        
        console.log('UIManager: Lessons updated successfully');
    }

    // Add this method to your UIManager class
// COMPLETE WORKING SYNC METHOD - replace the entire syncWithCloud method
async syncWithCloud() {
    console.log('syncWithCloud called');
    
    // Check if user is logged in
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        alert('Please log in to sync with cloud');
        return;
    }
    
    // Check if database manager is available
    if (!window.databaseManager) {
        alert('Database connection not available. Please refresh the page.');
        return;
    }
    
    // Check if there are notes to sync
    if (!this.builderDictionary || Object.keys(this.builderDictionary).length === 0) {
        alert('No notes to sync. Add some notes first.');
        return;
    }
    
    // Save button state
    const syncButton = document.getElementById('cloudSyncBtn');
    const originalText = syncButton ? syncButton.textContent : 'Sync with Cloud';
    
    // Update UI to show syncing
    if (syncButton) {
        syncButton.textContent = '⏳ Syncing...';
        syncButton.disabled = true;
    }
    
    try {
        let savedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;
        
        // Loop through all notes
        const topics = Object.keys(this.builderDictionary);
        const totalTopics = topics.length;
        
        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            const data = this.builderDictionary[topic];
            
            try {
                // Check if note already exists in cloud
                let existingNote = null;
                
                // First check if we already have a cloud ID
                if (data.cloudId) {
                    // Try to get the note by ID
                    try {
                        const noteDoc = await window.databaseManager.db.collection('notes')
                            .doc(data.cloudId)
                            .get();
                        
                        if (noteDoc.exists) {
                            existingNote = {
                                id: data.cloudId,
                                ...noteDoc.data()
                            };
                        }
                    } catch (error) {
                        console.warn(`Note with ID ${data.cloudId} not found, will create new`);
                    }
                }
                
                // If not found by ID, search by topic
                if (!existingNote) {
                    existingNote = await window.databaseManager.searchNoteByTopic(topic);
                }
                
                // Prepare note data
                const noteData = {
                    topic: topic,
                    desc: data.desc || '',
                    ex: data.ex || [],
                    updatedAt: new Date()
                };
                
                if (existingNote) {
                    // Update existing note
                    const success = await window.databaseManager.updateNote(existingNote.id, noteData);
                    if (success) {
                        updatedCount++;
                        console.log(`✅ Updated: "${topic}"`);
                        
                        // Update local cloud ID if not already set
                        if (!data.cloudId) {
                            this.builderDictionary[topic].cloudId = existingNote.id;
                        }
                    } else {
                        errorCount++;
                        console.error(`Failed to update: "${topic}"`);
                    }
                } else {
                    // Create new note
                    const noteId = await window.databaseManager.saveNote(noteData);
                    if (noteId) {
                        savedCount++;
                        console.log(`✅ Created: "${topic}" (ID: ${noteId})`);
                        
                        // Store cloud ID locally
                        this.builderDictionary[topic].cloudId = noteId;
                    } else {
                        errorCount++;
                        console.error(`Failed to create: "${topic}"`);
                    }
                }
                
                // Update progress
                if (syncButton && (i + 1) % 5 === 0) {
                    syncButton.textContent = `⏳ Syncing... ${i + 1}/${totalTopics}`;
                }
                
                // Small delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                errorCount++;
                console.error(`Error syncing "${topic}":`, error);
            }
        }
        
        // Update local storage
        this.saveToLocalStorage();
        
        // Update UI
        this.updateBuilderPreview();
        this.updatePreviewTable();
        
        // Show result
        let message = 'Sync completed!\n\n';
        if (savedCount > 0) message += `✅ Saved ${savedCount} new notes to cloud\n`;
        if (updatedCount > 0) message += `✏️ Updated ${updatedCount} existing notes\n`;
        if (errorCount > 0) message += `❌ ${errorCount} errors occurred`;
        
        if (savedCount === 0 && updatedCount === 0 && errorCount === 0) {
            message = '✅ All notes are already in sync with cloud!';
        }
        
        alert(message);
        
        // Show notification
        window.utils.showNotification(
            `Synced ${savedCount + updatedCount} notes`, 
            '☁️', 
            errorCount > 0, 
            savedCount + updatedCount > 0
        );
        
    } catch (error) {
        console.error('Sync failed:', error);
        alert('Sync failed: ' + error.message);
        window.utils.showNotification('Sync failed!', '❌', true);
    } finally {
        // Restore button
        if (syncButton) {
            syncButton.textContent = originalText;
            syncButton.disabled = false;
        }
    }
}

// Update the loadInitialData method to use sync
async loadInitialData() {
    console.log('UIManager: Loading initial data...');
    
    if (window.authManager && window.authManager.isAuthenticated()) {
        console.log('UIManager: User authenticated, checking for sync');
        
        // Check if we should sync
        const lastSync = localStorage.getItem('lastDictionarySync');
        const now = new Date();
        const shouldSync = !lastSync || (now - new Date(lastSync)) > (5 * 60 * 1000); // 5 minutes
        
        if (shouldSync && window.syncManager) {
            console.log('UIManager: Syncing data...');
            await window.syncManager.sync();
        } else if (window.cloudDataManager) {
            console.log('UIManager: Loading from cloud data manager');
            await window.cloudDataManager.loadData();
        }
    } else {
        console.log('UIManager: User not authenticated, loading local data');
        this.loadLocalData();
    }
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