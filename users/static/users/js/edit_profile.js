document.addEventListener('DOMContentLoaded', function() {
    // Profile Picture Upload Preview
    const profilePicInput = document.getElementById('id_profile_picture');
    const currentProfilePic = document.getElementById('currentProfilePic');

    if (profilePicInput && currentProfilePic) {
        profilePicInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    currentProfilePic.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Games Input Handling
    const gamesInput = document.getElementById('games_input');
    const selectedGames = document.getElementById('selectedGames');
    const gamesHiddenInput = document.getElementById('id_games');
    let gamesList = [];

    // Initialize games list from existing games
    if (gamesHiddenInput && gamesHiddenInput.value) {
        gamesList = gamesHiddenInput.value.split(',').filter(game => game.trim());
        updateGamesDisplay();
    }

    if (gamesInput) {
        gamesInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const game = this.value.trim();
                if (game && !gamesList.includes(game)) {
                    gamesList.push(game);
                    updateGamesDisplay();
                    this.value = '';
                }
            }
        });
    }

    // Remove game functionality
    if (selectedGames) {
        selectedGames.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-game')) {
                const game = e.target.getAttribute('data-game');
                gamesList = gamesList.filter(g => g !== game);
                updateGamesDisplay();
            }
        });
    }

    function updateGamesDisplay() {
        if (selectedGames && gamesHiddenInput) {
            selectedGames.innerHTML = gamesList.map(game => 
                `<span class="game-tag">${game} <i class="fas fa-times remove-game" data-game="${game}"></i></span>`
            ).join('');
            gamesHiddenInput.value = gamesList.join(',');
        }
    }

    // Platforms Checkbox Handling
    const platformCheckboxes = document.querySelectorAll('input[name="platforms"]');
    const platformsHiddenInput = document.createElement('input');
    platformsHiddenInput.type = 'hidden';
    platformsHiddenInput.name = 'platforms';
    platformsHiddenInput.id = 'id_platforms';

    // Find the platforms form group and add the hidden input
    const platformsGroup = document.querySelector('.form-group:has(.platforms-grid)');
    if (platformsGroup) {
        platformsGroup.appendChild(platformsHiddenInput);
    }

    function updatePlatformsValue() {
        const selectedPlatforms = Array.from(platformCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        platformsHiddenInput.value = JSON.stringify(selectedPlatforms);
    }

    platformCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updatePlatformsValue);
    });

    // Initialize platforms value
    updatePlatformsValue();

    // Form submission with AJAX
    const editProfileForm = document.querySelector('form[action*="edit_profile"]');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;

            fetch(window.location.href, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the settings page profile summary if it exists
                    updateSettingsProfileSummary(data);
                    
                    // Show success message
                    showToast(data.message, 'success');
                    
                    // Reset form state
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                } else {
                    // Show error message
                    showToast('Please correct the errors below', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('An error occurred while saving', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // Function to update settings page profile summary
    function updateSettingsProfileSummary(data) {
        // Update profile summary in settings page if it exists
        const profileSummary = document.querySelector('.profile-summary');
        if (profileSummary) {
            // Update avatar
            const avatar = profileSummary.querySelector('.profile-summary-avatar img');
            if (avatar && data.user.profile_picture_url) {
                avatar.src = data.user.profile_picture_url;
            }

            // Update display name
            const displayName = profileSummary.querySelector('.profile-summary-info h2');
            if (displayName) {
                displayName.textContent = data.user.display_name;
            }

            // Update stats
            const gamesStat = profileSummary.querySelector('.stat-item:has(.fa-gamepad)');
            if (gamesStat) {
                gamesStat.innerHTML = `<i class="fas fa-gamepad"></i> ${data.user_stats.games_count} Games`;
            }

            const platformsStat = profileSummary.querySelector('.stat-item:has(.fa-desktop)');
            if (platformsStat) {
                platformsStat.innerHTML = `<i class="fas fa-desktop"></i> ${data.user_stats.platforms_count} Platforms`;
            }

            // Update summary details
            const usernameDetail = profileSummary.querySelector('.summary-detail-item:has(.fa-user) span');
            if (usernameDetail) {
                usernameDetail.innerHTML = `<strong>Username:</strong> ${data.user.custom_username || 'Not set'}`;
            }

            const locationDetail = profileSummary.querySelector('.summary-detail-item:has(.fa-map-marker-alt) span');
            if (locationDetail) {
                locationDetail.innerHTML = `<strong>Location:</strong> ${data.user.location || 'Not set'}`;
            }

            const bioDetail = profileSummary.querySelector('.summary-detail-item:has(.fa-info-circle) span');
            if (bioDetail) {
                bioDetail.innerHTML = `<strong>Bio:</strong> ${data.user.bio || 'Not set'}`;
            }

            // Update games
            const gamesDetail = profileSummary.querySelector('.summary-detail-item:has(.fa-gamepad)');
            if (gamesDetail && data.user.games && data.user.games.length > 0) {
                gamesDetail.querySelector('span').innerHTML = `<strong>Games:</strong> ${data.user.games.join(', ')}`;
            }

            // Update platforms
            const platformsDetail = profileSummary.querySelector('.summary-detail-item:has(.fa-desktop)');
            if (platformsDetail && data.user.platforms && data.user.platforms.length > 0) {
                platformsDetail.querySelector('span').innerHTML = `<strong>Platforms:</strong> ${data.user.platforms.join(', ')}`;
            }
        }

        // Also update the dashboard if it exists
        updateDashboardProfile(data);
    }

    // Function to update dashboard profile
    function updateDashboardProfile(data) {
        // Update username in header/sidebar
        const usernameElements = document.querySelectorAll('.username');
        usernameElements.forEach(element => {
            element.textContent = data.user.display_name;
        });

        // Update profile picture in sidebar
        const sidebarAvatar = document.querySelector('.sidebar-profile img');
        if (sidebarAvatar && data.user.profile_picture_url) {
            sidebarAvatar.src = data.user.profile_picture_url;
        }

        // Update dashboard profile info
        const dashboardUsername = document.querySelector('.dashboard-profile h4');
        if (dashboardUsername) {
            dashboardUsername.textContent = data.user.display_name;
        }
    }

    // Toast Notification System
    function showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add toast styles if not already present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    max-width: 400px;
                }
                .toast-success { border-left: 4px solid #28a745; }
                .toast-error { border-left: 4px solid #dc3545; }
                .toast-info { border-left: 4px solid #17a2b8; }
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex: 1;
                }
                .toast-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #6c757d;
                    padding: 0.25rem;
                }
                .toast-close:hover { color: #495057; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // Make showToast globally available
    window.showToast = showToast;
});
