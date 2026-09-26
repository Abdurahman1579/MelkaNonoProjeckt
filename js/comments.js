// ============================================
// COMMENTS.JS — Blog Comments (Modal Integration)
// Malka Noonoo Project
// ============================================

(function() {
  'use strict';

  console.log('💬 comments.js loaded');

  const COMMENTS_LIMIT = 20;

  // ==========================================
  // PUBLIC API — Called by news.js when modal opens
  // ==========================================
  window.renderCommentsInModal = async function(newsId, containerId = 'commentsContainer') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('⚠️ Comments container not found:', containerId);
      return;
    }

    console.log('💬 Loading comments for news:', newsId);

    // Render UI
    container.innerHTML = `
      <div class="comments-section">
        <div class="comments-header">
          <h3>💬 <span data-i18n="comments.title">Yaada Hawaasaa</span></h3>
          <span class="comments-count" id="commentsCount">0</span>
        </div>

        <!-- Form -->
        <form id="commentForm" class="comment-form">
          <div class="comment-form-row">
            <input 
              type="text" 
              id="commentName" 
              placeholder="Maqaa keessan *"
              required
              maxlength="100"
            />
            <input 
              type="email" 
              id="commentEmail" 
              placeholder="Imeelii (optional)"
              maxlength="150"
            />
          </div>
          <textarea 
            id="commentContent" 
            placeholder="Yaada keessan barreessaa... *"
            required
            maxlength="2000"
            rows="3"
          ></textarea>
          <div class="comment-form-footer">
            <span class="char-count"><span id="charCount">0</span>/2000</span>
            <button type="submit" class="btn btn-primary" id="commentSubmit">
              📤 <span data-i18n="comments.submit">Ergi</span>
            </button>
          </div>
          <div id="commentMessage" class="form-message"></div>
        </form>

        <!-- List -->
        <div class="comments-list" id="commentsList">
          <div class="loading" data-i18n="loading.generic">Fe'amaa jira...</div>
        </div>
      </div>
    `;

    // Apply i18n on new elements
    if (typeof applyTranslations === 'function') {
      applyTranslations();
    }

    // Char counter
    const textarea = document.getElementById('commentContent');
    const charCount = document.getElementById('charCount');
    if (textarea && charCount) {
      textarea.addEventListener('input', () => {
        charCount.textContent = textarea.value.length;
      });
    }

    // Load existing comments
    await loadComments(newsId);

    // Setup form
    setupForm(newsId);
  };

  // ==========================================
  // LOAD COMMENTS
  // ==========================================
  async function loadComments(newsId) {
    try {
      const { data, error } = await db
        .from('mn_news_comments')
        .select('*')
        .eq('news_id', newsId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(COMMENTS_LIMIT);

      if (error) throw error;

      renderComments(data || []);
      updateCount(data?.length || 0);

      console.log(`💬 Loaded ${data?.length || 0} comments`);

    } catch (err) {
      console.error('❌ Comments error:', err);
      const list = document.getElementById('commentsList');
      if (list) {
        list.innerHTML = `<div class="comments-empty">
          <div class="comments-empty-icon">💭</div>
          <p>${t('comments.error') || 'Yaadni hin argamne.'}</p>
        </div>`;
      }
    }
  }

  // ==========================================
  // RENDER COMMENTS
  // ==========================================
  function renderComments(list) {
    const el = document.getElementById('commentsList');
    if (!el) return;

    if (!list.length) {
      el.innerHTML = `
        <div class="comments-empty">
          <div class="comments-empty-icon">💭</div>
          <p data-i18n="comments.empty">Yaadni hin jiru. Yaada keessan jalqabaa ta'i!</p>
        </div>
      `;
      return;
    }

    el.innerHTML = list.map(c => `
      <div class="comment-item">
        <div class="comment-avatar">
          ${getInitials(c.author_name || 'Anonymous')}
        </div>
        <div class="comment-body">
          <div class="comment-header">
            <strong>${escapeHtml(c.author_name || 'Anonymous')}</strong>
            <span class="comment-date">${formatDate(c.created_at)}</span>
          </div>
          <p class="comment-text">${escapeHtml(c.content)}</p>
        </div>
      </div>
    `).join('');
  }

  function updateCount(count) {
    const el = document.getElementById('commentsCount');
    if (el) el.textContent = count;
  }

  // ==========================================
  // SETUP FORM
  // ==========================================
  function setupForm(newsId) {
    const form = document.getElementById('commentForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('commentName').value.trim();
      const email = document.getElementById('commentEmail').value.trim();
      const content = document.getElementById('commentContent').value.trim();
      const msg = document.getElementById('commentMessage');
      const btn = document.getElementById('commentSubmit');

      msg.className = 'form-message';
      msg.textContent = '';

      // Validation
      if (!name || name.length < 2) {
        return showError(msg, 'Maqaa keessan galchi (2+ characters)');
      }
      if (!content || content.length < 2) {
        return showError(msg, 'Yaada keessan barreessaa (2+ characters)');
      }

      // Loading
      btn.disabled = true;
      const originalText = btn.innerHTML;
      btn.innerHTML = '⏳ ' + (t('comments.submitting') || 'Ergaa jira...');

      try {
        const { data: { session } } = await db.auth.getSession();

        const comment = {
          news_id: Number(newsId),
          user_id: session?.user?.id || null,
          author_name: name,
          author_email: email || null,
          content: content,
          status: 'pending'
        };

        const { error } = await db
          .from('mn_news_comments')
          .insert([comment]);

        if (error) throw error;

        // Success
        msg.textContent = t('comments.success') || '✅ Yaadni keessan ergameera! Mirkaneessa booda maxxanfama.';
        msg.className = 'form-message success';
        form.reset();
        document.getElementById('charCount').textContent = '0';

        if (window.toast) {
          toast.success('Galatoomaa!', 'Yaadni keessan galmeeffameera');
        }

        // Refresh comments after 2s (yoo approved hin taane — hin argamu)
        setTimeout(() => {
          loadComments(newsId);
        }, 2000);

      } catch (err) {
        console.error('❌ Comment submit error:', err);
        showError(msg, err.message || 'Yaada erguun hin danda\'amne');
      }

      btn.disabled = false;
      btn.innerHTML = originalText;
    });
  }

  function showError(msgEl, text) {
    msgEl.textContent = '❌ ' + text;
    msgEl.className = 'form-message error';
  }

  // ==========================================
  // HELPERS
  // ==========================================
  function getInitials(name) {
    return name
      .split(' ')
      .map(n => n[0])
      .filter(Boolean)
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  function formatDate(date) {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'amma';
    if (diffMin < 60) return `${diffMin}m dura`;
    if (diffHour < 24) return `${diffHour}h dura`;
    if (diffDay < 7) return `${diffDay}d dura`;

    return d.toLocaleDateString('om-ET', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }

})();