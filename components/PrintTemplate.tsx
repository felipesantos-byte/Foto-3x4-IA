import React from 'react';

interface PrintTemplateProps {
  whiteBgUrl: string | null;
  blueBgUrl: string | null;
}

export const PrintTemplate: React.FC<PrintTemplateProps> = ({ whiteBgUrl, blueBgUrl }) => {
  // 4 photos of each type
  const photos = [];
  
  if (blueBgUrl) {
    for (let i = 0; i < 4; i++) photos.push({ url: blueBgUrl, type: 'blue' });
  }
  
  if (whiteBgUrl) {
    for (let i = 0; i < 4; i++) photos.push({ url: whiteBgUrl, type: 'white' });
  }

  // If we don't have enough to fill a nice grid, or just to show placeholders?
  // The requirement is "4 photos of each".

  return (
    <div className="print-only">
      <div className="w-full h-full relative">
        <h1 className="text-xl font-bold mb-4 text-center">Fotos 3x4</h1>
        
        {/* 
          A4 is approx 210mm x 297mm. 
          3x4 photos are 30mm x 40mm.
          We can fit them easily in a grid.
          Tailwind uses rem/px, so we need inline styles for mm dimensions to be precise for print.
        */}
        <div 
          className="grid grid-cols-4 gap-4 justify-center items-start content-start" 
          style={{ width: '100%' }}
        >
          {photos.map((photo, idx) => (
            <div 
              key={idx} 
              className="relative border border-gray-200 overflow-hidden"
              style={{ width: '30mm', height: '40mm' }}
            >
              <img 
                src={photo.url} 
                alt="ID Photo" 
                className="w-full h-full object-cover"
              />
              {/* Optional: Cut marks */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-black opacity-20"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-black opacity-20"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-black opacity-20"></div>
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-0 w-full text-center text-xs text-gray-400">
            Gerado via Foto3x4 IA
        </div>
      </div>
    </div>
  );
};