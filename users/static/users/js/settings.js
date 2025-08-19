document.addEventListener('DOMContentLoaded', function() {
    // Tab Navigation
    const tabButtons = document.querySelectorAll('.settings-nav-item');
    const tabContents = document.querySelectorAll('.settings-tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and target content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

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



    // Dark Mode Toggle Handling
    const darkModeToggle = document.getElementById('settingsDarkModeToggle');
    if (darkModeToggle) {
        // Check if dark mode is enabled in localStorage
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        darkModeToggle.checked = isDarkMode;
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }

        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
                showToast('Dark mode enabled', 'success');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
                showToast('Dark mode disabled', 'success');
            }
        });
    }

    // Form Validation
    const forms = document.querySelectorAll('.settings-form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#dc3545';
                    field.addEventListener('input', function() {
                        this.style.borderColor = '#e9ecef';
                    }, { once: true });
                }
            });

            if (!isValid) {
                e.preventDefault();
                showToast('Please fill in all required fields', 'error');
            }
        });
    });

    // Password Change Form Validation
    const passwordForm = document.querySelector('form[action*="change_password"]');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            const newPassword = document.getElementById('new_password');
            const confirmPassword = document.getElementById('confirm_password');

            if (newPassword.value !== confirmPassword.value) {
                e.preventDefault();
                showToast('New passwords do not match', 'error');
                return;
            }

            if (newPassword.value.length < 6) {
                e.preventDefault();
                showToast('Password must be at least 6 characters long', 'error');
                return;
            }
        });
    }

    // Delete Account Modal
    const deleteModal = document.getElementById('deleteAccountModal');
    const deleteForm = document.querySelector('.delete-account-form');

    if (deleteForm) {
        deleteForm.addEventListener('submit', function(e) {
            const password = document.getElementById('delete_password');
            if (!password.value.trim()) {
                e.preventDefault();
                showToast('Please enter your password to confirm deletion', 'error');
            }
        });
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



    // About Preview Updates
    const aboutTextarea = document.getElementById('id_about');
    const aboutPreviewText = document.getElementById('aboutPreviewText');
    
    if (aboutTextarea && aboutPreviewText) {
        aboutTextarea.addEventListener('input', function() {
            const text = this.value.trim();
            if (text) {
                aboutPreviewText.textContent = text;
            } else {
                aboutPreviewText.textContent = 'Gaming enthusiast passionate about competitive play and community building.';
            }
        });
    }

    // Form submission feedback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
        showToast('Settings updated successfully!', 'success');
    }
});

// Password Toggle Function (global scope)
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
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

// Modal Functions (global scope)
function showDeleteModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideDeleteModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('deleteAccountModal');
    if (modal && e.target === modal) {
        hideDeleteModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideDeleteModal();
    }
});


