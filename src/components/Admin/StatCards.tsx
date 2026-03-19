import React from 'react';
import { Users, Heart, Clock, Calendar } from 'lucide-react';
import { Profile } from '../../types';

interface StatCardsProps {
  stats: {
    total: number;
    ejc: number;
    ecc: number;
    today: number;
    week: number;
  };
  profile: Profile | null;
}

/**
 * Exibe cartões de estatísticas rápidas.
 * Mostra contagens totais e por período.
 */
export const StatCards: React.FC<StatCardsProps> = ({ stats, profile }) => {
  const isGeneral = profile?.tipo_permissao === 'admin_geral';
  const isEJC = profile?.tipo_permissao === 'ejc';
  const isECC = profile?.tipo_permissao === 'ecc';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
      <StatCard 
        title="Total Inscritos" 
        value={stats.total} 
        icon={<Users size={24} />} 
        color="brown" 
      />
      {(isGeneral || isEJC) && (
        <StatCard 
          title="Total EJC" 
          value={stats.ejc} 
          icon={<Heart size={24} />} 
          color="brown" 
        />
      )}
      {(isGeneral || isECC) && (
        <StatCard 
          title="Total ECC" 
          value={stats.ecc} 
          icon={<Heart size={24} />} 
          color="gold" 
        />
      )}
      <StatCard 
        title="Hoje" 
        value={stats.today} 
        icon={<Clock size={24} />} 
        color="brown" 
      />
      <StatCard 
        title="Esta Semana" 
        value={stats.week} 
        icon={<Calendar size={24} />} 
        color="gold" 
      />
    </div>
  );
};

/**
 * Componente interno para um único cartão de estatística.
 */
const StatCard: React.FC<{ 
  title: string, 
  value: number, 
  icon: React.ReactNode, 
  color: 'brown' | 'gold' 
}> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-lg border border-church-bege/20 flex items-center space-x-4 hover:shadow-xl transition-shadow">
    <div className={`p-4 rounded-2xl ${
      color === 'brown' 
        ? 'bg-church-creme text-church-brown-dark' 
        : 'bg-church-bege/20 text-church-gold'
    }`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-church-brown-medium/60">{title}</p>
      <p className="text-2xl font-serif font-bold text-church-brown-dark">{value}</p>
    </div>
  </div>
);
