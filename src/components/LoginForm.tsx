import { motion } from 'motion/react';
import { LogIn, Shield, Users, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

interface LoginFormProps {
  role: UserRole;
  onBack: () => void;
  onLoginSuccess: (user: any) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ role, onBack, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Caso especial para o Administrador padrão solicitado
      if (role === 'ADMIN' && email === 'adm' && password === '@dmin') {
        setIsSuccess(true);
        setTimeout(() => onLoginSuccess({ email: 'adm', role: 'ADMIN' }), 2000);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      setIsSuccess(true);
      // Por enquanto apenas mostrar mensagem e depois prosseguir
      setTimeout(() => onLoginSuccess({ ...data.user, role }), 2000);
    } catch (err: any) {
      console.error('Erro de login:', err);
      setError('Credenciais inválidas ou erro de conexão. Verifique seus dados e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-white p-12 rounded-3xl shadow-xl text-center border border-church-bege/30"
      >
        <div className="w-20 h-20 bg-church-creme rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-church-brown-dark" size={48} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-church-brown-dark">Login realizado com sucesso.</h2>
        <p className="text-church-brown-medium mt-4">Aguarde um momento...</p>
      </motion.div>
    );
  }

  const getRoleTitle = () => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'COORDINATOR_EJC': return 'EJC';
      case 'COORDINATOR_ECC': return 'ECC';
      default: return 'Login';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-2xl border border-church-bege/30"
    >
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-church-creme rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          {role === 'ADMIN' ? <Shield className="text-church-brown-dark" size={32} /> : <Users className="text-church-brown-dark" size={32} />}
        </div>
        <h2 className="text-3xl font-serif font-bold text-church-brown-dark">Login {getRoleTitle()}</h2>
        <p className="text-church-brown-medium mt-2">Entre com suas credenciais para gerenciar os cadastros.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100"
          >
            {error}
          </motion.div>
        )}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-church-brown-dark uppercase tracking-widest">Usuário / E-mail</label>
          <input
            required
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder={role === 'ADMIN' ? 'adm' : 'seu@email.com'}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-church-brown-dark uppercase tracking-widest">Senha</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-70"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <LogIn size={20} />
              <span>Entrar</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-3 text-church-brown-medium font-bold hover:text-church-brown-dark transition-colors"
        >
          Voltar
        </button>
      </form>
    </motion.div>
  );
};
