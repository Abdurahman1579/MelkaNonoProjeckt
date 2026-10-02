// ============================================
// FAQ.JS — DB + i18n
// Malka Noonoo Project
// ============================================

console.log('❓ faq.js loaded');

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
const FALLBACK_FAQ = [
  // GENERAL
  { cat: 'general', qKey: 'faq.q1.q', aKey: 'faq.q1.a' },
  { cat: 'general', qKey: 'faq.q2.q', aKey: 'faq.q2.a' },
  { cat: 'general', qKey: 'faq.q3.q', aKey: 'faq.q3.a' },
  { cat: 'general', qKey: 'faq.q4.q', aKey: 'faq.q4.a' },

  // DONATION
  { cat: 'donation', qKey: 'faq.q5.q', aKey: 'faq.q5.a' },
  { cat: 'donation', qKey: 'faq.q6.q', aKey: 'faq.q6.a' },
  { cat: 'donation', qKey: 'faq.q7.q', aKey: 'faq.q7.a' },
  { cat: 'donation', qKey: 'faq.q8.q', aKey: 'faq.q8.a' },

  // PAYMENT
  { cat: 'payment', qKey: 'faq.q9.q', aKey: 'faq.q9.a' },
  { cat: 'payment', qKey: 'faq.q10.q', aKey: 'faq.q10.a' },
  { cat: 'payment', qKey: 'faq.q11.q', aKey: 'faq.q11.a' },
  { cat: 'payment', qKey: 'faq.q12.q', aKey: 'faq.q12.a' },

  // PROJECT
  { cat: 'project', qKey: 'faq.q13.q', aKey: 'faq.q13.a' },
  { cat: 'project', qKey: 'faq.q14.q', aKey: 'faq.q14.a' },
  { cat: 'project', qKey: 'faq.q15.q', aKey: 'faq.q15.a' },
  { cat: 'project', qKey: 'faq.q16.q', aKey: 'faq.q16.a' },

  // ACCOUNT
  { cat: 'account', qKey: 'faq.q17.q', aKey: 'faq.q17.a' },
  { cat: 'account', qKey: 'faq.q18.q', aKey: 'faq.q18.a' },
  { cat: 'account', qKey: 'faq.q19.q', aKey: 'faq.q19.a' },
  { cat: 'account', qKey: 'faq.q20.q', aKey: 'faq.q20.a' }
];

// ============================================
// 3. STATE
// ============================================
const faqState = {
  all: [],
  currentCategory: 'general',
  initialized: false,
  usedFallback: false
};

// ============================================
// 4. TRANSLATE ITEM
// ============================================
function translateFaq(f) {
  const lang = (typeof getCurrentLang === 'function')
    ? getCurrentLang()
    : (localStorage.getItem('mn_lang') || 'om');

  // Fallback items — keys
  if (f.qKey) {
    return {
      question: tr(f.qKey, ''),
      answer: tr(f.aKey, ''),
      category: f.cat
    };
  }

  // DB items — translation columns
  let question = f.question || '';
  let answer = f.answer || '';

  if (lang === 'am') {
    question = f.question_am || question;
    answer = f.answer_am || answer;
  } else if (lang === 'en') {
    question = f.question_en || question;
    answer = f.answer_en || answer;
  }

  return {
    question,
    answer,
    category: f.category || 'general'
  };
}

// ============================================
// 5. LOAD FROM DB
// ============================================
async function loadFaqFromDB() {
  try {
    console.log('❓ Fetching FAQ from mn_faqs...');

    const { data, error } = await db
      .from('mn_faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    if (!data || !data.length) {
      console.log('ℹ️ No FAQ from DB — using fallback');
      faqState.all = [...FALLBACK_FAQ];
      faqState.usedFallback = true;
      return;
    }

    faqState.all = data;
    faqState.usedFallback = false;

    console.log(`✅ Loaded ${data.length} FAQ from DB`);
  } catch (err) {
    console.error('❌ FAQ load error:', err);
    faqState.all = [...FALLBACK_FAQ];
    faqState.usedFallback = true;

    if (window.toast) {
      toast.warning(tr('toast.warning', 'Akeekkachiisa'), 'Sample FAQ fayyadamaa jira');
    }
  }
}

// ============================================
// 6. INIT
// ============================================
document.addEventListener('DOMContentLoaded', initFaq);

async function initFaq() {
  if (faqState.initialized) return;
  faqState.initialized = true;

  console.log('❓ Init FAQ...');

  // Skeleton
  const list = document.getElementById('faqList');
  if (list) {
    list.innerHTML = '<div class="loading">' + tr('loading.generic', 'Fe\'amaa jira...') + '</div>';
  }

  await loadFaqFromDB();
  setupFaqTabs();
  renderFaq();
}

// ============================================
// 7. TABS
// ============================================
function setupFaqTabs() {
  document.querySelectorAll('.faq-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.faq-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      faqState.currentCategory = btn.dataset.cat;
      renderFaq();
    });
  });
}

// ============================================
// 8. RENDER
// ============================================
function renderFaq() {
  const list = document.getElementById('faqList');
  if (!list) return;

  const filtered = faqState.all.filter(f => {
    const cat = f.cat || f.category || 'general';
    return cat === faqState.currentCategory;
  });

  if (!filtered.length) {
    list.innerHTML = `<div class="loading">${tr('faq.empty', 'Gaaffiin hin jiru.')}</div>`;
    return;
  }

  list.innerHTML = filtered.map((f, i) => {
    const t = translateFaq(f);
    return `
      <div class="faq-item" data-index="${i}">
        <div class="faq-question">
          <span>${escapeHtml(t.question)}</span>
          <span class="faq-icon">▾</span>
        </div>
        <div class="faq-answer">
          <div class="faq-answer-inner">${escapeHtml(t.answer).replace(/\n/g, '<br />')}</div>
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
// 9. LANGUAGE CHANGE
// ============================================
window.addEventListener('languageChanged', () => {
  console.log('🌐 Language changed — re-rendering FAQ');
  renderFaq();
});

// ============================================
// 10. GLOBAL EXPORTS
// ============================================
window.FALLBACK_FAQ = FALLBACK_FAQ;
window.renderFaq = renderFaq;
window.loadFaqFromDB = loadFaqFromDB;