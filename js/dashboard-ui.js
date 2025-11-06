// Dashboard UI Functions - Make globally accessible
// This file contains functions that need to be called from dashboard-loader.js

// Load notifications and show notification bell
window.loadNotifications = async function() {
    console.log('[loadNotifications] Starting...');
    console.log('[loadNotifications] currentUser:', window.currentUser);
    
    const notificationBell = document.getElementById('notificationBell');
    const notificationBadge = document.getElementById('notificationBadge');
    
    if (!notificationBell) {
        console.error('[loadNotifications] notificationBell element not found!');
        return;
    }
    
    // Always show notification bell for all user types
    notificationBell.style.display = 'flex';
    notificationBell.style.visibility = 'visible';
    notificationBell.style.opacity = '1';
    
    console.log('[loadNotifications] Notification bell shown');
    
    if (!window.currentUser) {
        console.warn('[loadNotifications] No currentUser set');
        return;
    }
    
    try {
        const apiService = window.apiService || new APIService();
        let pendingCount = 0;
        
        if (window.currentUser.type === 'startup') {
            // Get pending invitations from organizations
            const invitations = await apiService.getStartupPendingInvitations();
            pendingCount = (invitations || []).length;
            console.log('[loadNotifications] Startup pending invitations:', pendingCount);
        } else if (window.currentUser.type === 'organization') {
            // Get pending requests from startups
            const requests = await apiService.getOrgPendingInvitations();
            pendingCount = (requests || []).length;
            console.log('[loadNotifications] Organization pending requests:', pendingCount);
        }
        
        // Update badge
        if (notificationBadge) {
            if (pendingCount > 0) {
                notificationBadge.textContent = pendingCount;
                notificationBadge.style.display = 'flex';
            } else {
                notificationBadge.style.display = 'none';
            }
        }
        
        console.log('[loadNotifications] Complete! Badge count:', pendingCount);
    } catch (error) {
        console.error('[loadNotifications] Error loading notifications:', error);
        // Still show bell even if loading fails
        notificationBell.style.display = 'flex';
    }
};

// Update search bar visibility based on user type
window.updateSearchBarVisibility = function() {
    console.log('[updateSearchBarVisibility] Starting...');
    console.log('[updateSearchBarVisibility] currentUser:', window.currentUser);
    
    const searchBar = document.getElementById('searchBar');
    
    if (!searchBar) {
        console.error('[updateSearchBarVisibility] searchBar element not found!');
        return;
    }
    
    if (!window.currentUser) {
        console.warn('[updateSearchBarVisibility] No currentUser set');
        return;
    }
    
    // Only show search bar for startups
    if (window.currentUser.type === 'startup') {
        searchBar.style.display = 'flex';
        searchBar.style.visibility = 'visible';
        searchBar.style.opacity = '1';
        console.log('[updateSearchBarVisibility] Search bar shown for startup');
    } else {
        searchBar.style.display = 'none';
        console.log('[updateSearchBarVisibility] Search bar hidden for', window.currentUser.type);
    }
    
    console.log('[updateSearchBarVisibility] Complete!');
};

// Force show notification bell with inline styles
window.forceShowNotificationBell = function() {
    const notificationBell = document.getElementById('notificationBell');
    if (notificationBell) {
        notificationBell.setAttribute('style', 'display: flex !important; visibility: visible !important; opacity: 1 !important;');
        console.log('[forceShowNotificationBell] Bell visibility forced');
    }
};

// Force show search bar with inline styles
window.forceShowSearchBar = function() {
    const searchBar = document.getElementById('searchBar');
    if (searchBar && window.currentUser && window.currentUser.type === 'startup') {
        searchBar.setAttribute('style', 'display: flex !important; visibility: visible !important; opacity: 1 !important;');
        console.log('[forceShowSearchBar] Search bar visibility forced for startup');
    }
};

console.log('✅ Dashboard UI functions loaded and available globally');
console.log('   - window.loadNotifications');
console.log('   - window.updateSearchBarVisibility');
console.log('   - window.forceShowNotificationBell');
console.log('   - window.forceShowSearchBar');
