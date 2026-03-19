import React from 'react';
import { Filter, Search } from 'lucide-react';
import { Profile } from '../../types';

interface FilterBarProps {
  filters: {
    eventType: string;
    searchTerm: string;
    phoneTerm: string;
    sortBy: string;
    city: string;
    parish: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  profile: Profile | null;
}

/**
 * Barra de filtros e pesquisa.
 * Permite filtrar por evento, nome, telefone, cidade, paróquia e ordenação.
 */
export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, profile }) => {
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const isGeneral = profile?.tipo_permissao === 'admin_geral';

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-church-bege/20 p-8 mb-10">
      <div className="flex items-center space-x-2 mb-6 text-church-brown-dark">
        <Filter size={20} />
        <h2 className="text-xl font-serif font-bold">Filtros e Pesquisa</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Filtro por Evento */}
        {isGeneral && (
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-church-brown-medium/60 ml-2">Evento</label>
            <select 
              value={filters.eventType}
              onChange={(e) => handleFilterChange('eventType', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-church-creme/30 border border-church-bege focus:ring-2 focus:ring-church-gold outline-none font-bold transition-all"
            >
              <option value="ALL">Todos os Eventos</option>
              <option value="EJC">EJC</option>
              <option value="ECC">ECC</option>
            </select>
          </div>
        )}

        {/* Busca por Nome */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-church-brown-medium/60 ml-2">Nome</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-church-brown-medium/40" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-church-creme/30 border border-church-bege focus:ring-2 focus:ring-church-gold outline-none transition-all"
            />
          </div>
        </div>

        {/* Busca por Telefone */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-church-brown-medium/60 ml-2">Telefone</label>
          <input 
            type="text"
            placeholder="(00) 00000-0000"
            value={filters.phoneTerm}
            onChange={(e) => handleFilterChange('phoneTerm', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-church-creme/30 border border-church-bege focus:ring-2 focus:ring-church-gold outline-none transition-all"
          />
        </div>

        {/* Ordenação */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-church-brown-medium/60 ml-2">Ordenar Por</label>
          <select 
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-church-creme/30 border border-church-bege focus:ring-2 focus:ring-church-gold outline-none font-bold transition-all"
          >
            <option value="newest">Mais Recente</option>
            <option value="oldest">Mais Antigo</option>
            <option value="name">Nome (A-Z)</option>
          </select>
        </div>

        {/* Filtro por Cidade */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-church-brown-medium/60 ml-2">Cidade</label>
          <input 
            type="text"
            placeholder="Filtrar cidade..."
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-church-creme/30 border border-church-bege focus:ring-2 focus:ring-church-gold outline-none transition-all"
          />
        </div>

        {/* Filtro por Paróquia */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-church-brown-medium/60 ml-2">Paróquia</label>
          <input 
            type="text"
            placeholder="Filtrar paróquia..."
            value={filters.parish}
            onChange={(e) => handleFilterChange('parish', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-church-creme/30 border border-church-bege focus:ring-2 focus:ring-church-gold outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};
