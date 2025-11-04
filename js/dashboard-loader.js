// Dashboard API Loader - Initialize dashboard after loading user

async function loadDashboardData() {
    try {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user');
        
        if (!token && !savedUser) {
            console.log('No auth, redirecting to landing');
            window.location.href = '/irl-assessment-platform/landing/';
            return;
        }
        
        // If we have a saved user from API login, use it to initialize
        if (savedUser) {
            const user = JSON.parse(savedUser);
            window.currentUser = user;
            
            // Convert API user format to dashboard format
            const dashboardUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                type: user.user_type,
                organization: user.organization
            };
            
            // Initialize the dashboard with this user
            initializeDashboardWithUser(dashboardUser);
        }
        
        // Try to load fresh data from API
        if (token) {
            const apiService = new APIService();
            
            try {
                const user = await apiService.getCurrentUser();
                window.currentUser = user;
                
                console.log('User loaded from API:', user);
                
                // Load assessments if startup
                if (user.user_type === 'startup') {
                    try {
                        const assessments = await apiService.getAssessments();
                        window.userAssessments = assessments || [];
                        
                        console.log('Assessments loaded:', assessments);
                        
                        // Update stats
                        const countEl = document.querySelector('.stat-card:first-child .stat-value');
                        if (countEl) {
                            countEl.textContent = assessments.length;
                        }
                        
                        if (assessments.length > 0) {
                            const latest = assessments[0];
                            const levelEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
                            if (levelEl) {
                                levelEl.textContent = `Level ${latest.irl_level}`;
                            }
                        }
                    } catch (error) {
                        console.error('Failed to load assessments:', error);
                    }
                }
            } catch (error) {
                console.error('API load error:', error);
                // Continue with saved user data
            }
        }
        
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// Helper function to initialize dashboard with user data
function initializeDashboardWithUser(user) {
    // Update header
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    
    if (userNameEl) {
        userNameEl.textContent = user.name;
    }
    if (userRoleEl) {
        userRoleEl.textContent = user.type.charAt(0).toUpperCase() + user.type.slice(1);
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
    } else if (user.type === 'organization' && orgDash) {
        orgDash.classList.remove('hidden');
    } else if (user.type === 'admin' && adminDash) {
        adminDash.classList.remove('hidden');
    }
}

// Load immediately
loadDashboardData();
