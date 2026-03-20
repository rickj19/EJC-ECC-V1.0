import { supabase } from './supabase.js';
import { checkAuth, logout } from './auth-guard.js';

const userNameSpan = document.getElementById('user-name');
const userInitialsSpan = document.getElementById('user-initials');
const logoutBtn = document.getElementById('logout-btn');
const registrationsList = document.getElementById('registrations-list');
const statMyRegistrations = document.getElementById('stat-my-registrations');

// 1. Protect Page
window.addEventListener('load', async () => {
  const authData = await checkAuth(['ejc'], 'ejc');
  if (authData) {
    const { profile } = authData;
    userNameSpan.textContent = profile.nome || 'Usuário';
    userInitialsSpan.textContent = (profile.nome || 'U').charAt(0).toUpperCase();
    
    // 2. Load EJC Data
    loadEjcData();
  }
});

// 2. Handle Logout
logoutBtn.addEventListener('click', async () => {
  if (confirm('Deseja realmente sair?')) {
    await logout();
  }
});

async function loadEjcData() {
  try {
    console.log('[EJC] Loading registrations...');
    
    // Fetch EJC registrations
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('tipo', 'ejc')
      .order('created_at', { ascending: false });

    if (error) throw error;

    statMyRegistrations.textContent = registrations ? registrations.length : 0;
    renderRegistrations(registrations);

  } catch (error) {
    console.error('[EJC] Error loading data:', error);
  }
}

function renderRegistrations(registrations) {
  registrationsList.innerHTML = '';
  
  if (!registrations || registrations.length === 0) {
    registrationsList.innerHTML = '<div style="text-align: center; padding: 3rem; color: var(--church-brown-medium);">Nenhuma inscrição encontrada para o EJC.</div>';
    return;
  }

  registrations.forEach(reg => {
    const item = document.createElement('div');
    item.className = 'list-item';
    const date = new Date(reg.created_at).toLocaleDateString('pt-BR');
    
    item.innerHTML = `
      <div class="item-info">
        <h4>${reg.nome}</h4>
        <p>Inscrito em: ${date}</p>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span class="badge-ejc">EJC</span>
        <button class="btn-outline" style="width: auto; padding: 0.25rem 0.75rem; font-size: 0.75rem; border-radius: 0.5rem;">Ver Detalhes</button>
      </div>
    `;
    registrationsList.appendChild(item);
  });
}
