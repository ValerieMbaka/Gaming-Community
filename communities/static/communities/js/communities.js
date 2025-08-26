// Communities Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeFilters();
    initializeSearch();
    initializeSorting();
    initializeCreateCommunity();
    initializeCommunityCards();
    initializeAnimations();
});

// Filter functionality
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const communityCards = document.querySelectorAll('[data-category]');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards
            let visibleCount = 0;
            communityCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Show/hide no results message
            const noResults = document.getElementById('noResults');
            if (visibleCount === 0) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
        });
    });
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

// Animation functionality
function initializeAnimations() {
    // Initial animation
    animateCards();
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all community cards
    document.querySelectorAll('.community-card').forEach(card => {
        observer.observe(card);
    });
}

function animateCards() {
    const cards = document.querySelectorAll('.community-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
}

// Utility functions
function clearFilters() {
    // Reset search
    const searchInput = document.getElementById('communitySearch');
    if (searchInput) {
        searchInput.value = '';
        performSearch('');
    }
    
    // Reset category filter
    const allFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
    if (allFilterBtn) {
        allFilterBtn.click();
    }
    
    // Reset sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.value = 'popular';
    }
    
    showToast('Filters cleared!', 'info');
}

function showToast(message, type = 'info') {
    // Check if toast function exists (from users app)
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        // Fallback alert
        alert(message);
    }
}

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

// Add CSS for search highlighting
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
`;
document.head.appendChild(style);

// Global function for clearing filters (accessible from HTML)
window.clearFilters = clearFilters;
