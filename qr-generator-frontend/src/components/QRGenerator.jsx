import React, { useState, useEffect, useCallback } from 'react';
import Icon from './Icon.jsx';
import { getContrastRatio } from '../utils/colors.js';


const useDebounce = (value, delay) => {
const [debouncedValue, setDebouncedValue] = useState(value);
useEffect(() => {
const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
return () => clearTimeout(handler);
}, [value, delay]);
return debouncedValue;
};

const ControlLabel = ({ children, className = '' }) => (
<label className={`block text-sm font-medium text-slate-400 mb-2 ${className}`}>{children}</label>
);

export default function QRGenerator() {
const [text, setText] = useState('');
const [fillColor, setFillColor] = useState('#000000');
const [backColor, setBackColor] = useState('#FFFFFF');
const [size, setSize] = useState(12);
const [margin, setMargin] = useState(2);
const [frameContrast, setFrameContrast] = useState(50);
const [logoFile, setLogoFile] = useState(null);
const [logoPreview, setLogoPreview] = useState('');
const [qrImageUrl, setQrImageUrl] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [copySuccess, setCopySuccess] = useState(false);
const [contrast, setContrast] = useState({ ratio: '0', level: 'Poor' });

const debouncedText = useDebounce(text, 500);
const debouncedFillColor = useDebounce(fillColor, 200);
const debouncedBackColor = useDebounce(backColor, 200);
const debouncedSize = useDebounce(size, 200);
const debouncedMargin = useDebounce(margin, 200);
const debouncedLogoFile = useDebounce(logoFile, 200);

const isQrGenerated = Boolean(qrImageUrl);

// Función para mapear el valor del slider a las clases de Tailwind
const getFrameBackgroundClass = (value) => {
 const slateClasses = [
   'bg-slate-100', 'bg-slate-200', 'bg-slate-300', 'bg-slate-400', 'bg-slate-500',
   'bg-slate-600', 'bg-slate-700', 'bg-slate-800', 'bg-slate-900', 'bg-slate-950'
 ];
 const index = Math.floor((value / 100) * (slateClasses.length - 1));
 return slateClasses[index];
};

// contraste
useEffect(() => {
   const contrastResult = getContrastRatio(fillColor, backColor);
   setContrast(contrastResult);
}, [fillColor, backColor]);

const contrastStyles = {
   Poor: 'text-red-400',
   Good: 'text-yellow-400',
   Excellent: 'text-green-400',
};

const generateQr = useCallback(async () => {
   if (!debouncedText || !/^(https?:\/\/|www\.|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(debouncedText)) {
       setQrImageUrl('');
       return;
   }
   setIsLoading(true);

   const formData = new FormData();
   formData.append('text', debouncedText);
   const queryParams = new URLSearchParams({
       size: debouncedSize,
       fill_color: debouncedFillColor.substring(1),
       back_color: debouncedBackColor.substring(1),
   });

   if (debouncedLogoFile) {
       formData.append('logo', debouncedLogoFile);
   }

   try {
       const response = await fetch(`/api/generate-custom-qr?${queryParams.toString()}`, {
           method: 'POST',
           body: formData,
       });
       
       if (!response.ok) throw new Error('API Error');
       const imageBlob = await response.blob();
       if (qrImageUrl) URL.revokeObjectURL(qrImageUrl);
       setQrImageUrl(URL.createObjectURL(imageBlob));
   } catch (error) {
       console.error(error);
       setQrImageUrl('');
   } finally {
       setIsLoading(false);
   }
}, [debouncedText, debouncedFillColor, debouncedBackColor, debouncedSize, debouncedMargin, debouncedLogoFile]);

useEffect(() => { generateQr(); }, [generateQr]);

const handleLogoChange = (e) => {
   const file = e.target.files[0];
   if (file && file.type.startsWith('image/')) {
       setLogoFile(file);
       if (logoPreview) URL.revokeObjectURL(logoPreview);
       setLogoPreview(URL.createObjectURL(file));
   }
};

const handleDownload = () => {
   if (!qrImageUrl) return;
   const link = document.createElement('a');
   link.href = qrImageUrl;
   link.download = 'qr-custom-code.png';
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
};

const handleCopy = async () => {
   if (!qrImageUrl || copySuccess) return;
   try {
       const response = await fetch(qrImageUrl);
       const blob = await response.blob();
       await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
       setCopySuccess(true);
       setTimeout(() => setCopySuccess(false), 2000);
   } catch (error) {
       console.error('Error al copiar la imagen:', error);
   }
};

return (
   <section className="w-full grid lg:grid-cols-3 gap-12 items-center">

       <div className="flex flex-col space-y-8 animate-fade-in-up">
           <div>
               <ControlLabel>URL de Destino</ControlLabel>
               <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full text-lg px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300" placeholder="https://tu-sitio-web.com" />
           </div>
           <div className="pt-8 border-t border-slate-700/50 space-y-3">
               <ControlLabel className="text-center">Acciones</ControlLabel>
               <div className="grid grid-cols-2 gap-3">
                   <button onClick={handleDownload} className="px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed" disabled={!isQrGenerated}>
                       <Icon name="download" className="w-5 h-5" />
                       <span>Descargar</span>
                   </button>
                   <button onClick={handleCopy} className="relative px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed" disabled={!isQrGenerated}>
                       <span className={`transition-opacity duration-300 ${copySuccess ? 'opacity-0' : 'opacity-100'}`}><Icon name="copy" className="w-5 h-5" /></span>
                       <span className={`absolute transition-opacity duration-300 ${copySuccess ? 'opacity-100' : 'opacity-0'}`}><svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></span>
                       <span className="ml-2">{copySuccess ? '¡Copiado!' : 'Copiar'}</span>
                   </button>
               </div>
           </div>
       </div>
       {/* Columna Central */}
       <div className="w-full aspect-square flex flex-col items-center justify-center animate-fade-in-up" style={{ animationDelay: '150ms' }}>
       <div className={`w-5/6 h-5/6 2xl:w-full 2xl:h-full mx-auto ${getFrameBackgroundClass(frameContrast)} rounded-2xl flex items-center justify-center p-6 transition-all duration-300`}>
                    {isLoading 
                        ? (<div className="text-slate-400">Generando...</div>) 
                        : qrImageUrl 
                            ? (<img src={qrImageUrl} alt="Código QR generado" className="w-full h-full object-contain rounded-lg animate-pop-in" />) 
                            : (<div className="text-center text-slate-600"><Icon name="qr_placeholder" className="w-24 h-24" /></div>)
                    }
                </div>
           
           {/* Slider de contraste del marco debajo del QR */}
           <div className="w-full mt-4">
               <ControlLabel>Contraste del Marco: <span className="font-semibold text-amber-400">{frameContrast}%</span></ControlLabel>
               <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={frameContrast} 
                   onChange={(e) => setFrameContrast(parseInt(e.target.value))} 
                   className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" 
               />
               <div className="flex justify-between text-xs text-slate-500 mt-1">
                   <span>Claro</span>
                   <span>Oscuro</span>
               </div>
           </div>
       </div>
       {/* Columna Derecha */}
       <div className="flex flex-col space-y-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
           <div className="grid grid-cols-2 gap-6">
               <div>
                   <ControlLabel>Color Principal</ControlLabel>
                   <div className="relative w-full h-12 border border-slate-700 rounded-lg">
                       <div className="absolute top-1/2 left-3 -translate-y-1/2 w-6 h-6 rounded-full border border-slate-600" style={{ backgroundColor: fillColor }}></div>
                       <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-full h-full opacity-0 cursor-pointer" />
                       <span className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 pointer-events-none">{fillColor.toUpperCase()}</span>
                   </div>
               </div>
               <div>
                   <ControlLabel>Color de Fondo</ControlLabel>
                   <div className="relative w-full h-12 border border-slate-700 rounded-lg">
                       <div className="absolute top-1/2 left-3 -translate-y-1/2 w-6 h-6 rounded-full border border-slate-600" style={{ backgroundColor: backColor }}></div>
                       <input type="color" value={backColor} onChange={(e) => setBackColor(e.target.value)} className="w-full h-full opacity-0 cursor-pointer" />
                       <span className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 pointer-events-none">{backColor.toUpperCase()}</span>
                   </div>
               </div>
           </div>

           
           <div className="flex items-center justify-between text-sm p-3 bg-slate-800/50 rounded-lg">
               <span className="text-slate-400">Contraste de Lectura:</span>
               <span className={`font-bold ${contrastStyles[contrast.level]}`}>
                   {contrast.level} ({contrast.ratio}:1)
               </span>
           </div>


           <div>
               <ControlLabel>Tamaño: <span className="font-semibold text-amber-400">{size}</span></ControlLabel>
               <input type="range" min="5" max="20" value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
           </div>
           <div>
               <ControlLabel>Espaciado: <span className="font-semibold text-amber-400">{margin}</span></ControlLabel>
               <input type="range" min="1" max="10" value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
           </div>
           <div className="pt-6 border-t border-slate-700/50">
               <ControlLabel>Logo Central (Opcional)</ControlLabel>
               <div className="flex items-center space-x-4">
                   <div className="w-16 h-16 bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700">
                       {logoPreview ? (<img src={logoPreview} alt="Previsualización del logo" className="w-full h-full object-cover rounded-md" />) : (<Icon name="qr_placeholder" className="w-8 h-8 text-slate-600" />)}
                   </div>
                   <div className="flex-1">
                       <label htmlFor="logo-upload" className="w-full text-center cursor-pointer px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg transition-all duration-200 block">
                           {logoFile ? 'Cambiar Logo' : 'Subir Logo'}
                       </label>
                       <input id="logo-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} />
                       <p className="text-xs text-slate-500 mt-2">Recomendado: PNG o JPG cuadrado.</p>
                   </div>
               </div>
           </div>
       </div>
   </section>
);
}