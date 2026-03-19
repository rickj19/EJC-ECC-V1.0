import { useState, useEffect, useMemo, useCallback } from 'react';
import { getRegistrations, deleteRegistration, updateRegistration, deletePhoto } from '../services/registrationService';
import { Registration, EJCRegistration, ECCRegistration, Profile } from '../types';

/**
 * Hook customizado para gerenciar a lógica de dados do Painel Administrativo.
 * Centraliza busca, filtragem, estatísticas e operações de CRUD.
 */
export const useAdminData = (profile: Profile | null) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  
  // Estado dos filtros
  const [filters, setFilters] = useState({
    eventType: 'ALL',
    city: '',
    parish: '',
    searchTerm: '',
    phoneTerm: '',
    sortBy: 'newest' // newest, oldest, name
  });

  // Carrega os dados iniciais
  const loadData = useCallback(async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      // Filtra por permissão se não for admin_geral
      const eventTypeFilter = profile.tipo_permissao === 'admin_geral' ? undefined : profile.tipo_permissao;
      const data = await getRegistrations(eventTypeFilter);
      setRegistrations(data as Registration[] || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lógica de Filtragem e Ordenação (Memoizada para performance)
  const filteredRegistrations = useMemo(() => {
    return registrations
      .filter(reg => {
        const isEJC = reg.tipo_evento === 'ejc';
        const regEJC = reg as EJCRegistration;
        const regECC = reg as ECCRegistration;
        
        const name = isEJC ? regEJC.nome : `${regECC.nome_esposo} & ${regECC.nome_esposa}`;
        const phone = isEJC ? regEJC.telefone : regECC.telefone_casal;
        const city = isEJC ? regEJC.cidade : regECC.cidade_casal;
        const parish = isEJC ? regEJC.paroquia : regECC.paroquia_casal;

        const matchesType = filters.eventType === 'ALL' || reg.tipo_evento === filters.eventType.toLowerCase();
        const matchesSearch = name.toLowerCase().includes(filters.searchTerm.toLowerCase());
        const matchesPhone = phone.includes(filters.phoneTerm);
        const matchesCity = !filters.city || city.toLowerCase().includes(filters.city.toLowerCase());
        const matchesParish = !filters.parish || parish.toLowerCase().includes(filters.parish.toLowerCase());

        return matchesType && matchesSearch && matchesPhone && matchesCity && matchesParish;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'newest') return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime();
        if (filters.sortBy === 'oldest') return new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime();
        
        const nameA = a.tipo_evento === 'ejc' ? (a as EJCRegistration).nome : (a as ECCRegistration).nome_esposo;
        const nameB = b.tipo_evento === 'ejc' ? (b as EJCRegistration).nome : (b as ECCRegistration).nome_esposo;
        return nameA.localeCompare(nameB);
      });
  }, [registrations, filters]);

  // Cálculo de Estatísticas (Memoizado)
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return {
      total: registrations.length,
      ejc: registrations.filter(r => r.tipo_evento === 'ejc').length,
      ecc: registrations.filter(r => r.tipo_evento === 'ecc').length,
      today: registrations.filter(r => new Date(r.created_at!) >= today).length,
      week: registrations.filter(r => new Date(r.created_at!) >= weekAgo).length
    };
  }, [registrations]);

  // Operações CRUD
  const removeRegistration = async (id: string, photoPath: string) => {
    try {
      await deleteRegistration(id);
      if (photoPath) await deletePhoto(photoPath);
      setRegistrations(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (error) {
      console.error('Erro ao remover:', error);
      return false;
    }
  };

  const saveRegistration = async (id: string, data: Partial<Registration>) => {
    try {
      await updateRegistration(id, data);
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
      setEditingRegistration(null);
      return true;
    } catch (error) {
      console.error('Erro ao salvar:', error);
      return false;
    }
  };

  // Lógica de Exportação para CSV
  const exportToCSV = (dataToExport: Registration[]) => {
    if (dataToExport.length === 0) return;

    const headers = ['Tipo', 'Nome/Casal', 'Telefone', 'Email', 'Cidade', 'Paróquia', 'Data Cadastro'];
    const rows = dataToExport.map(r => [
      r.tipo_evento.toUpperCase(),
      r.tipo_evento === 'ejc' ? (r as EJCRegistration).nome : `${(r as ECCRegistration).nome_esposo} & ${(r as ECCRegistration).nome_esposa}`,
      r.tipo_evento === 'ejc' ? (r as EJCRegistration).telefone : (r as ECCRegistration).telefone_casal,
      r.tipo_evento === 'ejc' ? (r as EJCRegistration).email : (r as ECCRegistration).email_casal,
      r.tipo_evento === 'ejc' ? (r as EJCRegistration).cidade : (r as ECCRegistration).cidade_casal,
      r.tipo_evento === 'ejc' ? (r as EJCRegistration).paroquia : (r as ECCRegistration).paroquia_casal,
      new Date(r.created_at!).toLocaleDateString()
    ]);
    
    const csvContent = [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_paroquia_${new Date().getTime()}.csv`;
    link.click();
  };

  return {
    registrations,
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
    refreshData: loadData
  };
};
