// ============================================
// PROGRESS / HOME — Milestones + Donations
// ============================================

// ---------- PROGRESS PAGE ----------
async function loadProgressPage() {
  try {
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
  } catch (err) {
    console.error(err);
  }
}

// ---------- HOME PAGE ----------
async function loadHomePage() {
  try {
    const raised = await getTotalDonations();
    const pct = percent(raised, PROJECT_GOAL);

    const ringFill = document.getElementById('ringFill');
    if (ringFill) {
      const c = 2 * Math.PI * 85;
      ringFill.style.strokeDasharray = c;
      ringFill.style.strokeDashoffset = c - (pct / 100) * c;
    }

    setText('percentText', pct + '%');

    const raisedEl = document.getElementById('raisedAmount');
    if (raisedEl) animateValue(raisedEl, 0, raised, 1800);

    const milestones = await getMilestones();
    renderMilestones(milestones);

    const ann = await getAnnouncements();
    renderAnnouncements(ann);
  } catch (err) {
    console.error(err);
  }
}

// ---------- HELPERS ----------
async function getDonorCount() {
  const { data, error } = await db
    .from('mn_donations')
    .select('donor_phone')
    .eq('status', 'confirmed');
  if (error) return 0;
  return new Set(data.map(d => d.donor_phone)).size;
}

async function getRecentDonations() {
  const { data, error } = await db
    .from('mn_donations')
    .select('donor_name, amount, created_at')
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })
    .limit(10);
  return data || [];
}

function renderMilestones(milestones) {
  const grid = document.getElementById('milestonesGrid');
  if (!grid) return;
  if (!milestones.length) {
    grid.innerHTML = `<div class="loading">${t('table.empty')}</div>`;
    return;
  }
  const icons = ['🏛️', '🚗', '⚡', '🪑', '💻', '🎨', '🏪', '📜', '💰', '🛡️'];
  grid.innerHTML = milestones.map((m, i) => {
    const pct = percent(m.current_amount, m.target_amount);
    return `
      <div class="card">
        <div class="card-icon">${icons[i] || '📌'}</div>
        <h3>${m.title}</h3>
        <p>${m.description || ''}</p>
        <div class="card-progress">
          <div class="card-progress-bar" style="width: ${pct}%"></div>
        </div>
        <div class="card-meta">
          <span>${formatETB(m.current_amount)}</span>
          <span>${pct}%</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderAnnouncements(list) {
  const el = document.getElementById('announcementsList');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div class="loading">${t('announcements.empty')}</div>`;
    return;
  }
  el.innerHTML = list.map(a => `
    <div class="announcement">
      <h4>${a.title}</h4>
      <p>${a.body || ''}</p>
      <span class="date">${new Date(a.created_at).toLocaleDateString()}</span>
    </div>
  `).join('');
}

function renderRecentDonations(list) {
  const el = document.getElementById('donationsList');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div class="loading">${t('progress.no.donations')}</div>`;
    return;
  }
  el.innerHTML = list.map(d => `
    <div class="donation-row">
      <span class="name">${d.donor_name || 'Anonymous'}</span>
      <span class="amount">${formatETB(d.amount)}</span>
    </div>
  `).join('');
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('heroProgressBar')) {
    loadProgressPage();
  } else if (document.getElementById('ringFill')) {
    loadHomePage();
  }
});