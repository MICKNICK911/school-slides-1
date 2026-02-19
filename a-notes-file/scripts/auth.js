class AuthManager {
    constructor() {
        this.auth = firebaseServices.auth;
        this.db = firebaseServices.db;
        this.currentUser = null;
        
        // DOM Elements
        this.loginScreen = document.getElementById('loginScreen');
        this.appContainer = document.getElementById('appContainer');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.resetForm = document.getElementById('resetForm');
        this.loginBtn = document.getElementById('loginBtn');
        this.registerBtn = document.getElementById('registerBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.showRegister = document.getElementById('showRegister');
        this.showLogin = document.getElementById('showLogin');
        this.forgotPassword = document.getElementById('forgotPassword');
        this.cancelReset = document.getElementById('cancelReset');
        this.loginError = document.getElementById('loginError');
        this.registerError = document.getElementById('registerError');
        this.resetError = document.getElementById('resetError');
        this.resetSuccess = document.getElementById('resetSuccess');
        
        this.init();
    }
    
    init() {
        
    console.log('AuthManager initializing...');
    
    // First, check auth state before setting up listeners
    const user = this.auth.currentUser;
    if (user) {
        console.log('User already authenticated:', user.email);
        this.currentUser = user;
        this.onLoginSuccess(user);
    } else {
        console.log('No user authenticated');
        this.showLoginScreen();
    }
    
    // Then set up the auth state listener for future changes
    this.auth.onAuthStateChanged((user) => {
        console.log('Auth state changed:', user ? user.email : 'No user');
        if (user) {
            this.currentUser = user;
            this.onLoginSuccess(user);
        } else {
            this.showLoginScreen();
        }
    });
    
    // ... rest of the init method remains the same

        // Check auth state
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.onLoginSuccess(user);
            } else {
                this.showLoginScreen();
            }
        });
        
        // Event listeners
        this.loginBtn.addEventListener('click', () => this.login());
        this.registerBtn.addEventListener('click', () => this.register());
        this.resetBtn.addEventListener('click', () => this.resetPassword());
        this.showRegister.addEventListener('click', () => this.showRegisterForm());
        this.showLogin.addEventListener('click', () => this.showLoginForm());
        this.forgotPassword.addEventListener('click', () => this.showResetForm());
        this.cancelReset.addEventListener('click', () => this.showLoginForm());
        
        // Enter key support
        document.getElementById('loginEmail').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        document.getElementById('loginPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        document.getElementById('registerEmail').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.register();
        });
        document.getElementById('registerPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.register();
        });
        document.getElementById('resetEmail').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.resetPassword();
        });
    }
    
    async login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showError(this.loginError, 'Please fill in all fields');
            return;
        }
        
        try {
            this.loginError.textContent = '';
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            
            // Create or update user document
            await this.updateUserProfile(userCredential.user);
            
            this.onLoginSuccess(userCredential.user);
        } catch (error) {
            this.handleAuthError(error, this.loginError);
        }
    }
    
    async register() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (!name || !email || !password || !confirmPassword) {
            this.showError(this.registerError, 'Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showError(this.registerError, 'Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            this.showError(this.registerError, 'Password must be at least 6 characters');
            return;
        }
        
        try {
            this.registerError.textContent = '';
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Update profile
            await userCredential.user.updateProfile({
                displayName: name
            });
            
            // Create user document
            await this.createUserDocument(userCredential.user);
            
            this.onLoginSuccess(userCredential.user);
        } catch (error) {
            this.handleAuthError(error, this.registerError);
        }
    }
    
    async resetPassword() {
        const email = document.getElementById('resetEmail').value;
        
        if (!email) {
            this.showError(this.resetError, 'Please enter your email');
            return;
        }
        
        try {
            this.resetError.textContent = '';
            this.resetSuccess.textContent = '';
            
            await this.auth.sendPasswordResetEmail(email);
            
            this.resetSuccess.textContent = 'Password reset email sent! Check your inbox.';
            document.getElementById('resetEmail').value = '';
            
            // Return to login after 3 seconds
            setTimeout(() => {
                this.showLoginForm();
            }, 3000);
        } catch (error) {
            this.handleAuthError(error, this.resetError);
        }
    }
    
    async createUserDocument(user) {
        try {
            await db.collection(USERS_COLLECTION).doc(user.uid).set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                bookmarksCount: 0,
                historyCount: 0,
                notesCount: 0,
                preferences: {
                    theme: 'light',
                    fontSize: 1,
                    case: 'normal'
                }
            });
        } catch (error) {
            console.error('Error creating user document:', error);
        }
    }
    
    async updateUserProfile(user) {
        try {
            await db.collection(USERS_COLLECTION).doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    }
    
    // In auth.js, update the logout method
async logout() {
    try {
        // Clear local storage (except preferences)
        const preferences = localStorage.getItem('dictionaryState');
        localStorage.clear();
        
        if (preferences) {
            localStorage.setItem('dictionaryState', preferences);
        }
        
        // Sign out from Firebase
        await this.auth.signOut();
        
        this.currentUser = null;
        this.showLoginScreen();
        
        console.log('User logged out and local data cleared');
    } catch (error) {
        console.error('Error logging out:', error);
    }
}
    
    handleAuthError(error, element) {
        let message = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/user-disabled':
                message = 'This account has been disabled';
                break;
            case 'auth/user-not-found':
                message = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password';
                break;
            case 'auth/email-already-in-use':
                message = 'Email is already in use';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak';
                break;
            case 'auth/too-many-requests':
                message = 'Too many attempts. Try again later';
                break;
            default:
                message = error.message;
        }
        
        this.showError(element, message);
    }
    
    showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            element.textContent = '';
            element.style.display = 'none';
        }, 5000);
    }
    
    showLoginScreen() {
        this.loginScreen.style.display = 'flex';
        this.appContainer.style.display = 'none';
        this.showLoginForm();
    }
    
    showLoginForm() {
        this.loginForm.style.display = 'block';
        this.registerForm.style.display = 'none';
        this.resetForm.style.display = 'none';
        
        // Clear forms
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        this.loginError.textContent = '';
    }
    
    showRegisterForm() {
        this.loginForm.style.display = 'none';
        this.registerForm.style.display = 'block';
        this.resetForm.style.display = 'none';
        
        // Clear forms
        document.getElementById('registerName').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerConfirmPassword').value = '';
        this.registerError.textContent = '';
    }
    
    showResetForm() {
        this.loginForm.style.display = 'none';
        this.registerForm.style.display = 'none';
        this.resetForm.style.display = 'block';
        
        // Clear forms
        document.getElementById('resetEmail').value = '';
        this.resetError.textContent = '';
        this.resetSuccess.textContent = '';
    }
    
    // In auth.js, update the onLoginSuccess method
    // In auth.js, update the onLoginSuccess method
onLoginSuccess(user) {
    console.log('AuthManager: Login successful for', user.email);
    
    this.loginScreen.style.display = 'none';
    this.clearPreviousUserData(user.uid);
    
    // Show splash screen
    const splashScreen = document.getElementById('splashScreen');
    const loadingProgress = document.getElementById('loadingProgress');
    
    splashScreen.style.display = 'flex';
    loadingProgress.style.width = '100%';
    
    // Hide splash screen and show app
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        splashScreen.style.pointerEvents = 'none';
        
        setTimeout(async () => {
            splashScreen.style.display = 'none';
            this.appContainer.style.display = 'block';
            
            console.log('AuthManager: App container shown');
            
            // Initialize app after login
            await this.initializeAppAfterLogin(user);
            
        }, 800);
    }, 2000);
}

async initializeAppAfterLogin(user) {
    console.log('AuthManager: Initializing app after login...');
    
    // Initialize UI Manager if not already
    if (!window.uiManager) {
        console.log('AuthManager: Initializing UI Manager...');
        window.uiManager = new UIManager();
    }
    
    // Initialize Database Manager if not already
    if (!window.databaseManager) {
        console.log('AuthManager: Initializing Database Manager...');
        window.databaseManager = new DatabaseManager();
    }
    
    // Initialize other managers
    if (!window.slideshowManager) {
        window.slideshowManager = new SlideshowManager();
    }
    
    if (!window.builderManager) {
        window.builderManager = new BuilderManager();
    }
    
    // Initialize CloudDataManager after a delay
    setTimeout(async () => {
        console.log('AuthManager: Starting cloud data load...');
        
        if (window.cloudDataManager) {
            try {
                // Force refresh from cloud
                const success = await window.cloudDataManager.forceRefreshFromCloud();
                
                if (!success) {
                    console.log('AuthManager: No cloud data, loading from local');
                    // If no cloud data, load from local
                    window.cloudDataManager.loadFromLocal();
                }
            } catch (error) {
                console.error('AuthManager: Error loading cloud data:', error);
                window.cloudDataManager.loadFromLocal();
            }
        } else {
            console.log('AuthManager: CloudDataManager not available, creating...');
            window.cloudDataManager = new CloudDataManager();
        }
    }, 1000);
    
    // Show welcome message
    if (window.utils) {
        setTimeout(() => {
            window.utils.showNotification(`Welcome back, ${user.displayName || user.email}!`, '👋', false, true);
        }, 1500);
    }
    
    console.log('AuthManager: App initialization complete');

     if (window.cloudSyncManager) {
        console.log('AuthManager: Starting cloud sync...');
        await window.cloudSyncManager.syncFromCloud();
    } else {
        console.log('AuthManager: CloudSyncManager not available');
    }
    
    // Show welcome message
    if (window.utils) {
        setTimeout(() => {
            window.utils.showNotification(`Welcome ${user.displayName || user.email}!`, '👋', false, true);
        }, 1000);
    }
   
}

// In auth.js, add this method to AuthManager class
async changePassword(currentPassword, newPassword) {
    const user = this.auth.currentUser;
    if (!user) {
        throw new Error('No user logged in');
    }
    
    try {
        // Re-authenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        
        await user.reauthenticateWithCredential(credential);
        
        // Update password
        await user.updatePassword(newPassword);
        
        return true;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
}

clearPreviousUserData(currentUserId) {
    // Get last user ID from localStorage
    const lastUserId = localStorage.getItem('lastUserId');
    
    if (lastUserId && lastUserId !== currentUserId) {
        console.log('Different user logged in, clearing old data...');
        
        // Clear local dictionary
        localStorage.removeItem('customDictionary');
        
        // Clear bookmarks and history from localStorage
        localStorage.removeItem('dictionaryBookmarks');
        localStorage.removeItem('dictionarySearchHistory');
    }
    
    // Store current user ID
    localStorage.setItem('lastUserId', currentUserId);
}
    
    // Add this method to AuthManager class
isAuthenticated() {
    return this.currentUser !== null;
}
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Initialize Auth Manager
let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    window.authManager = authManager;
});