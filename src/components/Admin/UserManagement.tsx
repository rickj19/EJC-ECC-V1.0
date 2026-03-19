import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  Edit2, 
  Power, 
  Shield, 
  Mail, 
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Profile, PermissionType } from '../../types';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    tipo_permissao: 'ejc' as PermissionType,
    ativo: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      alert('Erro ao carregar lista de usuários.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedUser(null);
    setFormData({
      nome: '',
      email: '',
      password: '',
      tipo_permissao: 'ejc',
      ativo: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: Profile) => {
    setIsEditing(true);
    setSelectedUser(user);
    setFormData({
      nome: user.nome,
      email: user.email || '',
      password: '', // Senha não é editada aqui
      tipo_permissao: user.tipo_permissao,
      ativo: user.ativo
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && selectedUser) {
        // Atualizar Perfil
        const { error } = await supabase
          .from('profiles')
          .update({
            nome: formData.nome,
            tipo_permissao: formData.tipo_permissao,
            ativo: formData.ativo
          })
          .eq('id', selectedUser.id);

        if (error) throw error;
        alert('Usuário atualizado com sucesso!');
      } else {
        // Criar Novo Usuário via API Segura com tratamento robusto
        const response = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        // 1. Ler como texto primeiro para evitar erro de parse direto
        const responseText = await response.text();
        let result;

        try {
          // 2. Tentar converter para JSON
          result = JSON.parse(responseText);
        } catch (e) {
          // 3. Se não for JSON, capturar o erro HTML/Texto
          console.error('Resposta do servidor não é JSON:', responseText);
          throw new Error(`Erro do servidor (${response.status}): ${responseText.substring(0, 100)}...`);
        }

        // 4. Validar response.ok
        if (!response.ok) {
          throw new Error(result.error || result.message || 'Erro desconhecido ao criar usuário');
        }
        
        alert('Usuário criado com sucesso!');
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      alert(`Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (user: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ativo: !user.ativo })
        .eq('id', user.id);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do usuário.');
    }
  };

  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionBadge = (type: PermissionType) => {
    const styles = {
      admin_geral: 'bg-church-brown-dark text-white',
      ejc: 'bg-church-gold text-church-brown-dark',
      ecc: 'bg-church-bege text-church-brown-dark'
    };
    const labels = {
      admin_geral: 'Admin Geral',
      ejc: 'EJC',
      ecc: 'ECC'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-church-brown-dark">Gerenciar Usuários</h2>
          <p className="text-church-brown-medium text-sm">Controle quem pode acessar o painel administrativo.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-church-brown-dark text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-church-brown-medium transition-all shadow-lg shadow-church-brown-dark/20"
        >
          <UserPlus size={20} />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-church-bege/20 flex items-center space-x-3">
        <Search className="text-church-brown-medium" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou email..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-church-brown-dark placeholder:text-church-brown-medium/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-3xl shadow-xl shadow-church-brown-dark/5 border border-church-bege/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-church-creme/50 border-b border-church-bege/20">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-church-brown-medium">Usuário</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-church-brown-medium">Permissão</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-church-brown-medium">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-church-brown-medium">Criação</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-church-brown-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-church-bege/10">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-church-gold" size={32} />
                    <p className="text-church-brown-medium mt-2">Carregando usuários...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-church-brown-medium">Nenhum usuário encontrado.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-church-creme/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-church-bege/30 flex items-center justify-center text-church-brown-dark font-bold">
                          {user.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-church-brown-dark">{user.nome}</p>
                          <p className="text-xs text-church-brown-medium flex items-center">
                            <Mail size={12} className="mr-1" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPermissionBadge(user.tipo_permissao)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {user.ativo ? (
                          <span className="flex items-center text-emerald-600 text-xs font-bold">
                            <CheckCircle size={14} className="mr-1" /> Ativo
                          </span>
                        ) : (
                          <span className="flex items-center text-rose-600 text-xs font-bold">
                            <XCircle size={14} className="mr-1" /> Inativo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-church-brown-medium flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleOpenEdit(user)}
                          className="p-2 text-church-brown-medium hover:text-church-gold hover:bg-church-bege/20 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => toggleStatus(user)}
                          className={`p-2 rounded-lg transition-all ${user.ativo ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          title={user.ativo ? 'Desativar' : 'Ativar'}
                        >
                          <Power size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-church-brown-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-church-brown-dark p-6 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <UserPlus size={24} className="text-church-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold">{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                    <p className="text-xs text-white/60">Preencha as informações de acesso.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-church-brown-medium mb-2">Nome Completo</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-church-creme border-none rounded-xl px-4 py-3 text-church-brown-dark focus:ring-2 focus:ring-church-gold transition-all"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-church-brown-medium mb-2">Email de Acesso</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-church-brown-medium" size={18} />
                      <input 
                        type="email" 
                        required
                        disabled={isEditing}
                        className="w-full bg-church-creme border-none rounded-xl pl-12 pr-4 py-3 text-church-brown-dark focus:ring-2 focus:ring-church-gold transition-all disabled:opacity-50"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  {!isEditing && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-church-brown-medium mb-2">Senha Inicial</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-church-brown-medium" size={18} />
                        <input 
                          type="password" 
                          required
                          minLength={6}
                          className="w-full bg-church-creme border-none rounded-xl pl-12 pr-4 py-3 text-church-brown-dark focus:ring-2 focus:ring-church-gold transition-all"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-church-brown-medium mb-2">Tipo de Permissão</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['admin_geral', 'ejc', 'ecc'] as PermissionType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({...formData, tipo_permissao: type})}
                          className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border-2 ${
                            formData.tipo_permissao === type 
                              ? 'bg-church-brown-dark text-white border-church-brown-dark' 
                              : 'bg-church-creme text-church-brown-medium border-transparent hover:border-church-bege'
                          }`}
                        >
                          {type.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-church-creme rounded-2xl">
                    <div>
                      <p className="text-sm font-bold text-church-brown-dark">Status da Conta</p>
                      <p className="text-[10px] text-church-brown-medium uppercase tracking-widest">Ativo ou Inativo</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, ativo: !formData.ativo})}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.ativo ? 'bg-emerald-500' : 'bg-church-bege'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.ativo ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-church-brown-medium hover:bg-church-creme transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-church-gold text-church-brown-dark px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-church-brown-dark hover:text-white transition-all disabled:opacity-50 shadow-lg shadow-church-gold/20"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Shield size={20} />
                        <span>{isEditing ? 'Salvar' : 'Criar'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
