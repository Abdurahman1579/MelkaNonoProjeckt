// ============================================
// MASJID-DETAIL.JS — Individual Masjid Page + I18N
// Malka Noonoo Project
// ============================================

console.log('🕌 masjid-detail.js loaded');

let detailMap = null;
let currentMasjid = null;

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
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ============================================
// 2. TRANSLATE MASJID
// ============================================
function translateMasjid(m) {
  const lang = (typeof getCurrentLang === 'function')
    ? getCurrentLang()
    : (localStorage.getItem('mn_lang') || 'om');

  if (lang === 'am') {
    return {
      name: m.name_am || m.name,
      description: m.description_am || m.description,
      imam_name: m.imam_name_am || m.imam_name,
      address: m.address_am || m.address
    };
  }
  if (lang === 'en') {
    return {
      name: m.name_en || m.name,
      description: m.description_en || m.description,
      imam_name: m.imam_name_en || m.imam_name,
      address: m.address_en || m.address
    };
  }
  return {
    name: m.name,
    description: m.description,
    imam_name: m.imam_name,
    address: m.address
  };
}

// ============================================
// 3. INIT
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

    currentMasjid = data;
    renderDetail(data);
    loadPrayerTimes(data);
    initDetailMap(data);
  } catch (err) {
    console.error('❌ Detail error:', err);
    document.getElementById('detailLoading').innerHTML = createEmptyState({
      icon: '🕌',
      title: tr('masjidos.not_found', 'Masgiida hin argamne'),
      message: err.message,
      actionText: tr('masjidos.back', 'Deebi\'i Masgiidota'),
      actionHref: 'masgidoota.html'
    });
  }
}

// ============================================
// 4. RENDER DETAIL
// ============================================
function renderDetail(m) {
  document.getElementById('detailLoading').style.display = 'none';
  document.getElementById('detailContent').style.display = 'block';

  const t = translateMasjid(m);

  // Hero
  setText('masjidName', t.name);
  setText('masjidLocation', `${m.woreda} — ${m.kebele || ''}`);
  setText('masjidWoreda', m.woreda);
  setText('masjidMembers', `${m.member_count || 0} ${tr('masjidos.members', 'miseensota')}`);

  // Description
  setText('masjidDescription', t.description || tr('masjidos.about.empty', 'Odeeffannoon dabalataa hin jiru.'));

  // Sidebar
  setText('imamName', t.imam_name || '—');
  setText('imamPhone', m.imam_phone || '');
  setText('foundedYear', m.founded_year || '—');
  setText('capacity', m.capacity ? `${m.capacity} ${tr('masjidos.people', 'namoota')}` : '—');
  setText('masjidAddress', t.address || `${m.woreda}, ${m.kebele || ''}`);

  // Donate button
  const donateBtn = document.getElementById('donateMasjidBtn');
  if (donateBtn) {
    donateBtn.href = `donate.html?masjid=${m.id}`;
  }

  document.title = `${t.name} — Malka Noonoo`;

  renderPhotos(m);
  renderFacilities(m);

  console.log('✅ Detail rendered:', t.name);
}

// ============================================
// 5. PHOTOS
// ============================================
function renderPhotos(m) {
  const container = document.getElementById('masjidPhotos');
  if (!container) return;

  const photos = Array.isArray(m.photos) ? m.photos.filter(p => p) : [];
  const t = translateMasjid(m);

  if (!photos.length) {
    container.innerHTML = `<div class="photo-placeholder">${tr('masjidos.no.photos', '📷 Suuraan hin jiru')}</div>`;
    return;
  }

  container.innerHTML = photos.map((url, i) => `
    <div class="masjid-photo-item" data-index="${i}">
      <img src="${url}" alt="${escapeHtml(t.name)} photo ${i + 1}" loading="lazy" />
    </div>
  `).join('');

  container.querySelectorAll('.masjid-photo-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = Number(item.dataset.index);
      openPhotoLightbox(photos, idx, t.name);
    });
  });
}

function openPhotoLightbox(photos, index, masjidName) {
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

  if (typeof openModal === 'function') {
    openModal({
      title: masjidName,
      body: content,
      size: 'lg',
    });
  }
}

// ============================================
// 6. FACILITIES
// ============================================
function renderFacilities(m) {
  const container = document.getElementById('masjidFacilities');
  if (!container) return;

  const facilities = Array.isArray(m.facilities) ? m.facilities : [];

  if (!facilities.length) {
    container.innerHTML = `<p class="text-muted">${tr('masjidos.no.facilities', 'Odeeffannoon hin jiru.')}</p>`;
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

  // Facility labels — translations.js keys
  const facilityLabels = {
    'madrasa': tr('facility.madrasa', 'Madrasa'),
    'quran_class': tr('facility.quran_class', 'Qur\'aana barnoota'),
    'wudu': tr('facility.wudu', 'Wudu\'aa'),
    'parking': tr('facility.parking', 'Konkolaataa bakka'),
    'library': tr('facility.library', 'Mana kitaabaa'),
    'women_area': tr('facility.women_area', 'Bakka dubartootaa'),
    'kitchen': tr('facility.kitchen', 'Jikoo'),
    'funeral': tr('facility.funeral', 'Tajaajila awwaalaa'),
    'wedding': tr('facility.wedding', 'Cidhaa'),
    'charity': tr('facility.charity', 'Deeggarsa')
  };

  container.innerHTML = facilities.map(f => {
    const key = typeof f === 'string' ? f : f.key;
    const icon = facilityIcons[key] || '✅';
    const label = facilityLabels[key] || capitalize(key);

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
// 7. PRAYER TIMES — Aladhan API
// ============================================
async function loadPrayerTimes(m) {
  const container = document.getElementById('prayerTimes');
  if (!container) return;

  try {
    const lat = m.latitude || 9.0100;
    const lng = m.longitude || 38.7600;
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

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
        ${tr('masjidos.prayer.error', 'Yeroon salaataa hin argamne.')} —
        <a href="https://aladhan.com" target="_blank" style="color: var(--green-700);">Aladhan.com</a>
      </div>
    `;
  }
}

function renderPrayerTimes(timings, dateInfo) {
  const container = document.getElementById('prayerTimes');
  if (!container) return;

  const prayers = [
    { key: 'Fajr', nameKey: 'prayer.fajr', defaultName: 'Fajr', icon: '🌙' },
    { key: 'Sunrise', nameKey: 'prayer.sunrise', defaultName: 'Sunrise', icon: '🌅' },
    { key: 'Dhuhr', nameKey: 'prayer.dhuhr', defaultName: 'Dhuhr', icon: '☀️' },
    { key: 'Asr', nameKey: 'prayer.asr', defaultName: 'Asr', icon: '🌤️' },
    { key: 'Maghrib', nameKey: 'prayer.maghrib', defaultName: 'Maghrib', icon: '🌆' },
    { key: 'Isha', nameKey: 'prayer.isha', defaultName: 'Isha', icon: '🌃' }
  ];

  container.innerHTML = prayers.map(p => `
    <div class="prayer-item">
      <div class="prayer-item-icon">${p.icon}</div>
      <div class="prayer-item-name">${tr(p.nameKey, p.defaultName)}</div>
      <div class="prayer-item-time">${timings[p.key] || '—'}</div>
    </div>
  `).join('');

  const dateEl = document.getElementById('prayerDate');
  if (dateEl && dateInfo) {
    dateEl.textContent = `${dateInfo.readable} — ${dateInfo.hijri?.day} ${dateInfo.hijri?.month?.en} ${dateInfo.hijri?.year} AH`;
  }
}

// ============================================
// 8. DETAIL MAP
// ============================================
function initDetailMap(m) {
  const mapEl = document.getElementById('detailMap');
  if (!mapEl || typeof L === 'undefined') return;

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

  const t = translateMasjid(m);

  L.marker([lat, lng], { icon: customIcon })
    .addTo(detailMap)
    .bindPopup(`<b>${escapeHtml(t.name)}</b><br>${escapeHtml(m.woreda)}`)
    .openPopup();
}

// ============================================
// 9. LANGUAGE CHANGE
// ============================================
window.addEventListener('languageChanged', () => {
  console.log('🌐 Language changed — re-rendering detail');
  if (currentMasjid) {
    renderDetail(currentMasjid);
    // Prayer times — re-render
    const container = document.getElementById('prayerTimes');
    if (container) loadPrayerTimes(currentMasjid);
  }
});