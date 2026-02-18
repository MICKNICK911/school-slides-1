// Authentication Manager Class
class AuthManager {
    constructor() {
        this.auth = firebase.auth();
        this.user = null;
        this.authListeners = [];
        this.initAuth();
    }

    // Initialize authentication
    initAuth() {
    this.auth.onAuthStateChanged((user) => {
        this.user = user;

        if (user) {
            database.setUser(user);          // ✅ set user first
            this.hideAuthModal();
            this.showMainApp();
            this.updateUserInfo(user);
        } else {
            database.setUser(null);
            this.showAuthModal();
            this.hideMainApp();
        }

        this.notifyListeners();               // then notify
    });
}

    // Add auth state listener
    addListener(callback) {
        this.authListeners.push(callback);
    }

    // Remove auth state listener
    removeListener(callback) {
        this.authListeners = this.authListeners.filter(cb => cb !== callback);
    }

    // Notify all listeners
    notifyListeners() {
        this.authListeners.forEach(callback => callback(this.user));
    }

    // Sign in with email/password
    async signIn(email, password) {
        try {
            showLoading('Signing in...');
            
            if (!isValidEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            
            const result = await this.auth.signInWithEmailAndPassword(email, password);
            showToast('success', 'Welcome back!', `Signed in as ${result.user.email}`);
            return result.user;
        } catch (error) {
            console.error('Sign in error:', error);
            
            let message = 'Failed to sign in. Please check your credentials.';
            if (error.code === 'auth/user-not-found') {
                message = 'No account found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                message = 'Incorrect password.';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Too many failed attempts. Please try again later.';
            }
            
            showToast('error', 'Sign In Failed', message);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Sign up with email/password
    async signUp(email, password, confirmPassword) {
        try {
            showLoading('Creating account...');
            
            if (!isValidEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            
            if (!isStrongPassword(password)) {
                throw new Error('Password must be at least 8 characters with uppercase, lowercase, and numbers');
            }
            
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            
            const result = await this.auth.createUserWithEmailAndPassword(email, password);
            showToast('success', 'Welcome!', 'Account created successfully');
            return result.user;
        } catch (error) {
            console.error('Sign up error:', error);
            
            let message = 'Failed to create account.';
            if (error.code === 'auth/email-already-in-use') {
                message = 'This email is already registered.';
            } else if (error.code === 'auth/weak-password') {
                message = 'Password is too weak.';
            }
            
            showToast('error', 'Sign Up Failed', message);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Sign out
    async signOut() {
        try {
            showLoading('Signing out...');
            await this.auth.signOut();
            showToast('success', 'Goodbye!', 'Signed out successfully');
        } catch (error) {
            console.error('Sign out error:', error);
            showToast('error', 'Error', 'Failed to sign out');
        } finally {
            hideLoading();
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            showLoading('Sending reset email...');
            
            if (!isValidEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            
            await this.auth.sendPasswordResetEmail(email);
            showToast('success', 'Email Sent', 'Check your inbox for password reset instructions');
        } catch (error) {
            console.error('Password reset error:', error);
            
            let message = 'Failed to send reset email.';
            if (error.code === 'auth/user-not-found') {
                message = 'No account found with this email.';
            }
            
            showToast('error', 'Reset Failed', message);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.user;
    }

    // Show auth modal
    showAuthModal() {
        const modal = document.getElementById('authModal');
        const mainApp = document.getElementById('mainApp');
        
        if (mainApp) mainApp.style.display = 'none';
        if (modal) {
            modal.style.display = 'flex';
            this.renderAuthUI();
        }
    }

    // Hide auth modal
    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) modal.style.display = 'none';
    }

    // Show main app
    showMainApp() {
        const mainApp = document.getElementById('mainApp');
        if (mainApp) mainApp.style.display = 'block';
    }

    // Hide main app
    hideMainApp() {
        const mainApp = document.getElementById('mainApp');
        if (mainApp) mainApp.style.display = 'none';
    }

    // Update user info in UI
    updateUserInfo(user) {
        const userEmail = document.getElementById('userEmail');
        if (userEmail) {
            userEmail.textContent = user ? user.email : '';
        }
    }

    // Render authentication UI
    renderAuthUI() {
        const container = document.getElementById('authContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="login">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                    <button class="auth-tab" data-tab="signup">
                        <i class="fas fa-user-plus"></i> Sign Up
                    </button>
                </div>
                
                <div id="loginForm" class="auth-form active">
                    <form id="loginFormElement">
                        <div class="form-group">
                            <label for="loginEmail">
                                <i class="fas fa-envelope"></i> Email
                            </label>
                            <input type="email" id="loginEmail" placeholder="Enter your email" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="loginPassword">
                                <i class="fas fa-lock"></i> Password
                            </label>
                            <input type="password" id="loginPassword" placeholder="Enter your password" required>
                        </div>
                        
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-sign-in-alt"></i> Login
                        </button>
                        
                        <div style="margin-top: 10px; text-align: center;">
                            <a href="#" id="forgotPasswordLink">Forgot Password?</a>
                        </div>
                    </form>
                </div>
                
                <div id="signupForm" class="auth-form">
                    <form id="signupFormElement">
                        <div class="form-group">
                            <label for="signupEmail">
                                <i class="fas fa-envelope"></i> Email
                            </label>
                            <input type="email" id="signupEmail" placeholder="Enter your email" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="signupPassword">
                                <i class="fas fa-lock"></i> Password
                            </label>
                            <input type="password" id="signupPassword" placeholder="Create a password" required>
                            <small>Must be at least 8 characters with uppercase, lowercase, and numbers</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="signupConfirmPassword">
                                <i class="fas fa-lock"></i> Confirm Password
                            </label>
                            <input type="password" id="signupConfirmPassword" placeholder="Confirm your password" required>
                        </div>
                        
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-user-plus"></i> Sign Up
                        </button>
                    </form>
                </div>
            </div>
        `;

        this.attachAuthEvents();
    }

    // Attach authentication events
    attachAuthEvents() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
                document.getElementById(tab.dataset.tab === 'login' ? 'loginForm' : 'signupForm').classList.add('active');
            });
        });

        // Login form
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                
                try {
                    await this.signIn(email, password);
                } catch (error) {
                    // Error already handled
                }
            });
        }

        // Signup form
        const signupForm = document.getElementById('signupFormElement');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                const confirmPassword = document.getElementById('signupConfirmPassword').value;
                
                try {
                    await this.signUp(email, password, confirmPassword);
                } catch (error) {
                    // Error already handled
                }
            });
        }

        // Forgot password link
        const forgotLink = document.getElementById('forgotPasswordLink');
        if (forgotLink) {
            forgotLink.addEventListener('click', async (e) => {
                e.preventDefault();
                const email = prompt('Enter your email address:');
                if (email) {
                    try {
                        await this.resetPassword(email);
                    } catch (error) {
                        // Error already handled
                    }
                }
            });
        }
    }
}

// Create global auth instance
const auth = new AuthManager();

// Logout button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => auth.signOut());
    }
});