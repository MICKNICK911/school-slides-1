// scripts/modules/user.js - SIMPLE LOCAL USER MANAGEMENT
// This handles local user state without any authentication

// Local user state
let currentUser = {
    id: 'local_user',
    email: 'local@user.com',
    name: 'Local User',
    isLocal: true
};

// Get current user (always returns local user)
export const getCurrentUser = () => {
    return currentUser;
};

// Get user ID
export const getUserId = () => {
    return currentUser.id;
};

// Check if user is authenticated (always true in local mode)
export const isAuthenticated = () => {
    return true;
};

// No initialization needed
export const initUser = () => {
    console.log('User module initialized (Local Mode)');
    return currentUser;
};

// No cleanup needed
export const cleanupUser = () => {
    console.log('User module cleaned up');
};

// Default export
export default {
    getCurrentUser,
    getUserId,
    isAuthenticated,
    initUser,
    cleanupUser
};

// Make available globally
if (typeof window !== 'undefined') {
    window.userModule = {
        getCurrentUser,
        getUserId,
        isAuthenticated,
        initUser,
        cleanupUser
    };
}