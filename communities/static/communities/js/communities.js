// Communities Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Community card click functionality
    const communityCards = document.querySelectorAll('.community-card[data-url]');
    communityCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on the join button
            if (e.target.closest('.community-actions')) {
                return;
            }
            
            // Redirect to pricing page instead of specific community page
            window.location.href = '/communities/pricing/';
        });
    });

    // Join button click prevention (since it's now a link)
    const joinButtons = document.querySelectorAll('.community-actions .btn-join');
    joinButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click when clicking join button
        });
    });
    // Force community cards to be visible
    ensureCardsVisible();
    
    // Initialize dark mode functionality
    initializeDarkMode();
    
    // Initialize filter functionality
    initializeFilters();
    
    // Initialize community cards functionality
    initializeCommunityCards();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize sorting functionality
    initializeSorting();
    
    // Initialize create community functionality
    initializeCreateCommunity();
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize accessibility features
    initializeAccessibility();
});

// Ensure community cards are visible
function ensureCardsVisible() {
    const cards = document.querySelectorAll('.community-card');
    const cardContainers = document.querySelectorAll('.col-lg-4.col-md-6');
    const grid = document.getElementById('communitiesGrid');
    
    // Force visibility
    cards.forEach(card => {
        card.style.display = 'flex';
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.position = 'relative';
        card.style.zIndex = '1';
    });
    
    cardContainers.forEach(container => {
        container.style.display = 'block';
        container.style.opacity = '1';
        container.style.visibility = 'visible';
    });
    
    if (grid) {
        grid.style.display = 'flex';
        grid.style.opacity = '1';
        grid.style.visibility = 'visible';
    }
    
    console.log('Community cards visibility ensured:', cards.length, 'cards found');
    
    // Apply current theme styles
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    applyDarkModeStyles(currentTheme);
}

// Dark Mode Functionality
function initializeDarkMode() {
    const darkModeToggle = document.querySelector('[data-dark-mode-toggle]');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Update theme
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Add transition effect
            htmlElement.style.transition = 'all 0.3s ease';
            
            // Update toggle button icon/text if needed
            updateDarkModeToggle(newTheme);
            
            // Trigger custom event for other components
            document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
        });
        
        // Initialize toggle button state
        updateDarkModeToggle(savedTheme);
    }
}

function updateDarkModeToggle(theme) {
    const darkModeToggle = document.querySelector('[data-dark-mode-toggle]');
    if (!darkModeToggle) return;
    
    const icon = darkModeToggle.querySelector('i');
    if (icon) {
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            darkModeToggle.setAttribute('title', 'Switch to Light Mode');
        } else {
            icon.className = 'fas fa-moon';
            darkModeToggle.setAttribute('title', 'Switch to Dark Mode');
        }
    }
    
    // Force apply dark mode styles
    applyDarkModeStyles(theme);
}

function applyDarkModeStyles(theme) {
    const cards = document.querySelectorAll('.community-card');
    const sections = document.querySelectorAll('.communities-section');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const gameTags = document.querySelectorAll('.game-tag');
    
    if (theme === 'dark') {
        // Apply dark mode styles
        cards.forEach(card => {
            card.style.backgroundColor = '#2d2d2d';
            card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            card.style.color = '#e2e8f0';
        });
        
        sections.forEach(section => {
            section.style.backgroundColor = '#2d2d2d';
            section.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        filterBtns.forEach(btn => {
            if (!btn.classList.contains('active')) {
                btn.style.backgroundColor = '#2d2d2d';
                btn.style.borderColor = '#4a5568';
                btn.style.color = '#a0aec0';
            }
        });
        
        gameTags.forEach(tag => {
            tag.style.backgroundColor = '#2d2d2d';
            tag.style.color = '#e2e8f0';
            tag.style.borderColor = '#4a5568';
        });
    } else {
        // Apply light mode styles
        cards.forEach(card => {
            card.style.backgroundColor = '#ffffff';
            card.style.borderColor = 'rgba(0, 0, 0, 0.05)';
            card.style.color = '#2c3e50';
        });
        
        sections.forEach(section => {
            section.style.backgroundColor = '#ffffff';
            section.style.borderColor = 'rgba(0, 0, 0, 0.05)';
        });
        
        filterBtns.forEach(btn => {
            if (!btn.classList.contains('active')) {
                btn.style.backgroundColor = '#f8f9fa';
                btn.style.borderColor = '#e9ecef';
                btn.style.color = '#6c757d';
            }
        });
        
        gameTags.forEach(tag => {
            tag.style.backgroundColor = '#f8f9fa';
            tag.style.color = '#495057';
            tag.style.borderColor = '#e9ecef';
        });
    }
}

// Filter Functionality
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const communityCards = document.querySelectorAll('[data-category]');
    const noResultsMessage = document.getElementById('noResults');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter communities
            filterCommunities(filter, communityCards, noResultsMessage);
        });
    });
}

function filterCommunities(filter, cards, noResultsMessage) {
    let visibleCount = 0;
    
    cards.forEach(card => {
        const category = card.getAttribute('data-category');
        const shouldShow = filter === 'all' || category === filter;
        
        if (shouldShow) {
            card.style.display = 'block';
            card.style.animation = 'cardFloatIn 0.6s ease-out';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show/hide no results message
    if (noResultsMessage) {
        if (visibleCount === 0) {
            noResultsMessage.style.display = 'block';
            noResultsMessage.style.animation = 'noResultsFadeIn 0.8s ease-out';
        } else {
            noResultsMessage.style.display = 'none';
        }
    }
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('communitySearch');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput) {
        // Real-time search
        searchInput.addEventListener('input', function() {
            performSearch(this.value);
        });
        
        // Search button click
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                performSearch(searchInput.value);
            });
        }
        
        // Enter key search
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    }
}

function performSearch(query) {
    const communityCards = document.querySelectorAll('.community-card');
    const searchTerm = query.toLowerCase().trim();
    
    let visibleCount = 0;
    
    communityCards.forEach(card => {
        const title = card.querySelector('.community-title').textContent.toLowerCase();
        const description = card.querySelector('.community-description').textContent.toLowerCase();
        const games = Array.from(card.querySelectorAll('.game-tag')).map(tag => tag.textContent.toLowerCase());
        
        const matches = title.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       games.some(game => game.includes(searchTerm));
        
        const cardContainer = card.closest('[data-category]');
        
        if (matches && searchTerm !== '') {
            cardContainer.style.display = 'block';
            visibleCount++;
            // Highlight search term
            highlightSearchTerm(card, searchTerm);
        } else if (searchTerm === '') {
            cardContainer.style.display = 'block';
            visibleCount++;
            removeHighlight(card);
        } else {
            cardContainer.style.display = 'none';
            removeHighlight(card);
        }
    });
    
    // Show/hide no results message
    const noResults = document.getElementById('noResults');
    if (visibleCount === 0 && searchTerm !== '') {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
}

function highlightSearchTerm(card, searchTerm) {
    const title = card.querySelector('.community-title');
    const description = card.querySelector('.community-description');
    
    if (title.textContent.toLowerCase().includes(searchTerm)) {
        title.innerHTML = title.textContent.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<mark class="search-highlight">${match}</mark>`
        );
    }
    
    if (description.textContent.toLowerCase().includes(searchTerm)) {
        description.innerHTML = description.textContent.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<mark class="search-highlight">${match}</mark>`
        );
    }
}

function removeHighlight(card) {
    const title = card.querySelector('.community-title');
    const description = card.querySelector('.community-description');
    
    title.innerHTML = title.textContent;
    description.innerHTML = description.textContent;
}

// Sorting functionality
function initializeSorting() {
    const sortSelect = document.getElementById('sortSelect');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            sortCommunities(sortBy);
        });
    }
}

function sortCommunities(sortBy) {
    const grid = document.getElementById('communitiesGrid');
    const cards = Array.from(grid.children);
    
    cards.sort((a, b) => {
        const cardA = a.querySelector('.community-card');
        const cardB = b.querySelector('.community-card');
        
        switch (sortBy) {
            case 'popular':
                return getMemberCount(cardB) - getMemberCount(cardA);
            case 'recent':
                return getActivityLevel(cardB) - getActivityLevel(cardA);
            case 'members':
                return getMemberCount(cardB) - getMemberCount(cardA);
            case 'name':
                return getCommunityName(cardA).localeCompare(getCommunityName(cardB));
            default:
                return 0;
        }
    });
    
    // Re-append sorted cards
    cards.forEach(card => grid.appendChild(card));
    
    // Re-run animations
    setTimeout(() => {
        animateCards();
    }, 100);
}

function getMemberCount(card) {
    const memberText = card.querySelector('.stat-item span').textContent;
    return parseInt(memberText.replace(/[^\d]/g, '')) || 0;
}

function getActivityLevel(card) {
    const activity = card.closest('[data-category]').getAttribute('data-activity');
    const activityMap = { 'high': 3, 'medium': 2, 'low': 1 };
    return activityMap[activity] || 1;
}

function getCommunityName(card) {
    return card.querySelector('.community-title').textContent;
}

// Create Community functionality
function initializeCreateCommunity() {
    const createBtn = document.getElementById('createCommunityBtn');
    const modal = document.getElementById('createCommunityModal');
    const submitBtn = document.getElementById('createCommunitySubmit');
    const iconSelect = document.getElementById('communityIcon');
    const iconPreview = document.getElementById('iconPreview');
    
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            createCommunity();
        });
    }
    
    if (iconSelect && iconPreview) {
        iconSelect.addEventListener('change', function() {
            const selectedIcon = this.value;
            iconPreview.className = `fas ${selectedIcon}`;
        });
    }
}

function createCommunity() {
    const form = document.getElementById('createCommunityForm');
    const formData = new FormData(form);
    
    // Get form values
    const name = document.getElementById('communityName').value;
    const description = document.getElementById('communityDescription').value;
    const category = document.getElementById('communityCategory').value;
    const icon = document.getElementById('communityIcon').value;
    const type = document.querySelector('input[name="communityType"]:checked').value;
    
    // Validation
    if (!name || !description || !category) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }
    
    // Simulate community creation (replace with actual API call later)
    showToast('Community created successfully! This feature will be fully implemented with the backend.', 'success');
    
    // Close modal
    const modal = document.getElementById('createCommunityModal');
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
    
    // Reset form
    form.reset();
    document.getElementById('iconPreview').className = 'fas fa-gamepad';
}

// Community Cards functionality
function initializeCommunityCards() {
    // Join button functionality
    document.querySelectorAll('.btn-join').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const communityCard = this.closest('.community-card');
            const communityName = communityCard.querySelector('.community-title').textContent;
            
            // Check if it's a coming soon card
            if (communityCard.classList.contains('coming-soon')) {
                showToast(`${communityName} community is coming soon! Stay tuned for updates.`, 'info');
            } else {
                // Simulate joining (replace with actual API call later)
                const isJoined = this.textContent.includes('Joined');
                
                if (isJoined) {
                    this.innerHTML = '<i class="fas fa-plus me-2"></i>Join Community';
                    this.classList.remove('btn-secondary');
                    this.classList.add(this.getAttribute('data-original-class') || 'btn-primary');
                    showToast(`Left ${communityName} community.`, 'info');
                } else {
                    this.innerHTML = '<i class="fas fa-check me-2"></i>Joined';
                    this.classList.remove('btn-primary', 'sports', 'racing', 'action', 'fps', 'moba');
                    this.classList.add('btn-secondary');
                    this.setAttribute('data-original-class', this.className);
                    showToast(`Successfully joined ${communityName} community!`, 'success');
                }
            }
        });
    });
    
    // View details button functionality
    document.querySelectorAll('.btn-outline-secondary').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const communityCard = this.closest('.community-card');
            const communityName = communityCard.querySelector('.community-title').textContent;
            
            showToast(`Viewing details for ${communityName}. This will open the community page.`, 'info');
            // TODO: Navigate to community detail page
        });
    });
    
    // Card click functionality
    document.querySelectorAll('.community-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons
            if (e.target.closest('.btn')) {
                return;
            }
            
            const communityName = this.querySelector('.community-title').textContent;
            showToast(`Opening ${communityName} community page.`, 'info');
            // TODO: Navigate to community detail page
        });
    });
}

// Animation Enhancements
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.community-card, .communities-section');
    animateElements.forEach(el => observer.observe(el));
    
    // Add hover sound effects (optional)
    addHoverEffects();
}

function addHoverEffects() {
    const interactiveElements = document.querySelectorAll('.community-card, .filter-btn, .btn-join, .game-tag');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = this.style.transform + ' scale(1.02)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = this.style.transform.replace(' scale(1.02)', '');
        });
    });
}

// Accessibility Features
function initializeAccessibility() {
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Focus management
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.classList.add('focused');
        });
        
        element.addEventListener('blur', function() {
            this.classList.remove('focused');
        });
    });
    
    // Skip to content functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Utility Functions
function clearFilters() {
    const allButton = document.querySelector('.filter-btn[data-filter="all"]');
    if (allButton) {
        allButton.click();
    }
}

// Performance optimizations
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

// Resize handler with debouncing
const handleResize = debounce(() => {
    // Recalculate any layout-dependent animations
    const cards = document.querySelectorAll('.community-card');
    cards.forEach(card => {
        card.style.animation = 'none';
        card.offsetHeight; // Trigger reflow
        card.style.animation = null;
    });
}, 250);

window.addEventListener('resize', handleResize);

// Theme preference detection
function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Listen for system theme changes
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const newTheme = e.matches ? 'dark' : 'light';
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        // Only update if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', newTheme);
            updateDarkModeToggle(newTheme);
        }
    });
}

// Toast notification function
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Animation function for cards
function animateCards() {
    const cards = document.querySelectorAll('.community-card');
    cards.forEach((card, index) => {
        card.style.animation = 'none';
        card.offsetHeight; // Trigger reflow
        card.style.animation = `cardFloatIn 0.6s ease-out ${index * 0.1}s`;
    });
}

// Export functions for global access
window.CommunitiesPage = {
    clearFilters,
    toggleDarkMode: () => {
        const toggle = document.querySelector('[data-dark-mode-toggle]');
        if (toggle) toggle.click();
    },
    showToast
};

// Add CSS for search highlighting and additional styles
const style = document.createElement('style');
style.textContent = `
    .search-highlight {
        background-color: #fff3cd;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: bold;
    }
    
    .community-card {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .community-card.loaded {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Additional utility classes */
    .keyboard-navigation *:focus {
        outline: 2px solid var(--primary-gradient-start) !important;
        outline-offset: 2px !important;
    }
    
    .focused {
        box-shadow: 0 0 0 2px var(--primary-gradient-start) !important;
    }
`;
document.head.appendChild(style);
