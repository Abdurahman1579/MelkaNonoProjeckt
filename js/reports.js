// ============================================
// REPORTS PAGE
// ============================================

const repCharts = { revenue: null, tiers: null, expenses: null };
let reportData = { donations: [], expenses: [], assets: [] };

document.addEventListener('DOMContentLoaded', loadReports);

async function loadReports() {
  try {
    const { data: donations } = await db.from('mn_donations').select('*');
    const { data: expenses } = await db.from('mn_expenses').select('*');
    const { data: assets } = await db.from('mn_assets').select('*');

    const confirmed = (donations || []).filter(d => d.status === 'confirmed');
    const raised = confirmed.reduce((s, d) => s + Number(d.amount), 0);
    const totalExp = (expenses || []).reduce((s, e) => s + Number(e.amount), 0);
    const pct = percent(raised, PROJECT_GOAL);

    reportData = { donations: confirmed, expenses: expenses || [], assets: assets || [] };

    setText('repRaised', formatETB(raised));
    setText('repExpenses', formatETB(totalExp));
    setText('repAssets', (assets || []).length);
    setText('repPercent', pct + '%');

    renderRevenueChart(confirmed);
    renderTiersChart(confirmed);
    renderExpensesChart(expenses || []);
  } catch (err) {
    console.error('Reports error:', err);
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
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

  const ctx = document.getElementById('repRevenueChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (repCharts.revenue) repCharts.revenue.destroy();

  repCharts.revenue = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [{
        label: 'Galii',
        data: totals,
        borderColor: '#1a6b4f',
        backgroundColor: 'rgba(26, 107, 79, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#1a6b4f',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderTiersChart(donations) {
  const tiers = ['tier1', 'tier2', 'community', 'masjid', 'business'];
  const labels = ['Sadarkaa 1', 'Sadarkaa 2', 'Hawaasa', 'Masgiidota', 'Daldala'];
  const colors = ['#d4a017', '#22a06b', '#6ee7b7', '#d1d5db', '#6b7280'];
  const totals = tiers.map(t =>
    donations.filter(d => d.tier === t).reduce((s, d) => s + Number(d.amount), 0)
  );

  const ctx = document.getElementById('repTiersChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (repCharts.tiers) repCharts.tiers.destroy();

  repCharts.tiers = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: totals, backgroundColor: colors, borderWidth: 3, borderColor: '#fff' }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8 } } }
    }
  });
}

function renderExpensesChart(expenses) {
  const categories = {};
  expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
  });

  const ctx = document.getElementById('repExpensesChart');
  if (!ctx || typeof Chart === 'undefined') return;
  if (repCharts.expenses) repCharts.expenses.destroy();

  repCharts.expenses = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(categories).length ? Object.keys(categories) : ['—'],
      datasets: [{
        data: Object.values(categories).length ? Object.values(categories) : [0],
        backgroundColor: '#22a06b',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
        x: { grid: { display: false } }
      }
    }
  });
}

// Downloads
window.downloadReportPDF = function () {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) return alert('PDF library hin fe\'amne');
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Malka Noonoo — Gabaasa', 14, 20);
  doc.setFontSize(10);
  doc.text(`Guyyaa: ${new Date().toLocaleDateString()}`, 14, 28);
  doc.text(`Galii: ${document.getElementById('repRaised').textContent}`, 14, 40);
  doc.text(`Baasii: ${document.getElementById('repExpenses').textContent}`, 14, 48);
  doc.text(`Qabeenya: ${document.getElementById('repAssets').textContent}`, 14, 56);
  doc.text(`Raawwii: ${document.getElementById('repPercent').textContent}`, 14, 64);
  doc.save(`Malka-Noonoo-Report-${Date.now()}.pdf`);
};

window.downloadReportExcel = function () {
  if (typeof XLSX === 'undefined') return alert('Excel library hin fe\'amne');
  const data = reportData.donations.map((d, i) => ({
    '#': i + 1,
    Maqaa: d.donor_name || '',
    Gumaacha: d.amount,
    Haala: d.status,
    Guyyaa: new Date(d.created_at).toLocaleDateString('om-ET')
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Gabaasa');
  XLSX.writeFile(wb, `Malka-Noonoo-Report-${Date.now()}.xlsx`);
};

window.downloadAuditPDF = function () {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) return alert('PDF library hin fe\'amne');
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Malka Noonoo — Audit Report', 14, 20);
  doc.setFontSize(10);
  doc.text(`Guyyaa: ${new Date().toLocaleDateString()}`, 14, 28);
  doc.text('Gabaasa auditii guutuu: dashboard.html irratti argita.', 14, 40);
  doc.save(`Malka-Noonoo-Audit-${Date.now()}.pdf`);
};