import React, { useRef, useEffect, useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, ChevronUp, RotateCcw, Zap, Droplets, Languages, Sparkles } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';

type MatrixColor = 'green' | 'blue' | 'red' | 'white' | 'gold';
type Charset = 'katakana' | 'binary' | 'latin';

const KATAKANA = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const BINARY = '01';

const MatrixTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // State
  const [color, setColor] = useState<MatrixColor>('green');
  const [charset, setCharset] = useState<Charset>('katakana');
  const [speed, setSpeed] = useState(50); // ms delay (lower is faster)
  const [fontSize, setFontSize] = useState(16);
  const [bloom, setBloom] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const startTest = () => {
    setIsActive(true);
    enterFullscreen();
  };

  const stopTest = () => {
    setIsActive(false);
    exitFullscreen();
  };

  const resetSettings = () => {
    setColor('green');
    setCharset('katakana');
    setSpeed(50);
    setFontSize(16);
    setBloom(false);
  };

  // Canvas Logic
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array(columns).fill(1);
    };

    window.addEventListener('resize', resize);
    resize();

    const getChars = () => {
       switch(charset) {
         case 'binary': return BINARY;
         case 'katakana': return KATAKANA;
         default: return LATIN;
       }
    };

    const getThemeColor = () => {
      switch(color) {
        case 'blue': return '#00BFFF';
        case 'red': return '#FF0033';
        case 'white': return '#E0E0E0';
        case 'gold': return '#FFD700';
        default: return '#0F0';
      }
    };

    const draw = (timestamp: number) => {
      // Throttle speed
      if (timestamp - lastTime < speed) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      lastTime = timestamp;

      const chars = getChars();
      const themeHex = getThemeColor();

      // Trail effect: Fade out the previous frame slightly
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;
      
      // Optional Bloom (Shadow) - Performance intensive, handle with care
      if (bloom) {
         ctx.shadowBlur = 8;
         ctx.shadowColor = themeHex;
      } else {
         ctx.shadowBlur = 0;
      }

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        
        // 1. Paint over the previous "Head" (y-1) with the Theme Color
        // This ensures the trail is colored, not white.
        if (drops[i] > 1) {
            ctx.fillStyle = themeHex;
            ctx.fillText(text, i * fontSize, (drops[i] - 1) * fontSize);
        }

        // 2. Draw the new "Head" (y) in White (or very bright version of theme)
        // This creates the "leading droplet" effect
        ctx.fillStyle = color === 'white' ? '#FFFFFF' : '#FFFFFF'; 
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, color, charset, speed, fontSize, bloom]);

  if (isActive) {
    return (
      <div className="fixed inset-0 z-50 bg-black overflow-hidden select-none">
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* Top-Left Exit */}
        <button 
          onClick={stopTest}
          className="absolute top-6 left-6 z-[60] flex items-center gap-2 bg-neutral-900/80 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg hover:bg-neutral-800 transition-colors border border-neutral-700 font-medium text-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Exit Test
        </button>

        {/* Right Sidebar */}
        <div 
          className={`absolute top-6 right-6 bottom-6 z-[60] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-auto'}`}
        >
           {!isSidebarOpen && (
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="bg-white text-black p-3 rounded-full shadow-xl hover:bg-neutral-100 transition-colors"
             >
               <ChevronLeft size={24} />
             </button>
           )}

           {isSidebarOpen && (
             <div className="flex-1 bg-white/95 backdrop-blur-xl text-neutral-900 rounded-xl shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right-10 duration-200 border border-white/20">
                <div className="p-5 border-b border-neutral-200/50 flex justify-between items-center sticky top-0 bg-white/50 backdrop-blur z-20">
                   <h3 className="font-bold text-sm tracking-wider text-neutral-800">MATRIX CONTROL</h3>
                   <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-800">
                     <ChevronUp size={20} className="rotate-90" />
                   </button>
                </div>

                <div className="p-5 space-y-8 flex-1">
                   {/* Color Selection */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Theme Color</label>
                      <div className="grid grid-cols-5 gap-2">
                         {(['green', 'blue', 'red', 'gold', 'white'] as MatrixColor[]).map(c => (
                           <button
                             key={c}
                             onClick={() => setColor(c)}
                             className={`
                                aspect-square rounded-md border shadow-sm transition-transform hover:scale-105
                                ${color === c ? 'ring-2 ring-neutral-800 ring-offset-1 z-10' : 'border-transparent'}
                             `}
                             style={{ backgroundColor: c === 'gold' ? '#FFD700' : c === 'white' ? '#E0E0E0' : c }}
                             title={c}
                           />
                         ))}
                      </div>
                   </div>

                   {/* Charset */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                         <Languages size={14} /> Character Set
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                         <button onClick={() => setCharset('katakana')} className={`px-3 py-2 text-xs font-bold rounded border text-left flex justify-between ${charset === 'katakana' ? 'bg-neutral-800 text-white border-neutral-600' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`}>
                            <span>Classic (Katakana)</span>
                            <span className="opacity-50">カ</span>
                         </button>
                         <button onClick={() => setCharset('binary')} className={`px-3 py-2 text-xs font-bold rounded border text-left flex justify-between ${charset === 'binary' ? 'bg-neutral-800 text-white border-neutral-600' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`}>
                            <span>Binary</span>
                            <span className="opacity-50">01</span>
                         </button>
                         <button onClick={() => setCharset('latin')} className={`px-3 py-2 text-xs font-bold rounded border text-left flex justify-between ${charset === 'latin' ? 'bg-neutral-800 text-white border-neutral-600' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`}>
                            <span>Latin / Numeric</span>
                            <span className="opacity-50">A1</span>
                         </button>
                      </div>
                   </div>

                   {/* Speed */}
                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Rain Speed</label>
                        <Zap size={14} className="text-neutral-400" />
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        step="10"
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="w-full accent-neutral-800 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        style={{ direction: 'rtl' }} // Left = Fast (10ms), Right = Slow (100ms)
                      />
                      <div className="flex justify-between text-[10px] text-neutral-400">
                        <span>Fast</span>
                        <span>Slow</span>
                      </div>
                   </div>

                   {/* Density (Font Size) */}
                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Size / Density</label>
                        <Droplets size={14} className="text-neutral-400" />
                      </div>
                      <input 
                        type="range" 
                        min="12" 
                        max="32" 
                        step="2"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-neutral-800 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-400">
                        <span>Dense (Small)</span>
                        <span>Sparse (Large)</span>
                      </div>
                   </div>

                   {/* Bloom Toggle */}
                   <div className="space-y-3 pt-2 border-t border-neutral-100">
                      <button 
                         onClick={() => setBloom(!bloom)}
                         className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${bloom ? 'bg-green-50 border-green-300 text-green-800' : 'hover:bg-neutral-50'}`}
                      >
                         <div className="flex items-center gap-2">
                            <Sparkles size={16} className={bloom ? 'fill-green-500 text-green-600' : 'text-neutral-400'} />
                            <span className="text-sm font-medium">Glow / Bloom</span>
                         </div>
                         <span className="text-[10px] font-mono opacity-70">{bloom ? 'ON' : 'OFF'}</span>
                      </button>
                      <p className="text-[10px] text-neutral-500 leading-tight">
                         Adds a neon glow effect. May reduce performance on slower devices.
                      </p>
                   </div>
                </div>

                <div className="p-5 border-t border-neutral-100 bg-neutral-50">
                  <button 
                    onClick={resetSettings}
                    className="w-full py-3 bg-neutral-900 hover:bg-black text-white rounded-lg font-bold shadow-lg shadow-neutral-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </div>
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <TestIntro
      title="Matrix Rain Effect"
      description="A visual treat and a good test for OLED motion handling and black levels. Ensure the black background stays deep black while the green text pops."
      startButtonText="Enter The Matrix"
      onStart={startTest}
    >
       <InfoCard title="OLED Black Test">
        <p>
          On an OLED or Mini-LED display, the black background between the characters should be perfectly black (pixels off). 
          On standard IPS/TN panels, you might see a grayish glow (backlight bleed).
        </p>
      </InfoCard>
    </TestIntro>
  );
};

export default MatrixTest;