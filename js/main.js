// ============================================
// MAIN JS — Navigation & Interactions
// ============================================

// Menu toggle (mobile)
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  // Nav link click = close menu
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

// ============================================
// COUNTER ANIMATION
// ============================================
function animateValue(el, start, end, duration = 1500) {
  const startTime = performance.now();
  const isCurrency =
    el.textContent.includes("ETB") || el.dataset.currency === "true";

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
// SCROLL REVEAL
// ============================================
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll(".card, .tier, .announcement").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(el);
});
