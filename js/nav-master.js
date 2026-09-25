// ============================================
// NAV-MASTER.JS — Universal Nav + Theme
// Malka Noonoo Project
// Complete Final Version
// ============================================

(function() {
  'use strict';

  console.log('🚀 nav-master.js loaded');

  // ==========================================
  // 1. CONFIG
  // ==========================================
  const SKIP_PAGES = [
    'dashboard.html',
    'login.html',
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
  // 2. HELPERS
  // ==========================================
  function getCurrentPage() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  }

  function shouldSkipNav() {
    return SKIP_PAGES.includes(getCurrentPage());
  }

  function isMobile() {
    return window.innerWidth <= 900;
  }

  // ==========================================
  // 3. BUILD NAV HTML
  // ==========================================
  function buildNavHTML() {
    const currentPage = getCurrentPage();
    const currentLang = localStorage.getItem('mn_lang') || 'om';
    const currentLangName = LANGS.find(l => l.code === currentLang)?.name || 'Oromiffa';

    // Build main links
    const linksHTML = NAV_LINKS.map(link => {
      if (link.items) {
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
        return `
          <a href="${link.href}" 
             class="${link.href === currentPage ? 'active' : ''}"
             data-i18n="${link.key}">
            ${link.label}
          </a>
        `;
      }
    }).join('');

    // Language dropdown items
    const langItemsHTML = LANGS.map(lang => `
      <button class="nav-lang-item ${lang.code === currentLang ? 'active' : ''}" 
              type="button" 
              data-lang="${lang.code}">
        <span class="nav-lang-flag">${lang.flag}</span>
        <span class="nav-lang-name">${lang.name}</span>
        <span class="nav-lang-check">✓</span>
      </button>
    `).join('');

    // Mobile language buttons
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

            <!-- Mobile languages -->
            <div class="mobile-langs">
              ${mobileLangHTML}
            </div>
          </nav>

          <!-- ACTIONS -->
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
  // 4. INJECT NAV
  // ==========================================
  function injectNav() {
    if (shouldSkipNav()) {
      console.log('⏭️ Nav skipped for:', getCurrentPage());
      return false;
    }

    // Remove existing header
    const existing = document.querySelector('.header');
    if (existing) {
      existing.remove();
      console.log('🗑️ Old header removed');
    }

    // Build + insert
    const navHTML = buildNavHTML();
    const temp = document.createElement('div');
    temp.innerHTML = navHTML;
    const navElement = temp.firstElementChild;

    document.body.insertBefore(navElement, document.body.firstChild);
    console.log('✅ Nav injected');
    return true;
  }

  // ==========================================
  // 5. SETUP NAV EVENTS
  // ==========================================
  function setupNavEvents() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');

    // ----------------------------------------
    // 5.1 MOBILE MENU TOGGLE (Robust)
    // ----------------------------------------
    if (menuToggle && nav) {
      menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isOpen = nav.classList.toggle('open');
        menuToggle.textContent = isOpen ? '✕' : '☰';
        
        // Body scroll lock
        if (isOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
        
        console.log('📱 Menu:', isOpen ? 'OPEN' : 'CLOSED');
      });

      // Close menu on nav link click (mobile)
      nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          if (isMobile()) {
            nav.classList.remove('open');
            menuToggle.textContent = '☰';
            document.body.style.overflow = '';
          }
        });
      });
    }

    // ----------------------------------------
    // 5.2 DROPDOWN TOGGLES
    // ----------------------------------------
    document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const dropdown = this.closest('.nav-dropdown');
        if (!dropdown) return;

        const wasOpen = dropdown.classList.contains('open');

        // Close all other dropdowns
        document.querySelectorAll('.nav-dropdown').forEach(d => {
          if (d !== dropdown) d.classList.remove('open');
        });

        // Toggle current
        if (!wasOpen) {
          dropdown.classList.add('open');
        } else {
          dropdown.classList.remove('open');
        }
      });
    });

    // ----------------------------------------
    // 5.3 LANGUAGE SELECTION (Dropdown)
    // ----------------------------------------
    document.querySelectorAll('.nav-lang-item').forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const lang = this.dataset.lang;
        changeLanguage(lang);
        
        // Close dropdowns
        document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
      });
    });

    // ----------------------------------------
    // 5.4 LANGUAGE SELECTION (Mobile)
    // ----------------------------------------
    document.querySelectorAll('.lang-mobile').forEach(btn => {
      btn.addEventListener('click', function() {
        const lang = this.dataset.lang;
        changeLanguage(lang);
        
        // Close mobile menu
        if (nav) {
          nav.classList.remove('open');
          document.body.style.overflow = '';
        }
        if (menuToggle) menuToggle.textContent = '☰';
      });
    });

    // ----------------------------------------
    // 5.5 OUTSIDE CLICK — Close dropdowns/menu
    // ----------------------------------------
    document.addEventListener('click', (e) => {
      // Close dropdowns
      if (!e.target.closest('.nav-dropdown')) {
        document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
      }
      
      // Close mobile menu
      if (nav && menuToggle && nav.classList.contains('open')) {
        const clickedInsideNav = nav.contains(e.target);
        const clickedToggle = menuToggle.contains(e.target);
        
        if (!clickedInsideNav && !clickedToggle) {
          nav.classList.remove('open');
          menuToggle.textContent = '☰';
          document.body.style.overflow = '';
        }
      }
    });

    // ----------------------------------------
    // 5.6 ESC KEY
    // ----------------------------------------
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
        
        if (nav) {
          nav.classList.remove('open');
          document.body.style.overflow = '';
        }
        if (menuToggle) menuToggle.textContent = '☰';
      }
    });

    // ----------------------------------------
    // 5.7 RESIZE — Close menu on desktop
    // ----------------------------------------
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!isMobile() && nav && nav.classList.contains('open')) {
          nav.classList.remove('open');
          if (menuToggle) menuToggle.textContent = '☰';
          document.body.style.overflow = '';
        }
      }, 200);
    });

    // ----------------------------------------
    // 5.8 SCROLL EFFECT
    // ----------------------------------------
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

    console.log('✅ Nav events ready');
  }

  // ==========================================
  // 6. CHANGE LANGUAGE
  // ==========================================
  function changeLanguage(lang) {
    if (!lang) return;
    
    console.log('🌐 Changing language to:', lang);
    localStorage.setItem('mn_lang', lang);
    document.documentElement.lang = lang;
    
    // Update UI
    updateLanguageUI(lang);
    
    // Call external setLang if exists
    if (typeof window.setLang === 'function') {
      try {
        window.setLang(lang);
      } catch (err) {
        console.warn('setLang error:', err);
      }
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  function updateLanguageUI(lang) {
    const names = { om: 'Oromiffa', am: 'አማርኛ', en: 'English' };
    
    // Update label
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
  // 7. DARK MODE — Universal
  // ==========================================
  const THEME_KEY = 'mn_theme';

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');

    applyTheme(initial);

    // Setup toggle
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        
        // Toast feedback
        if (window.toast) {
          const names = { dark: '🌙 Dark Mode', light: '☀️ Light Mode' };
          toast.info(names[next], 'Ifa jijjiirameera');
        }
      });
    }

    // System preference listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });

    console.log('🎨 Theme initialized:', initial);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update icon
    const icon = document.querySelector('.theme-toggle .theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Update nav background (mobile menu)
    const nav = document.getElementById('nav');
    if (nav && isMobile()) {
      nav.style.background = theme === 'dark' ? '#1e293b' : '#ffffff';
    }
  }

  // ==========================================
  // 8. INIT
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

  // Run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ==========================================
  // 9. GLOBAL EXPORTS
  // ==========================================
  window.changeLanguage = changeLanguage;
  window.applyTheme = applyTheme;

})();