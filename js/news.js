// ============================================
// NEWS.JS — Odeeffannoo (News) + Comments + I18N
// Malka Noonoo Project
// ============================================

console.log('📰 news.js loaded');

// ============================================
// 1. STATE
// ============================================
const newsState = {
  allNews: [],
  filtered: [],
  initialized: false
};

// ============================================
// 2. FALLBACK SAMPLE DATA (Keys waliin)
// ============================================
const SAMPLE_NEWS = [
  {
    id: 1,
    titleKey: 'news.sample.1.title',
    bodyKey: 'news.sample.1.body',
    category: 'announcement',
    icon: '📢',
    date: '2025-01-15'
  },
  {
    id: 2,
    titleKey: 'news.sample.2.title',
    bodyKey: 'news.sample.2.body',
    category: 'progress',
    icon: '📊',
    date: '2025-02-01'
  },
  {
    id: 3,
    titleKey: 'news.sample.3.title',
    bodyKey: 'news.sample.3.body',
    category: 'event',
    icon: '🎉',
    date: '2025-02-10'
  },
  {
    id: 4,
    titleKey: 'news.sample.4.title',
    bodyKey: 'news.sample.4.body',
    category: 'press',
    icon: '📰',
    date: '2025-02-20'
  }
];

// ============================================
// 3. HELPERS
// ============================================
function tr(key, fallback) {
  if (typeof t === 'function') {
    const val = t(key, '');
    if (val && val !== key) return val;
  }
  return fallback || '';
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

// ============================================
// 4. TRANSLATE NEWS ITEM
// ============================================
function translateNews(n) {
  const lang = (typeof getCurrentLang === 'function')
    ? getCurrentLang()
    : (localStorage.getItem('mn_lang') || 'om');

  // Yoo sample (hardcoded keys)
  if (n.titleKey) {
    return {
      ...n,
      _title: tr(n.titleKey, ''),
      _body: tr(n.bodyKey, ''),
      _excerpt: tr(n.bodyKey, '').substring(0, 120) + '...'
    };
  }

  // DB content — Priority 1: columns
  let title = n.title || '';
  let body = n.body || '';

  if (lang === 'am' && n.title_am) {
    title = n.title_am;
    body = n.body_am || body;
  } else if (lang === 'en' && n.title_en) {
    title = n.title_en;
    body = n.body_en || body;
  }

  return {
    ...n,
    _title: title,
    _body: body,
    _excerpt: (body || '').substring(0, 120) + ((body || '').length > 120 ? '...' : '')
  };
}

// ============================================
// 5. INIT
// ============================================
document.addEventListener('DOMContentLoaded', initNews);

async function initNews() {
  if (newsState.initialized) return;
  newsState.initialized = true;

  console.log('📰 Init news...');

  await loadNews();
  setupFilters();
  setupModalEvents();
}

// ============================================
// 6. LOAD NEWS
// ============================================
async function loadNews() {
  try {
    const { data, error } = await db
      .from('mn_announcements')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || !data.length) {
      console.log('ℹ️ No news from DB — using sample data');
      newsState.allNews = SAMPLE_NEWS;
    } else {
      newsState.allNews = data.map((a, i) => ({
        id: a.id,
        title: a.title,
        body: a.body || '',
        title_am: a.title_am || null,
        title_en: a.title_en || null,
        body_am: a.body_am || null,
        body_en: a.body_en || null,
        category: a.category || 'announcement',
        icon: getCategoryIcon(a.category, i),
        date: a.created_at
      }));
    }

    newsState.filtered = [...newsState.allNews];
    renderNews(newsState.filtered);

    console.log(`✅ Loaded ${newsState.allNews.length} news`);
  } catch (err) {
    console.error('❌ News load error:', err);
    newsState.allNews = SAMPLE_NEWS;
    newsState.filtered = [...SAMPLE_NEWS];
    renderNews(newsState.filtered);

    if (window.toast) {
      toast.warning('Akeekkachiisa', 'Sample data fayyadamaa jira');
    }
  }
}

function getCategoryIcon(category, index = 0) {
  const icons = {
    announcement: '📢',
    progress: '📊',
    event: '🎉',
    press: '📰'
  };
  return icons[category] || ['📢', '📊', '🎉', '📰'][index % 4];
}

// ============================================
// 7. RENDER NEWS GRID
// ============================================
function renderNews(list) {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-illustration">📰</div>
        <h3 class="empty-state-title">${tr('news.empty', 'Odeeffannoon hin jiru.')}</h3>
        <p class="empty-state-desc">${tr('empty.search', 'Filters jijjiirii ykn booda deebi\'i.')}</p>
      </div>
    `;
    return;
  }

  const categoryLabels = {
    announcement: tr('news.cat.announcement', 'Beeksisa'),
    progress: tr('news.cat.progress', 'Gabaasa'),
    event: tr('news.cat.event', 'Sagantaa'),
    press: tr('news.cat.press', 'Gaazexaa')
  };

  grid.innerHTML = list.map(n => {
    const tn = translateNews(n);
    return `
      <article class="news-card" data-id="${n.id}" onclick="openNews(${n.id})">
        <div class="news-image">
          <span class="news-category">${categoryLabels[n.category] || n.category}</span>
          ${n.icon || '📰'}
        </div>
        <div class="news-body">
          <div class="news-date">
            📅 ${new Date(n.date).toLocaleDateString('om-ET', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <h3>${escapeHtml(tn._title)}</h3>
          <p>${escapeHtml(tn._excerpt)}</p>
          <div class="news-read-more">
            <span>${tr('news.readmore', 'Dubbisi')}</span> →
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ============================================
// 8. FILTERS
// ============================================
function setupFilters() {
  const search = document.getElementById('newsSearch');
  const category = document.getElementById('newsCategory');

  search?.addEventListener('input', applyFilters);
  category?.addEventListener('change', applyFilters);
}

function applyFilters() {
  const q = (document.getElementById('newsSearch')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('newsCategory')?.value || '';

  newsState.filtered = newsState.allNews.filter(n => {
    const tn = translateNews(n);
    const matchesQ = !q ||
      tn._title.toLowerCase().includes(q) ||
      tn._excerpt.toLowerCase().includes(q) ||
      tn._body.toLowerCase().includes(q);
    const matchesCat = !cat || n.category === cat;
    return matchesQ && matchesCat;
  });

  renderNews(newsState.filtered);
}

// ============================================
// 9. OPEN NEWS — MODAL + COMMENTS
// ============================================
function openNews(id) {
  const news = newsState.allNews.find(n => n.id === id);
  if (!news) {
    console.warn('⚠️ News not found:', id);
    return;
  }

  const modal = document.getElementById('newsModal');
  const body = document.getElementById('modalBody');
  if (!modal || !body) return;

  const tn = translateNews(news);

  const categoryLabels = {
    announcement: tr('news.cat.announcement', 'Beeksisa'),
    progress: tr('news.cat.progress', 'Gabaasa'),
    event: tr('news.cat.event', 'Sagantaa'),
    press: tr('news.cat.press', 'Gaazexaa')
  };

  body.innerHTML = `
    <div class="modal-hero">
      <span class="news-category">${categoryLabels[news.category] || news.category}</span>
      <h2>${escapeHtml(tn._title)}</h2>
      <div class="news-date">
        📅 ${new Date(news.date).toLocaleDateString('om-ET', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </div>

    <div class="modal-text">${escapeHtml(tn._body)}</div>

    <!-- COMMENTS SECTION -->
    <div class="modal-comments" id="commentsContainer">
      <div class="loading">${tr('loading.generic', 'Fe\'amaa jira...')}</div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  console.log('📖 Opened news:', id);

  // Load comments
  setTimeout(() => {
    if (typeof window.renderCommentsInModal === 'function') {
      window.renderCommentsInModal(news.id, 'commentsContainer');
    } else {
      const container = document.getElementById('commentsContainer');
      if (container) {
        container.innerHTML = `
          <div class="comments-empty">
            <div class="comments-empty-icon">💬</div>
            <p>${tr('comments.error', 'Comments hin jiru.')}</p>
          </div>
        `;
      }
    }
  }, 100);
}

// ============================================
// 10. CLOSE MODAL
// ============================================
function closeModal() {
  const modal = document.getElementById('newsModal');
  if (!modal) return;

  modal.classList.remove('open');
  document.body.style.overflow = '';
  console.log('📖 Modal closed');
}

function setupModalEvents() {
  document.getElementById('modalClose')?.addEventListener('click', closeModal);

  document.getElementById('newsModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'newsModal') closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ============================================
// 11. LANGUAGE CHANGE
// ============================================
window.addEventListener('languageChanged', () => {
  console.log('🌐 Language changed — re-rendering news');
  renderNews(newsState.filtered);

  // Yoo modal banaa jira — deebi'ii banii
  const modal = document.getElementById('newsModal');
  if (modal && modal.classList.contains('open')) {
    // Modal cufi (sababni: comments reload)
    console.log('ℹ️ Modal open — hintalla');
  }
});

// ============================================
// 12. GLOBAL EXPORTS
// ============================================
window.openNews = openNews;
window.closeModal = closeModal;
window.SAMPLE_NEWS = SAMPLE_NEWS;