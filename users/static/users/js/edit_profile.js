// Edit Profile Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const editProfileForm = document.getElementById('editProfileForm');
    
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            // Show loading state
            const submitBtn = editProfileForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;
            
            // Create FormData object
            const formData = new FormData(editProfileForm);
            
            // Handle platforms data properly - convert to JSON string
            const platformCheckboxes = editProfileForm.querySelectorAll('input[name="platforms"]:checked');
            const platforms = Array.from(platformCheckboxes).map(cb => cb.value);
            formData.delete('platforms'); // Remove existing platforms data
            formData.append('platforms', JSON.stringify(platforms));
            
            // Handle games data properly - convert to JSON string
            const gamesHiddenInput = editProfileForm.querySelector('input[name="games"]');
            const gamesValue = gamesHiddenInput ? gamesHiddenInput.value : '';
            const gamesArray = gamesValue ? gamesValue.split(',').map(game => game.trim()).filter(game => game) : [];
            formData.delete('games'); // Remove existing games data
            formData.append('games', JSON.stringify(gamesArray));
            
            // Debug form data
            console.log('Platforms selected:', platforms);
            console.log('Games value:', gamesValue);
            console.log('Games array:', gamesArray);
            console.log('About value:', formData.get('about'));
            
            // Add AJAX header
            const xhr = new XMLHttpRequest();
            xhr.open('POST', window.location.href, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            
            xhr.onload = function() {
                console.log('Response status:', xhr.status);
                console.log('Response text:', xhr.responseText);
                
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        console.log('Parsed response:', response);
                        
                        if (response.success) {
                            // Show success message
                            showSuccessMessage(response.message);
                            
                            // Update profile data in localStorage for other pages
                            localStorage.setItem('userProfileData', JSON.stringify(response.user));
                            localStorage.setItem('userStats', JSON.stringify(response.user_stats));
                            
                            // Redirect to settings after a short delay
                            setTimeout(function() {
                                window.location.href = '/users/settings/';
                            }, 1500);
                        } else {
                            // Show error message
                            showErrorMessage('Failed to update profile. Please try again.');
                        }
                    } catch (e) {
                        console.error('Error parsing response:', e);
                        showErrorMessage('An error occurred. Please try again.');
                    }
                } else {
                    console.error('HTTP Error:', xhr.status);
                    showErrorMessage('An error occurred. Please try again.');
                }
                
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            };
            
            xhr.onerror = function() {
                showErrorMessage('Network error. Please check your connection and try again.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            };
            
            xhr.send(formData);
        });
    }
});

// Success Message Handler
function showSuccessMessage(message) {
    // Create success message element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-message-content">
            <i class="fas fa-check-circle"></i>
            <span class="success-message-text">${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(successDiv);
    
    // Show message
    setTimeout(() => {
        successDiv.classList.add('show');
    }, 100);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        successDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 3000);
}

// Error Message Handler
function showErrorMessage(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-message-content">
            <i class="fas fa-exclamation-circle"></i>
            <span class="error-message-text">${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(errorDiv);
    
    // Show message
    setTimeout(() => {
        errorDiv.classList.add('show');
    }, 100);
    
    // Remove message after 4 seconds
    setTimeout(() => {
        errorDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 300);
    }, 4000);
}

// Games Input Handler (existing functionality)
document.addEventListener('DOMContentLoaded', function() {
    const gamesInput = document.getElementById('games_input');
    const selectedGames = document.getElementById('selectedGames');
    const gamesHiddenInput = document.getElementById('id_games');
    
    if (gamesInput && selectedGames && gamesHiddenInput) {
        gamesInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const game = this.value.trim();
                
                if (game && !isGameSelected(game)) {
                    addGameTag(game);
                    this.value = '';
                    updateGamesHiddenInput();
                }
            }
        });
        
        // Handle game removal
        selectedGames.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-game')) {
                const gameTag = e.target.parentElement;
                gameTag.remove();
                updateGamesHiddenInput();
            }
        });
    }
});

function addGameTag(game) {
    const gameTag = document.createElement('span');
    gameTag.className = 'game-tag';
    gameTag.innerHTML = `${game} <i class="fas fa-times remove-game" data-game="${game}"></i>`;
    selectedGames.appendChild(gameTag);
}

function isGameSelected(game) {
    const existingGames = selectedGames.querySelectorAll('.game-tag');
    return Array.from(existingGames).some(tag => 
        tag.textContent.trim().replace('×', '').trim() === game
    );
}

function updateGamesHiddenInput() {
    const gameTags = selectedGames.querySelectorAll('.game-tag');
    const games = Array.from(gameTags).map(tag => 
        tag.textContent.trim().replace('×', '').trim()
    );
    gamesHiddenInput.value = games.join(',');
}

// Profile Picture Preview
document.addEventListener('DOMContentLoaded', function() {
    const profilePictureInput = document.getElementById('id_profile_picture');
    const currentProfilePic = document.getElementById('currentProfilePic');
    
    if (profilePictureInput && currentProfilePic) {
        profilePictureInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentProfilePic.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});
