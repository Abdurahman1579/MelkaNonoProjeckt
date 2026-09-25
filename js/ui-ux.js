// ============================================
// UI-UX.JS — Advanced Components
// Malka Noonoo Project
// ============================================

// ============================================
// 33. DARK MODE TOGGLE
// ============================================
const THEME_KEY = 'mn_theme';

function initDarkMode() {
  // Check saved theme or system preference
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');

  setTheme(theme);

  // Add toggle button to header
  const headerActions = document.querySelector('.header-actions');
  if (headerActions && !document.querySelector('.theme-toggle')) {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.type = 'button';
    btn.addEventListener('click', toggleTheme);
    // Insert before lang switcher
    const langSwitcher = document.getElementById('langSwitcher');
    if (langSwitcher) {
      headerActions.insertBefore(btn, langSwitcher);
    } else {
      headerActions.appendChild(btn);
    }
    updateThemeIcon();
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  updateThemeIcon();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  showToast({
    type: 'info',
    title: next === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode',
    message: next === 'dark' ? 'Ifa dukkanaa jalqabameera' : 'Ifa ifaa jalqabameera',
    duration: 2000
  });
}

function updateThemeIcon() {
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  const theme = document.documentElement.getAttribute('data-theme');
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Listen to system changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem(THEME_KEY)) {
    setTheme(e.matches ? 'dark' : 'light');
  }
});

// ============================================
// 34. LOADING SKELETONS
// ============================================
function skeletonCard() {
  return `
    <div class="skeleton-card">
      <div class="skeleton skeleton-image" style="height: 160px; margin-bottom: 16px;"></div>
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text sm"></div>
      <div class="skeleton skeleton-text" style="width: 40%;"></div>
    </div>
  `;
}

function skeletonText(lines = 3) {
  let html = '';
  for (let i = 0; i < lines; i++) {
    const width = i === lines - 1 ? '60%' : '100%';
    html += `<div class="skeleton skeleton-text" style="width: ${width};"></div>`;
  }
  return html;
}

function skeletonGrid(count = 6, type = 'card') {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += type === 'card' ? skeletonCard() : skeletonText();
  }
  return html;
}

// Show skeleton in element
function showSkeleton(element, count = 6) {
  if (!element) return;
  element.innerHTML = skeletonGrid(count);
}

// ============================================
// 35. TOAST NOTIFICATIONS
// ============================================
function ensureToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showToast({
  type = 'info',
  title = '',
  message = '',
  duration = 4000,
  showProgress = true
} = {}) {
  const container = ensureToastContainer();

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-body">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close" aria-label="Close">×</button>
    ${showProgress && duration > 0 ? `<div class="toast-progress" style="animation-duration: ${duration}ms;"></div>` : ''}
  `;

  container.appendChild(toast);

  // Close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    removeToast(toast);
  });

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }

  return toast;
}

function removeToast(toast) {
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 300);
}

// Shortcuts
const toast = {
  success: (title, message, duration) => showToast({ type: 'success', title, message, duration }),
  error: (title, message, duration) => showToast({ type: 'error', title, message, duration: duration || 6000 }),
  warning: (title, message, duration) => showToast({ type: 'warning', title, message, duration }),
  info: (title, message, duration) => showToast({ type: 'info', title, message, duration })
};

// ============================================
// 36. BREADCRUMBS
// ============================================
function generateBreadcrumbs() {
  const container = document.querySelector('.page-hero .container');
  if (!container) return;

  // Don't add on home page
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1);
  if (filename === 'index.html' || filename === '' || filename === '/') return;

  const routeNames = {
    'about.html': 'Waa\'ee',
    'progress.html': 'Sadarkaa',
    'masgidoota.html': 'Masgiidota',
    'news.html': 'Odeeffannoo',
    'gallery.html': 'Suuraa',
    'reports.html': 'Gabaasa',
    'faq.html': 'FAQ',
    'team.html': 'Koree',
    'volunteer.html': 'Fedhii',
    'contact.html': 'Quunnamtii',
    'donate.html': 'Gumaachi',
    'login.html': 'Seensa',
    'privacy.html': 'Iccitii',
    'terms.html': 'Waliigaltee'
  };

  const currentPage = routeNames[filename];
  if (!currentPage) return;

  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';
  breadcrumbs.setAttribute('aria-label', 'Breadcrumb');

  breadcrumbs.innerHTML = `
    <a href="index.html" class="breadcrumb-item">
      <span>🏠</span> ${t('nav.home') || 'Fuula Duraa'}
    </a>
    <span class="breadcrumb-separator">›</span>
    <span class="breadcrumb-item active">${currentPage}</span>
  `;

  // Insert at top of page-hero container
  container.insertBefore(breadcrumbs, container.firstChild);
}

// ============================================
// 37. BACK TO TOP
// ============================================
function initBackToTop() {
  // Create button
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.type = 'button';
  btn.innerHTML = '<span>↑</span>';
  document.body.appendChild(btn);

  // Show/hide on scroll
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 400) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  // Scroll to top
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================
// 38. AOS ANIMATIONS
// ============================================
function initAOS() {
  // If element has data-aos, observe it
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        // Unobserve after animation
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// Auto-add data-aos to common elements
function autoAOS() {
  // Auto-animate cards, tiers, sections
  const autoTargets = document.querySelectorAll(
    '.card:not([data-aos]), .tier:not([data-aos]), ' +
    '.news-card:not([data-aos]), .team-card:not([data-aos]), ' +
    '.benefit-card:not([data-aos]), .role-card:not([data-aos]), ' +
    '.section-head:not([data-aos])'
  );

  autoTargets.forEach((el, i) => {
    el.setAttribute('data-aos', 'fade-up');
    el.setAttribute('data-aos-delay', String((i % 4) * 100));
  });

  initAOS();
}

// ============================================
// 39. CUSTOM SVG — Icons / Empty States
// ============================================
function createEmptyState({
  icon = '📭',
  title = 'Hin jiru',
  message = 'Odeeffannoon hin jiru.',
  actionText = '',
  actionHref = ''
} = {}) {
  return `
    <div class="empty-state">
      <div class="empty-state-illustration">${icon}</div>
      <h3 class="empty-state-title">${title}</h3>
      <p class="empty-state-desc">${message}</p>
      ${actionText ? `<a href="${actionHref}" class="btn btn-primary">${actionText}</a>` : ''}
    </div>
  `;
}

// Preload common SVG illustrations
const SVG_ICONS = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
};

// ============================================
// 40. MODAL DIALOGS (Reusable)
// ============================================
let activeModal = null;

function openModal({
  title = '',
  body = '',
  size = 'md', // sm, md, lg, full
  showFooter = false,
  footerHTML = '',
  onOpen = null,
  onClose = null
} = {}) {
  // Close existing
  if (activeModal) closeModal();

  const modal = document.createElement('div');
  modal.className = 'modal-base';
  modal.innerHTML = `
    <div class="modal-base-content modal-${size}">
      <div class="modal-base-header">
        <h3 class="modal-base-title">${title}</h3>
        <button class="modal-base-close" aria-label="Close">×</button>
      </div>
      <div class="modal-base-body">${body}</div>
      ${showFooter ? `<div class="modal-base-footer">${footerHTML}</div>` : ''}
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Trigger animation
  requestAnimationFrame(() => modal.classList.add('open'));

  activeModal = modal;

  // Close handlers
  modal.querySelector('.modal-base-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  if (onOpen) onOpen(modal);

  return {
    modal,
    close: closeModal,
    setBody: (html) => {
      modal.querySelector('.modal-base-body').innerHTML = html;
    }
  };
}

function closeModal() {
  if (!activeModal) return;

  const modal = activeModal;
  modal.classList.add('closing');

  setTimeout(() => {
    modal.remove();
    document.body.style.overflow = '';
    activeModal = null;
  }, 200);
}

// Confirm dialog (convenience)
function confirmDialog({
  title = 'Mirkaneessi',
  message = 'Dhuguma raawwachuu barbaadda?',
  confirmText = 'Eeyyee',
  cancelText = 'Lakki',
  type = 'warning'
} = {}) {
  return new Promise((resolve) => {
    const modal = openModal({
      title,
      body: `<p style="font-size: 15px; color: var(--text-secondary);">${message}</p>`,
      size: 'sm',
      showFooter: true,
      footerHTML: `
        <button type="button" class="btn btn-outline" data-action="cancel">${cancelText}</button>
        <button type="button" class="btn btn-primary" data-action="confirm">${confirmText}</button>
      `,
      onOpen: (m) => {
        m.querySelector('[data-action="cancel"]').addEventListener('click', () => {
          closeModal();
          resolve(false);
        });
        m.querySelector('[data-action="confirm"]').addEventListener('click', () => {
          closeModal();
          resolve(true);
        });
      }
    });
  });
}

// ============================================
// INIT ALL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Initializing UI-UX components...');
  initDarkMode();
  generateBreadcrumbs();
  initBackToTop();
  autoAOS();
  console.log('✅ UI-UX ready');
});

// Global exports
window.showToast = showToast;
window.toast = toast;
window.openModal = openModal;
window.closeModal = closeModal;
window.confirmDialog = confirmDialog;
window.showSkeleton = showSkeleton;
window.skeletonGrid = skeletonGrid;
window.createEmptyState = createEmptyState;