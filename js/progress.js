// ============================================
// PROGRESS.JS — Home + Progress Page + Tier Modal
// Malka Noonoo Project
// Complete Final v3.0
// ============================================

console.log('📊 progress.js loaded');

// ============================================
// 1. TIER DATA
// ============================================
window.TIER_DATA = {
  tier1: {
    icon: '🏛️',
    title: 'Sadarkaa 1 — Dandeettii Ol\'aanaa',
    sub: 'Deeggartoota guddaa',
    amount: '80,000,000 ETB',
    desc: 'Deeggartoonni kunneen jaarmiyaa ijoo bittuuf qooda guddaa qabu. Kunis jaarmiyaa G+3, 1,600 m² — piroojektii kanaaf bu\'uura.',
    features: [
      'Jaarmiyaa G+3 — 1,600 m² bittaa',
      'Waan hunda irratti beekamtii',
      'Maqaa keessan fuula guddaa irratti',
      'Waliigaltee waggaa beekamtii',
      'Hoggansa koree waliin walqunnamtii'
    ]
  },
  tier2: {
    icon: '🤝',
    title: 'Sadarkaa 2 — Giddu-galeessa',
    sub: 'Daldaltoota fi deeggartoota',
    amount: '45,000,000 ETB',
    desc: 'Daldaltoota, hojjettoota, fi hawaasa giddu-galeessa. Kunneen piroojektii kanaaf hirmaannaa ol\'aanaa qabu.',
    features: [
      'Konkolaataa tajaajilaa fi elektirikii',
      'Bakka daldalaa qooda',
      'Maqaa keessan fuula beekamtii irratti',
      'Waliigaltee fi raseenii',
      'Hawaasa daldalaa waliin walqunnamtii'
    ]
  },
  community: {
    icon: '👥',
    title: 'Hawaasa — Hirmaannaa Bal\'aa',
    sub: 'Gumaacha xiqqaa, walitti qabamee guddaa',
    amount: '30,000,000 ETB',
    desc: 'Hawaasa bal\'aa — namni tokko tokko gumaacha xiqqaa godhee, walitti qabamee guddaa ta\'a. Kun humna hawaasaa dha.',
    features: [
      'Miseensota waajjiraa fi raawwattoota',
      'Meeshaalee waajjiraa fi teeknoolojii',
      'Maqaa gumaachitoota irratti beekamtii',
      'Nagahee SMS fi email',
      'Hawaasa waliin walqunnamtii'
    ]
  },
  masjid: {
    icon: '🕌',
    title: 'Masgiidota — 85 Masgiidota',
    sub: 'Hirmaannaa waloo',
    amount: '20,000,000 ETB',
    desc: 'Masgiidota 85 — aanaalee 3 keessatti argaman. Kunneen walitti qabamanii, piroojektii kanaaf hirmaannaa guddaa taasisu.',
    features: [
      'Tajaajila 85 masgiidotaaf',
      'Konkolaataa daawwannaa',
      'Barnoota fi leenjii',
      'Miseensota masgiidaa beekamtii',
      'Tajaajila hawaasaa cimsuu'
    ]
  }
};

// ============================================
// 2. TIER MODAL — Event Delegation
// ============================================
document.addEventListener('click', function (e) {
  const tierCard = e.target.closest('.tier.clickable');
  if (tierCard) {
    e.preventDefault();
    const tier = tierCard.dataset.tier;
    console.log('🎯 Tier clicked:', tier);
    openTierModal(tier);
    return;
  }

  if (e.target.closest('#tierModalClose')) {
    closeTierModal();
    return;
  }

  if (e.target.id === 'tierModal') {
    closeTierModal();
  }
}, true);

// ============================================
// 3. OPEN TIER MODAL
// ============================================
window.openTierModal = function (tierKey) {
  const data = window.TIER_DATA[tierKey];
  if (!data) {
    console.error('❌ Tier not found:', tierKey);
    return;
  }

  let modal = document.getElementById('tierModal');

  if (!modal) {
    console.log('🔨 Creating modal dynamically...');
    modal = document.createElement('div');
    modal.id = 'tierModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content modal-tier">
        <button class="modal-close" id="tierModalClose" aria-label="Close">×</button>
        <div class="modal-body" id="tierModalBody"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const body = document.getElementById('tierModalBody');
  body.innerHTML = `
    <div class="tier-modal-hero">
      <div class="tier-modal-icon">${data.icon}</div>
      <h2>${data.title}</h2>
      <p class="tier-modal-sub">${data.sub}</p>
      <div class="tier-modal-amount">${data.amount}</div>
    </div>
    <div class="tier-modal-body">
      <p>${data.desc}</p>
      <ul class="tier-modal-features">
        ${data.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <div class="tier-modal-cta">
        <a href="donate.html?tier=${tierKey}" class="btn btn-primary btn-lg" style="width: 100%; padding: 14px;">
          🤲 Gumaachi — ${data.sub}
        </a>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  console.log('✅ Modal opened for:', tierKey);
};

// ============================================
// 4. CLOSE TIER MODAL
// ============================================
window.closeTierModal = function () {
  const modal = document.getElementById('tierModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    window.closeTierModal();
  }
});

// ============================================
// 5. STATE
// ============================================
const progressState = {
  initialized: false
};

// ============================================
// 6. INIT
// ============================================
document.addEventListener('DOMContentLoaded', initProgress);

function initProgress() {
  if (progressState.initialized) return;
  progressState.initialized = true;

  console.log('🚀 Progress init...');

  const isProgressPage = document.getElementById('heroProgressBar');
  const isHomePage = document.getElementById('ringFill');

  if (isProgressPage) {
    console.log('📄 Progress page detected');
    loadProgressPage();
  } else if (isHomePage) {
    console.log('🏠 Home page detected');
    loadHomePage();
  }
}

// ============================================
// 7. LOAD HOME PAGE
// ============================================
async function loadHomePage() {
  try {
    console.log('📊 Loading home data...');

    const raised = await getTotalDonations();
    const pct = percent(raised, PROJECT_GOAL);

    // Ring animation
    const ringFill = document.getElementById('ringFill');
    if (ringFill) {
      const c = 2 * Math.PI * 85;
      ringFill.style.strokeDasharray = c;
      ringFill.style.strokeDashoffset = c - (pct / 100) * c;
    }

    setText('percentText', pct + '%');

    const raisedEl = document.getElementById('raisedAmount');
    if (raisedEl && typeof animateValue === 'function') {
      animateValue(raisedEl, 0, raised, 1800);
    }

    const milestones = await getMilestones();
    renderMilestones(milestones);

    const announcements = await getAnnouncements();
    renderAnnouncements(announcements);

    console.log('✅ Home loaded');
  } catch (err) {
    console.error('❌ Home error:', err);
    const grid = document.getElementById('milestonesGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="loading" style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--neutral-500);">
          ⚠️ Odeeffannoo fe'uun hin danda'amne. Booda deebi'i.
        </div>
      `;
    }
  }
}

// ============================================
// 8. LOAD PROGRESS PAGE
// ============================================
async function loadProgressPage() {
  try {
    console.log('📊 Loading progress data...');

    const raised = await getTotalDonations();
    const pct = percent(raised, PROJECT_GOAL);

    setText('sumRaised', formatETB(raised));
    setText('sumPercent', pct + '%');
    setText('sumDonors', await getDonorCount());

    const bar = document.getElementById('heroProgressBar');
    if (bar) setTimeout(() => bar.style.width = pct + '%', 200);

    const milestones = await getMilestones();
    renderMilestones(milestones);

    const donations = await getRecentDonations();
    renderRecentDonations(donations);

    console.log('✅ Progress loaded');
  } catch (err) {
    console.error('❌ Progress error:', err);
  }
}

// ============================================
// 9. HELPERS
// ============================================
async function getDonorCount() {
  try {
    const { data, error } = await db
      .from('mn_donations')
      .select('donor_phone')
      .eq('status', 'confirmed');
    if (error) return 0;
    return new Set((data || []).map(d => d.donor_phone)).size;
  } catch {
    return 0;
  }
}

async function getRecentDonations() {
  try {
    const { data, error } = await db
      .from('mn_donations')
      .select('donor_name, amount, created_at')
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// ============================================
// 10. RENDER MILESTONES — ✅ I18N SUPPORT
// ============================================
function renderMilestones(milestones) {
  const grid = document.getElementById('milestonesGrid');
  if (!grid) return;

  // Empty state
  if (!milestones || !milestones.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-illustration">📋</div>
        <h3 class="empty-state-title">Odeeffannoo Hin Jiru</h3>
        <p class="empty-state-desc">Qabeenyi karoorfame amma hin galmoofne.</p>
        <a href="about.html" class="btn btn-primary">Waa'ee Piroojektii Ilaali</a>
      </div>
    `;
    return;
  }

  // Fallback icons
  const icons = ['🏛️', '🚗', '⚡', '🪑', '💻', '🎨', '🏪', '📜', '💰', '🛡️'];

  // ✅ Current language
  const currentLang = (typeof getCurrentLang === 'function')
    ? getCurrentLang()
    : (localStorage.getItem('mn_lang') || 'om');

  console.log('🌐 Rendering milestones in lang:', currentLang);

  grid.innerHTML = milestones.map((m, i) => {
    const pct = percent(m.current_amount || 0, m.target_amount || 1);

    // ✅ Translation logic (3-tier priority)
    let title = m.title || '';
    let description = m.description || '';

    // Priority 1: DB has explicit translation columns
    if (currentLang === 'am' && m.title_am) {
      title = m.title_am;
      description = m.description_am || description;
    } else if (currentLang === 'en' && m.title_en) {
      title = m.title_en;
      description = m.description_en || description;
    } else if (currentLang === 'om' && m.title_om) {
      title = m.title_om;
      description = m.description_om || description;
    } else {
      // Priority 2: translations.js keys (milestone.{id}.title)
      const key = `milestone.${m.id}`;
      const titleKey = `${key}.title`;
      const descKey = `${key}.desc`;

      if (typeof t === 'function') {
        const translatedTitle = t(titleKey, '');
        const translatedDesc = t(descKey, '');

        // Yoo hiiki argame (key maqaa hin deebine)
        if (translatedTitle && translatedTitle !== titleKey) {
          title = translatedTitle;
        }
        if (translatedDesc && translatedDesc !== descKey) {
          description = translatedDesc;
        }
      }
    }

    return `
      <div class="card">
        <div class="card-icon">${icons[i % icons.length]}</div>
        <h3>${escapeHtml(title || 'Qabeenya')}</h3>
        <p>${escapeHtml(description)}</p>
        <div class="card-progress">
          <div class="card-progress-bar" style="width: ${pct}%"></div>
        </div>
        <div class="card-meta">
          <span>${formatETB(m.current_amount || 0)}</span>
          <span>${pct}%</span>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// 11. RENDER ANNOUNCEMENTS
// ============================================
function renderAnnouncements(list) {
  const el = document.getElementById('announcementsList');
  if (!el) return;

  if (!list || !list.length) {
    el.innerHTML = `
      <div class="loading" style="text-align:center; padding: 30px; color: var(--neutral-500);">
        ${t('announcements.empty') || 'Odeeffannoo hin jiru.'}
      </div>
    `;
    return;
  }

  el.innerHTML = list.map(a => `
    <div class="announcement">
      <h4>${escapeHtml(a.title || '')}</h4>
      <p>${escapeHtml(a.body || '')}</p>
      <span class="date">${new Date(a.created_at).toLocaleDateString('om-ET')}</span>
    </div>
  `).join('');
}

// ============================================
// 12. RENDER RECENT DONATIONS
// ============================================
function renderRecentDonations(list) {
  const el = document.getElementById('donationsList');
  if (!el) return;

  if (!list || !list.length) {
    el.innerHTML = `
      <div class="loading" style="text-align:center; padding: 30px; color: var(--neutral-500);">
        ${t('progress.no.donations') || 'Gumaachni hin jiru.'}
      </div>
    `;
    return;
  }

  el.innerHTML = list.map(d => `
    <div class="donation-row">
      <span class="name">${escapeHtml(d.donor_name || 'Anonymous')}</span>
      <span class="amount">${formatETB(d.amount)}</span>
    </div>
  `).join('');
}

// ============================================
// 13. HELPERS
// ============================================
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
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
// 14. LANGUAGE CHANGE
// ============================================
window.addEventListener('languageChanged', () => {
  console.log('🌐 Language changed — reloading...');
  if (document.getElementById('ringFill')) {
    loadHomePage();
  } else if (document.getElementById('heroProgressBar')) {
    loadProgressPage();
  }
});

// ============================================
// 15. GLOBAL EXPORTS
// ============================================
window.openTierModal = window.openTierModal;
window.closeTierModal = window.closeTierModal;
window.renderMilestones = renderMilestones;
window.loadHomePage = loadHomePage;
window.loadProgressPage = loadProgressPage;