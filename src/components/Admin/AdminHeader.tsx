import React from 'react';
import { TrendingUp, Download, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  onExport: () => void;
  onLogout: () => void;
}

/**
 * Cabeçalho do Painel Administrativo.
 * Contém o título, subtítulo e ações globais (Exportar e Sair).
 */
export const AdminHeader: React.FC<AdminHeaderProps> = ({ onExport, onLogout }) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
      <div className="flex items-center space-x-4">
        {/* Ícone de destaque com gradiente/sombra */}
        <div className="bg-church-brown-dark p-3 rounded-2xl shadow-lg">
          <TrendingUp className="text-church-gold" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-church-brown-dark tracking-tight">Painel Administrativo</h1>
          <p className="text-church-brown-medium font-medium">Paróquia de São Francisco das Chagas</p>
        </div>
      </div>
      
      {/* Ações do cabeçalho */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onExport}
          className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-church-bege text-church-brown-dark rounded-2xl font-bold hover:bg-church-creme transition-all shadow-sm active:scale-95"
          aria-label="Exportar dados para CSV"
        >
          <Download size={18} />
          <span>Exportar CSV</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all shadow-sm active:scale-95"
          aria-label="Sair do sistema"
        >
          <LogOut size={18} />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </header>
  );
};
