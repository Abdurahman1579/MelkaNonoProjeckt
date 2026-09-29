// ============================================
// TEAM PAGE — I18N SUPPORT
// Malka Noonoo Project
// ============================================

console.log('👥 team.js loaded');

// ============================================
// 1. TEAM DATA — Maqaan qofa (proper nouns)
// Roles/bios translations.js irraa dhufu
// ============================================
const TEAM_DATA = {
  leadership: [
    {
      id: 1,
      name: 'Sheikh Ahmed Ibrahim',
      roleKey: 'team.role.chairman',
      bioKey: 'team.bio.chairman',
      initials: 'AI',
      phone: '+251911000001',
      email: 'chair@malkanoonoo.org'
    },
    {
      id: 2,
      name: 'Ustadh Yusuf Mohammed',
      roleKey: 'team.role.imam',
      bioKey: 'team.bio.imam',
      initials: 'YM',
      phone: '+251911000002',
      email: 'imam@malkanoonoo.org'
    },
    {
      id: 3,
      name: 'Dr. Omar Hussein',
      roleKey: 'team.role.advisor',
      bioKey: 'team.bio.advisor',
      initials: 'OH',
      phone: '+251911000003',
      email: 'advisor@malkanoonoo.org'
    }
  ],
  committee: [
    { id: 4, name: 'Ahmed Abdi', roleKey: 'team.role.project_head', initials: 'AA' },
    { id: 5, name: 'Fatima Ali', roleKey: 'team.role.finance', initials: 'FA' },
    { id: 6, name: 'Ibrahim Nur', roleKey: 'team.role.fundraising', initials: 'IN' },
    { id: 7, name: 'Zainab Hassan', roleKey: 'team.role.assets', initials: 'ZH' },
    { id: 8, name: 'Mohammed Said', roleKey: 'team.role.asset_mgmt', initials: 'MS' },
    { id: 9, name: 'Halima Ahmed', roleKey: 'team.role.procurement', initials: 'HA' },
    { id: 10, name: 'Yusuf Karim', roleKey: 'team.role.internal_setup', initials: 'YK' },
    { id: 11, name: 'Aisha Omar', roleKey: 'team.role.rental', initials: 'AO' },
    { id: 12, name: 'Bilal Mohammed', roleKey: 'team.role.monitoring', initials: 'BM' }
  ],
  advisory: [
    { id: 13, name: 'Dr. Ibrahim Hassan', roleKey: 'team.role.legal', initials: 'IH' },
    { id: 14, name: 'Engineer Ali Yusuf', roleKey: 'team.role.engineer', initials: 'AY' },
    { id: 15, name: 'CPA Fatuma Ahmed', roleKey: 'team.role.audit', initials: 'FA' },
    { id: 16, name: 'Dr. Aisha Mohammed', roleKey: 'team.role.education', initials: 'AM' }
  ]
};

// ============================================
// 2. HELPERS
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

// ============================================
// 3. INIT
// ============================================
document.addEventListener('DOMContentLoaded', renderTeam);
window.addEventListener('languageChanged', renderTeam);

// ============================================
// 4. RENDER TEAM
// ============================================
function renderTeam() {
  console.log('🎨 Rendering team...');
  renderGroup('leadershipGrid', TEAM_DATA.leadership, true);
  renderGroup('committeeGrid', TEAM_DATA.committee, false);
  renderGroup('advisoryGrid', TEAM_DATA.advisory, false);
}

function renderGroup(elementId, list, showContact) {
  const grid = document.getElementById(elementId);
  if (!grid) return;

  if (!list || !list.length) {
    grid.innerHTML = `<div class="loading">—</div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const role = tr(p.roleKey, '');
    const bio = p.bioKey ? tr(p.bioKey, '') : '';

    return `
      <div class="team-card">
        <div class="team-avatar">
          ${escapeHtml(p.initials || p.name.split(' ').map(n => n[0]).join('').slice(0, 2))}
        </div>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="team-role">${escapeHtml(role)}</div>
        ${bio ? `<p class="team-bio">${escapeHtml(bio)}</p>` : ''}
        ${showContact && (p.phone || p.email) ? `
          <div class="team-contact">
            ${p.phone ? `<a href="tel:${p.phone}" title="Bilbila">📞</a>` : ''}
            ${p.email ? `<a href="mailto:${p.email}" title="Email">✉️</a>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// ============================================
// 5. GLOBAL EXPORTS
// ============================================
window.TEAM_DATA = TEAM_DATA;
window.renderTeam = renderTeam;