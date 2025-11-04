// Dashboard API Loader
// Replace mockDB with real API calls

async function loadDashboardData() {
    const apiService = new APIService();
    
    try {
        // Get current user from API
        const user = await apiService.getCurrentUser();
        window.currentUser = user;
        
        // Load user-specific data based on type
        if (user.user_type === 'startup') {
            await loadStartupDashboard(user);
        } else if (user.user_type === 'organization') {
            await loadOrganizationDashboard(user);
        } else if (user.user_type === 'admin') {
            await loadAdminDashboard(user);
        }
        
        // Update UI
        updateDashboardUI(user);
        
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        // Redirect to login if token invalid
        window.location.href = '/irl-assessment-platform/landing/';
    }
}

async function loadStartupDashboard(user) {
    const apiService = new APIService();
    
    // Load assessments
    const assessments = await apiService.getAssessments();
    window.userAssessments = assessments || [];
    
    // Update stats
    document.getElementById('assessmentCount').textContent = assessments.length;
    
    if (assessments.length > 0) {
        const latest = assessments[0];
        document.getElementById('currentIRL').textContent = `Level ${latest.irl_level}`;
        
        // Calculate avg score
        const scores = JSON.parse(latest.scores);
        const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
        document.getElementById('avgScore').textContent = Math.round(avgScore);
    }
}

async function loadOrganizationDashboard(user) {
    // Organization dashboard - manage multiple startups
    console.log('Organization dashboard not yet implemented');
}

async function loadAdminDashboard(user) {
    const apiService = new APIService();
    
    try {
        const stats = await apiService.getAdminStats();
        // Update admin stats UI
        console.log('Admin stats:', stats);
    } catch (error) {
        console.error('Failed to load admin stats:', error);
    }
}

function updateDashboardUI(user) {
    // Update welcome message
    const welcomeMsg = document.querySelector('.welcome-message h1');
    if (welcomeMsg) {
        welcomeMsg.textContent = `Welcome back, ${user.name}!`;
    }
    
    // Update user type badge
    const userTypeBadge = document.querySelector('.user-type-badge');
    if (userTypeBadge) {
        userTypeBadge.textContent = user.user_type.toUpperCase();
    }
}

// Load on page ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDashboardData);
} else {
    loadDashboardData();
}
