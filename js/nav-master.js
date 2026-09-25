// ============================================
// NAV-MASTER.JS — Universal Nav + Theme
// Malka Noonoo Project
// Works on ALL pages automatically
// ============================================

(function() {
  'use strict';

  console.log('🚀 nav-master.js loaded');

  // ==========================================
  // CONFIG
  // ==========================================
  const SKIP_PAGES = [
    'dashboard.html',   // Has its own sidebar
    'login.html',       // Auth page (own layout)
    'register.html',
    'forgot-password.html'
  ];

  const NAV_LINKS = [
    { key: 'nav.home', href: 'index.html', label: 'Fuula Duraa' },
    { key: 'nav.about', href: 'about.html', label: 'Waa\'ee' },
    {
      key: 'nav.project',
      label: 'Piroojektii',
      items: [
        { key: 'nav.progress', href: 'progress.html', icon: '📊', label: 'Sadarkaa' },
        { key: 'nav.masjidos', href: 'masgidoota.html', icon: '🕌', label: 'Masgiidota' },
        { key: 'nav.reports', href: 'reports.html', icon: '📈', label: 'Gabaasa' },
        { key: 'nav.gallery', href: 'gallery.html', icon: '📸', label: 'Suuraa' }
      ]
    },
    {
      key: 'nav.info',
      label: 'Odeeffannoo',
      items: [
        { key: 'nav.news', href: 'news.html', icon: '📢', label: 'Odeeffannoo' },
        { key: 'nav.faq', href: 'faq.html', icon: '❓', label: 'FAQ' },
        { key: 'nav.team', href: 'team.html', icon: '👥', label: 'Koree' },
        { key: 'nav.volunteer', href: 'volunteer.html', icon: '🤝', label: 'Fedhii' }
      ]
    },
    { key: 'nav.contact', href: 'contact.html', label: 'Quunnamtii' }
  ];

  const LANGS = [
    { code: 'om', name: 'Oromiffa', flag: '🇪🇹' },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  // ==========================================
  // DETECT PAGE
  // ==========================================
  function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    return filename;
  }

  function shouldSkipNav() {
    const currentPage = getCurrentPage();
    return SKIP_PAGES.includes(currentPage);
  }

  function isMobile() {
    return window.innerWidth <= 900;
  }

  // ==========================================
  // BUILD NAV HTML
  // ==========================================
  function buildNavHTML() {
    const currentPage = getCurrentPage();
    const currentLang = localStorage.getItem('mn_lang') || 'om';
    const currentLangName = LANGS.find(l => l.code === currentLang)?.name || 'Oromiffa';

    // Build main links
    const linksHTML = NAV_LINKS.map(link => {
      if (link.items) {
        // Dropdown
        const isActive = link.items.some(item => item.href === currentPage);
        return `
          <div class="nav-dropdown ${isActive ? 'active' : ''}">
            <button class="nav-dropdown-toggle" type="button">
              <span data-i18n="${link.key}">${link.label}</span>
              <span class="nav-caret">▾</span>
            </button>
            <div class="nav-dropdown-menu">
              ${link.items.map(item => `
                <a href="${item.href}" 
                   class="${item.href === currentPage ? 'active' : ''}"
                   data-i18n="${item.key}">
                  <span class="nav-item-icon">${item.icon}</span>
                  <span data-i18n="${item.key}">${item.label}</span>
                </a>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        // Simple link
        return `
          <a href="${link.href}" 
             class="${link.href === currentPage ? 'active' : ''}"
             data-i18n="${link.key}">
            ${link.label}
          </a>
        `;
      }
    }).join('');

    // Build language dropdown items
    const langItemsHTML = LANGS.map(lang => `
      <button class="nav-lang-item ${lang.code === currentLang ? 'active' : ''}" 
              type="button" 
              data-lang="${lang.code}">
        <span class="nav-lang-flag">${lang.flag}</span>
        <span class="nav-lang-name">${lang.name}</span>
        <span class="nav-lang-check">✓</span>
      </button>
    `).join('');

    // Build mobile language buttons
    const mobileLangHTML = LANGS.map(lang => `
      <button class="lang-mobile ${lang.code === currentLang ? 'active' : ''}" 
              type="button" 
              data-lang="${lang.code}">
        ${lang.flag} ${lang.name}
      </button>
    `).join('');

    return `
      <header class="header">
        <div class="container header-inner">
          
          <!-- LOGO -->
          <a href="index.html" class="logo">
            <div class="logo-mark">☪</div>
            <div class="logo-text">
              <strong data-i18n="brand.name">Malka Noonoo</strong>
              <span data-i18n="brand.subtitle">Mana Marii Dhimmoota Islaamummaa</span>
            </div>
          </a>

          <!-- NAV -->
          <nav class="nav" id="nav">
            ${linksHTML}

            <!-- Language Dropdown (desktop) -->
            <div class="nav-dropdown nav-dropdown-lang">
              <button class="nav-dropdown-toggle nav-lang-toggle" type="button">
                <span class="nav-lang-icon">🌐</span>
                <span class="nav-lang-current" id="navLangCurrent">${currentLangName}</span>
                <span class="nav-caret">▾</span>
              </button>
              <div class="nav-dropdown-menu nav-lang-menu">
                ${langItemsHTML}
              </div>
            </div>

            <!-- Mobile Languages (inline) -->
            <div class="mobile-langs">
              ${mobileLangHTML}
            </div>
          </nav>

          <!-- Actions -->
          <div class="header-actions">
            <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle theme">
              <span class="theme-icon">🌙</span>
            </button>
            <a href="donate.html" class="btn btn-primary" data-i18n="nav.donate">Gumaachi</a>
            <button class="menu-toggle" id="menuToggle" type="button" aria-label="Menu">☰</button>
          </div>

        </div>
      </header>
    `;
  }

  // ==========================================
  // INJECT NAV
  // ==========================================
  function injectNav() {
    if (shouldSkipNav()) {
      console.log('⏭️ Nav skipped for:', getCurrentPage());
      return false;
    }

    // Remove existing header (yoo jira)
    const existing = document.querySelector('.header');
    if (existing) {
      existing.remove();
      console.log('🗑️ Old header removed');
    }

    // Build new nav
    const navHTML = buildNavHTML();
    const temp = document.createElement('div');
    temp.innerHTML = navHTML;
    const navElement = temp.firstElementChild;

    // Insert at body start
    document.body.insertBefore(navElement, document.body.firstChild);
    console.log('✅ Nav injected');
    return true;
  }

  // ==========================================
  // SETUP NAV EVENTS
  // ==========================================
  function setupNavEvents() {
    console.log('🧭 Setting up nav events...');

    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');

    // ========================================
    // 1. Mobile menu toggle
    // ========================================
    if (menuToggle && nav) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const isOpen = nav.classList.toggle('open');
        menuToggle.textContent = isOpen ? '✕' : '☰';
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        
        // Body scroll lock
        if (isOpen && isMobile()) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
        
        console.log('📱 Menu toggled:', isOpen ? 'OPEN' : 'CLOSED');
      });

      // Close menu on link click (mobile only)
      nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          if (isMobile()) {
            nav.classList.remove('open');
            menuToggle.textContent = '☰';
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          }
        });
      });
    }

    // ========================================
    // 2. Dropdown toggles (Piroojektii, Odeeffannoo, Afaan)
    // ========================================
    document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const dropdown = toggle.closest('.nav-dropdown');
        if (!dropdown) return;

        const wasOpen = dropdown.classList.contains('open');

        // Close all other dropdowns
        document.querySelectorAll('.nav-dropdown').forEach(d => {
          if (d !== dropdown) d.classList.remove('open');
        });

        // Toggle current
        dropdown.classList.toggle('open', !wasOpen);
        
        console.log('📂 Dropdown:', wasOpen ? 'CLOSED' : 'OPEN');
      });
    });

    // ========================================
    // 3. Language selection (desktop dropdown)
    // ========================================
    document.querySelectorAll('.nav-lang-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        changeLanguage(item.dataset.lang);
        // Close all dropdowns
        document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
      });
    });

    // ========================================
    // 4. Language selection (mobile buttons)
    // ========================================
    document.querySelectorAll('.lang-mobile').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        changeLanguage(btn.dataset.lang);
        
        // Close mobile menu
        if (nav && menuToggle) {
          nav.classList.remove('open');
          menuToggle.textContent = '☰';
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });

    // ========================================
    // 5. Outside click — close dropdowns + menu
    // ========================================
    document.addEventListener('click', (e) => {
      // Close dropdowns
      if (!e.target.closest('.nav-dropdown')) {
        document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
      }
      
      // Close mobile menu
      if (nav && menuToggle) {
        const isMenuOpen = nav.classList.contains('open');
        const clickedInsideNav = nav.contains(e.target);
        const clickedToggle = menuToggle.contains(e.target);
        
        if (isMenuOpen && !clickedInsideNav && !clickedToggle) {
          nav.classList.remove('open');
          menuToggle.textContent = '☰';
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      }
    });

    // ========================================
    // 6. ESC key
    // ========================================
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close dropdowns
        document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
        
        // Close mobile menu
        if (nav && menuToggle) {
          nav.classList.remove('open');
          menuToggle.textContent = '☰';
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      }
    });

    // ========================================
    // 7. Window resize — reset states
    // ========================================
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Yoo desktop ta'e — mobile menu cufi
        if (!isMobile() && nav && menuToggle) {
          nav.classList.remove('open');
          menuToggle.textContent = '☰';
          document.body.style.overflow = '';
        }
      }, 200);
    });

    // ========================================
    // 8. Scroll effect
    // ========================================
    const header = document.querySelector('.header');
    if (header) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (window.scrollY > 20) {
              header.classList.add('scrolled');
            } else {
              header.classList.remove('scrolled');
            }
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }

    // ========================================
    // 9. Sync language on change
    // ========================================
    window.addEventListener('languageChanged', (e) => {
      const lang = e.detail?.lang;
      if (!lang) return;
      updateLanguageUI(lang);
    });

    // ========================================
    // 10. Initial language state
    // ========================================
    const currentLang = (typeof window.getCurrentLang === 'function') 
      ? window.getCurrentLang() 
      : (localStorage.getItem('mn_lang') || 'om');
    updateLanguageUI(currentLang);

    console.log('✅ Nav events ready');
  }

  // ==========================================
  // CHANGE LANGUAGE
  // ==========================================
  function changeLanguage(lang) {
    if (!lang) return;

    console.log('🌐 Changing language to:', lang);
    localStorage.setItem('mn_lang', lang);
    document.documentElement.lang = lang;

    // Update UI instantly
    updateLanguageUI(lang);

    // Call external setLang (i18n.js) if exists
    if (typeof window.setLang === 'function') {
      try {
        window.setLang(lang);
      } catch (err) {
        console.warn('setLang error:', err);
      }
    } else {
      // Fallback: reload page
      console.log('⚠️ setLang not found — reloading page');
      setTimeout(() => window.location.reload(), 100);
      return;
    }

    // Dispatch event for other scripts
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  function updateLanguageUI(lang) {
    const names = { om: 'Oromiffa', am: 'አማርኛ', en: 'English' };
    
    // Update current label (desktop dropdown)
    const currentEl = document.getElementById('navLangCurrent');
    if (currentEl) currentEl.textContent = names[lang] || 'Oromiffa';

    // Update active states
    document.querySelectorAll('.nav-lang-item').forEach(i => {
      i.classList.toggle('active', i.dataset.lang === lang);
    });
    document.querySelectorAll('.lang-mobile').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  // ==========================================
  // DARK MODE — Universal
  // ==========================================
  function initTheme() {
    const THEME_KEY = 'mn_theme';
    
    // Determine initial theme
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');

    applyTheme(initial);

    // Setup toggle button
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        
        // Toast feedback
        if (window.toast && typeof window.toast.info === 'function') {
          const names = { dark: '🌙 Dark Mode', light: '☀️ Light Mode' };
          window.toast.info(names[next], 'Ifa jijjiirameera');
        }
      });
    }

    // Listen to system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });

    console.log('🎨 Theme initialized:', initial);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mn_theme', theme);

    // Update toggle icon
    const icon = document.querySelector('.theme-toggle .theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // ==========================================
  // INIT
  // ==========================================
  function init() {
    console.log('🚀 nav-master init...');

    const navInjected = injectNav();

    if (navInjected) {
      setupNavEvents();
      console.log('✅ Nav ready');
    }

    // Theme always (even dashboard/login)
    initTheme();

    console.log('✅ nav-master ready');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ==========================================
  // GLOBAL EXPORTS
  // ==========================================
  window.changeLanguage = changeLanguage;
  window.applyTheme = applyTheme;
  window.updateLanguageUI = updateLanguageUI;

})();