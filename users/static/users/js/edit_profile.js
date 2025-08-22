// Edit Profile Form Handler
document.addEventListener('DOMContentLoaded', function() {
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
            usernameError.textContent = 'Use 3–20 letters, numbers, or underscores';
            return false;
        }
        try {
            const res = await fetch('/users/check-username/?username=' + encodeURIComponent(value));
            const data = await res.json();
            if (!data.available) {
                usernameError.textContent = data.reason === 'invalid_format' ? 'Invalid username format' : 'This username is already taken';
                return false;
            }
            usernameError.textContent = '';
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
    
    // Platform selection
    const platformsMap = [
        {key:'pc', label:'PC'},
        {key:'playstation', label:'PlayStation'},
        {key:'xbox', label:'Xbox'},
        {key:'nintendo', label:'Nintendo Switch'},
        {key:'mobile', label:'Mobile'}
    ];
    const platformsContainer = document.getElementById('platformsTags');
    const platformsHidden = document.getElementById('id_platforms');
    let selectedPlatforms = [];
    
    // Initialize platforms from hidden input
    if (platformsHidden && platformsHidden.value) {
        try {
            selectedPlatforms = JSON.parse(platformsHidden.value);
        } catch (e) {
            console.error('Error parsing platforms:', e);
            selectedPlatforms = [];
        }
    }
    
    function renderPlatforms() {
        platformsContainer.innerHTML = '';
        platformsMap.forEach(p => {
            const chip = document.createElement('span');
            chip.className = 'chip' + (selectedPlatforms.includes(p.key) ? ' active' : '');
            chip.textContent = p.label;
            chip.addEventListener('click', () => {
                if (selectedPlatforms.includes(p.key)) {
                    selectedPlatforms = selectedPlatforms.filter(k => k !== p.key);
                } else {
                    selectedPlatforms.push(p.key);
                }
                platformsHidden.value = JSON.stringify(selectedPlatforms);
                renderPlatforms();
                validateField('platforms', selectedPlatforms.length > 0);
            });
            platformsContainer.appendChild(chip);
        });
        platformsHidden.value = JSON.stringify(selectedPlatforms);
    }
    if (platformsContainer && platformsHidden) renderPlatforms();
    
    // Game selection
    const defaultGames = ['Valorant','FIFA','Call of Duty','Fortnite','League of Legends','Dota 2','CS:GO'];
    const gamesContainer = document.getElementById('gamesTags');
    const gamesHidden = document.getElementById('id_games');
    const gameInput = document.getElementById('gameInput');
    let selectedGames = [];
    
    // Initialize games from hidden input
    if (gamesHidden && gamesHidden.value) {
        try {
            selectedGames = JSON.parse(gamesHidden.value);
        } catch (e) {
            console.error('Error parsing games:', e);
            selectedGames = [];
        }
    }
    
    function addGame(value) {
        if (!value) return;
        if (!selectedGames.includes(value)) {
            selectedGames.push(value);
            updateGames();
        }
    }
    
    function removeGame(name) {
        selectedGames = selectedGames.filter(g => g !== name);
        updateGames();
    }
    
    function updateGames() {
        gamesHidden.value = JSON.stringify(selectedGames);
        validateField('games', selectedGames.length > 0);
        renderGames();
    }
    
    function renderGames() {
        gamesContainer.innerHTML = '';
        const all = Array.from(new Set([...defaultGames, ...selectedGames]));
        all.forEach(g => {
            const chip = document.createElement('span');
            const active = selectedGames.includes(g);
            chip.className = 'chip' + (active ? ' active' : '');
            chip.textContent = g;
            if (active) {
                const remove = document.createElement('span');
                remove.className = 'remove';
                remove.textContent = '×';
                remove.addEventListener('click', (e) => { e.stopPropagation(); removeGame(g); });
                chip.appendChild(remove);
            }
            chip.addEventListener('click', () => {
                if (active) removeGame(g); else addGame(g);
            });
            gamesContainer.appendChild(chip);
        });
    }
    
    if (gamesContainer && gamesHidden) {
        renderGames();
        if (gameInput) {
            gameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addGame(gameInput.value);
                    gameInput.value = '';
                }
            });
        }
    }
    
    // Avatar upload (no preview functionality)
    const profilePicInput = document.getElementById('id_profile_picture');
    if (profilePicInput) {
        profilePicInput.addEventListener('change', function(e) {
            // File selected, but no preview shown as requested
            console.log('Avatar selected:', e.target.files[0]?.name);
        });
    }
    
    // Validation helpers
    const fields = {
        'custom_username': document.getElementById('id_custom_username'),
        'bio': document.getElementById('id_bio'),
        'platforms': document.getElementById('id_platforms'),
        'games': document.getElementById('id_games')
    };
    
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
            ok = (await checkAvailability()) && ok;
            const bio = (fields.bio.value || '').trim();
            if (bio.length < 10 || bio.length > 160) { 
                document.getElementById('bio-error').textContent = 'Bio must be 10–160 characters'; 
                ok = false; 
            } else { 
                document.getElementById('bio-error').textContent = ''; 
            }
            if (selectedPlatforms.length === 0) { validateField('platforms', false); ok = false; }
            if (selectedGames.length === 0) { validateField('games', false); ok = false; }
            if (!ok) return;
            
            // Show loading state
            const submitBtn = editProfileForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;
            
            // Create FormData object
            const formData = new FormData(editProfileForm);
            
            // Only include editable fields
            const editableFields = ['custom_username', 'bio', 'about', 'platforms', 'games', 'profile_picture'];
            const formDataToSend = new FormData();
            
            // Add CSRF token
            formDataToSend.append('csrfmiddlewaretoken', formData.get('csrfmiddlewaretoken'));
            
            // Add only editable fields
            editableFields.forEach(field => {
                const value = formData.get(field);
                if (value !== null) {
                    formDataToSend.append(field, value);
                }
            });
            
            // Debug form data
            console.log('Platforms selected:', selectedPlatforms);
            console.log('Games selected:', selectedGames);
            console.log('About value:', formData.get('about'));
            
            try {
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    body: formDataToSend,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                console.log('Response status:', response.status);
                
                if (response.ok) {
                    try {
                        const data = await response.json();
                        console.log('Parsed response:', data);
                        
                        if (data.success) {
                            // Show success message
                            showSuccessMessage(data.message || 'Profile updated successfully!');
                            
                            // Update profile data in localStorage for other pages
                            if (data.user) {
                                localStorage.setItem('userProfileData', JSON.stringify(data.user));
                            }
                            if (data.user_stats) {
                                localStorage.setItem('userStats', JSON.stringify(data.user_stats));
                            }
                            
                            // Redirect to settings after a short delay
                            setTimeout(function() {
                                window.location.href = '/users/gamer-settings/';
                            }, 1500);
                        } else {
                            // Show error message
                            showErrorMessage(data.message || 'Failed to update profile. Please try again.');
                        }
                    } catch (e) {
                        console.error('Error parsing response:', e);
                        showErrorMessage('An error occurred. Please try again.');
                    }
                } else {
                    console.error('HTTP Error:', response.status);
                    showErrorMessage('An error occurred. Please try again.');
                }
            } catch (error) {
                console.error('Network error:', error);
                showErrorMessage('Network error. Please check your connection and try again.');
            }
            
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
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
