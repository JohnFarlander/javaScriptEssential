document.addEventListener('DOMContentLoaded', () => {
    // Search functionality
    const searchBar = document.querySelector('.search-bar');
    const searchInput = searchBar.querySelector('input');
    const searchButton = searchBar.querySelector('button');

    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            // Here you would typically make an API call to search for destinations
            alert(`Searching for: ${searchTerm}`);
        }
    });

    // Allow search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });

    // Book Now button functionality
    const bookNowButton = document.querySelector('.cta-button');
    bookNowButton.addEventListener('click', () => {
        // Here you would typically redirect to a booking page
        alert('Redirecting to booking page...');
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Navbar background change on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        }
    });
}); 
