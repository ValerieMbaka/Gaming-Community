document.addEventListener('DOMContentLoaded', function () {
    // Initialize tooltips for achievement badges
    const achievementItems = document.querySelectorAll('.achievement-item');
    
    achievementItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            
            // Get achievement details
            const achievementName = this.querySelector('.achievement-title').textContent;
            const achievementDate = this.querySelector('.achievement-date').textContent;
            
            tooltip.innerHTML = `<strong>${achievementName}</strong><br>${achievementDate}`;
            
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
    
    // Initialize any other profile-specific functionality here
});