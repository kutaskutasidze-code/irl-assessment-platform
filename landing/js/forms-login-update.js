// Update to handleLogin function

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const apiService = new APIService();
        const response = await apiService.login(email, password);
        
        if (response.token) {
            // Store token and user
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // Redirect to dashboard
            window.location.href = '/irl-assessment-platform/index.html';
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}
