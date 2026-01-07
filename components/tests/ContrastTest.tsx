import React, { useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, ChevronUp, RotateCcw, Zap, LayoutTemplate, Palette, Type, AlignLeft } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';

type Pattern = 'steps' | 'colors' | 'gradient' | 'text';

const ContrastTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // State
  const [pattern, setPattern] = useState<Pattern>('steps');
  const [isPulsing, setIsPulsing] = useState(false);
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
    setPattern('steps');
    setIsPulsing(false);
  };

  // Pulse Logic (Inverted for White background: Pulse darker)
  // We pulse opacity of an overlay or switch colors slightly?
  // Let's pulse the opacity of the "block" slightly.
  // Actually, for Contrast (White), we want to see if 254 is distinct from 255.
  // Pulsing: 254 -> 250 -> 254.
  const pulseClass = isPulsing ? 'animate-contrast-pulse' : '';

  if (isActive) {
    const squares = Array.from({ length: 22 }, (_, i) => 234 + i); // 234 to 255

    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center text-black font-sans select-none transition-colors duration-300">
         
         <style>{`
            @keyframes contrastPulse {
              0%, 100% { filter: brightness(1); }
              50% { filter: brightness(0.98); } /* Dip slightly darker */
            }
            .animate-contrast-pulse {
              animation: contrastPulse 1.5s ease-in-out infinite;
            }
         `}</style>

         {/* Top-Left Exit */}
         <button 
          onClick={stopTest}
          className="absolute top-6 left-6 z-[60] flex items-center gap-2 bg-neutral-100 text-black border border-neutral-300 px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-200 transition-colors font-medium text-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Exit
        </button>

         {/* --- MAIN TEST AREA --- */}
         <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-12 overflow-hidden">
            
            {/* 1. CLASSIC STEPS */}
            {pattern === 'steps' && (
               <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-8 w-full max-w-5xl">
                  {squares.map(val => (
                     <div key={val} className="flex flex-col items-center gap-2 group">
                        <div 
                           className={`w-full aspect-square border border-neutral-200 relative ${val !== 255 ? pulseClass : ''}`}
                           style={{ backgroundColor: `rgb(${val},${val},${val})` }}
                        >
                           {val === 255 && (
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <span className="text-[10px] text-neutral-400 font-bold">Pure White</span>
                             </div>
                           )}
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${val >= 253 ? 'text-red-500' : 'text-neutral-400'}`}>
                           {val}
                        </span>
                     </div>
                  ))}
               </div>
            )}

            {/* 2. COLOR CLIPPING (Bleaching) */}
            {pattern === 'colors' && (
               <div className="flex flex-col gap-6 w-full max-w-4xl">
                  <h3 className="text-center text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">
                     Check for Color Bleaching (Pastels turning White)
                  </h3>
                  {['red', 'green', 'blue', 'magenta', 'cyan', 'yellow'].map(color => (
                     <div key={color} className="flex items-center gap-4">
                        <span className="w-16 text-right text-xs font-bold uppercase text-neutral-400">{color}</span>
                        <div className="flex-1 flex h-12 border border-neutral-100">
                           {/* Render blocks getting closer to white */}
                           {/* e.g. Red: (255, 230, 230) -> (255, 255, 255) */}
                           {Array.from({length: 20}).map((_, i) => {
                              // range 0 to 19.
                              // val goes from 235 to 254
                              const val = 235 + i;
                              let bg = '';
                              // This logic creates high-key tints
                              if (color === 'red') bg = `rgb(255, ${val}, ${val})`;
                              if (color === 'green') bg = `rgb(${val}, 255, ${val})`;
                              if (color === 'blue') bg = `rgb(${val}, ${val}, 255)`;
                              if (color === 'magenta') bg = `rgb(255, ${val}, 255)`;
                              if (color === 'cyan') bg = `rgb(${val}, 255, 255)`;
                              if (color === 'yellow') bg = `rgb(255, 255, ${val})`;

                              return (
                                 <div 
                                    key={i} 
                                    className={`flex-1 relative ${pulseClass}`} 
                                    style={{ backgroundColor: bg }}
                                    title={`Level ${val}`}
                                 />
                              );
                           })}
                           {/* Final White Block */}
                           <div className="w-12 bg-white relative">
                              <span className="absolute inset-0 flex items-center justify-center text-[9px] text-neutral-300">White</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* 3. GRADIENT RAMP */}
            {pattern === 'gradient' && (
               <div className="w-full max-w-5xl flex flex-col items-center gap-12">
                   <div className="w-full relative">
                      <div className="h-48 w-full border border-neutral-200" style={{ background: 'linear-gradient(to right, #d0d0d0, #ffffff)' }} />
                      
                      {/* Markers */}
                      <div className="absolute top-full left-0 w-full h-8">
                         <div className="absolute left-0 text-[10px] -translate-x-1/2 mt-2">Gray 208</div>
                         <div className="absolute left-1/2 text-[10px] -translate-x-1/2 mt-2">Gray 232</div>
                         <div className="absolute right-0 text-[10px] translate-x-1/2 mt-2 text-red-500 font-bold">White 255</div>
                      </div>

                      {/* Moving Indicator if Pulsing */}
                      {isPulsing && (
                         <div className="absolute top-0 bottom-0 w-1 bg-red-500/20 animate-scan-fast pointer-events-none"></div>
                      )}
                   </div>
                   
                   <p className="text-sm text-neutral-500 max-w-lg text-center leading-relaxed">
                     The gradient should fade <strong>smoothly</strong> into pure white at the very right edge. 
                     If you see a hard vertical line ("clipping") before the edge, your Contrast is too high.
                   </p>
                   
                   {/* CSS for scan line */}
                   <style>{`
                     @keyframes scanFast {
                       0% { left: 0%; }
                       100% { left: 100%; }
                     }
                     .animate-scan-fast {
                       animation: scanFast 2s linear infinite;
                     }
                   `}</style>
               </div>
            )}

            {/* 4. TEXT LEGIBILITY */}
            {pattern === 'text' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl w-full">
                  <div className="space-y-4">
                     <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Standard Text</h3>
                     <div className="space-y-2">
                        <p className="text-4xl font-bold text-[#e0e0e0]">Gray 224</p>
                        <p className="text-4xl font-bold text-[#ececec]">Gray 236</p>
                        <p className="text-4xl font-bold text-[#f4f4f4]">Gray 244</p>
                        <p className="text-4xl font-bold text-[#f9f9f9]">Gray 249</p>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Thin UI Lines</h3>
                     <div className="space-y-8 pt-4">
                        <div className="w-full h-px bg-[#e0e0e0] relative"><span className="absolute -top-3 right-0 text-[9px] text-neutral-400">224</span></div>
                        <div className="w-full h-px bg-[#ececec] relative"><span className="absolute -top-3 right-0 text-[9px] text-neutral-400">236</span></div>
                        <div className="w-full h-px bg-[#f4f4f4] relative"><span className="absolute -top-3 right-0 text-[9px] text-neutral-400">244</span></div>
                        <div className="w-full h-px bg-[#f9f9f9] relative"><span className="absolute -top-3 right-0 text-[9px] text-neutral-400">249</span></div>
                     </div>
                  </div>
               </div>
            )}

         </div>

         {/* Right Sidebar */}
        <div 
          className={`absolute top-6 right-6 bottom-6 z-[60] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-auto'}`}
        >
           {!isSidebarOpen && (
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="bg-neutral-100 text-black p-3 rounded-full shadow-lg border border-neutral-200 hover:bg-neutral-200 transition-colors"
             >
               <ChevronLeft size={24} />
             </button>
           )}

           {isSidebarOpen && (
             <div className="flex-1 bg-white/90 backdrop-blur-xl text-neutral-900 rounded-xl shadow-2xl border border-neutral-200 overflow-y-auto flex flex-col animate-in slide-in-from-right-10 duration-200">
                <div className="p-5 border-b border-neutral-200 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur z-20">
                   <h3 className="font-bold text-sm tracking-wider text-neutral-800">WHITE POINT</h3>
                   <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-800">
                     <ChevronUp size={20} className="rotate-90" />
                   </button>
                </div>

                <div className="p-5 space-y-8 flex-1">
                   
                   {/* 1. Pattern Select */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Test Pattern</label>
                      <div className="grid grid-cols-1 gap-2">
                         <button 
                           onClick={() => setPattern('steps')}
                           className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${pattern === 'steps' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-neutral-200 hover:bg-neutral-50'}`}
                         >
                           <LayoutTemplate size={18} />
                           <div>
                              <div className="text-xs font-bold">Standard Steps</div>
                              <div className="text-[10px] opacity-70">Blocks from 234-255</div>
                           </div>
                         </button>
                         <button 
                           onClick={() => setPattern('gradient')}
                           className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${pattern === 'gradient' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-neutral-200 hover:bg-neutral-50'}`}
                         >
                           <AlignLeft size={18} />
                           <div>
                              <div className="text-xs font-bold">Gradient Ramp</div>
                              <div className="text-[10px] opacity-70">Check for smooth falloff</div>
                           </div>
                         </button>
                         <button 
                           onClick={() => setPattern('colors')}
                           className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${pattern === 'colors' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-neutral-200 hover:bg-neutral-50'}`}
                         >
                           <Palette size={18} />
                           <div>
                              <div className="text-xs font-bold">Color Clipping</div>
                              <div className="text-[10px] opacity-70">Pastels vs Pure White</div>
                           </div>
                         </button>
                         <button 
                           onClick={() => setPattern('text')}
                           className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${pattern === 'text' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-neutral-200 hover:bg-neutral-50'}`}
                         >
                           <Type size={18} />
                           <div>
                              <div className="text-xs font-bold">Text Legibility</div>
                              <div className="text-[10px] opacity-70">Light gray text on white</div>
                           </div>
                         </button>
                      </div>
                   </div>

                   {/* 2. Tools */}
                   <div className="space-y-3 pt-4 border-t border-neutral-100">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Helpers</label>
                      <button 
                         onClick={() => setIsPulsing(!isPulsing)}
                         className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${isPulsing ? 'bg-purple-50 border-purple-300 text-purple-800' : 'bg-white border-neutral-200 hover:bg-neutral-50'}`}
                      >
                         <div className="flex items-center gap-2">
                            <Zap size={16} className={isPulsing ? 'fill-purple-500 text-purple-600' : 'text-neutral-400'} />
                            <span className="text-sm font-medium">Pulse / Flash</span>
                         </div>
                         <span className="text-[10px] font-mono opacity-70">{isPulsing ? 'ON' : 'OFF'}</span>
                      </button>
                      <p className="text-[10px] text-neutral-500 leading-tight">
                         If you can't see the boxes, turn on Pulse. If you still can't see them flashing, your Contrast is definitely too high (Clipping).
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
    <>
      <SEO 
        title="Contrast Calibration Test - White Level Clipping" 
        description="Calibrate your monitor's contrast (white level). Ensure bright whites don't clip detail. Check for color bleaching in pastels."
        canonical="/tests/contrast"
        keywords={['contrast test', 'white level test', 'monitor calibration', 'white clipping test', 'color bleaching test']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contrast Test', path: '/tests/contrast' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Monitor White Level (Contrast) Tester",
              "url": "https://deadpixeltest.cc/tests/contrast",
              "description": "Test and calibrate monitor contrast to prevent white saturation (clipping). Ensures bright details like clouds remain visible.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [{
                "@type": "Question",
                "name": "What does the Contrast setting do?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Contrast setting controls the 'White Level', or how bright the white parts of the screen are. Setting it too high causes bright details to merge into pure white (Clipping)."
                }
              }, {
                "@type": "Question",
                "name": "How to fix White Clipping?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Lower the Contrast setting until you can distinguish the difference between pure white (255) and the almost-white steps (253, 254)."
                }
              }]
            },
            {
              "@type": "HowTo",
              "name": "How to Calibrate White Levels",
              "step": [
                { "@type": "HowToStep", "text": "Start the Contrast Test to view the numbered white level squares (234-255)." },
                { "@type": "HowToStep", "text": "Initially, raise your monitor's Contrast setting until the brightest squares (253-254) merge into the pure white background (Clipping)." },
                { "@type": "HowToStep", "text": "Slowly lower the Contrast until you can just barely see the difference between square 254 and the white background (255)." },
                { "@type": "HowToStep", "text": "If square 254 is invisible, you are losing highlight detail in photos and games." }
              ]
            }
          ]
        }}
      />
      <TestIntro
        title="Contrast Calibration"
        description="Calibrate your monitor's white saturation (Contrast). If set too high, bright details like clouds or snow will lose texture and become pure white blobs."
        onStart={startTest}
      >
        <InfoCard title="The '254' Rule">
          <p>
            You should be able to distinguish level <strong>254</strong> (faint gray) from level <strong>255</strong> (pure white). If they look identical, lower your Contrast setting.
          </p>
        </InfoCard>
        <InfoCard title="Color Bleaching">
          <p>
            Use the <strong>Color Clipping</strong> pattern. High contrast often forces very light colors (like light pink or mint green) to turn completely white. Ensure the last few blocks retain their tint.
          </p>
        </InfoCard>
      </TestIntro>
    </>
  );
};

export default ContrastTest;