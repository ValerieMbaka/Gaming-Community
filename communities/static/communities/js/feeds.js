// Feeds Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all feed functionality
    initFeeds();
});

function initFeeds() {
    // Initialize all components
    initFiltering();
    initLikeSystem();
    initCommentSystem();
    initPostCreation();
    initFollowSystem();
    initLoadMore();
    initTrendingTopics();
    initPostMenu();
    initAnimations();
}

// Filtering System
function initFiltering() {
    const filterOptions = document.querySelectorAll('.filter-option');
    const feedPosts = document.querySelectorAll('.post-card[data-category]');

    filterOptions.forEach(option => {
        option.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active filter
            filterOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Filter posts
            filterPosts(filter);
        });
    });
}

function filterPosts(filter) {
    const posts = document.querySelectorAll('.post-card[data-category]');
    
    posts.forEach(post => {
        const category = post.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
            post.style.display = 'block';
            post.classList.add('fade-in');
        } else {
            post.style.display = 'none';
            post.classList.remove('fade-in');
        }
    });
}

// Like System
function initLikeSystem() {
    const likeButtons = document.querySelectorAll('.like-btn');
    
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            toggleLike(this, postId);
        });
    });
}

function toggleLike(button, postId) {
    const icon = button.querySelector('i');
    const isLiked = button.classList.contains('liked');
    
    if (isLiked) {
        // Unlike
        button.classList.remove('liked');
        icon.style.color = '';
        updateLikeCount(button, -1);
    } else {
        // Like
        button.classList.add('liked');
        icon.style.color = '#ef4444';
        updateLikeCount(button, 1);
    }
    
    // Animate heart
    icon.style.animation = 'none';
    setTimeout(() => {
        icon.style.animation = 'heartBeat 0.3s ease-in-out';
    }, 10);
    
    // Simulate API call
    simulateLikeAPI(postId, !isLiked);
}

function updateLikeCount(button, change) {
    const statsContainer = button.closest('.post-card').querySelector('.post-stats');
    const likeStat = statsContainer.querySelector('.stat-item:first-child span');
    const currentText = likeStat.textContent;
    const currentCount = parseInt(currentText.match(/\d+/)[0]);
    const newCount = Math.max(0, currentCount + change);
    
    likeStat.textContent = `${newCount} like${newCount !== 1 ? 's' : ''}`;
}

function simulateLikeAPI(postId, isLiked) {
    // Simulate API call delay
    setTimeout(() => {
        console.log(`Post ${postId} ${isLiked ? 'liked' : 'unliked'}`);
        // Here you would make an actual API call
    }, 300);
}

// Comment System
function initCommentSystem() {
    const commentButtons = document.querySelectorAll('.comment-btn');
    const commentSends = document.querySelectorAll('.comment-send');
    
    commentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            toggleComments(postId);
        });
    });
    
    commentSends.forEach(button => {
        button.addEventListener('click', function() {
            const commentSection = this.closest('.comments-section');
            const input = commentSection.querySelector('.comment-text');
            const comment = input.value.trim();
            
            if (comment) {
                addComment(commentSection, comment);
                input.value = '';
            }
        });
    });
    
    // Enter key to send comment
    document.querySelectorAll('.comment-text').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const sendButton = this.closest('.comment-input').querySelector('.comment-send');
                sendButton.click();
            }
        });
    });
}

function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
        const isVisible = commentsSection.style.display !== 'none';
        commentsSection.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            commentsSection.classList.add('slide-in');
            // Focus on comment input
            const input = commentsSection.querySelector('.comment-text');
            if (input) {
                setTimeout(() => input.focus(), 300);
            }
        }
    }
}

function addComment(commentSection, commentText) {
    const commentsList = commentSection.querySelector('.comments-list');
    const currentUser = {
        name: 'You',
        avatar: '/static/core/images/player.jpeg',
        time: 'Just now'
    };
    
    const commentHTML = `
        <div class="comment fade-in">
            <img src="${currentUser.avatar}" alt="User Avatar" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-username">${currentUser.name}</span>
                    <span class="comment-time">${currentUser.time}</span>
                </div>
                <p class="comment-text">${escapeHtml(commentText)}</p>
            </div>
        </div>
    `;
    
    commentsList.insertAdjacentHTML('afterbegin', commentHTML);
    
    // Update comment count
    updateCommentCount(commentSection, 1);
}

function updateCommentCount(commentSection, change) {
    const postCard = commentSection.closest('.post-card');
    const statsContainer = postCard.querySelector('.post-stats');
    const commentStat = statsContainer.querySelector('.stat-item:nth-child(2) span');
    const currentText = commentStat.textContent;
    const currentCount = parseInt(currentText.match(/\d+/)[0]);
    const newCount = Math.max(0, currentCount + change);
    
    commentStat.textContent = `${newCount} comment${newCount !== 1 ? 's' : ''}`;
}

// Post Creation
function initPostCreation() {
    const createPostBtn = document.querySelector('.create-post-btn');
    const publishBtn = document.getElementById('publishPost');
    const postTextarea = document.querySelector('.post-textarea');
    
    if (publishBtn) {
        publishBtn.addEventListener('click', function() {
            const content = postTextarea.value.trim();
            if (content) {
                createPost(content);
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('createPostModal'));
                if (modal) {
                    modal.hide();
                }
                postTextarea.value = '';
            }
        });
    }
    
    // Character counter
    if (postTextarea) {
        postTextarea.addEventListener('input', function() {
            const maxLength = 500;
            const currentLength = this.value.length;
            const remaining = maxLength - currentLength;
            
            // Update character counter if it exists
            let counter = document.querySelector('.char-counter');
            if (!counter) {
                counter = document.createElement('div');
                counter.className = 'char-counter text-muted small mt-2';
                this.parentNode.appendChild(counter);
            }
            
            counter.textContent = `${remaining} characters remaining`;
            
            if (remaining < 0) {
                counter.style.color = '#ef4444';
            } else {
                counter.style.color = '';
            }
        });
    }
}

function createPost(content) {
    const feedPosts = document.getElementById('feedPosts');
    const currentUser = {
        name: 'You',
        avatar: '/static/core/images/player.jpeg',
        time: 'Just now'
    };
    
    const postHTML = `
        <div class="post-card fade-in" data-category="all">
            <div class="post-header">
                <div class="user-info">
                    <div class="user-avatar">
                        <img src="${currentUser.avatar}" alt="User Avatar">
                    </div>
                    <div class="user-details">
                        <h5 class="username">${currentUser.name}</h5>
                        <span class="post-time">${currentUser.time}</span>
                    </div>
                </div>
                <div class="post-menu">
                    <button class="menu-btn">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>

            <div class="post-content">
                <p class="post-text">${escapeHtml(content)}</p>
            </div>

            <div class="post-stats">
                <div class="stat-item">
                    <i class="fas fa-heart"></i>
                    <span>0 likes</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-comment"></i>
                    <span>0 comments</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-share"></i>
                    <span>0 shares</span>
                </div>
            </div>

            <div class="post-actions">
                <button class="action-btn like-btn" data-post-id="new-${Date.now()}">
                    <i class="fas fa-heart"></i> Like
                </button>
                <button class="action-btn comment-btn" data-post-id="new-${Date.now()}">
                    <i class="fas fa-comment"></i> Comment
                </button>
                <button class="action-btn share-btn" data-post-id="new-${Date.now()}">
                    <i class="fas fa-share"></i> Share
                </button>
            </div>
        </div>
    `;
    
    // Insert at the top of the feed
    const createPostCard = feedPosts.querySelector('.create-post-card');
    if (createPostCard) {
        createPostCard.insertAdjacentHTML('afterend', postHTML);
    } else {
        feedPosts.insertAdjacentHTML('afterbegin', postHTML);
    }
    
    // Reinitialize like and comment systems for the new post
    initLikeSystem();
    initCommentSystem();
    
    // Show success message
    showToast('Post created successfully!', 'success');
}

// Follow System
function initFollowSystem() {
    const followButtons = document.querySelectorAll('.follow-btn');
    
    followButtons.forEach(button => {
        button.addEventListener('click', function() {
            const isFollowing = this.classList.contains('following');
            
            if (isFollowing) {
                this.classList.remove('following');
                this.textContent = 'Follow';
                showToast('Unfollowed successfully', 'info');
            } else {
                this.classList.add('following');
                this.textContent = 'Following';
                showToast('Followed successfully', 'success');
            }
        });
    });
}

// Load More
function initLoadMore() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            this.classList.add('loading');
            this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            
            // Simulate loading more posts
            setTimeout(() => {
                loadMorePosts();
                this.classList.remove('loading');
                this.innerHTML = '<i class="fas fa-spinner me-2"></i>Load More Posts';
            }, 1500);
        });
    }
}

function loadMorePosts() {
    // Simulate loading more posts
    const samplePosts = [
        {
            username: 'GamingPro',
            avatar: '/static/core/images/player1.jpeg',
            time: '4 hours ago',
            content: 'Just hit Diamond rank in Valorant! The grind was real but totally worth it. 🎯 #Valorant #GamingAchievement',
            category: 'highlights',
            likes: 156,
            comments: 23,
            shares: 8
        },
        {
            username: 'TechGamer',
            avatar: '/static/core/images/player2.jpeg',
            time: '6 hours ago',
            content: 'New gaming setup complete! RTX 4090, 4K monitor, and mechanical keyboard. Performance is absolutely insane! 🚀 #GamingSetup #PCGaming',
            category: 'highlights',
            likes: 342,
            comments: 45,
            shares: 67
        }
    ];
    
    const feedPosts = document.getElementById('feedPosts');
    
    samplePosts.forEach(post => {
        const postHTML = createPostHTML(post);
        feedPosts.insertAdjacentHTML('beforeend', postHTML);
    });
    
    // Reinitialize systems for new posts
    initLikeSystem();
    initCommentSystem();
    
    showToast('Loaded more posts!', 'success');
}

function createPostHTML(post) {
    return `
        <div class="post-card fade-in" data-category="${post.category}">
            <div class="post-header">
                <div class="user-info">
                    <div class="user-avatar">
                        <img src="${post.avatar}" alt="User Avatar">
                    </div>
                    <div class="user-details">
                        <h5 class="username">${post.username}</h5>
                        <span class="post-time">${post.time}</span>
                    </div>
                </div>
                <div class="post-menu">
                    <button class="menu-btn">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>

            <div class="post-content">
                <p class="post-text">${escapeHtml(post.content)}</p>
            </div>

            <div class="post-stats">
                <div class="stat-item">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes} likes</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments} comments</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-share"></i>
                    <span>${post.shares} shares</span>
                </div>
            </div>

            <div class="post-actions">
                <button class="action-btn like-btn" data-post-id="load-${Date.now()}-${Math.random()}">
                    <i class="fas fa-heart"></i> Like
                </button>
                <button class="action-btn comment-btn" data-post-id="load-${Date.now()}-${Math.random()}">
                    <i class="fas fa-comment"></i> Comment
                </button>
                <button class="action-btn share-btn" data-post-id="load-${Date.now()}-${Math.random()}">
                    <i class="fas fa-share"></i> Share
                </button>
            </div>
        </div>
    `;
}

// Trending Topics
function initTrendingTopics() {
    const topicTags = document.querySelectorAll('.topic-tag');
    
    topicTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const topic = this.textContent;
            showToast(`Searching for ${topic}...`, 'info');
            // Here you would implement topic search functionality
        });
    });
}

// Post Menu
function initPostMenu() {
    const menuButtons = document.querySelectorAll('.menu-btn');
    
    menuButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const postCard = this.closest('.post-card');
            showPostMenu(postCard, this);
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function() {
        const openMenus = document.querySelectorAll('.post-menu-dropdown');
        openMenus.forEach(menu => menu.remove());
    });
}

function showPostMenu(postCard, button) {
    // Remove existing menus
    document.querySelectorAll('.post-menu-dropdown').forEach(menu => menu.remove());
    
    const menuHTML = `
        <div class="post-menu-dropdown">
            <button class="menu-item">
                <i class="fas fa-bookmark"></i> Save Post
            </button>
            <button class="menu-item">
                <i class="fas fa-flag"></i> Report
            </button>
            <button class="menu-item">
                <i class="fas fa-share"></i> Share
            </button>
        </div>
    `;
    
    const menu = document.createElement('div');
    menu.innerHTML = menuHTML;
    menu.className = 'post-menu-dropdown';
    
    // Position menu
    const rect = button.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.right = '0px';
    menu.style.zIndex = '1000';
    
    button.parentNode.style.position = 'relative';
    button.parentNode.appendChild(menu);
    
    // Add menu item functionality
    const menuItems = menu.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const action = this.textContent.trim();
            showToast(`${action} action triggered`, 'info');
            menu.remove();
        });
    });
}

// Animations
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe all post cards
    document.querySelectorAll('.post-card').forEach(card => {
        observer.observe(card);
    });
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    // Check if toast system exists
    if (typeof showToastMessage === 'function') {
        showToastMessage(message, type);
    } else {
        // Fallback toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Share functionality
function initShareSystem() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            sharePost(postId);
        });
    });
}

function sharePost(postId) {
    if (navigator.share) {
        navigator.share({
            title: 'Check out this gaming post!',
            text: 'I found this interesting post on the gaming community platform.',
            url: window.location.href
        }).then(() => {
            showToast('Post shared successfully!', 'success');
        }).catch(() => {
            showToast('Share cancelled', 'info');
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Failed to copy link', 'error');
        });
    }
}

// Initialize share system
initShareSystem();

// Add CSS for menu dropdown
const menuStyles = `
<style>
.post-menu-dropdown {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    min-width: 150px;
    z-index: 1000;
}

.menu-item {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    text-align: left;
    color: #374151;
    font-size: 0.875rem;
    transition: background-color 0.2s;
}

.menu-item:hover {
    background-color: #f3f4f6;
}

.menu-item i {
    margin-right: 0.5rem;
    width: 16px;
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', menuStyles);
