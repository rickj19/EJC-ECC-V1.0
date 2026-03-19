import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Registration, EJCRegistration, ECCRegistration } from '../../types';

interface DetailsModalProps {
  registration: Registration;
  onClose: () => void;
}

/**
 * Modal de visualização de detalhes completos de um cadastro.
 */
export const DetailsModal: React.FC<DetailsModalProps> = ({ registration, onClose }) => {
  const isEJC = registration.tipo_evento === 'ejc';
  const regEJC = registration as EJCRegistration;
  const regECC = registration as ECCRegistration;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-church-brown-dark/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        {/* Botão Fechar */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 bg-church-creme rounded-full text-church-brown-dark hover:bg-church-bege z-10 transition-colors shadow-md"
          aria-label="Fechar"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Foto Lateral */}
          <div className="md:w-1/3 h-64 md:h-auto">
            <img 
              src={registration.foto_url} 
              alt="Foto do Inscrito" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Conteúdo dos Detalhes */}
          <div className="md:w-2/3 p-10">
            <div className="mb-8">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block ${
                isEJC ? 'bg-church-brown-dark text-white' : 'bg-church-gold text-white'
              }`}>
                {registration.tipo_evento}
              </span>
              <h2 className="text-3xl font-serif font-bold text-church-brown-dark">
                {isEJC ? regEJC.nome : `${regECC.nome_esposo} & ${regECC.nome_esposa}`}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <InfoItem 
                label={isEJC ? "Nascimento" : "Tempo Casados"} 
                value={isEJC ? new Date(regEJC.data_nascimento).toLocaleDateString() : regECC.tempo_casados} 
              />
              <InfoItem 
                label="Telefone" 
                value={isEJC ? regEJC.telefone : regECC.telefone_casal} 
              />
              <InfoItem 
                label="E-mail" 
                value={isEJC ? regEJC.email : regECC.email_casal} 
              />
              <InfoItem 
                label="Cidade" 
                value={isEJC ? regEJC.cidade : regECC.cidade_casal} 
              />
              <InfoItem 
                label="Paróquia" 
                value={isEJC ? regEJC.paroquia : regECC.paroquia_casal} 
              />
              <InfoItem 
                label="Inscrito em" 
                value={new Date(registration.created_at!).toLocaleString()} 
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Componente interno para exibir um par rótulo/valor.
 */
const InfoItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="group">
    <p className="text-[10px] uppercase font-bold tracking-widest text-church-brown-medium/50 mb-1 group-hover:text-church-gold transition-colors">{label}</p>
    <p className="text-church-brown-dark font-bold text-lg">{value || 'Não informado'}</p>
  </div>
);
