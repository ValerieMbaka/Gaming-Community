// Settings Page Handler
document.addEventListener('DOMContentLoaded', function() {
    // Check for success message from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const successMessage = urlParams.get('success');
    
    if (successMessage) {
        showSuccessMessage(decodeURIComponent(successMessage));
        // Remove the parameter from URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
    
    // Check for updated profile data in localStorage
    const userProfileData = localStorage.getItem('userProfileData');
    const userStats = localStorage.getItem('userStats');
    
    if (userProfileData && userStats) {
        updateProfileDisplay(JSON.parse(userProfileData), JSON.parse(userStats));
        // Clear localStorage after updating
        localStorage.removeItem('userProfileData');
        localStorage.removeItem('userStats');
    }
    
    // Settings tab navigation
    const tabButtons = document.querySelectorAll('.settings-nav-item');
    const tabContents = document.querySelectorAll('.settings-tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and target content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('settingsDarkModeToggle');
    if (darkModeToggle) {
        // Set initial state
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        darkModeToggle.checked = isDarkMode;
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }
});

// Update Profile Display Function
function updateProfileDisplay(userData, userStats) {
    // Update profile summary info
    const displayName = document.querySelector('.profile-summary-info h2');
    if (displayName && userData.display_name) {
        displayName.textContent = userData.display_name;
    }
    
    // Update profile stats
    const gamesCount = document.querySelector('.stat-item:has(.fa-gamepad)');
    if (gamesCount && userStats.games_count !== undefined) {
        gamesCount.textContent = `${userStats.games_count} Games`;
    }
    
    const platformsCount = document.querySelector('.stat-item:has(.fa-desktop)');
    if (platformsCount && userStats.platforms_count !== undefined) {
        platformsCount.textContent = `${userStats.platforms_count} Platforms`;
    }
    
    // Update about section
    updateAboutSection(userData.about);
    
    // Update profile details
    updateDetailItem('Username', userData.custom_username);
    updateDetailItem('Location', userData.location);
    updateDetailItem('Bio', userData.bio);
    updateDetailItem('Games', userData.games ? userData.games.join(', ') : null);
    updateDetailItem('Platforms', userData.platforms ? userData.platforms.join(', ') : null);
    
    // Update profile picture if changed
    if (userData.profile_picture_url) {
        const profilePictures = document.querySelectorAll('.profile-summary-avatar img');
        profilePictures.forEach(img => {
            img.src = userData.profile_picture_url;
        });
    }
}

// Helper function to update detail items
function updateDetailItem(label, value) {
    const detailItems = document.querySelectorAll('.detail-item');
    detailItems.forEach(item => {
        const detailLabel = item.querySelector('.detail-label');
        if (detailLabel && detailLabel.textContent === label) {
            const detailValue = item.querySelector('.detail-value');
            if (detailValue) {
                detailValue.textContent = value || 'Not set';
            }
        }
    });
}

// Update about section
function updateAboutSection(aboutText) {
    const aboutTextElement = document.querySelector('.about-text');
    if (aboutTextElement) {
        if (aboutText) {
            aboutTextElement.textContent = aboutText;
            aboutTextElement.classList.remove('about-placeholder');
        } else {
            aboutTextElement.textContent = 'No about information added yet.';
            aboutTextElement.classList.add('about-placeholder');
        }
    }
}

// Success Message Handler
function showSuccessMessage(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        const messageText = successDiv.querySelector('.success-message-text');
        if (messageText) {
            messageText.textContent = message;
        }
        
        successDiv.classList.add('show');
        
        setTimeout(() => {
            successDiv.classList.remove('show');
        }, 3000);
    }
}

// Delete Account Modal Functions
function showDeleteModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function hideDeleteModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('deleteAccountModal');
    if (modal && e.target === modal) {
        hideDeleteModal();
    }
});

// Password toggle function (for global access)
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    const icon = toggle.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}


