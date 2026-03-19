-- ====================================================
-- CONFIGURAÇÃO DO BANCO DE DADOS - PARÓQUIA SÃO FRANCISCO
-- ====================================================

-- 1. Tabela de Perfis (Profiles)
-- Relaciona usuários do Auth com permissões específicas
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  tipo_permissao TEXT NOT NULL CHECK (tipo_permissao IN ('admin_geral', 'ejc', 'ecc')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Habilitar RLS na tabela de perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins gerais podem ver todos os perfis" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND tipo_permissao = 'admin_geral'
    )
  );

-- 2. Atualização da Tabela de Inscrições (Inscricoes)
-- Assumindo que a tabela já existe. Vamos configurar o RLS avançado.

ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;

-- Política de Leitura (SELECT)
CREATE POLICY "Leitura baseada em permissão" 
  ON public.inscricoes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND (
        tipo_permissao = 'admin_geral' OR 
        (tipo_permissao = 'ejc' AND tipo_evento = 'ejc') OR 
        (tipo_permissao = 'ecc' AND tipo_evento = 'ecc')
      )
    )
  );

-- Política de Inserção (INSERT)
-- Geralmente aberta para o público ou restrita a admins? 
-- O requisito diz que o admin gerencia, mas o público cadastra.
-- Vamos permitir inserção pública se for o caso, ou restringir se for apenas via painel.
-- Para o fluxo atual, o público cadastra, então:
CREATE POLICY "Inserção pública permitida" 
  ON public.inscricoes FOR INSERT 
  WITH CHECK (true);

-- Política de Atualização (UPDATE)
CREATE POLICY "Edição baseada em permissão" 
  ON public.inscricoes FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND (
        tipo_permissao = 'admin_geral' OR 
        (tipo_permissao = 'ejc' AND tipo_evento = 'ejc') OR 
        (tipo_permissao = 'ecc' AND tipo_evento = 'ecc')
      )
    )
  );

-- Política de Exclusão (DELETE)
CREATE POLICY "Exclusão baseada em permissão" 
  ON public.inscricoes FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND (
        tipo_permissao = 'admin_geral' OR 
        (tipo_permissao = 'ejc' AND tipo_evento = 'ejc') OR 
        (tipo_permissao = 'ecc' AND tipo_evento = 'ecc')
      )
    )
  );

-- 3. Função Auxiliar para facilitar a verificação de permissão no código
CREATE OR REPLACE FUNCTION public.get_user_permission(user_id UUID)
RETURNS TEXT AS $$
  SELECT tipo_permissao FROM public.profiles WHERE user_id = $1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Inserir o primeiro Administrador Geral (Exemplo)
-- Substitua 'ID_DO_USUARIO_AUTH' pelo ID real após criar o usuário no Auth
-- INSERT INTO public.profiles (user_id, nome, tipo_permissao) 
-- VALUES ('ID_DO_USUARIO_AUTH', 'Administrador Inicial', 'admin_geral');
