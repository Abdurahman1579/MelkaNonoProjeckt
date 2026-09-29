// ============================================
// DONATE PAGE — Full Logic (i18n)
// ============================================

console.log('💝 donate.js loaded');

let currentDonation = null;
let lastReceipt = null;

function tr(key, fallback) {
  if (typeof t === 'function') {
    const val = t(key, '');
    if (val && val !== key) return val;
  }
  return fallback || '';
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  setupQuickAmounts();
  setupTierChange();
  setupAmountImpact();
  setupShareButtons();
  setupSuccessModal();
  loadMasjidos();
  loadProgressBar();
});

// ============================================
// QUICK AMOUNTS
// ============================================
function setupQuickAmounts() {
  document.querySelectorAll('.quick-amounts button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('amount').value = btn.dataset.amt;
      document.querySelectorAll('.quick-amounts button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateImpact();
    });
  });
}

// ============================================
// TIER CHANGE
// ============================================
function setupTierChange() {
  const tierSelect = document.getElementById('tier');
  const masjidRow = document.getElementById('masjidRow');

  tierSelect?.addEventListener('change', e => {
    masjidRow.style.display = e.target.value === 'masjid' ? 'flex' : 'none';
  });
}

// ============================================
// IMPACT
// ============================================
function setupAmountImpact() {
  document.getElementById('amount')?.addEventListener('input', updateImpact);
}

function updateImpact() {
  const amount = Number(document.getElementById('amount')?.value) || 0;
  const box = document.getElementById('impactBox');
  const text = document.getElementById('impactText');
  if (!box || !text) return;

  if (amount < 100) { box.style.display = 'none'; return; }

  box.style.display = 'flex';
  text.innerHTML = getImpactMessage(amount);
}

function getImpactMessage(amount) {
  if (amount >= 1000000) {
    return `Gumaacha keessan jaarmiyaa <strong>${Math.floor(amount / 1000000)} m²</strong> ijaaruu gargaara.`;
  }
  if (amount >= 100000) return `Konkolaataa tajaajilaa qooda <strong>${Math.floor(amount / 100000)}</strong> deeggarti.`;
  if (amount >= 50000) return `Bakka daldalaa tokkoof qophii <strong>${Math.floor(amount / 50000)}</strong> gargaara.`;
  if (amount >= 10000) return `Meeshaalee waajjiraa qooda <strong>${Math.floor(amount / 10000)}</strong> deeggarti.`;
  if (amount >= 5000) return `Qabeenya piroojektii qooda guddaa deeggarti.`;
  if (amount >= 1000) return `Gaarii — piroojektii dhaabbataa ijaaruu keessatti hirmaachaa jirta.`;
  return `Gumaacha xiqqaa — walitti qabamee guddaa. Galatoomaa!`;
}

// ============================================
// MASJIDOS
// ============================================
async function loadMasjidos() {
  const select = document.getElementById('masjidSelect');
  if (!select) return;
  const list = await getMasjidos();
  select.innerHTML = `<option value="">${tr('donate.form.tier.select', '— Filadhu —')}</option>` +
    list.map(m => `<option value="${m.id}">${m.name} (${m.woreda})</option>`).join('');
}

// ============================================
// PROGRESS BAR
// ============================================
async function loadProgressBar() {
  const raised = await getTotalDonations();
  const pct = percent(raised, PROJECT_GOAL);
  const bar = document.getElementById('donateProgressBar');
  const txt = document.getElementById('donateProgressText');

  if (bar) setTimeout(() => bar.style.width = pct + '%', 300);
  if (txt) txt.textContent = `${pct}% ${tr('donate.progress', 'raawwate')} — ${formatETB(raised)} / ${formatETB(PROJECT_GOAL)}`;
}

// ============================================
// FORM SUBMIT
// ============================================
document.getElementById('donateForm')?.addEventListener('submit', async e => {
  e.preventDefault();

  const btn = document.getElementById('submitBtn');
  const msg = document.getElementById('formMessage');

  btn.disabled = true;
  btn.textContent = tr('donate.form.submitting', 'Ergaa jira...');
  msg.className = 'form-message';

  const fd = new FormData(e.target);
  const frequency = document.querySelector('input[name="frequency"]:checked')?.value || 'one-time';
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'chapa';
  const isAnonymous = document.getElementById('anonymous')?.checked || false;

  const donation = {
    donor_name: isAnonymous ? 'Anonymous' : fd.get('donor_name'),
    donor_phone: fd.get('donor_phone'),
    donor_email: fd.get('donor_email'),
    amount: Number(fd.get('amount')),
    tier: fd.get('tier'),
    masjid_id: fd.get('masjid_id') ? Number(fd.get('masjid_id')) : null,
    payment_method: paymentMethod,
    frequency: frequency,
    note: fd.get('note'),
    is_anonymous: isAnonymous,
    status: 'pending'
  };

  if (!donation.donor_name || donation.donor_name === 'Anonymous') {
    donation.donor_name = 'Anonymous';
  }
  if (!donation.amount || donation.amount < 1) {
    showError(msg, tr('form.amount.required', 'Gumaacha sirrii galchi (≥ 1 ETB)'));
    return;
  }

  const res = await createDonation(donation);

  if (!res.success) {
    showError(msg, res.error);
    return;
  }

  lastReceipt = {
    ...donation,
    id: res.data?.[0]?.id,
    receipt_no: 'MN-' + String(res.data?.[0]?.id || Date.now()).padStart(6, '0'),
    created_at: new Date()
  };

  showSuccessModal(lastReceipt);
  e.target.reset();
  document.getElementById('masjidRow').style.display = 'none';
  document.getElementById('impactBox').style.display = 'none';

  btn.disabled = false;
  btn.textContent = tr('donate.form.submit', 'Gumaacha Galmeessi');
});

function showError(msgEl, errorText) {
  msgEl.textContent = '❌ ' + (errorText || tr('toast.error', 'Dogoggora'));
  msgEl.className = 'form-message error';
  const btn = document.getElementById('submitBtn');
  btn.disabled = false;
  btn.textContent = tr('donate.form.submit', 'Gumaacha Galmeessi');
}

// ============================================
// SUCCESS MODAL
// ============================================
function setupSuccessModal() {
  document.getElementById('closeSuccessBtn')?.addEventListener('click', closeSuccessModal);
  document.getElementById('successModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'successModal') closeSuccessModal();
  });
  document.getElementById('downloadPdfBtn')?.addEventListener('click', async () => {
    if (!lastReceipt) return;
    if (typeof generatePDFReceipt === 'function') await generatePDFReceipt(lastReceipt);
  });
  document.getElementById('shareReceiptBtn')?.addEventListener('click', () => {
    if (!lastReceipt) return;
    shareReceipt(lastReceipt);
  });
}

function showSuccessModal(receipt) {
  const modal = document.getElementById('successModal');
  const summary = document.getElementById('receiptSummary');

  const freqLabels = {
    'one-time': tr('donate.freq.onetime', 'Al tokko'),
    'monthly': tr('donate.freq.monthly', 'Ji\'aan'),
    'yearly': tr('donate.freq.yearly', 'Waggaan')
  };

  summary.innerHTML = `
    <div class="row"><strong>Raseenii #</strong><span>${receipt.receipt_no}</span></div>
    <div class="row"><strong>${tr('donate.form.name', 'Maqaa')}</strong><span>${receipt.donor_name}</span></div>
    <div class="row"><strong>${tr('donate.form.amount', 'Gumaacha')}</strong><span>${formatETB(receipt.amount)}</span></div>
    <div class="row"><strong>${tr('table.frequency', 'Yeroo')}</strong><span>${freqLabels[receipt.frequency] || receipt.frequency}</span></div>
    <div class="row"><strong>${tr('table.method', 'Mala')}</strong><span>${receipt.payment_method}</span></div>
    <div class="row"><strong>${tr('table.date', 'Guyyaa')}</strong><span>${new Date(receipt.created_at).toLocaleDateString()}</span></div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  document.getElementById('successModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ============================================
// SHARE
// ============================================
function setupShareButtons() {
  document.querySelectorAll('[data-share]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      await handleShare(btn.dataset.share);
    });
  });
}

async function handleShare(type) {
  const url = window.location.origin + '/donate.html';
  const text = `🤲 Gumaachi piroojektii Malka Noonoo — jaarmiyaa, masgiidota 85 fi hawaasa keenyaaf. Hirmaadhu: ${url}`;

  if (type === 'copy') {
    try {
      await navigator.clipboard.writeText(url);
      showToast(tr('toast.copied', '🔗 Linkii copy ta\'eera!'));
    } catch (err) {
      showToast(tr('toast.error', '❌ Copy hin dandeessifne'));
    }
    return;
  }

  const urls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Gumaachi piroojektii Malka Noonoo')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  };

  if (urls[type]) window.open(urls[type], '_blank', 'width=600,height=600');
}

async function shareReceipt(receipt) {
  const text = `✅ Gumaacha koo — ${formatETB(receipt.amount)}\n📄 Raseenii: ${receipt.receipt_no}\n🤲 Malka Noonoo Piroojektii`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Gumaacha Malka Noonoo',
        text: text,
        url: window.location.origin + '/donate.html'
      });
    } catch (err) { console.log('Share cancelled'); }
  } else {
    await navigator.clipboard.writeText(text + '\n' + window.location.origin + '/donate.html');
    showToast(tr('toast.copied', '📋 Share linkii copy ta\'eera!'));
  }
}

// ============================================
// TOAST
// ============================================
function showToast(message) {
  if (window.toast) {
    window.toast.info(message);
    return;
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: var(--green-900); color: white; padding: 12px 20px;
    border-radius: 999px; font-size: 14px; font-weight: 600;
    z-index: 2000; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2400);
}