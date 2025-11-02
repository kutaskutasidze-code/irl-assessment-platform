/**
 * Navigation Module
 * Handles page navigation and scrolling
 */

// Scroll to Features Section
function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// Smooth scroll for all anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scroll behavior to all anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});