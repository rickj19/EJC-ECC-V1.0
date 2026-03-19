import { motion, AnimatePresence } from 'motion/react';
import { Download, LogOut, Search, User, Calendar, Phone, MapPin, X, Eye, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getRegistrations } from '../services/registrationService';
import { Registration, EJCRegistration, ECCRegistration } from '../types';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

/**
 * Painel de Gestão para Administradores e Equipes de Apoio.
 * Permite visualizar, filtrar e exportar os cadastros realizados.
 */
export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  
  // Define o filtro inicial baseado no cargo do usuário
  const initialFilter = user.role === 'ADMIN' ? 'ALL' : user.role.replace('COORDINATOR_', '');
  const [filterGroup, setFilterGroup] = useState<string>(initialFilter);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Carrega os dados do banco de dados usando o serviço.
   */
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Se não for admin, filtra apenas o seu grupo
      const eventFilter = user.role !== 'ADMIN' 
        ? user.role.replace('COORDINATOR_', '').toLowerCase() 
        : undefined;

      const data = await getRegistrations(eventFilter);
      setRegistrations(data as Registration[] || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Não foi possível carregar os cadastros.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Exclui um cadastro (Apenas para Administradores).
   */
  const handleDelete = async (id: string, path: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cadastro permanentemente?')) return;

    try {
      // 1. Remove do banco
      const { error: dbError } = await supabase.from('inscricoes').delete().eq('id', id);
      if (dbError) throw dbError;

      // 2. Remove do storage
      await supabase.storage.from('fotos-encontro').remove([path]);

      // 3. Atualiza UI
      setRegistrations(prev => prev.filter(r => r.id !== id));
      setSelectedRegistration(null);
      alert('Cadastro excluído com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir o cadastro.');
    }
  };

  /**
   * Filtra os dados localmente conforme a busca e o seletor de grupo.
   */
  const filteredData = registrations.filter(reg => {
    const name = reg.tipo_evento === 'ejc' 
      ? (reg as EJCRegistration).nome 
      : `${(reg as ECCRegistration).nome_esposo} & ${(reg as ECCRegistration).nome_esposa}`;
    
    const matchesSearch = name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = filterGroup === 'ALL' || reg.tipo_evento === filterGroup.toLowerCase();
    return matchesSearch && matchesGroup;
  });

  /**
   * Gera e baixa um arquivo CSV com os dados filtrados.
   */
  const handleExport = () => {
    if (filteredData.length === 0) return;

    const headers = ['Tipo', 'Nome/Casal', 'Telefone', 'Email', 'Cidade', 'Data Cadastro'];
    const rows = filteredData.map(r => [
      r.tipo_evento.toUpperCase(),
      r.tipo_evento === 'ejc' ? (r as EJCRegistration).nome : `${(r as ECCRegistration).nome_esposo} & ${(r as ECCRegistration).nome_esposa}`,
      r.tipo_evento === 'ejc' ? (r as EJCRegistration).telefone : (r as ECCRegistration).telefone_casal,
      r.tipo_evento === 'ejc' ? (r as EJCRegistration).email : (r as ECCRegistration).email_casal,
      r.tipo_evento === 'ejc' ? (r as EJCRegistration).cidade : (r as ECCRegistration).cidade_casal,
      new Date(r.created_at!).toLocaleDateString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cadastros_${filterGroup.toLowerCase()}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Cabeçalho do Painel */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-church-brown-dark tracking-tight">Painel de Gestão</h1>
          <p className="text-church-brown-medium mt-1">Gerencie os inscritos da paróquia com zelo e organização.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 px-6 py-3 bg-white border border-church-bege rounded-2xl text-church-brown-dark font-bold hover:bg-church-creme transition-all shadow-sm"
          >
            <Download size={18} />
            <span>Exportar CSV</span>
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center space-x-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Tabela e Filtros */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-church-bege/20 overflow-hidden">
        <div className="p-8 border-b border-church-bege/20 flex flex-col md:flex-row gap-6 bg-church-creme/30">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-church-brown-medium/50" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nome ou casal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-church-bege focus:ring-2 focus:ring-church-gold outline-none transition-all"
            />
          </div>
          {user.role === 'ADMIN' && (
            <select 
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-6 py-4 rounded-2xl bg-white border border-church-bege font-bold text-church-brown-dark focus:ring-2 focus:ring-church-gold outline-none transition-all cursor-pointer"
            >
              <option value="ALL">Todos os Eventos</option>
              <option value="EJC">Apenas EJC</option>
              <option value="ECC">Apenas ECC</option>
            </select>
          )}
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-24 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-church-brown-dark mb-6"></div>
              <p className="text-church-brown-medium font-bold">Carregando informações...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-church-creme/50 text-church-brown-medium text-[10px] uppercase font-bold tracking-[0.2em]">
                  <th className="px-8 py-6">Encontrista / Casal</th>
                  <th className="px-8 py-6">Contatos</th>
                  <th className="px-8 py-6">Localização</th>
                  <th className="px-8 py-6">Evento</th>
                  <th className="px-8 py-6">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-church-bege/10">
                {filteredData.map((reg) => (
                  <motion.tr 
                    key={reg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-church-creme/20 transition-colors"
                  >
                    <td className="px-8 py-8">
                      <div className="flex items-center space-x-6">
                        <img 
                          src={reg.foto_url} 
                          alt="Foto" 
                          className="w-16 h-20 object-cover rounded-xl shadow-md border-2 border-white"
                        />
                        <div>
                          <div className="font-serif font-bold text-church-brown-dark text-xl">
                            {reg.tipo_evento === 'ejc' ? (reg as EJCRegistration).nome : `${(reg as ECCRegistration).nome_esposo} & ${(reg as ECCRegistration).nome_esposa}`}
                          </div>
                          <div className="text-[10px] text-church-gold font-bold uppercase tracking-widest mt-1">
                            {reg.tipo_pessoa}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm font-bold text-church-brown-medium">
                          <Phone size={14} className="mr-3 text-church-gold" /> 
                          {reg.tipo_evento === 'ejc' ? (reg as EJCRegistration).telefone : (reg as ECCRegistration).telefone_casal}
                        </div>
                        <div className="flex items-center text-sm text-church-brown-medium/70">
                          <User size={14} className="mr-3 text-church-gold" /> 
                          {reg.tipo_evento === 'ejc' ? (reg as EJCRegistration).email : (reg as ECCRegistration).email_casal}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm font-bold text-church-brown-medium">
                          <MapPin size={14} className="mr-3 text-church-gold" /> 
                          {reg.tipo_evento === 'ejc' ? (reg as EJCRegistration).cidade : (reg as ECCRegistration).cidade_casal}
                        </div>
                        <div className="text-[10px] text-church-brown-medium/50 uppercase tracking-widest">
                          Inscrito em: {new Date(reg.created_at!).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        reg.tipo_evento === 'ejc' ? 'bg-church-brown-dark text-white' : 'bg-church-gold text-white'
                      }`}>
                        {reg.tipo_evento}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => setSelectedRegistration(reg)}
                          className="p-3 bg-church-creme text-church-brown-dark rounded-xl hover:bg-church-bege transition-colors shadow-sm"
                          title="Ver Detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        {user.role === 'ADMIN' && (
                          <button 
                            onClick={() => handleDelete(reg.id!, reg.foto_path)}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm"
                            title="Excluir Cadastro"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-24 text-center">
              <div className="w-24 h-24 bg-church-creme rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Search className="text-church-bege" size={48} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-church-brown-dark">Nenhum cadastro encontrado</h3>
              <p className="text-church-brown-medium mt-3">Tente mudar os filtros ou o termo de busca.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedRegistration && (
          <DetailsModal 
            registration={selectedRegistration} 
            onClose={() => setSelectedRegistration(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Componente de Modal para exibir detalhes completos do cadastro.
 */
const DetailsModal: React.FC<{ registration: Registration, onClose: () => void }> = ({ registration, onClose }) => {
  const isEJC = registration.tipo_evento === 'ejc';
  const regEJC = registration as EJCRegistration;
  const regECC = registration as ECCRegistration;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-church-brown-dark/70 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden relative border border-church-bege/20"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-church-creme hover:bg-church-bege rounded-full transition-colors z-10 text-church-brown-dark shadow-sm"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Foto Lateral */}
          <div className="md:w-2/5 h-80 md:h-auto">
            <img 
              src={registration.foto_url} 
              alt="Foto do Encontrista" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Informações */}
          <div className="md:w-3/5 p-10 md:p-14">
            <div className="mb-10">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block ${
                isEJC ? 'bg-church-brown-dark text-white' : 'bg-church-gold text-white'
              }`}>
                {registration.tipo_evento} • {registration.tipo_pessoa}
              </span>
              <h2 className="text-4xl font-serif font-bold text-church-brown-dark leading-tight">
                {isEJC ? regEJC.nome : `${regECC.nome_esposo} & ${regECC.nome_esposa}`}
              </h2>
            </div>

            <div className="space-y-8">
              <DetailItem 
                icon={<Calendar size={20} />} 
                label={isEJC ? "Data de Nascimento" : "Tempo de Casados"} 
                value={isEJC ? new Date(regEJC.data_nascimento).toLocaleDateString() : regECC.tempo_casados} 
              />
              <DetailItem 
                icon={<Phone size={20} />} 
                label="Telefone / WhatsApp" 
                value={isEJC ? regEJC.telefone : regECC.telefone_casal} 
              />
              <DetailItem 
                icon={<User size={20} />} 
                label="E-mail" 
                value={isEJC ? regEJC.email : regECC.email_casal} 
              />
              <DetailItem 
                icon={<MapPin size={20} />} 
                label="Paróquia / Cidade" 
                value={isEJC ? `${regEJC.paroquia} - ${regEJC.cidade}` : `${regECC.paroquia_casal} - ${regECC.cidade_casal}`} 
              />
            </div>

            <div className="mt-12 pt-8 border-t border-church-bege/20">
              <p className="text-[10px] text-church-brown-medium/40 uppercase tracking-widest font-bold">
                Cadastro realizado em {new Date(registration.created_at!).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-5">
    <div className="mt-1 text-church-gold">{icon}</div>
    <div>
      <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-church-brown-medium/50 mb-1">{label}</p>
      <p className="text-church-brown-dark font-bold text-lg">{value}</p>
    </div>
  </div>
);
