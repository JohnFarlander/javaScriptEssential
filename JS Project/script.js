document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clearButton = document.getElementById('clearButton');
    const searchResults = document.getElementById('searchResults');

    // Debug check for elements
    console.log('Search Input:', searchInput);
    console.log('Search Button:', searchButton);
    console.log('Clear Button:', clearButton);
    console.log('Search Results:', searchResults);

    // Check if API keys are configured
    if (!config.OPENCAGE_API_KEY || !config.TIMEZONEDB_API_KEY || !config.UNSPLASH_API_KEY) {
        console.error('API keys not configured. Please check config.js');
        searchResults.innerHTML = '<div class="result-card">Please configure API keys in config.js</div>';
        return;
    }

    // Debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Function to fetch location data from OpenCage
    async function fetchLocationData(query) {
        console.log('Fetching location data for:', query);
        try {
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${config.OPENCAGE_API_KEY}&limit=5`;
            console.log('OpenCage URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            console.log('OpenCage response:', data);
            return data.results;
        } catch (error) {
            console.error('Error fetching location data:', error);
            return [];
        }
    }

    // Function to fetch timezone data from TimeZoneDB
    async function fetchTimezone(lat, lng) {
        console.log('Fetching timezone for:', lat, lng);
        try {
            const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${config.TIMEZONEDB_API_KEY}&format=json&by=position&lat=${lat}&lng=${lng}`;
            console.log('TimeZoneDB URL:', url);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('TimeZoneDB response:', data);
            
            if (data.status === 'FAILED') {
                throw new Error(data.message || 'TimeZoneDB request failed');
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching timezone:', error);
            return null;
        }
    }

    // Function to fetch image from Unsplash
    async function fetchLocationImage(query) {
        console.log('Fetching image for:', query);
        try {
            const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${config.UNSPLASH_API_KEY}&per_page=1`;
            console.log('Unsplash URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            console.log('Unsplash response:', data);
            return data.results[0]?.urls?.regular || null;
        } catch (error) {
            console.error('Error fetching image:', error);
            return null;
        }
    }

    // Function to format time
    function formatTime(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }

    // Function to create result card
    function createResultCard(location, timeZone, imageUrl) {
        const formattedTime = timeZone ? formatTime(timeZone.timestamp) : 'Time unavailable';
        const timeZoneName = timeZone ? timeZone.zoneName : 'Unknown timezone';
        
        return `
            <div class="result-card">
                <div class="local-time">
                    Current Local Time (${timeZoneName}): ${formattedTime}
                </div>
                <img src="${imageUrl || 'https://via.placeholder.com/400x200'}" alt="${location.formatted}" class="destination-image">
                <div class="destination-info">
                    <h2>${location.formatted}</h2>
                    <p>${location.components.country}</p>
                    <a href="#" class="visit-button">Visit</a>
                </div>
            </div>
        `;
    }

    // Search handler
    async function handleSearch() {
        const query = searchInput.value.trim();
        console.log('Search query:', query);
        
        if (!query) {
            console.log('Empty query, returning');
            return;
        }

        try {
            // Show loading state
            searchResults.innerHTML = '<div class="result-card">Searching...</div>';
            searchResults.classList.add('active');
            console.log('Added active class to results');

            // Fetch location data
            const locations = await fetchLocationData(query);
            console.log('Fetched locations:', locations);
            
            if (locations.length === 0) {
                searchResults.innerHTML = '<div class="result-card">No results found</div>';
                return;
            }

            // Process each location
            const resultsHTML = await Promise.all(locations.map(async (location) => {
                const timeZone = await fetchTimezone(location.geometry.lat, location.geometry.lng);
                const imageUrl = await fetchLocationImage(`${location.formatted} landmark`);
                return createResultCard(location, timeZone, imageUrl);
            }));

            // Update results
            searchResults.innerHTML = resultsHTML.join('');
            console.log('Updated results HTML');

        } catch (error) {
            console.error('Error in search:', error);
            searchResults.innerHTML = '<div class="result-card">An error occurred while searching</div>';
        }
    }

    // Event listeners
    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Search button clicked');
        handleSearch();
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            console.log('Enter key pressed');
            e.preventDefault();
            handleSearch();
        }
    });

    clearButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Clear button clicked');
        searchInput.value = '';
        searchResults.innerHTML = '';
        searchResults.classList.remove('active');
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchResults.contains(e.target) && !searchInput.contains(e.target) && !searchButton.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });

    // Debounced search for input changes
    const debouncedSearch = debounce(() => {
        if (searchInput.value.trim().length >= 3) {
            console.log('Debounced search triggered');
            handleSearch();
        }
    }, 500);

    searchInput.addEventListener('input', debouncedSearch);

    console.log('All event listeners attached');

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

    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Here you would typically send the form data to a server
            // For now, we'll just show a success message
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
}); 