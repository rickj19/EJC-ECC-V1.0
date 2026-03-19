import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Printer, Image as ImageIcon, Layout, Download, Church } from 'lucide-react';
import { Registration, EJCRegistration, ECCRegistration } from '../../types';

interface BadgeModalProps {
  registration: Registration;
  onClose: () => void;
}

/**
 * Modal de Geração e Impressão de Crachá.
 * Permite visualizar o crachá, alternar foto e imprimir.
 */
export const BadgeModal: React.FC<BadgeModalProps> = ({ registration, onClose }) => {
  const [showPhoto, setShowPhoto] = useState(true);
  const [badgeSize, setBadgeSize] = useState<'standard' | 'large'>('standard');
  const badgeRef = useRef<HTMLDivElement>(null);

  const isEJC = registration.tipo_evento === 'ejc';
  const regEJC = registration as EJCRegistration;
  const regECC = registration as ECCRegistration;

  const name = isEJC ? regEJC.nome : `${regECC.nome_esposo} & ${regECC.nome_esposa}`;
  const city = isEJC ? regEJC.cidade : regECC.cidade_casal;
  const parish = isEJC ? regEJC.paroquia : regECC.paroquia_casal;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 no-print">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-church-brown-dark/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-church-creme w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]"
      >
        {/* Painel de Configuração */}
        <div className="w-full md:w-80 bg-white p-8 border-r border-church-bege/20 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-serif font-bold text-church-brown-dark">Configurar Crachá</h3>
            <button onClick={onClose} className="md:hidden p-2 text-church-brown-medium hover:text-church-gold transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6 flex-grow">
            {/* Toggle Foto */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-bold text-church-gold">Visualização</label>
              <button 
                onClick={() => setShowPhoto(!showPhoto)}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center space-x-3 ${
                  showPhoto ? 'border-church-brown-dark bg-church-creme/30 text-church-brown-dark' : 'border-church-bege bg-white text-church-brown-medium'
                }`}
              >
                <div className={`p-2 rounded-lg ${showPhoto ? 'bg-church-brown-dark text-white' : 'bg-church-creme'}`}>
                  <ImageIcon size={18} />
                </div>
                <span className="font-bold text-sm">{showPhoto ? 'Com Foto' : 'Sem Foto'}</span>
              </button>
            </div>

            {/* Tamanho */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-bold text-church-gold">Tamanho do Crachá</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setBadgeSize('standard')}
                  className={`p-3 rounded-2xl border-2 transition-all text-center ${
                    badgeSize === 'standard' ? 'border-church-brown-dark bg-church-creme/30 text-church-brown-dark' : 'border-church-bege bg-white text-church-brown-medium'
                  }`}
                >
                  <Layout size={18} className="mx-auto mb-1" />
                  <span className="text-[10px] font-bold block">Padrão (9x6)</span>
                </button>
                <button 
                  onClick={() => setBadgeSize('large')}
                  className={`p-3 rounded-2xl border-2 transition-all text-center ${
                    badgeSize === 'large' ? 'border-church-brown-dark bg-church-creme/30 text-church-brown-dark' : 'border-church-bege bg-white text-church-brown-medium'
                  }`}
                >
                  <Layout size={24} className="mx-auto mb-1" />
                  <span className="text-[10px] font-bold block">Grande (10x15)</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-church-creme/50 rounded-2xl border border-church-gold/10">
              <p className="text-[10px] text-church-brown-medium leading-relaxed italic">
                Dica: Para melhores resultados, certifique-se de que a opção "Gráficos de segundo plano" esteja marcada nas configurações de impressão do seu navegador.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button 
              onClick={handlePrint}
              className="w-full p-5 bg-church-brown-dark text-white rounded-2xl font-bold flex items-center justify-center space-x-3 shadow-lg hover:bg-church-brown-medium transition-all active:scale-95"
            >
              <Printer size={20} />
              <span>Imprimir Agora</span>
            </button>
            <button 
              onClick={onClose}
              className="w-full p-4 text-church-brown-medium font-bold hover:text-church-gold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Área de Preview */}
        <div className="flex-grow p-10 flex items-center justify-center bg-church-bege/10 overflow-auto">
          <div id="printable-badge" className={`badge-preview ${badgeSize}`}>
            <div className="badge-border">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="badge-parish-name">Paróquia de São Francisco das Chagas</span>
                  <span className="badge-event-tag">{registration.tipo_evento} - 2026</span>
                </div>
                <div className="bg-church-brown-dark p-1.5 rounded-lg shadow-sm">
                  <Church className="text-church-gold" size={16} />
                </div>
              </div>

              {/* Content */}
              <div className={`flex ${badgeSize === 'large' ? 'flex-col items-center text-center space-y-6' : 'items-center space-x-6'} flex-grow justify-center`}>
                {showPhoto ? (
                  <div className="badge-photo-container">
                    <img 
                      src={registration.foto_url} 
                      alt="Foto" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className={`badge-photo-container bg-church-creme/30 flex items-center justify-center border-dashed border-church-gold/30 ${badgeSize === 'large' ? 'w-32 h-40' : ''}`}>
                    <Church className="text-church-gold/20" size={badgeSize === 'large' ? 48 : 32} />
                  </div>
                )}
                
                <div className="flex flex-col">
                  <h4 className={`${badgeSize === 'large' ? 'text-3xl' : 'text-xl'} font-serif font-extrabold text-church-brown-dark mb-1 leading-tight`}>
                    {name}
                  </h4>
                  <span className={`${badgeSize === 'large' ? 'text-sm' : 'text-[0.7rem]'} text-church-brown-medium font-semibold opacity-80`}>
                    {parish}
                  </span>
                  <span className={`${badgeSize === 'large' ? 'text-sm' : 'text-[0.7rem]'} text-church-brown-medium font-semibold opacity-80`}>
                    {city}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="badge-footer">
                <div className="badge-footer-line"></div>
                <span>"Instrumento de vossa paz"</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur-md rounded-full text-church-brown-dark hover:bg-white transition-all shadow-lg hidden md:block"
        >
          <X size={24} />
        </button>
      </motion.div>
    </div>
  );
};
