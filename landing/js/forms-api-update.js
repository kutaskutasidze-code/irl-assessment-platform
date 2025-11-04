// Update to handleSignUp function - replace localStorage with API call

async function handleSignUp(e) {
    e.preventDefault();
    
    const type = document.getElementById('accountType').value;
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Build API request data
    const userData = {
        user_type: type,
        name: name,
        email: email,
        password: password
    };
    
    if (type === 'startup') {
        userData.category = 'General'; // Default category
        userData.description = document.getElementById('signUpStartup')?.value || name;
    } else if (type === 'organization') {
        userData.organization = document.getElementById('signUpOrg')?.value || name;
    }
    
    // Call API
    try {
        const apiService = new APIService();
        const response = await apiService.register(userData);
        
        if (response.token) {
            // Store token
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // Redirect to dashboard
            window.location.href = '/irl-assessment-platform/index.html';
        }
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}
