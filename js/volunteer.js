// ============================================
// VOLUNTEER PAGE — With Rich Modal Content
// ============================================

// ============================================
// 1. BENEFIT DATA — Rich Islamic Content
// ============================================
const BENEFIT_DATA = {
  reward: {
    icon: '🤲',
    title: 'Ajira Guddaa',
    subtitle: 'Hawaasa keessan tajaajiluu — ajira Islaamaa fi hawaasaa argattu.',
    sections: [
      {
        heading: '📖 Qur\'aana Keessatti',
        ayah: 'وَمَنْ أَحْسَنُ قَوْلًا مِّمَّن دَعَا إِلَى اللَّهِ وَعَمِلَ صَالِحًا وَقَالَ إِنَّنِي مِنَ الْمُسْلِمِينَ',
        ayahTranslation: '"Namni Allaahitti waamee, hojii gaarii hojjatee, "ani Muslimoota irraa ta\'eera" jedhe — namni isa caalaa dubbii gaarii eenyu qaba?"',
        ayahRef: 'Suura Fussilat 41:33',
        text: 'Kun aayata guddaa dha — namni hawaasa tajaajilu, dubbii gaarii dubbatu, fi hojii gaarii hojjetu — sadarkaa ol\'aanaa Allaah biratti qaba.'
      },
      {
        heading: '🕌 Hadiisa Keessatti',
        hadith: 'خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ',
        hadithTranslation: '"Namoota irraa isa gaariin — namootaaf isa bu\'aa guddaa qabu dha."',
        hadithRef: 'Hadiisa — Bukhari fi Muslim',
        text: 'Nabi Muhammad (s.a.w.) hawaasa tajaajiluu guddaa qabeessaa dha. Namni hawaasa isaa tajaajilu — namoota gaarii keessaa tokko ta\'a.'
      },
      {
        heading: '💡 Ajira Piroojektii',
        text: 'Piroojektiin kun masgiidota 85, barnoota, fi tajaajila hawaasaa cimsa. Hirmaannaan keessan qooda guddaa qaba — jaarmiyaa G+3, konkolaataa, fi galii dhaabbataa uumuu keessatti hirmaachaa jirta.'
      },
      {
        heading: '✅ Maal Argatta?',
        list: [
          'Ajira Islaamaa — barakaadha hojii keessan',
          'Nagahee guddaa qalbii — sababa hawaasa tajaajiluu',
          'Beekamtii hawaasa fi hoggansa',
          'Raseenii hirmaannaa — hojii keessan dhugaa ta\'uu',
          'Dua\'a booda illee ajiraa itti fufa'
        ]
      }
    ],
    testimonial: {
      quote: 'Yeroo fedhii ta\'ee hawaasa tajaajile — jireenya koo jijjiirame. Nagaheen qalbii koo guddaa dha.',
      author: 'Ahmed A., Fedhii 2024'
    },
    cta: 'Tajaajila Jalqabi',
    role: 'fundraiser'
  },

  experience: {
    icon: '🎓',
    title: 'Muuxannoo fi Dandeettii',
    subtitle: 'Dandeettii haaraa barachuu — bulchiinsa, ijaarsa, faayinaansii.',
    sections: [
      {
        heading: '📚 Dandeettii Argatta',
        list: [
          '**Bulchiinsa Piroojektii** — karoora, raawwii, hordoffii',
          '**Ijaarsa fi Jaarmiyaa** — design, construction, quality',
          '**Faayinaansii fi Herrega** — galii, baasii, audit',
          '**Miidiyaa fi Beeksisa** — content creation, social media',
          '**Walitti Dhufeenya Hawaasaa** — communication, networking',
          '**Seera fi Sanada** — legal documents, contracts'
        ]
      },
      {
        heading: '🎯 Leenjii',
        text: 'Ogeeyyii fi hoggantoota waliin hojjechuun muuxannoo dhugaa argatta. Leenjii adda addaa:'
      },
      {
        heading: '💼 Raseenii fi Beekamtii',
        text: 'Yeroo xumurtan, **raseenii muuxannoo** argattu — hojii barbaaduuf, daldala jalqabuuf, ykn barnoota itti fufuuf gargaara. Reference letter hoggansa Mana Marii irraa argatta.'
      },
      {
        heading: '🌟 Fakkeenya',
        text: 'Fedhiiwwan duraanii — booda hojii argataniiru, daldala jalqabaniiru, ykn hoggansa hawaasaa ta\'aniiru.'
      }
    ],
    testimonial: {
      quote: 'Fedhii ta\'uu jalqabe — bulchiinsa fi faayinaansii baradhe. Amma hojii guddaa qaba.',
      author: 'Fatima H., Fedhii 2023'
    },
    cta: 'Muuxannoo Jalqabi',
    role: 'accountant'
  },

  network: {
    icon: '🌐',
    title: 'Walitti Dhufeenya (Networking)',
    subtitle: 'Namoota haaraa fi hawaasa adda addaa waliin hojjechuu.',
    sections: [
      {
        heading: '🕌 Hadiisa',
        hadith: 'الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا',
        hadithTranslation: '"Mu\'umni Mu\'uminaaf akka ijaarsaa dha — tokkoon isaa tokko cimsa."',
        hadithRef: 'Hadiisa — Bukhari fi Muslim',
        text: 'Muslimoonni wal cimsuu qabu. Networking — kun waliin hojjechuu, waliin cimsuu, fi waliin guddachuu dha.'
      },
      {
        heading: '👥 Namoota Argatta',
        list: [
          '**Hoggantoota Mana Marii** — hoggansa 9',
          '**Ogeeyyii fi Raawwattoota** — seera, ijaarsa, faayinaansii',
          '**Daldaltoota fi Deeggartoota** — hawaasa daldalaa',
          '**Barattoota fi Dargaggoota** — dhaloota haaraa',
          '**Masgiidota 85** — aanaalee 3 keessatti',
          '**Hawaasa Bal\'aa** — ida\'amaa fi dhimma'
        ]
      },
      {
        heading: '🤝 Faayidaa',
        text: 'Networking faayidaa guddaa qaba:'
      },
      {
        heading: '🌟 Fakkeenya',
        text: 'Namoonni hedduu fedhii keessatti wal arguun — daldala, hojii, fi kaayyoo biroof waliin hojjetaniiru.'
      }
    ],
    testimonial: {
      quote: 'Yeroo fedhii ta\'ee, namoota gaarii argadhe. Amma daldala koo cimsuuf waliin hojjenna.',
      author: 'Ibrahim N., Fedhii 2023'
    },
    cta: 'Hawaasa Walqunnami',
    role: 'social'
  },

  honor: {
    icon: '⭐',
    title: 'Kabaja fi Beekamtii',
    subtitle: 'Raseenii fi beekamtii hirmaannaa argachuu.',
    sections: [
      {
        heading: '📖 Qur\'aana',
        ayah: 'وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ',
        ayahTranslation: '"Jedhi: "Hojjedhaa! Allaah, ergamaan isaa, fi Mu\'umtoonni hojii keessan ni argu.""',
        ayahRef: 'Suura At-Tawbah 9:105',
        text: 'Hojii keessan Allaah biratti beekama. Kanaafis, hawaasa birattis beekamtii argatta.'
      },
      {
        heading: '🏆 Raseenii',
        text: 'Yeroo xumurtan:'
      },
      {
        heading: '🌟 Beekamtii',
        list: [
          '**Maqaa keessan marsariitii** — fuula `team.html` irratti maxxanfama',
          '**Sagantaa beekamtii** — waliigaltee waggaa',
          '**Facebook / Telegram** — share fi beekamtii',
          '**Hawaasa keessanitti beekama** — kabaja guddaa'
        ]
      },
      {
        heading: '💎 Kabaja Qalbii',
        text: 'Kabajni guddaan — qalbii keessan keessa jira. Namni hawaasa isaa tajaajile — nagahee qalbii argata. Kun humna dhuunfaa fi barakaadha jireenyaa dha.'
      }
    ],
    testimonial: {
      quote: 'Raseenii fi beekamtii argadhe — kun kabaja guddaa dha. Hawaasa koo biratti beekame.',
      author: 'Halima A., Fedhii 2024'
    },
    cta: 'Amma Galmaa\'i',
    role: 'promoter'
  }
};

// ============================================
// 2. MODAL OPEN / CLOSE
// ============================================
function openBenefitModal(key) {
  const data = BENEFIT_DATA[key];
  if (!data) return;

  const body = document.getElementById('benefitModalBody');
  if (!body) return;

  body.innerHTML = `
    <div class="modal-benefit-hero">
      <div class="modal-benefit-icon">${data.icon}</div>
      <h2>${data.title}</h2>
      <p>${data.subtitle}</p>
    </div>

    <div class="modal-benefit-body">
      ${data.sections.map(s => renderSection(s)).join('')}

      ${data.testimonial ? `
        <div class="benefit-testimonial">
          <div class="testimonial-quote">"${data.testimonial.quote}"</div>
          <div class="testimonial-author">— ${data.testimonial.author}</div>
        </div>
      ` : ''}

      <div class="modal-benefit-cta">
        <button type="button" class="btn btn-primary btn-lg btn-block" 
                onclick="closeBenefitModal(); goToForm('${data.role}')">
          ${data.cta} →
        </button>
      </div>
    </div>
  `;

  document.getElementById('benefitModal').classList.add('open');
  document.body.style.overflow = 'hidden';

  console.log('📖 Modal opened:', key);
}

function renderSection(s) {
  return `
    <div class="benefit-section">
      <h3>${s.heading}</h3>
      ${s.ayah ? `
        <div class="ayah-box">
          <div class="ayah-arabic">${s.ayah}</div>
          <div class="ayah-translation">${s.ayahTranslation}</div>
          <div class="ayah-ref">${s.ayahRef}</div>
        </div>
      ` : ''}
      ${s.hadith ? `
        <div class="hadith-box">
          <div class="hadith-arabic">${s.hadith}</div>
          <div class="hadith-translation">${s.hadithTranslation}</div>
          <div class="hadith-ref">${s.hadithRef}</div>
        </div>
      ` : ''}
      ${s.text ? `<p>${s.text}</p>` : ''}
      ${s.list ? `<ul class="benefit-list">${s.list.map(li => `<li>${li}</li>`).join('')}</ul>` : ''}
    </div>
  `;
}

function closeBenefitModal() {
  document.getElementById('benefitModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ============================================
// 3. GO TO FORM (scroll + pre-fill role)
// ============================================
function goToForm(roleValue) {
  // Scroll to form section
  const formSection = document.getElementById('volunteerFormSection');
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Highlight form
  const form = document.getElementById('volunteerForm');
  if (form) {
    form.style.boxShadow = '0 0 0 4px var(--green-300)';
    form.style.transition = 'box-shadow 0.3s';
    setTimeout(() => { form.style.boxShadow = ''; }, 2500);
  }

  // Pre-fill role
  if (roleValue) {
    const roleSelect = document.getElementById('volunteerRole');
    if (roleSelect) {
      roleSelect.value = roleValue;
      setTimeout(() => roleSelect.focus(), 500);
    }
  }

  console.log('📝 Scrolled to form, role prefilled:', roleValue);
}

// ============================================
// 4. EVENT LISTENERS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Clickable benefit cards
  document.querySelectorAll('.benefit-card.clickable').forEach(card => {
    // Click
    card.addEventListener('click', () => {
      const key = card.dataset.benefit;
      openBenefitModal(key);
    });

    // Keyboard (Enter / Space)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openBenefitModal(card.dataset.benefit);
      }
    });
  });

  // Role cards — click to prefill + scroll
  document.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', () => {
      const role = card.dataset.role;
      if (role) goToForm(role);
    });
  });

  // Modal close
  document.getElementById('benefitModalClose')?.addEventListener('click', closeBenefitModal);
  document.getElementById('benefitModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'benefitModal') closeBenefitModal();
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBenefitModal();
  });

  // Form submit
  document.getElementById('volunteerForm')?.addEventListener('submit', handleVolunteerSubmit);
});

// ============================================
// 5. FORM SUBMIT
// ============================================
async function handleVolunteerSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('volunteerSubmit');
  const msg = document.getElementById('volunteerMsg');
  const fd = new FormData(e.target);

  btn.disabled = true;
  btn.textContent = 'Ergaa jira...';
  msg.className = 'form-message';

  const volunteer = {
    name: fd.get('name')?.trim(),
    phone: fd.get('phone')?.trim(),
    email: fd.get('email')?.trim() || null,
    woreda: fd.get('woreda'),
    role: fd.get('role'),
    hours: fd.get('hours') || null,
    skills: fd.get('skills')?.trim() || null,
    status: 'pending'
  };

  console.log('📝 Volunteer registration:', volunteer);

  try {
    const { error } = await db.from('mn_volunteers').insert([volunteer]);

    if (error) {
      console.warn('DB insert failed:', error.message);

      if (error.code === '42P01' || error.message.includes('does not exist')) {
        msg.textContent = '⚠️ Table mn_volunteers hin jiru — SQL galchi.';
      } else {
        msg.textContent = '❌ ' + error.message;
      }
      msg.className = 'form-message error';
      btn.disabled = false;
      btn.textContent = 'Galmee Galchi';
      return;
    }

    msg.textContent = '✅ Galmeen keessan milkaa\'eera! Nu quunnamna.';
    msg.className = 'form-message success';
    e.target.reset();

    // Send admin notification (silent)
    notifyAdmin(volunteer).catch(err => console.warn('Notify failed:', err));

  } catch (err) {
    console.error('Volunteer error:', err);
    msg.textContent = '❌ ' + err.message;
    msg.className = 'form-message error';
  }

  btn.disabled = false;
  btn.textContent = 'Galmee Galchi';
}

// ============================================
// 6. ADMIN NOTIFICATION (silent)
// ============================================
async function notifyAdmin(volunteer) {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        type: 'contact_form',
        donation: {
          name: volunteer.name,
          phone: volunteer.phone,
          email: volunteer.email,
          message: `🤝 Fedhii haaraa: ${volunteer.role} — ${volunteer.hours} | Aanaa: ${volunteer.woreda} | Dandeettii: ${volunteer.skills || '—'}`
        }
      })
    });
  } catch (err) {
    // Silent fail
  }
}

// ============================================
// 7. GLOBAL EXPORTS
// ============================================
window.openBenefitModal = openBenefitModal;
window.closeBenefitModal = closeBenefitModal;
window.goToForm = goToForm;