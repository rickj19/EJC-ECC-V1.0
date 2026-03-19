import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Registration, Profile } from '../../types';

interface QuickReportsProps {
  registrations: Registration[];
  stats: {
    ejc: number;
    ecc: number;
    total: number;
  };
  profile: Profile | null;
}

/**
 * Seção de relatórios rápidos com estatísticas por cidade, paróquia e evento.
 */
export const QuickReports: React.FC<QuickReportsProps> = ({ registrations, stats, profile }) => {
  const isGeneral = profile?.tipo_permissao === 'admin_geral';
  // Agrupamento por cidade
  const cityData = Object.entries(
    registrations.reduce((acc: any, reg: any) => {
      const city = reg.tipo_evento === 'ejc' ? reg.cidade : reg.cidade_casal;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {})
  ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);

  // Agrupamento por paróquia
  const parishData = Object.entries(
    registrations.reduce((acc: any, reg: any) => {
      const parish = reg.tipo_evento === 'ejc' ? reg.paroquia : reg.paroquia_casal;
      acc[parish] = (acc[parish] || 0) + 1;
      return acc;
    }, {})
  ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="mt-12 mb-20">
      <h2 className="text-2xl font-serif font-bold text-church-brown-dark mb-8 flex items-center">
        <TrendingUp className="mr-3 text-church-gold" size={24} />
        Relatórios Rápidos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ReportCard title="Inscritos por Cidade" data={cityData} />
        <ReportCard title="Inscritos por Paróquia" data={parishData} />
        
        {/* Gráfico de Distribuição */}
        {isGeneral && (
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-church-bege/20 flex flex-col justify-center">
            <h3 className="text-lg font-serif font-bold text-church-brown-dark mb-6">Distribuição por Evento</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-church-brown-medium font-bold">EJC</span>
                <span className="text-church-brown-dark font-black">{stats.ejc}</span>
              </div>
              <div className="w-full bg-church-creme h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-church-brown-dark h-full transition-all duration-1000" 
                  style={{ width: `${(stats.ejc / (stats.total || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className="text-church-brown-medium font-bold">ECC</span>
                <span className="text-church-brown-dark font-black">{stats.ecc}</span>
              </div>
              <div className="w-full bg-church-creme h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-church-gold h-full transition-all duration-1000" 
                  style={{ width: `${(stats.ecc / (stats.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Componente interno para um cartão de relatório (lista de contagens).
 */
const ReportCard: React.FC<{ title: string, data: [string, any][] }> = ({ title, data }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-church-bege/20">
    <h3 className="text-lg font-serif font-bold text-church-brown-dark mb-6">{title}</h3>
    <div className="space-y-4">
      {data.map(([label, count]) => (
        <div key={label} className="flex items-center justify-between group">
          <span className="text-church-brown-medium font-medium group-hover:text-church-brown-dark transition-colors truncate pr-2">
            {label || 'Não informado'}
          </span>
          <span className="bg-church-creme px-3 py-1 rounded-lg text-church-brown-dark font-black text-sm shrink-0">
            {count}
          </span>
        </div>
      ))}
      {data.length === 0 && <p className="text-church-brown-medium text-sm italic">Nenhum dado disponível.</p>}
    </div>
  </div>
);
