document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('profileCompletionModal');
    
    // Check if profile is already completed (either in localStorage or server-side)
    const profileCompleted = localStorage.getItem('profileCompleted') === 'true';
    
    // If profile is completed, hide the modal
    if (profileCompleted && modal) {
        modal.classList.remove('show', 'mandatory');
        modal.style.display = 'none';
    }
    
    // Add mandatory class if profile is incomplete and modal is shown
    if (modal && modal.classList.contains('show')) {
        modal.classList.add('mandatory');
    }
    
    // Prevent closing by clicking outside (for mandatory modals)
    modal.addEventListener('click', function(e) {
        if (e.target === modal && modal.classList.contains('mandatory')) {
            e.stopPropagation();
        }
    });
    
    // Prevent closing with ESC key (for mandatory modals)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('mandatory')) {
            e.preventDefault();
        }
    });
    
    // Clear localStorage when user logs out (this will be handled by logout view)
    // For now, we'll add a function to clear it manually if needed
    window.clearProfileCompletion = function() {
        localStorage.removeItem('profileCompleted');
        localStorage.removeItem('updatedProfile');
    };
});