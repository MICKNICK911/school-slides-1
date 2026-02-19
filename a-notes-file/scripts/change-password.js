// scripts/change-password.js
class ChangePasswordManager {
    constructor() {
        // DOM Elements
        this.changePasswordModal = document.getElementById('changePasswordModal');
        this.changePasswordBtn = document.getElementById('changePasswordBtn');
        this.closePasswordModal = document.getElementById('closePasswordModal');
        this.submitPasswordChange = document.getElementById('submitPasswordChange');
        this.cancelPasswordChange = document.getElementById('cancelPasswordChange');
        
        // Form elements
        this.currentPassword = document.getElementById('currentPassword');
        this.newPassword = document.getElementById('newPassword');
        this.confirmPassword = document.getElementById('confirmPassword');
        this.passwordMessage = document.getElementById('passwordMessage');
        this.strengthBar = document.querySelector('.strength-bar');
        this.strengthText = document.querySelector('.strength-text');
        
        // Password rules
        this.ruleLength = document.getElementById('ruleLength');
        this.ruleLetter = document.getElementById('ruleLetter');
        this.ruleNumber = document.getElementById('ruleNumber');
        
        this.init();
    }
    
    init() {
        console.log('ChangePasswordManager initializing...');
        
        // Event listeners
        this.changePasswordBtn?.addEventListener('click', () => this.openModal());
        this.closePasswordModal?.addEventListener('click', () => this.closeModal());
        this.cancelPasswordChange?.addEventListener('click', () => this.closeModal());
        
        this.submitPasswordChange?.addEventListener('click', () => this.changePassword());
        
        // Real-time password validation
        this.newPassword?.addEventListener('input', () => this.validatePassword());
        this.confirmPassword?.addEventListener('input', () => this.validatePasswordConfirmation());
        
        // Close modal when clicking outside
        this.changePasswordModal?.addEventListener('click', (e) => {
            if (e.target === this.changePasswordModal) {
                this.closeModal();
            }
        });
        
        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.changePasswordModal.classList.contains('active')) {
                this.closeModal();
            }
        });
        
        console.log('ChangePasswordManager initialized');
    }
    
    openModal() {
        console.log('Opening change password modal...');
        
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            alert('Please log in to change your password');
            return;
        }
        
        // Reset form
        this.resetForm();
        
        // Show modal
        this.changePasswordModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on current password field
        setTimeout(() => {
            this.currentPassword?.focus();
        }, 100);
    }
    
    closeModal() {
        console.log('Closing change password modal...');
        
        this.changePasswordModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.resetForm();
    }
    
    resetForm() {
        // Clear all inputs
        if (this.currentPassword) this.currentPassword.value = '';
        if (this.newPassword) this.newPassword.value = '';
        if (this.confirmPassword) this.confirmPassword.value = '';
        
        // Clear messages
        this.clearMessages();
        
        // Reset validation states
        this.resetValidation();
    }
    
    clearMessages() {
        if (this.passwordMessage) {
            this.passwordMessage.textContent = '';
            this.passwordMessage.className = 'password-message';
            this.passwordMessage.style.display = 'none';
        }
    }
    
    resetValidation() {
        // Remove error/success classes from inputs
        [this.currentPassword, this.newPassword, this.confirmPassword].forEach(input => {
            if (input) {
                input.classList.remove('error', 'success');
            }
        });
        
        // Reset password strength
        if (this.strengthBar) {
            this.strengthBar.className = 'strength-bar';
        }
        
        if (this.strengthText) {
            this.strengthText.textContent = 'Password strength: None';
        }
        
        // Reset rule indicators
        if (this.ruleLength) this.ruleLength.className = '';
        if (this.ruleLetter) this.ruleLetter.className = '';
        if (this.ruleNumber) this.ruleNumber.className = '';
    }
    
    validatePassword() {
        const password = this.newPassword.value;
        
        // Check rules
        const hasLength = password.length >= 6;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        
        // Update rule indicators
        if (this.ruleLength) {
            this.ruleLength.className = hasLength ? 'valid' : '';
        }
        
        if (this.ruleLetter) {
            this.ruleLetter.className = hasLetter ? 'valid' : '';
        }
        
        if (this.ruleNumber) {
            this.ruleNumber.className = hasNumber ? 'valid' : '';
        }
        
        // Calculate password strength
        let strength = 0;
        let strengthText = 'None';
        let strengthClass = '';
        
        if (hasLength) strength++;
        if (hasLetter) strength++;
        if (hasNumber) strength++;
        
        // Update strength indicator
        if (this.strengthBar) {
            switch (strength) {
                case 1:
                    strengthClass = 'weak';
                    strengthText = 'Weak';
                    break;
                case 2:
                    strengthClass = 'medium';
                    strengthText = 'Medium';
                    break;
                case 3:
                    strengthClass = 'strong';
                    strengthText = 'Strong';
                    break;
                default:
                    strengthClass = '';
                    strengthText = 'None';
            }
            
            this.strengthBar.className = `strength-bar ${strengthClass}`;
        }
        
        if (this.strengthText) {
            this.strengthText.textContent = `Password strength: ${strengthText}`;
        }
        
        // Update input styling
        if (this.newPassword) {
            if (strength === 0) {
                this.newPassword.classList.remove('error', 'success');
            } else if (strength === 3) {
                this.newPassword.classList.remove('error');
                this.newPassword.classList.add('success');
            } else {
                this.newPassword.classList.remove('success');
                this.newPassword.classList.add('error');
            }
        }
        
        // Also validate confirmation
        this.validatePasswordConfirmation();
        
        return strength === 3;
    }
    
    validatePasswordConfirmation() {
        const password = this.newPassword.value;
        const confirm = this.confirmPassword.value;
        
        if (!confirm) {
            if (this.confirmPassword) {
                this.confirmPassword.classList.remove('error', 'success');
            }
            return false;
        }
        
        if (this.confirmPassword) {
            if (password === confirm && password.length >= 6) {
                this.confirmPassword.classList.remove('error');
                this.confirmPassword.classList.add('success');
                return true;
            } else {
                this.confirmPassword.classList.remove('success');
                this.confirmPassword.classList.add('error');
                return false;
            }
        }
        
        return false;
    }
    
    async changePassword() {
        console.log('Attempting to change password...');
        
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            this.showError('Please log in to change your password');
            return;
        }
        
        const currentPass = this.currentPassword.value;
        const newPass = this.newPassword.value;
        const confirmPass = this.confirmPassword.value;
        
        // Validate inputs
        if (!currentPass || !newPass || !confirmPass) {
            this.showError('Please fill in all fields');
            return;
        }
        
        if (newPass !== confirmPass) {
            this.showError('New passwords do not match');
            return;
        }
        
        if (!this.validatePassword()) {
            this.showError('New password does not meet requirements');
            return;
        }
        
        if (newPass.length < 6) {
            this.showError('New password must be at least 6 characters');
            return;
        }
        
        if (currentPass === newPass) {
            this.showError('New password must be different from current password');
            return;
        }
        
        try {
            // Show loading state
            this.setLoading(true);
            
            // Get current user
            const user = window.authManager.getCurrentUser();
            if (!user) {
                throw new Error('No user found');
            }
            
            console.log('Re-authenticating user...');
            
            // Re-authenticate user with current password
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                currentPass
            );
            
            await user.reauthenticateWithCredential(credential);
            console.log('User re-authenticated successfully');
            
            // Update password
            console.log('Updating password...');
            await user.updatePassword(newPass);
            console.log('Password updated successfully');
            
            // Show success message
            this.showSuccess('Password changed successfully!');
            
            // Auto-close modal after 2 seconds
            setTimeout(() => {
                this.closeModal();
                
                // Show notification
                if (window.utils) {
                    window.utils.showNotification('Password changed successfully!', '✅', false, true);
                }
            }, 2000);
            
        } catch (error) {
            console.error('Error changing password:', error);
            
            let errorMessage = 'Failed to change password. ';
            
            switch (error.code) {
                case 'auth/wrong-password':
                    errorMessage += 'Current password is incorrect.';
                    break;
                case 'auth/weak-password':
                    errorMessage += 'New password is too weak.';
                    break;
                case 'auth/requires-recent-login':
                    errorMessage += 'Please log in again and try.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage += 'Network error. Please check your connection.';
                    break;
                default:
                    errorMessage += error.message || 'Please try again.';
            }
            
            this.showError(errorMessage);
            
        } finally {
            // Remove loading state
            this.setLoading(false);
        }
    }
    
    setLoading(isLoading) {
        const button = this.submitPasswordChange;
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            button.textContent = 'Changing...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.textContent = 'Change Password';
        }
    }
    
    showError(message) {
        if (this.passwordMessage) {
            this.passwordMessage.textContent = message;
            this.passwordMessage.className = 'password-message error';
            this.passwordMessage.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.clearMessages();
            }, 5000);
        } else {
            alert(message);
        }
    }
    
    showSuccess(message) {
        if (this.passwordMessage) {
            this.passwordMessage.textContent = message;
            this.passwordMessage.className = 'password-message success';
            this.passwordMessage.style.display = 'block';
        } else {
            alert(message);
        }
    }
}

// Initialize Change Password Manager
let changePasswordManager;
document.addEventListener('DOMContentLoaded', () => {
    try {
        changePasswordManager = new ChangePasswordManager();
        window.changePasswordManager = changePasswordManager;
    } catch (error) {
        console.error('Error initializing ChangePasswordManager:', error);
    }
});