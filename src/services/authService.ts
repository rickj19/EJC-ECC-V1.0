import { supabase } from '../lib/supabase';
import { Profile } from '../types';

/**
 * Busca o perfil do usuário logado.
 * @param userId ID do usuário no Supabase Auth
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }

  return data as Profile;
}

/**
 * Realiza o logout do sistema.
 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erro ao sair:', error);
    throw error;
  }
}

/**
 * Verifica se o usuário atual tem uma sessão ativa.
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Erro ao buscar sessão:', error);
    return null;
  }
  return session;
}
