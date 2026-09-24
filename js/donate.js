// ============================================
// DONATE PAGE
// ============================================

document.querySelectorAll('.quick-amounts button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('amount').value = btn.dataset.amt;
  });
});

const tierSelect = document.getElementById('tier');
const masjidRow = document.getElementById('masjidRow');
const masjidSelect = document.getElementById('masjidSelect');

tierSelect?.addEventListener('change', e => {
  masjidRow.style.display = e.target.value === 'masjid' ? 'flex' : 'none';
});

// Load masjidos
(async function loadMasjidoOptions() {
  const list = await getMasjidos();
  if (!masjidSelect) return;
  masjidSelect.innerHTML = `<option value="">${t('donate.form.tier.select')}</option>` +
    list.map(m => `<option value="${m.id}">${m.name} (${m.woreda})</option>`).join('');
})();

// Progress bar
(async function loadDonateProgress() {
  const raised = await getTotalDonations();
  const pct = percent(raised, PROJECT_GOAL);
  const bar = document.getElementById('donateProgressBar');
  const txt = document.getElementById('donateProgressText');
  if (bar) setTimeout(() => bar.style.width = pct + '%', 300);
  if (txt) txt.textContent = `${pct}${t('donate.progress')} — ${formatETB(raised)} / ${formatETB(PROJECT_GOAL)}`;
})();

// Form submit
document.getElementById('donateForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const msg = document.getElementById('formMessage');

  btn.disabled = true;
  btn.textContent = t('donate.form.submitting');
  msg.className = 'form-message';

  const fd = new FormData(e.target);
  const donation = {
    donor_name: fd.get('donor_name'),
    donor_phone: fd.get('donor_phone'),
    amount: Number(fd.get('amount')),
    tier: fd.get('tier'),
    masjid_id: fd.get('masjid_id') ? Number(fd.get('masjid_id')) : null,
    payment_method: fd.get('payment_method'),
    note: fd.get('note'),
    status: 'pending'
  };

  const res = await createDonation(donation);

  if (res.success) {
    msg.textContent = t('donate.form.success');
    msg.classList.add('success');
    e.target.reset();
    masjidRow.style.display = 'none';
  } else {
    msg.textContent = t('donate.form.error') + res.error;
    msg.classList.add('error');
  }

  btn.disabled = false;
  btn.textContent = t('donate.form.submit');
});