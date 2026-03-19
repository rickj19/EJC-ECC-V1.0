import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase configuration missing! Check VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Criar novo usuário (Apenas Admin)
  app.post('/api/admin/create-user', async (req, res) => {
    console.log('Recebendo requisição para criar usuário:', req.body.email);
    const { email, password, nome, tipo_permissao, ativo } = req.body;

    if (!email || !password || !nome) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes: email, password e nome são necessários.' });
    }

    try {
      // 1. Criar usuário no Supabase Auth
      console.log('Criando usuário no Supabase Auth...');
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome }
      });

      if (authError) {
        console.error('Erro no Supabase Auth:', authError);
        throw authError;
      }

      console.log('Usuário Auth criado:', authData.user.id);

      // 2. Criar perfil na tabela profiles
      console.log('Criando perfil na tabela profiles...');
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: authData.user.id, // Usando 'id' em vez de 'user_id'
            nome,
            tipo_permissao,
            ativo,
            email
          }
        ]);

      if (profileError) {
        console.error('Erro ao inserir perfil:', profileError);
        // Tentar deletar o usuário auth se o perfil falhar para manter consistência
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      console.log('Perfil criado com sucesso!');
      res.status(201).json({ 
        message: 'Usuário criado com sucesso', 
        user: {
          id: authData.user.id,
          email: authData.user.email,
          nome
        }
      });
    } catch (error: any) {
      console.error('Erro fatal na criação de usuário:', error);
      res.status(error.status || 500).json({ 
        error: error.message || 'Erro interno do servidor',
        details: error
      });
    }
  });

  // API: Resetar senha (opcional)
  app.post('/api/admin/reset-password', async (req, res) => {
    const { userId, newPassword } = req.body;
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
      });
      if (error) throw error;
      res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware para desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
