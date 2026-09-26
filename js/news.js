// ============================================
// NEWS.JS — Odeeffannoo (News) + Comments
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
// 2. FALLBACK SAMPLE DATA
// ============================================
const SAMPLE_NEWS = [
  {
    id: 1,
    title: 'Piroojektiin ijaarsaa jalqabame',
    excerpt: 'Jaarmiyaa G+3 bittuuf tartiiba jalqabnee jirra. Gumaachitoonni hirmaachaa jiru.',
    body: `Piroojektiin Mana Marii Dhimmoota Islaamummaa Malka Noonoo Kutaa Magaalaa jalqabameera.

Jaarmiyaa G+3 bittuu fi meeshaalee biroo bituuf tartiibni hojii jalqabameera. Hawaasa bal'aan hirmaachaa jira.

Nagaa fi galatoomaa hawaasa hundaaf!`,
    category: 'announcement',
    icon: '📢',
    date: '2025-01-15'
  },
  {
    id: 2,
    title: 'Gabaasa raawwii — Ji\'a 1',
    excerpt: 'Galii waliigalaa hanga ammaatti argame fi hojiiwwan raawwataman.',
    body: `Ji'a jalqabaa keessatti galii gaarii argameera.

Hojiiwwan raawwataman:
• Walgahii hoggansaa
• Koree piroojektii uumuu
• Gumaacha walitti qabuu

Gabaasa guutuu ji'aan ala maxxanfama.`,
    category: 'progress',
    icon: '📊',
    date: '2025-02-01'
  },
  {
    id: 3,
    title: 'Sagantaa gumaacha hawaasaa',
    excerpt: 'Sagantaan gumaacha hawaasaa aanaalee sadeen keessatti gaggeeffama.',
    body: `Sagantaan gumaacha hawaasaa aanaalee Malka Gafarsa, Bero, fi Nono keessatti gaggeeffama.

Guyyaa: Wiixata dhufu
Yeroo: 3:00 PM
Bakka: Masgiida Al-Nuur

Hirmaannaan keessan barbaachisaa dha!`,
    category: 'event',
    icon: '🎉',
    date: '2025-02-10'
  },
  {
    id: 4,
    title: 'Ifa ta\'e — Gabaasa faayinaansii',
    excerpt: 'Gabaasni faayinaansii ifa ta\'een maxxanfameera. Ilaaluu dandeessu.',
    body: `Gabaasni faayinaansii piroojektii ifa ta'een maxxanfameera.

Qabiyyee:
• Galii ji'aa
• Baasii ji'aa
• Qabeenya jira
• Karoora itti aanu

Gabaasa guutuu dashboard irratti argita.`,
    category: 'press',
    icon: '📰',
    date: '2025-02-20'
  }
];

// ============================================
// 3. INIT
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
// 4. LOAD NEWS
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
        excerpt: (a.body || '').substring(0, 120) + ((a.body || '').length > 120 ? '...' : ''),
        body: a.body || '',
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
// 5. RENDER NEWS GRID
// ============================================
function renderNews(list) {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-illustration">📰</div>
        <h3 class="empty-state-title" data-i18n="news.empty">Odeeffannoon hin jiru.</h3>
        <p class="empty-state-desc">Filters jijjiirii ykn booda deebi'i.</p>
      </div>
    `;
    return;
  }

  const categoryLabels = {
    announcement: t('news.cat.announcement') || 'Beeksisa',
    progress: t('news.cat.progress') || 'Gabaasa',
    event: t('news.cat.event') || 'Sagantaa',
    press: t('news.cat.press') || 'Gaazexaa'
  };

  grid.innerHTML = list.map(n => `
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
        <h3>${escapeHtml(n.title)}</h3>
        <p>${escapeHtml(n.excerpt || '')}</p>
        <div class="news-read-more">
          <span data-i18n="news.readmore">Dubbisi</span> →
        </div>
      </div>
    </article>
  `).join('');

  // Apply translations on new elements
  if (typeof applyTranslations === 'function') {
    applyTranslations();
  }
}

// ============================================
// 6. FILTERS
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
    const matchesQ = !q || 
      n.title.toLowerCase().includes(q) || 
      (n.excerpt || '').toLowerCase().includes(q) ||
      (n.body || '').toLowerCase().includes(q);
    const matchesCat = !cat || n.category === cat;
    return matchesQ && matchesCat;
  });

  renderNews(newsState.filtered);
}

// ============================================
// 7. OPEN NEWS — MODAL + COMMENTS
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

  const categoryLabels = {
    announcement: t('news.cat.announcement') || 'Beeksisa',
    progress: t('news.cat.progress') || 'Gabaasa',
    event: t('news.cat.event') || 'Sagantaa',
    press: t('news.cat.press') || 'Gaazexaa'
  };

  body.innerHTML = `
    <div class="modal-hero">
      <span class="news-category">${categoryLabels[news.category] || news.category}</span>
      <h2>${escapeHtml(news.title)}</h2>
      <div class="news-date">
        📅 ${new Date(news.date).toLocaleDateString('om-ET', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>

    <div class="modal-text">${escapeHtml(news.body || news.excerpt)}</div>
    
    <!-- 🆕 COMMENTS SECTION -->
    <div class="modal-comments" id="commentsContainer">
      <div class="loading">💬 Yaada fe'amaa jira...</div>
    </div>
  `;

  // Open modal
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  console.log('📖 Opened news:', id);

  // 🆕 Load comments
  setTimeout(() => {
    if (typeof window.renderCommentsInModal === 'function') {
      window.renderCommentsInModal(news.id, 'commentsContainer');
    } else {
      console.warn('⚠️ comments.js hin fe\'amne');
      const container = document.getElementById('commentsContainer');
      if (container) {
        container.innerHTML = `
          <div class="comments-empty">
            <div class="comments-empty-icon">💬</div>
            <p>Comments feature hin jiru.</p>
          </div>
        `;
      }
    }
  }, 100);
}

// ============================================
// 8. CLOSE MODAL
// ============================================
function closeModal() {
  const modal = document.getElementById('newsModal');
  if (!modal) return;

  modal.classList.remove('open');
  document.body.style.overflow = '';
  
  console.log('📖 Modal closed');
}

// ============================================
// 9. MODAL EVENTS
// ============================================
function setupModalEvents() {
  // Close button
  document.getElementById('modalClose')?.addEventListener('click', closeModal);

  // Outside click
  document.getElementById('newsModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'newsModal') closeModal();
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ============================================
// 10. LANGUAGE CHANGE
// ============================================
window.addEventListener('languageChanged', () => {
  renderNews(newsState.filtered);
});

// ============================================
// 11. HELPERS
// ============================================
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
// 12. GLOBAL EXPORTS
// ============================================
window.openNews = openNews;
window.closeModal = closeModal;