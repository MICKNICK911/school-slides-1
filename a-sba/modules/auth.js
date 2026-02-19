import { auth } from './firebase.js';
import { validateEmail } from './utils.js';

export class AuthManager {
    constructor(app) {
        this.app = app;
        this.setupAuthStateListener();
    }

    setupAuthStateListener() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.app.currentUser = user;
                this.app.isGuest = false;
                this.app.handleUserLogin(user);
            } else {
                this.app.currentUser = null;
                this.app.isGuest = true;
                // Only try to show the login screen if the UI is ready
                if (this.app.ui && this.app.ui.mainApp) {
                    if (!this.app.ui.mainApp.style.display || this.app.ui.mainApp.style.display === 'none') {
                        this.app.showLoginScreen();
                    }
                } else {
                    // Fallback: just call showLoginScreen (it will check elements inside)
                    this.app.showLoginScreen();
                }
            }
        }, (error) => {
            console.error('Auth state change error:', error);
            this.app.showToast('Authentication error', 'error');
        });
    }

    async handleLogin(email, password, rememberMe) {
        if (!email || !password) {
            this.app.showToast('Please fill in all fields', 'error');
            return false;
        }
        if (!validateEmail(email)) {
            this.app.showToast('Please enter a valid email', 'error');
            return false;
        }

        try {
            this.app.setLoadingState(this.app.ui.loginBtn, true);
            const userCredential = await auth.signInWithEmailAndPassword(email, password);

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            this.app.showToast('Login successful', 'success');
            return true;
        } catch (error) {
            console.error('Login error:', error);
            let msg = 'Login failed';
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    msg = 'Invalid email or password';
                    break;
                case 'auth/user-disabled':
                    msg = 'Account disabled';
                    break;
                case 'auth/too-many-requests':
                    msg = 'Too many attempts';
                    break;
                case 'auth/network-request-failed':
                    msg = 'Network error';
                    break;
                case 'auth/invalid-email':
                    msg = 'Invalid email';
                    break;
            }
            this.app.showToast(msg, 'error');
            return false;
        } finally {
            this.app.setLoadingState(this.app.ui.loginBtn, false);
        }
    }

    async handleSignup(email, password, confirmPassword, termsAgreed) {
        if (!email || !password || !confirmPassword) {
            this.app.showToast('Please fill all fields', 'error');
            return false;
        }
        if (!validateEmail(email)) {
            this.app.showToast('Invalid email', 'error');
            return false;
        }
        if (password !== confirmPassword) {
            this.app.showToast('Passwords do not match', 'error');
            return false;
        }
        if (password.length < 6) {
            this.app.showToast('Password must be at least 6 characters', 'error');
            return false;
        }
        if (!termsAgreed) {
            this.app.showToast('Please agree to the terms', 'error');
            return false;
        }

        try {
            this.app.setLoadingState(this.app.ui.createAccountBtn, true);
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            // Create user document in Firestore (optional)
            await this.app.db.collection('student_results').doc(userCredential.user.uid).set({
                email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                version: '2.1'
            });
            this.app.showToast('Account created', 'success');
            this.app.ui.closeModal(this.app.ui.signupModal);
            return true;
        } catch (error) {
            console.error('Signup error:', error);
            let msg = 'Signup failed';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    msg = 'Email already in use';
                    break;
                case 'auth/invalid-email':
                    msg = 'Invalid email';
                    break;
                case 'auth/weak-password':
                    msg = 'Password too weak';
                    break;
                case 'auth/network-request-failed':
                    msg = 'Network error';
                    break;
            }
            this.app.showToast(msg, 'error');
            return false;
        } finally {
            this.app.setLoadingState(this.app.ui.createAccountBtn, false);
        }
    }

    async handleResetPassword(email) {
        if (!email) {
            this.app.showToast('Please enter your email', 'error');
            return false;
        }
        if (!validateEmail(email)) {
            this.app.showToast('Invalid email', 'error');
            return false;
        }

        try {
            this.app.setLoadingState(this.app.ui.sendResetBtn, true);
            await auth.sendPasswordResetEmail(email);
            this.app.showToast('Reset email sent', 'success');
            this.app.ui.closeModal(this.app.ui.resetPasswordModal);
            return true;
        } catch (error) {
            console.error('Reset password error:', error);
            let msg = 'Failed to send reset email';
            if (error.code === 'auth/user-not-found') msg = 'No account with that email';
            else if (error.code === 'auth/invalid-email') msg = 'Invalid email';
            else if (error.code === 'auth/network-request-failed') msg = 'Network error';
            this.app.showToast(msg, 'error');
            return false;
        } finally {
            this.app.setLoadingState(this.app.ui.sendResetBtn, false);
        }
    }

    async handleLogout() {
        try {
            if (!this.app.isGuest) {
                await auth.signOut();
            }
            // Guest logout: just reset UI
            this.app.stopPeriodicSync();
            this.app.tables = [];
            this.app.tableCounter = 1;
            localStorage.removeItem('studentResultsData_v2');
            this.app.showLoginScreen();
            this.app.showToast('Logged out', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            this.app.showToast('Logout failed', 'error');
        }
    }

    loginAsGuest() {
        this.app.currentUser = { uid: 'guest_user', email: 'guest@example.com', isAnonymous: true };
        this.app.isGuest = true;
        this.app.handleUserLogin(this.app.currentUser);
        this.app.showToast('Guest mode – data stored locally', 'info');
    }
}