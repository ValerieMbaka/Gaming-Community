// Function to get appropriate image for a game
function getGameImage(gameName) {
    const gameNameLower = gameName.toLowerCase();
    
    // FPS Games
    if (gameNameLower.includes('valorant') || gameNameLower.includes('csgo') || gameNameLower.includes('cs:go') || gameNameLower.includes('counter-strike')) {
        return '/static/core/images/cod.jpeg';
    }
    if (gameNameLower.includes('cod') || gameNameLower.includes('call of duty') || gameNameLower.includes('warzone')) {
        return '/static/core/images/codwarzone.jpeg';
    }
    if (gameNameLower.includes('cod mobile') || gameNameLower.includes('call of duty mobile')) {
        return '/static/core/images/codmobile.jpeg';
    }
    if (gameNameLower.includes('black ops')) {
        return '/static/core/images/codblackops.jpeg';
    }
    
    // Sports Games
    if (gameNameLower.includes('fifa') || gameNameLower.includes('football') || gameNameLower.includes('soccer')) {
        return '/static/core/images/fc.jpeg';
    }
    if (gameNameLower.includes('pes') || gameNameLower.includes('efootball') || gameNameLower.includes('pro evolution soccer')) {
        return '/static/core/images/pes.jpeg';
    }
    
    // Racing Games
    if (gameNameLower.includes('nfs') || gameNameLower.includes('need for speed')) {
        return '/static/core/images/nfs.jpeg';
    }
    if (gameNameLower.includes('racing') || gameNameLower.includes('asphalt')) {
        return '/static/core/images/racing.jpeg';
    }
    if (gameNameLower.includes('asphalt legends')) {
        return '/static/core/images/asphaltlegends.jpeg';
    }
    
    // Fighting Games
    if (gameNameLower.includes('tekken') || gameNameLower.includes('fighting')) {
        return '/static/core/images/tekken.jpeg';
    }
    
    // Battle Royale Games
    if (gameNameLower.includes('pubg') || gameNameLower.includes('playerunknown')) {
        return '/static/core/images/pubg.jpeg';
    }
    if (gameNameLower.includes('fortnite')) {
        return '/static/core/images/fortnite.jpeg';
    }
    if (gameNameLower.includes('freefire') || gameNameLower.includes('free fire')) {
        return '/static/core/images/freefire.jpeg';
    }
    
    // Mobile Games
    if (gameNameLower.includes('roblox')) {
        return '/static/core/images/roblox.jpeg';
    }
    if (gameNameLower.includes('dream league') || gameNameLower.includes('dream league soccer')) {
        return '/static/core/images/fc.jpeg';
    }
    
    // Action Games
    if (gameNameLower.includes('action') || gameNameLower.includes('adventure')) {
        return '/static/core/images/actiongame.jpeg';
    }
    
    // Default fallback
    return '/static/core/images/gamepad.jpeg';
}

// Function to update user profile UI with new data
function updateUserProfileUI(data) {
    console.log('Updating user profile UI with data:', data);
    
    // Update profile information
    if (data.username) {
        const usernameElements = document.querySelectorAll('.profile-name');
        usernameElements.forEach(element => {
            element.textContent = data.username;
        });
    }
    
    if (data.bio) {
        const bioElements = document.querySelectorAll('.profile-title');
        bioElements.forEach(element => {
            element.textContent = data.bio;
        });
    }
    
    if (data.location) {
        const locationElements = document.querySelectorAll('.profile-location span');
        locationElements.forEach(element => {
            element.textContent = data.location;
        });
    }
    
    // Update games tab content if it exists
    const gamesTabContent = document.querySelector('#games .game-carousel');
    if (gamesTabContent && data.games && data.games.length > 0) {
        gamesTabContent.innerHTML = data.games.map(game => `
            <div class="game-card">
                <div class="game-status">Active</div>
                <div class="platform-badges">
                    ${data.platforms ? data.platforms.slice(0, 3).map(platform => 
                        `<span class="platform-badge">${platform.toUpperCase()}</span>`
                    ).join('') : '<span class="platform-badge">PC</span>'}
                </div>
                <img src="${getGameImage(game)}" alt="${game}">
                <div class="game-info">
                    <h4>${game}</h4>
                </div>
            </div>
        `).join('');
    }

    // Update empty states
    const emptyStates = document.querySelectorAll('.empty-state');
    emptyStates.forEach(emptyState => {
        if (emptyState.textContent.includes('No games added yet') && data.games && data.games.length > 0) {
            emptyState.style.display = 'none';
        }
    });
}

// Check for updated profile data on page load
document.addEventListener('DOMContentLoaded', function() {
    const updatedProfile = localStorage.getItem('updatedProfile');
    if (updatedProfile) {
        updateUserProfileUI(JSON.parse(updatedProfile));
        localStorage.removeItem('updatedProfile');
    }
    
    // Check if profile is completed and hide modal if needed
    const profileCompleted = localStorage.getItem('profileCompleted');
    const profileCompletionModal = document.getElementById('profileCompletionModal');
    if (profileCompleted === 'true' && profileCompletionModal) {
        profileCompletionModal.classList.remove('show');
    }
    
    // Handle profile completion modal
    if (profileCompletionModal) {
        // Close modal when clicking outside
        profileCompletionModal.addEventListener('click', function(e) {
            if (e.target === profileCompletionModal) {
                profileCompletionModal.classList.remove('show');
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && profileCompletionModal.classList.contains('show')) {
                profileCompletionModal.classList.remove('show');
            }
        });
    }
    
    // Initialize dashboard tabs
    const dashboardTabs = document.querySelectorAll('.profile-tab');
    console.log('Found dashboard tabs:', dashboardTabs.length);
    
    if (dashboardTabs.length > 0) {
        dashboardTabs.forEach(tab => {
            // Add a visual indicator that tabs are clickable
            tab.style.cursor = 'pointer';
            
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Tab clicked:', this.getAttribute('data-tab'));
                
                // Remove active class from all tabs
                dashboardTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Hide all tab contents
                document.querySelectorAll('.profile-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show the corresponding content
                const tabId = this.getAttribute('data-tab');
                if (tabId) {
                    const targetContent = document.getElementById(tabId);
                    if (targetContent) {
                        targetContent.classList.add('active');
                        console.log('Activated tab content:', tabId);
                    } else {
                        console.log('Tab content not found:', tabId);
                    }
                }
            });
        });
    } else {
        console.log('No dashboard tabs found!');
    }

    // Dashboard-specific animations
    const statCards = document.querySelectorAll('.stat-item-horizontal');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Initialize any dashboard-specific plugins or components
    function initCountdownTimers() {
        const countdowns = document.querySelectorAll('.countdown-timer');
        // Countdown timer logic would go here
    }

    initCountdownTimers();
    
    // Initialize game images
    function initializeGameImages() {
        const gameImages = document.querySelectorAll('.game-image');
        gameImages.forEach(img => {
            const gameName = img.getAttribute('data-game');
            if (gameName) {
                img.src = getGameImage(gameName);
            }
        });
        
        // Initialize activity game images
        const activityGameImages = document.querySelectorAll('.activity-game-image');
        activityGameImages.forEach(img => {
            const gameNames = img.getAttribute('data-game');
            if (gameNames) {
                // Get the first game from the comma-separated list
                const firstGame = gameNames.split(',')[0].trim();
                img.src = getGameImage(firstGame);
            }
        });
    }
    
    // Initialize game images on page load
    initializeGameImages();
    
    // Avatar upload
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('profile_picture', file);
                formData.append('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);
                
                fetch('/users/complete-profile/', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateUserProfileUI(data);
                        // Show success message
                        if (typeof showToast === 'function') {
                            showToast('Avatar updated successfully!', 'success');
                        }
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    if (typeof showToast === 'function') {
                        showToast('Error updating avatar. Please try again.', 'error');
                    }
                });
            }
        });
    }
    
        // Function to update user info in the UI
    function updateUserInfo(data) {
        // Update avatar in sidebar
        const sidebarAvatar = document.querySelector('.sidebar-avatar');
        if (sidebarAvatar && data.profile_picture_url) {
            sidebarAvatar.src = data.profile_picture_url;
        }
        
        // Update avatar in top nav
        const navAvatar = document.querySelector('.profile-avatar');
        if (navAvatar && data.profile_picture_url) {
            navAvatar.src = data.profile_picture_url;
        }
        
        // Update username in sidebar
        const sidebarUsername = document.querySelector('.sidebar-profile-info h4');
        if (sidebarUsername && data.username) {
            sidebarUsername.textContent = data.username;
        }
        
        // Update username in top nav
        const navUsername = document.querySelector('.username');
        if (navUsername && data.username) {
            navUsername.textContent = data.username;
        }
    }
    
});