import React from 'react';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import { Profile, Registration } from '../../types';

// Sub-componentes
import { AdminHeader } from './AdminHeader';
import { StatCards } from './StatCards';
import { FilterBar } from './FilterBar';
import { RegistrationTable } from './RegistrationTable';
import { QuickReports } from './QuickReports';
import { DetailsModal } from './DetailsModal';
import { EditModal } from './EditModal';
import { BadgeModal } from './BadgeModal';
import { UserManagement } from './UserManagement';
import { Users, ClipboardList } from 'lucide-react';

interface AdminPanelProps {
  user: any;
  profile: Profile | null;
  onLogout: () => void;
}

type AdminView = 'REGISTRATIONS' | 'USERS';

/**
 * Painel Administrativo Principal.
 * Orquestra todos os sub-componentes e utiliza o hook useAdminData para gerenciar o estado.
 */
export const AdminPanel: React.FC<AdminPanelProps> = ({ user, profile, onLogout }) => {
  const [currentView, setCurrentView] = useState<AdminView>('REGISTRATIONS');
  const {
    filteredRegistrations,
    isLoading,
    stats,
    filters,
    setFilters,
    selectedRegistration,
    setSelectedRegistration,
    editingRegistration,
    setEditingRegistration,
    removeRegistration,
    saveRegistration,
    exportToCSV,
    registrations
  } = useAdminData(profile);

  const [badgeRegistration, setBadgeRegistration] = useState<Registration | null>(null);

  // Handlers de Ação
  const handleDelete = async (id: string, path: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cadastro?')) return;
    const success = await removeRegistration(id, path);
    if (success) {
      alert('Cadastro excluído com sucesso.');
    } else {
      alert('Erro ao excluir o cadastro.');
    }
  };

  const handleExport = () => {
    exportToCSV(filteredRegistrations);
  };

  const isAdminGeral = profile?.tipo_permissao === 'admin_geral';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <AdminHeader 
        onExport={handleExport} 
        onLogout={onLogout} 
      />

      {/* Navegação de Abas (Apenas para Admin Geral) */}
      {isAdminGeral && (
        <div className="flex space-x-4 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-church-bege/20 w-fit">
          <button
            onClick={() => setCurrentView('REGISTRATIONS')}
            className={`flex items-center space-x-2 px-6 py-2 rounded-xl font-bold transition-all ${
              currentView === 'REGISTRATIONS' 
                ? 'bg-church-brown-dark text-white shadow-md' 
                : 'text-church-brown-medium hover:bg-church-creme'
            }`}
          >
            <ClipboardList size={18} />
            <span>Inscrições</span>
          </button>
          <button
            onClick={() => setCurrentView('USERS')}
            className={`flex items-center space-x-2 px-6 py-2 rounded-xl font-bold transition-all ${
              currentView === 'USERS' 
                ? 'bg-church-brown-dark text-white shadow-md' 
                : 'text-church-brown-medium hover:bg-church-creme'
            }`}
          >
            <Users size={18} />
            <span>Usuários</span>
          </button>
        </div>
      )}

      {currentView === 'REGISTRATIONS' ? (
        <>
          {/* Cartões de Estatísticas */}
          <StatCards stats={stats} profile={profile} />

          {/* Barra de Filtros */}
          <FilterBar 
            filters={filters} 
            setFilters={setFilters} 
            profile={profile}
          />

          {/* Tabela de Listagem */}
          <RegistrationTable 
            data={filteredRegistrations}
            isLoading={isLoading}
            onView={setSelectedRegistration}
            onEdit={setEditingRegistration}
            onDelete={handleDelete}
            onBadge={setBadgeRegistration}
          />

          {/* Relatórios Rápidos */}
          <QuickReports 
            registrations={registrations} 
            stats={stats} 
            profile={profile}
          />
        </>
      ) : (
        <UserManagement />
      )}

      {/* Modais com Animação */}
      <AnimatePresence>
        {selectedRegistration && (
          <DetailsModal 
            registration={selectedRegistration} 
            onClose={() => setSelectedRegistration(null)} 
          />
        )}
        {editingRegistration && (
          <EditModal 
            registration={editingRegistration} 
            onClose={() => setEditingRegistration(null)} 
            onSave={saveRegistration} 
          />
        )}
        {badgeRegistration && (
          <BadgeModal 
            registration={badgeRegistration}
            onClose={() => setBadgeRegistration(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
