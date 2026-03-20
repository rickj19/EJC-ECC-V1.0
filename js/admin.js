import { supabase } from './supabase.js';
import { checkAuth, logout } from './auth-guard.js';

const userNameSpan = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const registrationsBody = document.getElementById('registrations-body');
const statTotal = document.getElementById('stat-total');
const statEjc = document.getElementById('stat-ejc');
const statEcc = document.getElementById('stat-ecc');
const statUsers = document.getElementById('stat-users');

// 1. Protect Page
window.addEventListener('load', async () => {
  const authData = await checkAuth(['admin_geral'], 'admin');
  if (authData) {
    const { profile } = authData;
    userNameSpan.textContent = profile.nome || 'Administrador';
    
    // 2. Load Dashboard Data
    loadDashboardData();
  }
});

// 2. Handle Logout
logoutBtn.addEventListener('click', async () => {
  if (confirm('Deseja realmente sair?')) {
    await logout();
  }
});

async function loadDashboardData() {
  try {
    console.log('[Admin] Loading dashboard data...');
    
    // Fetch stats
    const { count: totalCount } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
    const { count: ejcCount } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('tipo', 'ejc');
    const { count: eccCount } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('tipo', 'ecc');
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('ativo', true);

    statTotal.textContent = totalCount || 0;
    statEjc.textContent = ejcCount || 0;
    statEcc.textContent = eccCount || 0;
    statUsers.textContent = userCount || 0;

    // Fetch recent registrations
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    renderRegistrations(registrations);

  } catch (error) {
    console.error('[Admin] Error loading dashboard data:', error);
  }
}

function renderRegistrations(registrations) {
  registrationsBody.innerHTML = '';
  
  if (!registrations || registrations.length === 0) {
    registrationsBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Nenhuma inscrição encontrada.</td></tr>';
    return;
  }

  registrations.forEach(reg => {
    const row = document.createElement('tr');
    const date = new Date(reg.created_at).toLocaleDateString('pt-BR');
    const badgeClass = reg.tipo === 'ejc' ? 'badge-ejc' : 'badge-ecc';
    
    row.innerHTML = `
      <td>${reg.nome}</td>
      <td><span class="badge ${badgeClass}">${reg.tipo.toUpperCase()}</span></td>
      <td>${date}</td>
      <td><span class="badge" style="background-color: #f0fdf4; color: #15803d;">Ativo</span></td>
      <td>
        <button class="btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 0.5rem;">Editar</button>
      </td>
    `;
    registrationsBody.appendChild(row);
  });
}
