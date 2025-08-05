document.addEventListener('DOMContentLoaded', function() {
    // ===== PROFILE NAVIGATION =====
    const navLinks = document.querySelectorAll('.profile-nav a');
    const sections = document.querySelectorAll('.profile-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active nav link
            navLinks.forEach(l => l.parentNode.classList.remove('active'));
            this.parentNode.classList.add('active');
            
            // Show corresponding section
            const target = this.getAttribute('href');
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === target.substring(1)) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // ===== AVATAR UPLOAD =====
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatar-preview');
    
    avatarUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarPreview.src = e.target.result;
                // In a real app: Upload to server here
            };
            reader.readAsDataURL(file);
        }
    });
    
    // ===== BIO EDITOR =====
    const editBioBtn = document.getElementById('edit-bio-btn');
    const bioContent = document.querySelector('.bio-content');
    const bioEditor = document.querySelector('.bio-editor');
    const bioTextarea = document.getElementById('bio-textarea');
    const saveBioBtn = document.getElementById('save-bio-btn');
    const cancelBioBtn = document.getElementById('cancel-bio-btn');
    
    editBioBtn.addEventListener('click', function() {
        bioContent.style.display = 'none';
        bioEditor.style.display = 'block';
    });
    
    cancelBioBtn.addEventListener('click', function() {
        bioEditor.style.display = 'none';
        bioContent.style.display = 'block';
    });
    
    saveBioBtn.addEventListener('click', function() {
        document.getElementById('user-bio').textContent = bioTextarea.value;
        bioEditor.style.display = 'none';
        bioContent.style.display = 'block';
        // In a real app: Save to server here
    });
    
    // ===== GAME STATS TABS =====
    const gameTabs = document.querySelectorAll('.game-tab');
    const gameStats = document.querySelectorAll('.game-stats');
    
    gameTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            gameTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const game = this.dataset.game;
            gameStats.forEach(stats => {
                stats.classList.remove('active');
                if (stats.dataset.game === game) {
                    stats.classList.add('active');
                }
            });
        });
    });
    
    // ===== UPLOAD MEDIA BUTTON =====
    document.getElementById('upload-media-btn').addEventListener('click', function() {
        alert('In a real app, this would open a file upload dialog');
        // Implementation would involve:
        // 1. File input dialog
        // 2. Preview generation
        // 3. Upload to server
    });
    
    // ===== DELETE ACCOUNT =====
    document.getElementById('delete-account-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
            alert('Account deletion requested. In a real app, this would send a request to the server.');
            // Redirect to homepage after deletion
            // window.location.href = '/';
        }
    });
    
    // ===== MODAL CONTROLS =====
    function openModal(id) {
        document.getElementById(id).style.display = 'flex';
    }
    
    function closeModal(id) {
        document.getElementById(id).style.display = 'none';
    }
    
    // Example modal usage:
    document.getElementById('edit-cover-btn').addEventListener('click', function() {
        openModal('cover-photo-modal'); // You'd need to create this modal
    });
});