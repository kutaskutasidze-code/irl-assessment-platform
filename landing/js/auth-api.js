// Real API Authentication for Landing Page
const API_URL = 'https://irl-assessment-platform.vercel.app/api';

async function handleRealLogin(email, password, userType) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Verify user type matches
        if (data.user.user_type !== userType) {
            throw new Error(`Please use the ${data.user.user_type} login form`);
        }

        // Store token and user
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to dashboard
        window.location.href = '../index.html';
    } catch (error) {
        throw error;
    }
}

async function handleRealRegister(userData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        // Store token and user
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to dashboard
        window.location.href = '../index.html';
    } catch (error) {
        throw error;
    }
}
