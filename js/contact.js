// ============================================
// CONTACT.JS — Contact Form Submission
// Malka Noonoo Project
// ============================================

(function () {
  'use strict';

  console.log('📧 contact.js loaded');

  document.addEventListener('DOMContentLoaded', initContact);

  function initContact() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('contactMsg');
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      // Get values by name
      const name = form.querySelector('[name="name"]')?.value.trim();
      const phone = form.querySelector('[name="phone"]')?.value.trim();
      const email = form.querySelector('[name="email"]')?.value.trim();
      const message = form.querySelector('[name="message"]')?.value.trim();

      // Validation
      if (!name || name.length < 2) {
        return showMsg(msg, 'error', '❌ Maqaa sirrii galchi (2+ characters)');
      }
      if (!phone || phone.length < 9) {
        return showMsg(msg, 'error', '❌ Bilbila sirrii galchi (09xxxxxxxx)');
      }
      if (!message || message.length < 5) {
        return showMsg(msg, 'error', '❌ Ergaan gabaabaa dha (5+ characters)');
      }

      // Loading
      btn.disabled = true;
      btn.textContent = '⏳ Ergaa jira...';
      msg.className = 'form-message';
      msg.textContent = '';

      try {
        const { error } = await db.from('mn_contact_messages').insert([
          {
            name,
            phone,
            email: email || null,
            message,
            status: 'new'
          }
        ]);

        if (error) throw error;

        showMsg(msg, 'success', '✅ Ergaan keessan ergameera! Nu quunnamna.');
        form.reset();

        if (window.toast) {
          toast.success('Milkaa\'e', 'Ergaan keessan ergameera');
        }
      } catch (err) {
        console.error('❌ Contact error:', err);
        showMsg(
          msg,
          'error',
          '❌ ' + (err.message || 'Ergaa erguun hin danda\'amne')
        );
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }

  function showMsg(el, type, text) {
    if (!el) return;
    el.textContent = text;
    el.className = 'form-message ' + type;
  }
})();