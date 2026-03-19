/**
 * Utilitários para processamento de imagens no frontend.
 * Focado em redimensionamento e conversão para JPEG otimizado.
 */
import imageCompression from 'browser-image-compression';

/**
 * Redimensiona e comprime uma imagem para o padrão JPEG.
 * @param file Arquivo de imagem original
 * @returns Arquivo processado e otimizado
 */
export async function processImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5,            // Tamanho máximo de 500KB
    maxWidthOrHeight: 800,     // Dimensão máxima (largura ou altura)
    useWebWorker: true,
    fileType: 'image/jpeg',    // Garante que a saída seja JPEG
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    throw new Error('Não foi possível processar a imagem selecionada.');
  }
}

/**
 * Gera uma URL de preview para um arquivo.
 * @param file Arquivo de imagem
 * @returns String com a URL de preview (DataURL)
 */
export function generatePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
