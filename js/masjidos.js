// ============================================
// MASJIDOS.JS — Grid + Map + Autocomplete
// Malka Noonoo Project
// ============================================

// ---------- State ----------
const masjidState = {
  all: [],
  filtered: [],
  map: null,
  markers: [],
  view: 'grid',
  autocompleteIndex: -1
};

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', initMasjidos);

async function initMasjidos() {
  console.log('🕌 Init masjidos...');

  // Show skeleton
  const grid = document.getElementById('masjidGrid');
  if (grid) {
    grid.innerHTML = skeletonGrid ? skeletonGrid(6) : '<div class="loading">Fe\'amaa jira...</div>';
  }

  // Fetch
  await loadMasjidos();

  // Setup
  setupSearch();
  setupFilters();
  setupViewToggle();

  // Render
  applyFilters();

  console.log(`✅ Loaded ${masjidState.all.length} masjidos`);
}

// ============================================
// LOAD DATA
// ============================================
async function loadMasjidos() {
  try {
    const { data, error } = await db
      .from('mn_masjidos')
      .select('*')
      .order('name');

    if (error) throw error;
    masjidState.all = data || [];

    // Yoo empty ta'e — sample data
    if (!masjidState.all.length) {
      console.warn('⚠️ No masjidos — sample data fayyadama');
      masjidState.all = getSampleMasjidos();
    }
  } catch (err) {
    console.error('❌ Load error:', err);
    masjidState.all = getSampleMasjidos();
    if (window.toast) toast.error('Dogoggora', 'Masgiidota fe\'uun hin danda\'amne.');
  }
}

function getSampleMasjidos() {
  return [
    { id: 1, name: 'Masgiida Al-Nuur', woreda: 'Malka Gafarsa', kebele: 'Kebele 01', member_count: 250, latitude: 9.0100, longitude: 38.7600, imam_name: 'Sheikh Ahmed Ibrahim' },
    { id: 2, name: 'Masgiida Al-Furqan', woreda: 'Bero', kebele: 'Kebele 02', member_count: 180, latitude: 9.0150, longitude: 38.7650 },
    { id: 3, name: 'Masgiida Al-Hidaya', woreda: 'Nono', kebele: 'Kebele 03', member_count: 320, latitude: 9.0200, longitude: 38.7700 }
  ];
}

// ============================================
// SEARCH + AUTOCOMPLETE
// ============================================
function setupSearch() {
  const input = document.getElementById('searchMasjid');
  const dropdown = document.getElementById('autocompleteDropdown');
  const clearBtn = document.getElementById('searchClear');

  if (!input || !dropdown) return;

  let debounceTimer;

  input.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    clearBtn.style.display = q ? 'flex' : 'none';

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (q.length === 0) {
        closeAutocomplete();
        return;
      }
      showAutocomplete(q);
    }, 150);
  });

  input.addEventListener('focus', (e) => {
    if (e.target.value.trim().length > 0) showAutocomplete(e.target.value.trim());
  });

  // Keyboard nav
  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      masjidState.autocompleteIndex = Math.min(masjidState.autocompleteIndex + 1, items.length - 1);
      updateAutocompleteActive(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      masjidState.autocompleteIndex = Math.max(masjidState.autocompleteIndex - 1, -1);
      updateAutocompleteActive(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (masjidState.autocompleteIndex >= 0 && items[masjidState.autocompleteIndex]) {
        items[masjidState.autocompleteIndex].click();
      } else {
        applyFilters();
        closeAutocomplete();
      }
    } else if (e.key === 'Escape') {
      closeAutocomplete();
    }
  });

  // Click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-autocomplete-wrap')) {
      closeAutocomplete();
    }
  });

  // Clear
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    closeAutocomplete();
    applyFilters();
    input.focus();
  });
}

function showAutocomplete(query) {
  const dropdown = document.getElementById('autocompleteDropdown');
  const q = query.toLowerCase();

  // Find matches
  const matches = masjidState.all
    .filter(m => {
      const text = `${m.name} ${m.woreda} ${m.kebele || ''} ${m.imam_name || ''}`.toLowerCase();
      return text.includes(q);
    })
    .slice(0, 8); // Max 8

  if (!matches.length) {
    dropdown.innerHTML = `
      <div class="autocomplete-empty">
        🔍 "${escapeHtml(query)}" — hin argamne
      </div>
    `;
    dropdown.classList.add('open');
    return;
  }

  dropdown.innerHTML = matches.map((m, i) => `
    <div class="autocomplete-item" data-id="${m.id}" data-index="${i}">
      <span class="autocomplete-item-icon">🕌</span>
      <div class="autocomplete-item-body">
        <div class="autocomplete-item-title">${highlight(m.name, query)}</div>
        <div class="autocomplete-item-sub">${m.woreda} • ${m.kebele || ''}</div>
      </div>
      <span class="autocomplete-item-badge">${m.member_count || 0}</span>
    </div>
  `).join('');

  dropdown.classList.add('open');
  masjidState.autocompleteIndex = -1;

  // Click handlers
  dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = Number(item.dataset.id);
      const masjid = masjidState.all.find(m => m.id === id);
      if (masjid) {
        // Navigate to detail page
        window.location.href = `masjid-detail.html?id=${id}`;
      }
    });
  });
}

function updateAutocompleteActive(items) {
  items.forEach((item, i) => {
    item.classList.toggle('active', i === masjidState.autocompleteIndex);
    if (i === masjidState.autocompleteIndex) {
      item.scrollIntoView({ block: 'nearest' });
    }
  });
}

function closeAutocomplete() {
  document.getElementById('autocompleteDropdown')?.classList.remove('open');
  masjidState.autocompleteIndex = -1;
}

function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escapeHtml(text).replace(regex, '<span class="autocomplete-highlight">$1</span>');
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// FILTERS
// ============================================
function setupFilters() {
  document.getElementById('filterWoreda')?.addEventListener('change', applyFilters);
}

function applyFilters() {
  const q = (document.getElementById('searchMasjid')?.value || '').toLowerCase();
  const woreda = document.getElementById('filterWoreda')?.value || '';

  masjidState.filtered = masjidState.all.filter(m => {
    const text = `${m.name} ${m.woreda} ${m.kebele || ''} ${m.imam_name || ''}`.toLowerCase();
    const matchesQ = !q || text.includes(q);
    const matchesWoreda = !woreda || m.woreda === woreda;
    return matchesQ && matchesWoreda;
  });

  renderGrid(masjidState.filtered);
  updateStats();
  updateMap();
}

function updateStats() {
  const countEl = document.getElementById('masjidCount');
  const breakdownEl = document.getElementById('woredaBreakdown');

  if (countEl) {
    countEl.textContent = `${masjidState.filtered.length} masgiidota`;
  }

  if (breakdownEl) {
    const woredas = {};
    masjidState.filtered.forEach(m => {
      woredas[m.woreda] = (woredas[m.woreda] || 0) + 1;
    });
    breakdownEl.textContent = Object.entries(woredas)
      .map(([w, c]) => `${w}: ${c}`)
      .join(' • ') || '—';
  }
}

// ============================================
// GRID VIEW
// ============================================
function renderGrid(list) {
  const grid = document.getElementById('masjidGrid');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = createEmptyState({
      icon: '🕌',
      title: 'Masgiida hin argamne',
      message: 'Filters jijjiirii ykn barbaadi.',
    });
    return;
  }

  grid.innerHTML = list.map(m => {
    // First photo if exists
    const photos = Array.isArray(m.photos) ? m.photos : [];
    const firstPhoto = photos[0];

    const imageContent = firstPhoto
      ? `<img src="${firstPhoto}" alt="${escapeHtml(m.name)}" class="masjid-photo" loading="lazy" />`
      : `<span>🕌</span>`;

    return `
      <a href="masjid-detail.html?id=${m.id}" class="masjid-card">
        <div class="masjid-card-image">
          <span class="masjid-card-woreda">${escapeHtml(m.woreda)}</span>
          ${imageContent}
        </div>
        <div class="masjid-card-body">
          <h3>${escapeHtml(m.name)}</h3>
          <p class="masjid-loc">
            <span>📍</span> ${escapeHtml(m.kebele || '')}
          </p>
          <div class="masjid-members">
            <span>👥</span>
            <span>${m.member_count || 0} miseensota</span>
            <span class="masjid-card-arrow">→</span>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

// ============================================
// MAP VIEW
// ============================================
function setupViewToggle() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;

      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.getElementById('gridView').style.display = view === 'grid' ? 'block' : 'none';
      document.getElementById('mapView').style.display = view === 'map' ? 'block' : 'none';

      masjidState.view = view;

      if (view === 'map') {
        setTimeout(() => {
          initMap();
          updateMap();
        }, 100);
      }
    });
  });
}

function initMap() {
  if (masjidState.map) return;

  const mapEl = document.getElementById('masjidosMap');
  if (!mapEl) return;

  // Default center: Sheger / Addis
  masjidState.map = L.map('masjidosMap').setView([9.0100, 38.7600], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(masjidState.map);

  console.log('🗺️ Map initialized');
}

function updateMap() {
  if (!masjidState.map) return;

  // Clear existing markers
  masjidState.markers.forEach(m => masjidState.map.removeLayer(m));
  masjidState.markers = [];

  // Filter valid coords
  const validMasjidos = masjidState.filtered.filter(m =>
    m.latitude && m.longitude
  );

  if (!validMasjidos.length) return;

  // Custom icon
  const customIcon = L.divIcon({
    className: 'masjid-marker',
    html: '<div class="masjid-marker-pin"><span>🕌</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  // Add markers
  validMasjidos.forEach(m => {
    const marker = L.marker([m.latitude, m.longitude], { icon: customIcon })
      .addTo(masjidState.map)
      .bindPopup(`
        <div class="map-popup">
          <h4>${escapeHtml(m.name)}</h4>
          <p>${escapeHtml(m.woreda)} • ${escapeHtml(m.kebele || '')}</p>
          <a href="masjid-detail.html?id=${m.id}">Ilaali →</a>
        </div>
      `);

    masjidState.markers.push(marker);
  });

  // Fit bounds
  if (masjidState.markers.length) {
    const group = L.featureGroup(masjidState.markers);
    masjidState.map.fitBounds(group.getBounds().pad(0.15));
  }
}

// ============================================
// LANGUAGE CHANGE
// ============================================
window.addEventListener('languageChanged', () => {
  renderGrid(masjidState.filtered);
});