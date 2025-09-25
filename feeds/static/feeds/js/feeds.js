document.addEventListener('DOMContentLoaded', function() {
  const viewMembersBtn = document.getElementById('viewMembersBtn');
  const backToFeedBtn = document.getElementById('backToFeed');
  const feedPosts = document.getElementById('feedPosts');
  const membersPanel = document.getElementById('membersPanel');
  const commentButtons = document.querySelectorAll('.comment-btn');
  const commentsStats = document.querySelectorAll('.comments-stat');
  const loadMoreBtn = document.querySelector('.load-more-btn');
  const filterChips = document.querySelectorAll('.filter-chip');
  const modalPostForm = document.getElementById('modalPostForm');
  const modalPostContent = document.getElementById('modalPostContent');
  const modalPhotoInput = document.getElementById('modalPhotoInput');
  const modalImagePreview = document.getElementById('modalImagePreview');
  const modalMediaPreview = document.getElementById('modalMediaPreview');

  if (viewMembersBtn && membersPanel && feedPosts) {
    viewMembersBtn.addEventListener('click', function() {
        // Hide the entire sidebar content
        const sidebarContent = document.querySelector('.feeds-sidebar > *:not(#membersPanel)');
        if (sidebarContent) {
            sidebarContent.style.display = 'none';
        }
        
        // Show members panel
        membersPanel.classList.remove('d-none');
        membersPanel.style.display = 'block';
        
        ensureMembersLoaded();
    });
    }

    if (backToFeedBtn && membersPanel && feedPosts) {
    backToFeedBtn.addEventListener('click', function() {
        // Hide members panel
        membersPanel.classList.add('d-none');
        membersPanel.style.display = 'none';
        
        // Show the sidebar content
        const sidebarContent = document.querySelector('.feeds-sidebar > *:not(#membersPanel)');
        if (sidebarContent) {
            sidebarContent.style.display = 'block';
        }
    });
    }

  // Toggle comment input when user clicks Comment action
  commentButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const postId = btn.getAttribute('data-post-id');
      const section = document.getElementById(`comments-${postId}`);
      if (!section) return;
      const inputRow = section.querySelector('.comment-input');
      if (!inputRow) return;
      inputRow.classList.toggle('d-none');
      if (!inputRow.classList.contains('d-none')) {
        const input = inputRow.querySelector('input.comment-text');
        if (input) input.focus();
      }
    });
  });

  // Toggle comments list when user clicks the comments stat
  commentsStats.forEach(function(stat) {
    stat.addEventListener('click', function() {
      const postId = stat.getAttribute('data-post-id');
      const section = document.getElementById(`comments-${postId}`);
      if (!section) return;
      const list = section.querySelector('.comments-list');
      if (!list) return;
      // Initialize list on first open: show 2, then load 5 more per click
      if (!list.dataset.initialized) {
        initializeCommentsList(section, list);
      }
      list.classList.toggle('d-none');
      list.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  function initializeCommentsList(section, list) {
    const items = Array.from(list.children).filter(function(el){ return el.classList && el.classList.contains('comment'); });
    const initialToShow = 2;
    const step = 5;

    // Hide beyond initial
    items.forEach(function(item, idx){ if (idx >= initialToShow) item.classList.add('d-none'); });

    // Only add loader if there are more than initial
    if (items.length > initialToShow) {
      let loader = section.querySelector('.load-more-comments');
      if (!loader) {
        loader = document.createElement('button');
        loader.type = 'button';
        loader.className = 'btn btn-link p-0 load-more-comments';
        loader.textContent = 'Load more comments';
        list.insertAdjacentElement('afterend', loader);
      }

      // Track how many are visible
      list.dataset.shown = String(initialToShow);

      loader.addEventListener('click', function(){
        const currentlyShown = parseInt(list.dataset.shown || '0', 10);
        const nextToShow = Math.min(currentlyShown + step, items.length);
        for (let i = currentlyShown; i < nextToShow; i++) {
          if (items[i]) items[i].classList.remove('d-none');
        }
        list.dataset.shown = String(nextToShow);

        if (nextToShow >= items.length) {
          loader.classList.add('d-none');
        }
      });
    }

    list.dataset.initialized = 'true';
  }

  // =============================
  // Backend integration helpers
  // =============================
  function getCSRFToken() {
    const name = 'csrftoken=';
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.startsWith(name)) return decodeURIComponent(c.substring(name.length));
    }
    return null;
  }

  async function apiFetch(url, options) {
    const headers = options && options.headers ? options.headers : {};
    if (options && options.method && options.method.toUpperCase() !== 'GET') {
      headers['X-CSRFToken'] = getCSRFToken();
    }
    return fetch(url, Object.assign({}, options, { headers }));
  }

  // =============================
  // Posts loading & rendering
  // =============================
  let currentPage = 1;
  let currentCategory = 'all';
  let loading = false;

  function renderPostHTML(post) {
    const pid = post.id;
    const avatar = post.author.avatar ? `<img src="${post.author.avatar}" alt="User Avatar">` : `<img src="/static/core/images/player.jpeg" alt="User Avatar">`;
    const media = post.image ? `<div class="post-image"><img src="${post.image}" alt="Post image"></div>` : '';
    return (
      `<div class="post-card" data-category="${post.category}">
        <div class="post-header">
          <div class="user-info">
            <div class="user-avatar">${avatar}</div>
            <div class="user-details">
              <h5 class="username">${escapeHtml(post.author.name)}</h5>
              <span class="post-time">${timeAgo(post.created_at)}</span>
            </div>
          </div>
          <div class="post-menu"><button class="menu-btn"><i class="fas fa-ellipsis-h"></i></button></div>
        </div>
        <div class="post-content">
          ${post.content ? `<p class="post-text">${linkify(escapeHtml(post.content))}</p>` : ''}
          ${media}
        </div>
        <div class="post-meta-row">
          <div class="post-stats">
            <div class="stat-item"><i class="fas fa-heart"></i><span>${post.likes} likes</span></div>
            <div class="stat-item comments-stat" data-post-id="${pid}"><i class="fas fa-comment"></i><span>${post.comments} comments</span></div>
            <div class="stat-item"><i class="fas fa-share"></i><span>${post.shares} shares</span></div>
          </div>
          <div class="post-actions">
            <button class="action-btn like-btn" data-post-id="${pid}"><i class="fas fa-heart"></i> Like</button>
            <button class="action-btn comment-btn" data-post-id="${pid}"><i class="fas fa-comment"></i> Comment</button>
            <button class="action-btn share-btn" data-post-id="${pid}"><i class="fas fa-share"></i> Share</button>
          </div>
        </div>
        <div class="comments-section" id="comments-${pid}">
          <div class="comment-input d-none">
            <img src="/static/core/images/player.jpeg" alt="User Avatar" class="comment-avatar">
            <input type="text" placeholder="Write a comment..." class="comment-text">
            <button class="comment-send"><i class="fas fa-paper-plane"></i></button>
          </div>
          <div class="comments-list d-none"></div>
        </div>
      </div>`
    );
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>\"]/g, function(s){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[s]); });
  }

  function linkify(text) {
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
  }

  function timeAgo(iso) {
    const then = new Date(iso);
    const diff = Math.floor((Date.now() - then.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  }

  async function loadPosts(reset=false) {
    if (loading) return; loading = true;
    if (reset) { currentPage = 1; feedPosts.innerHTML = ''; }
    const resp = await apiFetch(`/feeds/api/posts/?page=${currentPage}&category=${currentCategory}`);
    if (!resp.ok) { loading = false; return; }
    const data = await resp.json();
    data.results.forEach(p => {
      feedPosts.insertAdjacentHTML('beforeend', renderPostHTML(p));
    });
    if (loadMoreBtn) {
      loadMoreBtn.style.display = data.has_next ? '' : 'none';
    }
    currentPage += 1;
    wireDynamicHandlers();
    loading = false;
  }

  function wireDynamicHandlers() {
    // Like buttons
    const likeBtns = document.querySelectorAll('.like-btn');
    likeBtns.forEach(btn => {
      if (btn.dataset.bound === '1') return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', async function(){
        const postId = btn.getAttribute('data-post-id');
        const resp = await apiFetch(`/feeds/api/posts/${postId}/like/`, { method: 'POST' });
        if (!resp.ok) return;
        const d = await resp.json();
        const postCard = btn.closest('.post-card');
        const likeStat = postCard && postCard.querySelector('.post-stats .stat-item');
        if (likeStat) likeStat.querySelector('span').textContent = `${d.likes} likes`;
        btn.classList.toggle('liked', d.liked);
      });
    });

    // Comment buttons (toggle input)
    const commentBtns = document.querySelectorAll('.comment-btn');
    commentBtns.forEach(btn => {
      if (btn.dataset.bound === '1') return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function(){
        const postId = btn.getAttribute('data-post-id');
        const section = document.getElementById(`comments-${postId}`);
        if (!section) return;
        const inputRow = section.querySelector('.comment-input');
        if (!inputRow) return;
        inputRow.classList.toggle('d-none');
        const input = inputRow.querySelector('input.comment-text');
        if (input && !input.classList.contains('d-none')) input.focus();
      });
    });

    // Comments stats (open list)
    const statBtns = document.querySelectorAll('.comments-stat');
    statBtns.forEach(stat => {
      if (stat.dataset.bound === '1') return;
      stat.dataset.bound = '1';
      stat.addEventListener('click', async function(){
        const postId = stat.getAttribute('data-post-id');
        const section = document.getElementById(`comments-${postId}`);
        if (!section) return;
        const list = section.querySelector('.comments-list');
        if (!list) return;
        if (!list.dataset.initialized) {
          await fetchAndRenderComments(postId, list);
          initializeCommentsList(section, list);
        }
        list.classList.toggle('d-none');
      });
    });

    // Send comment
    document.querySelectorAll('.comment-send').forEach(btn => {
      if (btn.dataset.bound === '1') return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', async function(){
        const section = btn.closest('.comments-section');
        const postId = section.id.split('-')[1];
        const input = section.querySelector('input.comment-text');
        const content = (input && input.value.trim()) || '';
        if (!content) return;
        const form = new FormData();
        form.append('content', content);
        const resp = await apiFetch(`/feeds/api/posts/${postId}/comments/create/`, { method: 'POST', body: form });
        if (!resp.ok) return;
        input.value = '';
        // Prepend quick-rendered comment
        const list = section.querySelector('.comments-list');
        if (list && !list.classList.contains('d-none')) {
          list.insertAdjacentHTML('afterbegin', `<div class="comment"><img src="/static/core/images/player.jpeg" alt="User Avatar" class="comment-avatar"><div class="comment-content"><div class="comment-header"><span class="comment-username">You</span><span class="comment-time">just now</span></div><p class="comment-text">${escapeHtml(content)}</p></div></div>`);
        }
        // Update comments count stat immediately
        const postCard = section.closest('.post-card');
        const statSpan = postCard && postCard.querySelector('.comments-stat span');
        if (statSpan) {
          const match = statSpan.textContent.match(/(\d+)/);
          const current = match ? parseInt(match[1], 10) : 0;
          statSpan.textContent = `${current + 1} comments`;
        }
      });
    });
  }

  async function fetchAndRenderComments(postId, list) {
    const resp = await apiFetch(`/feeds/api/posts/${postId}/comments/?page=1&page_size=50`);
    if (!resp.ok) return;
    const data = await resp.json();
    data.results.forEach(c => {
      const avatar = c.author.avatar ? c.author.avatar : '/static/core/images/player.jpeg';
      list.insertAdjacentHTML('beforeend', `<div class="comment"><img src="${avatar}" alt="User Avatar" class="comment-avatar"><div class="comment-content"><div class="comment-header"><span class="comment-username">${escapeHtml(c.author.name)}</span><span class="comment-time">${timeAgo(c.created_at)}</span></div><p class="comment-text">${escapeHtml(c.content)}</p></div></div>`);
    });
  }

  // Load more posts
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function(){ loadPosts(false); });
  }

  // Filters
  filterChips.forEach(chip => {
    chip.addEventListener('click', function(){
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.dataset.filter || 'all';
      loadPosts(true);
    });
  });

  // Start Post modal submit
  if (modalPostForm) {
    modalPostForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const form = new FormData(modalPostForm);
      const resp = await apiFetch('/feeds/api/posts/create/', { method: 'POST', body: form });
      if (!resp.ok) return;
      // Reload first page to include the new post at top
      await loadPosts(true);
      // Close modal via Bootstrap if present
      try {
        const modalEl = document.getElementById('createPostModal');
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();
        modalPostContent && (modalPostContent.value = '');
        if (modalMediaPreview) { modalMediaPreview.style.display = 'none'; }
        if (modalImagePreview) { modalImagePreview.src = ''; }
      } catch (e) {}
    });
  }

  // Preview selected image
  if (modalPhotoInput && modalImagePreview && modalMediaPreview) {
    modalPhotoInput.addEventListener('change', function(){
      const file = modalPhotoInput.files && modalPhotoInput.files[0];
      if (!file) { modalMediaPreview.style.display = 'none'; return; }
      const reader = new FileReader();
      reader.onload = function(evt) {
        modalImagePreview.src = evt.target.result;
        modalMediaPreview.style.display = '';
      };
      reader.readAsDataURL(file);
    });
  }

  // Members panel
  async function ensureMembersLoaded() {
    const list = document.getElementById('membersList');
    if (!list || list.dataset.loaded === '1') return;
    await loadMembers();
  }

  async function loadMembers(query='', community='all') {
    const list = document.getElementById('membersList');
    if (!list) return;
    const resp = await apiFetch(`/feeds/api/members/?q=${encodeURIComponent(query)}&community=${encodeURIComponent(community)}`);
    if (!resp.ok) return;
    const data = await resp.json();
    list.innerHTML = '';
    data.results.forEach(m => {
      const avatar = m.avatar ? m.avatar : '/static/core/images/player.jpeg';
      list.insertAdjacentHTML('beforeend', `<div class="member-item"><img src="${avatar}" class="avatar-md"><div class="info"><div class="name">${escapeHtml(m.name)}</div><div class="meta">Member</div></div><div class="spacer"></div><div class="score"></div></div>`);
    });
    list.dataset.loaded = '1';
  }

  const membersSearch = document.getElementById('membersSearch');
  if (membersSearch) {
    membersSearch.addEventListener('input', function(){
      loadMembers(membersSearch.value || '');
    });
  }

  document.querySelectorAll('.members-filters .chip').forEach(chip => {
    chip.addEventListener('click', function(){
      document.querySelectorAll('.members-filters .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      loadMembers(membersSearch ? membersSearch.value : '', chip.dataset.community || 'all');
    });
  });

  // Initial load
  if (feedPosts) {
    loadPosts(true);
  }
});

