document.addEventListener('DOMContentLoaded', function () {
    // Dark mode toggle functionality
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    function initDarkMode() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
    }
    
    function toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    if (darkModeToggle) {
        initDarkMode();
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Base tooltip functionality
    function initTooltips() {
        const tooltipItems = document.querySelectorAll('[data-tooltip]:not(.tooltip-initialized)');
        
        tooltipItems.forEach(item => {
            item.classList.add('tooltip-initialized');
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = item.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const positionTooltip = () => {
                const rect = item.getBoundingClientRect();
                const offset = document.querySelector('.dashboard-sidebar.collapsed') ? 70 : 280;
                tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
                tooltip.style.top = `${rect.top - 10}px`;
            };
            
            item.addEventListener('mouseenter', () => {
                positionTooltip();
                tooltip.style.display = 'block';
            });
            
            item.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
            
            window.addEventListener('resize', positionTooltip);
        });
    }
    
    initTooltips();
    
    // Sidebar toggle functionality
    const sidebarToggle = document.querySelector('.sidebar-toggle-btn');
    const sidebar = document.querySelector('.dashboard-sidebar');
    const topNav = document.querySelector('.top-nav');
    const dashboardContent = document.querySelector('.dashboard-content');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            topNav.classList.toggle('sidebar-collapsed');
            dashboardContent.classList.toggle('sidebar-collapsed');
            
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
        
        // Initialize sidebar state
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            topNav.classList.add('sidebar-collapsed');
            dashboardContent.classList.add('sidebar-collapsed');
        }
    }
    
    // Sidebar dropdown functionality
    const navGroups = document.querySelectorAll('.nav-group');
    
    navGroups.forEach(group => {
        const header = group.querySelector('.nav-header');
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            group.classList.toggle('active');
        });
    });
    
});

// Add to the existing base_minimal.js
document.addEventListener('DOMContentLoaded', function() {
    // Profile form submission is handled in profile_completion.js
    // No conflicting handlers here
});