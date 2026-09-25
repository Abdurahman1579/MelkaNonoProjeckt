// ============================================
// LOGIN.JS — Authentication
// Malka Noonoo Project
// ============================================

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', initLogin);

function initLogin() {
  console.log('🔐 Init login...');

  // Yoo duraan seenaa jira — dashboard deebi'i
  checkExistingSession();

  setupForm();
  setupPasswordToggle();
  setupLanguageSwitcher();
  setupRememberMe();
}

// ============================================
// CHECK EXISTING SESSION
// ============================================
async function checkExistingSession() {
  try {
    const { data: { session } } = await db.auth.getSession();
    if (session) {
      console.log('✅ Already logged in, redirecting to dashboard...');
      window.location.href = 'dashboard.html';
    }
  } catch (err) {
    console.warn('Session check error:', err);
  }
}

// ============================================
// FORM SUBMIT
// ============================================
function setupForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;

    const submitBtn = document.getElementById('submitBtn');
    const msgEl = document.getElementById('loginMsg');

    // Reset message
    msgEl.className = 'form-message';
    msgEl.textContent = '';

    // ---------- VALIDATION ----------
    if (!email || !email.includes('@')) {
      showError(msgEl, t('form.invalid.email') || 'Imeelii sirrii galchi');
      document.getElementById('email').focus();
      return;
    }

    if (!password || password.length < 6) {
      showError(msgEl, t('login.password.short') || 'Jechi darbii gabaabaa dha');
      document.getElementById('password').focus();
      return;
    }

    // ---------- SHOW LOADING ----------
    setLoading(submitBtn, true);

    console.log('🔐 Attempting login:', email);

    try {
      const { data, error } = await db.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Login error:', error);
        handleAuthError(msgEl, error);
        setLoading(submitBtn, false);
        return;
      }

      // ---------- SUCCESS ----------
      console.log('✅ Login successful:', data.user.email);

      // Remember me
      if (rememberMe) {
        localStorage.setItem('mn_remember_email', email);
        console.log('📌 Email remembered');
      } else {
        localStorage.removeItem('mn_remember_email');
      }

      // Success message
      msgEl.textContent = t('login.success') || '✅ Seensa milkaa\'e. Deebi\'aa jira...';
      msgEl.className = 'form-message success';

      // Toast notification
      if (window.toast) {
        toast.success(
          t('login.success.title') || 'Baga nagaan dhuftan',
          data.user.email
        );
      }

      // Redirect after 800ms
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);

    } catch (err) {
      console.error('❌ Unexpected error:', err);
      showError(msgEl, t('toast.server.error') || 'Server rakkoo qaba');
      setLoading(submitBtn, false);
    }
  });

  // Load remembered email
  const remembered = localStorage.getItem('mn_remember_email');
  if (remembered) {
    document.getElementById('email').value = remembered;
    const rememberCb = document.getElementById('rememberMe');
    if (rememberCb) rememberCb.checked = true;
    console.log('📌 Remembered email loaded');
    document.getElementById('password')?.focus();
  } else {
    document.getElementById('email')?.focus();
  }
}

// ============================================
// HANDLE AUTH ERROR
// ============================================
function handleAuthError(msgEl, error) {
  const msg = error.message || '';

  let userMessage = '';

  if (msg.includes('Invalid login credentials')) {
    userMessage = t('login.error.invalid') ||
      '❌ Imeelii ykn jecha darbii sirrii miti';
  } else if (msg.includes('Email not confirmed')) {
    userMessage = t('login.error.email_not_confirmed') ||
      '❌ Imeelii keessan mirkaneessuu qabdu. Email keessan ilaali.';
  } else if (msg.includes('User not found')) {
    userMessage = t('login.error.user_not_found') ||
      '❌ Fayyadamaan hin argamne. Galmaa\'i dura.';
  } else if (msg.includes('Too many requests')) {
    userMessage = t('login.error.rate_limit') ||
      '❌ Yeroo gabaabaa keessatti yaalii baay\'ee. Booda yaali.';
  } else if (msg.includes('network') || msg.includes('fetch')) {
    userMessage = t('toast.network.error') ||
      '❌ Internet connection hin jiru';
  } else {
    userMessage = '❌ ' + (msg || 'Seensa hin milkoofne');
  }

  showError(msgEl, userMessage);

  // Shake animation
  const card = document.querySelector('.auth-card');
  if (card) {
    card.style.animation = 'none';
    setTimeout(() => {
      card.style.animation = 'authShake 0.4s ease';
    }, 10);
  }
}

// ============================================
// SHOW ERROR
// ============================================
function showError(msgEl, message) {
  msgEl.textContent = message;
  msgEl.className = 'form-message error';
}

// ============================================
// SET LOADING STATE
// ============================================
function setLoading(btn, isLoading) {
  if (!btn) return;

  const textEl = btn.querySelector('.btn-text');
  const loaderEl = btn.querySelector('.btn-loader');

  if (isLoading) {
    btn.disabled = true;
    if (textEl) textEl.style.display = 'none';
    if (loaderEl) loaderEl.style.display = 'inline-flex';
  } else {
    btn.disabled = false;
    if (textEl) textEl.style.display = 'inline';
    if (loaderEl) loaderEl.style.display = 'none';
  }
}

// ============================================
// PASSWORD TOGGLE
// ============================================
function setupPasswordToggle() {
  const toggle = document.getElementById('togglePassword');
  const input = document.getElementById('password');

  if (!toggle || !input) return;

  toggle.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggle.textContent = isPassword ? '🙈' : '👁️';
    toggle.setAttribute('aria-label',
      isPassword ? 'Hide password' : 'Show password'
    );
  });
}

// ============================================
// LANGUAGE SWITCHER (Auth page — standalone)
// ============================================
function setupLanguageSwitcher() {
  const switcher = document.getElementById('authLangSwitcher');
  const btn = document.getElementById('authLangBtn');
  const menu = document.getElementById('authLangMenu');
  const label = document.getElementById('authLangLabel');

  if (!switcher || !btn || !menu) return;

  // Update label on init
  updateLangLabel();

  // Toggle menu
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    switcher.classList.toggle('open');
  });

  // Language items
  menu.querySelectorAll('.auth-lang-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = item.dataset.lang;

      if (typeof setLang === 'function') {
        setLang(lang);
      }

      // Update active state
      menu.querySelectorAll('.auth-lang-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Update label
      updateLangLabel();

      // Close menu
      switcher.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!switcher.contains(e.target)) {
      switcher.classList.remove('open');
    }
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      switcher.classList.remove('open');
    }
  });

  // Sync on language change
  window.addEventListener('languageChanged', () => {
    updateLangLabel();
    const current = getCurrentLang ? getCurrentLang() : 'om';
    menu.querySelectorAll('.auth-lang-item').forEach(i => {
      i.classList.toggle('active', i.dataset.lang === current);
    });
  });
}

function updateLangLabel() {
  const label = document.getElementById('authLangLabel');
  if (!label) return;

  const current = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'om';
  const names = {
    om: 'Oromiffa',
    am: 'አማርኛ',
    en: 'English'
  };
  label.textContent = names[current] || 'Oromiffa';
}

// ============================================
// REMEMBER ME
// ============================================
function setupRememberMe() {
  // Kun setupForm keessatti raawwatameera
  // Kun function duwwaa dha — booda dabalataaf
}

// ============================================
// SHAKE ANIMATION (CSS keessatti)
// ============================================
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes authShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);

// ============================================
// GLOBAL EXPORTS
// ============================================
window.showError = showError;
window.setLoading = setLoading;