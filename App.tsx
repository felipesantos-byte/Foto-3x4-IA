import React, { useState, useRef } from 'react';
import { BackgroundType } from './types';
import { generateIdPhoto } from './services/gemini';
import { cropTo3x4, resizeImage } from './utils/imageProcessing';
import { PrintTemplate } from './components/PrintTemplate';
import { Upload, Printer, RefreshCw, CheckCircle, Image as ImageIcon, AlertCircle, Scissors } from 'lucide-react';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [whiteBgUrl, setWhiteBgUrl] = useState<string | null>(null);
  const [blueBgUrl, setBlueBgUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setStatusMessage("Preparando imagem...");
        const resizedBase64 = await resizeImage(file);
        setOriginalImage(resizedBase64);
        setWhiteBgUrl(null);
        setBlueBgUrl(null);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar imagem. Tente outra.");
      }
    }
  };

  const processImages = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Generate White BG
      setStatusMessage("Gerando versão com fundo branco com IA...");
      const whiteRaw = await generateIdPhoto(originalImage, BackgroundType.WHITE);
      setStatusMessage("Ajustando proporção 3x4 (Branco)...");
      const whiteCropped = await cropTo3x4(whiteRaw);
      setWhiteBgUrl(whiteCropped);

      // 2. Generate Blue BG
      setStatusMessage("Gerando versão com fundo azul com IA...");
      const blueRaw = await generateIdPhoto(originalImage, BackgroundType.BLUE);
      setStatusMessage("Ajustando proporção 3x4 (Azul)...");
      const blueCropped = await cropTo3x4(blueRaw);
      setBlueBgUrl(blueCropped);

      setStatusMessage("Concluído!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao processar imagem com IA. Verifique sua chave API ou tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const reset = () => {
    setOriginalImage(null);
    setWhiteBgUrl(null);
    setBlueBgUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Printable Area - Hidden normally, visible on print */}
      <PrintTemplate whiteBgUrl={whiteBgUrl} blueBgUrl={blueBgUrl} />

      {/* Screen Only UI */}
      <div className="no-print max-w-5xl mx-auto p-4 md:p-8">
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
             <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg">
                <Scissors size={32} />
             </div>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Foto 3x4 IA</h1>
          <p className="text-slate-500 mt-2">Gere fotos para documentos com fundo branco e azul automaticamente</p>
        </header>

        <main className="space-y-8">
          
          {/* Upload Section */}
          {!originalImage && (
            <div 
              className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-sm hover:shadow-md hover:border-blue-400 group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
              />
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-700">Clique para enviar uma foto</h3>
              <p className="text-slate-400 mt-2">Recomendado: Foto frontal, boa iluminação, fundo neutro.</p>
            </div>
          )}

          {/* Processing Section */}
          {originalImage && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
              <div className="p-6 md:p-8">
                
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <ImageIcon className="text-slate-400"/>
                      Preview
                    </h2>
                    <div className="flex gap-3">
                         <button 
                            onClick={reset}
                            className="px-4 py-2 text-slate-500 hover:text-red-500 font-medium text-sm transition-colors"
                            disabled={isProcessing}
                          >
                            Nova Foto
                          </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Original */}
                  <div className="flex flex-col items-center">
                    <span className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">Original</span>
                    <div className="relative w-48 h-64 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
                      <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* White Result */}
                  <div className="flex flex-col items-center">
                    <span className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">Fundo Branco</span>
                    <div className="relative w-[30mm] h-[40mm] bg-slate-100 rounded-sm overflow-hidden border border-slate-200 shadow-md ring-4 ring-slate-50">
                      {whiteBgUrl ? (
                        <img src={whiteBgUrl} alt="White BG" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-white">
                          {isProcessing ? <RefreshCw className="animate-spin" /> : <div className="w-full h-full bg-slate-100"></div>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Blue Result */}
                  <div className="flex flex-col items-center">
                    <span className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">Fundo Azul</span>
                    <div className="relative w-[30mm] h-[40mm] bg-slate-100 rounded-sm overflow-hidden border border-slate-200 shadow-md ring-4 ring-slate-50">
                       {blueBgUrl ? (
                        <img src={blueBgUrl} alt="Blue BG" className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-300 bg-blue-50">
                          {isProcessing ? <RefreshCw className="animate-spin text-blue-400" /> : <div className="w-full h-full bg-blue-100/50"></div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center justify-center">
                  
                  {error && (
                    <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 max-w-lg w-full">
                      <AlertCircle size={20} />
                      <p>{error}</p>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="flex flex-col items-center gap-3 animate-pulse">
                      <div className="w-full max-w-xs bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-2/3 animate-[progress_1s_ease-in-out_infinite]"></div>
                      </div>
                      <p className="text-slate-500 font-medium text-sm">{statusMessage}</p>
                    </div>
                  )}

                  {!isProcessing && !whiteBgUrl && !blueBgUrl && (
                    <button 
                      onClick={processImages}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-1 flex items-center gap-3"
                    >
                      <RefreshCw size={24} />
                      Processar Imagens
                    </button>
                  )}

                  {!isProcessing && whiteBgUrl && blueBgUrl && (
                     <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="flex flex-col items-center bg-green-50 text-green-700 px-6 py-3 rounded-lg border border-green-100 mb-2 md:mb-0">
                           <CheckCircle size={24} className="mb-1" />
                           <span className="font-semibold">Pronto para impressão</span>
                           <span className="text-xs opacity-75">Folha A4 contendo 4 de cada</span>
                        </div>
                        <button 
                          onClick={handlePrint}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-lg px-8 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                        >
                          <Printer size={24} />
                          Imprimir Folha A4
                        </button>
                     </div>
                  )}

                </div>
              </div>
            </div>
          )}

        </main>

        <footer className="mt-20 text-center text-slate-400 text-sm">
          <p>Powered by Google Gemini 2.5 Flash</p>
        </footer>
      </div>
    </div>
  );
};

export default App;