// ============================================
// TEAM.JS — DB + i18n
// Malka Noonoo Project
// ============================================

console.log('👥 team.js loaded');

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
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ============================================
// 2. FALLBACK DATA (yeroo DB duwwaa ta'e)
// ============================================
const FALLBACK_TEAM = {
  leadership: [
    { id: 'f1', name: 'Sheikh Ahmed Ibrahim', roleKey: 'team.role.chairman', bioKey: 'team.bio.chairman', initials: 'AI', phone: '+251911000001', email: 'chair@malkanoonoo.org' },
    { id: 'f2', name: 'Ustadh Yusuf Mohammed', roleKey: 'team.role.imam', bioKey: 'team.bio.imam', initials: 'YM', phone: '+251911000002', email: 'imam@malkanoonoo.org' },
    { id: 'f3', name: 'Dr. Omar Hussein', roleKey: 'team.role.advisor', bioKey: 'team.bio.advisor', initials: 'OH', phone: '+251911000003', email: 'advisor@malkanoonoo.org' }
  ],
  committee: [
    { id: 'f4', name: 'Ahmed Abdi', roleKey: 'team.role.project_head', initials: 'AA' },
    { id: 'f5', name: 'Fatima Ali', roleKey: 'team.role.finance', initials: 'FA' },
    { id: 'f6', name: 'Ibrahim Nur', roleKey: 'team.role.fundraising', initials: 'IN' },
    { id: 'f7', name: 'Zainab Hassan', roleKey: 'team.role.assets', initials: 'ZH' },
    { id: 'f8', name: 'Mohammed Said', roleKey: 'team.role.asset_mgmt', initials: 'MS' },
    { id: 'f9', name: 'Halima Ahmed', roleKey: 'team.role.procurement', initials: 'HA' },
    { id: 'f10', name: 'Yusuf Karim', roleKey: 'team.role.internal_setup', initials: 'YK' },
    { id: 'f11', name: 'Aisha Omar', roleKey: 'team.role.rental', initials: 'AO' },
    { id: 'f12', name: 'Bilal Mohammed', roleKey: 'team.role.monitoring', initials: 'BM' }
  ],
  advisory: [
    { id: 'f13', name: 'Dr. Ibrahim Hassan', roleKey: 'team.role.legal', initials: 'IH' },
    { id: 'f14', name: 'Engineer Ali Yusuf', roleKey: 'team.role.engineer', initials: 'AY' },
    { id: 'f15', name: 'CPA Fatuma Ahmed', roleKey: 'team.role.audit', initials: 'FA' },
    { id: 'f16', name: 'Dr. Aisha Mohammed', roleKey: 'team.role.education', initials: 'AM' }
  ]
};

// ============================================
// 3. STATE
// ============================================
const teamState = {
  all: [],
  grouped: { leadership: [], committee: [], advisory: [] },
  initialized: false,
  usedFallback: false
};

// ============================================
// 4. TRANSLATE MEMBER
// ============================================
function translateMember(m) {
  const lang = (typeof getCurrentLang === 'function')
    ? getCurrentLang()
    : (localStorage.getItem('mn_lang') || 'om');

  // Fallback items — keys
  if (m.roleKey) {
    return {
      name: m.name,
      role: tr(m.roleKey, ''),
      bio: m.bioKey ? tr(m.bioKey, '') : '',
      initials: m.initials,
      phone: m.phone,
      email: m.email
    };
  }

  // DB items — translation columns
  let role = m.role || '';
  let bio = m.bio || '';
  let name = m.name || '';

  if (lang === 'am') {
    role = m.role_am || role;
    bio = m.bio_am || bio;
  } else if (lang === 'en') {
    role = m.role_en || role;
    bio = m.bio_en || bio;
  }

  return {
    name,
    role,
    bio,
    initials: m.initials || getInitials(name),
    phone: m.phone,
    email: m.email
  };
}

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

// ============================================
// 5. LOAD FROM DB
// ============================================
async function loadTeamFromDB() {
  try {
    console.log('👥 Fetching team from mn_team_members...');

    const { data, error } = await db
      .from('mn_team_members')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    if (!data || !data.length) {
      console.log('ℹ️ No team members from DB — using fallback');
      teamState.all = [];
      teamState.grouped = { ...FALLBACK_TEAM };
      teamState.usedFallback = true;
      return;
    }

    teamState.all = data;
    teamState.grouped = {
      leadership: data.filter(m => m.category === 'leadership'),
      committee: data.filter(m => m.category === 'committee'),
      advisory: data.filter(m => m.category === 'advisory')
    };
    teamState.usedFallback = false;

    console.log(`✅ Loaded ${data.length} team members from DB`);
  } catch (err) {
    console.error('❌ Team load error:', err);
    teamState.all = [];
    teamState.grouped = { ...FALLBACK_TEAM };
    teamState.usedFallback = true;

    if (window.toast) {
      toast.warning(tr('toast.warning', 'Akeekkachiisa'), 'Sample team fayyadamaa jira');
    }
  }
}

// ============================================
// 6. INIT
// ============================================
document.addEventListener('DOMContentLoaded', initTeam);

async function initTeam() {
  if (teamState.initialized) return;
  teamState.initialized = true;

  console.log('👥 Init team...');

  // Skeleton (yoo barbaadde)
  const grids = ['leadershipGrid', 'committeeGrid', 'advisoryGrid'];
  grids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div class="loading">' + tr('loading.generic', 'Fe\'amaa jira...') + '</div>';
  });

  await loadTeamFromDB();
  renderTeam();
}

// ============================================
// 7. RENDER
// ============================================
function renderTeam() {
  console.log('🎨 Rendering team...');

  renderGroup('leadershipGrid', teamState.grouped.leadership, true);
  renderGroup('committeeGrid', teamState.grouped.committee, false);
  renderGroup('advisoryGrid', teamState.grouped.advisory, false);
}

function renderGroup(elementId, list, showContact) {
  const grid = document.getElementById(elementId);
  if (!grid) return;

  if (!list || !list.length) {
    grid.innerHTML = `<div class="loading">${tr('empty.generic', 'Hin jiru.')}</div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const t = translateMember(p);
    const initials = t.initials || getInitials(t.name);

    return `
      <div class="team-card">
        <div class="team-avatar">${escapeHtml(initials)}</div>
        <h3>${escapeHtml(t.name)}</h3>
        <div class="team-role">${escapeHtml(t.role)}</div>
        ${t.bio ? `<p class="team-bio">${escapeHtml(t.bio)}</p>` : ''}
        ${showContact && (t.phone || t.email) ? `
          <div class="team-contact">
            ${t.phone ? `<a href="tel:${t.phone}" title="${tr('table.phone', 'Bilbila')}">📞</a>` : ''}
            ${t.email ? `<a href="mailto:${t.email}" title="${tr('table.email', 'Email')}">✉️</a>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// ============================================
// 8. LANGUAGE CHANGE
// ============================================
window.addEventListener('languageChanged', () => {
  console.log('🌐 Language changed — re-rendering team');
  renderTeam();
});

// ============================================
// 9. GLOBAL EXPORTS
// ============================================
window.FALLBACK_TEAM = FALLBACK_TEAM;
window.renderTeam = renderTeam;
window.loadTeamFromDB = loadTeamFromDB;