// ============================================
// TEAM PAGE
// ============================================

const TEAM_DATA = {
  leadership: [
    {
      name: 'Sheikh Ahmed Ibrahim',
      role: 'Hoggansa Ol\'aanaa',
      bio: 'Hoggansa Mana Marii — waggaa 15 muuxannoo qaba.',
      initials: 'AI',
      phone: '+251911000001',
      email: 'chair@malkanoonoo.org'
    },
    {
      name: 'Ustadh Yusuf Mohammed',
      role: 'Imaama fi Dubbii',
      bio: 'Ogeessa dubbii fi barnoota Islaamaa.',
      initials: 'YM',
      phone: '+251911000002',
      email: 'imam@malkanoonoo.org'
    },
    {
      name: 'Dr. Omar Hussein',
      role: 'Gorsaa Ol\'aanaa',
      bio: 'Ogeessa faayinaansii — PhD Economics.',
      initials: 'OH',
      phone: '+251911000003',
      email: 'advisor@malkanoonoo.org'
    }
  ],
  committee: [
    { name: 'Ahmed Abdi', role: 'Hoggansa Piroojektii', initials: 'AA' },
    { name: 'Fatima Ali', role: 'Faayinaansii', initials: 'FA' },
    { name: 'Ibrahim Nur', role: 'Gumaacha', initials: 'IN' },
    { name: 'Zainab Hassan', role: 'Qabeenya', initials: 'ZH' },
    { name: 'Mohammed Said', role: 'Qabeenya Bulchiinsa', initials: 'MS' },
    { name: 'Halima Ahmed', role: 'Bittaa', initials: 'HA' },
    { name: 'Yusuf Karim', role: 'Qophii Keessaa', initials: 'YK' },
    { name: 'Aisha Omar', role: 'Kireeffannaa', initials: 'AO' },
    { name: 'Bilal Mohammed', role: 'Hordoffii & Gabaasa', initials: 'BM' }
  ],
  advisory: [
    { name: 'Dr. Ibrahim Hassan', role: 'Ogeessa Seeraa', initials: 'IH' },
    { name: 'Engineer Ali Yusuf', role: 'Ogeessa Ijaarsaa', initials: 'AY' },
    { name: 'CPA Fatuma Ahmed', role: 'Audit', initials: 'FA' },
    { name: 'Dr. Aisha Mohammed', role: 'Ogeessa Barnootaa', initials: 'AM' }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  renderTeam();
});

function renderTeam() {
  renderGroup('leadershipGrid', TEAM_DATA.leadership, true);
  renderGroup('committeeGrid', TEAM_DATA.committee, false);
  renderGroup('advisoryGrid', TEAM_DATA.advisory, false);
}

function renderGroup(elementId, list, showContact) {
  const grid = document.getElementById(elementId);
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `<div class="loading">—</div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="team-card">
      <div class="team-avatar">${p.initials || p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
      <h3>${p.name}</h3>
      <div class="team-role">${p.role}</div>
      ${p.bio ? `<p class="team-bio">${p.bio}</p>` : ''}
      ${showContact && (p.phone || p.email) ? `
        <div class="team-contact">
          ${p.phone ? `<a href="tel:${p.phone}" title="Bilbila">📞</a>` : ''}
          ${p.email ? `<a href="mailto:${p.email}" title="Email">✉️</a>` : ''}
        </div>
      ` : ''}
    </div>
  `).join('');
}

window.addEventListener('languageChanged', renderTeam);