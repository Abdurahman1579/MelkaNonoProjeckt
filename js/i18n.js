// ============================================
// i18n — Multi-language Engine (FIXED)
// ============================================

const LANG_KEY = 'mn_lang';

// ---------- Helper ----------
function getCurrentLang() {
  return localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
}

function setLang(lang) {
  if (!TRANSLATIONS[lang]) lang = DEFAULT_LANG;
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
  applyTranslations();
  updateLangSwitcher(lang);
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  console.log('🌐 Language changed to:', lang);
}

function t(key, fallback = '') {
  const lang = getCurrentLang();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
  return dict[key] || TRANSLATIONS[DEFAULT_LANG][key] || fallback || key;
}

// ---------- Apply ----------
function applyTranslations() {
  let applied = 0, missing = [];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const text = t(key);
    if (text && text !== key) {
      el.textContent = text;
      applied++;
    } else {
      missing.push(key);
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const text = t(key);
    if (text) el.placeholder = text;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    const text = t(key);
    if (text) el.innerHTML = text;
  });

  // Title
  const titleKey = document.body.dataset.pageTitle;
  if (titleKey) {
    document.title = t(titleKey) + ' — ' + t('brand.name');
  }

  // Mobile lang buttons active state
  document.querySelectorAll('.lang-mobile').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === getCurrentLang());
  });

  console.log(`✅ Translations applied: ${applied} elements`);
  if (missing.length) console.warn('⚠️ Missing keys:', missing);
}

// ---------- Lang Switcher ----------
function renderLangSwitcher() {
  const holder = document.getElementById('langSwitcher');
  if (!holder) {
    console.warn('⚠️ #langSwitcher element not found');
    return;
  }

  const current = getCurrentLang();
  const langs = [
    { code: 'om', label: 'Oromiffa', flag: '🇪🇹' },
    { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];
  const currentLabel = langs.find(l => l.code === current)?.label || 'Oromiffa';

  holder.innerHTML = `
    <button class="lang-btn" id="langBtn" type="button" aria-label="Language">
      🌐 <span>${currentLabel}</span>
      <span class="lang-caret">▾</span>
    </button>
    <div class="lang-menu" id="langMenu">
      ${langs.map(l => `
        <button class="lang-item ${l.code === current ? 'active' : ''}" 
                type="button" 
                data-lang="${l.code}">
          ${l.flag} ${l.label}
        </button>
      `).join('')}
    </div>
  `;

  const btn = document.getElementById('langBtn');
  const menu = document.getElementById('langMenu');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('open');
  });

  menu.querySelectorAll('.lang-item').forEach(item => {
    item.addEventListener('click', () => {
      setLang(item.dataset.lang);
      menu.classList.remove('open');
    });
  });

  document.addEventListener('click', () => menu.classList.remove('open'));

  console.log('🌐 Lang switcher rendered. Current:', current);
}

function updateLangSwitcher(lang) {
  const btn = document.getElementById('langBtn');
  const labels = { om: 'Oromiffa', am: 'አማርኛ', en: 'English' };
  if (btn) {
    const span = btn.querySelector('span');
    if (span) span.textContent = labels[lang] || 'Oromiffa';
  }
  document.querySelectorAll('.lang-item').forEach(el => {
    el.classList.toggle('active', el.dataset.lang === lang);
  });
  document.querySelectorAll('.lang-mobile').forEach(el => {
    el.classList.toggle('active', el.dataset.lang === lang);
  });
}

// ---------- INIT ----------
function initI18n() {
  console.log('🚀 Init i18n...');
  console.log('📚 Translations available:', Object.keys(TRANSLATIONS));
  document.documentElement.lang = getCurrentLang();
  renderLangSwitcher();
  applyTranslations();

  // Mobile lang buttons
  document.querySelectorAll('.lang-mobile').forEach(btn => {
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
      document.getElementById('nav')?.classList.remove('open');
    });
  });
}

// Run as soon as possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}