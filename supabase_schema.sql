-- SQL PARA CRIAÇÃO DA TABELA E POLICIES NO SUPABASE

-- 1. Criar a tabela de inscrições
CREATE TABLE IF NOT EXISTS public.inscricoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_evento TEXT NOT NULL, -- 'ejc' ou 'ecc'
    tipo_pessoa TEXT NOT NULL, -- 'jovem' ou 'casal'
    
    -- Campos EJC
    nome TEXT,
    data_nascimento DATE,
    telefone TEXT,
    email TEXT,
    paroquia TEXT,
    cidade TEXT,
    
    -- Campos ECC
    nome_esposo TEXT,
    nome_esposa TEXT,
    telefone_casal TEXT,
    email_casal TEXT,
    tempo_casados TEXT,
    paroquia_casal TEXT,
    cidade_casal TEXT,
    
    -- Campos da Foto
    foto_path TEXT NOT NULL,
    foto_url TEXT NOT NULL,
    
    -- Metadados
    criado_por UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;

-- 3. Criar Policies (Políticas de Acesso)

-- Permitir que qualquer pessoa insira dados (Cadastro Público)
CREATE POLICY "Permitir inserção pública" 
ON public.inscricoes FOR INSERT 
WITH CHECK (true);

-- Permitir que apenas usuários autenticados (Coordenadores) vejam os dados
CREATE POLICY "Permitir leitura para autenticados" 
ON public.inscricoes FOR SELECT 
TO authenticated 
USING (true);

-- 4. Configuração do Storage
-- Nota: O bucket 'fotos' deve ser criado manualmente no painel do Supabase.
-- Policies para o Storage (Bucket: fotos):

-- Permitir upload público para o bucket fotos
-- CREATE POLICY "Permitir upload público" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fotos');

-- Permitir leitura pública das fotos
-- CREATE POLICY "Permitir leitura pública" ON storage.objects FOR SELECT USING (bucket_id = 'fotos');
