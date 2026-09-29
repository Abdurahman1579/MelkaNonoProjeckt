// ============================================
// FAQ PAGE — I18N SUPPORT
// Malka Noonoo Project
// ============================================

console.log('❓ faq.js loaded');

// ============================================
// 1. FAQ DATA — Keys qofa (translations.js irraa dhufu)
// ============================================
const FAQ_DATA = [
  // ---------- GENERAL ----------
  { cat: 'general', qKey: 'faq.q1.q', aKey: 'faq.q1.a' },
  { cat: 'general', qKey: 'faq.q2.q', aKey: 'faq.q2.a' },
  { cat: 'general', qKey: 'faq.q3.q', aKey: 'faq.q3.a' },
  { cat: 'general', qKey: 'faq.q4.q', aKey: 'faq.q4.a' },

  // ---------- DONATION ----------
  { cat: 'donation', qKey: 'faq.q5.q', aKey: 'faq.q5.a' },
  { cat: 'donation', qKey: 'faq.q6.q', aKey: 'faq.q6.a' },
  { cat: 'donation', qKey: 'faq.q7.q', aKey: 'faq.q7.a' },
  { cat: 'donation', qKey: 'faq.q8.q', aKey: 'faq.q8.a' },

  // ---------- PAYMENT ----------
  { cat: 'payment', qKey: 'faq.q9.q', aKey: 'faq.q9.a' },
  { cat: 'payment', qKey: 'faq.q10.q', aKey: 'faq.q10.a' },
  { cat: 'payment', qKey: 'faq.q11.q', aKey: 'faq.q11.a' },
  { cat: 'payment', qKey: 'faq.q12.q', aKey: 'faq.q12.a' },

  // ---------- PROJECT ----------
  { cat: 'project', qKey: 'faq.q13.q', aKey: 'faq.q13.a' },
  { cat: 'project', qKey: 'faq.q14.q', aKey: 'faq.q14.a' },
  { cat: 'project', qKey: 'faq.q15.q', aKey: 'faq.q15.a' },
  { cat: 'project', qKey: 'faq.q16.q', aKey: 'faq.q16.a' },

  // ---------- ACCOUNT ----------
  { cat: 'account', qKey: 'faq.q17.q', aKey: 'faq.q17.a' },
  { cat: 'account', qKey: 'faq.q18.q', aKey: 'faq.q18.a' },
  { cat: 'account', qKey: 'faq.q19.q', aKey: 'faq.q19.a' },
  { cat: 'account', qKey: 'faq.q20.q', aKey: 'faq.q20.a' }
];

let currentCategory = 'general';

// ============================================
// 2. INIT
// ============================================
document.addEventListener('DOMContentLoaded', initFaq);
window.addEventListener('languageChanged', renderFaq);

function initFaq() {
  setupFaqTabs();
  renderFaq();
}

// ============================================
// 3. TABS
// ============================================
function setupFaqTabs() {
  document.querySelectorAll('.faq-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.faq-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      renderFaq();
    });
  });
}

// ============================================
// 4. RENDER FAQ
// ============================================
function renderFaq() {
  const list = document.getElementById('faqList');
  if (!list) return;

  const filtered = FAQ_DATA.filter(f => f.cat === currentCategory);

  if (!filtered.length) {
    list.innerHTML = `<div class="loading">${tr('faq.empty', 'Gaaffiin hin jiru.')}</div>`;
    return;
  }

  list.innerHTML = filtered.map((f, i) => {
    const q = tr(f.qKey, '');
    const a = tr(f.aKey, '');

    return `
      <div class="faq-item" data-index="${i}">
        <div class="faq-question">
          <span>${escapeHtml(q)}</span>
          <span class="faq-icon">▾</span>
        </div>
        <div class="faq-answer">
          <div class="faq-answer-inner">${escapeHtml(a).replace(/\n/g, '<br />')}</div>
        </div>
      </div>
    `;
  }).join('');

  // Toggle handlers
  list.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      // Close all
      list.querySelectorAll('.faq-item').forEach(it => {
        it.classList.remove('open');
        const ans = it.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = null;
      });

      // Open this
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// ============================================
// 5. HELPERS
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
// 6. GLOBAL EXPORTS
// ============================================
window.FAQ_DATA = FAQ_DATA;
window.renderFaq = renderFaq;