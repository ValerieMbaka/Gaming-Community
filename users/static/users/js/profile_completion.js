document.addEventListener('DOMContentLoaded', function() {
    // Profile completion form handling
    const modal = document.getElementById('profileCompletionModal');
    const about = document.getElementById('id_about');
    
    // About counter
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
    
    // Username availability check
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

    // Validation helpers
    const fields = {
        'custom_username': document.getElementById('id_custom_username'),
        'bio': document.getElementById('id_bio'),
        'date_of_birth': document.getElementById('id_date_of_birth'),
        'location': document.getElementById('id_location'),
        'platforms': document.getElementById('id_platforms'),
        'games': document.getElementById('id_games')
    };
    
    function validateField(fieldName, isValid) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) errorElement.textContent = isValid ? '' : `${fieldName.replace('_', ' ')} is required`;
        return isValid;
    }
    
    // Function to update dashboard UI dynamically
    function updateDashboardUI(data) {
        // Update avatar
        const profilePictures = document.querySelectorAll('.profile-avatar, .sidebar-avatar, .profile-main-avatar');
        profilePictures.forEach(img => {
            if (data.profile_picture_url) {
                img.src = data.profile_picture_url;
            }
        });
        
        // Update username displays
        const usernameElements = document.querySelectorAll('.profile-name, .username, .sidebar-profile-info h4');
        usernameElements.forEach(el => {
            el.textContent = data.username; // This is already the custom_username from the response
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

    // Function to repopulate form fields with saved data
    function repopulateFormFields(data) {
        console.log('Repopulating form fields with data:', data);
        // Repopulate basic text fields
        if (fields.custom_username) {
            fields.custom_username.value = data.username || '';
        }
        if (fields.bio) {
            fields.bio.value = data.bio || '';
        }
        if (fields.location) {
            fields.location.value = data.location || '';
        }
        
        // Repopulate about field if it exists
        const aboutField = document.getElementById('id_about');
        if (aboutField) {
            aboutField.value = data.about || '';
        }
        
        // Repopulate date of birth if it exists
        const dobField = document.getElementById('id_date_of_birth');
        if (dobField && data.date_of_birth) {
            dobField.value = data.date_of_birth;
        }
        
        // Repopulate platforms (chips)
        if (data.platforms) {
            selectedPlatforms = data.platforms;
            if (platformsContainer && platformsHidden) {
                renderPlatforms();
            }
        }
        
        // Repopulate games (chips)
        if (data.games) {
            selectedGames = data.games;
            if (gamesContainer && gamesHidden) {
                renderGames();
            }
        }
        
        console.log('Form fields repopulated with saved data');
    }
    
    // Function to prevent modal closing when mandatory
    function preventClose(e) {
        if (e.target === modal) {
            e.stopPropagation();
        }
    }
    
    // Submit
    const form = document.getElementById('profileForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        let ok = true;
        ok = (await checkAvailability()) && ok;
        const bio = (fields.bio.value || '').trim();
        if (bio.length < 10 || bio.length > 160) { document.getElementById('bio-error').textContent = 'Bio must be 10–160 characters'; ok = false; } else { document.getElementById('bio-error').textContent = ''; }
        const aboutVal = (about ? about.value : '').trim();
        if (aboutVal && (aboutVal.length < 30 || aboutVal.length > 500)) { showToast('About must be 30–500 characters if provided', 'error'); ok = false; }
        if (selectedPlatforms.length === 0) { validateField('platforms', false); ok = false; }
        if (selectedGames.length === 0) { validateField('games', false); ok = false; }
        if (!ok) return;
        
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/users/complete-profile/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': (document.cookie.match(/csrftoken=([^;]+)/) || [null, ''])[1],
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                // Store updated profile data
                localStorage.setItem('updatedProfile', JSON.stringify({
                    profile_picture_url: data.profile_picture_url || '/static/core/images/player.jpeg',
                    username: data.username,
                    custom_username: data.custom_username,
                    bio: data.bio,
                    about: data.about,
                    location: data.location,
                    platforms: data.platforms,
                    games: data.games
                }));
                
                // Mark profile as completed in localStorage if it's actually complete
                if (data.profile_completed) {
                    localStorage.setItem('profileCompleted', 'true');
                }
                
                // Hide the modal if profile is completed
                const modal = document.getElementById('profileCompletionModal');
                if (modal && data.profile_completed) {
                    // Immediately hide the modal
                    modal.classList.remove('show', 'mandatory');
                    modal.style.display = 'none';
                    modal.style.visibility = 'hidden';
                    modal.style.opacity = '0';
                    
                    // Remove mandatory restrictions
                    modal.removeEventListener('click', preventClose);
                    
                    console.log('Modal hidden successfully');
                }
                
                // Update dashboard UI dynamically
                updateDashboardUI(data);
                
                // Repopulate form fields with saved data
                repopulateFormFields(data);
                
                showToast('Profile updated successfully!', 'success');
                
                // Refresh the page to show updated dashboard
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                console.log('Profile completion successful, page will refresh in 1 second');
            } else {
                if (data.errors) {
                    for (const field in data.errors) {
                        const errorElement = document.getElementById(`${field}-error`);
                        if (errorElement) errorElement.textContent = data.errors[field][0];
                    }
                    showToast('Please correct the errors in the form', 'error');
                } else {
                    showToast('Error updating profile. Please try again.', 'error');
                }
            }
        } catch (error) {
            console.error(error);
            showToast('Network error. Please try again.', 'error');
        }
    });
});