document.addEventListener('DOMContentLoaded', function() {
    // Profile picture handling - no preview
    const profilePicInput = document.getElementById('id_profile_picture');
    
    if (profilePicInput) {
        profilePicInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log('Profile picture selected:', file.name);
                // No preview - just log the selection
            }
        });
    }

    // Initialize games and platforms selector
    // To be replaced with actual game/platform selection logic
    const gamesData = document.getElementById('id_games');
    const platformsData = document.getElementById('id_platforms');
    
});