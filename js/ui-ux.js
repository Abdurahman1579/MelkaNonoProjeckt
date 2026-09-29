// ============================================
// UI-UX.JS — Advanced Components (i18n)
// Malka Noonoo Project
// ============================================

console.log('🎨 ui-ux.js loaded');

function tr(key, fallback) {
  if (typeof t === 'function') {
    const val = t(key, '');
    if (val && val !== key) return val;
  }
  return fallback || '';
}

// ============================================
// 1. DARK MODE TOGGLE
// ============================================
const THEME_KEY = 'mn_theme';

function initDarkMode() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  setTheme(theme);

  const headerActions = document.querySelector('.header-actions');
  if (headerActions && !document.querySelector('.theme-toggle')) {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.type = 'button';
    btn.addEventListener('click', toggleTheme);
    const langSwitcher = document.getElementById('langSwitcher');
    if (langSwitcher) headerActions.insertBefore(btn, langSwitcher);
    else headerActions.appendChild(btn);
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
    title: next === 'dark' ? '🌙 ' + tr('ui.theme.dark', 'Ifa Dukkanaa') : '☀️ ' + tr('ui.theme.light', 'Ifa Ifaa'),
    message: tr('ui.theme.changed', 'Theme jijjiirameera'),
    duration: 2000
  });
}

function updateThemeIcon() {
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  const theme = document.documentElement.getAttribute('data-theme');
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem(THEME_KEY)) setTheme(e.matches ? 'dark' : 'light');
});

// ============================================
// 2. SKELETONS
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

function showSkeleton(element, count = 6) {
  if (!element) return;
  element.innerHTML = skeletonGrid(count);
}

// ============================================
// 3. TOAST NOTIFICATIONS
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
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

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
  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
  if (duration > 0) setTimeout(() => removeToast(toast), duration);
  return toast;
}

function removeToast(toast) {
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 300);
}

const toast = {
  success: (title, message, duration) => showToast({ type: 'success', title, message, duration }),
  error: (title, message, duration) => showToast({ type: 'error', title, message, duration: duration || 6000 }),
  warning: (title, message, duration) => showToast({ type: 'warning', title, message, duration }),
  info: (title, message, duration) => showToast({ type: 'info', title, message, duration })
};

// ============================================
// 4. BREADCRUMBS
// ============================================
function generateBreadcrumbs() {
  const container = document.querySelector('.page-hero .container');
  if (!container) return;

  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1);
  if (filename === 'index.html' || filename === '' || filename === '/') return;

  const routeKeys = {
    'about.html': 'nav.about',
    'progress.html': 'nav.progress',
    'masgidoota.html': 'nav.masjidos',
    'news.html': 'nav.news',
    'gallery.html': 'nav.gallery',
    'reports.html': 'nav.reports',
    'faq.html': 'nav.faq',
    'team.html': 'nav.team',
    'volunteer.html': 'nav.volunteer',
    'contact.html': 'nav.contact',
    'donate.html': 'nav.donate',
    'login.html': 'nav.login',
    'privacy.html': 'privacy.title',
    'terms.html': 'terms.title'
  };

  const currentKey = routeKeys[filename];
  if (!currentKey) return;

  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';
  breadcrumbs.setAttribute('aria-label', 'Breadcrumb');

  breadcrumbs.innerHTML = `
    <a href="index.html" class="breadcrumb-item">
      <span>🏠</span> ${tr('breadcrumb.home', 'Fuula Duraa')}
    </a>
    <span class="breadcrumb-separator">›</span>
    <span class="breadcrumb-item active">${tr(currentKey, '')}</span>
  `;

  container.insertBefore(breadcrumbs, container.firstChild);
}

// ============================================
// 5. BACK TO TOP
// ============================================
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.type = 'button';
  btn.innerHTML = '<span>↑</span>';
  document.body.appendChild(btn);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 400) btn.classList.add('visible');
        else btn.classList.remove('visible');
        ticking = false;
      });
      ticking = true;
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================
// 6. AOS
// ============================================
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

function autoAOS() {
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
// 7. EMPTY STATE
// ============================================
function createEmptyState({
  icon = '📭',
  title = null,
  message = null,
  actionText = '',
  actionHref = ''
} = {}) {
  return `
    <div class="empty-state">
      <div class="empty-state-illustration">${icon}</div>
      <h3 class="empty-state-title">${title || tr('empty.generic', 'Hin jiru')}</h3>
      <p class="empty-state-desc">${message || tr('empty.generic', 'Odeeffannoon hin jiru.')}</p>
      ${actionText ? `<a href="${actionHref}" class="btn btn-primary">${actionText}</a>` : ''}
    </div>
  `;
}

// ============================================
// 8. MODAL DIALOGS
// ============================================
let activeModal = null;

function openModal({
  title = '',
  body = '',
  size = 'md',
  showFooter = false,
  footerHTML = '',
  onOpen = null,
  onClose = null
} = {}) {
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
  requestAnimationFrame(() => modal.classList.add('open'));
  activeModal = modal;

  modal.querySelector('.modal-base-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const escHandler = (e) => {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);

  if (onOpen) onOpen(modal);

  return { modal, close: closeModal, setBody: (html) => { modal.querySelector('.modal-base-body').innerHTML = html; } };
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

function confirmDialog({
  title = null,
  message = null,
  confirmText = null,
  cancelText = null
} = {}) {
  return new Promise((resolve) => {
    const modal = openModal({
      title: title || tr('modal.confirm', 'Mirkaneessi'),
      body: `<p style="font-size: 15px; color: var(--text-secondary);">${message || tr('modal.delete.confirm', 'Dhuguma raawwachuu barbaadda?')}</p>`,
      size: 'sm',
      showFooter: true,
      footerHTML: `
        <button type="button" class="btn btn-outline" data-action="cancel">${cancelText || tr('modal.cancel', 'Lakki')}</button>
        <button type="button" class="btn btn-primary" data-action="confirm">${confirmText || tr('modal.yes', 'Eeyyee')}</button>
      `,
      onOpen: (m) => {
        m.querySelector('[data-action="cancel"]').addEventListener('click', () => { closeModal(); resolve(false); });
        m.querySelector('[data-action="confirm"]').addEventListener('click', () => { closeModal(); resolve(true); });
      }
    });
  });
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  generateBreadcrumbs();
  initBackToTop();
  autoAOS();
  console.log('✅ UI-UX ready');
});

// ============================================
// GLOBAL EXPORTS
// ============================================
window.showToast = showToast;
window.toast = toast;
window.openModal = openModal;
window.closeModal = closeModal;
window.confirmDialog = confirmDialog;
window.showSkeleton = showSkeleton;
window.skeletonGrid = skeletonGrid;
window.createEmptyState = createEmptyState;