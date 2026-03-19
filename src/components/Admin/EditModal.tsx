import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Save, Camera, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { Registration } from '../../types';
import { uploadPhoto } from '../../services/registrationService';
import { supabase } from '../../lib/supabase';

interface EditModalProps {
  registration: Registration;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<boolean>;
}

/**
 * Modal de edição de cadastro.
 * Adapta o formulário conforme o tipo de evento (EJC ou ECC).
 * Inclui suporte para atualização de foto com redimensionamento.
 */
export const EditModal: React.FC<EditModalProps> = ({ registration, onClose, onSave }) => {
  const isEJC = registration.tipo_evento === 'ejc';
  const [formData, setFormData] = useState<any>(registration);
  const [isSaving, setIsSaving] = useState(false);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let updatedData = { ...formData };

      // 1. Se houver nova foto, faz o upload
      if (newPhoto) {
        const timestamp = new Date().getTime();
        const path = `${registration.tipo_evento}/${timestamp}_${newPhoto.name}`;
        const photoUrl = await uploadPhoto(newPhoto, path);
        
        // Remove a foto antiga do storage se necessário (opcional)
        if (registration.foto_path) {
          await supabase.storage.from('fotos-encontro').remove([registration.foto_path]);
        }

        updatedData.foto_path = path;
        updatedData.foto_url = photoUrl;
      }

      const success = await onSave(registration.id!, updatedData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-church-brown-dark/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh]"
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-serif font-bold text-church-brown-dark">Editar Cadastro</h2>
            <p className="text-church-brown-medium text-sm">Atualize os dados e a foto do inscrito abaixo.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-church-creme rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Área da Foto */}
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="relative group mb-4">
              <div className="w-48 h-64 bg-church-creme rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <img 
                  src={photoPreview || formData.foto_url} 
                  alt="Foto" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-4 right-4 p-3 bg-church-gold text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                title="Trocar Foto"
              >
                <Camera size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <p className="text-[10px] text-church-brown-medium uppercase font-bold tracking-widest text-center">
              Clique no ícone para trocar a foto
            </p>
          </div>

          {/* Formulário Dinâmico */}
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {isEJC ? (
              <>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-church-brown-medium uppercase tracking-widest">Nome Completo</label>
                  <input name="nome" value={formData.nome || ''} onChange={handleChange} className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-church-brown-medium uppercase tracking-widest">Nascimento</label>
                  <input type="date" name="data_nascimento" value={formData.data_nascimento || ''} onChange={handleChange} className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-church-brown-medium uppercase tracking-widest">Telefone</label>
                  <input name="telefone" value={formData.telefone || ''} onChange={handleChange} className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-church-brown-medium uppercase tracking-widest">E-mail</label>
                  <input name="email" value={formData.email || ''} onChange={handleChange} className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-church-brown-medium uppercase tracking-widest">Cidade</label>
                  <input name="cidade" value={formData.cidade || ''} onChange={handleChange} className="input-field" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-church-brown-medium uppercase tracking-widest">Paróquia</label>
                  <input name="paroquia" value={formData.paroquia || ''} onChange={handleChange} className="input-field" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-church-brown-medium uppercase tracking-widest">Nome do Esposo</label>
                  <input name="nome_esposo" value={formData.nome_esposo || ''} onChange={handleChange} className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-church-brown-medium uppercase tracking-widest">Nome da Esposa</label>
                  <input name="nome_esposa" value={formData.nome_esposa || ''} onChange={handleChange} className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-church-brown-medium uppercase tracking-widest">Tempo de Casados</label>
                  <input name="tempo_casados" value={formData.tempo_casados || ''} onChange={handleChange} className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-church-brown-medium uppercase tracking-widest">Telefone Casal</label>
                  <input name="telefone_casal" value={formData.telefone_casal || ''} onChange={handleChange} className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-church-brown-medium uppercase tracking-widest">E-mail Casal</label>
                  <input name="email_casal" value={formData.email_casal || ''} onChange={handleChange} className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-church-brown-medium uppercase tracking-widest">Cidade</label>
                  <input name="cidade_casal" value={formData.cidade_casal || ''} onChange={handleChange} className="input-field" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-church-brown-medium uppercase tracking-widest">Paróquia</label>
                  <input name="paroquia_casal" value={formData.paroquia_casal || ''} onChange={handleChange} className="input-field" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mt-10 flex space-x-4">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 rounded-2xl bg-church-creme text-church-brown-dark font-bold hover:bg-church-bege transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex-1 py-4 rounded-2xl bg-church-brown-dark text-white font-bold hover:bg-church-brown-medium transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save size={18} />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
