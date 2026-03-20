import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Shield, AlertCircle, Church } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getUserProfile } from '../../services/authService';
import { Profile } from '../../types';

interface AdminLoginProps {
  onLoginSuccess: (user: any, profile: Profile) => void;
  onBack: () => void;
}

/**
 * Tela de Login Real do Administrador usando Supabase Auth.
 */
export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Autenticação no Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!data.user) throw new Error('Usuário não encontrado.');

      // 2. Busca o perfil para verificar permissões
      const profile = await getUserProfile(data.user.id);

      if (!profile) {
        // Se não tiver perfil, desloga por segurança
        await supabase.auth.signOut();
        throw new Error('Você não tem permissão para acessar esta área.');
      }

      if (!profile.ativo) {
        // Se estiver inativo, desloga por segurança
        await supabase.auth.signOut();
        throw new Error('Sua conta está inativa. Entre em contato com o administrador.');
      }

      // 3. Validar se é Admin Geral
      if (profile.tipo_permissao !== 'admin_geral') {
        await supabase.auth.signOut();
        throw new Error('Este acesso é exclusivo para Administradores Gerais. Use o acesso EJC ou ECC na tela inicial.');
      }

      // 4. Sucesso!
      onLoginSuccess(data.user, profile);
    } catch (err: any) {
      console.error('Erro de login:', err);
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-login-card"
      >
        <div className="admin-login-header">
          <div className="admin-logo-circle">
            <Shield className="text-church-brown-dark" size={32} />
          </div>
          <h2 className="admin-login-title">Acesso Administrativo</h2>
          <p className="admin-login-subtitle">Paróquia de São Francisco das Chagas</p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          {error && (
            <div className="admin-login-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="admin-input-group">
            <label>E-mail</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="admin-input"
            />
          </div>

          <div className="admin-input-group">
            <label>Senha</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="admin-input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="admin-login-btn"
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <LogIn size={20} />
                <span>Entrar no Painel</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="admin-back-btn"
          >
            Voltar para o Início
          </button>
        </form>

        <div className="admin-login-footer">
          <Church size={16} />
          <span>Sistema Paroquial v2.0</span>
        </div>
      </motion.div>
    </div>
  );
};
