document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('profileCompletionModal');
    
    // Add mandatory class if profile is incomplete
    if (modal.classList.contains('show')) {
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
});