// ============================================
// GALLERY.JS — DB + i18n + Lightbox
// Malka Noonoo Project
// ============================================

console.log('📸 gallery.js loaded');

// ============================================
// 1. HELPERS
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
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ============================================
// 2. FALLBACK DATA (yeroo DB duwwaa ta'e)
// ============================================
const FALLBACK_GALLERY = [
  { id: 'f1', cat: 'masjid', icon: '🕌', captionKey: 'gallery.cap.1', src: '' },
  { id: 'f2', cat: 'masjid', icon: '🕌', captionKey: 'gallery.cap.2', src: '' },
  { id: 'f3', cat: 'masjid', icon: '🕌', captionKey: 'gallery.cap.3', src: '' },
  { id: 'f4', cat: 'construction', icon: '🏗️', captionKey: 'gallery.cap.4', src: '' },
  { id: 'f5', cat: 'construction', icon: '🏗️', captionKey: 'gallery.cap.5', src: '' },
  { id: 'f6', cat: 'community', icon: '👥', captionKey: 'gallery.cap.6', src: '' },
  { id: 'f7', cat: 'community', icon: '🤝', captionKey: 'gallery.cap.7', src: '' },
  { id: 'f8', cat: 'event', icon: '🎉', captionKey: 'gallery.cap.8', src: '' },
  { id: 'f9', cat: 'event', icon: '📢', captionKey: 'gallery.cap.9', src: '' },
  { id: 'f10', cat: 'masjid', icon: '🕌', captionKey: 'gallery.cap.10', src: '' },
  { id: 'f11', cat: 'community', icon: '🎓', captionKey: 'gallery.cap.11', src: '' },
  { id: 'f12', cat: 'construction', icon: '🏗️', captionKey: 'gallery.cap.12', src: '' }
];

// ============================================
// 3. STATE
// ============================================
const galleryState = {
  all: [],
  filtered: [],
  currentFilter: 'all',
  lightboxIndex: 0,
  initialized: false,
  usedFallback: false
};

// ============================================
// 4. TRANSLATE ITEM
// ============================================
function translateItem(g) {
  const lang = (typeof getCurrentLang === 'function')
    ? getCurrentLang()
    : (localStorage.getItem('mn_lang') || 'om');

  // Fallback items — keys
  if (g.captionKey) {
    return {
      caption: tr(g.captionKey, ''),
      category: g.cat
    };
  }

  // DB items — translation columns priority
  let caption = g.title || '';
  let description = g.description || '';

  if (lang === 'am') {
    caption = g.title_am || caption;
    description = g.description_am || description;
  } else if (lang === 'en') {
    caption = g.title_en || caption;
    description = g.description_en || description;
  }

  return { caption, description, category: g.cat };
}

function getIconForCategory(cat) {
  const icons = {
    masjid: '🕌',
    construction: '🏗️',
    community: '👥',
    event: '🎉'
  };
  return icons[cat] || '📸';
}

// ============================================
// 5. LOAD FROM DB
// ============================================
async function loadGalleryFromDB() {
  try {
    console.log('📸 Fetching gallery from mn_gallery...');

    const { data, error } = await db
      .from('mn_gallery')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    if (!data || !data.length) {
      console.log('ℹ️ No gallery items from DB — using fallback');
      galleryState.all = [...FALLBACK_GALLERY];
      galleryState.usedFallback = true;
      return;
    }

    galleryState.all = data.map(g => ({
      id: g.id,
      src: g.image_url || '',
      cat: g.category || 'masjid',
      icon: getIconForCategory(g.category),
      title: g.title || '',
      description: g.description || '',
      title_am: g.title_am || null,
      title_en: g.title_en || null,
      description_am: g.description_am || null,
      description_en: g.description_en || null
    }));
    galleryState.usedFallback = false;

    console.log(`✅ Loaded ${galleryState.all.length} gallery items from DB`);
  } catch (err) {
    console.error('❌ Gallery load error:', err);
    galleryState.all = [...FALLBACK_GALLERY];
    galleryState.usedFallback = true;

    if (window.toast) {
      toast.warning(tr('toast.warning', 'Akeekkachiisa'), 'Sample suuraa fayyadamaa jira');
    }
  }
}

// ============================================
// 6. INIT
// ============================================
document.addEventListener('DOMContentLoaded', initGallery);

async function initGallery() {
  if (galleryState.initialized) return;
  galleryState.initialized = true;

  console.log('📸 Init gallery...');

  // Skeleton
  const grid = document.getElementById('galleryGrid');
  if (grid) {
    grid.innerHTML = '<div class="loading">' + tr('loading.generic', 'Fe\'amaa jira...') + '</div>';
  }

  await loadGalleryFromDB();
  galleryState.filtered = [...galleryState.all];
  renderGallery();
  setupFilters();
  setupLightbox();
}

// ============================================
// 7. FILTERS
// ============================================
function setupFilters() {
  document.querySelectorAll('.gallery-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gallery-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      galleryState.currentFilter = btn.dataset.cat;
      applyFilter();
    });
  });
}

function applyFilter() {
  galleryState.filtered = galleryState.currentFilter === 'all'
    ? [...galleryState.all]
    : galleryState.all.filter(g => g.cat === galleryState.currentFilter);
  renderGallery();
}

// ============================================
// 8. RENDER
// ============================================
function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  if (!galleryState.filtered.length) {
    grid.innerHTML = `<div class="loading">${tr('gallery.empty', 'Suuraan hin jiru.')}</div>`;
    return;
  }

  grid.innerHTML = galleryState.filtered.map((g, i) => {
    const t = translateItem(g);

    // Yoo image URL jira — img; yoo hin jiraanne — icon
    const imageContent = g.src
      ? `<img src="${g.src}" alt="${escapeHtml(t.caption)}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'gallery-item-icon\\'>${g.icon}</div>';" />`
      : `<div class="gallery-item-icon">${g.icon}</div>`;

    return `
      <div class="gallery-item" data-index="${i}">
        ${imageContent}
        <div class="gallery-caption">${escapeHtml(t.caption)}</div>
      </div>
    `;
  }).join('');

  // Click handlers
  grid.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      openLightbox(Number(item.dataset.index));
    });
  });
}

// ============================================
// 9. LIGHTBOX
// ============================================
function setupLightbox() {
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', prevImage);
  document.getElementById('lightboxNext')?.addEventListener('click', nextImage);

  document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('lightbox')?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });
}

function openLightbox(i) {
  galleryState.lightboxIndex = i;
  const item = galleryState.filtered[i];
  if (!item) return;

  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  const t = translateItem(item);

  if (item.src) {
    img.src = item.src;
    img.style.display = 'block';
  } else {
    // SVG placeholder yoo image URL hin jiraanne
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <rect fill="#1a6b4f" width="400" height="300"/>
        <text x="200" y="180" font-size="120" text-anchor="middle" fill="white">${item.icon}</text>
      </svg>
    `);
    img.style.display = 'block';
  }

  cap.textContent = t.caption || '';
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('open');
  document.body.style.overflow = '';
}

function prevImage() {
  galleryState.lightboxIndex =
    (galleryState.lightboxIndex - 1 + galleryState.filtered.length) % galleryState.filtered.length;
  openLightbox(galleryState.lightboxIndex);
}

function nextImage() {
  galleryState.lightboxIndex =
    (galleryState.lightboxIndex + 1) % galleryState.filtered.length;
  openLightbox(galleryState.lightboxIndex);
}

// ============================================
// 10. LANGUAGE CHANGE
// ============================================
window.addEventListener('languageChanged', () => {
  console.log('🌐 Language changed — re-rendering gallery');
  renderGallery();

  // Lightbox yoo banaa jira — caption haaromsi
  const lb = document.getElementById('lightbox');
  if (lb && lb.classList.contains('open')) {
    const item = galleryState.filtered[galleryState.lightboxIndex];
    if (item) {
      const cap = document.getElementById('lightboxCaption');
      const t = translateItem(item);
      if (cap) cap.textContent = t.caption || '';
    }
  }
});

// ============================================
// 11. GLOBAL EXPORTS
// ============================================
window.FALLBACK_GALLERY = FALLBACK_GALLERY;
window.renderGallery = renderGallery;
window.loadGalleryFromDB = loadGalleryFromDB;