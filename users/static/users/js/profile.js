document.addEventListener('DOMContentLoaded', function() {
    // Profile picture preview
    const profilePicInput = document.getElementById('id_profile_picture');
    const avatarPreview = document.getElementById('avatarPreview');
    
    if (profilePicInput && avatarPreview) {
        profilePicInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    avatarPreview.style.backgroundImage = `url(${event.target.result})`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Initialize games and platforms selector
    // To be replaced with actual game/platform selection logic
    const gamesData = document.getElementById('id_games');
    const platformsData = document.getElementById('id_platforms');
    
});