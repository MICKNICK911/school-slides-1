// scripts/modules/auth.js
import { auth, db, firebase, getFirebaseErrorMessage } from './firebaseConfig.js';
import { showNotification } from './uiManager.js';
import { isOnline } from './utils.js';

// Auth state management
let currentUser = null;
let authStateListeners = [];
let authInitialized = false;

// Initialize authentication system
export const initAuth = () => {
    if (authInitialized) {
        console.warn('Auth already initialized');
        return;
    }
    
    try {
        // Set up auth state observer - FIXED: No Promise needed
        auth.onAuthStateChanged(
            (user) => {
                handleAuthStateChange(user);
            },
            (error) => {
                console.error('Auth state observer error:', error);
                showNotification('Authentication error. Please refresh.', 'error');
            }
        );
        
        authInitialized = true;
        console.log('Auth module initialized');
        
    } catch (error) {
        console.error('Failed to initialize auth:', error);
        showNotification('Failed to initialize authentication', 'error');
    }
};

// Handle auth state changes
const handleAuthStateChange = (user) => {
    const previousUser = currentUser;
    currentUser = user;
    
    // Dispatch auth state change event
    const event = new CustomEvent('authStateChanged', {
        detail: { 
            user,
            previousUser,
            isLoggedIn: !!user,
            timestamp: new Date().toISOString()
        }
    });
    window.dispatchEvent(event);
    
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
            loginModal.setAttribute('aria-hidden', 'true');
            loginModal.hidden = true;
            
            appContainer.style.display = 'block';
            appContainer.setAttribute('aria-hidden', 'false');
            appContainer.hidden = false;
            
            // Update user email display
            if (userEmail) {
                userEmail.textContent = `(${user.email})`;
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
            loginModal.setAttribute('aria-hidden', 'false');
            loginModal.hidden = false;
            
            appContainer.style.display = 'none';
            appContainer.setAttribute('aria-hidden', 'true');
            appContainer.hidden = true;
            
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
                if (loginEmail) {
                    loginEmail.focus();
                    loginEmail.select();
                }
            }, 100);
        }
    } else {
        console.error('Login modal or app container not found in DOM');
    }
};

// Update user metadata in Firestore (optional)
const updateUserMetadata = async (user) => {
    try {
        if (!db) {
            console.warn('Firestore db not available');
            return;
        }
        
        const userRef = db.collection('users').doc(user.uid);
        
        const userData = {
            email: user.email,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || null,
            metadata: {
                creationTime: user.metadata.creationTime,
                lastSignInTime: user.metadata.lastSignInTime
            },
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Set with merge to avoid overwriting existing data
        await userRef.set(userData, { merge: true });
        
        console.log('User metadata updated for:', user.uid);
        
    } catch (error) {
        // Non-critical error, just log it
        console.warn('Failed to update user metadata:', error.message);
    }
};

// Clear authentication data from storage
const clearAuthData = () => {
    try {
        // Clear any auth-related localStorage items
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('auth_') || key.includes('firebase')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn('Failed to remove localStorage item:', key, e);
            }
        });
        
        // Clear sessionStorage as well
        try {
            sessionStorage.clear();
        } catch (e) {
            console.warn('Failed to clear sessionStorage:', e);
        }
        
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
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
            messageEl.className = 'message';
        }
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Additional user setup (optional)
        try {
            await userCredential.user.updateProfile({
                displayName: email.split('@')[0]
            });
        } catch (profileError) {
            console.warn('Failed to update profile:', profileError);
            // Non-critical error, continue
        }
        
        // Show success message
        if (messageEl) {
            messageEl.textContent = 'Account created successfully!';
            messageEl.style.color = 'var(--secondary)';
        }
        
        // Store user preference
        try {
            localStorage.setItem('user_preferences', JSON.stringify({
                email: email,
                createdAt: new Date().toISOString()
            }));
        } catch (storageError) {
            console.warn('Failed to store user preferences:', storageError);
        }
        
        return userCredential.user;
        
    } catch (error) {
        console.error('Sign up error:', error);
        
        // User-friendly error message
        const errorMessage = getFirebaseErrorMessage(error) || error.message;
        
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
            messageEl.className = 'message';
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
        try {
            localStorage.setItem('last_login', new Date().toISOString());
        } catch (e) {
            console.warn('Failed to store login timestamp:', e);
        }
        
        return userCredential.user;
        
    } catch (error) {
        console.error('Sign in error:', error);
        
        // User-friendly error message
        const errorMessage = getFirebaseErrorMessage(error) || error.message;
        
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
    
    try {
        // Show loading state
        showNotification('Signing out...', 'info');
        
        await auth.signOut();
        
        // Clear any pending operations
        window.dispatchEvent(new CustomEvent('userSignedOut'));
        
        // Success message will be shown by auth state change handler
        
    } catch (error) {
        console.error('Sign out error:', error);
        
        const errorMessage = getFirebaseErrorMessage(error) || error.message;
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

// Cleanup auth module
export const cleanupAuth = () => {
    // Clear all registered listeners
    authStateListeners = [];
    
    // Reset state
    currentUser = null;
    authInitialized = false;
    
    console.log('Auth module cleaned up');
};

// Default export
export default {
    initAuth,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    isAuthenticated,
    getUserId,
    getUserEmail,
    cleanupAuth
};

// Initialize auth on module load
if (typeof window !== 'undefined') {
    // Set up auth state persistence
    if (auth && auth.setPersistence) {
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .catch(error => {
                console.warn('Auth persistence error:', error);
            });
    }
    
    // Make auth module available globally for debugging
    window.authModule = {
        initAuth,
        signUp,
        signIn,
        signOut,
        getCurrentUser,
        isAuthenticated,
        getUserId,
        getUserEmail,
        cleanupAuth
    };
}