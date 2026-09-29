// ============================================
// REPORTS.JS — Reports & Analytics (i18n)
// Malka Noonoo Project — Complete v2.0
// ============================================

console.log('📊 reports.js loaded');

// ============================================
// HELPER
// ============================================
function tr(key, fallback) {
  if (typeof t === 'function') {
    const val = t(key, '');
    if (val && val !== key) return val;
  }
  return fallback || key;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ============================================
// 1. STATE
// ============================================
const reportsState = {
  charts: {
    annual: null,
    revenue: null,
    tiers: null,
    expenses: null,
    comparison: null
  },
  data: {
    donations: [],
    expenses: [],
    assets: [],
    activity: []
  },
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  initialized: false
};

// ============================================
// 2. INIT
// ============================================
document.addEventListener('DOMContentLoaded', initReports);

async function initReports() {
  if (reportsState.initialized) return;
  reportsState.initialized = true;

  console.log('📊 Reports init...');

  try {
    await loadAllData();
    setupMonthSelect();
    setupYearSelect();
    setupTabs();

    await loadSummary();
    await loadMonthly();
    await loadAnnual();
    await loadAudit();
    await loadCharts();

    if (typeof applyTranslations === 'function') applyTranslations();

    console.log('✅ Reports ready');
  } catch (err) {
    console.error('❌ Reports error:', err);
    if (window.toast) toast.error(tr('toast.error', 'Dogoggora'), 'Gabaasa fe\'uun hin danda\'amne');
  }
}

// ============================================
// 3. LOAD ALL DATA
// ============================================
async function loadAllData() {
  const [donRes, expRes, assetRes, logRes] = await Promise.all([
    db.from('mn_donations').select('*').order('created_at', { ascending: false }),
    db.from('mn_expenses').select('*').order('created_at', { ascending: false }),
    db.from('mn_assets').select('*').order('id', { ascending: false }),
    db.from('mn_activity_log').select('*').order('created_at', { ascending: false }).limit(100)
  ]);

  reportsState.data.donations = donRes.data || [];
  reportsState.data.expenses = expRes.data || [];
  reportsState.data.assets = assetRes.data || [];
  reportsState.data.activity = logRes.data || [];

  console.log(`📊 Loaded: ${reportsState.data.donations.length} donations, ${reportsState.data.expenses.length} expenses`);
}

// ============================================
// 4. SUMMARY CARDS
// ============================================
async function loadSummary() {
  const confirmed = reportsState.data.donations.filter(d => d.status === 'confirmed');
  const raised = confirmed.reduce((s, d) => s + Number(d.amount), 0);
  const totalExp = reportsState.data.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const pct = ((raised / PROJECT_GOAL) * 100).toFixed(1);

  setText('repRaised', formatETB(raised));
  setText('repExpenses', formatETB(totalExp));
  setText('repAssets', reportsState.data.assets.length);
  setText('repPercent', pct + '%');

  const trends = calculateTrends(confirmed, reportsState.data.expenses);
  updateTrend('repRaisedTrend', trends.revenue);
  updateTrend('repExpensesTrend', trends.expenses);
}

function calculateTrends(donations, expenses) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisRevenue = donations
    .filter(d => new Date(d.created_at) >= thisMonthStart)
    .reduce((s, d) => s + Number(d.amount), 0);

  const lastRevenue = donations
    .filter(d => {
      const dt = new Date(d.created_at);
      return dt >= lastMonthStart && dt < thisMonthStart;
    })
    .reduce((s, d) => s + Number(d.amount), 0);

  const thisExpenses = expenses
    .filter(e => new Date(e.created_at) >= thisMonthStart)
    .reduce((s, e) => s + Number(e.amount), 0);

  const lastExpenses = expenses
    .filter(e => {
      const dt = new Date(e.created_at);
      return dt >= lastMonthStart && dt < thisMonthStart;
    })
    .reduce((s, e) => s + Number(e.amount), 0);

  return {
    revenue: calcPercentChange(thisRevenue, lastRevenue),
    expenses: calcPercentChange(thisExpenses, lastExpenses)
  };
}

function calcPercentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function updateTrend(id, percent) {
  const el = document.getElementById(id);
  if (!el) return;

  if (Math.abs(percent) < 0.1) {
    el.textContent = '—';
    el.className = 'report-trend';
    return;
  }

  const sign = percent > 0 ? '↑' : '↓';
  const abs = Math.abs(percent).toFixed(1);
  el.textContent = `${sign} ${abs}% ${tr('reports.vs_last_month', 'ji\'a darbe irraa')}`;
  el.className = 'report-trend ' + (percent > 0 ? 'up' : 'down');
}

// ============================================
// 5. TABS
// ============================================
function setupTabs() {
  document.querySelectorAll('.report-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.report-panel').forEach(p => p.classList.remove('active'));
      document.querySelector(`.report-panel[data-tab="${target}"]`)?.classList.add('active');

      if (target === 'charts') {
        setTimeout(loadCharts, 100);
      }
    });
  });
}

// ============================================
// 6. MONTH SELECT
// ============================================
function setupMonthSelect() {
  const select = document.getElementById('monthSelect');
  if (!select) return;

  const months = getLast12Months();
  select.innerHTML = months.map((m, i) =>
    `<option value="${m.year}-${m.month}" ${i === 0 ? 'selected' : ''}>${m.label}</option>`
  ).join('');

  select.addEventListener('change', loadMonthly);
}

function getLast12Months() {
  const months = [];
  const now = new Date();
  const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'om';
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString(lang === 'am' ? 'am-ET' : lang === 'en' ? 'en-US' : 'om-ET',
        { year: 'numeric', month: 'long' })
    });
  }
  return months;
}

// ============================================
// 7. LOAD MONTHLY
// ============================================
async function loadMonthly() {
  const select = document.getElementById('monthSelect');
  if (!select) return;

  const [year, month] = select.value.split('-').map(Number);
  reportsState.currentMonth = month;
  reportsState.currentYear = year;

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);

  const monthlyDonations = reportsState.data.donations.filter(d => {
    const dt = new Date(d.created_at);
    return dt >= start && dt < end && d.status === 'confirmed';
  });

  const monthlyExpenses = reportsState.data.expenses.filter(e => {
    const dt = new Date(e.created_at);
    return dt >= start && dt < end;
  });

  const revenue = monthlyDonations.reduce((s, d) => s + Number(d.amount), 0);
  const expenses = monthlyExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const net = revenue - expenses;

  setText('monthlyRevenue', formatETB(revenue));
  setText('monthlyExpenses', formatETB(expenses));
  setText('monthlyNet', formatETB(net));

  renderMonthlyDonations(monthlyDonations);
  renderMonthlyExpenses(monthlyExpenses);
}

function renderMonthlyDonations(list) {
  const tb = document.querySelector('#monthlyDonationsTable tbody');
  if (!tb) return;

  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="5" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`;
    return;
  }

  tb.innerHTML = list.slice(0, 50).map((d, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${new Date(d.created_at).toLocaleDateString('om-ET')}</td>
      <td>${escapeHtml(d.donor_name || 'Anonymous')}</td>
      <td><strong>${formatETB(d.amount)}</strong></td>
      <td>${d.payment_method || '—'}</td>
    </tr>
  `).join('');
}

function renderMonthlyExpenses(list) {
  const tb = document.querySelector('#monthlyExpensesTable tbody');
  if (!tb) return;

  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="5" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`;
    return;
  }

  tb.innerHTML = list.slice(0, 50).map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${new Date(e.created_at).toLocaleDateString('om-ET')}</td>
      <td>${escapeHtml(e.category)}</td>
      <td>${escapeHtml(e.description || '—')}</td>
      <td><strong>${formatETB(e.amount)}</strong></td>
    </tr>
  `).join('');
}

// ============================================
// 8. YEAR SELECT
// ============================================
function setupYearSelect() {
  const select = document.getElementById('yearSelect');
  if (!select) return;

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  select.innerHTML = years.map((y, i) =>
    `<option value="${y}" ${i === 0 ? 'selected' : ''}>${y}</option>`
  ).join('');

  select.addEventListener('change', loadAnnual);
}

// ============================================
// 9. LOAD ANNUAL
// ============================================
async function loadAnnual() {
  const select = document.getElementById('yearSelect');
  if (!select) return;

  const year = Number(select.value);

  const yearDonations = reportsState.data.donations.filter(d => {
    const dt = new Date(d.created_at);
    return dt.getFullYear() === year && d.status === 'confirmed';
  });

  const yearExpenses = reportsState.data.expenses.filter(e => {
    const dt = new Date(e.created_at);
    return dt.getFullYear() === year;
  });

  const revenue = yearDonations.reduce((s, d) => s + Number(d.amount), 0);
  const expenses = yearExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const net = revenue - expenses;
  const donors = new Set(yearDonations.map(d => d.donor_phone)).size;

  setText('annualRevenue', formatETB(revenue));
  setText('annualExpenses', formatETB(expenses));
  setText('annualNet', formatETB(net));
  setText('annualDonors', donors);

  renderAnnualChart(year, yearDonations, yearExpenses);
  renderAnnualBreakdown(yearExpenses);
}

function renderAnnualChart(year, donations, expenses) {
  const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'om';
  const locale = lang === 'am' ? 'am-ET' : lang === 'en' ? 'en-US' : 'om-ET';

  const months = [];
  for (let m = 0; m < 12; m++) {
    const label = new Date(year, m, 1).toLocaleDateString(locale, { month: 'short' });
    const revenue = donations
      .filter(d => new Date(d.created_at).getMonth() === m)
      .reduce((s, d) => s + Number(d.amount), 0);
    const exp = expenses
      .filter(e => new Date(e.created_at).getMonth() === m)
      .reduce((s, e) => s + Number(e.amount), 0);
    months.push({ label, revenue, expenses: exp });
  }

  const ctx = document.getElementById('annualChart');
  if (!ctx || typeof Chart === 'undefined') return;

  if (reportsState.charts.annual) reportsState.charts.annual.destroy();

  reportsState.charts.annual = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: tr('reports.annual.revenue', 'Galii'),
          data: months.map(m => m.revenue),
          backgroundColor: '#22a06b',
          borderRadius: 6
        },
        {
          label: tr('reports.annual.expenses', 'Baasii'),
          data: months.map(m => m.expenses),
          backgroundColor: '#dc2626',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatETB(ctx.parsed.y)}`
          }
        }
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

function renderAnnualBreakdown(expenses) {
  const tb = document.querySelector('#annualBreakdownTable tbody');
  if (!tb) return;

  if (!expenses.length) {
    tb.innerHTML = `<tr><td colspan="3" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`;
    return;
  }

  const categories = {};
  expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
  });

  const total = Object.values(categories).reduce((s, v) => s + v, 0);
  const entries = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  tb.innerHTML = entries.map(([cat, amount]) => {
    const pct = ((amount / total) * 100).toFixed(1);
    return `
      <tr>
        <td>${escapeHtml(cat)}</td>
        <td><strong>${formatETB(amount)}</strong></td>
        <td>${pct}%</td>
      </tr>
    `;
  }).join('');
}

// ============================================
// 10. LOAD AUDIT
// ============================================
async function loadAudit() {
  const confirmed = reportsState.data.donations.filter(d => d.status === 'confirmed').length;
  const pending = reportsState.data.donations.filter(d => d.status === 'pending').length;
  const failed = reportsState.data.donations.filter(d => d.status === 'failed').length;

  setText('auditConfirmed', confirmed);
  setText('auditPending', pending);
  setText('auditFailed', failed);
  setText('auditLogs', reportsState.data.activity.length);

  const tb = document.querySelector('#auditLogTable tbody');
  if (!tb) return;

  if (!reportsState.data.activity.length) {
    tb.innerHTML = `<tr><td colspan="5" class="loading">${tr('table.empty', 'Hin jiru.')}</td></tr>`;
    return;
  }

  tb.innerHTML = reportsState.data.activity.slice(0, 50).map((a, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${new Date(a.created_at).toLocaleString('om-ET')}</td>
      <td>${escapeHtml(a.user_email || 'system')}</td>
      <td>${escapeHtml(a.type)} — ${escapeHtml(a.action)}</td>
      <td>${escapeHtml(a.description || '—')}</td>
    </tr>
  `).join('');
}

// ============================================
// 11. LOAD CHARTS
// ============================================
async function loadCharts() {
  const confirmed = reportsState.data.donations.filter(d => d.status === 'confirmed');
  const expenses = reportsState.data.expenses;

  renderRevenueChart(confirmed);
  renderTiersChart(confirmed);
  renderExpensesChart(expenses);
  renderComparisonChart(confirmed, expenses);
}

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
  if (reportsState.charts.revenue) reportsState.charts.revenue.destroy();

  reportsState.charts.revenue = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [{
        label: tr('reports.annual.revenue', 'Galii'),
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
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderTiersChart(donations) {
  const tiers = ['tier1', 'tier2', 'community', 'masjid', 'business'];
  const labels = [
    tr('tiers.tier1', 'Sadarkaa 1'),
    tr('tiers.tier2', 'Sadarkaa 2'),
    tr('tiers.tier3', 'Hawaasa'),
    tr('tiers.tier4', 'Masgiidota'),
    tr('donate.form.tier.business', 'Daldala')
  ];
  const colors = ['#d4a017', '#22a06b', '#6ee7b7', '#94a3b8', '#64748b'];
  const totals = tiers.map(t =>
    donations.filter(d => d.tier === t).reduce((s, d) => s + Number(d.amount), 0)
  );

  const ctx = document.getElementById('tiersChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (reportsState.charts.tiers) reportsState.charts.tiers.destroy();

  reportsState.charts.tiers = new Chart(ctx, {
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
        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8 } }
      }
    }
  });
}

function renderExpensesChart(expenses) {
  const categories = {};
  expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
  });

  const ctx = document.getElementById('expensesChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (reportsState.charts.expenses) reportsState.charts.expenses.destroy();

  reportsState.charts.expenses = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(categories).length ? Object.keys(categories) : ['—'],
      datasets: [{
        data: Object.values(categories).length ? Object.values(categories) : [0],
        backgroundColor: '#dc2626',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderComparisonChart(donations, expenses) {
  const months = getLast6Months();
  const revenues = months.map(m =>
    donations
      .filter(d => {
        const dt = new Date(d.created_at);
        return dt.getMonth() === m.month && dt.getFullYear() === m.year;
      })
      .reduce((s, d) => s + Number(d.amount), 0)
  );
  const exps = months.map(m =>
    expenses
      .filter(e => {
        const dt = new Date(e.created_at);
        return dt.getMonth() === m.month && dt.getFullYear() === m.year;
      })
      .reduce((s, e) => s + Number(e.amount), 0)
  );

  const ctx = document.getElementById('comparisonChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (reportsState.charts.comparison) reportsState.charts.comparison.destroy();

  reportsState.charts.comparison = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: tr('reports.annual.revenue', 'Galii'),
          data: revenues,
          borderColor: '#22a06b',
          backgroundColor: 'rgba(34, 160, 107, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3
        },
        {
          label: tr('reports.annual.expenses', 'Baasii'),
          data: exps,
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12 } }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } }
      }
    }
  });
}

// ============================================
// 12. EXPORT — MONTHLY PDF
// ============================================
window.exportMonthlyPDF = function() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) return toast.error(tr('toast.error', 'Dogoggora'), 'PDF library hin fe\'amne');

  const doc = new jsPDF();

  doc.setFillColor(13, 59, 46);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(tr('brand.name', 'Malka Noonoo'), 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(tr('reports.monthly.title', 'Monthly Report'), 14, 26);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${tr('table.date', 'Guyyaa')}: ${new Date().toLocaleDateString()}`, 14, 50);

  const month = document.getElementById('monthSelect')?.selectedOptions[0]?.text || '—';
  doc.text(`${tr('reports.tab.monthly', 'Ji\'a')}: ${month}`, 14, 58);

  const data = [
    [tr('reports.monthly.revenue', 'Galii Ji\'aa'), document.getElementById('monthlyRevenue')?.textContent || '0'],
    [tr('reports.monthly.expenses', 'Baasii Ji\'aa'), document.getElementById('monthlyExpenses')?.textContent || '0'],
    [tr('reports.monthly.net', 'Bu\'aa Qulqulluu'), document.getElementById('monthlyNet')?.textContent || '0']
  ];

  doc.autoTable({
    startY: 70,
    head: [[tr('table.category', 'Ramaddii'), tr('table.amount', 'Gatii')]],
    body: data,
    styles: { fontSize: 11 },
    headStyles: { fillColor: [26, 107, 79] }
  });

  doc.save(`Malka-Noonoo-Monthly-${Date.now()}.pdf`);
  if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), 'PDF buufameera');
};

// ============================================
// 13. EXPORT — MONTHLY EXCEL
// ============================================
window.exportMonthlyExcel = function() {
  if (typeof XLSX === 'undefined') return toast.error(tr('toast.error', 'Dogoggora'), 'Excel library hin fe\'amne');

  const select = document.getElementById('monthSelect');
  const [year, month] = (select?.value || '').split('-').map(Number);
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);

  const donations = reportsState.data.donations.filter(d => {
    const dt = new Date(d.created_at);
    return dt >= start && dt < end && d.status === 'confirmed';
  });

  const expenses = reportsState.data.expenses.filter(e => {
    const dt = new Date(e.created_at);
    return dt >= start && dt < end;
  });

  const ws1 = XLSX.utils.json_to_sheet(donations.map(d => ({
    Guyyaa: new Date(d.created_at).toLocaleDateString(),
    Maqaa: d.donor_name || 'Anonymous',
    Gumaacha: d.amount,
    Mala: d.payment_method
  })));

  const ws2 = XLSX.utils.json_to_sheet(expenses.map(e => ({
    Guyyaa: new Date(e.created_at).toLocaleDateString(),
    Ramaddii: e.category,
    Ibsa: e.description,
    Baasii: e.amount
  })));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Gumaacha');
  XLSX.utils.book_append_sheet(wb, ws2, 'Baasii');
  XLSX.writeFile(wb, `Malka-Noonoo-Monthly-${year}-${month + 1}.xlsx`);

  if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), 'Excel buufameera');
};

// ============================================
// 14. EXPORT — ANNUAL PDF
// ============================================
window.exportAnnualPDF = function() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) return toast.error(tr('toast.error', 'Dogoggora'), 'PDF library hin fe\'amne');

  const doc = new jsPDF();
  const year = document.getElementById('yearSelect')?.value || new Date().getFullYear();

  doc.setFillColor(13, 59, 46);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(tr('brand.name', 'Malka Noonoo'), 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${tr('reports.annual.title', 'Annual Report')} ${year}`, 14, 26);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');

  const data = [
    [tr('reports.annual.revenue', 'Galii Waggaa'), document.getElementById('annualRevenue')?.textContent || '0'],
    [tr('reports.annual.expenses', 'Baasii Waggaa'), document.getElementById('annualExpenses')?.textContent || '0'],
    [tr('reports.annual.net', 'Bu\'aa Qulqulluu'), document.getElementById('annualNet')?.textContent || '0'],
    [tr('reports.annual.donors', 'Gumaachitoota'), document.getElementById('annualDonors')?.textContent || '0']
  ];

  doc.autoTable({
    startY: 50,
    head: [[tr('table.category', 'Ramaddii'), tr('table.amount', 'Gatii')]],
    body: data,
    styles: { fontSize: 11 },
    headStyles: { fillColor: [26, 107, 79] }
  });

  const breakdownRows = [];
  document.querySelectorAll('#annualBreakdownTable tbody tr').forEach(tr => {
    const cells = tr.querySelectorAll('td');
    if (cells.length === 3) {
      breakdownRows.push([
        cells[0].textContent.trim(),
        cells[1].textContent.trim(),
        cells[2].textContent.trim()
      ]);
    }
  });

  if (breakdownRows.length) {
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [[tr('table.category', 'Ramaddii'), tr('table.amount', 'Baasii'), tr('reports.percent_share', '%')]],
      body: breakdownRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [26, 107, 79] }
    });
  }

  doc.save(`Malka-Noonoo-Annual-${year}.pdf`);
  if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), 'PDF buufameera');
};

// ============================================
// 15. EXPORT — ANNUAL EXCEL
// ============================================
window.exportAnnualExcel = function() {
  if (typeof XLSX === 'undefined') return toast.error(tr('toast.error', 'Dogoggora'), 'Excel library hin fe\'amne');

  const year = Number(document.getElementById('yearSelect')?.value || new Date().getFullYear());

  const donations = reportsState.data.donations.filter(d =>
    new Date(d.created_at).getFullYear() === year && d.status === 'confirmed'
  );

  const expenses = reportsState.data.expenses.filter(e =>
    new Date(e.created_at).getFullYear() === year
  );

  const ws1 = XLSX.utils.json_to_sheet(donations.map(d => ({
    Guyyaa: new Date(d.created_at).toLocaleDateString(),
    Maqaa: d.donor_name || 'Anonymous',
    Bilbila: d.donor_phone || '',
    Gumaacha: d.amount,
    Mala: d.payment_method
  })));

  const ws2 = XLSX.utils.json_to_sheet(expenses.map(e => ({
    Guyyaa: new Date(e.created_at).toLocaleDateString(),
    Ramaddii: e.category,
    Ibsa: e.description,
    Baasii: e.amount
  })));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Gumaacha');
  XLSX.utils.book_append_sheet(wb, ws2, 'Baasii');
  XLSX.writeFile(wb, `Malka-Noonoo-Annual-${year}.xlsx`);

  if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), 'Excel buufameera');
};

// ============================================
// 16. EXPORT — AUDIT PDF
// ============================================
window.exportAuditPDF = function() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) return toast.error(tr('toast.error', 'Dogoggora'), 'PDF library hin fe\'amne');

  const doc = new jsPDF();

  doc.setFillColor(13, 59, 46);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(tr('brand.name', 'Malka Noonoo'), 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(tr('reports.audit.title', 'Audit Report'), 14, 26);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${tr('table.date', 'Guyyaa')}: ${new Date().toLocaleString()}`, 14, 50);

  const summary = [
    [tr('reports.audit.verified', 'Gumaacha Mirkanaa\'e'), document.getElementById('auditConfirmed')?.textContent || '0'],
    [tr('reports.audit.pending', 'Pending'), document.getElementById('auditPending')?.textContent || '0'],
    [tr('reports.audit.failed', 'Failed'), document.getElementById('auditFailed')?.textContent || '0'],
    [tr('reports.audit.logs', 'Sochii Logs'), document.getElementById('auditLogs')?.textContent || '0']
  ];

  doc.autoTable({
    startY: 60,
    head: [[tr('table.category', 'Ramaddii'), tr('table.quantity', 'Baay\'ina')]],
    body: summary,
    styles: { fontSize: 11 },
    headStyles: { fillColor: [26, 107, 79] }
  });

  const logRows = reportsState.data.activity.slice(0, 50).map(a => [
    new Date(a.created_at).toLocaleDateString(),
    a.user_email || 'system',
    a.type,
    a.action
  ]);

  if (logRows.length) {
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [[tr('table.date', 'Guyyaa'), tr('reports.audit.actor', 'Actor'), tr('reports.audit.action', 'Sochii'), 'Action']],
      body: logRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 107, 79] }
    });
  }

  doc.save(`Malka-Noonoo-Audit-${Date.now()}.pdf`);
  if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), 'Audit PDF buufameera');
};

// ============================================
// 17. HELPERS
// ============================================
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function getLast6Months() {
  const months = [];
  const now = new Date();
  const lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'om';
  const locale = lang === 'am' ? 'am-ET' : lang === 'en' ? 'en-US' : 'om-ET';

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: d.getMonth(),
      year: d.getFullYear(),
      label: d.toLocaleDateString(locale, { month: 'short' })
    });
  }
  return months;
}

// ============================================
// 18. LANGUAGE SYNC
// ============================================
window.addEventListener('languageChanged', () => {
  console.log('🌐 Reports language changed — reloading');
  loadSummary();
  loadMonthly();
  loadAnnual();
  loadAudit();
  loadCharts();

  if (typeof applyTranslations === 'function') applyTranslations();
});