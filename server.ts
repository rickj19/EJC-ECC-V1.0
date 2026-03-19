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
    const { email, password, nome, tipo_permissao, ativo } = req.body;

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome }
      });

      if (authError) throw authError;

      // 2. Criar perfil na tabela profiles
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            user_id: authData.user.id,
            nome,
            tipo_permissao,
            ativo,
            email
          }
        ]);

      if (profileError) throw profileError;

      res.status(201).json({ message: 'Usuário criado com sucesso', user: authData.user });
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      res.status(400).json({ error: error.message });
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
