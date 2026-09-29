// ============================================
// COMMENTS.JS — Blog Comments (i18n)
// Malka Noonoo Project
// ============================================

console.log('💬 comments.js loaded');

const COMMENTS_LIMIT = 20;

function tr(key, fallback) {
  if (typeof t === 'function') {
    const val = t(key, '');
    if (val && val !== key) return val;
  }
  return fallback || '';
}

// ============================================
// PUBLIC API
// ============================================
window.renderCommentsInModal = async function(newsId, containerId = 'commentsContainer') {
  const container = document.getElementById(containerId);
  if (!container) return;

  console.log('💬 Loading comments for news:', newsId);

  container.innerHTML = `
    <div class="comments-section">
      <div class="comments-header">
        <h3>💬 <span>${tr('comments.title', 'Yaada Hawaasaa')}</span></h3>
        <span class="comments-count" id="commentsCount">0</span>
      </div>

      <form id="commentForm" class="comment-form">
        <div class="comment-form-row">
          <input type="text" id="commentName"
            placeholder="${tr('comments.name.placeholder', 'Maqaa keessan *')}"
            required maxlength="100" />
          <input type="email" id="commentEmail"
            placeholder="${tr('comments.email.placeholder', 'Imeelii (optional)')}"
            maxlength="150" />
        </div>
        <textarea id="commentContent"
          placeholder="${tr('comments.content.placeholder', 'Yaada keessan barreessaa... *')}"
          required maxlength="2000" rows="3"></textarea>
        <div class="comment-form-footer">
          <span class="char-count"><span id="charCount">0</span>/2000</span>
          <button type="submit" class="btn btn-primary" id="commentSubmit">
            📤 <span>${tr('comments.submit', 'Ergi')}</span>
          </button>
        </div>
        <div id="commentMessage" class="form-message"></div>
      </form>

      <div class="comments-list" id="commentsList">
        <div class="loading">${tr('loading.generic', 'Fe\'amaa jira...')}</div>
      </div>
    </div>
  `;

  if (typeof applyTranslations === 'function') applyTranslations();

  const textarea = document.getElementById('commentContent');
  const charCount = document.getElementById('charCount');
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      charCount.textContent = textarea.value.length;
    });
  }

  await loadComments(newsId);
  setupForm(newsId);
};

// ============================================
// LOAD COMMENTS
// ============================================
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
  } catch (err) {
    console.error('❌ Comments error:', err);
    const list = document.getElementById('commentsList');
    if (list) {
      list.innerHTML = `<div class="comments-empty">
        <div class="comments-empty-icon">💭</div>
        <p>${tr('comments.error', 'Yaadni hin argamne.')}</p>
      </div>`;
    }
  }
}

function renderComments(list) {
  const el = document.getElementById('commentsList');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `
      <div class="comments-empty">
        <div class="comments-empty-icon">💭</div>
        <p>${tr('comments.empty', 'Yaadni hin jiru. Yaada keessan jalqabaa ta\'i!')}</p>
      </div>
    `;
    return;
  }

  el.innerHTML = list.map(c => `
    <div class="comment-item">
      <div class="comment-avatar">${getInitials(c.author_name || 'Anonymous')}</div>
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

// ============================================
// SETUP FORM
// ============================================
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

    if (!name || name.length < 2) return showError(msg, tr('form.name.required', 'Maqaa galchi (2+)'));
    if (!content || content.length < 2) return showError(msg, 'Yaada barreessaa (2+)');

    btn.disabled = true;
    const orig = btn.innerHTML;
    btn.innerHTML = '⏳ ' + tr('comments.submitting', 'Ergaa jira...');

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

      const { error } = await db.from('mn_news_comments').insert([comment]);
      if (error) throw error;

      msg.textContent = tr('comments.success', '✅ Yaadni keessan ergameera!');
      msg.className = 'form-message success';
      form.reset();
      document.getElementById('charCount').textContent = '0';

      if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), 'Yaadni galmeeffameera');
      setTimeout(() => loadComments(newsId), 2000);
    } catch (err) {
      console.error('❌ Comment submit error:', err);
      showError(msg, err.message || 'Yaada erguun hin danda\'amne');
    }

    btn.disabled = false;
    btn.innerHTML = orig;
  });
}

function showError(msgEl, text) {
  msgEl.textContent = '❌ ' + text;
  msgEl.className = 'form-message error';
}

// ============================================
// HELPERS
// ============================================
function getInitials(name) {
  return name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase();
}

function formatDate(date) {
  const d = new Date(date);
  const diffMs = new Date() - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'amma';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}d`;

  return d.toLocaleDateString('om-ET', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}