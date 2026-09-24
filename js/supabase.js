// ============================================
// SUPABASE CLIENT & HELPERS
// ============================================

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// HELPERS
// ============================================

async function getTotalDonations() {
  const { data, error } = await db
    .from('mn_donations')
    .select('amount')
    .eq('status', 'confirmed');
  if (error) { console.error(error); return 0; }
  return data.reduce((sum, d) => sum + Number(d.amount), 0);
}

async function getMilestones() {
  const { data, error } = await db
    .from('mn_project_milestones')
    .select('*')
    .order('id');
  if (error) return [];
  return data;
}

async function getMasjidos() {
  const { data, error } = await db
    .from('mn_masjidos')
    .select('*')
    .order('name');
  if (error) return [];
  return data;
}

async function getAnnouncements() {
  const { data, error } = await db
    .from('mn_announcements')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(5);
  if (error) return [];
  return data;
}

async function createDonation(donation) {
  const { data, error } = await db
    .from('mn_donations')
    .insert([donation])
    .select();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

function formatETB(amount) {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0
  }).format(amount);
}

function percent(current, target) {
  if (target === 0) return 0;
  return Math.min(100, ((current / target) * 100)).toFixed(1);
}