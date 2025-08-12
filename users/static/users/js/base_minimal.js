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
    // Profile picture preview
    const profilePicInput = document.querySelector('input[name="profile_picture"]');
    if (profilePicInput) {
        profilePicInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.createElement('img');
                    preview.src = event.target.result;
                    preview.className = 'profile-pic-preview';
                    preview.style.display = 'block';
                    
                    const existingPreview = document.querySelector('.profile-pic-preview');
                    if (existingPreview) {
                        existingPreview.replaceWith(preview);
                    } else {
                        profilePicInput.insertAdjacentElement('afterend', preview);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(profileForm);
            
            fetch(profileForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                }
            })
            .then(response => {
                if (response.ok) {
                    window.location.reload();
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error saving your profile. Please try again.');
            });
        });
    }
});