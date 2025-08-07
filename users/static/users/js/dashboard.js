document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const sidebar = document.querySelector('.dashboard-sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    const profileToggle = document.querySelector('.sidebar-profile-toggle');
    const navGroups = document.querySelectorAll('.nav-group');
    const navDropdowns = document.querySelectorAll('.nav-dropdown');
    const searchBar = document.querySelector('.search-bar');
    
    // Initialize sidebar state
    function initSidebar() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            updateChevron();
            handleSidebarResize();
        }
    }
    
    // Toggle sidebar between expanded and collapsed states
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        updateChevron();
        handleSidebarResize();
    }
    
    // Update chevron direction based on sidebar state
    function updateChevron() {
        if (!profileToggle) return;
        const chevron = profileToggle.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            chevron.classList.remove('fa-chevron-left');
            chevron.classList.add('fa-chevron-right');
        } else {
            chevron.classList.remove('fa-chevron-right');
            chevron.classList.add('fa-chevron-left');
        }
    }
    
    // Handle header and search bar resizing
    function handleSidebarResize() {
        if (searchBar) {
            if (sidebar.classList.contains('collapsed')) {
                searchBar.style.flex = '1';
                searchBar.style.maxWidth = 'none';
            } else {
                searchBar.style.flex = '1';
                searchBar.style.maxWidth = '600px';
            }
        }
    }
    
    // Enhanced dropdown handler
    function setupDropdown(dropdown) {
        const btn = dropdown.querySelector('button');
        const content = dropdown.querySelector('.nav-dropdown-content');
        
        if (!btn || !content) return;
        
        // Click handler for dropdown button
        const handleButtonClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Close all other dropdowns first
            document.querySelectorAll('.nav-dropdown').forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('active');
                }
            });
            
            // Toggle current dropdown
            dropdown.classList.toggle('active');
        };
        
        // Close handler
        const closeDropdown = () => {
            dropdown.classList.remove('active');
        };
        
        // Set up event listeners
        btn.addEventListener('click', handleButtonClick);
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                closeDropdown();
            }
        });
        
        // Prevent dropdown from closing when clicking inside
        content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Close when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dropdown.classList.contains('active')) {
                closeDropdown();
            }
        });
    }
    
    // Initialize everything
    function init() {
        initSidebar();
        
        // Sidebar toggle
        toggleBtn?.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleSidebar();
        });
        
        // Profile toggle in sidebar
        profileToggle?.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSidebar();
        });
        
        // Submenu toggle functionality
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
        
        // Setup dropdowns
        navDropdowns.forEach(dropdown => setupDropdown(dropdown));
        
        // Mark all notifications as read
        const markAllReadBtns = document.querySelectorAll('.mark-all-read');
        markAllReadBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.notification-item.unread, .message-item.unread').forEach(item => {
                    item.classList.remove('unread');
                });
                document.querySelectorAll('.notification-bubble').forEach(bubble => {
                    bubble.textContent = '0';
                });
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', handleSidebarResize);
    }
    
    // Start the app
    init();
});