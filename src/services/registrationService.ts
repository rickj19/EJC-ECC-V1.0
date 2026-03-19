/**
 * Serviço responsável pela comunicação com o Supabase para cadastros.
 * Centraliza todas as operações de banco de dados e storage relacionadas a inscrições.
 */
import { supabase } from '../lib/supabase';
import { Registration } from '../types';

/**
 * Realiza o upload de uma foto para o Supabase Storage.
 * @param file Arquivo da foto
 * @param path Caminho dentro do bucket (ex: 'ejc/foto.jpg')
 * @returns URL pública da imagem
 */
export async function uploadPhoto(file: File, path: string): Promise<string> {
  // Otimização: Redimensionamento básico poderia ser feito aqui se necessário
  const { error: uploadError } = await supabase.storage
    .from('fotos-encontro')
    .upload(path, file, {
      contentType: 'image/jpeg',
      upsert: true // Permite sobrescrever se o caminho for o mesmo
    });

  if (uploadError) {
    console.error('Erro no upload da foto:', uploadError);
    throw new Error('Falha ao enviar a foto para o servidor.');
  }

  const { data } = supabase.storage
    .from('fotos-encontro')
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Remove uma foto do storage.
 * @param path Caminho da foto no bucket
 */
export async function deletePhoto(path: string): Promise<void> {
  if (!path) return;
  const { error } = await supabase.storage
    .from('fotos-encontro')
    .remove([path]);
  
  if (error) {
    console.error('Erro ao remover foto:', error);
  }
}

/**
 * Salva os dados de uma inscrição no banco de dados.
 * @param registration Objeto com os dados da inscrição
 */
export async function saveRegistration(registration: Registration): Promise<void> {
  const { error } = await supabase
    .from('inscricoes')
    .insert([registration]);

  if (error) {
    console.error('Erro ao salvar no banco:', error);
    throw new Error('Falha ao salvar os dados do cadastro.');
  }
}

/**
 * Busca todas as inscrições filtradas por evento.
 * @param eventType 'ejc' | 'ecc' ou undefined para todos
 */
export async function getRegistrations(eventType?: string) {
  let query = supabase
    .from('inscricoes')
    .select('*')
    .order('created_at', { ascending: false });

  if (eventType && eventType !== 'ALL') {
    query = query.eq('tipo_evento', eventType);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Erro ao buscar inscrições:', error);
    throw error;
  }
  return data;
}

/**
 * Atualiza os dados de uma inscrição no banco de dados.
 * @param id ID da inscrição
 * @param registration Objeto com os dados da inscrição
 */
export async function updateRegistration(id: string, registration: Partial<Registration>): Promise<void> {
  const { error } = await supabase
    .from('inscricoes')
    .update(registration)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar no banco:', error);
    throw new Error('Falha ao atualizar os dados do cadastro.');
  }
}

/**
 * Exclui uma inscrição no banco de dados.
 * @param id ID da inscrição
 */
export async function deleteRegistration(id: string): Promise<void> {
  const { error } = await supabase
    .from('inscricoes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir no banco:', error);
    throw new Error('Falha ao excluir o cadastro.');
  }
}
