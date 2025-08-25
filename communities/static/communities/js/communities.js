// Communities Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const communityCards = document.querySelectorAll('[data-category]');

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards
            communityCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Join button functionality
    document.querySelectorAll('.btn-join').forEach(button => {
        button.addEventListener('click', function() {
            const communityCard = this.closest('.community-card');
            const communityName = communityCard.querySelector('.community-title').textContent;
            
            // Check if it's a coming soon card
            if (communityCard.classList.contains('coming-soon')) {
                alert(`${communityName} community is coming soon! Stay tuned for updates.`);
            } else {
                alert(`Joining ${communityName} community! This feature will be implemented with user authentication.`);
            }
        });
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Add loading animation for community cards
    function animateCards() {
        const cards = document.querySelectorAll('.community-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            }, index * 100);
        });
    }

    // Run animation on page load
    animateCards();
});
