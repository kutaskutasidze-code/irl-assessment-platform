// Dashboard UI Functions - Loaded before dashboard-loader.js
// These functions need to be available when dashboard-loader.js runs

// Notification System
let notificationsOpen = false;

window.loadNotifications = async function loadNotifications() {
    try {
        console.log('[loadNotifications] Starting...');
        console.log('[loadNotifications] currentUser:', window.currentUser);
        
        // FORCE show the bell
        const bell = document.getElementById('notificationBell');
        console.log('[loadNotifications] Bell element:', bell);
        
        if (!bell) {
            console.error('[loadNotifications] Bell element NOT FOUND!');
            return { pending: [], all: [] };
        }
        
        // Force visibility with multiple methods
        bell.style.display = 'block';
        bell.style.visibility = 'visible';
        bell.style.opacity = '1';
        bell.classList.remove('hidden');
        console.log('[loadNotifications] Bell forced visible with inline styles');
        
        // If no API service or currentUser, still show bell
        if (!window.apiService || !window.currentUser) {
            console.warn('[loadNotifications] No API service or currentUser, showing empty bell');
            return { pending: [], all: [] };
        }
        
        const connections = await window.apiService.getMyConnections();
        const userType = window.currentUser?.type;
        
        // Get pending notifications
        const pendingConnections = connections.filter(c => c.status === 'pending');
        let relevantPending = [];
        
        if (userType === 'startup') {
            relevantPending = pendingConnections.filter(c => c.invited_by === 'organization');
        } else if (userType === 'organization') {
            relevantPending = pendingConnections.filter(c => c.invited_by === 'startup');
        }
        
        // Update badge
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (relevantPending.length > 0) {
                badge.textContent = relevantPending.length;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
        
        console.log('[loadNotifications] Complete. Pending:', relevantPending.length);
        return { pending: relevantPending, all: connections };
    } catch (error) {
        console.error('[loadNotifications] Error:', error);
        // Still show bell even on error
        const bell = document.getElementById('notificationBell');
        if (bell) {
            bell.style.display = 'block';
            bell.style.visibility = 'visible';
            bell.style.opacity = '1';
        }
        return { pending: [], all: [] };
    }
};

// Show/hide search bar based on user type
window.updateSearchBarVisibility = function updateSearchBarVisibility() {
    console.log('[updateSearchBarVisibility] Starting...');
    console.log('[updateSearchBarVisibility] currentUser:', window.currentUser);
    
    const searchContainer = document.getElementById('searchContainer');
    console.log('[updateSearchBarVisibility] Search container:', searchContainer);
    
    if (!searchContainer) {
        console.error('[updateSearchBarVisibility] Search container NOT FOUND!');
        return;
    }
    
    if (window.currentUser && window.currentUser.type === 'startup') {
        searchContainer.style.display = 'block';
        searchContainer.style.visibility = 'visible';
        searchContainer.style.opacity = '1';
        searchContainer.classList.remove('hidden');
        console.log('[updateSearchBarVisibility] Search bar forced visible for startup');
    } else {
        searchContainer.style.display = 'none';
        console.log('[updateSearchBarVisibility] Search bar hidden (not a startup or no user)');
    }
};

console.log('[dashboard-ui.js] Functions defined and exposed globally');
console.log('- window.loadNotifications:', typeof window.loadNotifications);
console.log('- window.updateSearchBarVisibility:', typeof window.updateSearchBarVisibility);
