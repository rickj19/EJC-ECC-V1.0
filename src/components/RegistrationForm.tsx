import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, Send } from 'lucide-react';
import React, { useState } from 'react';
import { uploadPhoto, saveRegistration } from '../services/registrationService';
import { EventType, Registration } from '../types';
import { ImageUpload } from './ImageUpload';

interface RegistrationFormProps {
  eventType: EventType;
  onBack: () => void;
}

/**
 * Componente de Formulário de Inscrição.
 * Gerencia o estado dos campos, validação e envio para o Supabase.
 */
export const RegistrationForm: React.FC<RegistrationFormProps> = ({ eventType, onBack }) => {
  // Estado para os campos do formulário
  const [formData, setFormData] = useState<Partial<Registration>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  // Estados de controle de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Atualiza o estado conforme o usuário digita.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpa o erro ao começar a digitar
    if (error) setError(null);
  };

  /**
   * Valida se todos os campos obrigatórios foram preenchidos.
   */
  const validateForm = (): boolean => {
    if (!photoFile) {
      setError('A foto é obrigatória para o cadastro.');
      return false;
    }

    const requiredFields = eventType === 'ejc' 
      ? ['nome', 'data_nascimento', 'telefone', 'email', 'paroquia', 'cidade']
      : ['nome_esposo', 'nome_esposa', 'telefone_casal', 'email_casal', 'tempo_casados', 'paroquia_casal', 'cidade_casal'];

    for (const field of requiredFields) {
      const value = (formData as any)[field];
      if (!value || value.trim() === '') {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return false;
      }
    }

    return true;
  };

  /**
   * Processa o envio do formulário.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Define o caminho do arquivo no Storage
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `${eventType}/${fileName}`;

      // 2. Faz o upload da foto usando o serviço
      const photoUrl = await uploadPhoto(photoFile!, filePath);

      // 3. Monta o objeto de inscrição conforme o tipo
      const registrationData: Registration = {
        tipo_evento: eventType,
        tipo_pessoa: eventType === 'ejc' ? 'jovem' : 'casal',
        foto_path: filePath,
        foto_url: photoUrl,
        ...formData
      } as Registration;

      // 4. Salva os dados no banco de dados
      await saveRegistration(registrationData);

      // 5. Exibe sucesso e agenda o retorno
      setIsSuccess(true);
      setTimeout(onBack, 8000);

    } catch (err: any) {
      console.error('Erro no processo de cadastro:', err);
      setError(err.message || 'Ocorreu um erro inesperado ao salvar sua inscrição. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderização da tela de sucesso
  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-2xl text-center border border-church-bege/30"
      >
        <div className="w-20 h-20 bg-church-creme rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle className="text-church-brown-dark" size={48} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-church-brown-dark mb-4">Cadastro realizado com sucesso!</h2>
        
        <div className="bg-church-creme/50 p-8 rounded-2xl mb-8 italic text-church-brown-medium leading-relaxed text-lg border border-church-bege/20">
          {eventType === 'ejc' ? (
            <>
              "Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz e não de mal, para vos dar um futuro e uma esperança." (Jeremias 29:11)
              <p className="mt-6 font-serif font-bold not-italic text-church-brown-dark">Obrigado pelo seu cadastro. Que Deus abençoe sua caminhada.</p>
            </>
          ) : (
            <>
              "Eu e minha casa serviremos ao Senhor." (Josué 24:15)
              <p className="mt-6 font-serif font-bold not-italic text-church-brown-dark">Obrigado pelo cadastro. Que Deus fortaleça cada dia mais a união de vocês.</p>
            </>
          )}
        </div>

        <p className="text-church-brown-medium/60 text-sm mb-8">Redirecionando para o início em alguns segundos...</p>
        
        <button
          onClick={onBack}
          className="w-full btn-primary"
        >
          Voltar Agora
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-church-bege/30"
    >
      <div className="flex items-center mb-12 border-b border-church-bege/20 pb-8">
        <button onClick={onBack} className="p-3 hover:bg-church-creme rounded-full transition-colors mr-6 text-church-brown-medium">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-3xl font-serif font-bold text-church-brown-dark">Inscrição para o {eventType.toUpperCase()}</h2>
          <p className="text-church-brown-medium text-sm mt-1">Preencha todos os campos com atenção e carinho.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Mensagem de Erro */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl"
          >
            <p className="text-red-700 text-sm font-bold">{error}</p>
          </motion.div>
        )}

        {/* Seção da Foto */}
        <div className="flex flex-col items-center bg-church-creme/30 p-8 rounded-3xl border border-church-bege/20">
          <label className="block text-sm font-bold text-church-brown-dark mb-6 uppercase tracking-widest">Foto do Encontrista</label>
          <ImageUpload onImageProcessed={setPhotoFile} />
          <p className="text-xs text-church-brown-medium mt-4 italic">A foto é essencial para identificação no encontro.</p>
        </div>

        {/* Seção de Dados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {eventType === 'ejc' ? (
            <>
              <FormField label="Nome Completo" name="nome" onChange={handleInputChange} placeholder="Ex: João Silva" />
              <FormField label="Data de Nascimento" name="data_nascimento" type="date" onChange={handleInputChange} />
              <FormField label="Telefone / WhatsApp" name="telefone" type="tel" onChange={handleInputChange} placeholder="(00) 00000-0000" />
              <FormField label="E-mail" name="email" type="email" onChange={handleInputChange} placeholder="seu@email.com" />
              <FormField label="Paróquia" name="paroquia" onChange={handleInputChange} placeholder="Nome da sua paróquia" />
              <FormField label="Cidade" name="cidade" onChange={handleInputChange} placeholder="Sua cidade" />
            </>
          ) : (
            <>
              <FormField label="Nome do Esposo" name="nome_esposo" onChange={handleInputChange} placeholder="Nome completo" />
              <FormField label="Nome da Esposa" name="nome_esposa" onChange={handleInputChange} placeholder="Nome completo" />
              <FormField label="Telefone do Casal" name="telefone_casal" type="tel" onChange={handleInputChange} placeholder="(00) 00000-0000" />
              <FormField label="E-mail do Casal" name="email_casal" type="email" onChange={handleInputChange} placeholder="casal@email.com" />
              <FormField label="Tempo de Casados" name="tempo_casados" onChange={handleInputChange} placeholder="Ex: 5 anos" />
              <FormField label="Paróquia" name="paroquia_casal" onChange={handleInputChange} placeholder="Onde frequentam" />
              <div className="md:col-span-2">
                <FormField label="Cidade" name="cidade_casal" onChange={handleInputChange} placeholder="Cidade onde moram" />
              </div>
            </>
          )}
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-6 text-xl flex items-center justify-center space-x-4 disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Processando Cadastro...</span>
            </>
          ) : (
            <>
              <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <span>Enviar Inscrição</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

/**
 * Sub-componente para campos de formulário padronizados.
 */
const FormField: React.FC<{
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, type = 'text', placeholder, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-church-brown-dark ml-1 uppercase tracking-widest">{label}</label>
    <input
      required
      type={type}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      className="input-field"
    />
  </div>
);
