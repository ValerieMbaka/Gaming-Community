document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const sidebar = document.querySelector('.dashboard-sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    const dashboardWrapper = document.querySelector('.dashboard-wrapper');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const navGroups = document.querySelectorAll('.nav-group');
    const badgeIcons = document.querySelectorAll('.badge-icon');
    
    // Sidebar Toggle Functionality
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        toggleBtn.classList.toggle('active');
        if (dashboardWrapper) {
            dashboardWrapper.classList.toggle('sidebar-collapsed');
        }
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
    
    // Initialize Sidebar State from LocalStorage
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        toggleSidebar();
    }
    
    // Sidebar Toggle Button Click
    toggleBtn?.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleSidebar();
    });
    
    // Close Sidebar on Outside Click (Mobile)
    document.addEventListener('click', function (e) {
        const isMobile = window.innerWidth <= 992;
        const isClickOutsideSidebar = !sidebar.contains(e.target) && e.target !== toggleBtn;
        
        if (isMobile && isClickOutsideSidebar) {
            if (!sidebar.classList.contains('collapsed')) {
                toggleSidebar();
            }
        }
    });
    
    // Submenu Toggle Functionality
    navGroups.forEach(group => {
        const header = group.querySelector('.nav-header');
        header?.addEventListener('click', function (e) {
            // Close all other submenus
            navGroups.forEach(otherGroup => {
                if (otherGroup !== group) {
                    otherGroup.classList.remove('active');
                }
            });
            
            // Toggle current submenu
            group.classList.toggle('active');
            e.stopPropagation();
        });
    });
    
    // Close all submenus when clicking elsewhere
    document.addEventListener('click', function () {
        navGroups.forEach(group => {
            group.classList.remove('active');
        });
    });
    
    // Prevent submenu closing when clicking inside
    document.querySelectorAll('.submenu').forEach(menu => {
        menu.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    });
    
    // Dark Mode Initialization and Toggle
    function initDarkMode() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
            if (darkModeToggle) {
                darkModeToggle.checked = true;
            }
        }
    }
    
    initDarkMode();
    
    darkModeToggle?.addEventListener('change', function () {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', this.checked);
    });
    
    // Tooltip Hover Effects
    badgeIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function () {
            // Tooltip logic handled via CSS
        });
    });
});
