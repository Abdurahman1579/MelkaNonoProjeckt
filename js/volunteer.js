// ============================================
// VOLUNTEER PAGE — I18N SUPPORT
// Malka Noonoo Project
// ============================================

console.log('🤝 volunteer.js loaded');

// ============================================
// 1. HELPERS
// ============================================
function tr(key, fallback) {
  if (typeof t === 'function') {
    const val = t(key, '');
    if (val && val !== key) return val;
  }
  return fallback || '';
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ============================================
// 2. BENEFIT DATA — Keys only (Arabic stays)
// ============================================
const BENEFIT_DATA = {
  reward: {
    icon: '🤲',
    key: 'volunteer.benefit.reward',
    role: 'fundraiser',
    sections: [
      {
        headingKey: 'volunteer.benefit.reward.s1.heading',
        textKey: 'volunteer.benefit.reward.s1.text',
        ayah: 'وَمَنْ أَحْسَنُ قَوْلًا مِّمَّن دَعَا إِلَى اللَّهِ وَعَمِلَ صَالِحًا وَقَالَ إِنَّنِي مِنَ الْمُسْلِمِينَ',
        ayahTranslation: '"Namni Allaahitti waamee, hojii gaarii hojjatee, "ani Muslimoota irraa ta\'eera" jedhe — namni isa caalaa dubbii gaarii eenyu qaba?"',
        ayahRef: 'Suura Fussilat 41:33'
      },
      {
        headingKey: 'volunteer.benefit.reward.s2.heading',
        textKey: 'volunteer.benefit.reward.s2.text',
        hadith: 'خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ',
        hadithTranslation: '"Namoota irraa isa gaariin — namootaaf isa bu\'aa guddaa qabu dha."',
        hadithRef: 'Hadiisa — Bukhari fi Muslim'
      },
      {
        headingKey: 'volunteer.benefit.reward.s3.heading',
        textKey: 'volunteer.benefit.reward.s3.text'
      },
      {
        headingKey: 'volunteer.benefit.reward.s4.heading',
        listKeys: ['volunteer.benefit.reward.s4.1', 'volunteer.benefit.reward.s4.2',
                   'volunteer.benefit.reward.s4.3', 'volunteer.benefit.reward.s4.4',
                   'volunteer.benefit.reward.s4.5']
      }
    ],
    testimonial: {
      quoteKey: 'volunteer.testimonial.reward.quote',
      authorKey: 'volunteer.testimonial.reward.author',
      quoteDefault: 'Yeroo fedhii ta\'ee hawaasa tajaajile — jireenya koo jijjiirame. Nagaheen qalbii koo guddaa dha.',
      authorDefault: 'Ahmed A., Fedhii 2024'
    },
    ctaKey: 'volunteer.benefit.reward.cta'
  },

  experience: {
    icon: '🎓',
    key: 'volunteer.benefit.experience',
    role: 'accountant',
    sections: [
      {
        headingKey: 'volunteer.benefit.experience.s1.heading',
        listKeys: ['volunteer.benefit.experience.s1.1', 'volunteer.benefit.experience.s1.2',
                   'volunteer.benefit.experience.s1.3', 'volunteer.benefit.experience.s1.4',
                   'volunteer.benefit.experience.s1.5']
      },
      {
        headingKey: 'volunteer.benefit.experience.s2.heading',
        textKey: 'volunteer.benefit.experience.s2.text'
      },
      {
        headingKey: 'volunteer.benefit.experience.s3.heading',
        textKey: 'volunteer.benefit.experience.s3.text'
      },
      {
        headingKey: 'volunteer.benefit.experience.s4.heading',
        textKey: 'volunteer.benefit.experience.s4.text'
      }
    ],
    testimonial: {
      quoteKey: 'volunteer.testimonial.experience.quote',
      authorKey: 'volunteer.testimonial.experience.author',
      quoteDefault: 'Fedhii ta\'uu jalqabe — bulchiinsa fi faayinaansii baradhe. Amma hojii guddaa qaba.',
      authorDefault: 'Fatima H., Fedhii 2023'
    },
    ctaKey: 'volunteer.benefit.experience.cta'
  },

  network: {
    icon: '🌐',
    key: 'volunteer.benefit.network',
    role: 'social',
    sections: [
      {
        headingKey: 'volunteer.benefit.network.s1.heading',
        textKey: 'volunteer.benefit.network.s1.text',
        hadith: 'الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا',
        hadithTranslation: '"Mu\'umni Mu\'uminaaf akka ijaarsaa dha — tokkoon isaa tokko cimsa."',
        hadithRef: 'Hadiisa — Bukhari fi Muslim'
      },
      {
        headingKey: 'volunteer.benefit.network.s2.heading',
        listKeys: ['volunteer.benefit.network.s2.1', 'volunteer.benefit.network.s2.2',
                   'volunteer.benefit.network.s2.3', 'volunteer.benefit.network.s2.4']
      },
      {
        headingKey: 'volunteer.benefit.network.s3.heading',
        textKey: 'volunteer.benefit.network.s3.text'
      },
      {
        headingKey: 'volunteer.benefit.network.s4.heading',
        textKey: 'volunteer.benefit.network.s4.text'
      }
    ],
    testimonial: {
      quoteKey: 'volunteer.testimonial.network.quote',
      authorKey: 'volunteer.testimonial.network.author',
      quoteDefault: 'Yeroo fedhii ta\'ee, namoota gaarii argadhe. Amma daldala koo cimsuuf waliin hojjenna.',
      authorDefault: 'Ibrahim N., Fedhii 2023'
    },
    ctaKey: 'volunteer.benefit.network.cta'
  },

  honor: {
    icon: '⭐',
    key: 'volunteer.benefit.honor',
    role: 'promoter',
    sections: [
      {
        headingKey: 'volunteer.benefit.honor.s1.heading',
        textKey: 'volunteer.benefit.honor.s1.text',
        ayah: 'وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ',
        ayahTranslation: '"Jedhi: "Hojjedhaa! Allaah, ergamaan isaa, fi Mu\'umtoonni hojii keessan ni argu.""',
        ayahRef: 'Suura At-Tawbah 9:105'
      },
      {
        headingKey: 'volunteer.benefit.honor.s2.heading',
        textKey: 'volunteer.benefit.honor.s2.text'
      },
      {
        headingKey: 'volunteer.benefit.honor.s3.heading',
        listKeys: ['volunteer.benefit.honor.s3.1', 'volunteer.benefit.honor.s3.2',
                   'volunteer.benefit.honor.s3.3', 'volunteer.benefit.honor.s3.4']
      },
      {
        headingKey: 'volunteer.benefit.honor.s4.heading',
        textKey: 'volunteer.benefit.honor.s4.text'
      }
    ],
    testimonial: {
      quoteKey: 'volunteer.testimonial.honor.quote',
      authorKey: 'volunteer.testimonial.honor.author',
      quoteDefault: 'Raseenii fi beekamtii argadhe — kun kabaja guddaa dha. Hawaasa koo biratti beekame.',
      authorDefault: 'Halima A., Fedhii 2024'
    },
    ctaKey: 'volunteer.benefit.honor.cta'
  }
};

// ============================================
// 3. OPEN BENEFIT MODAL
// ============================================
function openBenefitModal(key) {
  const data = BENEFIT_DATA[key];
  if (!data) return;

  const body = document.getElementById('benefitModalBody');
  if (!body) return;

  const title = tr(data.key + '.title', '');
  const subtitle = tr(data.key + '.subtitle', '');

  body.innerHTML = `
    <div class="modal-benefit-hero">
      <div class="modal-benefit-icon">${data.icon}</div>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(subtitle)}</p>
    </div>

    <div class="modal-benefit-body">
      ${data.sections.map(s => renderSection(s)).join('')}

      ${data.testimonial ? `
        <div class="benefit-testimonial">
          <div class="testimonial-quote">"${escapeHtml(tr(data.testimonial.quoteKey, data.testimonial.quoteDefault))}"</div>
          <div class="testimonial-author">— ${escapeHtml(tr(data.testimonial.authorKey, data.testimonial.authorDefault))}</div>
        </div>
      ` : ''}

      <div class="modal-benefit-cta">
        <button type="button" class="btn btn-primary btn-lg btn-block"
                onclick="closeBenefitModal(); goToForm('${data.role}')">
          ${escapeHtml(tr(data.ctaKey, 'Jalqabi'))} →
        </button>
      </div>
    </div>
  `;

  document.getElementById('benefitModal').classList.add('open');
  document.body.style.overflow = 'hidden';

  console.log('📖 Modal opened:', key);
}

function renderSection(s) {
  const heading = escapeHtml(tr(s.headingKey, ''));
  const text = s.textKey ? escapeHtml(tr(s.textKey, '')) : '';

  return `
    <div class="benefit-section">
      <h3>${heading}</h3>
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
      ${text ? `<p>${text}</p>` : ''}
      ${s.listKeys ? `
        <ul class="benefit-list">
          ${s.listKeys.map(k => `<li>${escapeHtml(tr(k, ''))}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `;
}

function closeBenefitModal() {
  document.getElementById('benefitModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ============================================
// 4. GO TO FORM
// ============================================
function goToForm(roleValue) {
  const formSection = document.getElementById('volunteerFormSection');
  if (formSection) formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const form = document.getElementById('volunteerForm');
  if (form) {
    form.style.boxShadow = '0 0 0 4px var(--green-300)';
    form.style.transition = 'box-shadow 0.3s';
    setTimeout(() => { form.style.boxShadow = ''; }, 2500);
  }

  if (roleValue) {
    const roleSelect = document.getElementById('volunteerRole');
    if (roleSelect) {
      roleSelect.value = roleValue;
      setTimeout(() => roleSelect.focus(), 500);
    }
  }
}

// ============================================
// 5. EVENT LISTENERS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.benefit-card.clickable').forEach(card => {
    card.addEventListener('click', () => openBenefitModal(card.dataset.benefit));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openBenefitModal(card.dataset.benefit);
      }
    });
  });

  document.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', () => {
      const role = card.dataset.role;
      if (role) goToForm(role);
    });
  });

  document.getElementById('benefitModalClose')?.addEventListener('click', closeBenefitModal);
  document.getElementById('benefitModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'benefitModal') closeBenefitModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBenefitModal();
  });

  document.getElementById('volunteerForm')?.addEventListener('submit', handleVolunteerSubmit);
});

// ============================================
// 6. FORM SUBMIT
// ============================================
async function handleVolunteerSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('volunteerSubmit');
  const msg = document.getElementById('volunteerMsg');
  const fd = new FormData(e.target);

  btn.disabled = true;
  btn.textContent = tr('donate.form.submitting', 'Ergaa jira...');
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
      btn.textContent = tr('volunteer.form.submit', 'Galmee Galchi');
      return;
    }

    msg.textContent = tr('volunteer.form.success', '✅ Galmeen keessan milkaa\'eera! Nu quunnamna.');
    msg.className = 'form-message success';
    e.target.reset();

    if (window.toast) toast.success(tr('toast.success', 'Milkaa\'e'), volunteer.name);
    notifyAdmin(volunteer).catch(err => console.warn('Notify failed:', err));
  } catch (err) {
    console.error('Volunteer error:', err);
    msg.textContent = '❌ ' + err.message;
    msg.className = 'form-message error';
  }

  btn.disabled = false;
  btn.textContent = tr('volunteer.form.submit', 'Galmee Galchi');
}

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
          message: `🤝 Fedhii haaraa: ${volunteer.role} — ${volunteer.hours} | Aanaa: ${volunteer.woreda}`
        }
      })
    });
  } catch (err) {}
}

// ============================================
// 7. LANGUAGE CHANGE
// ============================================
window.addEventListener('languageChanged', () => {
  console.log('🌐 Language changed — volunteer.js');
  const modal = document.getElementById('benefitModal');
  if (modal && modal.classList.contains('open')) {
    // Modal banaa jira — cufi
    closeBenefitModal();
  }
});

// ============================================
// 8. GLOBAL EXPORTS
// ============================================
window.openBenefitModal = openBenefitModal;
window.closeBenefitModal = closeBenefitModal;
window.goToForm = goToForm;