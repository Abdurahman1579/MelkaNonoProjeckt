// ============================================
// PDF RECEIPT GENERATOR — Malka Noonoo (i18n)
// ============================================

console.log('📄 pdf-receipt.js loaded');

function tr(key, fallback) {
  if (typeof t === 'function') {
    const val = t(key, '');
    if (val && val !== key) return val;
  }
  return fallback || '';
}

async function generatePDFReceipt(donation) {
  console.log('📄 Generating PDF receipt...', donation);

  const { jsPDF } = window.jspdf;
  if (!jsPDF) throw new Error('PDF library hin fe\'amne');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // HEADER
  doc.setFillColor(26, 107, 79);
  doc.rect(0, 0, pageW, 40, 'F');

  doc.setFillColor(255, 255, 255);
  doc.circle(30, 20, 10, 'F');
  doc.setTextColor(26, 107, 79);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('☪', 26, 24);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(tr('brand.name', 'Malka Noonoo'), 50, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(tr('brand.subtitle', 'Mana Marii Dhimmoota Islaamummaa'), 50, 24);
  doc.text('Malka Noonoo Sub-city, Sheger, Ethiopia', 50, 30);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DONATION RECEIPT', pageW - 15, 18, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(tr('donate.success.pdf', 'Raseenii Gumaachaa'), pageW - 15, 24, { align: 'right' });

  // RECEIPT INFO
  let y = 55;
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Raseenii #:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(donation.receipt_no || 'MN-' + Date.now(), 50, y);

  doc.setFont('helvetica', 'bold');
  doc.text(tr('table.date', 'Guyyaa') + ':', pageW - 65, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(donation.created_at || new Date()), pageW - 40, y);

  y += 8;

  // DONOR INFO
  doc.setDrawColor(220, 220, 220);
  doc.line(15, y, pageW - 15, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 107, 79);
  doc.text(tr('donate.step.info', 'Odeeffannoo Gumaachaa'), 15, y);
  y += 8;

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10);

  const donorRows = [
    [tr('donate.form.name', 'Maqaa'), donation.donor_name || '—'],
    [tr('donate.form.phone', 'Bilbila'), donation.donor_phone || '—'],
    [tr('donate.form.email', 'Imeelii'), donation.donor_email || '—'],
    [tr('table.tier', 'Sadarkaa'), donation.tier || '—'],
    [tr('table.method', 'Mala Kaffaltii'), donation.payment_method || '—'],
    [tr('table.frequency', 'Yeroo'), donation.frequency || 'one-time']
  ];

  donorRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 65, y);
    y += 7;
  });

  y += 4;

  // AMOUNT BOX
  doc.setFillColor(209, 250, 229);
  doc.roundedRect(15, y, pageW - 30, 22, 3, 3, 'F');
  doc.setTextColor(26, 107, 79);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(tr('table.amount', 'GUMAACHA WALIIGALAA').toUpperCase(), 22, y + 8);
  doc.setFontSize(18);
  doc.text(formatETB(donation.amount), pageW - 22, y + 14, { align: 'right' });

  y += 30;

  // THANK YOU
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  const thanks = tr('donate.success.note', 'Galatoomaa gumaacha keessaniif! Gumaachni keessan dhaabbataa, barnoota, fi tajaajila hawaasaaf oola. Allah isin barakeessi!');
  const split = doc.splitTextToSize(thanks, pageW - 30);
  doc.text(split, 15, y);
  y += split.length * 5 + 10;

  // FOOTER
  doc.setDrawColor(220, 220, 220);
  doc.line(15, y, pageW - 15, y);
  y += 8;

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text(tr('brand.name', 'Malka Noonoo') + ' ' + tr('brand.subtitle', 'Mana Marii'), 15, y);
  doc.text('info@malkanoonoo.org  |  +251 9xx xxx xxx', 15, y + 5);

  doc.setFontSize(7);
  doc.text('Raseenii #: ' + (donation.receipt_no || 'MN-' + Date.now()), 15, y + 20);

  const filename = `Malka-Noonoo-Receipt-${donation.receipt_no || Date.now()}.pdf`;
  doc.save(filename);
  console.log('✅ PDF saved:', filename);
  return filename;
}

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

window.generatePDFReceipt = generatePDFReceipt;