document.addEventListener('DOMContentLoaded', function () {
    // Dark mode toggle functionality
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    function initDarkMode() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
        }
    }
    
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }
    
    if (darkModeToggle) {
        initDarkMode();
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Tooltip functionality
    function initTooltips() {
        const tooltipItems = document.querySelectorAll('[data-tooltip]');
        
        tooltipItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const tooltip = document.createElement('div');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = this.getAttribute('data-tooltip');
                
                const rect = this.getBoundingClientRect();
                tooltip.style.position = 'fixed';
                tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
                tooltip.style.top = `${rect.top - 10}px`;
                tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
                
                document.body.appendChild(tooltip);
                
                this._tooltip = tooltip;
            });
            
            item.addEventListener('mouseleave', function() {
                if (this._tooltip) {
                    document.body.removeChild(this._tooltip);
                    delete this._tooltip;
                }
            });
        });
    }
    
    initTooltips();
    
    // Tab system functionality
    const tabButtons = document.querySelectorAll('.tab-btn, .profile-tab');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabContainer = this.closest('.content-tabs, .profile-tabs-container');
            if (!tabContainer) return;
            
            // Remove active class from all buttons and content in this container
            const allButtons = tabContainer.querySelectorAll('.tab-btn, .profile-tab');
            const allContents = document.querySelectorAll('.tab-content, .profile-tab-content');
            
            allButtons.forEach(el => el.classList.remove('active'));
            allContents.forEach(el => el.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            if (tabId) {
                document.getElementById(tabId)?.classList.add('active');
            }
        });
    });
});