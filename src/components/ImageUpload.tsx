import { Camera, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { processImage, generatePreview } from '../utils/imageProcessor';

interface ImageUploadProps {
  onImageProcessed: (file: File | null) => void;
}

/**
 * Componente para captura e pré-visualização de imagem.
 * Realiza o processamento automático (redimensionamento/compressão).
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageProcessed }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Gerencia a seleção de arquivo e inicia o processamento.
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      
      // Processa a imagem (redimensiona e converte para JPEG)
      const optimizedFile = await processImage(file);
      
      // Gera o preview para o usuário
      const previewUrl = await generatePreview(optimizedFile);
      
      setPreview(previewUrl);
      onImageProcessed(optimizedFile);
    } catch (error: any) {
      alert(error.message || 'Erro ao processar imagem.');
      onImageProcessed(null);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Limpa a imagem selecionada.
   */
  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageProcessed(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div 
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative w-48 h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden bg-white
          ${preview ? 'border-church-gold shadow-xl' : 'border-church-bege hover:border-church-gold hover:bg-church-creme/50'}
          ${isProcessing ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center p-6 text-center">
            <div className="bg-church-creme p-5 rounded-2xl mb-4 shadow-inner">
              {isProcessing ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-brown-dark"></div>
              ) : (
                <Camera className="text-church-brown-medium" size={32} />
              )}
            </div>
            <span className="text-sm font-bold text-church-brown-dark uppercase tracking-widest">
              {isProcessing ? 'Processando...' : 'Tirar ou Escolher Foto'}
            </span>
            <p className="text-[10px] text-church-brown-medium/60 mt-3 uppercase tracking-tighter">Obrigatório para o cadastro</p>
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="user" // Sugere o uso da câmera frontal em celulares
        className="hidden"
      />
    </div>
  );
};
