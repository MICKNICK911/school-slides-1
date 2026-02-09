// scripts/modules/uiManager.js

export function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = 'notification';
    
    // Set type-specific styling
    switch (type) {
        case 'success':
            notification.style.backgroundColor = 'var(--secondary)';
            break;
        case 'error':
            notification.style.backgroundColor = 'var(--danger)';
            break;
        case 'warning':
            notification.style.backgroundColor = 'var(--warning)';
            notification.style.color = 'var(--dark)';
            break;
        case 'info':
            notification.style.backgroundColor = 'var(--primary)';
            break;
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

export function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.remove('show');
    }
}