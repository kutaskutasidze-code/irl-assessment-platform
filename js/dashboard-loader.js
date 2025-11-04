// Dashboard API Loader - Non-blocking version

async function loadDashboardData() {
    try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
            console.log('No auth token, using demo mode');
            return;
        }
        
        const apiService = new APIService();
        
        // Get current user
        const user = await apiService.getCurrentUser();
        window.currentUser = user;
        
        console.log('User loaded:', user);
        
        // Update welcome message
        const welcomeMsg = document.querySelector('.welcome-section h1');
        if (welcomeMsg) {
            welcomeMsg.textContent = `Welcome back, ${user.name}!`;
        }
        
        // Load assessments if startup
        if (user.user_type === 'startup') {
            try {
                const assessments = await apiService.getAssessments();
                window.userAssessments = assessments || [];
                
                // Update stats
                const countEl = document.getElementById('totalAssessments') || document.querySelector('.stat-value');
                if (countEl) {
                    countEl.textContent = assessments.length;
                }
                
                if (assessments.length > 0) {
                    const latest = assessments[0];
                    const levelEl = document.getElementById('currentLevel') || document.querySelectorAll('.stat-value')[1];
                    if (levelEl) {
                        levelEl.textContent = `Level ${latest.irl_level}`;
                    }
                }
            } catch (error) {
                console.error('Failed to load assessments:', error);
            }
        }
        
    } catch (error) {
        console.error('Dashboard load error:', error);
        
        // If auth failed, clear token and show message
        if (error.message?.includes('token') || error.message?.includes('401')) {
            localStorage.removeItem('auth_token');
            console.log('Session expired, please login again');
        }
    }
}

// Try to load data but don't block page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(loadDashboardData, 100);
    });
} else {
    setTimeout(loadDashboardData, 100);
}
