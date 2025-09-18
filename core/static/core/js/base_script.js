// Back to Top Button
window.addEventListener('scroll', function() {
    var backToTop = document.getElementById('backToTop');
    if (window.pageYOffset > 300) {
        backToTop.classList.add('active');
    } else {
        backToTop.classList.remove('active');
    }
});

document.getElementById('backToTop').addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
    
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
    
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Add animation classes when elements come into view
const animateOnScroll = function() {
    const elements = document.querySelectorAll('.fade-in-up');
  
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
    
        if (elementPosition < windowHeight - 100) {
            element.classList.add('animated');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Initialize tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Theme Management 
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.lightIcon = document.getElementById('lightIcon');
        this.darkIcon = document.getElementById('darkIcon');
        this.html = document.documentElement;
        
        this.init();
    }
    
    init() {
        // Check for saved theme preference or default to light
        const currentTheme = localStorage.getItem('theme') || 'light';
        this.html.setAttribute('data-theme', currentTheme);
        this.updateThemeUI(currentTheme);
        
        // Add event listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    toggleTheme() {
        const currentTheme = this.html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeUI(newTheme);
    }
    
    updateThemeUI(theme) {
        if (theme === 'dark') {
            if (this.lightIcon) this.lightIcon.style.display = 'none';
            if (this.darkIcon) this.darkIcon.style.display = 'inline-block';
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            if (this.lightIcon) this.lightIcon.style.display = 'inline-block';
            if (this.darkIcon) this.darkIcon.style.display = 'none';
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.updateActiveNavLink();
        this.addClickHandlers();
    }
    
    updateActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // Check if the link href matches current path
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
            
            // Special case for home page
            if (currentPath === '/' && link.getAttribute('href') === '#') {
                link.classList.add('active');
            }
        });
    }
    
    addClickHandlers() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                // Remove active class from all links
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Add visual feedback
                link.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            });
        });
    }
}

// Lazy Loading Manager
class LazyLoadingManager {
    constructor() {
        this.init();
    }
    
    init() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            this.fallbackLazyLoading();
        }
    }
    
    setupIntersectionObserver() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    fallbackLazyLoading() {
        // Fallback for older browsers
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// Django Messages Manager 
class DjangoMessagesManager {
    constructor() {
        this.init();
    }
    
    init() {
        try {
            const messagesElement = document.getElementById('django-messages');
            const authElement = document.getElementById('user-auth-status');
            
            if (messagesElement && authElement) {
                const djangoMessages = JSON.parse(messagesElement.textContent);
                const authStatus = JSON.parse(authElement.textContent);
                
                this.handleDjangoMessages(djangoMessages);
                this.handleAuthStatus(authStatus);
            }
        } catch (error) {
            console.error('Error processing Django messages:', error);
        }
    }
    
    handleDjangoMessages(messages) {
        if (messages && messages.length > 0) {
            messages.forEach(message => {
                if (message && message.text) {
                    // Check if showToast function exists (from toast.js)
                    if (typeof showToast === 'function') {
                        showToast(message.text, message.tags || 'info');
                    } else {
                        console.log('Toast message:', message.text);
                    }
                }
            });
        }
    }
    
    handleAuthStatus(authStatus) {
        // Clear profile completion data if user is not authenticated
        if (!authStatus.authenticated) {
            localStorage.removeItem('profileCompleted');
            localStorage.removeItem('updatedProfile');
        }
    }
}

// ===== Enhanced Link States =====
class LinkStateManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.addLinkEnhancements();
        this.addButtonEnhancements();
    }
    
    addLinkEnhancements() {
        // Add enhanced states to all links
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                // Add subtle click feedback
                link.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            });
        });
    }
    
    addButtonEnhancements() {
        // Add enhanced states to buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Add click feedback
                btn.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
            });
        });
    }
}

// Main Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all managers
    new ThemeManager();
    new NavigationManager();
    new LazyLoadingManager();
    new DjangoMessagesManager();
    new LinkStateManager();
    
    console.log('GameHub Base Scripts Initialized Successfully!');
});