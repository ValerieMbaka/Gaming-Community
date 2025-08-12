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
        el.textContent = data.username;
    });

    // Update bio if displayed
    const bioElement = document.querySelector('.about-text');
    if (bioElement && data.bio) {
        bioElement.textContent = data.bio;
    }

    // Update games and platforms if displayed
    if (data.games) {
        const gamesElements = document.querySelectorAll('.game-stat, .game-title');
        // Customize this based on your actual UI structure
    }
}

// Check for updated profile data on page load
document.addEventListener('DOMContentLoaded', function() {
    const updatedProfile = localStorage.getItem('updatedProfile');
    if (updatedProfile) {
        updateUserProfileUI(JSON.parse(updatedProfile));
        localStorage.removeItem('updatedProfile');
    }
    
    // Initialize dashboard tabs
    const dashboardTabs = document.querySelectorAll('.profile-tab');
    
    if (dashboardTabs.length > 0) {
        dashboardTabs.forEach(tab => {
            tab.addEventListener('click', function() {
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
                    document.getElementById(tabId)?.classList.add('active');
                }
            });
        });
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
                
                fetch('{% url "users:complete_profile" %}', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (response.ok) {
                        window.location.reload();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
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