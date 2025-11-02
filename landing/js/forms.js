/**
 * Form Handling Module
 * Handles form submissions and validation
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
function handleSignIn(event) {
    event.preventDefault();
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    
    // Store credentials and redirect to main app
    localStorage.setItem('authEmail', email);
    localStorage.setItem('authPassword', password);
    window.location.href = '/irl-assessment-platform/index.html';
}

// Sign Up Handler
function handleSignUp(event) {
    event.preventDefault();
    const type = document.getElementById('signUpType').value;
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpConfirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Build user data object
    const userData = {
        type: type,
        name: name,
        email: email,
        password: password
    };
    
    // Add type-specific fields
    if (type === 'startup') {
        userData.startupName = document.getElementById('signUpStartup').value;
    } else if (type === 'organization') {
        userData.organizationName = document.getElementById('signUpOrg').value;
    }
    
    // Store signup data and redirect to main app
    localStorage.setItem('signupData', JSON.stringify(userData));
    window.location.href = '/irl-assessment-platform/index.html';
}