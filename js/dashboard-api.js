// Dashboard API Integration
const API_URL = 'https://irl-assessment-platform.vercel.app/api';

// Get auth token
function getAuthToken() {
    return localStorage.getItem('auth_token');
}

// Get current user from localStorage or API
async function getCurrentUser() {
    const stored = localStorage.getItem('user');
    if (stored) {
        return JSON.parse(stored);
    }
    
    // Fetch from API
    const token = getAuthToken();
    if (!token) return null;
    
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        }
    } catch (error) {
        console.error('Failed to get user:', error);
    }
    
    return null;
}

// Logout
function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = 'landing/index.html';
}

// Check if authenticated
async function checkAuth() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'landing/index.html';
        return null;
    }
    return user;
}
