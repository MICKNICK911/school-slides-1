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
    
    async logout() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            this.showLoginScreen();
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
    
    onLoginSuccess(user) {
        this.loginScreen.style.display = 'none';
        
        // Show splash screen first
        const splashScreen = document.getElementById('splashScreen');
        const loadingProgress = document.getElementById('loadingProgress');
        
        splashScreen.style.display = 'flex';
        loadingProgress.style.width = '100%';
        
        // Hide splash screen and show app after 2 seconds
        setTimeout(() => {
            splashScreen.style.opacity = '0';
            splashScreen.style.pointerEvents = 'none';
            
            setTimeout(() => {
                splashScreen.style.display = 'none';
                this.appContainer.style.display = 'block';
                
                // Initialize app after login
                if (window.appManager) {
                    window.appManager.init();
                }
            }, 800);
        }, 2000);
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