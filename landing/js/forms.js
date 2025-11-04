/**
 * Form Handling Module with API Integration
 */

// Account Type Change Handler
function handleAccountTypeChange() {
    const type = document.getElementById('accountType').value;
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
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    
    try {
        const apiService = new APIService();
        const response = await apiService.login(email, password);
        
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            window.location.href = '/irl-assessment-platform/index.html';
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

// Sign Up Handler
async function handleSignUp(event) {
    event.preventDefault();
    
    const type = document.getElementById('accountType').value;
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpConfirmPassword').value;
    
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
    
    try {
        const apiService = new APIService();
        const response = await apiService.register(userData);
        
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            window.location.href = '/irl-assessment-platform/index.html';
        }
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}
