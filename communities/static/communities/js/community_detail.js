// Community Detail Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs and panes
            tabLinks.forEach(l => l.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding tab pane
            const targetTab = this.getAttribute('data-tab');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // Join Community button functionality
    const joinButtons = document.querySelectorAll('.btn-join, .btn-primary');
    joinButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Show loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';
            this.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Joined!';
                this.classList.remove('btn-primary');
                this.classList.add('btn-success');
                
                // Show success notification
                showNotification('Successfully joined the community!', 'success');
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                    this.classList.remove('btn-success');
                    this.classList.add('btn-primary');
                }, 3000);
            }, 1500);
        });
    });

    // Discord button functionality
    const discordButtons = document.querySelectorAll('.btn-discord');
    discordButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Show loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';
            this.disabled = true;
            
            // Simulate redirect to Discord
            setTimeout(() => {
                showNotification('Redirecting to Discord...', 'info');
                // In a real implementation, this would redirect to Discord invite link
                // window.open('https://discord.gg/your-invite-link', '_blank');
            }, 1000);
        });
    });

    // Tournament join functionality
    const tournamentButtons = document.querySelectorAll('.tournament-card .btn-outline-primary');
    tournamentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tournamentName = this.closest('.tournament-card').querySelector('h4').textContent;
            
            // Show loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';
            this.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Joined!';
                this.classList.remove('btn-outline-primary');
                this.classList.add('btn-success');
                
                showNotification(`Successfully joined ${tournamentName}!`, 'success');
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                    this.classList.remove('btn-success');
                    this.classList.add('btn-outline-primary');
                }, 3000);
            }, 1500);
        });
    });

    // Member search functionality
    const memberSearch = document.querySelector('.member-filters input[type="text"]');
    if (memberSearch) {
        memberSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const memberCards = document.querySelectorAll('.member-card');
            
            memberCards.forEach(card => {
                const memberName = card.querySelector('h5').textContent.toLowerCase();
                const memberRole = card.querySelector('p').textContent.toLowerCase();
                
                if (memberName.includes(searchTerm) || memberRole.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Member filter functionality
    const memberFilter = document.querySelector('.member-filters select');
    if (memberFilter) {
        memberFilter.addEventListener('change', function() {
            const filterValue = this.value;
            const memberCards = document.querySelectorAll('.member-card');
            
            memberCards.forEach(card => {
                const memberStatus = card.querySelector('.member-status');
                
                if (filterValue === 'All Members') {
                    card.style.display = 'flex';
                } else if (filterValue === 'Online' && memberStatus.classList.contains('online')) {
                    card.style.display = 'flex';
                } else if (filterValue === 'Offline' && memberStatus.classList.contains('offline')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Discussion functionality
    const newDiscussionBtn = document.querySelector('.discussions-section .btn-primary');
    if (newDiscussionBtn) {
        newDiscussionBtn.addEventListener('click', function() {
            showNotification('Discussion creation feature coming soon!', 'info');
        });
    }

    // Share community functionality
    const shareButtons = document.querySelectorAll('.btn-outline-secondary');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: 'Gaming Community',
                    text: 'Check out this amazing gaming community!',
                    url: window.location.href
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                navigator.clipboard.writeText(window.location.href).then(() => {
                    showNotification('Link copied to clipboard!', 'success');
                });
            }
        });
    });

    // Create tournament functionality
    const createTournamentBtn = document.querySelector('.tournaments-section .btn-primary');
    if (createTournamentBtn) {
        createTournamentBtn.addEventListener('click', function() {
            showNotification('Tournament creation feature coming soon!', 'info');
        });
    }

    // Game tag click functionality
    const gameTags = document.querySelectorAll('.game-tag');
    gameTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const gameName = this.textContent;
            showNotification(`Filtering by ${gameName}...`, 'info');
        });
    });

    // Channel click functionality
    const channelItems = document.querySelectorAll('.channel-item');
    channelItems.forEach(item => {
        item.addEventListener('click', function() {
            const channelName = this.querySelector('span').textContent;
            showNotification(`Joining ${channelName}...`, 'info');
        });
    });

    // Player rank hover effect
    const playerRanks = document.querySelectorAll('.player-rank');
    playerRanks.forEach(rank => {
        rank.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        rank.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Feature card hover animations
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Game card hover animations
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Tournament card hover animations
    const tournamentCards = document.querySelectorAll('.tournament-card');
    tournamentCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Discussion card hover animations
    const discussionCards = document.querySelectorAll('.discussion-card');
    discussionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.01)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Member card hover animations
    const memberCards = document.querySelectorAll('.member-card');
    memberCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.01)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Notification system
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `toast-notification toast-${type}`;
        notification.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            hideNotification(notification);
        }, 5000);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            hideNotification(notification);
        });
    }
    
    function hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            case 'info': return 'info-circle';
            default: return 'info-circle';
        }
    }

    // Initialize tooltips for better UX
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });

    // Add loading states for better UX
    const loadingElements = document.querySelectorAll('[data-loading]');
    loadingElements.forEach(element => {
        element.addEventListener('click', function() {
            if (!this.disabled) {
                this.classList.add('loading');
                this.disabled = true;
                
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.disabled = false;
                }, 2000);
            }
        });
    });

    console.log('Community detail page initialized successfully!');
});
