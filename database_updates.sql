-- SQL para ajustar a tabela profiles para o gerenciamento de usuários

-- Adiciona as colunas necessárias se não existirem
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS email TEXT;

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar o updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Garante que o administrador geral possa gerenciar os perfis
-- Nota: Ajuste as políticas de RLS conforme necessário
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Exemplo de política: apenas admin_geral pode ver todos os perfis
-- DROP POLICY IF EXISTS "Admin geral pode ver todos os perfis" ON profiles;
-- CREATE POLICY "Admin geral pode ver todos os perfis" ON profiles
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles p
--             WHERE p.user_id = auth.uid() AND p.tipo_permissao = 'admin_geral'
--         )
--     );
