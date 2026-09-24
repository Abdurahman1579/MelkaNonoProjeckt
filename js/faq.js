// ============================================
// FAQ PAGE
// ============================================

const FAQ_DATA = [
  // GENERAL
  { cat: 'general', q: 'Piroojektiin kun maali?', a: 'Piroojektiin kun Mana Marii Dhimmoota Islaamummaa Malka Noonoo Kutaa Magaalaa keessatti dhaabbata dhaabbataa uumuuf kan karoorfameedha. Jaarmiyaa G+3, konkolaataa tajaajilaa, konkolaataa elektirikii 2, fi bakka daldalaa galii dhaabbataa uumuu kaayyeffate.' },
  { cat: 'general', q: 'Baajanni waliigalaa meeqa?', a: 'Baajanni waliigalaa piroojektii kun tilmaamaan 190,000,000 ETB dha. Kunis jaarmiyaa (160M), konkolaataa (11.5M), meeshaalee waajjiraa (5M), fi baasii biroo (13.5M) dabalata.' },
  { cat: 'general', q: 'Piroojektiin yeroo hangam fudhata?', a: 'Piroojektiin kun tartiiba 4 sadarkaan raawwatama: (1) Gumaacha walitti qabuu — 6-12 ji\'a, (2) Jaarmiyaa bittaa — 2-4 ji\'a, (3) Qophii keessaa — 2-3 ji\'a, (4) Galii jalqabuu — 12-18 ji\'a booda.' },
  { cat: 'general', q: 'Eenyu piroojektii kana bulcha?', a: 'Koree Piroojektii fi Koree Raawwattoota 9 Mana Mariin filataniin bulchama. Hoggansi, koree fi raawwattoonni hedduu piroojektii kana keessatti hirmaachaa jiru.' },

  // DONATION
  { cat: 'donation', q: 'Akkamitti gumaachuu danda\'a?', a: 'Karaalee hedduun gumaachuu dandeessa:\n\n1. Marsariitii kana irraa (Chapa/Telebirr online)\n2. Baankii (CBE, Awash, Dashen, etc.)\n3. Telebirr — Mobile money\n4. Maallaqa harkaa — Koree biraa\n\nFuula "Gumaachi" irratti filannoo guutuu argita.' },
  { cat: 'donation', q: 'Gumaachni xiqqaan fudhatamaa dha?', a: 'Eeyyee! Gumaachni xiqqaanis guddaan isaa barbaachisaa dha. Hawaasa bal\'aan walitti qabamee guddaa ta\'a. Gumaachni 100 ETB illee hirmaannaa guddaa dha.' },
  { cat: 'donation', q: 'Gumaacha koo deebi\'uu danda\'aa?', a: 'Gumaachni yeroo raawwatame booda deebi\'uu hin danda\'u. Sababni isaa, gumaachni kun dhaabbataa fi piroojektii dha. Garuu, yoo dogoggora raawwatame, nu quunnamuu dandeessa — sirreessuuf qophii dha.' },
  { cat: 'donation', q: 'Sadarkaa gumaachaa meeqa jira?', a: 'Sadarkaa 5 jira:\n\n1. Sadarkaa 1 — Dandeettii Ol\'aanaa (80M)\n2. Sadarkaa 2 — Giddu-galeessa (45M)\n3. Hawaasa Bal\'aa (30M)\n4. Masgiidota 85 (20M)\n5. Daldaltoota (15M)\n\nWaliigala 190M.' },

  // PAYMENT
  { cat: 'payment', q: 'Mala kaffaltii kam fayidama?', a: 'Maloota kaffaltii armaan gadii fayidamna:\n\n• Chapa (kaardii fi wallets)\n• Telebirr\n• CBE Birr\n• Awash Birr\n• Baankii Transfer (CBE, Awash, Dashen, etc.)\n• Maallaqa harkaa' },
  { cat: 'payment', q: 'Kaffaltiin koo ifa ta\'aa?', a: 'Eeyyee! Kaffaltii hundi galmee ifa ta\'een hordofama. Gabaasa ji\'aa fi waggaa maxxanfama. Gumaachitoonni nagahee SMS fi email argatu.' },
  { cat: 'payment', q: 'Raseenii akkamitti argadha?', a: 'Erga gumaacha raawwattan booda:\n\n1. SMS nagahee isinii dhufa\n2. Email raseenii PDF ergama\n3. Dashboard gumaachaa irratti seenaa ilaaluu dandeessu\n4. Yoo barbaaddan, nu quunnamuu dandeessu' },
  { cat: 'payment', q: 'Kaffaltii naannoo alaa danda\'ama?', a: 'Yeroo ammaa, kaffaltiin online Itoophiyaa keessatti hojjeta. Yoo naannoo alaa jirtan, Bank Transfer (international) ykn Chapa (USD support) fayidamuu dandeessu. Nu quunnamaa — karaa biroo siif kennina.' },

  // PROJECT
  { cat: 'project', q: 'Jaarmiyaan eessatti argama?', a: 'Jaarmiyaan kun Sheger Magaalaa, Malka Noonoo Kutaa Magaalaa keessatti argama. Bakka sirrii (exact location) filannoo booda beeksifama.' },
  { cat: 'project', q: 'Bakka daldalaa meeqa jira?', a: 'Jaarmiyaa G+3 keessatti, bakka daldalaa hedduu ni qophaa\'u. Waliigala 1,600 m² keessaa, keessaa 40-60% tajaajila Mana Marii fi hafan bakka daldalaaf oola.' },
  { cat: 'project', q: 'Galii bakka daldalaa meeqa ta\'a?', a: 'Galii sirriin kun gabaa irratti hundaa\'a. Filannoon booda, gabaa qorannoon galii tilmaamaa beeksifama. Tilmaamaan, bakka daldalaan tokko 15,000-50,000 ETB ji\'aan argamsiisa.' },
  { cat: 'project', q: 'Masgiidota 85 akkamitti hirmaachisu?', a: 'Masgiidota 85 kun hirmaannaa waloo qabu. Masgiidni tokko tokko dandeettii isaa eegatee, gumaacha dhiyeessa. Kanaan walitti qabamee, galii waliigalaaf gumaacha.' },

  // ACCOUNT
  { cat: 'account', q: 'Akkamitti galmaa\'uu danda\'a?', a: 'Fuula "Galmee" irratti email fi password galchuun galmaa\'uu dandeessa. Erga galmaa\'te booda, gumaacha koo, nagahee koo, fi seenaa koo ilaaluu dandeessa.' },
  { cat: 'account', q: 'Password koo dagatte — maal godha?', a: 'Fuula "Seensa" irratti "Password Dagatte?" tuqi. Email keessan galchi — linkii password haaromsuu siif ergama. Email keessan ilaali (Spam folderis ilaali!).' },
  { cat: 'account', q: 'Odeeffannoo koo nagaa dha?', a: 'Eeyyee! Odeeffannoon keessan hundi encryption waliin olkaa\'ama. Nuyi gonkumaa odeeffannoo keessan nama sadaffaaf hin kenninu. Imaammata iccitii keenya fuula "Privacy" irratti ilaaluu dandeessa.' },
  { cat: 'account', q: 'Herrega koo akkamitti haquu danda\'a?', a: 'Herrega keessan haquuf nu quunnamaa — info@malkanoonoo.org. Odeeffannoon keessan hundi guyyoota 7 keessatti haqama.' }
];

let currentCategory = 'general';

document.addEventListener('DOMContentLoaded', () => {
  setupFaqTabs();
  renderFaq();
});

function setupFaqTabs() {
  document.querySelectorAll('.faq-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.faq-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      renderFaq();
    });
  });
}

function renderFaq() {
  const list = document.getElementById('faqList');
  if (!list) return;

  const filtered = FAQ_DATA.filter(f => f.cat === currentCategory);

  if (!filtered.length) {
    list.innerHTML = `<div class="loading">${t('faq.empty') || 'Gaaffiin hin jiru.'}</div>`;
    return;
  }

  list.innerHTML = filtered.map((f, i) => `
    <div class="faq-item" data-index="${i}">
      <div class="faq-question">
        <span>${f.q}</span>
        <span class="faq-icon">▾</span>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-inner">${f.a.replace(/\n/g, '<br />')}</div>
      </div>
    </div>
  `).join('');

  // Toggle handlers
  list.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      // Close all
      list.querySelectorAll('.faq-item').forEach(it => {
        it.classList.remove('open');
        it.querySelector('.faq-answer').style.maxHeight = null;
      });

      // Open this
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// Language change
window.addEventListener('languageChanged', renderFaq);