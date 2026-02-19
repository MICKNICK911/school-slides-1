// scripts/fix.js - Add this as a new file
class AppFixer {
    constructor() {
        this.init();
    }
    
    init() {
        this.fixButtonEvents();
        this.fixOverlayIssues();
        this.fixSplashScreen();
        this.fixNavigation();
    }
    
    fixButtonEvents() {
        // Ensure all buttons have proper event listeners
        document.addEventListener('click', (e) => {
            // Handle export toggle if builder manager not initialized
            if (e.target.id === 'exportToggle' || e.target.closest('#exportToggle')) {
                if (window.builderManager && window.builderManager.openBuilder) {
                    window.builderManager.openBuilder();
                } else {
                    const builderContainer = document.getElementById('builderContainer');
                    const appContainer = document.getElementById('appContainer');
                    if (builderContainer && appContainer) {
                        appContainer.style.display = 'none';
                        builderContainer.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                }
            }
            
            // Handle slide toggle if slideshow manager not initialized
            if (e.target.id === 'slideToggle' || e.target.closest('#slideToggle')) {
                if (window.slideshowManager && window.slideshowManager.startSlideshow) {
                    window.slideshowManager.startSlideshow();
                } else {
                    const searchTerm = document.getElementById('searchInput')?.value.trim();
                    if (searchTerm) {
                        alert(`Starting slideshow for: ${searchTerm}\n(Slideshow feature loading...)`);
                    } else {
                        alert('Please search for a topic first');
                    }
                }
            }
        });
    }
    
    fixOverlayIssues() {
        // Ensure overlay closes everything
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                // Close all panels
                const panels = [
                    'historyPanel',
                    'topicsPanel',
                    'bookmarksPanel',
                    'profilePanel',
                    'instructionsModal',
                    'instructionModal',
                    'builderContainer'
                ];
                
                panels.forEach(panelId => {
                    const panel = document.getElementById(panelId);
                    if (panel) panel.classList.remove('active');
                });
                
                // Hide overlay
                overlay.classList.remove('active');
                
                // Restore scroll
                document.body.style.overflow = 'auto';
                
                // Show app container
                const appContainer = document.getElementById('appContainer');
                if (appContainer) appContainer.style.display = 'block';
            });
        }
        
        // Add ESC key handler to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close all panels
                const activePanels = document.querySelectorAll('.active');
                activePanels.forEach(panel => {
                    if (panel.id !== 'appContainer' && panel.id !== 'loginScreen') {
                        panel.classList.remove('active');
                    }
                });
                
                // Hide overlay
                if (overlay) overlay.classList.remove('active');
                
                // Restore scroll
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    fixSplashScreen() {
        // Force hide splash screen after timeout
        setTimeout(() => {
            const splashScreen = document.getElementById('splashScreen');
            if (splashScreen && splashScreen.style.display !== 'none') {
                console.log('Force hiding splash screen');
                splashScreen.style.opacity = '0';
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 800);
            }
        }, 3000);
    }
    
    fixNavigation() {
        // Fix back button issues
        window.addEventListener('popstate', () => {
            // Close all modals and panels when navigating back
            this.closeAllPanels();
        });
    }
    
    closeAllPanels() {
        const panels = document.querySelectorAll('.active');
        panels.forEach(panel => {
            if (!panel.id.includes('appContainer') && !panel.id.includes('loginScreen')) {
                panel.classList.remove('active');
            }
        });
        
        const overlay = document.getElementById('overlay');
        if (overlay) overlay.classList.remove('active');
        
        document.body.style.overflow = 'auto';
    }
}

// Initialize fixer
document.addEventListener('DOMContentLoaded', () => {
    try {
        new AppFixer();
    } catch (error) {
        console.error('Error initializing AppFixer:', error);
    }
});