// Add this to your app.js
class AppManager {
    // ... existing code ...
    
    init() {
        console.log('AppManager initializing...');
        
        // Check if user is already logged in
        if (window.authManager && window.authManager.isAuthenticated()) {
            console.log('User already logged in');
            this.showMainApp();
            
            // Start cloud sync after app loads
            setTimeout(() => {
                this.startCloudSync();
            }, 3000);
        } else {
            console.log('User not logged in');
            this.hideSplashScreen();
        }
        
        // ... rest of the init code ...
    }
    
    async startCloudSync() {
        console.log('AppManager: Starting cloud sync...');
        
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            console.log('AppManager: User not authenticated for cloud sync');
            return;
        }
        
        if (window.cloudDataManager) {
            try {
                // Wait for cloud data manager to initialize
                let attempts = 0;
                while (!window.cloudDataManager.isInitialized && attempts < 20) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                
                // Force refresh from cloud
                const success = await window.cloudDataManager.forceRefreshFromCloud();
                
                if (success) {
                    console.log('AppManager: Cloud sync successful');
                } else {
                    console.log('AppManager: No cloud data available');
                }
            } catch (error) {
                console.error('AppManager: Cloud sync error:', error);
            }
        } else {
            console.log('AppManager: CloudDataManager not available');
        }
    }
    
    // ... rest of the class ...
}