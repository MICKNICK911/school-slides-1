// In ui.js, replace the saveState and loadState methods:

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