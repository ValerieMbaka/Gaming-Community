document.addEventListener('DOMContentLoaded', function () {
    // Dark Mode Toggle
    class DarkMode {
        constructor() {
            this.toggleButton = document.getElementById('darkModeToggle');
            if (this.toggleButton) this.init();
        }

        init() {
            this.loadTheme();
            this.toggleButton.addEventListener('click', () => this.toggle());
        }

        loadTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        toggle() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }
    }

    new DarkMode();

    // Tooltip Manager
    class TooltipManager {
        constructor() {
            this.tooltips = [];
            this.init();
        }

        init() {
            this.createTooltips();
            this.setupEventListeners();
        }

        createTooltips() {
            document.querySelectorAll('[data-tooltip]:not(.tooltip-initialized)').forEach(item => {
                item.classList.add('tooltip-initialized');

                const tooltip = document.createElement('div');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = item.getAttribute('data-tooltip');
                document.body.appendChild(tooltip);

                this.tooltips.push({ element: item, tooltip });
            });
        }

        setupEventListeners() {
            this.tooltips.forEach(({ element, tooltip }) => {
                const positionTooltip = () => {
                    const rect = element.getBoundingClientRect();
                    const isSidebarCollapsed = document.querySelector('.dashboard-sidebar.collapsed');
                    const offset = isSidebarCollapsed ? 70 : 280;

                    tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
                    tooltip.style.top = `${rect.top - 10}px`;
                };

                element.addEventListener('mouseenter', () => {
                    positionTooltip();
                    tooltip.style.display = 'block';
                });

                element.addEventListener('mouseleave', () => {
                    tooltip.style.display = 'none';
                });

                window.addEventListener('resize', positionTooltip);
            });
        }
    }

    new TooltipManager();

    // Sidebar Toggle
    class SidebarManager {
        constructor() {
            this.toggleButton = document.querySelector('.sidebar-toggle-btn');
            this.sidebar = document.querySelector('.dashboard-sidebar');
            this.topNav = document.querySelector('.top-nav');
            this.dashboardContent = document.querySelector('.dashboard-content');
            if (this.toggleButton && this.sidebar) this.init();
        }

        init() {
            this.loadState();
            this.setupEventListeners();
        }

        loadState() {
            if (localStorage.getItem('sidebarCollapsed') === 'true') {
                this.sidebar.classList.add('collapsed');
                this.topNav.classList.add('sidebar-collapsed');
                this.dashboardContent.classList.add('sidebar-collapsed');
            }
        }

        setupEventListeners() {
            this.toggleButton.addEventListener('click', () => this.toggle());
        }

        toggle() {
            this.sidebar.classList.toggle('collapsed');
            this.topNav.classList.toggle('sidebar-collapsed');
            this.dashboardContent.classList.toggle('sidebar-collapsed');
            localStorage.setItem('sidebarCollapsed', this.sidebar.classList.contains('collapsed'));
        }
    }

    new SidebarManager();

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