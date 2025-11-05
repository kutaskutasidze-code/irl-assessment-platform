/**
 * Form Handling Module with API Integration
 */

// Account Type Change Handler
function handleAccountTypeChange() {
    const type = document.getElementById('signUpType').value;
    const orgField = document.getElementById('organizationField');
    const startupField = document.getElementById('startupField');
    
    if (type === 'organization') {
        orgField.style.display = 'block';
        startupField.style.display = 'none';
        document.getElementById('signUpOrg').required = true;
        document.getElementById('signUpStartup').required = false;
    } else if (type === 'startup') {
        orgField.style.display = 'none';
        startupField.style.display = 'block';
        document.getElementById('signUpOrg').required = false;
        document.getElementById('signUpStartup').required = true;
    } else {
        orgField.style.display = 'none';
        startupField.style.display = 'none';
        document.getElementById('signUpOrg').required = false;
        document.getElementById('signUpStartup').required = false;
    }
}

// Sign In Handler
async function handleSignIn(event) {
    event.preventDefault();
    console.log('Sign in submitted');
    
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    
    console.log('Attempting login for:', email);
    
    try {
        const apiService = new APIService();
        const response = await apiService.login(email, password);
        
        console.log('Login successful:', response);
        
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            window.location.href = '/irl-assessment-platform/index.html';
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
}

// Sign Up Handler
async function handleSignUp(event) {
    event.preventDefault();
    console.log('=== REGISTRATION STARTED ===');
    console.log('APIService available:', typeof APIService);
    console.log('Sign up form submitted!');
    
    const type = document.getElementById('signUpType').value;
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpConfirmPassword').value;
    
    console.log('Form data:', { type, name, email });
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    const userData = {
        user_type: type,
        name: name,
        email: email,
        password: password
    };
    
    if (type === 'startup') {
        userData.category = 'General';
        userData.description = document.getElementById('signUpStartup')?.value || name;
    } else if (type === 'organization') {
        userData.organization = document.getElementById('signUpOrg')?.value || name;
    }
    
    console.log('Sending registration request:', userData);
    
    try {
        console.log('Creating APIService instance...');
        const apiService = new APIService();
        console.log('APIService created:', apiService);
        console.log('API Base URL:', apiService.constructor.name);
        
        const response = await apiService.register(userData);
        console.log('Registration response:', response);
        
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            alert('Registration successful! Redirecting to dashboard...');
            window.location.href = '/irl-assessment-platform/index.html';
        } else {
            alert('Registration failed: No token received');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + (error.message || 'Unknown error'));
    }
}

console.log('Forms.js loaded successfully');