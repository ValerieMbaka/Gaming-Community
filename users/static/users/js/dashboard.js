document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard tabs
    const dashboardTabs = document.querySelectorAll('.profile-tab');
    
    if (dashboardTabs.length > 0) {
        dashboardTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                dashboardTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Hide all tab contents
                document.querySelectorAll('.profile-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show the corresponding content
                const tabId = this.getAttribute('data-tab');
                if (tabId) {
                    document.getElementById(tabId)?.classList.add('active');
                }
            });
        });
    }

    // Dashboard-specific animations
    const statCards = document.querySelectorAll('.stat-item-horizontal');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Initialize any dashboard-specific plugins or components
    function initCountdownTimers() {
        const countdowns = document.querySelectorAll('.countdown-timer');
        // Countdown timer logic would go here
    }

    initCountdownTimers();
});