import { supabase } from './supabase.js';

/**
 * Protects a page by checking the user's session and profile permissions.
 * @param {string[]} allowedPermissions - Array of permissions allowed to access this page.
 * @param {string} currentPage - The name of the current page (e.g., 'admin', 'ejc', 'ecc').
 */
export async function checkAuth(allowedPermissions = [], currentPage = '') {
  const loadingOverlay = document.getElementById('loading-overlay');
  const mainContent = document.getElementById('main-content');

  try {
    console.log(`[AuthGuard] Checking session for page: ${currentPage}`);
    
    // 1. Get Session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    
    if (!session) {
      console.warn('[AuthGuard] No session found, redirecting to login.');
      window.location.href = '/index.html';
      return;
    }

    // 2. Get Profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('[AuthGuard] Error fetching profile:', profileError);
      // If profile doesn't exist, sign out and go to login
      await supabase.auth.signOut();
      window.location.href = '/index.html?error=profile_not_found';
      return;
    }

    if (!profile.ativo) {
      console.warn('[AuthGuard] User account is inactive.');
      await supabase.auth.signOut();
      window.location.href = '/index.html?error=inactive_account';
      return;
    }

    // 3. Check Permissions
    const userRole = profile.tipo_permissao;
    const isAdmin = userRole === 'admin_geral';
    
    // Admin can access everything
    const isAuthorized = isAdmin || allowedPermissions.includes(userRole);

    if (!isAuthorized) {
      console.warn(`[AuthGuard] User ${userRole} not authorized for ${currentPage}. Redirecting to correct area.`);
      
      // Redirect to their correct area
      if (userRole === 'ejc') window.location.href = '/ejc.html';
      else if (userRole === 'ecc') window.location.href = '/ecc.html';
      else if (userRole === 'admin_geral') window.location.href = '/admin.html';
      else window.location.href = '/index.html?error=unauthorized';
      return;
    }

    // 4. Success - Show Content
    console.log(`[AuthGuard] Access granted for ${userRole} on ${currentPage}`);
    if (mainContent) mainContent.classList.remove('hidden');
    
    return { session, profile };

  } catch (error) {
    console.error('[AuthGuard] Critical error:', error);
    // Show error message on page if possible
    const errorMsg = document.getElementById('error-message');
    if (errorMsg) {
      errorMsg.textContent = 'Erro ao validar acesso. Por favor, tente novamente.';
      errorMsg.classList.remove('hidden');
    }
    // Don't redirect automatically to avoid loops, let user try again or logout
  } finally {
    // Always hide loading
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
  }
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = '/index.html';
}
