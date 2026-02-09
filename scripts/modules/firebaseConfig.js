// scripts/modules/auth.js
import { auth, getFirebaseErrorMessage } from './firebaseConfig.js';
import { showNotification } from './uiManager.js';

// Auth state
let currentUser = null;

// Initialize authentication
export const initAuth = () => {
    try {
        auth.onAuthStateChanged((user) => {
            currentUser = user;
            
            // Update UI
            const loginModal = document.getElementById('loginModal');
            const appContainer = document.getElementById('appContainer');
            
            if (user) {
                // User is signed in
                loginModal.style.display = 'none';
                appContainer.style.display = 'block';
                document.getElementById('userEmail').textContent = `(${user.email})`;
                
                showNotification(`Welcome back, ${user.email.split('@')[0]}!`, 'success');
            } else {
                // User is signed out
                loginModal.style.display = 'flex';
                appContainer.style.display = 'none';
                document.getElementById('userEmail').textContent = '';
                
                // Clear form
                document.getElementById('loginEmail').value = '';
                document.getElementById('loginPassword').value = '';
                document.getElementById('loginMessage').textContent = '';
            }
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('authStateChanged', {
                detail: { user }
            }));
        });
        
        console.log('Auth initialized');
    } catch (error) {
        console.error('Auth init error:', error);
    }
};

// Sign up
export const signUp = async (email, password) => {
    const messageEl = document.getElementById('loginMessage');
    
    try {
        messageEl.textContent = 'Creating account...';
        messageEl.style.color = 'var(--primary)';
        
        await auth.createUserWithEmailAndPassword(email, password);
        
        messageEl.textContent = 'Account created successfully!';
        messageEl.style.color = 'var(--secondary)';
        
    } catch (error) {
        const errorMessage = getFirebaseErrorMessage(error);
        messageEl.textContent = errorMessage;
        messageEl.style.color = 'var(--danger)';
        throw new Error(errorMessage);
    }
};

// Sign in
export const signIn = async (email, password) => {
    const messageEl = document.getElementById('loginMessage');
    
    try {
        messageEl.textContent = 'Signing in...';
        messageEl.style.color = 'var(--primary)';
        
        await auth.signInWithEmailAndPassword(email, password);
        
        messageEl.textContent = 'Sign in successful!';
        messageEl.style.color = 'var(--secondary)';
        
        // Clear message after delay
        setTimeout(() => {
            messageEl.textContent = '';
        }, 2000);
        
    } catch (error) {
        const errorMessage = getFirebaseErrorMessage(error);
        messageEl.textContent = errorMessage;
        messageEl.style.color = 'var(--danger)';
        throw new Error(errorMessage);
    }
};

// Sign out
export const signOut = async () => {
    try {
        await auth.signOut();
    } catch (error) {
        const errorMessage = getFirebaseErrorMessage(error);
        showNotification(`Sign out failed: ${errorMessage}`, 'error');
        throw new Error(errorMessage);
    }
};

// Get current user
export const getCurrentUser = () => currentUser;