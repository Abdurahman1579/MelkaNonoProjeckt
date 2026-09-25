// ============================================
// MASJID-DETAIL.JS — Individual Masjid Page
// Malka Noonoo Project
// ============================================

let detailMap = null;

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', initMasjidDetail);

async function initMasjidDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    window.location.href = 'masgidoota.html';
    return;
  }

  try {
    const { data, error } = await db
      .from('mn_masjidos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Masgiida hin argamne');

    renderDetail(data);
    loadPrayerTimes(data);
    initDetailMap(data);

  } catch (err) {
    console.error('❌ Detail error:', err);
    document.getElementById('detailLoading').innerHTML = createEmptyState({
      icon: '🕌',
      title: 'Masgiida hin argamne',
      message: err.message,
      actionText: 'Deebi\'i Masgiidota',
      actionHref: 'masgidoota.html'
    });
  }
}

// ============================================
// RENDER DETAIL
// ============================================
function renderDetail(m) {
  document.getElementById('detailLoading').style.display = 'none';
  document.getElementById('detailContent').style.display = 'block';

  // Hero
  setText('masjidName', m.name);
  setText('masjidLocation', `${m.woreda} — ${m.kebele || ''}`);
  setText('masjidWoreda', m.woreda);
  setText('masjidMembers', `${m.member_count || 0} miseensota`);

  // Description
  setText('masjidDescription', m.description || 'Odeeffannoon dabalataa hin jiru.');

  // Sidebar
  setText('imamName', m.imam_name || '—');
  setText('imamPhone', m.imam_phone || '');
  setText('foundedYear', m.founded_year || '—');
  setText('capacity', m.capacity ? `${m.capacity} namoota` : '—');
  setText('masjidAddress', m.address || `${m.woreda}, ${m.kebele || ''}`);

  // Donate button
  const donateBtn = document.getElementById('donateMasjidBtn');
  if (donateBtn) {
    donateBtn.href = `donate.html?masjid=${m.id}`;
  }

  // Page title
  document.title = `${m.name} — Malka Noonoo`;

  // Photos
  renderPhotos(m);

  // Facilities
  renderFacilities(m);

  console.log('✅ Detail rendered:', m.name);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ============================================
// PHOTOS
// ============================================
function renderPhotos(m) {
  const container = document.getElementById('masjidPhotos');
  if (!container) return;

  const photos = Array.isArray(m.photos) ? m.photos.filter(p => p) : [];

  if (!photos.length) {
    container.innerHTML = '<div class="photo-placeholder">📷 Suuraan hin jiru</div>';
    return;
  }

  container.innerHTML = photos.map((url, i) => `
    <div class="masjid-photo-item" data-index="${i}">
      <img src="${url}" alt="${escapeHtml(m.name)} photo ${i + 1}" loading="lazy" />
    </div>
  `).join('');

  // Click → open lightbox
  container.querySelectorAll('.masjid-photo-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = Number(item.dataset.index);
      openPhotoLightbox(photos, idx, m.name);
    });
  });
}

function openPhotoLightbox(photos, index, masjidName) {
  // Simple lightbox — reuse modal
  const content = `
    <div style="text-align: center;">
      <img src="${photos[index]}" 
           alt="${escapeHtml(masjidName)}" 
           style="max-width: 100%; max-height: 70vh; border-radius: 12px;" />
      <p style="margin-top: 12px; font-size: 13px; color: var(--neutral-500);">
        ${index + 1} / ${photos.length} — ${escapeHtml(masjidName)}
      </p>
    </div>
  `;

  openModal({
    title: masjidName,
    body: content,
    size: 'lg',
  });
}

// ============================================
// FACILITIES
// ============================================
function renderFacilities(m) {
  const container = document.getElementById('masjidFacilities');
  if (!container) return;

  const facilities = Array.isArray(m.facilities) ? m.facilities : [];

  if (!facilities.length) {
    container.innerHTML = '<p class="text-muted">Odeeffannoon hin jiru.</p>';
    return;
  }

  const facilityIcons = {
    'madrasa': '📚',
    'quran_class': '📖',
    'wudu': '💧',
    'parking': '🚗',
    'library': '📚',
    'women_area': '👩',
    'kitchen': '🍽️',
    'funeral': '🕊️',
    'wedding': '💐',
    'charity': '🤲'
  };

  container.innerHTML = facilities.map(f => {
    const key = typeof f === 'string' ? f : f.key;
    const label = typeof f === 'string' ? capitalize(f) : f.label;
    const icon = facilityIcons[key] || '✅';

    return `
      <div class="facility-item">
        <span class="facility-icon">${icon}</span>
        <span>${escapeHtml(label)}</span>
      </div>
    `;
  }).join('');
}

function capitalize(str) {
  return String(str).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ============================================
// PRAYER TIMES — Aladhan API
// ============================================
async function loadPrayerTimes(m) {
  const container = document.getElementById('prayerTimes');
  if (!container) return;

  try {
    // Determine lat/lng
    const lat = m.latitude || 9.0100;
    const lng = m.longitude || 38.7600;
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    // Aladhan API
    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=4`
    );

    if (!res.ok) throw new Error('API error');

    const data = await res.json();
    const timings = data.data?.timings;
    if (!timings) throw new Error('No timings');

    renderPrayerTimes(timings, data.data.date);

  } catch (err) {
    console.error('❌ Prayer times error:', err);
    container.innerHTML = `
      <div class="loading-sm">
        Yeroon salaataa hin argamne — 
        <a href="https://aladhan.com" target="_blank" style="color: var(--green-700);">Aladhan.com</a>
      </div>
    `;
  }
}

function renderPrayerTimes(timings, dateInfo) {
  const container = document.getElementById('prayerTimes');
  if (!container) return;

  const prayers = [
    { key: 'Fajr', name: 'Fajr', icon: '🌙' },
    { key: 'Sunrise', name: 'Sunrise', icon: '🌅' },
    { key: 'Dhuhr', name: 'Dhuhr', icon: '☀️' },
    { key: 'Asr', name: 'Asr', icon: '🌤️' },
    { key: 'Maghrib', name: 'Maghrib', icon: '🌆' },
    { key: 'Isha', name: 'Isha', icon: '🌃' }
  ];

  container.innerHTML = prayers.map(p => `
    <div class="prayer-item">
      <div class="prayer-item-icon">${p.icon}</div>
      <div class="prayer-item-name">${p.name}</div>
      <div class="prayer-item-time">${timings[p.key] || '—'}</div>
    </div>
  `).join('');

  // Date
  const dateEl = document.getElementById('prayerDate');
  if (dateEl && dateInfo) {
    dateEl.textContent = `${dateInfo.readable} — ${dateInfo.hijri?.day} ${dateInfo.hijri?.month?.en} ${dateInfo.hijri?.year} AH`;
  }
}

// ============================================
// DETAIL MAP
// ============================================
function initDetailMap(m) {
  const mapEl = document.getElementById('detailMap');
  if (!mapEl) return;

  const lat = m.latitude || 9.0100;
  const lng = m.longitude || 38.7600;

  detailMap = L.map('detailMap').setView([lat, lng], 16);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(detailMap);

  const customIcon = L.divIcon({
    className: 'masjid-marker',
    html: '<div class="masjid-marker-pin"><span>🕌</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  L.marker([lat, lng], { icon: customIcon })
    .addTo(detailMap)
    .bindPopup(`<b>${escapeHtml(m.name)}</b><br>${escapeHtml(m.woreda)}`)
    .openPopup();
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}