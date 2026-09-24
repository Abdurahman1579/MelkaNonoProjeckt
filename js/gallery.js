// ============================================
// GALLERY PAGE
// ============================================

const GALLERY_ITEMS = [
  { id: 1, cat: 'masjid', icon: '🕌', caption: 'Masgiida Al-Nuur — Malka Gafarsa', src: '' },
  { id: 2, cat: 'masjid', icon: '🕌', caption: 'Masgiida Al-Furqan — Bero', src: '' },
  { id: 3, cat: 'masjid', icon: '🕌', caption: 'Masgiida Al-Hidaya — Nono', src: '' },
  { id: 4, cat: 'construction', icon: '🏗️', caption: 'Jaarmiyaa G+3 — Sadarkaa 1', src: '' },
  { id: 5, cat: 'construction', icon: '🏗️', caption: 'Hojiin ijaarsaa — jalqaba', src: '' },
  { id: 6, cat: 'community', icon: '👥', caption: 'Walgahii hawaasaa', src: '' },
  { id: 7, cat: 'community', icon: '🤝', caption: 'Hirmaannaa hawaasaa', src: '' },
  { id: 8, cat: 'event', icon: '🎉', caption: 'Sagantaa gumaacha', src: '' },
  { id: 9, cat: 'event', icon: '📢', caption: 'Beeksisa piroojektii', src: '' },
  { id: 10, cat: 'masjid', icon: '🕌', caption: 'Masgiida Bilal', src: '' },
  { id: 11, cat: 'community', icon: '🎓', caption: 'Barnoota hawaasaa', src: '' },
  { id: 12, cat: 'construction', icon: '🏗️', caption: 'Karoora jaarmiyaa', src: '' }
];

let currentFilter = 'all';
let filteredItems = [];
let lightboxIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  filteredItems = [...GALLERY_ITEMS];
  renderGallery();
  setupFilters();
  setupLightbox();
});

function setupFilters() {
  document.querySelectorAll('.gallery-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gallery-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.cat;
      filteredItems = currentFilter === 'all'
        ? [...GALLERY_ITEMS]
        : GALLERY_ITEMS.filter(g => g.cat === currentFilter);
      renderGallery();
    });
  });
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  if (!filteredItems.length) {
    grid.innerHTML = `<div class="loading">${t('gallery.empty') || 'Suuraan hin jiru.'}</div>`;
    return;
  }

  grid.innerHTML = filteredItems.map((g, i) => `
    <div class="gallery-item" data-index="${i}">
      ${g.src
        ? `<img src="${g.src}" alt="${g.caption}" loading="lazy" />`
        : `<div class="gallery-item-icon">${g.icon}</div>`}
      <div class="gallery-caption">${g.caption}</div>
    </div>
  `).join('');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      openLightbox(Number(item.dataset.index));
    });
  });
}

// Lightbox
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
  lightboxIndex = i;
  const item = filteredItems[i];
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');

  if (item.src) {
    img.src = item.src;
    img.style.display = 'block';
  } else {
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <rect fill="#1a6b4f" width="400" height="300"/>
        <text x="200" y="180" font-size="120" text-anchor="middle" fill="white">${item.icon}</text>
      </svg>
    `);
    img.style.display = 'block';
  }
  cap.textContent = item.caption;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('open');
  document.body.style.overflow = '';
}

function prevImage() {
  lightboxIndex = (lightboxIndex - 1 + filteredItems.length) % filteredItems.length;
  openLightbox(lightboxIndex);
}

function nextImage() {
  lightboxIndex = (lightboxIndex + 1) % filteredItems.length;
  openLightbox(lightboxIndex);
}