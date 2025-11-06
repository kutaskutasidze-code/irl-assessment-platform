// Dashboard API Loader - Initialize dashboard after loading user

async function loadDashboardData() {
    try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
            console.log('No auth token, redirecting to landing');
            window.location.href = '/irl-assessment-platform/landing/';
            return;
        }
        
        // Always fetch fresh user data from API
        const apiService = new APIService();
        
        try {
            const user = await apiService.getCurrentUser();
            
            if (!user) {
                console.log('Failed to get user, redirecting to landing');
                localStorage.removeItem('auth_token');
                window.location.href = '/irl-assessment-platform/landing/';
                return;
            }
            
            console.log('User loaded from API:', user);
            
            // Set global currentUser from fresh API data
            window.currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                type: user.user_type,
                organization: user.organization
            };
            
            // Initialize dashboard with API user data
            initializeDashboardWithUser(window.currentUser);
            
            // Load user-specific data based on type
            if (user.user_type === 'startup') {
                await loadStartupData(apiService);
            } else if (user.user_type === 'organization') {
                await loadOrganizationData(apiService);
            } else if (user.user_type === 'admin') {
                await loadAdminData();
            }
            
        } catch (error) {
            console.error('API load error:', error);
            // If API fails, logout and redirect
            localStorage.removeItem('auth_token');
            window.location.href = '/irl-assessment-platform/landing/';
        }
        
    } catch (error) {
        console.error('Dashboard load error:', error);
        window.location.href = '/irl-assessment-platform/landing/';
    }
}

// Load startup-specific data
async function loadStartupData(apiService) {
    try {
        const assessments = await apiService.getMyAssessments();
        window.userAssessments = assessments || [];
        
        console.log('Assessments loaded:', assessments);
        
        // Trigger startup dashboard load
        if (typeof showStartupDashboard === 'function') {
            showStartupDashboard();
        }
    } catch (error) {
        console.error('Failed to load startup data:', error);
    }
}

// Load organization-specific data
async function loadOrganizationData(apiService) {
    try {
        // Trigger organization dashboard load
        if (typeof loadOrganizationData_Index === 'function') {
            loadOrganizationData_Index();
        }
    } catch (error) {
        console.error('Failed to load organization data:', error);
    }
}

// Helper function to initialize dashboard with user data
function initializeDashboardWithUser(user) {
    // Set global currentUser
    window.currentUser = user;
    
    // Update header
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    
    if (userNameEl) {
        userNameEl.textContent = user.name;
    }
    if (userRoleEl) {
        userRoleEl.textContent = user.type.charAt(0).toUpperCase() + user.type.slice(1);
    }
    
    // Load notifications for the bell
    if (typeof loadNotifications === 'function') {
        loadNotifications();
    }
    
    // Show search bar for startups
    if (typeof updateSearchBarVisibility === 'function') {
        updateSearchBarVisibility();
    }
    
    // Show appropriate dashboard
    const startupDash = document.getElementById('startupDashboard');
    const orgDash = document.getElementById('organizationDashboard');
    const adminDash = document.getElementById('adminDashboard');
    
    // Hide all first
    if (startupDash) startupDash.classList.add('hidden');
    if (orgDash) orgDash.classList.add('hidden');
    if (adminDash) adminDash.classList.add('hidden');
    
    // Show the right one
    if (user.type === 'startup' && startupDash) {
        startupDash.classList.remove('hidden');
        // Initialize startup connections UI
        if (typeof startupConnections !== 'undefined') {
            startupConnections.init();
        }
    } else if (user.type === 'organization' && orgDash) {
        orgDash.classList.remove('hidden');
        // Initialize org connections UI
        if (typeof orgConnections !== 'undefined') {
            orgConnections.init();
        }
    } else if (user.type === 'admin' && adminDash) {
        adminDash.classList.remove('hidden');
    }
}

// Wait for DOM to be ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadDashboardData);
} else {
    loadDashboardData();
}
