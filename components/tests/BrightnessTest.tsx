import React, { useState, useEffect } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, ChevronUp, RotateCcw, Zap, Eye, LayoutTemplate, MonitorPlay, Ghost } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';

type Pattern = 'steps' | 'pluge' | 'logo';

const BrightnessTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // State
  const [pattern, setPattern] = useState<Pattern>('steps');
  const [isPulsing, setIsPulsing] = useState(false);
  const [showAmbient, setShowAmbient] = useState(false);
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
    setShowAmbient(false);
  };

  // Pulse Effect Style
  // We use CSS animation for smoother performance
  const pulseStyle = isPulsing ? { animation: 'pulse-opacity 2s ease-in-out infinite' } : {};

  if (isActive) {
    // Generate squares from RGB 1 to 24 (covering PC 0-255 and Video 16-235 start)
    const squares = Array.from({ length: 24 }, (_, i) => i + 1);

    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-500 ${showAmbient ? 'p-12 md:p-24 bg-neutral-800' : ''}`}>
        
        {/* CSS for Pulse */}
        <style>{`
          @keyframes pulse-opacity {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>

        {/* Top-Left Exit */}
        <button 
          onClick={stopTest}
          className="absolute top-6 left-6 z-[60] flex items-center gap-2 bg-neutral-900/90 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg hover:bg-neutral-800 transition-colors border border-neutral-700 font-medium text-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Exit
        </button>

        {/* --- MAIN TEST AREA --- */}
        <div className={`relative w-full h-full bg-black flex items-center justify-center shadow-2xl overflow-hidden ${showAmbient ? 'border border-white/10' : ''}`}>
            
            {/* 1. STEPS PATTERN (Standard) */}
            {pattern === 'steps' && (
              <div className="w-full max-w-5xl p-4">
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                      {squares.map(val => (
                          <div key={val} className="flex flex-col items-center gap-2 group">
                              <div 
                                  className="w-full aspect-square border border-neutral-800 relative"
                                  style={{ 
                                      backgroundColor: `rgb(${val},${val},${val})`,
                                      ...pulseStyle
                                  }}
                              >
                                  {/* Video Marker (16) */}
                                  {val === 16 && (
                                    <div className="absolute inset-0 border-2 border-blue-500/30 flex items-center justify-center">
                                       <span className="text-[10px] text-blue-500 font-bold bg-black/50 px-1">REF 16</span>
                                    </div>
                                  )}
                              </div>
                              <span className={`text-[10px] font-mono ${val === 16 ? 'text-blue-500 font-bold' : 'text-neutral-700 group-hover:text-neutral-500'}`}>
                                  {val}
                              </span>
                          </div>
                      ))}
                  </div>
                  <div className="mt-8 text-center text-neutral-500 text-xs font-mono">
                      RGB 0 (Background) vs RGB 1-24
                  </div>
              </div>
            )}

            {/* 2. PLUGE PATTERN (Simulated) */}
            {pattern === 'pluge' && (
               <div className="flex items-end h-3/4 gap-0.5 md:gap-1">
                   {/* Blacker than black isn't possible on standard RGB 0-255 without shifting system gamma */}
                   {/* So we simulate: Background = RGB 0. Bars = RGB 4, 8, 12, 16, 20 */}
                   
                   {[4, 8, 12, 16, 20, 24].map((val) => (
                       <div key={val} className="flex flex-col items-center gap-2">
                           <div 
                              className="w-16 md:w-24 bg-white transition-opacity"
                              style={{ 
                                  height: `${val * 15}px`, // visual height scaling
                                  backgroundColor: `rgb(${val},${val},${val})`,
                                  ...pulseStyle
                              }}
                           />
                           <span className={`text-[10px] font-mono ${val === 16 ? 'text-blue-500 font-bold' : 'text-neutral-800'}`}>{val}</span>
                       </div>
                   ))}
               </div>
            )}

            {/* 3. HIDDEN LOGO (Shadow Detail) */}
            {pattern === 'logo' && (
                <div className="relative flex flex-col items-center justify-center">
                    {/* The Ghost Logic: RGB 3 on RGB 0 */}
                    <Ghost 
                        size={300} 
                        className="text-[#030303]" // RGB(3,3,3)
                        style={pulseStyle}
                    />
                    <p className="mt-8 text-[#050505] font-bold text-xl tracking-[0.5em] uppercase" style={pulseStyle}>
                        Shadow Detail
                    </p>
                    
                    {/* Reference Point for Level 16 (much brighter) */}
                    <div className="absolute bottom-[-100px] flex flex-col items-center gap-2">
                        <div className="w-8 h-8 bg-[#101010]"></div> {/* RGB 16 */}
                        <span className="text-neutral-800 text-[10px]">Reference Black (16)</span>
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
               className="bg-white text-black p-3 rounded-full shadow-xl hover:bg-neutral-100 transition-colors"
             >
               <ChevronLeft size={24} />
             </button>
           )}

           {isSidebarOpen && (
             <div className="flex-1 bg-white/95 backdrop-blur-xl text-neutral-900 rounded-xl shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right-10 duration-200 border border-white/20">
                <div className="p-5 border-b border-neutral-200/50 flex justify-between items-center sticky top-0 bg-white/50 backdrop-blur z-20">
                   <h3 className="font-bold text-sm tracking-wider text-neutral-800">BLACK LEVEL</h3>
                   <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-800">
                     <ChevronUp size={20} className="rotate-90" />
                   </button>
                </div>

                <div className="p-5 space-y-8 flex-1">
                   
                   {/* 1. Patterns */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Test Pattern</label>
                      <div className="grid grid-cols-1 gap-2">
                         <button 
                           onClick={() => setPattern('steps')}
                           className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${pattern === 'steps' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-neutral-50'}`}
                         >
                           <LayoutTemplate size={18} />
                           <div>
                              <div className="text-xs font-bold">Standard Steps (0-24)</div>
                              <div className="text-[10px] opacity-70">Best for general calibration.</div>
                           </div>
                         </button>
                         <button 
                           onClick={() => setPattern('pluge')}
                           className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${pattern === 'pluge' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-neutral-50'}`}
                         >
                           <MonitorPlay size={18} />
                           <div>
                              <div className="text-xs font-bold">PLUGE Bars</div>
                              <div className="text-[10px] opacity-70">Video editing reference style.</div>
                           </div>
                         </button>
                         <button 
                           onClick={() => setPattern('logo')}
                           className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${pattern === 'logo' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-neutral-50'}`}
                         >
                           <Ghost size={18} />
                           <div>
                              <div className="text-xs font-bold">Shadow Graphic</div>
                              <div className="text-[10px] opacity-70">Can you see the hidden shape?</div>
                           </div>
                         </button>
                      </div>
                   </div>

                   {/* 2. Tools */}
                   <div className="space-y-3 pt-4 border-t border-neutral-100">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Visibility Helpers</label>
                      
                      {/* Pulse Toggle */}
                      <button 
                         onClick={() => setIsPulsing(!isPulsing)}
                         className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${isPulsing ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : 'hover:bg-neutral-50'}`}
                      >
                         <div className="flex items-center gap-2">
                            <Zap size={16} className={isPulsing ? 'fill-yellow-500 text-yellow-600' : 'text-neutral-400'} />
                            <span className="text-sm font-medium">Flash / Pulse</span>
                         </div>
                         <span className="text-[10px] font-mono opacity-70">{isPulsing ? 'ON' : 'OFF'}</span>
                      </button>
                      <p className="text-[10px] text-neutral-500 leading-tight">
                         Makes dark pixels pulse on and off. If you can't see them flashing, your monitor is crushing blacks (Brightness is too low).
                      </p>

                      {/* Ambient Toggle */}
                      <button 
                         onClick={() => setShowAmbient(!showAmbient)}
                         className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${showAmbient ? 'bg-neutral-800 text-white border-neutral-700' : 'hover:bg-neutral-50'}`}
                      >
                         <div className="flex items-center gap-2">
                            <Eye size={16} />
                            <span className="text-sm font-medium">Ambient Border</span>
                         </div>
                         <span className="text-[10px] font-mono opacity-70">{showAmbient ? 'ON' : 'OFF'}</span>
                      </button>
                      <p className="text-[10px] text-neutral-500 leading-tight">
                         Adds a gray border to simulate mixed content. Pure black screens can be misleading if your eyes adapt too much to the dark.
                      </p>
                   </div>
                   
                   {/* 3. Reference Legend */}
                   <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 space-y-2">
                      <div className="flex items-center gap-2 text-[10px]">
                         <span className="w-3 h-3 bg-[#101010] border border-neutral-300 block"></span>
                         <span className="font-bold text-neutral-700">Level 16 (Video Black)</span>
                      </div>
                      <p className="text-[10px] text-neutral-500">
                         For Movies/TV: Level 16 should be the first visible shade. 
                         For PC/Gaming: You should aim to see Level 1 or 2.
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
        title="Monitor Brightness Calibration - Black Level Test" 
        description="Calibrate your monitor's brightness (black level) setting. Ensure deep blacks without crushing shadow detail using our PLUGE pattern."
        canonical="/tests/brightness"
        keywords={['brightness test', 'black level test', 'monitor calibration', 'pluge pattern', 'shadow detail test', 'screen brightness']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Brightness Test', path: '/tests/brightness' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Monitor Black Level (Brightness) Tester",
              "url": "https://deadpixeltest.cc/tests/brightness",
              "description": "Adjust monitor brightness to ensure deep blacks without losing shadow detail (Black Crush). Features PLUGE patterns and pulsing shadow checks.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [{
                "@type": "Question",
                "name": "What is the correct Brightness setting?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The correct brightness setting is where 'Black' (RGB 0) appears as dark as the monitor allows, but the very next shade (RGB 1, 2, or 3) is just barely visible."
                }
              }, {
                "@type": "Question",
                "name": "What is Black Crush?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Black crush occurs when the brightness is set too low, causing dark gray details to merge into pure black, resulting in a loss of detail in dark scenes."
                }
              }]
            },
            {
              "@type": "HowTo",
              "name": "How to Calibrate Black Levels",
              "step": [
                { "@type": "HowToStep", "text": "Start the Brightness Test to view the numbered black level squares (1-20)." },
                { "@type": "HowToStep", "text": "Initially, increase your monitor's Brightness setting until you can clearly see all the dark gray squares against the black background." },
                { "@type": "HowToStep", "text": "Slowly decrease Brightness until square 16 fades into the black background, but square 17 and above remain faintly visible." },
                { "@type": "HowToStep", "text": "If square 16 is still visible, your blacks will look gray. If square 20 disappears, you are crushing shadow detail." }
              ]
            }
          ]
        }}
      />
      <TestIntro
        title="Brightness Calibration"
        description="Calibrate your monitor's black levels using the 'Brightness' setting. Proper calibration ensures you see shadow details without making blacks look gray."
        onStart={startTest}
      >
        <InfoCard title="The 'Pulse' Trick">
          <p>
            Can't tell if a square is visible? Enable the <strong>Flash / Pulse</strong> tool. Our eyes are much better at detecting motion. If you don't see the flashing, your black level is crushed.
          </p>
        </InfoCard>
        <InfoCard title="PC vs. Video">
          <p>
            <strong>PC Users:</strong> Aim to see the faintest squares (1-5).
            <br/>
            <strong>Movie Watchers:</strong> It is acceptable if squares below 16 are invisible, as standard video content sets pure black at Level 16.
          </p>
        </InfoCard>
      </TestIntro>
    </>
  );
};

export default BrightnessTest;