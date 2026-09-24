// ============================================
// NEWS PAGE
// ============================================

let allNews = [];

// Sample news data (yoo Supabase hin qabnu)
const SAMPLE_NEWS = [
  {
    id: 1,
    title: 'Piroojektiin ijaarsaa jalqabame',
    excerpt: 'Jaarmiyaa G+3 bittuuf tartiiba jalqabnee jirra. Gumaachitoonni hirmaachaa jiru.',
    body: 'Piroojektiin Mana Marii Dhimmoota Islaamummaa Malka Noonoo Kutaa Magaalaa jalqabameera.\n\nJaarmiyaa G+3 bittuu fi meeshaalee biroo bituuf tartiibni hojii jalqabameera. Hawaasa bal\'aan hirmaachaa jira.\n\nNagaa fi galatoomaa hawaasa hundaaf!',
    category: 'announcement',
    icon: '📢',
    date: '2025-01-15'
  },
  {
    id: 2,
    title: 'Gabaasa raawwii — Ji\'a 1',
    excerpt: 'Galii waliigalaa hanga ammaatti argame fi hojiiwwan raawwataman.',
    body: 'Ji\'a jalqabaa keessatti galii gaarii argameera.\n\nHojiiwwan raawwataman:\n• Walgahii hoggansaa\n• Koree piroojektii uumuu\n• Gumaacha walitti qabuu\n\nGabaasa guutuu ji\'aan ala maxxanfama.',
    category: 'progress',
    icon: '📊',
    date: '2025-02-01'
  },
  {
    id: 3,
    title: 'Sagantaa gumaacha hawaasaa',
    excerpt: 'Sagantaan gumaacha hawaasaa aanaalee sadeen keessatti gaggeeffama.',
    body: 'Sagantaan gumaacha hawaasaa aanaalee Malka Gafarsa, Bero, fi Nono keessatti gaggeeffama.\n\nGuyyaa: Wiixata dhufu\nYeroo: 3:00 PM\nBakka: Masgiida Al-Nuur\n\nHirmaannaan keessan barbaachisaa dha!',
    category: 'event',
    icon: '🎉',
    date: '2025-02-10'
  },
  {
    id: 4,
    title: 'Ifa ta\'e — Gabaasa faayinaansii',
    excerpt: 'Gabaasni faayinaansii ifa ta\'een maxxanfameera. Ilaaluu dandeessu.',
    body: 'Gabaasni faayinaansii piroojektii ifa ta\'een maxxanfameera.\n\nQabiyyee:\n• Galii ji\'aa\n• Baasii ji\'aa\n• Qabeenya jira\n• Karoora itti aanu\n\nGabaasa guutuu dashboard irratti argita.',
    category: 'press',
    icon: '📰',
    date: '2025-02-20'
  }
];

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', loadNews);

async function loadNews() {
  try {
    // Supabase irraa fe'i (yoo jiraate)
    const { data, error } = await db
      .from('mn_announcements')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error || !data || !data.length) {
      console.log('ℹ️ Using sample news data');
      allNews = SAMPLE_NEWS;
    } else {
      allNews = data.map((a, i) => ({
        id: a.id,
        title: a.title,
        excerpt: (a.body || '').substring(0, 120) + '...',
        body: a.body || '',
        category: 'announcement',
        icon: ['📢','📊','🎉','📰'][i % 4],
        date: a.created_at
      }));
    }

    renderNews(allNews);
    setupFilters();
  } catch (err) {
    console.error('❌ News load error:', err);
    allNews = SAMPLE_NEWS;
    renderNews(allNews);
    setupFilters();
  }
}

// ============================================
// RENDER
// ============================================
function renderNews(list) {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `<div class="loading">${t('news.empty') || 'Odeeffannoon hin jiru.'}</div>`;
    return;
  }

  const categoryLabels = {
    announcement: t('news.cat.announcement') || 'Beeksisa',
    progress: t('news.cat.progress') || 'Gabaasa',
    event: t('news.cat.event') || 'Sagantaa',
    press: t('news.cat.press') || 'Gaazexaa'
  };

  grid.innerHTML = list.map(n => `
    <article class="news-card" onclick="openNews(${n.id})">
      <div class="news-image">
        <span class="news-category">${categoryLabels[n.category] || n.category}</span>
        ${n.icon || '📰'}
      </div>
      <div class="news-body">
        <div class="news-date">
          📅 ${new Date(n.date).toLocaleDateString('om-ET', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <h3>${n.title}</h3>
        <p>${n.excerpt || ''}</p>
        <div class="news-read-more">
          <span data-i18n="news.readmore">Dubbisi</span> →
        </div>
      </div>
    </article>
  `).join('');
}

// ============================================
// FILTERS
// ============================================
function setupFilters() {
  const search = document.getElementById('newsSearch');
  const category = document.getElementById('newsCategory');

  search?.addEventListener('input', applyFilters);
  category?.addEventListener('change', applyFilters);
}

function applyFilters() {
  const q = (document.getElementById('newsSearch')?.value || '').toLowerCase();
  const cat = document.getElementById('newsCategory')?.value || '';

  const filtered = allNews.filter(n => {
    const matchesQ = !q || 
      n.title.toLowerCase().includes(q) || 
      (n.excerpt || '').toLowerCase().includes(q);
    const matchesCat = !cat || n.category === cat;
    return matchesQ && matchesCat;
  });

  renderNews(filtered);
}

// ============================================
// MODAL
// ============================================
function openNews(id) {
  const news = allNews.find(n => n.id === id);
  if (!news) return;

  const modal = document.getElementById('newsModal');
  const body = document.getElementById('modalBody');

  const categoryLabels = {
    announcement: t('news.cat.announcement') || 'Beeksisa',
    progress: t('news.cat.progress') || 'Gabaasa',
    event: t('news.cat.event') || 'Sagantaa',
    press: t('news.cat.press') || 'Gaazexaa'
  };

  body.innerHTML = `
    <div class="modal-hero">
      <span class="news-category">${categoryLabels[news.category] || news.category}</span>
      <h2>${news.title}</h2>
      <div class="news-date">
        📅 ${new Date(news.date).toLocaleDateString('om-ET', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
    <div class="modal-text">${news.body || news.excerpt}</div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('newsModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'newsModal') closeModal();
});

function closeModal() {
  document.getElementById('newsModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ESC key to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Language change
window.addEventListener('languageChanged', () => renderNews(allNews));

// Global
window.openNews = openNews;