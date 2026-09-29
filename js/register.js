// ============================================
// REGISTER.JS — User Registration
// Malka Noonoo Project
// ============================================

(function () {
  'use strict';

  console.log('📝 register.js loaded');

  document.addEventListener('DOMContentLoaded', initRegister);

  function initRegister() {
    // Yoo duraan seenaa jira — dashboard deebi'i
    checkExistingSession();

    setupForm();
    setupPasswordToggle();
    setupLanguageSwitcher();
    setupConfirmPassword();
  }

  // ==========================================
  // CHECK EXISTING SESSION
  // ==========================================
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

  // ==========================================
  // FORM SUBMIT
  // ==========================================
  function setupForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const agreeTerms = document.getElementById('agreeTerms').checked;

      const submitBtn = document.getElementById('submitBtn');
      const msgEl = document.getElementById('registerMsg');

      // Reset message
      msgEl.className = 'form-message';
      msgEl.textContent = '';

      // ---------- VALIDATION ----------
      if (!fullName || fullName.length < 2) {
        return showError(msgEl, '❌ Maqaa guutuu galchi (2+ characters)');
      }

      if (!email || !email.includes('@') || !email.includes('.')) {
        return showError(msgEl, '❌ Imeelii sirrii galchi');
      }

      if (phone && phone.length < 9) {
        return showError(msgEl, '❌ Bilbila sirrii galchi (09xxxxxxxx)');
      }

      if (!password || password.length < 8) {
        return showError(
          msgEl,
          '❌ Jechi darbii xiqqaadhaan 8 characters ta\'uu qaba'
        );
      }

      if (password !== confirmPassword) {
        return showError(msgEl, '❌ Jechi darbii wal hin simu');
      }

      if (!agreeTerms) {
        return showError(msgEl, '❌ Waliigaltee fi Imaammata fudhadhu');
      }

      // ---------- LOADING ----------
      setLoading(submitBtn, true);

      console.log('📝 Attempting registration:', email);

      try {
        // 1. Supabase Auth signUp
        const { data: authData, error: authError } = await db.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone || null
            }
          }
        });

        if (authError) {
          console.error('❌ Auth error:', authError);
          handleAuthError(msgEl, authError);
          setLoading(submitBtn, false);
          return;
        }

        console.log('✅ Auth user created:', authData.user?.email);

        // 2. Profile row uumi (yoo session jira)
        if (authData.user) {
          const { error: profileError } = await db
            .from('mn_profiles')
            .insert([
              {
                id: authData.user.id,
                full_name: fullName,
                phone: phone || null,
                role: 'user'
              }
            ]);

          if (profileError) {
            console.warn('⚠️ Profile insert error:', profileError.message);
            // Rakkoo miti — RLS ykn auto-profile
          } else {
            console.log('✅ Profile created');
          }
        }

        // ---------- SUCCESS ----------
        if (authData.session) {
          // Email confirmation OFF — direct login
          msgEl.textContent =
            t('register.success') || '✅ Galmeen milkaa\'eera!';
          msgEl.className = 'form-message success';

          if (window.toast) {
            toast.success('Baga nagaan dhuftan!', fullName);
          }

          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1500);
        } else {
          // Email confirmation ON — verify email
          msgEl.innerHTML = `
            ✅ Galmeen milkaa\'eera!<br/>
            <small>Imeelii keessan <strong>${email}</strong> irratti mirkaneessuu linkii ergameera. Imeelii keessan ilaalaa — Spam folderis ilaalaa!</small>
          `;
          msgEl.className = 'form-message success';

          if (window.toast) {
            toast.info(
              'Imeelii Mirkaneessi',
              'Email keessan keessa linkii argattu'
            );
          }

          setTimeout(() => {
            window.location.href = 'login.html';
          }, 4000);
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        showError(msgEl, '❌ Server rakkoo qaba. Booda yaali.');
      } finally {
        setLoading(submitBtn, false);
      }
    });
  }

  // ==========================================
  // HANDLE AUTH ERROR
  // ==========================================
  function handleAuthError(msgEl, error) {
    const msg = error.message || '';
    let userMessage = '';

    if (msg.includes('already registered') || msg.includes('already exists')) {
      userMessage = '❌ Imeeliin kun duraan galmaa\'eera. Seensa yaali.';
    } else if (msg.includes('invalid email')) {
      userMessage = '❌ Imeelii sirrii galchi';
    } else if (msg.includes('Password')) {
      userMessage = '❌ Jechi darbii cimaa filadhu (8+ characters)';
    } else if (msg.includes('Too many requests')) {
      userMessage = '❌ Yeroo gabaabaa keessatti yaalii baay\'ee. Booda yaali.';
    } else if (msg.includes('network') || msg.includes('fetch')) {
      userMessage = '❌ Internet connection hin jiru';
    } else {
      userMessage = '❌ ' + (msg || 'Galmeen hin milkoofne');
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

  // ==========================================
  // SHOW ERROR
  // ==========================================
  function showError(msgEl, message) {
    msgEl.textContent = message;
    msgEl.className = 'form-message error';
  }

  // ==========================================
  // SET LOADING
  // ==========================================
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

  // ==========================================
  // PASSWORD TOGGLE
  // ==========================================
  function setupPasswordToggle() {
    const toggle = document.getElementById('togglePassword');
    const input = document.getElementById('password');
    if (!toggle || !input) return;

    toggle.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      toggle.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // ==========================================
  // CONFIRM PASSWORD (real-time check)
  // ==========================================
  function setupConfirmPassword() {
    const password = document.getElementById('password');
    const confirm = document.getElementById('confirmPassword');
    if (!password || !confirm) return;

    function checkMatch() {
      if (!confirm.value) {
        confirm.style.borderColor = '';
        return;
      }
      if (password.value === confirm.value) {
        confirm.style.borderColor = '#22a06b';
      } else {
        confirm.style.borderColor = '#ef4444';
      }
    }

    password.addEventListener('input', checkMatch);
    confirm.addEventListener('input', checkMatch);
  }

  // ==========================================
  // LANGUAGE SWITCHER
  // ==========================================
  function setupLanguageSwitcher() {
    const switcher = document.getElementById('authLangSwitcher');
    const btn = document.getElementById('authLangBtn');
    const menu = document.getElementById('authLangMenu');

    if (!switcher || !btn || !menu) return;

    updateLangLabel();

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      switcher.classList.toggle('open');
    });

    menu.querySelectorAll('.auth-lang-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = item.dataset.lang;

        if (typeof setLang === 'function') setLang(lang);

        menu
          .querySelectorAll('.auth-lang-item')
          .forEach((i) => i.classList.remove('active'));
        item.classList.add('active');
        updateLangLabel();
        switcher.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!switcher.contains(e.target)) {
        switcher.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') switcher.classList.remove('open');
    });

    window.addEventListener('languageChanged', () => {
      updateLangLabel();
      const current =
        typeof getCurrentLang === 'function' ? getCurrentLang() : 'om';
      menu.querySelectorAll('.auth-lang-item').forEach((i) => {
        i.classList.toggle('active', i.dataset.lang === current);
      });
    });
  }

  function updateLangLabel() {
    const label = document.getElementById('authLangLabel');
    if (!label) return;

    const current =
      typeof getCurrentLang === 'function' ? getCurrentLang() : 'om';
    const names = { om: 'Oromiffa', am: 'አማርኛ', en: 'English' };
    label.textContent = names[current] || 'Oromiffa';
  }

  // ==========================================
  // SHAKE ANIMATION (inject yoo hin jiraanne)
  // ==========================================
  if (!document.getElementById('authShakeStyle')) {
    const style = document.createElement('style');
    style.id = 'authShakeStyle';
    style.textContent = `
      @keyframes authShake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-8px); }
        40% { transform: translateX(8px); }
        60% { transform: translateX(-6px); }
        80% { transform: translateX(6px); }
      }
    `;
    document.head.appendChild(style);
  }
})();