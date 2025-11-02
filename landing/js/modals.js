/**
 * Modal Management Module
 * Handles showing, hiding, and closing modals
 */

// Show Sign In Modal
function showSignIn() {
    document.getElementById('signInModal').classList.add('active');
}

// Show Sign Up Modal
function showSignUp(type = null) {
    document.getElementById('signUpModal').classList.add('active');
    if (type) {
        document.getElementById('signUpType').value = type;
        handleAccountTypeChange();
    }
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modals on background click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}