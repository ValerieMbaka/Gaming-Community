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

document.addEventListener('DOMContentLoaded', function() {
    // Profile completion form handling
    const modal = document.getElementById('profileCompletionModal');
    const about = document.getElementById('id_about');
    
    // About counter
    const aboutCounter = document.getElementById('aboutCounter');
    const updateAboutCounter = () => { 
        if (aboutCounter) {
            const length = (about.value||'').length;
            aboutCounter.textContent = `${length}/500`;
            console.log('About counter updated:', length);
        }
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
    if (platformsContainer && platformsHidden) {
        // Initialize with existing platforms data
        try {
            const existingPlatforms = JSON.parse(platformsHidden.value || '[]');
            selectedPlatforms = existingPlatforms;
        } catch (e) {
            console.log('No existing platforms data or invalid JSON');
        }
        renderPlatforms();
    }
    
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
        // Initialize with existing games data
        try {
            const existingGames = JSON.parse(gamesHidden.value || '[]');
            selectedGames = existingGames;
        } catch (e) {
            console.log('No existing games data or invalid JSON');
        }
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
    
    // Custom Date Picker functionality
    const dobDay = document.getElementById('dobDay');
    const dobMonth = document.getElementById('dobMonth');
    const dobYear = document.getElementById('dobYear');
    const dateOfBirthHidden = document.getElementById('id_date_of_birth');
    
    // Populate year dropdown (from 1970 to current year)
    function populateYearDropdown() {
        const currentYear = new Date().getFullYear();
        const minYear = 1970;
        const maxYear = currentYear; // Allow current year selection
        
        for (let year = maxYear; year >= minYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            dobYear.appendChild(option);
        }
    }
    
    // Populate day dropdown based on selected month and year
    function populateDayDropdown() {
        const selectedMonth = parseInt(dobMonth.value);
        const selectedYear = parseInt(dobYear.value);
        
        console.log('Populating day dropdown - Month:', selectedMonth, 'Year:', selectedYear);
        
        // Clear existing days
        dobDay.innerHTML = '<option value="">Day</option>';
        
        // If month and year are selected, show exact days for that month
        if (selectedMonth && selectedYear) {
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
            console.log('Days in month:', daysInMonth);
            
            for (let day = 1; day <= daysInMonth; day++) {
                const option = document.createElement('option');
                option.value = day;
                option.textContent = day;
                dobDay.appendChild(option);
            }
        } else {
            // If month or year not selected, show all 31 days
            for (let day = 1; day <= 31; day++) {
                const option = document.createElement('option');
                option.value = day;
                option.textContent = day;
                dobDay.appendChild(option);
            }
        }
    }
    
    // Update hidden date input when selections change
    function updateHiddenDate() {
        const day = dobDay.value;
        const month = dobMonth.value;
        const year = dobYear.value;
        
        console.log('Updating hidden date - Day:', day, 'Month:', month, 'Year:', year);
        
        if (day && month && year) {
            const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            dateOfBirthHidden.value = formattedDate;
            console.log('Set hidden date to:', formattedDate);
            
            // Remove error styling
            dobDay.classList.remove('error');
            dobMonth.classList.remove('error');
            dobYear.classList.remove('error');
        } else {
            dateOfBirthHidden.value = '';
            console.log('Cleared hidden date - missing day, month, or year');
            
            // Add error styling to incomplete fields
            if (!day) dobDay.classList.add('error');
            if (!month) dobMonth.classList.add('error');
            if (!year) dobYear.classList.add('error');
        }
    }
    
    // Initialize date picker
    if (dobDay && dobMonth && dobYear) {
        populateYearDropdown();
        populateDayDropdown(); // Populate days immediately
        
        // Set event listeners
        dobMonth.addEventListener('change', () => {
            populateDayDropdown();
            updateHiddenDate();
        });
        
        dobYear.addEventListener('change', () => {
            populateDayDropdown();
            updateHiddenDate();
        });
        
        dobDay.addEventListener('change', updateHiddenDate);
        
        // Pre-fill if there's an existing value
        if (dateOfBirthHidden.value) {
            const dateParts = dateOfBirthHidden.value.split('-');
            if (dateParts.length === 3) {
                const [year, month, day] = dateParts;
                dobYear.value = year;
                dobMonth.value = parseInt(month);
                populateDayDropdown();
                dobDay.value = parseInt(day);
            }
        }
    }
    
    // Avatar upload with preview functionality
    const profilePicInput = document.getElementById('id_profile_picture');
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    
    if (profilePicInput) {
        profilePicInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file.');
                    return;
                }
                
                // Validate file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB.');
                    return;
                }
                
                // Create preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                    avatarPreview.classList.add('show');
                    avatarPlaceholder.classList.add('hide');
                };
                reader.readAsDataURL(file);
                console.log('Avatar selected:', file.name);
            }
        });
    }

    // Username availability check
    async function checkAvailability() {
        const value = (usernameInput.value || '').trim();
        console.log('Checking username availability for:', value);
        
        if (!usernamePattern.test(value)) {
            usernameError.textContent = 'Use 3–20 letters, numbers, or underscores';
            usernameError.classList.add('show');
            console.log('Username format invalid');
            return false;
        }
        try {
            const res = await fetch('/users/check-username/?username=' + encodeURIComponent(value));
            const data = await res.json();
            console.log('Username check response:', data);
            
            if (!data.available) {
                const errorMessage = data.reason === 'invalid_format' ? 'Invalid username format' : 'This username is already taken';
                usernameError.textContent = errorMessage;
                usernameError.classList.add('show');
                console.log('Username not available, error message:', errorMessage);
                return false;
            }
            usernameError.textContent = '';
            usernameError.classList.remove('show');
            console.log('Username is available');
            return true;
        } catch (e) {
            console.error('Error checking username availability:', e);
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
        if (errorElement) {
            if (isValid) {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
            } else {
                errorElement.textContent = `${fieldName.replace('_', ' ')} is required`;
                errorElement.classList.add('show');
            }
        }
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
        const bioError = document.getElementById('bio-error');
        if (bio.length < 10 || bio.length > 160) { 
            bioError.textContent = 'Bio must be 10–160 characters'; 
            bioError.classList.add('show');
            ok = false; 
        } else { 
            bioError.textContent = ''; 
            bioError.classList.remove('show');
        }
        const aboutVal = (about ? about.value : '').trim();
        if (aboutVal && (aboutVal.length < 30 || aboutVal.length > 500)) { showToast('About must be 30–500 characters if provided', 'error'); ok = false; }
        if (selectedPlatforms.length === 0) { validateField('platforms', false); ok = false; }
        if (selectedGames.length === 0) { validateField('games', false); ok = false; }
        
        // Check if location is provided
        const location = (fields.location.value || '').trim();
        const locationError = document.getElementById('location-error');
        if (!location || location === '') {
            if (locationError) {
                locationError.textContent = 'Please enter your location';
                locationError.classList.add('show');
            }
            ok = false;
        } else {
            if (locationError) {
                locationError.textContent = '';
                locationError.classList.remove('show');
            }
        }
        
        // Check if date of birth is properly set
        const day = dobDay.value;
        const month = dobMonth.value;
        const year = dobYear.value;
        
        if (!day || !month || !year || !dateOfBirthHidden.value || dateOfBirthHidden.value === '') {
            showToast('Please select a complete date of birth (day, month, and year).', 'error');
            
            // Highlight incomplete fields
            if (!day) dobDay.classList.add('error');
            if (!month) dobMonth.classList.add('error');
            if (!year) dobYear.classList.add('error');
            
            return;
        }
        
        if (!ok) {
            showToast('Please correct the errors in the form before submitting.', 'error');
            return;
        }
        
        const formData = new FormData(form);
        
        // Debug: Log form data being sent
        console.log('Form data being sent:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        try {
            const response = await fetch('/users/complete-profile/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
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
                
                // Show appropriate message based on profile completion status
                const message = data.profile_message || 'Profile updated successfully!';
                const messageType = data.is_profile_complete ? 'success' : 'warning';
                showToast(message, messageType);
                
                // Refresh the page to show updated dashboard only if profile is complete
                if (data.is_profile_complete) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    console.log('Profile completion successful, page will refresh in 1 second');
                } else {
                    console.log('Profile updated but not complete yet');
                }
            } else {
                if (data.errors) {
                    let errorMessages = [];
                    for (const field in data.errors) {
                        const errorElement = document.getElementById(`${field}-error`);
                        if (errorElement) {
                            errorElement.textContent = data.errors[field][0];
                            errorElement.classList.add('show');
                            errorMessages.push(`${field}: ${data.errors[field][0]}`);
                        }
                    }
                    showToast(`Please correct the following errors: ${errorMessages.join(', ')}`, 'error');
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