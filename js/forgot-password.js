// ============================================
// FORGOT-PASSWORD.JS — Password Reset
// Malka Noonoo Project
// ============================================

(function () {
  'use strict';

  console.log('🔑 forgot-password.js loaded');

  document.addEventListener('DOMContentLoaded', initForgotPassword);

  function initForgotPassword() {
    setupForm();
    setupLanguageSwitcher();
  }

  // ==========================================
  // FORM SUBMIT
  // ==========================================
  function setupForm() {
    const form = document.getElementById('forgotForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const msgEl = document.getElementById('forgotMsg');
      const submitBtn = document.getElementById('submitBtn');

      msgEl.className = 'form-message';
      msgEl.textContent = '';

      // Validation
      if (!email || !email.includes('@') || !email.includes('.')) {
        return showError(msgEl, '❌ Imeelii sirrii galchi');
      }

      // Loading
      setLoading(submitBtn, true);

      console.log('🔑 Sending reset link to:', email);

      try {
        const { error } = await db.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/login.html'
        });

        if (error) {
          console.error('❌ Reset error:', error);
          handleError(msgEl, error);
          setLoading(submitBtn, false);
          return;
        }

        // Success
        msgEl.innerHTML = `
          ✅ Linkiin haaromsaa imeelii keessaniif ergameera.<br/>
          <small>Imeelii keessan <strong>${email}</strong> ilaalaa — Spam folderis ilaalaa. Linkiin sa'aatii 1 keessatti hojjeta.</small>
        `;
        msgEl.className = 'form-message success';

        if (window.toast) {
          toast.success('Imeelii Ergameera', 'Imeelii keessan ilaalaa');
        }

        // Reset form
        form.reset();

        // Yeroo muraasa booda login deebi'i
        setTimeout(() => {
          console.log('📭 Redirecting to login...');
        }, 3000);
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        showError(msgEl, '❌ Server rakkoo qaba. Booda yaali.');
      } finally {
        setLoading(submitBtn, false);
      }
    });
  }

  // ==========================================
  // HANDLE ERROR
  // ==========================================
  function handleError(msgEl, error) {
    const msg = error.message || '';
    let userMessage = '';

    if (msg.includes('User not found')) {
      userMessage = '❌ Imeeliin kun hin galmoofne. Galmaa\'i dura.';
    } else if (msg.includes('Too many requests')) {
      userMessage =
        '❌ Yeroo gabaabaa keessatti yaalii baay\'ee. Daqiiqaa 5 booda yaali.';
    } else if (msg.includes('network') || msg.includes('fetch')) {
      userMessage = '❌ Internet connection hin jiru';
    } else {
      userMessage = '❌ ' + (msg || 'Erguun hin milkoofne');
    }

    showError(msgEl, userMessage);
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
})();