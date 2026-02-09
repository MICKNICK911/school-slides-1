// scripts/modules/auth.js
import { auth, getFirebaseErrorMessage } from './firebaseConfig.js';
import { showNotification } from './uiManager.js';
import { isOnline, handleError } from './utils.js';

// Auth state management
let currentUser = null;
let authStateListeners = [];
let authInitialized = false;

// Initialize authentication system
export const initAuth = () => {
    if (authInitialized) {
        console.warn('Auth already initialized');
        return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
        try {
            // Set up auth state observer
            const unsubscribe = auth.onAuthStateChanged(
                (user) => {
                    handleAuthStateChange(user);
                    resolve();
                },
                (error) => {
                    console.error('Auth state observer error:', error);
                    showNotification('Authentication error. Please refresh.', 'error');
                    reject(error);
                }
            );
            
            // Store unsubscribe function for cleanup
            window.authUnsubscribe = unsubscribe;
            
            authInitialized = true;
            console.log('Auth module initialized');
            
        } catch (error) {
            console.error('Failed to initialize auth:', error);
            showNotification('Failed to initialize authentication', 'error');
            reject(error);
        }
    });
};

// Handle auth state changes
const handleAuthStateChange = (user) => {
    const previousUser = currentUser;
    currentUser = user;
    
    // Dispatch auth state change event
    window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { 
            user,
            previousUser,
            isLoggedIn: !!user,
            timestamp: new Date().toISOString()
        }
    }));
    
    // Update UI based on auth state
    updateAuthUI(user);
    
    // Log for debugging
    if (user) {
        console.log('User signed in:', user.email, user.uid);
        
        // Update user metadata if needed
        updateUserMetadata(user);
        
    } else if (previousUser) {
        console.log('User signed out:', previousUser.email);
        
        // Clear any sensitive data from storage
        clearAuthData();
    }
    
    // Notify all registered listeners
    authStateListeners.forEach(listener => {
        try {
            listener(user, previousUser);
        } catch (error) {
            console.error('Auth state listener error:', error);
        }
    });
};

// Update UI based on authentication state
const updateAuthUI = (user) => {
    const loginModal = document.getElementById('loginModal');
    const appContainer = document.getElementById('appContainer');
    const userEmail = document.getElementById('userEmail');
    
    if (loginModal && appContainer) {
        if (user) {
            // User is signed in
            loginModal.style.display = 'none';
            appContainer.style.display = 'block';
            
            // Update user email display
            if (userEmail) {
                userEmail.textContent = user.email;
                userEmail.title = `User ID: ${user.uid}`;
            }
            
            // Show welcome notification (first time only)
            if (!window.userWelcomed) {
                setTimeout(() => {
                    showNotification(`Welcome back, ${user.email.split('@')[0]}!`, 'success');
                    window.userWelcomed = true;
                }, 500);
            }
            
        } else {
            // User is signed out
            loginModal.style.display = 'flex';
            appContainer.style.display = 'none';
            window.userWelcomed = false;
            
            // Clear login form
            const loginEmail = document.getElementById('loginEmail');
            const loginPassword = document.getElementById('loginPassword');
            const loginMessage = document.getElementById('loginMessage');
            
            if (loginEmail) loginEmail.value = '';
            if (loginPassword) loginPassword.value = '';
            if (loginMessage) loginMessage.textContent = '';
            
            // Focus on email input
            setTimeout(() => {
                if (loginEmail) loginEmail.focus();
            }, 100);
        }
    }
};

// Update user metadata in Firestore (optional)
const updateUserMetadata = async (user) => {
    try {
        const { db } = await import('./firebaseConfig.js');
        const userRef = db.collection('users').doc(user.uid);
        
        await userRef.set({
            email: user.email,
            lastLogin: new Date(),
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || null,
            metadata: {
                creationTime: user.metadata.creationTime,
                lastSignInTime: user.metadata.lastSignInTime
            }
        }, { merge: true });
        
    } catch (error) {
        // Non-critical error, just log it
        console.warn('Failed to update user metadata:', error);
    }
};

// Clear authentication data from storage
const clearAuthData = () => {
    // Clear any auth-related localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('auth_') || key.startsWith('firebase:authUser:')) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage as well
    sessionStorage.clear();
};

// Sign up with email and password
export const signUp = async (email, password) => {
    // Validation
    if (!email || !password) {
        throw new Error('Please enter both email and password');
    }
    
    if (!isOnline()) {
        throw new Error('You are offline. Please connect to the internet to sign up.');
    }
    
    const messageEl = document.getElementById('loginMessage');
    
    try {
        // Show loading state
        if (messageEl) {
            messageEl.textContent = 'Creating account...';
            messageEl.style.color = 'var(--primary)';
        }
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Additional user setup (optional)
        await userCredential.user.updateProfile({
            displayName: email.split('@')[0]
        });
        
        // Show success message
        if (messageEl) {
            messageEl.textContent = 'Account created successfully!';
            messageEl.style.color = 'var(--secondary)';
        }
        
        // Store user preference
        localStorage.setItem('user_preferences', JSON.stringify({
            email: email,
            createdAt: new Date().toISOString()
        }));
        
        return userCredential.user;
        
    } catch (error) {
        console.error('Sign up error:', error);
        
        // User-friendly error message
        const errorMessage = getFirebaseErrorMessage(error);
        
        if (messageEl) {
            messageEl.textContent = errorMessage;
            messageEl.style.color = 'var(--danger)';
        }
        
        throw new Error(errorMessage);
    }
};

// Sign in with email and password
export const signIn = async (email, password) => {
    // Validation
    if (!email || !password) {
        throw new Error('Please enter both email and password');
    }
    
    if (!isOnline()) {
        throw new Error('You are offline. Please connect to the internet to sign in.');
    }
    
    const messageEl = document.getElementById('loginMessage');
    
    try {
        // Show loading state
        if (messageEl) {
            messageEl.textContent = 'Signing in...';
            messageEl.style.color = 'var(--primary)';
        }
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Show success message briefly
        if (messageEl) {
            messageEl.textContent = 'Sign in successful!';
            messageEl.style.color = 'var(--secondary)';
            
            // Clear message after 2 seconds
            setTimeout(() => {
                if (messageEl) messageEl.textContent = '';
            }, 2000);
        }
        
        // Store login timestamp
        localStorage.setItem('last_login', new Date().toISOString());
        
        return userCredential.user;
        
    } catch (error) {
        console.error('Sign in error:', error);
        
        // User-friendly error message
        const errorMessage = getFirebaseErrorMessage(error);
        
        if (messageEl) {
            messageEl.textContent = errorMessage;
            messageEl.style.color = 'var(--danger)';
        }
        
        throw new Error(errorMessage);
    }
};

// Sign out
export const signOut = async () => {
    if (!currentUser) {
        console.warn('No user to sign out');
        return;
    }
    
    if (!isOnline()) {
        showNotification('You are offline. Sign out will complete when you\'re back online.', 'warning');
        return;
    }
    
    try {
        // Show loading state
        showNotification('Signing out...', 'info');
        
        await auth.signOut();
        
        // Clear any pending operations
        window.dispatchEvent(new CustomEvent('userSignedOut'));
        
        // Success message will be shown by auth state change handler
        
    } catch (error) {
        console.error('Sign out error:', error);
        
        const errorMessage = getFirebaseErrorMessage(error);
        showNotification(`Sign out failed: ${errorMessage}`, 'error');
        
        throw new Error(errorMessage);
    }
};

// Get current user
export const getCurrentUser = () => {
    return currentUser;
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!currentUser;
};

// Get user ID (safe version)
export const getUserId = () => {
    return currentUser ? currentUser.uid : null;
};

// Get user email
export const getUserEmail = () => {
    return currentUser ? currentUser.email : null;
};

// Add auth state change listener
export const onAuthStateChanged = (callback) => {
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
    }
    
    authStateListeners.push(callback);
    
    // Immediately call with current user if exists
    if (currentUser) {
        try {
            callback(currentUser, null);
        } catch (error) {
            console.error('Auth listener callback error:', error);
        }
    }
    
    // Return unsubscribe function
    return () => {
        const index = authStateListeners.indexOf(callback);
        if (index > -1) {
            authStateListeners.splice(index, 1);
        }
    };
};

// Password reset
export const resetPassword = async (email) => {
    if (!email) {
        throw new Error('Please enter your email address');
    }
    
    if (!isOnline()) {
        throw new Error('You are offline. Please connect to the internet to reset password.');
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        showNotification('Password reset email sent. Check your inbox.', 'success');
        return true;
    } catch (error) {
        console.error('Password reset error:', error);
        
        const errorMessage = getFirebaseErrorMessage(error);
        showNotification(`Password reset failed: ${errorMessage}`, 'error');
        
        throw new Error(errorMessage);
    }
};

// Update user profile
export const updateUserProfile = async (updates) => {
    if (!currentUser) {
        throw new Error('No user signed in');
    }
    
    if (!updates || typeof updates !== 'object') {
        throw new Error('Invalid updates object');
    }
    
    try {
        await currentUser.updateProfile(updates);
        showNotification('Profile updated successfully', 'success');
        return true;
    } catch (error) {
        console.error('Update profile error:', error);
        
        const errorMessage = getFirebaseErrorMessage(error);
        showNotification(`Profile update failed: ${errorMessage}`, 'error');
        
        throw new Error(errorMessage);
    }
};

// Update user email
export const updateUserEmail = async (newEmail) => {
    if (!currentUser) {
        throw new Error('No user signed in');
    }
    
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        throw new Error('Please enter a valid email address');
    }
    
    try {
        await currentUser.updateEmail(newEmail);
        showNotification('Email updated successfully', 'success');
        return true;
    } catch (error) {
        console.error('Update email error:', error);
        
        const errorMessage = getFirebaseErrorMessage(error);
        showNotification(`Email update failed: ${errorMessage}`, 'error');
        
        // If error is about re-authentication, guide user
        if (error.code === 'auth/requires-recent-login') {
            showNotification('Please sign in again to update your email', 'warning');
        }
        
        throw new Error(errorMessage);
    }
};

// Update user password
export const updateUserPassword = async (newPassword) => {
    if (!currentUser) {
        throw new Error('No user signed in');
    }
    
    if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }
    
    try {
        await currentUser.updatePassword(newPassword);
        showNotification('Password updated successfully', 'success');
        return true;
    } catch (error) {
        console.error('Update password error:', error);
        
        const errorMessage = getFirebaseErrorMessage(error);
        showNotification(`Password update failed: ${errorMessage}`, 'error');
        
        // If error is about re-authentication, guide user
        if (error.code === 'auth/requires-recent-login') {
            showNotification('Please sign in again to update your password', 'warning');
        }
        
        throw new Error(errorMessage);
    }
};

// Delete user account
export const deleteUserAccount = async () => {
    if (!currentUser) {
        throw new Error('No user signed in');
    }
    
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will delete all your data.')) {
        return false;
    }
    
    try {
        // First, delete user data from Firestore
        const { db } = await import('./firebaseConfig.js');
        const userRef = db.collection('users').doc(currentUser.uid);
        
        // Delete user document and all subcollections
        const batch = db.batch();
        
        // Get all tables and delete them
        const tablesSnapshot = await userRef.collection('tables').get();
        tablesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Delete user document
        batch.delete(userRef);
        
        await batch.commit();
        
        // Then delete the auth user
        await currentUser.delete();
        
        showNotification('Account deleted successfully', 'success');
        return true;
        
    } catch (error) {
        console.error('Delete account error:', error);
        
        const errorMessage = getFirebaseErrorMessage(error);
        showNotification(`Account deletion failed: ${errorMessage}`, 'error');
        
        throw new Error(errorMessage);
    }
};

// Get auth token (for API calls)
export const getIdToken = async (forceRefresh = false) => {
    if (!currentUser) {
        return null;
    }
    
    try {
        return await currentUser.getIdToken(forceRefresh);
    } catch (error) {
        console.error('Get ID token error:', error);
        return null;
    }
};

// Check if user has verified email
export const isEmailVerified = () => {
    return currentUser ? currentUser.emailVerified : false;
};

// Send email verification
export const sendEmailVerification = async () => {
    if (!currentUser) {
        throw new Error('No user signed in');
    }
    
    if (currentUser.emailVerified) {
        showNotification('Email is already verified', 'info');
        return true;
    }
    
    try {
        await currentUser.sendEmailVerification();
        showNotification('Verification email sent. Please check your inbox.', 'success');
        return true;
    } catch (error) {
        console.error('Send verification email error:', error);
        
        const errorMessage = getFirebaseErrorMessage(error);
        showNotification(`Failed to send verification: ${errorMessage}`, 'error');
        
        throw new Error(errorMessage);
    }
};

// Cleanup auth module
export const cleanupAuth = () => {
    // Remove auth state listener
    if (window.authUnsubscribe) {
        window.authUnsubscribe();
        delete window.authUnsubscribe;
    }
    
    // Clear all registered listeners
    authStateListeners = [];
    
    // Reset state
    currentUser = null;
    authInitialized = false;
    
    console.log('Auth module cleaned up');
};

// Re-authenticate user (for sensitive operations)
export const reauthenticateUser = async (password) => {
    if (!currentUser || !currentUser.email) {
        throw new Error('No user signed in');
    }
    
    if (!password) {
        throw new Error('Please enter your password');
    }
    
    try {
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            password
        );
        
        await currentUser.reauthenticateWithCredential(credential);
        return true;
        
    } catch (error) {
        console.error('Re-authentication error:', error);
        
        const errorMessage = getFirebaseErrorMessage(error);
        throw new Error(errorMessage);
    }
};

// Initialize on import
if (typeof window !== 'undefined') {
    // Set up auth state persistence
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .catch(error => {
            console.warn('Auth persistence error:', error);
        });
    
    // Make auth module available globally for debugging
    window.authModule = {
        initAuth,
        signUp,
        signIn,
        signOut,
        getCurrentUser,
        isAuthenticated,
        resetPassword,
        updateUserProfile,
        updateUserEmail,
        updateUserPassword,
        deleteUserAccount,
        getIdToken,
        isEmailVerified,
        sendEmailVerification,
        cleanupAuth,
        reauthenticateUser
    };
}

// Default export
export default {
    initAuth,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    isAuthenticated,
    onAuthStateChanged,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    deleteUserAccount,
    getIdToken,
    isEmailVerified,
    sendEmailVerification,
    cleanupAuth,
    reauthenticateUser,
    getUserId,
    getUserEmail
};