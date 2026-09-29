// ============================================
// DASHBOARD.JS — Malka Noonoo (Full + i18n)
// ============================================

console.log('📊 dashboard.js loaded');

const dashState = {
  charts: { revenue: null, tiers: null, expenses: null },
  allDonations: [],
  allNews: [],
  selectedDonationIds: new Set(),
  initialized: false
};

// ============================================
// HELPER — Safe translation
// ============================================
function tr(key, fallback) {
  if (typeof t === 'function') {
    const val = t(key, '');
    if (val && val !== key) return val;
  }
  return fallback || key;
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', initDashboard);

async function initDashboard() {
  console.log('🚀 Dashboard init...');
  if (dashState.initialized) return;
  dashState.initialized = true;

  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session) { window.location.href = 'login.html'; return; }

    setText('dashUser', session.user.email);
    await checkProfile(session.user.id);

    setupTabs();
    setupDonationForm();
    setupDonationFilters();
    setupExpenseForm();
    setupAssetForm();
    setupRentalForm();
    setupReportSubtabs();
    setupReportWritingForm();
    setupHighlightInput();
    setupFilterListeners();
    setupMasjidForm();
    setupAnnouncementForm();
    setupNewsForm();
    setupTeamForm();
    setupGalleryForm();
    setupFaqForm();
    setupMilestoneForm();
    setupMobileMenu();
    setupThemeToggle();
    setupLogout();
    setupLanguageSync();

    await loadOverview();
    setTimeout(updateBadges, 1500);

    // Apply translations to dynamically rendered i18n elements
    if (typeof applyTranslations === 'function') applyTranslations();
  } catch (err) {
    console.error('❌ Init error:', err);
    if (window.toast) toast.error(tr('toast.error', 'Dogoggora'), 'Daashboordii banuu hin dandeessisu');
  }
}

async function checkProfile(userId) {
  const { data: profile } = await db.from('mn_profiles').select('*').eq('id', userId).maybeSingle();
  if (!profile) {
    await db.from('mn_profiles').insert([{ id: userId, full_name: 'Admin', role: 'admin' }]);
  }
}

// ============================================
// TABS
// ============================================
function setupTabs() {
  document.querySelectorAll('.dash-nav a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const tab = link.dataset.tab;
      if (!tab) return;

      document.querySelectorAll('.dash-nav a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.dash-tab').forEach(s => s.classList.remove('active'));
      document.querySelector(`.dash-tab[data-tab="${tab}"]`)?.classList.add('active');

      const span = link.querySelector('span[data-i18n]');
      const titleEl = document.getElementById('dashTitle');
      if (titleEl && span) {
        const key = span.dataset.i18n;
        titleEl.dataset.i18n = key;
        titleEl.textContent = tr(key, span.textContent);
      }

      if (window.innerWidth <= 900) document.getElementById('dashSidebar')?.classList.remove('open');
      loadTab(tab);
    });
  });
}

async function loadTab(tab) {
  const loaders = {
    overview: loadOverview, donations: loadDonations, expenses: loadExpenses,
    assets: loadAssets, rentals: loadRentals, reports: loadReportsFull,
    activity: loadActivity, announcements: loadAnnouncements, news: loadNews,
    comments: loadComments, gallery: loadGallery, masjidos: loadMasjidos,
    team: loadTeam, volunteers: loadVolunteers, milestones: loadMilestones,
    messages: loadMessages, faqs: loadFaqs, settings: loadSettings
  };
  if (loaders[tab]) await loaders[tab]();
}

// ============================================
// OVERVIEW
// ============================================
async function loadOverview() {
  try {
    const { data: donations } = await db.from('mn_donations').select('amount, donor_phone, tier, created_at, status');
    const confirmed = (donations || []).filter(d => d.status === 'confirmed');
    const raised = confirmed.reduce((s, d) => s + Number(d.amount), 0);
    const pct = percent(raised, PROJECT_GOAL);
    const donors = new Set(confirmed.map(d => d.donor_phone)).size;

    setText('kpiRaised', formatETB(raised));
    setText('kpiPercent', pct + '%');
    setText('kpiDonors', donors);

    const { data: expenses } = await db.from('mn_expenses').select('amount, category');
    const totalExp = (expenses || []).reduce((s, e) => s + Number(e.amount), 0);
    setText('kpiExpenses', formatETB(totalExp));

    const { data: assets } = await db.from('mn_assets').select('id');
    setText('kpiAssets', (assets || []).length);

    renderRevenueChart(confirmed);
    renderTiersChart(confirmed);
    renderExpensesChart(expenses || []);
  } catch (err) { console.error(err); }
}

async function updateBadges() {
  try {
    const [c, v, m, n] = await Promise.all([
      db.from('mn_news_comments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      db.from('mn_volunteers').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      db.from('mn_contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      db.from('mn_announcements').select('id', { count: 'exact', head: true })
    ]);
    const bc = document.getElementById('badgeComments');
    const bv = document.getElementById('badgeVolunteers');
    const bm = document.getElementById('badgeMessages');
    if (bc) { bc.textContent = c.count || 0; bc.style.display = c.count > 0 ? 'flex' : 'none'; }
    if (bv) { bv.textContent = v.count || 0; bv.style.display = v.count > 0 ? 'flex' : 'none'; }
    if (bm) { bm.textContent = m.count || 0; bm.style.display = m.count > 0 ? 'flex' : 'none'; }
    setText('qsComments', c.count || 0);
    setText('qsVolunteers', v.count || 0);
    setText('qsMessages', m.count || 0);
    setText('qsNews', n.count || 0);
  } catch (err) {}
}

// CHARTS
function renderRevenueChart(donations) {
  const months = getLast6Months();
  const totals = months.map(m => donations.filter(d => {
    const dt = new Date(d.created_at);
    return dt.getMonth() === m.month && dt.getFullYear() === m.year;
  }).reduce((s, d) => s + Number(d.amount), 0));

  const ctx = document.getElementById('revenueChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (dashState.charts.revenue) dashState.charts.revenue.destroy();

  dashState.charts.revenue = new Chart(ctx, {
    type: 'line',
    data: { labels: months.map(m => m.label), datasets: [{
      label: tr('reports.annual.revenue', 'Galii'), data: totals, borderColor: '#22a06b',
      backgroundColor: 'rgba(34, 160, 107, 0.1)', fill: true, tension: 0.4, borderWidth: 3,
      pointBackgroundColor: '#22a06b', pointRadius: 5
    }]},
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
  });
}

function renderTiersChart(donations) {
  const tiers = ['tier1', 'tier2', 'community', 'masjid', 'business'];
  const labels = ['Sadarkaa 1', 'Sadarkaa 2', 'Hawaasa', 'Masgiidota', 'Daldala'];
  const colors = ['#d4a017', '#22a06b', '#6ee7b7', '#94a3b8', '#64748b'];
  const totals = tiers.map(t => donations.filter(d => d.tier === t).reduce((s, d) => s + Number(d.amount), 0));

  const ctx = document.getElementById('tiersChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (dashState.charts.tiers) dashState.charts.tiers.destroy();

  dashState.charts.tiers = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: totals, backgroundColor: colors, borderWidth: 3, borderColor: '#fff' }] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8 } } } }
  });
}

function renderExpensesChart(expenses) {
  const categories = {};
  expenses.forEach(e => { categories[e.category] = (categories[e.category] || 0) + Number(e.amount); });

  const ctx = document.getElementById('expensesChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (dashState.charts.expenses) dashState.charts.expenses.destroy();

  dashState.charts.expenses = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(categories).length ? Object.keys(categories) : ['—'],
      datasets: [{ data: Object.values(categories).length ? Object.values(categories) : [0],
        backgroundColor: '#22a06b', borderRadius: 8 }]
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
  });
}

// ============================================
// DONATIONS
// ============================================
function setupDonationForm() {
  document.getElementById('addDonationForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('donationMsg');
    const { data: { session } } = await db.auth.getSession();

    const donation = {
      donor_name: fd.get('donor_name'),
      donor_phone: fd.get('donor_phone'),
      donor_email: fd.get('donor_email') || null,
      amount: Number(fd.get('amount')),
      tier: fd.get('tier') || null,
      payment_method: fd.get('payment_method'),
      payment_ref: fd.get('payment_ref') || 'MANUAL-' + Date.now(),
      note: fd.get('note') || null,
      status: 'confirmed',
      source: 'manual',
      entered_by: session?.user?.id
    };

    if (donation.amount < 1) {
      msg.textContent = '❌ ' + tr('form.amount.required', 'Gumaacha sirrii galchi');
      msg.className = 'form-message error';
      return;
    }

    const { error } = await db.from('mn_donations').insert([donation]);
    if (error) {
      msg.textContent = '❌ ' + error.message;
      msg.className = 'form-message error';
      return;
    }
    msg.textContent = '✅ ' + tr('toast.save.success', 'Galii galmeeffameera!');
    msg.className = 'form-message success';
    e.target.reset();
    if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), `${formatETB(donation.amount)}`);
    await logActivity('donation', 'manual_created', `${donation.donor_name} — ${donation.amount}`);
    loadDonations();
    loadOverview();
  });
}

async function loadDonations() {
  const { data } = await db.from('mn_donations').select('*').order('created_at', { ascending: false }).limit(500);
  dashState.allDonations = data || [];
  applyDonationFilters();
}

function applyDonationFilters() {
  const q = (document.getElementById('donSearch')?.value || '').toLowerCase();
  const tier = document.getElementById('donTier')?.value || '';
  const status = document.getElementById('donStatus')?.value || '';
  const from = document.getElementById('donFrom')?.value;
  const to = document.getElementById('donTo')?.value;

  const filtered = dashState.allDonations.filter(d => {
    const text = `${d.donor_name || ''} ${d.donor_phone || ''} ${d.donor_email || ''}`.toLowerCase();
    const dt = new Date(d.created_at).getTime();
    return (!q || text.includes(q)) && (!tier || d.tier === tier) &&
           (!status || d.status === status) &&
           (!from || dt >= new Date(from).getTime()) &&
           (!to || dt <= new Date(to).getTime() + 86400000);
  });
  renderDonationsTable(filtered);
}

function renderDonationsTable(list) {
  const tb = document.querySelector('#donationsTable tbody');
  if (!tb) return;
  if (!list.length) { tb.innerHTML = `<tr><td colspan="11" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }

  tb.innerHTML = list.map((d, i) => `
    <tr>
      <td><input type="checkbox" class="don-checkbox" data-id="${d.id}" ${dashState.selectedDonationIds.has(d.id) ? 'checked' : ''} /></td>
      <td>${i + 1}</td><td>${d.donor_name || '—'}</td><td>${d.donor_phone || '—'}</td>
      <td>${d.donor_email || '—'}</td><td>${d.tier || '—'}</td>
      <td><strong>${formatETB(d.amount)}</strong></td><td>${d.payment_method || '—'}</td>
      <td>${badge(d.status)}</td><td>${new Date(d.created_at).toLocaleDateString('om-ET')}</td>
      <td>
        ${d.status === 'pending' ? `<button class="btn-icon success" onclick="confirmDonation(${d.id})">✓</button>` : ''}
        <button class="btn-icon danger" onclick="deleteDonation(${d.id})">🗑</button>
      </td>
    </tr>
  `).join('');

  tb.querySelectorAll('.don-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = Number(cb.dataset.id);
      if (cb.checked) dashState.selectedDonationIds.add(id);
      else dashState.selectedDonationIds.delete(id);
      updateSelectedCount();
    });
  });
}

function setupDonationFilters() {
  ['donSearch', 'donTier', 'donStatus', 'donFrom', 'donTo'].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('input', applyDonationFilters);
    el?.addEventListener('change', applyDonationFilters);
  });
  document.getElementById('donClear')?.addEventListener('click', () => {
    ['donSearch', 'donTier', 'donStatus', 'donFrom', 'donTo'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    applyDonationFilters();
  });
  document.getElementById('donSelectAll')?.addEventListener('change', e => {
    const c = e.target.checked;
    document.querySelectorAll('.don-checkbox').forEach(cb => {
      cb.checked = c;
      const id = Number(cb.dataset.id);
      if (c) dashState.selectedDonationIds.add(id);
      else dashState.selectedDonationIds.delete(id);
    });
    updateSelectedCount();
  });
  document.getElementById('bulkConfirmBtn')?.addEventListener('click', bulkConfirm);
}

function updateSelectedCount() {
  const c = document.getElementById('donSelectedCount');
  const b = document.getElementById('bulkConfirmBtn');
  const count = dashState.selectedDonationIds.size;
  if (c) c.textContent = `${count} ${tr('dash.bulk.selected', 'filatame')}`;
  if (b) b.disabled = count === 0;
}

async function confirmDonation(id) {
  if (!confirm(tr('modal.confirm', 'Mirkaneessuu?'))) return;
  const { error } = await db.from('mn_donations').update({ status: 'confirmed' }).eq('id', id);
  if (error) return alert('❌ ' + error.message);
  await logActivity('donation', 'confirmed', `Donation #${id}`);
  loadDonations(); loadOverview();
  if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), tr('status.confirmed', 'Mirkanaa\'e'));
}

async function deleteDonation(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_donations').delete().eq('id', id);
  await logActivity('donation', 'deleted', `Donation #${id}`);
  loadDonations(); loadOverview();
}

async function bulkConfirm() {
  const ids = Array.from(dashState.selectedDonationIds);
  if (!ids.length || !confirm(`${ids.length} ${tr('modal.confirm', 'mirkaneessuu?')}`)) return;
  await db.from('mn_donations').update({ status: 'confirmed' }).in('id', ids);
  dashState.selectedDonationIds.clear();
  updateSelectedCount();
  loadDonations(); loadOverview();
  if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), `${ids.length} ✓`);
}

// ============================================
// EXPENSES
// ============================================
async function loadExpenses() {
  const { data } = await db.from('mn_expenses').select('*').order('created_at', { ascending: false });
  const tb = document.querySelector('#expensesTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="7" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }
  tb.innerHTML = data.map((e, i) => `
    <tr><td>${i + 1}</td><td>${e.category}</td><td>${e.description || '—'}</td>
    <td><strong>${formatETB(e.amount)}</strong></td><td>${badge(e.status)}</td>
    <td>${new Date(e.created_at).toLocaleDateString('om-ET')}</td>
    <td><button class="btn-icon danger" onclick="deleteExpense(${e.id})">🗑</button></td></tr>
  `).join('');
}

function setupExpenseForm() {
  document.getElementById('addExpenseForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('expenseMsg');
    const exp = {
      category: fd.get('category'), description: fd.get('description') || null,
      amount: Number(fd.get('amount')), status: fd.get('status') || 'pending'
    };
    const { error } = await db.from('mn_expenses').insert([exp]);
    if (error) { msg.textContent = '❌ ' + error.message; msg.className = 'form-message error'; return; }
    msg.textContent = '✅ ' + tr('toast.save.success', 'Galmeeffameera!');
    msg.className = 'form-message success';
    e.target.reset();
    await logActivity('expense', 'created', exp.category);
    loadExpenses(); loadOverview();
  });
}

async function deleteExpense(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_expenses').delete().eq('id', id);
  await logActivity('expense', 'deleted', `Expense #${id}`);
  loadExpenses(); loadOverview();
}

// ============================================
// ASSETS
// ============================================
async function loadAssets() {
  const { data } = await db.from('mn_assets').select('*').order('id', { ascending: false });
  const tb = document.querySelector('#assetsTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="7" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }
  tb.innerHTML = data.map((a, i) => `
    <tr><td>${i + 1}</td><td>${a.name}</td><td>${a.category || '—'}</td>
    <td>${a.quantity || 1}</td><td>${formatETB(a.purchase_price || 0)}</td>
    <td>${a.purchase_date || '—'}</td>
    <td><button class="btn-icon danger" onclick="deleteAsset(${a.id})">🗑</button></td></tr>
  `).join('');
}

function setupAssetForm() {
  document.getElementById('addAssetForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('assetMsg');
    const asset = {
      name: fd.get('name'), category: fd.get('category') || null,
      quantity: Number(fd.get('quantity')) || 1,
      purchase_price: Number(fd.get('purchase_price')) || 0,
      purchase_date: fd.get('purchase_date') || null
    };
    const { error } = await db.from('mn_assets').insert([asset]);
    if (error) { msg.textContent = '❌ ' + error.message; msg.className = 'form-message error'; return; }
    msg.textContent = '✅ ' + tr('toast.save.success', 'Galmeeffameera!');
    msg.className = 'form-message success';
    e.target.reset();
    loadAssets(); loadOverview();
  });
}

async function deleteAsset(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_assets').delete().eq('id', id);
  loadAssets(); loadOverview();
}

// ============================================
// RENTALS
// ============================================
async function loadRentals() {
  const { data } = await db.from('mn_rentals').select('*').order('id', { ascending: false });
  const tb = document.querySelector('#rentalsTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="7" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }
  tb.innerHTML = data.map((r, i) => `
    <tr><td>${i + 1}</td><td>${r.tenant_name}</td><td>${r.tenant_phone || '—'}</td>
    <td>${r.space_description || '—'}</td><td>${formatETB(r.monthly_rent || 0)}</td>
    <td>${badge(r.status)}</td>
    <td><button class="btn-icon danger" onclick="deleteRental(${r.id})">🗑</button></td></tr>
  `).join('');
}

function setupRentalForm() {
  document.getElementById('addRentalForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('rentalMsg');
    const rental = {
      tenant_name: fd.get('tenant_name'), tenant_phone: fd.get('tenant_phone') || null,
      space_description: fd.get('space_description') || null,
      monthly_rent: Number(fd.get('monthly_rent')) || 0,
      start_date: fd.get('start_date') || null, status: fd.get('status') || 'active'
    };
    const { error } = await db.from('mn_rentals').insert([rental]);
    if (error) { msg.textContent = '❌ ' + error.message; msg.className = 'form-message error'; return; }
    msg.textContent = '✅ ' + tr('toast.save.success', 'Galmeeffameera!');
    msg.className = 'form-message success';
    e.target.reset();
    loadRentals();
  });
}

async function deleteRental(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_rentals').delete().eq('id', id);
  loadRentals();
}

// ============================================
// REPORTS — Full System
// ============================================
async function loadReportsFull() {
  console.log('📊 Loading reports...');

  const monthSelect = document.getElementById('reportMonth');
  if (monthSelect && !monthSelect.options.length) {
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('om-ET', { year: 'numeric', month: 'long' });
      monthSelect.innerHTML += `<option value="${value}">${label}</option>`;
    }
    monthSelect.addEventListener('change', () => previewReport('monthly'));
  }

  const yearSelect = document.getElementById('reportYear');
  if (yearSelect && !yearSelect.options.length) {
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      yearSelect.innerHTML += `<option value="${now.getFullYear() - i}">${now.getFullYear() - i}</option>`;
    }
    yearSelect.addEventListener('change', () => previewReport('annual'));
  }

  await previewReport('monthly');
  await previewReport('annual');
  await previewReport('audit');
  await loadReportsList();
}

function setupReportSubtabs() {
  document.querySelectorAll('.report-subtab').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.subtab;
      document.querySelectorAll('.report-subtab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.report-subpanel').forEach(p => p.classList.remove('active'));
      document.querySelector(`.report-subpanel[data-subtab="${target}"]`)?.classList.add('active');

      if (target === 'list') loadReportsList();
      if (target === 'generate') loadReportsFull();
    });
  });
}

// HIGHLIGHTS
let currentHighlights = [];

function setupHighlightInput() {
  const input = document.getElementById('highlightInput');
  const addBtn = document.getElementById('addHighlightBtn');
  if (!input || !addBtn) return;
  addBtn.addEventListener('click', addHighlight);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addHighlight(); }
  });
  renderHighlights();
}

function addHighlight() {
  const input = document.getElementById('highlightInput');
  const text = input.value.trim();
  if (!text) return;
  currentHighlights.push(text);
  renderHighlights();
  input.value = '';
  input.focus();
}

function renderHighlights() {
  const list = document.getElementById('highlightsList');
  if (!list) return;
  if (!currentHighlights.length) {
    list.innerHTML = `<p class="text-muted" style="font-size: 12px;">${tr('empty.generic', 'Hin jiru — tokko dabalii.')}</p>`;
    return;
  }
  list.innerHTML = currentHighlights.map((h, i) => `
    <div class="highlight-item">
      <span>✓ ${escapeHtml(h)}</span>
      <button type="button" class="highlight-remove" onclick="removeHighlight(${i})">×</button>
    </div>
  `).join('');
}

window.removeHighlight = function(index) {
  currentHighlights.splice(index, 1);
  renderHighlights();
};

// WRITE FORM
function setupReportWritingForm() {
  const form = document.getElementById('writeReportForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('reportWriteMsg');
    const btn = document.getElementById('saveReportBtn');
    const editingId = document.getElementById('editingReportId').value;
    const { data: { session } } = await db.auth.getSession();

    const report = {
      type: document.getElementById('reportType').value,
      title: document.getElementById('reportTitle').value.trim(),
      period_start: document.getElementById('reportPeriodStart').value || null,
      period_end: document.getElementById('reportPeriodEnd').value || null,
      summary: document.getElementById('reportSummary').value.trim() || null,
      content: document.getElementById('reportContent').value.trim(),
      revenue: Number(document.getElementById('reportRevenue').value) || null,
      expenses: Number(document.getElementById('reportExpenses').value) || null,
      net: Number(document.getElementById('reportNet').value) || null,
      highlights: currentHighlights,
      status: document.getElementById('reportStatus').value,
      author_id: session?.user?.id,
      author_name: session?.user?.email
    };

    if (!report.type) { msg.textContent = '❌ Gosa gabaasaa filadhu'; msg.className = 'form-message error'; return; }
    if (report.title.length < 3) { msg.textContent = '❌ Mata-dureen gabaabaa dha'; msg.className = 'form-message error'; return; }
    if (report.content.length < 10) { msg.textContent = '❌ Qabiyyeen gabaabaa dha'; msg.className = 'form-message error'; return; }

    btn.disabled = true; btn.textContent = '⏳ Olkaa\'aa jira...';

    let error;
    if (editingId) {
      const result = await db.from('mn_reports').update(report).eq('id', Number(editingId));
      error = result.error;
    } else {
      if (report.status === 'published') report.published_at = new Date().toISOString();
      const result = await db.from('mn_reports').insert([report]);
      error = result.error;
    }

    btn.disabled = false; btn.textContent = '💾 Olkaa\'i Gabaasa';

    if (error) { msg.textContent = '❌ ' + error.message; msg.className = 'form-message error'; return; }

    msg.textContent = editingId ? '✅ Gabaasni haaromfameera!' : '✅ Gabaasni olkaa\'ameera!';
    msg.className = 'form-message success';
    if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), 'Gabaasni olkaa\'ameera');

    form.reset();
    currentHighlights = [];
    renderHighlights();
    document.getElementById('editingReportId').value = '';
    document.getElementById('reportFormTitle').textContent = '📝 Gabaasa Haaraa Barreessi';
    await logActivity('report', editingId ? 'updated' : 'created', report.title);
    loadReportsList();
  });

  document.getElementById('clearReportBtn')?.addEventListener('click', () => {
    if (!confirm(tr('modal.confirm', 'Qabiyyee haquu?'))) return;
    form.reset();
    currentHighlights = [];
    renderHighlights();
    document.getElementById('editingReportId').value = '';
    document.getElementById('reportFormTitle').textContent = '📝 Gabaasa Haaraa Barreessi';
    document.getElementById('reportWriteMsg').className = 'form-message';
  });
}

// LIST
async function loadReportsList() {
  const filter = document.getElementById('reportListFilter')?.value || 'all';
  let query = db.from('mn_reports').select('*').order('created_at', { ascending: false });

  if (['monthly', 'annual', 'audit', 'custom'].includes(filter)) query = query.eq('type', filter);
  else if (['draft', 'published'].includes(filter)) query = query.eq('status', filter);

  const { data } = await query;
  const tb = document.querySelector('#reportsListTable tbody');
  if (!tb) return;

  if (!data?.length) {
    tb.innerHTML = `<tr><td colspan="7" class="loading">Reports hin jiru. Gabaasa haaraa barreessi!</td></tr>`;
    return;
  }

  const typeLabels = { monthly: '📅 Ji\'aa', annual: '📆 Waggaa', audit: '🔍 Audit', custom: '🎯 Addaa' };

  tb.innerHTML = data.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(r.title)}</strong></td>
      <td>${typeLabels[r.type] || r.type}</td>
      <td>${new Date(r.created_at).toLocaleDateString('om-ET')}</td>
      <td>${r.revenue ? formatETB(r.revenue) : '—'}</td>
      <td>${badge(r.status)}</td>
      <td>
        <button class="btn-icon" onclick="editReport(${r.id})" title="Edit">✏️</button>
        <button class="btn-icon" onclick="viewReport(${r.id})" title="View">👁</button>
        <button class="btn-icon success" onclick="togglePublishReport(${r.id}, '${r.status}')">
          ${r.status === 'published' ? '📦' : '✅'}
        </button>
        <button class="btn-icon danger" onclick="deleteReport(${r.id})">🗑</button>
      </td>
    </tr>
  `).join('');
}

window.editReport = async function(id) {
  const { data } = await db.from('mn_reports').select('*').eq('id', id).single();
  if (!data) return;

  document.querySelectorAll('.report-subtab').forEach(b => b.classList.remove('active'));
  document.querySelector('.report-subtab[data-subtab="write"]').classList.add('active');
  document.querySelectorAll('.report-subpanel').forEach(p => p.classList.remove('active'));
  document.querySelector('.report-subpanel[data-subtab="write"]').classList.add('active');

  document.getElementById('reportType').value = data.type;
  document.getElementById('reportTitle').value = data.title;
  document.getElementById('reportPeriodStart').value = data.period_start || '';
  document.getElementById('reportPeriodEnd').value = data.period_end || '';
  document.getElementById('reportSummary').value = data.summary || '';
  document.getElementById('reportContent').value = data.content;
  document.getElementById('reportRevenue').value = data.revenue || '';
  document.getElementById('reportExpenses').value = data.expenses || '';
  document.getElementById('reportNet').value = data.net || '';
  document.getElementById('reportStatus').value = data.status;
  document.getElementById('editingReportId').value = data.id;
  document.getElementById('reportFormTitle').textContent = '✏️ Gabaasa Gulaali';

  currentHighlights = Array.isArray(data.highlights) ? data.highlights : [];
  renderHighlights();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.viewReport = async function(id) {
  const { data } = await db.from('mn_reports').select('*').eq('id', id).single();
  if (!data) return;

  const highlights = Array.isArray(data.highlights) ? data.highlights : [];
  const typeLabels = { monthly: '📅 Gabaasa Ji\'aa', annual: '📆 Gabaasa Waggaa', audit: '🔍 Audit', custom: '🎯 Addaa' };

  if (window.openModal) {
    openModal({
      title: data.title,
      body: `
        <div class="report-view">
          <div class="report-view-meta">
            <span class="badge-status ${data.status}">${data.status}</span>
            <span>${typeLabels[data.type] || data.type}</span>
            ${data.period_start ? `<span>📅 ${data.period_start} — ${data.period_end || '...'}</span>` : ''}
          </div>
          ${data.summary ? `<div class="report-view-summary">${escapeHtml(data.summary)}</div>` : ''}
          ${data.revenue || data.expenses ? `
            <div class="report-view-numbers">
              ${data.revenue ? `<div><span>Galii</span><strong>${formatETB(data.revenue)}</strong></div>` : ''}
              ${data.expenses ? `<div><span>Baasii</span><strong>${formatETB(data.expenses)}</strong></div>` : ''}
              ${data.net ? `<div><span>Bu'aa</span><strong>${formatETB(data.net)}</strong></div>` : ''}
            </div>` : ''}
          ${highlights.length ? `
            <div class="report-view-highlights">
              <h4>Qabiyyee Ijoo</h4>
              <ul>${highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul>
            </div>` : ''}
          <div class="report-view-content">${escapeHtml(data.content).replace(/\n/g, '<br>')}</div>
        </div>
      `,
      size: 'lg',
      showFooter: true,
      footerHTML: `
        <button class="btn btn-outline" onclick="closeModal()">${tr('modal.close', 'Cufi')}</button>
        <button class="btn btn-primary" onclick="closeModal(); editReport(${data.id})">✏️ Gulaali</button>
      `
    });
  }
};

window.togglePublishReport = async function(id, currentStatus) {
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  const { error } = await db.from('mn_reports').update({
    status: newStatus,
    published_at: newStatus === 'published' ? new Date().toISOString() : null
  }).eq('id', id);
  if (error) return alert('❌ ' + error.message);
  if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), newStatus === 'published' ? 'Published' : 'Draft');
  loadReportsList();
};

window.deleteReport = async function(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu? Kun deebi\'uu hin danda\'u!'))) return;
  const { error } = await db.from('mn_reports').delete().eq('id', id);
  if (error) return alert('❌ ' + error.message);
  if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), 'Balleeffameera');
  loadReportsList();
};

// PREVIEW
async function previewReport(type) {
  try {
    if (type === 'monthly') {
      const value = document.getElementById('reportMonth')?.value;
      if (!value) return;
      const [year, month] = value.split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);

      const { data: donations } = await db.from('mn_donations').select('amount, status, created_at');
      const { data: expenses } = await db.from('mn_expenses').select('amount, created_at');

      const revenue = (donations || []).filter(d => d.status === 'confirmed' && new Date(d.created_at) >= start && new Date(d.created_at) < end).reduce((s, d) => s + Number(d.amount), 0);
      const exp = (expenses || []).filter(e => new Date(e.created_at) >= start && new Date(e.created_at) < end).reduce((s, e) => s + Number(e.amount), 0);

      setText('previewMonthlyRevenue', formatETB(revenue));
      setText('previewMonthlyExpenses', formatETB(exp));
      setText('previewMonthlyNet', formatETB(revenue - exp));
    } else if (type === 'annual') {
      const year = Number(document.getElementById('reportYear')?.value);
      if (!year) return;
      const { data: donations } = await db.from('mn_donations').select('amount, status, donor_phone, created_at');
      const { data: expenses } = await db.from('mn_expenses').select('amount, created_at');

      const yearDonations = (donations || []).filter(d => d.status === 'confirmed' && new Date(d.created_at).getFullYear() === year);
      const yearExpenses = (expenses || []).filter(e => new Date(e.created_at).getFullYear() === year);

      const revenue = yearDonations.reduce((s, d) => s + Number(d.amount), 0);
      const exp = yearExpenses.reduce((s, e) => s + Number(e.amount), 0);
      const donors = new Set(yearDonations.map(d => d.donor_phone)).size;

      setText('previewAnnualRevenue', formatETB(revenue));
      setText('previewAnnualExpenses', formatETB(exp));
      setText('previewAnnualDonors', donors);
    } else if (type === 'audit') {
      const { data: donations } = await db.from('mn_donations').select('status');
      const { data: logs } = await db.from('mn_activity_log').select('id');
      setText('previewAuditConfirmed', (donations || []).filter(d => d.status === 'confirmed').length);
      setText('previewAuditPending', (donations || []).filter(d => d.status === 'pending').length);
      setText('previewAuditLogs', (logs || []).length);
    }
  } catch (err) { console.warn(err); }
}

window.generateReport = async function(type, format) {
  const msg = document.getElementById('reportMsg');
  if (!msg) return;
  msg.className = 'form-message';
  msg.textContent = '⏳ Gabaasa uumaa jira...';
  msg.className = 'form-message success';

  try {
    if (format === 'pdf') await generatePDFReport(type);
    else if (format === 'excel') await generateExcelReport(type);
    msg.textContent = `✅ ${format.toUpperCase()} milkaa'inaan buufameera!`;
    if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), 'Gabaasni uumameera');
  } catch (err) {
    console.error(err);
    msg.textContent = '❌ ' + err.message;
    msg.className = 'form-message error';
  }
};

async function generatePDFReport(type) {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) throw new Error('PDF library hin fe\'amne');
  const doc = new jsPDF();
  const now = new Date();

  doc.setFillColor(13, 59, 46);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Malka Noonoo', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${type.toUpperCase()} Report`, 14, 26);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Guyyaa: ${now.toLocaleDateString()}`, 14, 50);

  if (type === 'monthly') {
    const value = document.getElementById('reportMonth')?.value || '';
    const [year, month] = value.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const { data: donations } = await db.from('mn_donations').select('*').eq('status', 'confirmed').gte('created_at', start.toISOString()).lt('created_at', end.toISOString()).order('created_at');
    const { data: expenses } = await db.from('mn_expenses').select('*').gte('created_at', start.toISOString()).lt('created_at', end.toISOString()).order('created_at');

    const revenue = (donations || []).reduce((s, d) => s + Number(d.amount), 0);
    const exp = (expenses || []).reduce((s, e) => s + Number(e.amount), 0);

    doc.text(`Ji'a: ${value}`, 14, 58);

    doc.autoTable({
      startY: 68,
      head: [['Ramaddii', 'Gatii']],
      body: [['Galii', formatETB(revenue)], ['Baasii', formatETB(exp)], ['Bu\'aa Qulqulluu', formatETB(revenue - exp)]],
      headStyles: { fillColor: [26, 107, 79] }
    });

    if (donations?.length) {
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Guyyaa', 'Maqaa', 'Gumaacha']],
        body: donations.map(d => [new Date(d.created_at).toLocaleDateString(), d.donor_name || 'Anonymous', formatETB(d.amount)]),
        headStyles: { fillColor: [26, 107, 79] }, styles: { fontSize: 9 }
      });
    }

    doc.save(`Malka-Noonoo-Monthly-${value}.pdf`);
  } else if (type === 'annual') {
    const year = Number(document.getElementById('reportYear')?.value);
    const { data: donations } = await db.from('mn_donations').select('*').eq('status', 'confirmed').gte('created_at', `${year}-01-01`).lte('created_at', `${year}-12-31`).order('created_at');
    const { data: expenses } = await db.from('mn_expenses').select('*').gte('created_at', `${year}-01-01`).lte('created_at', `${year}-12-31`).order('created_at');

    const revenue = (donations || []).reduce((s, d) => s + Number(d.amount), 0);
    const exp = (expenses || []).reduce((s, e) => s + Number(e.amount), 0);
    const donors = new Set((donations || []).map(d => d.donor_phone)).size;

    doc.text(`Waggaa: ${year}`, 14, 58);
    doc.autoTable({
      startY: 68,
      head: [['Ramaddii', 'Gatii']],
      body: [['Galii Waggaa', formatETB(revenue)], ['Baasii Waggaa', formatETB(exp)], ['Bu\'aa Qulqulluu', formatETB(revenue - exp)], ['Gumaachitoota', String(donors)]],
      headStyles: { fillColor: [26, 107, 79] }
    });
    doc.save(`Malka-Noonoo-Annual-${year}.pdf`);
  } else if (type === 'audit') {
    const { data: logs } = await db.from('mn_activity_log').select('*').order('created_at', { ascending: false }).limit(500);
    const { data: donations } = await db.from('mn_donations').select('status');

    doc.autoTable({
      startY: 68,
      head: [['Ramaddii', 'Baay\'ina']],
      body: [
        ['Gumaacha Mirkanaa\'e', String((donations || []).filter(d => d.status === 'confirmed').length)],
        ['Pending', String((donations || []).filter(d => d.status === 'pending').length)],
        ['Failed', String((donations || []).filter(d => d.status === 'failed').length)],
        ['Sochii Logs', String(logs?.length || 0)]
      ],
      headStyles: { fillColor: [26, 107, 79] }
    });

    if (logs?.length) {
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Guyyaa', 'Actor', 'Sochii', 'Action']],
        body: logs.slice(0, 100).map(l => [new Date(l.created_at).toLocaleDateString(), l.user_email || 'system', l.type || '—', l.action || '—']),
        headStyles: { fillColor: [26, 107, 79] }, styles: { fontSize: 8 }
      });
    }
    doc.save(`Malka-Noonoo-Audit-${Date.now()}.pdf`);
  } else if (type === 'custom') {
    const from = document.getElementById('reportDateFrom')?.value;
    const to = document.getElementById('reportDateTo')?.value;
    if (!from || !to) throw new Error('Guyyaa filadhu');

    const { data: donations } = await db.from('mn_donations').select('*').eq('status', 'confirmed').gte('created_at', from).lte('created_at', to + 'T23:59:59');
    const { data: expenses } = await db.from('mn_expenses').select('*').gte('created_at', from).lte('created_at', to + 'T23:59:59');

    const revenue = (donations || []).reduce((s, d) => s + Number(d.amount), 0);
    const exp = (expenses || []).reduce((s, e) => s + Number(e.amount), 0);

    doc.text(`Guyyaa: ${from} — ${to}`, 14, 58);
    doc.autoTable({
      startY: 68,
      head: [['Ramaddii', 'Gatii']],
      body: [['Galii', formatETB(revenue)], ['Baasii', formatETB(exp)], ['Bu\'aa Qulqulluu', formatETB(revenue - exp)]],
      headStyles: { fillColor: [26, 107, 79] }
    });
    doc.save(`Malka-Noonoo-Custom-${from}-${to}.pdf`);
  }
}

async function generateExcelReport(type) {
  if (typeof XLSX === 'undefined') throw new Error('Excel library hin fe\'amne');
  const wb = XLSX.utils.book_new();

  if (type === 'monthly') {
    const value = document.getElementById('reportMonth')?.value || '';
    const [year, month] = value.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const { data: donations } = await db.from('mn_donations').select('*').eq('status', 'confirmed').gte('created_at', start.toISOString()).lt('created_at', end.toISOString());
    const { data: expenses } = await db.from('mn_expenses').select('*').gte('created_at', start.toISOString()).lt('created_at', end.toISOString());

    const ws1 = XLSX.utils.json_to_sheet((donations || []).map(d => ({ Guyyaa: new Date(d.created_at).toLocaleDateString(), Maqaa: d.donor_name || 'Anonymous', Gumaacha: d.amount })));
    const ws2 = XLSX.utils.json_to_sheet((expenses || []).map(e => ({ Guyyaa: new Date(e.created_at).toLocaleDateString(), Ramaddii: e.category, Baasii: e.amount })));

    XLSX.utils.book_append_sheet(wb, ws1, 'Gumaacha');
    XLSX.utils.book_append_sheet(wb, ws2, 'Baasii');
    XLSX.writeFile(wb, `Malka-Noonoo-Monthly-${value}.xlsx`);
  } else if (type === 'annual') {
    const year = Number(document.getElementById('reportYear')?.value);
    const { data: donations } = await db.from('mn_donations').select('*').eq('status', 'confirmed').gte('created_at', `${year}-01-01`).lte('created_at', `${year}-12-31`);
    const { data: expenses } = await db.from('mn_expenses').select('*').gte('created_at', `${year}-01-01`).lte('created_at', `${year}-12-31`);

    const ws1 = XLSX.utils.json_to_sheet((donations || []).map(d => ({ Guyyaa: new Date(d.created_at).toLocaleDateString(), Maqaa: d.donor_name || 'Anonymous', Gumaacha: d.amount })));
    const ws2 = XLSX.utils.json_to_sheet((expenses || []).map(e => ({ Guyyaa: new Date(e.created_at).toLocaleDateString(), Ramaddii: e.category, Baasii: e.amount })));

    XLSX.utils.book_append_sheet(wb, ws1, 'Gumaacha');
    XLSX.utils.book_append_sheet(wb, ws2, 'Baasii');
    XLSX.writeFile(wb, `Malka-Noonoo-Annual-${year}.xlsx`);
  } else if (type === 'audit') {
    const { data: logs } = await db.from('mn_activity_log').select('*').order('created_at', { ascending: false }).limit(500);
    const ws = XLSX.utils.json_to_sheet((logs || []).map(l => ({ Guyyaa: new Date(l.created_at).toLocaleString(), Actor: l.user_email || 'system', Type: l.type || '—', Action: l.action || '—', Ibsa: l.description || '—' })));
    XLSX.utils.book_append_sheet(wb, ws, 'Audit');
    XLSX.writeFile(wb, `Malka-Noonoo-Audit-${Date.now()}.xlsx`);
  } else if (type === 'custom') {
    const from = document.getElementById('reportDateFrom')?.value;
    const to = document.getElementById('reportDateTo')?.value;
    if (!from || !to) throw new Error('Guyyaa filadhu');
    const { data: donations } = await db.from('mn_donations').select('*').eq('status', 'confirmed').gte('created_at', from).lte('created_at', to + 'T23:59:59');
    const { data: expenses } = await db.from('mn_expenses').select('*').gte('created_at', from).lte('created_at', to + 'T23:59:59');

    const ws1 = XLSX.utils.json_to_sheet((donations || []).map(d => ({ Guyyaa: new Date(d.created_at).toLocaleDateString(), Maqaa: d.donor_name || 'Anonymous', Gumaacha: d.amount })));
    const ws2 = XLSX.utils.json_to_sheet((expenses || []).map(e => ({ Guyyaa: new Date(e.created_at).toLocaleDateString(), Ramaddii: e.category, Baasii: e.amount })));

    XLSX.utils.book_append_sheet(wb, ws1, 'Gumaacha');
    XLSX.utils.book_append_sheet(wb, ws2, 'Baasii');
    XLSX.writeFile(wb, `Malka-Noonoo-Custom-${from}-${to}.xlsx`);
  }
}

// ============================================
// ACTIVITY
// ============================================
async function loadActivity() {
  const type = document.getElementById('activityType')?.value || '';
  let query = db.from('mn_activity_log').select('*').order('created_at', { ascending: false }).limit(200);
  if (type) query = query.eq('type', type);
  const { data } = await query;
  const tb = document.querySelector('#activityTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="5" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }
  tb.innerHTML = data.map((a, i) => `
    <tr><td>${i + 1}</td><td>${new Date(a.created_at).toLocaleString('om-ET')}</td>
    <td>${a.user_email}</td><td>${a.type} — ${a.action}</td><td>${a.description || '—'}</td></tr>
  `).join('');
}

async function logActivity(type, action, description) {
  try {
    const { data: { session } } = await db.auth.getSession();
    await db.from('mn_activity_log').insert([{
      user_email: session?.user?.email || 'system', type, action, description
    }]);
  } catch (err) {}
}

// ============================================
// ANNOUNCEMENTS / NEWS
// ============================================
async function loadAnnouncements() {
  const { data } = await db.from('mn_announcements').select('*').order('created_at', { ascending: false });
  const tb = document.querySelector('#announcementsTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="6" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }
  tb.innerHTML = data.map((a, i) => `
    <tr><td>${i + 1}</td><td>${a.title}</td>
    <td>${(a.body || '').substring(0, 50)}...</td>
    <td>${a.is_public ? '✅' : '❌'}</td>
    <td>${new Date(a.created_at).toLocaleDateString('om-ET')}</td>
    <td><button class="btn-icon danger" onclick="deleteAnnouncement(${a.id})">🗑</button></td></tr>
  `).join('');
}

function setupAnnouncementForm() {
  document.getElementById('addAnnouncementForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('announcementMsg');
    const ann = { title: fd.get('title'), body: fd.get('body') || null, is_public: fd.get('is_public') === 'on' };
    const { error } = await db.from('mn_announcements').insert([ann]);
    if (error) { msg.textContent = '❌ ' + error.message; msg.className = 'form-message error'; return; }
    msg.textContent = '✅ ' + tr('toast.save.success', 'Maxxanfameera!');
    msg.className = 'form-message success';
    e.target.reset();
    await logActivity('announcement', 'created', ann.title);
    loadAnnouncements(); updateBadges();
  });
}

async function deleteAnnouncement(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_announcements').delete().eq('id', id);
  loadAnnouncements(); updateBadges();
}

async function loadNews() {
  const { data } = await db.from('mn_announcements').select('*').order('created_at', { ascending: false });
  dashState.allNews = data || [];
  const tb = document.querySelector('#newsTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="6" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }
  tb.innerHTML = data.map((n, i) => `
    <tr><td>${i + 1}</td><td>${n.title}</td><td>${n.category || 'announcement'}</td>
    <td>${n.is_public ? '✅' : '❌'}</td>
    <td>${new Date(n.created_at).toLocaleDateString('om-ET')}</td>
    <td><a href="news.html" class="btn-icon" target="_blank">👁</a>
    <button class="btn-icon danger" onclick="deleteNews(${n.id})">🗑</button></td></tr>
  `).join('');
}

function setupNewsForm() {
  document.getElementById('addNewsForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('newsMsg');
    const news = { title: fd.get('title'), body: fd.get('body'), category: fd.get('category'), is_public: fd.get('is_public') === 'on' };
    const { error } = await db.from('mn_announcements').insert([news]);
    if (error) { msg.textContent = '❌ ' + error.message; msg.className = 'form-message error'; return; }
    msg.textContent = '✅ ' + tr('toast.save.success', 'Maxxanfameera!');
    msg.className = 'form-message success';
    e.target.reset();
    loadNews();
  });
}

async function deleteNews(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_announcements').delete().eq('id', id);
  loadNews(); updateBadges();
}

// ============================================
// COMMENTS
// ============================================
async function loadComments() {
  const filter = document.getElementById('commentFilter')?.value || 'pending';
  let query = db.from('mn_news_comments').select('*').order('created_at', { ascending: false });
  if (filter !== 'all') query = query.eq('status', filter);
  const { data } = await query;
  const tb = document.querySelector('#commentsTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="7" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }

  tb.innerHTML = data.map((c, i) => `
    <tr><td>${i + 1}</td><td>${c.author_name || '—'}</td><td>${c.author_email || '—'}</td>
    <td title="${c.content}">${(c.content || '').substring(0, 50)}...</td>
    <td><a href="news.html" target="_blank">#${c.news_id}</a></td>
    <td>${new Date(c.created_at).toLocaleDateString('om-ET')}</td>
    <td>
      ${c.status === 'pending' ? `
        <button class="btn-icon success" onclick="approveComment(${c.id})">✓</button>
        <button class="btn-icon danger" onclick="rejectComment(${c.id})">✗</button>
      ` : ''}
      <button class="btn-icon danger" onclick="deleteComment(${c.id})">🗑</button>
    </td></tr>
  `).join('');
}

window.approveComment = async function(id) {
  await db.from('mn_news_comments').update({ status: 'approved' }).eq('id', id);
  if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), 'Approved');
  loadComments(); updateBadges();
};

window.rejectComment = async function(id) {
  await db.from('mn_news_comments').update({ status: 'rejected' }).eq('id', id);
  loadComments(); updateBadges();
};

window.deleteComment = async function(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_news_comments').delete().eq('id', id);
  loadComments(); updateBadges();
};

// ============================================
// GALLERY
// ============================================
async function loadGallery() {
  const { data } = await db.from('mn_gallery').select('*').order('display_order');
  const tb = document.querySelector('#galleryTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="5" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }
  tb.innerHTML = data.map((g, i) => `
    <tr><td>${i + 1}</td>
    <td><img src="${g.image_url}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 6px;" onerror="this.style.display='none'" /></td>
    <td>${g.title}</td><td>${g.category}</td>
    <td><button class="btn-icon danger" onclick="deleteGalleryItem(${g.id})">🗑</button></td></tr>
  `).join('');
}

function setupGalleryForm() {
  document.getElementById('addGalleryForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('galleryMsg');
    const item = { title: fd.get('title'), image_url: fd.get('image_url'), description: fd.get('description') || null, category: fd.get('category') };
    const { error } = await db.from('mn_gallery').insert([item]);
    if (error) { msg.textContent = '❌ ' + error.message; msg.className = 'form-message error'; return; }
    msg.textContent = '✅ ' + tr('toast.save.success', 'Dabalameera!');
    msg.className = 'form-message success';
    e.target.reset();
    loadGallery();
  });
}

window.deleteGalleryItem = async function(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_gallery').delete().eq('id', id);
  loadGallery();
};

// ============================================
// MASJIDOS
// ============================================
async function loadMasjidos() {
  const { data } = await db.from('mn_masjidos').select('*').order('name');
  const tb = document.querySelector('#masjidosTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="6" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }
  tb.innerHTML = data.map((m, i) => `
    <tr><td>${i + 1}</td><td>${m.name}</td><td>${m.woreda}</td>
    <td>${m.kebele || '—'}</td><td>${m.member_count || 0}</td>
    <td><button class="btn-icon danger" onclick="deleteMasjid(${m.id})">🗑</button></td></tr>
  `).join('');
}

function setupMasjidForm() {
  document.getElementById('addMasjidForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('masjidMsg');
    const masjid = { name: fd.get('name'), woreda: fd.get('woreda'), kebele: fd.get('kebele') || null, member_count: Number(fd.get('member_count')) || 0 };
    const { error } = await db.from('mn_masjidos').insert([masjid]);
    if (error) { msg.textContent = '❌ ' + error.message; msg.className = 'form-message error'; return; }
    msg.textContent = '✅ ' + tr('toast.save.success', 'Dabalameera!');
    msg.className = 'form-message success';
    e.target.reset();
    loadMasjidos();
  });
}

async function deleteMasjid(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_masjidos').delete().eq('id', id);
  loadMasjidos();
}

// ============================================
// TEAM
// ============================================
async function loadTeam() {
  const { data } = await db.from('mn_team_members').select('*').order('display_order');
  const tb = document.querySelector('#teamTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="6" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }
  tb.innerHTML = data.map((t, i) => `
    <tr><td>${i + 1}</td><td>${t.name}</td><td>${t.role}</td>
    <td>${t.category}</td><td>${t.phone || '—'}</td>
    <td><button class="btn-icon danger" onclick="deleteTeamMember(${t.id})">🗑</button></td></tr>
  `).join('');
}

function setupTeamForm() {
  document.getElementById('addTeamForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('teamMsg');
    const name = fd.get('name');
    const team = {
      name, role: fd.get('role'),
      initials: fd.get('initials') || name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      phone: fd.get('phone') || null, email: fd.get('email') || null,
      category: fd.get('category'), display_order: 0
    };
    const { error } = await db.from('mn_team_members').insert([team]);
    if (error) { msg.textContent = '❌ ' + error.message; msg.className = 'form-message error'; return; }
    msg.textContent = '✅ ' + tr('toast.save.success', 'Dabalameera!');
    msg.className = 'form-message success';
    e.target.reset();
    loadTeam();
  });
}

window.deleteTeamMember = async function(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_team_members').delete().eq('id', id);
  loadTeam();
};

// ============================================
// VOLUNTEERS
// ============================================
async function loadVolunteers() {
  const filter = document.getElementById('volunteerFilter')?.value || 'pending';
  let query = db.from('mn_volunteers').select('*').order('created_at', { ascending: false });
  if (filter !== 'all') query = query.eq('status', filter);
  const { data } = await query;
  const tb = document.querySelector('#volunteersTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="8" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }
  tb.innerHTML = data.map((v, i) => `
    <tr><td>${i + 1}</td><td>${v.name}</td><td>${v.phone || '—'}</td>
    <td>${v.woreda || '—'}</td><td>${v.role || '—'}</td><td>${v.hours || '—'}</td>
    <td>${badge(v.status)}</td>
    <td>
      ${v.status === 'pending' ? `
        <button class="btn-icon success" onclick="approveVolunteer(${v.id})">✓</button>
        <button class="btn-icon danger" onclick="rejectVolunteer(${v.id})">✗</button>
      ` : ''}
      <button class="btn-icon danger" onclick="deleteVolunteer(${v.id})">🗑</button>
    </td></tr>
  `).join('');
}

window.approveVolunteer = async function(id) {
  await db.from('mn_volunteers').update({ status: 'approved' }).eq('id', id);
  if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), 'Approved');
  loadVolunteers(); updateBadges();
};

window.rejectVolunteer = async function(id) {
  await db.from('mn_volunteers').update({ status: 'rejected' }).eq('id', id);
  loadVolunteers(); updateBadges();
};

window.deleteVolunteer = async function(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_volunteers').delete().eq('id', id);
  loadVolunteers(); updateBadges();
};

// ============================================
// MILESTONES
// ============================================
async function loadMilestones() {
  const { data } = await db.from('mn_project_milestones').select('*').order('id');
  const tb = document.querySelector('#milestonesTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="7" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }
  tb.innerHTML = data.map((m, i) => {
    const pct = ((m.current_amount || 0) / (m.target_amount || 1) * 100).toFixed(1);
    return `
      <tr><td>${i + 1}</td><td>${m.title}</td>
      <td>${formatETB(m.target_amount)}</td>
      <td>${formatETB(m.current_amount)}</td>
      <td>${pct}%</td><td>${badge(m.status)}</td>
      <td>
        <button class="btn-icon success" onclick="updateMilestone(${m.id}, ${m.current_amount})">✏️</button>
        <button class="btn-icon danger" onclick="deleteMilestone(${m.id})">🗑</button>
      </td></tr>`;
  }).join('');
}

function setupMilestoneForm() {
  document.getElementById('addMilestoneForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('milestoneMsg');
    const ms = {
      title: fd.get('title'), description: fd.get('description') || null,
      target_amount: Number(fd.get('target_amount')),
      current_amount: Number(fd.get('current_amount')) || 0,
      status: fd.get('status') || 'pending'
    };
    const { error } = await db.from('mn_project_milestones').insert([ms]);
    if (error) { msg.textContent = '❌ ' + error.message; msg.className = 'form-message error'; return; }
    msg.textContent = '✅ ' + tr('toast.save.success', 'Dabalameera!');
    msg.className = 'form-message success';
    e.target.reset();
    loadMilestones();
  });
}

window.updateMilestone = async function(id, current) {
  const n = prompt('Raawwii haaraa (ETB):', current);
  if (n === null) return;
  await db.from('mn_project_milestones').update({ current_amount: Number(n) }).eq('id', id);
  if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), 'Haaromfameera');
  loadMilestones();
};

window.deleteMilestone = async function(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_project_milestones').delete().eq('id', id);
  loadMilestones();
};

// ============================================
// MESSAGES
// ============================================
async function loadMessages() {
  const filter = document.getElementById('messageFilter')?.value || 'new';
  let query = db.from('mn_contact_messages').select('*').order('created_at', { ascending: false });
  if (filter !== 'all') query = query.eq('status', filter);
  const { data } = await query;
  const tb = document.querySelector('#messagesTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="7" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }
  tb.innerHTML = data.map((m, i) => `
    <tr><td>${i + 1}</td><td>${m.name}</td><td>${m.phone || '—'}</td>
    <td title="${m.message}">${(m.message || '').substring(0, 50)}...</td>
    <td>${badge(m.status)}</td><td>${new Date(m.created_at).toLocaleDateString('om-ET')}</td>
    <td>
      <button class="btn-icon" onclick="viewMessage(${m.id})">👁</button>
      <button class="btn-icon danger" onclick="deleteMessage(${m.id})">🗑</button>
    </td></tr>
  `).join('');
}

window.viewMessage = async function(id) {
  const { data } = await db.from('mn_contact_messages').select('*').eq('id', id).single();
  if (!data) return;
  if (window.openModal) {
    openModal({
      title: `✉️ ${data.name}`,
      body: `
        <p><strong>${tr('table.phone', 'Bilbila')}:</strong> ${data.phone || '—'}</p>
        <p><strong>${tr('table.email', 'Imeelii')}:</strong> ${data.email || '—'}</p>
        <p><strong>${tr('table.date', 'Guyyaa')}:</strong> ${new Date(data.created_at).toLocaleString('om-ET')}</p>
        <hr style="margin: 12px 0; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="white-space: pre-wrap;">${data.message}</p>
      `,
      size: 'md', showFooter: true,
      footerHTML: `<button class="btn btn-primary" onclick="closeModal()">${tr('modal.close', 'Cufi')}</button>`
    });
  }
  if (data.status === 'new') {
    await db.from('mn_contact_messages').update({ status: 'read' }).eq('id', id);
    loadMessages(); updateBadges();
  }
};

window.deleteMessage = async function(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_contact_messages').delete().eq('id', id);
  loadMessages(); updateBadges();
};

// ============================================
// FAQS
// ============================================
async function loadFaqs() {
  const { data } = await db.from('mn_faqs').select('*').order('display_order');
  const tb = document.querySelector('#faqTable tbody');
  if (!tb) return;
  if (!data?.length) { tb.innerHTML = `<tr><td colspan="4" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`; return; }
  tb.innerHTML = data.map((f, i) => `
    <tr><td>${i + 1}</td><td>${f.question}</td><td>${f.category}</td>
    <td><button class="btn-icon danger" onclick="deleteFaq(${f.id})">🗑</button></td></tr>
  `).join('');
}

function setupFaqForm() {
  document.getElementById('addFaqForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('faqMsg');
    const faq = { question: fd.get('question'), answer: fd.get('answer'), category: fd.get('category') };
    const { error } = await db.from('mn_faqs').insert([faq]);
    if (error) { msg.textContent = '❌ ' + error.message; msg.className = 'form-message error'; return; }
    msg.textContent = '✅ ' + tr('toast.save.success', 'Dabalameera!');
    msg.className = 'form-message success';
    e.target.reset();
    loadFaqs();
  });
}

window.deleteFaq = async function(id) {
  if (!confirm(tr('modal.delete.confirm', 'Balleessuu?'))) return;
  await db.from('mn_faqs').delete().eq('id', id);
  loadFaqs();
};

// ============================================
// SETTINGS
// ============================================
async function loadSettings() {
  const { data } = await db.from('mn_site_settings').select('*').order('key');
  const form = document.getElementById('settingsForm');
  if (!form) return;
  if (!data?.length) { form.innerHTML = `<p class="text-muted">${tr('empty.generic', 'Settings hin jiru.')}</p>`; return; }
  form.innerHTML = `
    <div class="stack-form">
      ${data.map(s => `
        <div class="form-row">
          <label>${s.description || s.key}</label>
          ${s.type === 'html' ? `<textarea name="${s.key}" rows="3">${s.value || ''}</textarea>`
                              : `<input type="text" name="${s.key}" value="${s.value || ''}" />`}
        </div>
      `).join('')}
      <button type="button" class="btn btn-primary" onclick="saveSettings()">💾 Save</button>
      <div id="settingsMsg" class="form-message"></div>
    </div>`;
}

window.saveSettings = async function() {
  const form = document.getElementById('settingsForm');
  const inputs = form.querySelectorAll('input, textarea');
  const msg = document.getElementById('settingsMsg');
  let saved = 0;
  for (const input of inputs) {
    const { error } = await db.from('mn_site_settings')
      .update({ value: input.value, updated_at: new Date().toISOString() })
      .eq('key', input.name);
    if (!error) saved++;
  }
  msg.textContent = `✅ ${saved} settings saved!`;
  msg.className = 'form-message success';
  if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), `${saved} settings olkaa'ameera`);
};

// ============================================
// FILTER LISTENERS
// ============================================
function setupFilterListeners() {
  document.addEventListener('change', (e) => {
    if (e.target.id === 'commentFilter') loadComments();
    if (e.target.id === 'volunteerFilter') loadVolunteers();
    if (e.target.id === 'messageFilter') loadMessages();
    if (e.target.id === 'activityType') loadActivity();
    if (e.target.id === 'reportListFilter') loadReportsList();
  });
}

// ============================================
// LOGOUT / LANGUAGE / MOBILE / THEME
// ============================================
function setupLogout() {
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    if (!confirm(tr('modal.confirm', 'Dhuguma ba\'uu barbaadda?'))) return;
    await db.auth.signOut();
    window.location.href = 'login.html';
  });
}

function setupLanguageSync() {
  window.addEventListener('languageChanged', () => {
    console.log('🌐 Dashboard language changed');
    const active = document.querySelector('.dash-nav a.active');
    if (active) {
      const span = active.querySelector('span[data-i18n]');
      const titleEl = document.getElementById('dashTitle');
      if (titleEl && span) {
        titleEl.dataset.i18n = span.dataset.i18n;
        titleEl.textContent = tr(span.dataset.i18n, span.textContent);
      }
    }
    loadOverview();
    const currentTab = document.querySelector('.dash-nav a.active')?.dataset.tab;
    if (currentTab && currentTab !== 'overview') loadTab(currentTab);

    if (typeof applyTranslations === 'function') applyTranslations();
  });
}

function setupMobileMenu() {
  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    document.getElementById('dashSidebar')?.classList.toggle('open');
  });
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('dashSidebar')?.classList.toggle('open');
  });
}

function setupThemeToggle() {
  const btn = document.getElementById('dashThemeToggle');
  if (!btn) return;
  const updateIcon = () => {
    const theme = document.documentElement.getAttribute('data-theme');
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  };
  updateIcon();
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mn_theme', next);
    updateIcon();
  });
}

// ============================================
// EXPORTS
// ============================================
window.exportDonationsPDF = function() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) return alert('PDF hin fe\'amne');
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text('Malka Noonoo — Gumaachitoota', 14, 15);
  doc.setFontSize(10);
  doc.text(`Guyyaa: ${new Date().toLocaleDateString()}`, 14, 22);

  const rows = dashState.allDonations.map((d, i) => [i + 1, d.donor_name || '—', d.donor_phone || '—', d.tier || '—', formatETB(d.amount), d.payment_method || '—', d.status, new Date(d.created_at).toLocaleDateString('om-ET')]);
  doc.autoTable({
    head: [['#', 'Maqaa', 'Bilbila', 'Sadarkaa', 'Gumaacha', 'Mala', 'Haala', 'Guyyaa']],
    body: rows, startY: 28, styles: { fontSize: 8 },
    headStyles: { fillColor: [26, 107, 79] }
  });
  doc.save(`Malka-Noonoo-Donations-${Date.now()}.pdf`);
};

window.exportDonationsExcel = function() {
  if (typeof XLSX === 'undefined') return alert('Excel hin fe\'amne');
  const data = dashState.allDonations.map((d, i) => ({
    '#': i + 1, Maqaa: d.donor_name || '', Bilbila: d.donor_phone || '',
    Imeelii: d.donor_email || '', Sadarkaa: d.tier || '', Gumaacha: d.amount,
    Mala: d.payment_method || '', Haala: d.status,
    Guyyaa: new Date(d.created_at).toLocaleDateString('om-ET')
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Donations');
  XLSX.writeFile(wb, `Malka-Noonoo-Donations-${Date.now()}.xlsx`);
};

// ============================================
// HELPERS
// ============================================
function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function badge(s) { return `<span class="badge-status ${s}">${s}</span>`; }
function escapeHtml(str) { return String(str || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function getLast6Months() {
  const months = []; const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleDateString('om-ET', { month: 'short' }) });
  }
  return months;
}

// GLOBAL EXPORTS
window.confirmDonation = confirmDonation;
window.deleteDonation = deleteDonation;
window.deleteExpense = deleteExpense;
window.deleteAsset = deleteAsset;
window.deleteRental = deleteRental;
window.deleteMasjid = deleteMasjid;
window.deleteAnnouncement = deleteAnnouncement;
window.deleteNews = deleteNews;
window.loadTab = loadTab;
window.updateBadges = updateBadges;
window.previewReport = previewReport;