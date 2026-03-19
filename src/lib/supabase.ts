import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing! Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Inicialização estável do cliente Supabase
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
