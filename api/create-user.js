import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { nome, email, senha, tipo_permissao, ativo } = req.body;

    if (!nome || !email || !senha || !tipo_permissao) {
      return res.status(400).json({
        error: 'Campos obrigatórios faltando'
      });
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true
      });

    if (authError) {
      console.error('Erro auth:', authError);
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData?.user?.id;

    if (!userId) {
      return res.status(500).json({
        error: 'Não foi possível obter o ID do usuário criado.'
      });
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        nome,
        email,
        tipo_permissao,
        ativo: ativo ?? true
      });

    if (profileError) {
      console.error('Erro profile:', profileError);
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuário criado com sucesso'
    });

  } catch (error) {
    console.error('Erro geral:', error);
    return res.status(500).json({
      error: error.message || 'Erro interno do servidor'
    });
  }
}