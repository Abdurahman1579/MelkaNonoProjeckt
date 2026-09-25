// ============================================
// NAV.JS — Dynamic Navigation
// Malka Noonoo Project
// ============================================

// ---------- CONFIG ----------
const NAV_CONFIG = {
  brand: {
    name: 'Malka Noonoo',
    subtitle: 'Mana Marii Dhimmoota Islaamummaa',
    icon: '☪',
    href: 'index.html'
  },
  links: [
    { key: 'nav.home', href: 'index.html', icon: '🏠' },
    { key: 'nav.about', href: 'about.html', icon: 'ℹ️' },
    {
      key: 'nav.project',
      label: 'Piroojektii',
      icon: '🏗️',
      items: [
        { key: 'nav.progress', href: 'progress.html', icon: '📊' },
        { key: 'nav.masjidos', href: 'masgidoota.html', icon: '🕌' },
        { key: 'nav.reports', href: 'reports.html', icon: '📈' },
        { key: 'nav.gallery', href: 'gallery.html', icon: '📸' }
      ]
    },
    {
      key: 'nav.info',
      label: 'Odeeffannoo',
      icon: '📰',
      items: [
        { key: 'nav.news', href: 'news.html', icon: '📢' },
        { key: 'nav.faq', href: 'faq.html', icon: '❓' },
        { key: 'nav.team', href: 'team.html', icon: '👥' },
        { key: 'nav.volunteer', href: 'volunteer.html', icon: '🤝' }
      ]
    },
    { key: 'nav.contact', href: 'contact.html', icon: '📞' }
  ]
};

// ============================================
// BUILD NAV HTML
// ============================================
function buildNav() {
  const currentPage = getCurrentPage();

  return `
    <header class="header">
      <div class="container header-inner">
        
        <!-- LOGO -->
        <a href="${NAV_CONFIG.brand.href}" class="logo">
          <div class="logo-mark">${NAV_CONFIG.brand.icon}</div>
          <div class="logo-text">
            <strong data-i18n="brand.name">${NAV_CONFIG.brand.name}</strong>
            <span data-i18n="brand.subtitle">${NAV_CONFIG.brand.subtitle}</span>
          </div>
        </a>

        <!-- NAV LINKS -->
        <nav class="nav" id="nav">
          ${NAV_CONFIG.links.map(link => {
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
                        <span>${t(item.key)}</span>
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
                  ${t(link.key)}
                </a>
              `;
            }
          }).join('')}
          
          <!-- Mobile language options -->
          <div class="mobile-langs">
            <button class="lang-mobile" type="button" data-lang="om">🇪🇹 Oromiffa</button>
            <button class="lang-mobile" type="button" data-lang="am">🇪🇹 አማርኛ</button>
            <button class="lang-mobile" type="button" data-lang="en">🇬🇧 English</button>
          </div>
        </nav>

        <!-- ACTIONS -->
        <div class="header-actions">
          <div class="lang-switcher" id="langSwitcher"></div>
          <a href="donate.html" class="btn btn-primary" data-i18n="nav.donate">Gumaachi</a>
          <button class="menu-toggle" id="menuToggle" type="button" aria-label="Menu">☰</button>
        </div>
      </div>
    </header>
  `;
}

// ============================================
// GET CURRENT PAGE
// ============================================
function getCurrentPage() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1);
  return filename || 'index.html';
}

// ============================================
// INJECT NAV
// ============================================
function injectNav() {
  // Yoo nav jira — haqi (bakka buusi)
  document.querySelector('.header')?.remove();

  // Body jalqabaa irratti nav galchi
  const temp = document.createElement('div');
  temp.innerHTML = buildNav();
  const navElement = temp.firstElementChild;

  document.body.insertBefore(navElement, document.body.firstChild);

  console.log('✅ Nav injected');
}

// ============================================
// SETUP NAV EVENTS
// ============================================
function setupNavEvents() {
  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('open');
      menuToggle.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });

    // Close menu on link click
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuToggle.textContent = '☰';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('open');
        menuToggle.textContent = '☰';
      }
    });
  }

  // Dropdown toggles
  document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = toggle.parentElement;
      const isOpen = dropdown.classList.contains('open');

      // Close all
      document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));

      // Toggle current
      if (!isOpen) {
        dropdown.classList.add('open');
      }
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    }
  });

  // Close dropdown on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
      document.getElementById('nav')?.classList.remove('open');
    }
  });
}

// ============================================
// INIT
// ============================================
function initNav() {
  console.log('🧭 Initializing nav...');
  injectNav();
  setupNavEvents();
  console.log('✅ Nav ready');
}

// Yeroo DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNav);
} else {
  initNav();
}

// Exports
window.initNav = initNav;