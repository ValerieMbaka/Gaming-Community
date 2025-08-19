function updateUserProfileUI(data) {
    // Update profile picture
    const profilePictures = document.querySelectorAll('.profile-avatar, .sidebar-avatar, .profile-main-avatar');
    profilePictures.forEach(img => {
        if (data.profile_picture_url) {
            img.src = data.profile_picture_url;
        }
    });

    // Update username
    const usernameElements = document.querySelectorAll('.username, .profile-name, .sidebar-profile-info h4');
    usernameElements.forEach(el => {
        el.textContent = data.display_username || data.username;
    });

    // Update bio/title
    const bioElements = document.querySelectorAll('.profile-title');
    bioElements.forEach(el => {
        el.textContent = data.bio && data.bio !== 'Bio' ? data.bio : 'Gaming Enthusiast';
    });

    // Update about text
    const aboutElements = document.querySelectorAll('.about-text');
    aboutElements.forEach(el => {
        el.textContent = data.about && data.about !== 'About' ? data.about : 'Gaming enthusiast passionate about competitive play and community building.';
    });

    // Update location
    const locationElements = document.querySelectorAll('.profile-location span');
    locationElements.forEach(el => {
        el.textContent = data.location && data.location !== 'Nairobi' ? data.location : 'Location not set';
    });

    // Update games in about section
    const gamesElements = document.querySelectorAll('.about-details .detail-item:has(i.fa-gamepad) strong');
    gamesElements.forEach(el => {
        if (data.games && data.games.length > 0) {
            el.textContent = data.games.join(', ');
        } else {
            el.textContent = 'No games added';
        }
    });

    // Update platforms in about section
    const platformsElements = document.querySelectorAll('.about-details .detail-item:has(i.fa-desktop) strong');
    platformsElements.forEach(el => {
        if (data.platforms && data.platforms.length > 0) {
            el.textContent = data.platforms.join(', ');
        } else {
            el.textContent = 'No platforms added';
        }
    });

    // Update games count in stats
    const gamesCountElements = document.querySelectorAll('.stats-grid-horizontal .communities .stat-value');
    gamesCountElements.forEach(el => {
        el.textContent = data.platforms ? data.platforms.length : 0;
    });

    // Update recent activity
    const activityElements = document.querySelectorAll('.activity-description');
    activityElements.forEach(el => {
        if (el.textContent.includes('Added') && data.games && data.games.length > 0) {
            el.textContent = `Added ${data.games.length} game${data.games.length > 1 ? 's' : ''} to your profile`;
        }
    });

    // Update activity stats
    const activityStatsElements = document.querySelectorAll('.activity-stats .activity-stat');
    activityStatsElements.forEach(el => {
        if (el.textContent.includes('Game')) {
            el.innerHTML = `<i class="fas fa-gamepad"></i><span>${data.games ? data.games.length : 0} Game${data.games && data.games.length > 1 ? 's' : ''}</span>`;
        } else if (el.textContent.includes('Platform')) {
            el.innerHTML = `<i class="fas fa-desktop"></i><span>${data.platforms ? data.platforms.length : 0} Platform${data.platforms && data.platforms.length > 1 ? 's' : ''}</span>`;
        }
    });

    // Update games tab content if it exists
    const gamesTabContent = document.querySelector('#games .game-carousel');
    if (gamesTabContent && data.games && data.games.length > 0) {
        gamesTabContent.innerHTML = data.games.map(game => `
            <div class="game-card">
                <img src="/static/core/images/games.jpeg" alt="${game}">
                <div class="game-info">
                    <h4>${game}</h4>
                    <p>Game • Active</p>
                    <div class="game-footer">
                        <div class="match-percentage">100% Match</div>
                        <button class="btn btn-sm btn-outline-primary">Details</button>
                    </div>
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
                            showToast('Profile picture updated successfully!', 'success');
                        }
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    if (typeof showToast === 'function') {
                        showToast('Error updating profile picture. Please try again.', 'error');
                    }
                });
            }
        });
    }
    
        // Function to update user info in the UI
    function updateUserInfo(data) {
        // Update profile picture in sidebar
        const sidebarAvatar = document.querySelector('.sidebar-avatar');
        if (sidebarAvatar && data.profile_picture_url) {
            sidebarAvatar.src = data.profile_picture_url;
        }
        
        // Update profile picture in top nav
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