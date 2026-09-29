// ============================================
// MAIN JS — Counter Animation + Scroll Reveal
// Malka Noonoo Project
// ============================================
// ⚠️ NOTE: Menu toggle nav-master.js keessatti hojjeta.
//    Kun faayilii counter fi scroll-reveal qofa qaba.

console.log('⚙️ main.js loaded');

// ============================================
// 1. COUNTER ANIMATION
// ============================================
function animateValue(el, start, end, duration = 1500) {
  if (!el) return;

  const startTime = performance.now();
  const isCurrency =
    el.textContent.includes('ETB') || el.dataset.currency === 'true';

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = start + (end - start) * eased;

    if (isCurrency) {
      el.textContent = formatETB(Math.round(value));
    } else {
      el.textContent = Math.round(value).toLocaleString();
    }

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ============================================
// 2. SCROLL REVEAL (IntersectionObserver)
// ============================================
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target); // Yeroo tokko qofa
        }
      });
    },
    { threshold: 0.1 }
  );

  const targets = document.querySelectorAll(
    '.card, .tier, .announcement, .news-card, .team-card, .benefit-card, .role-card'
  );

  targets.forEach((el) => {
    // Yoo duraan AOS ta'e — darbi
    if (el.hasAttribute('data-aos')) return;

    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ============================================
// 3. HELPER — formatETB (yoo supabase.js hin fe'amne)
// ============================================
if (typeof window.formatETB !== 'function') {
  window.formatETB = function (amount) {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0
    }).format(amount);
  };
}

// ============================================
// 4. INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  console.log('✅ main.js ready');
});

// ============================================
// 5. GLOBAL EXPORTS
// ============================================
window.animateValue = animateValue;