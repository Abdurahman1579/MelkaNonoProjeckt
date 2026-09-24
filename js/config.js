// ============================================
// SUPABASE CONFIG — Malka Noonoo Project
// ============================================

// ============================================
// 1. SUPABASE CREDENTIALS
// ============================================
// Akkaataa argachuu:
//   1. https://app.supabase.com → project keessan filadhu
//   2. Settings (⚙️) → API
//   3. "Project URL" fi "anon public" key copy godhi
//   4. Bakka 'YOUR-...' kana galchi

const SUPABASE_URL = 'https://stkabwoyxoakjzklbbsl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0a2Fid295eG9ha2p6a2xiYnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NTczMTQsImV4cCI6MjEwMTMzMzMxNH0.huMbV58r_xBM7wzMwrZszsuAmemXXdTLDEFoitqdSh0';

// ============================================
// 2. PROJECT CONSTANTS
// ============================================

// Kaayyoo waliigalaa piroojektii (ETB)
const PROJECT_GOAL = 190000000;

// Maqaa piroojektii
const PROJECT_NAME = 'Malka Noonoo';
const PROJECT_NAME_FULL = 'Mana Marii Dhimmoota Islaamummaa Malka Noonoo';

// ============================================
// 3. SADARKAA GUMAACHAA (Donation Tiers)
// ============================================

const DONATION_TIERS = {
  tier1: {
    label: 'Sadarkaa 1 — Dandeettii Ol\'aanaa',
    target: 80000000,
    color: '#d4a017'
  },
  tier2: {
    label: 'Sadarkaa 2 — Giddu-galeessa',
    target: 45000000,
    color: '#22a06b'
  },
  community: {
    label: 'Hawaasa Bal\'aa',
    target: 30000000,
    color: '#6ee7b7'
  },
  masjid: {
    label: 'Masgiidota 85',
    target: 20000000,
    color: '#d1d5db'
  },
  business: {
    label: 'Daldaltoota',
    target: 15000000,
    color: '#6b7280'
  }
};

// ============================================
// 4. MALA KAFFALTII (Payment Methods)
// ============================================

const PAYMENT_METHODS = [
  { value: 'telebirr', label: 'Telebirr' },
  { value: 'cbe_birr', label: 'CBE Birr' },
  { value: 'chapa', label: 'Chapa (Kaardii)' },
  { value: 'bank', label: 'Baankii (Transfer)' },
  { value: 'cash', label: 'Maallaqa harkaa' }
];

// ============================================
// 5. AANAALEE (Woredas)
// ============================================

const WOREDAS = [
  'Malka Gafarsa',
  'Bero',
  'Nono'
];

// ============================================
// 6. QUUNNAMTII (Contact Info)
// ============================================

const CONTACT_INFO = {
  phone: '+251 9xx xxx xxx',
  email: 'info@malkanoonoo.org',
  website: 'www.malkanoonoo.org',
  location: 'Sheger Magaalaa, Malka Noonoo Kutaa Magaalaa'
};

// ============================================
// 7. QUICK AMOUNTS (Gumaacha saffisaa)
// ============================================

const QUICK_AMOUNTS = [500, 1000, 5000, 10000, 50000, 100000];

// ============================================
// 8. VERIFY CONFIG (Console warning)
// ============================================

(function verifyConfig() {
  if (SUPABASE_URL.includes('YOUR-PROJECT-ID') || 
      SUPABASE_ANON_KEY.includes('YOUR-ANON-PUBLIC-KEY')) {
    console.warn(
      '%c⚠️ SUPABASE CONFIG HIN QOPHAA\'E!',
      'color: red; font-weight: bold; font-size: 14px;'
    );
    console.warn(
      'Bakka "YOUR-PROJECT-ID" fi "YOUR-ANON-PUBLIC-KEY" ' +
      'js/config.js keessatti galchi.',
      '\nArgachuu: https://app.supabase.com → Settings → API'
    );
  } else {
    console.log(
      '%c✅ Supabase config ready: ' + SUPABASE_URL,
      'color: green; font-weight: bold;'
    );
  }
})();