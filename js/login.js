import { supabase } from './supabase.js';

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const alertContainer = document.getElementById('alert-container');
const loadingOverlay = document.getElementById('loading-overlay');
const loginBtn = document.getElementById('login-btn');

// Check for existing session on load
window.addEventListener('load', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    console.log('[Login] Existing session found, redirecting to dashboard.');
    redirectUser(session.user.id);
  }
});

// Handle errors from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const errorParam = urlParams.get('error');
if (errorParam) {
  showAlert(getErrorMessage(errorParam));
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value;
  const password = passwordInput.value;
  
  if (!email || !password) {
    showAlert('Por favor, preencha todos os campos.');
    return;
  }

  try {
    setLoading(true);
    hideAlert();
    
    console.log('[Login] Attempting login for:', email);
    
    // 1. Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      console.log('[Login] Authentication successful, checking profile.');
      await redirectUser(data.user.id);
    }

  } catch (error) {
    console.error('[Login] Error:', error);
    showAlert(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    setLoading(false);
  }
});

async function redirectUser(userId) {
  try {
    // 2. Fetch Profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('[Login] Profile fetch error:', profileError);
      throw new Error('Perfil não encontrado. Entre em contato com o administrador.');
    }

    if (!profile.ativo) {
      console.warn('[Login] User account is inactive.');
      await supabase.auth.signOut();
      throw new Error('Sua conta está inativa. Entre em contato com o administrador.');
    }

    // 3. Redirect based on permission
    const role = profile.tipo_permissao;
    console.log('[Login] User role:', role);

    if (role === 'admin_geral') {
      window.location.href = '/admin.html';
    } else if (role === 'ejc') {
      window.location.href = '/ejc.html';
    } else if (role === 'ecc') {
      window.location.href = '/ecc.html';
    } else {
      console.error('[Login] Unknown role:', role);
      await supabase.auth.signOut();
      throw new Error('Permissão desconhecida. Entre em contato com o administrador.');
    }

  } catch (error) {
    showAlert(error.message);
    setLoading(false);
  }
}

function setLoading(isLoading) {
  if (isLoading) {
    loadingOverlay.classList.remove('hidden');
    loginBtn.disabled = true;
    loginBtn.style.opacity = '0.7';
  } else {
    loadingOverlay.classList.add('hidden');
    loginBtn.disabled = false;
    loginBtn.style.opacity = '1';
  }
}

function showAlert(message) {
  alertContainer.textContent = message;
  alertContainer.classList.remove('hidden');
}

function hideAlert() {
  alertContainer.classList.add('hidden');
}

function getErrorMessage(code) {
  switch (code) {
    case 'profile_not_found': return 'Perfil não encontrado. Entre em contato com o administrador.';
    case 'inactive_account': return 'Sua conta está inativa. Entre em contato com o administrador.';
    case 'unauthorized': return 'Você não tem permissão para acessar esta área.';
    default: return 'Ocorreu um erro. Por favor, tente novamente.';
  }
}
