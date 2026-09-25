// ============================================
// DASHBOARD.JS — Malka Noonoo
// Full Dashboard Logic
// ============================================

// ============================================
// 1. STATE
// ============================================
const dashState = {
  charts: { revenue: null, tiers: null, expenses: null },
  allDonations: [],
  selectedDonationIds: new Set(),
  initialized: false
};

// ============================================
// 2. INIT
// ============================================
document.addEventListener('DOMContentLoaded', initDashboard);

async function initDashboard() {
  console.log('🚀 Dashboard initializing...');

  if (dashState.initialized) return;
  dashState.initialized = true;

  try {
    // Session check
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
      console.warn('⚠️ No session — redirecting to login');
      window.location.href = 'login.html';
      return;
    }

    console.log('✅ Session:', session.user.email);
    setText('dashUser', session.user.email);

    // Profile check
    await checkProfile(session.user.id);

    // Setup
    setupTabs();
    setupDonationFilters();
    setupExpenseForm();
    setupAssetForm();
    setupRentalForm();
    setupMasjidForm();
    setupAnnouncementForm();
    setupLogout();
    setupLanguageSync();

    // Initial load
    await loadOverview();

  } catch (err) {
    console.error('❌ Dashboard init error:', err);
    if (window.toast) toast.error('Dogoggora', 'Daashboordii banuu hin dandeessisu.');
  }
}

// ============================================
// 3. CHECK PROFILE
// ============================================
async function checkProfile(userId) {
  const { data: profile, error } = await db
    .from('mn_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) console.error('Profile error:', error);

  if (!profile) {
    console.warn('⚠️ Creating default admin profile...');
    await db.from('mn_profiles').insert([{
      id: userId,
      full_name: 'Admin',
      role: 'admin'
    }]);
  } else {
    console.log('👤 Profile:', profile.role);
  }
}

// ============================================
// 4. TABS
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

      const titleKey = link.querySelector('span:last-child')?.dataset.i18n || 'dash.title';
      const titleEl = document.getElementById('dashTitle');
      if (titleEl) {
        titleEl.dataset.i18n = titleKey;
        titleEl.textContent = t(titleKey);
      }

      loadTab(tab);
    });
  });
}

async function loadTab(tab) {
  console.log('📂 Loading tab:', tab);
  const loaders = {
    overview: loadOverview,
    donations: loadDonations,
    expenses: loadExpenses,
    assets: loadAssets,
    rentals: loadRentals,
    masjidos: loadMasjidos,
    announcements: loadAnnouncements,
    activity: loadActivity
  };
  if (loaders[tab]) await loaders[tab]();
}

// ============================================
// 5. OVERVIEW
// ============================================
async function loadOverview() {
  try {
    // Donations
    const { data: donations } = await db
      .from('mn_donations')
      .select('amount, donor_phone, tier, created_at, status');

    const confirmed = (donations || []).filter(d => d.status === 'confirmed');
    const raised = confirmed.reduce((s, d) => s + Number(d.amount), 0);
    const pct = percent(raised, PROJECT_GOAL);
    const donors = new Set(confirmed.map(d => d.donor_phone)).size;

    setText('kpiRaised', formatETB(raised));
    setText('kpiPercent', pct + '%');
    setText('kpiDonors', donors);

    // Expenses
    const { data: expenses } = await db.from('mn_expenses').select('amount, category');
    const totalExp = (expenses || []).reduce((s, e) => s + Number(e.amount), 0);
    setText('kpiExpenses', formatETB(totalExp));

    // Assets
    const { data: assets } = await db.from('mn_assets').select('id');
    setText('kpiAssets', (assets || []).length);

    // Charts
    renderRevenueChart(confirmed);
    renderTiersChart(confirmed);
    renderExpensesChart(expenses || []);

    console.log('✅ Overview loaded');
  } catch (err) {
    console.error('❌ Overview error:', err);
  }
}

// ---------- Revenue Chart ----------
function renderRevenueChart(donations) {
  const months = getLast6Months();
  const totals = months.map(m =>
    donations
      .filter(d => {
        const dt = new Date(d.created_at);
        return dt.getMonth() === m.month && dt.getFullYear() === m.year;
      })
      .reduce((s, d) => s + Number(d.amount), 0)
  );

  const ctx = document.getElementById('revenueChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (dashState.charts.revenue) dashState.charts.revenue.destroy();

  dashState.charts.revenue = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [{
        label: 'Galii',
        data: totals,
        borderColor: '#22a06b',
        backgroundColor: 'rgba(34, 160, 107, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#22a06b',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => formatETB(ctx.parsed.y) } }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: v => v >= 1000000 ? (v / 1000000) + 'M'
                        : v >= 1000 ? (v / 1000) + 'K' : v
          },
          grid: { color: '#f1f5f9' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

// ---------- Tiers Chart ----------
function renderTiersChart(donations) {
  const tiers = ['tier1', 'tier2', 'community', 'masjid', 'business'];
  const labels = ['Sadarkaa 1', 'Sadarkaa 2', 'Hawaasa', 'Masgiidota', 'Daldala'];
  const colors = ['#d4a017', '#22a06b', '#6ee7b7', '#94a3b8', '#64748b'];
  const totals = tiers.map(t =>
    donations.filter(d => d.tier === t).reduce((s, d) => s + Number(d.amount), 0)
  );

  const ctx = document.getElementById('tiersChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (dashState.charts.tiers) dashState.charts.tiers.destroy();

  dashState.charts.tiers = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: totals,
        backgroundColor: colors,
        borderWidth: 3,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8 } },
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + formatETB(ctx.parsed) } }
      }
    }
  });
}

// ---------- Expenses Chart ----------
function renderExpensesChart(expenses) {
  const categories = {};
  expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
  });

  const ctx = document.getElementById('expensesChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (dashState.charts.expenses) dashState.charts.expenses.destroy();

  dashState.charts.expenses = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(categories).length ? Object.keys(categories) : ['—'],
      datasets: [{
        data: Object.values(categories).length ? Object.values(categories) : [0],
        backgroundColor: '#22a06b',
        borderRadius: 8,
        barThickness: 32
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: v => v >= 1000 ? (v / 1000) + 'K' : v },
          grid: { color: '#f1f5f9' }
        },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });
}

// ============================================
// 6. DONATIONS
// ============================================
async function loadDonations() {
  const { data, error } = await db
    .from('mn_donations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) { console.error(error); return; }
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
    const matchesQ = !q || text.includes(q);
    const matchesTier = !tier || d.tier === tier;
    const matchesStatus = !status || d.status === status;
    const dt = new Date(d.created_at).getTime();
    const matchesFrom = !from || dt >= new Date(from).getTime();
    const matchesTo = !to || dt <= new Date(to).getTime() + 86400000;
    return matchesQ && matchesTier && matchesStatus && matchesFrom && matchesTo;
  });

  renderDonationsTable(filtered);
}

function renderDonationsTable(list) {
  const tb = document.querySelector('#donationsTable tbody');
  if (!tb) return;

  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="11" class="loading">${t('table.empty')}</td></tr>`;
    return;
  }

  tb.innerHTML = list.map((d, i) => `
    <tr>
      <td><input type="checkbox" class="don-checkbox" data-id="${d.id}" ${dashState.selectedDonationIds.has(d.id) ? 'checked' : ''} /></td>
      <td>${i + 1}</td>
      <td>${d.donor_name || '—'}</td>
      <td>${d.donor_phone || '—'}</td>
      <td>${d.donor_email || '—'}</td>
      <td>${d.tier || '—'}</td>
      <td><strong>${formatETB(d.amount)}</strong></td>
      <td>${d.payment_method || '—'}</td>
      <td>${badge(d.status)}</td>
      <td>${new Date(d.created_at).toLocaleDateString('om-ET')}</td>
      <td>
        ${d.status === 'pending'
          ? `<button class="btn-icon success" onclick="confirmDonation(${d.id})" title="Confirm">✓</button>`
          : ''}
        <button class="btn-icon danger" onclick="deleteDonation(${d.id})" title="Delete">🗑</button>
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
    const checked = e.target.checked;
    document.querySelectorAll('.don-checkbox').forEach(cb => {
      cb.checked = checked;
      const id = Number(cb.dataset.id);
      if (checked) dashState.selectedDonationIds.add(id);
      else dashState.selectedDonationIds.delete(id);
    });
    updateSelectedCount();
  });

  document.getElementById('bulkConfirmBtn')?.addEventListener('click', bulkConfirm);
}

function updateSelectedCount() {
  const countEl = document.getElementById('donSelectedCount');
  const btn = document.getElementById('bulkConfirmBtn');
  if (countEl) countEl.textContent = `${dashState.selectedDonationIds.size} filatame`;
  if (btn) btn.disabled = dashState.selectedDonationIds.size === 0;
}

async function confirmDonation(id) {
  if (!confirm('Gumaacha kana mirkaneessuu?')) return;
  const { error } = await db.from('mn_donations')
    .update({ status: 'confirmed', payment_ref: 'MANUAL-' + Date.now() })
    .eq('id', id);
  if (error) return alert('❌ ' + error.message);

  await logActivity('donation', 'confirmed', `Donation #${id}`);
  await loadDonations();
  await loadOverview();
  if (window.toast) toast.success('Milkaa\'e', 'Gumaacha mirkanaa\'e');
}

async function deleteDonation(id) {
  if (!confirm('Gumaacha kana balleessuu?')) return;
  const { error } = await db.from('mn_donations').delete().eq('id', id);
  if (error) return alert('❌ ' + error.message);
  await logActivity('donation', 'deleted', `Donation #${id}`);
  await loadDonations();
  await loadOverview();
}

async function bulkConfirm() {
  const ids = Array.from(dashState.selectedDonationIds);
  if (!ids.length) return;
  if (!confirm(`${ids.length} gumaacha mirkaneessuu?`)) return;

  const { error } = await db.from('mn_donations')
    .update({ status: 'confirmed', payment_ref: 'BULK-' + Date.now() })
    .in('id', ids);

  if (error) return alert('❌ ' + error.message);

  await logActivity('donation', 'bulk_confirmed', `${ids.length} donations`);
  dashState.selectedDonationIds.clear();
  updateSelectedCount();
  await loadDonations();
  await loadOverview();
  if (window.toast) toast.success('Milkaa\'e', `${ids.length} gumaacha mirkanaa'an`);
}

// ============================================
// 7. EXPENSES
// ============================================
async function loadExpenses() {
  const { data } = await db.from('mn_expenses')
    .select('*')
    .order('created_at', { ascending: false });

  const tb = document.querySelector('#expensesTable tbody');
  if (!tb) return;

  if (!data?.length) {
    tb.innerHTML = `<tr><td colspan="7" class="loading">${t('table.empty')}</td></tr>`;
    return;
  }

  tb.innerHTML = data.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${e.category}</td>
      <td>${e.description || '—'}</td>
      <td><strong>${formatETB(e.amount)}</strong></td>
      <td>${badge(e.status)}</td>
      <td>${new Date(e.created_at).toLocaleDateString('om-ET')}</td>
      <td><button class="btn-icon danger" onclick="deleteExpense(${e.id})">🗑</button></td>
    </tr>
  `).join('');
}

function setupExpenseForm() {
  document.getElementById('addExpenseForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('expenseMsg');

    const expense = {
      category: fd.get('category'),
      description: fd.get('description') || null,
      amount: Number(fd.get('amount')),
      status: fd.get('status') || 'pending'
    };

    const { error } = await db.from('mn_expenses').insert([expense]);
    if (error) {
      msg.textContent = '❌ ' + error.message;
      msg.className = 'form-message error';
      return;
    }
    msg.textContent = '✅ Baasiin galmeeffameera!';
    msg.className = 'form-message success';
    e.target.reset();
    await logActivity('expense', 'created', `Expense: ${expense.category}`);
    await loadExpenses();
    await loadOverview();
  });
}

async function deleteExpense(id) {
  if (!confirm('Baasii kana balleessuu?')) return;
  const { error } = await db.from('mn_expenses').delete().eq('id', id);
  if (error) return alert('❌ ' + error.message);
  await logActivity('expense', 'deleted', `Expense #${id}`);
  await loadExpenses();
  await loadOverview();
}

// ============================================
// 8. ASSETS
// ============================================
async function loadAssets() {
  const { data } = await db.from('mn_assets')
    .select('*')
    .order('id', { ascending: false });

  const tb = document.querySelector('#assetsTable tbody');
  if (!tb) return;

  if (!data?.length) {
    tb.innerHTML = `<tr><td colspan="7" class="loading">${t('table.empty')}</td></tr>`;
    return;
  }

  tb.innerHTML = data.map((a, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${a.name}</td>
      <td>${a.category || '—'}</td>
      <td>${a.quantity || 1}</td>
      <td>${formatETB(a.purchase_price || 0)}</td>
      <td>${a.purchase_date || '—'}</td>
      <td><button class="btn-icon danger" onclick="deleteAsset(${a.id})">🗑</button></td>
    </tr>
  `).join('');
}

function setupAssetForm() {
  document.getElementById('addAssetForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('assetMsg');

    const asset = {
      name: fd.get('name'),
      category: fd.get('category') || null,
      quantity: Number(fd.get('quantity')) || 1,
      purchase_price: Number(fd.get('purchase_price')) || 0,
      purchase_date: fd.get('purchase_date') || null
    };

    const { error } = await db.from('mn_assets').insert([asset]);
    if (error) {
      msg.textContent = '❌ ' + error.message;
      msg.className = 'form-message error';
      return;
    }
    msg.textContent = '✅ Qabeenyi galmeeffameera!';
    msg.className = 'form-message success';
    e.target.reset();
    await logActivity('asset', 'created', `Asset: ${asset.name}`);
    await loadAssets();
    await loadOverview();
  });
}

async function deleteAsset(id) {
  if (!confirm('Qabeenya kana balleessuu?')) return;
  const { error } = await db.from('mn_assets').delete().eq('id', id);
  if (error) return alert('❌ ' + error.message);
  await logActivity('asset', 'deleted', `Asset #${id}`);
  await loadAssets();
  await loadOverview();
}

// ============================================
// 9. RENTALS
// ============================================
async function loadRentals() {
  const { data } = await db.from('mn_rentals')
    .select('*')
    .order('id', { ascending: false });

  const tb = document.querySelector('#rentalsTable tbody');
  if (!tb) return;

  if (!data?.length) {
    tb.innerHTML = `<tr><td colspan="7" class="loading">${t('table.empty')}</td></tr>`;
    return;
  }

  tb.innerHTML = data.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${r.tenant_name}</td>
      <td>${r.tenant_phone || '—'}</td>
      <td>${r.space_description || '—'}</td>
      <td>${formatETB(r.monthly_rent || 0)}</td>
      <td>${badge(r.status)}</td>
      <td><button class="btn-icon danger" onclick="deleteRental(${r.id})">🗑</button></td>
    </tr>
  `).join('');
}

function setupRentalForm() {
  document.getElementById('addRentalForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('rentalMsg');

    const rental = {
      tenant_name: fd.get('tenant_name'),
      tenant_phone: fd.get('tenant_phone') || null,
      space_description: fd.get('space_description') || null,
      monthly_rent: Number(fd.get('monthly_rent')) || 0,
      start_date: fd.get('start_date') || null,
      status: fd.get('status') || 'active'
    };

    const { error } = await db.from('mn_rentals').insert([rental]);
    if (error) {
      msg.textContent = '❌ ' + error.message;
      msg.className = 'form-message error';
      return;
    }
    msg.textContent = '✅ Kireeffannaan galmeeffameera!';
    msg.className = 'form-message success';
    e.target.reset();
    await logActivity('rental', 'created', `Rental: ${rental.tenant_name}`);
    await loadRentals();
  });
}

async function deleteRental(id) {
  if (!confirm('Kireeffannaa kana balleessuu?')) return;
  const { error } = await db.from('mn_rentals').delete().eq('id', id);
  if (error) return alert('❌ ' + error.message);
  await logActivity('rental', 'deleted', `Rental #${id}`);
  await loadRentals();
}

// ============================================
// 10. MASJIDOS
// ============================================
async function loadMasjidos() {
  const { data } = await db.from('mn_masjidos')
    .select('*')
    .order('name');

  const tb = document.querySelector('#masjidosTable tbody');
  if (!tb) return;

  if (!data?.length) {
    tb.innerHTML = `<tr><td colspan="6" class="loading">${t('table.empty')}</td></tr>`;
    return;
  }

  tb.innerHTML = data.map((m, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${m.name}</td>
      <td>${m.woreda}</td>
      <td>${m.kebele || '—'}</td>
      <td>${m.member_count || 0}</td>
      <td><button class="btn-icon danger" onclick="deleteMasjid(${m.id})">🗑</button></td>
    </tr>
  `).join('');
}

function setupMasjidForm() {
  document.getElementById('addMasjidForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('masjidMsg');

    const masjid = {
      name: fd.get('name'),
      woreda: fd.get('woreda'),
      kebele: fd.get('kebele') || null,
      member_count: Number(fd.get('member_count')) || 0
    };

    const { error } = await db.from('mn_masjidos').insert([masjid]);
    if (error) {
      msg.textContent = '❌ ' + error.message;
      msg.className = 'form-message error';
      return;
    }
    msg.textContent = '✅ Masgiida dabalameera!';
    msg.className = 'form-message success';
    e.target.reset();
    await logActivity('masjid', 'created', `Masjid: ${masjid.name}`);
    await loadMasjidos();
  });
}

async function deleteMasjid(id) {
  if (!confirm('Masgiida kana balleessuu?')) return;
  const { error } = await db.from('mn_masjidos').delete().eq('id', id);
  if (error) return alert('❌ ' + error.message);
  await logActivity('masjid', 'deleted', `Masjid #${id}`);
  await loadMasjidos();
}

// ============================================
// 11. ANNOUNCEMENTS
// ============================================
async function loadAnnouncements() {
  const { data } = await db.from('mn_announcements')
    .select('*')
    .order('created_at', { ascending: false });

  const tb = document.querySelector('#announcementsTable tbody');
  if (!tb) return;

  if (!data?.length) {
    tb.innerHTML = `<tr><td colspan="6" class="loading">${t('table.empty')}</td></tr>`;
    return;
  }

  tb.innerHTML = data.map((a, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${a.title}</td>
      <td>${(a.body || '').substring(0, 50)}${(a.body || '').length > 50 ? '...' : ''}</td>
      <td>${a.is_public ? '✅' : '❌'}</td>
      <td>${new Date(a.created_at).toLocaleDateString('om-ET')}</td>
      <td><button class="btn-icon danger" onclick="deleteAnnouncement(${a.id})">🗑</button></td>
    </tr>
  `).join('');
}

function setupAnnouncementForm() {
  document.getElementById('addAnnouncementForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('announcementMsg');

    const ann = {
      title: fd.get('title'),
      body: fd.get('body') || null,
      is_public: fd.get('is_public') === 'on'
    };

    const { error } = await db.from('mn_announcements').insert([ann]);
    if (error) {
      msg.textContent = '❌ ' + error.message;
      msg.className = 'form-message error';
      return;
    }
    msg.textContent = '✅ Beeksisni maxxanfameera!';
    msg.className = 'form-message success';
    e.target.reset();
    await logActivity('announcement', 'created', `Announcement: ${ann.title}`);
    await loadAnnouncements();
  });
}

async function deleteAnnouncement(id) {
  if (!confirm('Beeksisa kana balleessuu?')) return;
  const { error } = await db.from('mn_announcements').delete().eq('id', id);
  if (error) return alert('❌ ' + error.message);
  await logActivity('announcement', 'deleted', `Announcement #${id}`);
  await loadAnnouncements();
}

// ============================================
// 12. ACTIVITY LOG
// ============================================
async function logActivity(type, action, description) {
  try {
    const { data: { session } } = await db.auth.getSession();
    await db.from('mn_activity_log').insert([{
      user_email: session?.user?.email || 'system',
      type, action, description
    }]);
  } catch (err) {
    console.warn('Activity log error:', err);
  }
}

async function loadActivity() {
  const filterType = document.getElementById('activityType')?.value || '';
  let query = db.from('mn_activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filterType) query = query.eq('type', filterType);
  const { data } = await query;

  const tb = document.querySelector('#activityTable tbody');
  if (!tb) return;

  if (!data?.length) {
    tb.innerHTML = `<tr><td colspan="5" class="loading">${t('table.empty')}</td></tr>`;
    return;
  }

  tb.innerHTML = data.map((a, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${new Date(a.created_at).toLocaleString('om-ET')}</td>
      <td>${a.user_email}</td>
      <td>${a.type} — ${a.action}</td>
      <td>${a.description || '—'}</td>
    </tr>
  `).join('');
}

// ============================================
// 13. EXPORT PDF/EXCEL
// ============================================
window.exportDonationsPDF = function() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) return alert('PDF library hin fe\'amne');

  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text('Malka Noonoo — Gumaachitoota', 14, 15);
  doc.setFontSize(10);
  doc.text(`Guyyaa: ${new Date().toLocaleDateString()}`, 14, 22);

  const headers = [['#', 'Maqaa', 'Bilbila', 'Sadarkaa', 'Gumaacha', 'Mala', 'Haala', 'Guyyaa']];
  const rows = dashState.allDonations.map((d, i) => [
    i + 1,
    d.donor_name || '—',
    d.donor_phone || '—',
    d.tier || '—',
    formatETB(d.amount),
    d.payment_method || '—',
    d.status,
    new Date(d.created_at).toLocaleDateString('om-ET')
  ]);

  doc.autoTable({
    head: headers,
    body: rows,
    startY: 28,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [26, 107, 79] }
  });

  doc.save(`Malka-Noonoo-Donations-${Date.now()}.pdf`);
};

window.exportDonationsExcel = function() {
  if (typeof XLSX === 'undefined') return alert('Excel library hin fe\'amne');

  const data = dashState.allDonations.map((d, i) => ({
    '#': i + 1,
    Maqaa: d.donor_name || '',
    Bilbila: d.donor_phone || '',
    Imeelii: d.donor_email || '',
    Sadarkaa: d.tier || '',
    Gumaacha: d.amount,
    Mala: d.payment_method || '',
    Haala: d.status,
    Guyyaa: new Date(d.created_at).toLocaleDateString('om-ET')
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Donations');
  XLSX.writeFile(wb, `Malka-Noonoo-Donations-${Date.now()}.xlsx`);
};

// ============================================
// 14. LOGOUT
// ============================================
function setupLogout() {
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    if (!confirm('Dhuguma ba\'uu barbaadda?')) return;
    await db.auth.signOut();
    window.location.href = 'login.html';
  });
}

// ============================================
// 15. LANGUAGE SYNC
// ============================================
function setupLanguageSync() {
  window.addEventListener('languageChanged', () => {
    const active = document.querySelector('.dash-nav a.active');
    if (active) {
      const titleKey = active.querySelector('span:last-child')?.dataset.i18n || 'dash.title';
      const titleEl = document.getElementById('dashTitle');
      if (titleEl) {
        titleEl.dataset.i18n = titleKey;
        titleEl.textContent = t(titleKey);
      }
    }
    loadOverview();
  });
}

// ============================================
// 16. HELPERS
// ============================================
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function badge(s) {
  return `<span class="badge-status ${s}">${s}</span>`;
}

function getLast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: d.getMonth(),
      year: d.getFullYear(),
      label: d.toLocaleDateString('om-ET', { month: 'short' })
    });
  }
  return months;
}

// ============================================
// 17. GLOBAL EXPORTS
// ============================================
window.confirmDonation = confirmDonation;
window.deleteDonation = deleteDonation;
window.deleteExpense = deleteExpense;
window.deleteAsset = deleteAsset;
window.deleteRental = deleteRental;
window.deleteMasjid = deleteMasjid;
window.deleteAnnouncement = deleteAnnouncement;
window.loadTab = loadTab;