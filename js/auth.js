// ============================================
// AUTH + DASHBOARD (FIXED)
// ============================================

// ============================================
// LOGIN PAGE
// ============================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  // Yoo duraan seenaa jira, dashboard deebi'i
  (async () => {
    const { data: { session } } = await db.auth.getSession();
    if (session) {
      console.log('✅ Already logged in, redirecting...');
      window.location.href = 'dashboard.html';
    }
  })();

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const msg = document.getElementById('loginMsg');
    const btn = loginForm.querySelector('button[type="submit"]');

    msg.className = 'form-message';
    msg.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Seenaa jira...';

    console.log('🔐 Attempting login:', email);

    const { data, error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('❌ Login error:', error);
      msg.textContent = '❌ ' + (error.message || 'Seensa hin milkoofne');
      msg.classList.add('error');
      btn.disabled = false;
      btn.textContent = t('login.submit') || 'Seeni';
      return;
    }

    console.log('✅ Login successful:', data.user.email);
    msg.textContent = '✅ Seensa milkaa\'e. Deebi\'aa jira...';
    msg.classList.add('success');

    setTimeout(() => window.location.href = 'dashboard.html', 600);
  });
}

// ============================================
// DASHBOARD PAGE
// ============================================
const dashBody = document.querySelector('.dash-body');
if (dashBody) {
  console.log('🚀 Dashboard initializing...');

  (async function initDashboard() {
    try {
      // 1. Session check
      const { data: { session }, error: sessionErr } = await db.auth.getSession();

      if (sessionErr) {
        console.error('❌ Session error:', sessionErr);
        window.location.href = 'login.html';
        return;
      }

      if (!session) {
        console.warn('⚠️ No session — redirecting to login');
        window.location.href = 'login.html';
        return;
      }

      console.log('✅ Session found:', session.user.email);
      document.getElementById('dashUser').textContent = session.user.email;

      // 2. Check profile role
      const { data: profile, error: profileErr } = await db
        .from('mn_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileErr) {
        console.error('❌ Profile error:', profileErr);
      }

      if (!profile) {
        console.warn('⚠️ No profile row. Creating default...');
        // Auto-create profile as admin (kana booda haqii)
        const { error: insertErr } = await db
          .from('mn_profiles')
          .insert({
            id: session.user.id,
            full_name: session.user.email,
            role: 'admin'
          });

        if (insertErr) {
          console.error('❌ Auto-create profile failed:', insertErr);
        } else {
          console.log('✅ Auto-created profile');
        }
      } else {
        console.log('👤 Profile:', profile.role, '-', profile.full_name);
      }

      // 3. Load overview
      await loadOverview();

      // 4. Tab navigation
      document.querySelectorAll('.dash-nav a').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          const tab = link.dataset.tab;

          document.querySelectorAll('.dash-nav a').forEach(a => a.classList.remove('active'));
          link.classList.add('active');

          document.querySelectorAll('.dash-tab').forEach(s => s.classList.remove('active'));
          const targetTab = document.querySelector(`.dash-tab[data-tab="${tab}"]`);
          if (targetTab) targetTab.classList.add('active');

          const titleKey = link.querySelector('span')?.dataset.i18n || 'dash.title';
          const titleEl = document.getElementById('dashTitle');
          if (titleEl) {
            titleEl.dataset.i18n = titleKey;
            titleEl.textContent = t(titleKey);
          }

          loadTab(tab);
        });
      });

      // 5. Logout
      document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        console.log('👋 Logging out...');
        await db.auth.signOut();
        window.location.href = 'login.html';
      });

      // 6. Language change re-render
      window.addEventListener('languageChanged', () => {
        const active = document.querySelector('.dash-nav a.active');
        if (active) {
          const titleKey = active.querySelector('span')?.dataset.i18n || 'dash.title';
          const titleEl = document.getElementById('dashTitle');
          if (titleEl) titleEl.textContent = t(titleKey);
        }
        loadOverview();
        const currentTab = document.querySelector('.dash-nav a.active')?.dataset.tab;
        if (currentTab && currentTab !== 'overview') loadTab(currentTab);
      });

    } catch (err) {
      console.error('❌ Dashboard init error:', err);
    }
  })();
}

// ============================================
// OVERVIEW
// ============================================
async function loadOverview() {
  try {
    console.log('📊 Loading overview...');

    // Galii waliigalaa
    const { data: donations, error: dErr } = await db
      .from('mn_donations')
      .select('amount, donor_phone')
      .eq('status', 'confirmed');

    if (dErr) console.error('❌ Donations error:', dErr);

    const raised = (donations || []).reduce((s, d) => s + Number(d.amount), 0);
    const pct = percent(raised, PROJECT_GOAL);
    const uniqueDonors = new Set((donations || []).map(d => d.donor_phone)).size;

    setText('kpiRaised', formatETB(raised));
    setText('kpiPercent', pct + '%');
    setText('kpiDonors', uniqueDonors);

    // Baasii
    const { data: expenses, error: eErr } = await db
      .from('mn_expenses')
      .select('amount');
    if (eErr) console.error('❌ Expenses error:', eErr);

    const totalExp = (expenses || []).reduce((s, e) => s + Number(e.amount), 0);
    setText('kpiExpenses', formatETB(totalExp));

    // Qabeenya
    const { data: assets, error: aErr } = await db
      .from('mn_assets')
      .select('id');
    if (aErr) console.error('❌ Assets error:', aErr);
    setText('kpiAssets', (assets || []).length);

    console.log('✅ Overview loaded');
  } catch (err) {
    console.error('❌ loadOverview error:', err);
  }
}

// ============================================
// TABS
// ============================================
async function loadTab(tab) {
  try {
    console.log('📂 Loading tab:', tab);

    if (tab === 'donations') {
      const { data, error } = await db
        .from('mn_donations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) console.error(error);
      renderDonationsTable(data || []);

    } else if (tab === 'expenses') {
      const { data, error } = await db
        .from('mn_expenses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error(error);
      renderExpensesTable(data || []);

    } else if (tab === 'assets') {
      const { data, error } = await db
        .from('mn_assets')
        .select('*')
        .order('id');
      if (error) console.error(error);
      renderAssetsTable(data || []);

    } else if (tab === 'rentals') {
      const { data, error } = await db
        .from('mn_rentals')
        .select('*')
        .order('id');
      if (error) console.error(error);
      renderRentalsTable(data || []);

    } else if (tab === 'masjidos') {
      const { data, error } = await db
        .from('mn_masjidos')
        .select('*')
        .order('name');
      if (error) console.error(error);
      renderMasjidosTable(data || []);

    } else if (tab === 'announcements') {
      const { data, error } = await db
        .from('mn_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error(error);
      renderAnnouncementsTable(data || []);
    }
  } catch (err) {
    console.error('❌ loadTab error:', err);
  }
}

// ============================================
// RENDERERS
// ============================================
function badge(s) {
  return `<span class="badge-status ${s}">${s}</span>`;
}

function renderDonationsTable(list) {
  const tb = document.querySelector('#donationsTable tbody');
  if (!tb) return;
  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="8">${t('table.empty')}</td></tr>`;
    return;
  }
  tb.innerHTML = list.map((d, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${d.donor_name || '—'}</td>
      <td>${d.donor_phone || '—'}</td>
      <td>${d.tier || '—'}</td>
      <td>${formatETB(d.amount)}</td>
      <td>${d.payment_method || '—'}</td>
      <td>${badge(d.status)}</td>
      <td>${new Date(d.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

function renderExpensesTable(list) {
  const tb = document.querySelector('#expensesTable tbody');
  if (!tb) return;
  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="6">${t('table.empty')}</td></tr>`;
    return;
  }
  tb.innerHTML = list.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${e.category}</td>
      <td>${e.description || '—'}</td>
      <td>${formatETB(e.amount)}</td>
      <td>${badge(e.status)}</td>
      <td>${new Date(e.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

function renderAssetsTable(list) {
  const tb = document.querySelector('#assetsTable tbody');
  if (!tb) return;
  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="6">${t('table.empty')}</td></tr>`;
    return;
  }
  tb.innerHTML = list.map((a, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${a.name}</td>
      <td>${a.category || '—'}</td>
      <td>${a.quantity}</td>
      <td>${formatETB(a.purchase_price || 0)}</td>
      <td>${a.purchase_date || '—'}</td>
    </tr>
  `).join('');
}

function renderRentalsTable(list) {
  const tb = document.querySelector('#rentalsTable tbody');
  if (!tb) return;
  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="5">${t('table.empty')}</td></tr>`;
    return;
  }
  tb.innerHTML = list.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${r.tenant_name}</td>
      <td>${r.space_description || '—'}</td>
      <td>${formatETB(r.monthly_rent || 0)}</td>
      <td>${badge(r.status)}</td>
    </tr>
  `).join('');
}

function renderMasjidosTable(list) {
  const tb = document.querySelector('#masjidosTable tbody');
  if (!tb) return;
  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="5">${t('table.empty')}</td></tr>`;
    return;
  }
  tb.innerHTML = list.map((m, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${m.name}</td>
      <td>${m.woreda}</td>
      <td>${m.kebele || '—'}</td>
      <td>${m.member_count}</td>
    </tr>
  `).join('');
}

function renderAnnouncementsTable(list) {
  const tb = document.querySelector('#announcementsTable tbody');
  if (!tb) return;
  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="4">${t('table.empty')}</td></tr>`;
    return;
  }
  tb.innerHTML = list.map((a, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${a.title}</td>
      <td>${a.body || '—'}</td>
      <td>${new Date(a.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}