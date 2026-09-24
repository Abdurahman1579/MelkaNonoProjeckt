// ============================================
// MASJIDOS PAGE
// ============================================

let allMasjidos = [];

async function initMasjidos() {
  allMasjidos = await getMasjidos();
  renderMasjidos(allMasjidos);

  document.getElementById('searchMasjid')?.addEventListener('input', applyFilter);
  document.getElementById('filterWoreda')?.addEventListener('change', applyFilter);
}

function applyFilter() {
  const q = document.getElementById('searchMasjid').value.toLowerCase();
  const w = document.getElementById('filterWoreda').value;

  const filtered = allMasjidos.filter(m => {
    const matchesQ = !q || m.name.toLowerCase().includes(q);
    const matchesW = !w || m.woreda === w;
    return matchesQ && matchesW;
  });
  renderMasjidos(filtered);
}

function renderMasjidos(list) {
  const grid = document.getElementById('masjidGrid');
  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = `<div class="loading">${t('masjidos.empty')}</div>`;
    return;
  }
  grid.innerHTML = list.map(m => `
    <div class="masjid-card">
      <div class="masjid-icon">🕌</div>
      <h3>${m.name}</h3>
      <p class="masjid-loc">${m.woreda} — ${m.kebele || ''}</p>
      <p class="masjid-members">${m.member_count} ${t('masjidos.members')}</p>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', initMasjidos);
window.addEventListener('languageChanged', () => renderMasjidos(allMasjidos));