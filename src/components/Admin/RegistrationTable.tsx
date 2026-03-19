import React from 'react';
import { Search, Eye, Edit, Trash2, CreditCard } from 'lucide-react';
import { Registration, EJCRegistration, ECCRegistration } from '../../types';

interface RegistrationTableProps {
  data: Registration[];
  isLoading: boolean;
  onView: (reg: Registration) => void;
  onEdit: (reg: Registration) => void;
  onDelete: (id: string, path: string) => void;
  onBadge: (reg: Registration) => void;
}

/**
 * Tabela principal de listagem de cadastros.
 * Exibe dados básicos e botões de ação (Ver, Editar, Excluir, Crachá).
 */
export const RegistrationTable: React.FC<RegistrationTableProps> = ({ 
  data, 
  isLoading, 
  onView, 
  onEdit, 
  onDelete,
  onBadge
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-church-bege/20 p-24 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-church-brown-dark mb-6"></div>
        <p className="text-church-brown-medium font-bold">Sincronizando com o Supabase...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-church-bege/20 p-24 text-center">
        <Search className="text-church-bege mx-auto mb-4" size={48} />
        <h3 className="text-2xl font-serif font-bold text-church-brown-dark">Nenhum resultado</h3>
        <p className="text-church-brown-medium">Ajuste os filtros para encontrar o que procura.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-church-bege/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-church-creme/50 text-church-brown-medium text-[10px] uppercase font-bold tracking-[0.2em]">
              <th className="px-8 py-6">Inscrito</th>
              <th className="px-8 py-6 hidden md:table-cell">Evento</th>
              <th className="px-8 py-6 hidden lg:table-cell">Contatos</th>
              <th className="px-8 py-6 hidden lg:table-cell">Localização</th>
              <th className="px-8 py-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-church-bege/10">
            {data.map((reg) => {
              const isEJC = reg.tipo_evento === 'ejc';
              const regEJC = reg as EJCRegistration;
              const regECC = reg as ECCRegistration;
              
              const name = isEJC ? regEJC.nome : `${regECC.nome_esposo} & ${regECC.nome_esposa}`;
              const phone = isEJC ? regEJC.telefone : regECC.telefone_casal;
              const email = isEJC ? regEJC.email : regECC.email_casal;
              const city = isEJC ? regEJC.cidade : regECC.cidade_casal;

              return (
                <tr key={reg.id} className="hover:bg-church-creme/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={reg.foto_url} 
                        alt="Foto" 
                        className="w-12 h-16 object-cover rounded-lg shadow-md border-2 border-white group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-serif font-bold text-church-brown-dark text-lg leading-tight">
                          {name}
                        </div>
                        <div className="text-[10px] text-church-gold font-bold uppercase tracking-widest mt-1 md:hidden">
                          {reg.tipo_evento}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 hidden md:table-cell">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      isEJC ? 'bg-church-brown-dark text-white' : 'bg-church-gold text-white'
                    }`}>
                      {reg.tipo_evento}
                    </span>
                  </td>
                  <td className="px-8 py-6 hidden lg:table-cell">
                    <div className="text-sm font-bold text-church-brown-medium">
                      {phone}
                    </div>
                    <div className="text-xs text-church-brown-medium/60">
                      {email}
                    </div>
                  </td>
                  <td className="px-8 py-6 hidden lg:table-cell">
                    <div className="text-sm font-bold text-church-brown-medium">
                      {city}
                    </div>
                    <div className="text-[10px] text-church-brown-medium/40 uppercase tracking-widest">
                      {new Date(reg.created_at!).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onBadge(reg)}
                        className="p-2 bg-church-gold/10 text-church-gold rounded-lg hover:bg-church-gold/20 transition-colors shadow-sm active:scale-90"
                        title="Gerar Crachá"
                      >
                        <CreditCard size={18} />
                      </button>
                      <button 
                        onClick={() => onView(reg)}
                        className="p-2 bg-church-creme text-church-brown-dark rounded-lg hover:bg-church-bege transition-colors shadow-sm active:scale-90"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => onEdit(reg)}
                        className="p-2 bg-church-creme text-church-brown-dark rounded-lg hover:bg-church-bege transition-colors shadow-sm active:scale-90"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(reg.id!, reg.foto_path)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm active:scale-90"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
