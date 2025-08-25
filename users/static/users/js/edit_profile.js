// Edit Profile Form Handler
document.addEventListener('DOMContentLoaded', function() {
    // Clear any existing stuck toasts
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        toastContainer.innerHTML = '';
    }
    
    // Check for any existing red elements that might be the banner
    const redElements = document.querySelectorAll('[style*="red"], [style*="#dc3545"], [style*="#c82333"], [class*="error"], [class*="toast"]');
    console.log('Found red/error elements:', redElements);
    redElements.forEach(el => {
        console.log('Red element:', el);
        if (el.style.position === 'fixed' || el.style.position === 'absolute') {
            console.log('Removing fixed/absolute red element:', el);
            el.remove();
        }
    });
    
    const editProfileForm = document.getElementById('editProfileForm');
    
    // About counter
    const about = document.getElementById('id_about');
    const aboutCounter = document.getElementById('aboutCounter');
    const updateAboutCounter = () => { 
        if (aboutCounter) aboutCounter.textContent = `${(about.value||'').length}/500`; 
    };
    if (about) { 
        about.addEventListener('input', updateAboutCounter); 
        updateAboutCounter(); 
    }
    
    // Username generator and availability check
    const usernameInput = document.getElementById('id_custom_username');
    const usernameError = document.getElementById('custom_username-error');
    const generateBtn = document.getElementById('generateUsernameBtn');
    const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;
    const adjectives = ['Swift','Nova','Crimson','Shadow','Aero','Frost','Blaze','Quantum','Pixel','Hyper','Omega','Ultra'];
    const nouns = ['Ranger','Ninja','Falcon','Viper','Phoenix','Comet','Drifter','Guardian','Samurai','Spectre','Voyager','Gamer'];

    function generateUsernameCandidate() {
        const a = adjectives[Math.floor(Math.random()*adjectives.length)];
        const n = nouns[Math.floor(Math.random()*nouns.length)];
        const num = Math.floor(Math.random()*9999).toString().padStart(2,'0');
        let candidate = `${a}${n}${num}`;
        if (candidate.length > 20) candidate = candidate.slice(0, 20);
        return candidate;
    }

    async function checkAvailability() {
        const value = (usernameInput.value || '').trim();
        if (!usernamePattern.test(value)) {
            if (usernameError) usernameError.textContent = 'Use 3–20 letters, numbers, or underscores';
            return false;
        }
        try {
            const res = await fetch('/users/check-username/?username=' + encodeURIComponent(value));
            const data = await res.json();
            if (!data.available) {
                if (usernameError) usernameError.textContent = data.reason === 'invalid_format' ? 'Invalid username format' : 'This username is already taken';
                return false;
            }
            if (usernameError) usernameError.textContent = '';
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    let usernameTimer;
    function debouncedCheck() {
        clearTimeout(usernameTimer);
        usernameTimer = setTimeout(checkAvailability, 400);
    }

    if (usernameInput) {
        usernameInput.addEventListener('input', debouncedCheck);
        usernameInput.addEventListener('blur', checkAvailability);
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            for (let i=0; i<5; i++) {
                const candidate = generateUsernameCandidate();
                usernameInput.value = candidate;
                // eslint-disable-next-line no-await-in-loop
                const ok = await checkAvailability();
                if (ok) break;
            }
        });
    }
    
    // Platform selection (checkboxes)
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
    
    // Avatar upload with preview
    const profilePicInput = document.getElementById('id_profile_picture');
    const currentProfilePic = document.getElementById('currentProfilePic');
    
    if (profilePicInput && currentProfilePic) {
        profilePicInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log('Avatar selected:', file.name);
                
                // Create a preview of the selected image
                const reader = new FileReader();
                reader.onload = function(event) {
                    currentProfilePic.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Validation helpers
    function validateField(fieldName, isValid) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) errorElement.textContent = isValid ? '' : `${fieldName.replace('_', ' ')} is required`;
        return isValid;
    }
    
    // Form submission
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            // Validate form
            let ok = true;
            
            // Username validation
            ok = (await checkAvailability()) && ok;
            
            // Bio validation
            const bio = document.getElementById('id_bio');
            if (bio && (bio.value.trim().length < 10 || bio.value.trim().length > 160)) { 
                const bioError = document.getElementById('bio-error');
                if (bioError) bioError.textContent = 'Bio must be 10–160 characters'; 
                ok = false; 
            }
            
            // Location validation
            const location = document.getElementById('id_location');
            if (location && !location.value.trim()) {
                const locationError = document.getElementById('location-error');
                if (locationError) locationError.textContent = 'Location is required';
                ok = false;
            }
            
            // Platforms validation
            const checkedPlatforms = Array.from(platformCheckboxes).filter(cb => cb.checked);
            if (checkedPlatforms.length === 0) { 
                ok = false; 
            }
            
            // Games validation
            if (gamesList.length === 0) { 
                ok = false; 
            }
            
            if (!ok) return;
            
            // Show loading state
            const submitBtn = editProfileForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;
            
            // Create FormData object
            const formData = new FormData(editProfileForm);
            
            // Add platforms data
            const selectedPlatforms = Array.from(platformCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
            formData.set('platforms', JSON.stringify(selectedPlatforms));
            
            // Add games data
            formData.set('games', JSON.stringify(gamesList));
            
            // Debug form data
            console.log('Platforms selected:', selectedPlatforms);
            console.log('Games selected:', gamesList);
            console.log('Form data entries:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            try {
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                if (response.ok) {
                    try {
                        const data = await response.json();
                        console.log('Parsed response:', data);
                        
                        if (data.success) {
                            // Show success message using the main toast system
                            if (typeof showToast === 'function') {
                                showToast(data.message || 'Profile updated successfully!', 'success');
                            }
                            
                            // Update profile data in localStorage for other pages
                            if (data.user) {
                                localStorage.setItem('userProfileData', JSON.stringify(data.user));
                            }
                            if (data.user_stats) {
                                localStorage.setItem('userStats', JSON.stringify(data.user_stats));
                            }
                            
                            // Update header and sidebar profile pictures
                            updateProfilePictures(data.user);
                            
                            // Redirect to settings after a short delay
                            setTimeout(function() {
                                window.location.href = '/users/gamer-settings/';
                            }, 1500);
                        } else {
                            // Show error message using the main toast system
                            if (typeof showToast === 'function') {
                                showToast(data.message || 'Failed to update profile. Please try again.', 'error');
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing response:', e);
                        console.error('Response text:', await response.text());
                        if (typeof showToast === 'function') {
                            showToast('An error occurred. Please try again.', 'error');
                        }
                    }
                } else {
                    console.error('HTTP Error:', response.status);
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    if (typeof showToast === 'function') {
                        showToast('An error occurred. Please try again.', 'error');
                    }
                }
            } catch (error) {
                console.error('Network error:', error);
                if (typeof showToast === 'function') {
                    showToast('Network error. Please check your connection and try again.', 'error');
                }
            }
            
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    }
});

// Function to update profile pictures throughout the page
function updateProfilePictures(userData) {
    if (!userData || !userData.profile_picture_url) return;
    
    // Update header profile picture
    const headerProfilePic = document.querySelector('.profile-avatar, .profile-btn img');
    if (headerProfilePic) {
        headerProfilePic.src = userData.profile_picture_url;
    }
    
    // Update sidebar profile picture
    const sidebarProfilePic = document.querySelector('.sidebar-profile img, .nav-profile img');
    if (sidebarProfilePic) {
        sidebarProfilePic.src = userData.profile_picture_url;
    }
    
    // Update any other profile pictures on the page
    const allProfilePics = document.querySelectorAll('img[src*="profile_pics"], img[src*="player.jpeg"]');
    allProfilePics.forEach(img => {
        if (img.src.includes('profile_pics') || img.src.includes('player.jpeg')) {
            img.src = userData.profile_picture_url;
        }
    });
    
    // Update username in header/sidebar if available
    if (userData.custom_username) {
        const usernameElements = document.querySelectorAll('.username, .nav-username');
        usernameElements.forEach(element => {
            element.textContent = userData.custom_username;
        });
    }
}

