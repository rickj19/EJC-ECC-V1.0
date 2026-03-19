import React from 'react';
import { TrendingUp, Download, LogOut, UserPlus, Heart } from 'lucide-react';
import { Profile, EventType } from '../../types';

interface AdminHeaderProps {
  onExport: () => void;
  onLogout: () => void;
  onNewRegistration: (type: EventType) => void;
  profile: Profile | null;
}

/**
 * Cabeçalho do Painel Administrativo.
 * Contém o título, subtítulo e ações globais (Exportar e Sair).
 */
export const AdminHeader: React.FC<AdminHeaderProps> = ({ onExport, onLogout, onNewRegistration, profile }) => {
  const isAdminGeral = profile?.tipo_permissao === 'admin_geral';
  const isEJC = profile?.tipo_permissao === 'ejc';
  const isECC = profile?.tipo_permissao === 'ecc';

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
      <div className="flex items-center space-x-4">
        {/* Ícone de destaque com gradiente/sombra */}
        <div className="bg-church-brown-dark p-3 rounded-2xl shadow-lg">
          <TrendingUp className="text-church-gold" size={32} />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-church-brown-dark tracking-tight">
            {isAdminGeral ? 'Painel Administrativo' : isEJC ? 'Painel EJC' : 'Painel ECC'}
          </h1>
          <p className="text-church-brown-medium font-medium">Paróquia de São Francisco das Chagas</p>
        </div>
      </div>
      
      {/* Ações do cabeçalho */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Botões de Inscrição */}
        {(isAdminGeral || isEJC) && (
          <button 
            onClick={() => onNewRegistration('ejc')}
            className="flex items-center space-x-2 px-6 py-3 bg-church-brown-dark text-white rounded-2xl font-bold hover:bg-church-brown-medium transition-all shadow-lg shadow-church-brown-dark/20 active:scale-95"
          >
            <UserPlus size={18} />
            <span>{isAdminGeral ? 'Nova Inscrição EJC' : 'Fazer Inscrição'}</span>
          </button>
        )}

        {(isAdminGeral || isECC) && (
          <button 
            onClick={() => onNewRegistration('ecc')}
            className="flex items-center space-x-2 px-6 py-3 bg-church-gold text-church-brown-dark rounded-2xl font-bold hover:bg-church-gold/80 transition-all shadow-lg shadow-church-gold/20 active:scale-95"
          >
            <Heart size={18} />
            <span>{isAdminGeral ? 'Nova Inscrição ECC' : 'Fazer Inscrição'}</span>
          </button>
        )}

        <div className="h-10 w-px bg-church-bege/30 mx-2 hidden lg:block"></div>

        <button 
          onClick={onExport}
          className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-church-bege text-church-brown-dark rounded-2xl font-bold hover:bg-church-creme transition-all shadow-sm active:scale-95"
          aria-label="Exportar dados para CSV"
        >
          <Download size={18} />
          <span>Exportar</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all shadow-sm active:scale-95"
          aria-label="Sair do sistema"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
};
