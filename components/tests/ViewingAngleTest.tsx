import React, { useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, ChevronUp, RotateCcw, LayoutGrid, Type, Grip, Waves } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';

type Pattern = 'cards' | 'text' | 'gamma' | 'gradient';
type BgMode = 'gray' | 'black' | 'white';

const ViewingAngleTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // State
  const [pattern, setPattern] = useState<Pattern>('cards');
  const [bgShade, setBgShade] = useState<BgMode>('gray');
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
    setPattern('cards');
    setBgShade('gray');
  };

  // --- Render Helpers ---

  // 1. Color Cards (Enhanced)
  const CardGroup = ({ className }: { className?: string }) => (
    <div className={`flex flex-col gap-4 p-4 rounded-xl backdrop-blur-sm bg-black/10 ${className}`}>
       <div className="flex gap-2 justify-center">
          <div className="w-12 h-12 rounded-full bg-[#ff0000] shadow-sm ring-1 ring-white/10" title="Red"></div>
          <div className="w-12 h-12 rounded-full bg-[#00ff00] shadow-sm ring-1 ring-white/10" title="Green"></div>
          <div className="w-12 h-12 rounded-full bg-[#0000ff] shadow-sm ring-1 ring-white/10" title="Blue"></div>
       </div>
       <div className="flex gap-2 justify-center">
          <div className="w-12 h-12 rounded-full bg-[#00ffff] shadow-sm ring-1 ring-white/10" title="Cyan"></div>
          <div className="w-12 h-12 rounded-full bg-[#ff00ff] shadow-sm ring-1 ring-white/10" title="Magenta"></div>
          <div className="w-12 h-12 rounded-full bg-[#ffff00] shadow-sm ring-1 ring-white/10" title="Yellow"></div>
       </div>
       <div className="flex gap-2 justify-center">
          {/* Skin Tone & Pastel - Harder to maintain at angles */}
          <div className="w-12 h-12 rounded-full bg-[#ffcc99] shadow-sm ring-1 ring-white/10" title="Skin"></div>
          <div className="w-12 h-12 rounded-full bg-[#b19cd9] shadow-sm ring-1 ring-white/10" title="Pastel Purple"></div>
          <div className="w-12 h-12 rounded-full bg-[#ffffff] shadow-sm ring-1 ring-white/10" title="White"></div>
       </div>
    </div>
  );

  // 2. Text Blocks
  const TextGroup = ({ className }: { className?: string }) => (
    <div className={`flex flex-col gap-2 max-w-xs text-left p-4 ${className}`}>
       <h2 className="text-xl font-bold opacity-90">Legibility Check</h2>
       <p className="text-sm font-serif leading-relaxed opacity-80">
         The quick brown fox jumps over the lazy dog. 
         <br/>
         <span className="text-xs opacity-60">Sphinx of black quartz, judge my vow.</span>
       </p>
       <div className="h-2 w-full bg-current opacity-20 rounded mt-2"></div>
       <div className="h-2 w-2/3 bg-current opacity-20 rounded"></div>
       <div className="h-2 w-1/2 bg-current opacity-20 rounded"></div>
    </div>
  );

  // 3. Gamma Shift Tile
  const GammaTile = () => (
    <div className="relative w-full h-full border border-white/5 bg-black overflow-hidden group">
       {/* Reference Dither (50% luminance) */}
       <div className="absolute inset-0 z-0 opacity-100" style={{ 
          backgroundImage: 'repeating-linear-gradient(to right, #000 0, #000 1px, #fff 1px, #fff 2px)' 
       }} />
       
       {/* Target Solid (Gamma 2.2 approx 186) */}
       {/* Using a circle to make shape distortion visible too */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 h-3/5 bg-[rgb(186,186,186)] rounded-full shadow-sm z-10" />
       
       <div className="absolute bottom-2 left-2 text-[10px] text-black bg-white/80 px-1 font-mono z-20 opacity-0 group-hover:opacity-100 transition-opacity">
         GAMMA 2.2
       </div>
    </div>
  );


  if (isActive) {
    const bgClass = bgShade === 'white' ? 'bg-[#f0f0f0] text-black' : bgShade === 'black' ? 'bg-[#050505] text-white' : 'bg-[#808080] text-white';

    return (
      <div className={`fixed inset-0 z-50 ${bgClass} transition-colors duration-300 overflow-hidden`}>
         
         {/* --- PATTERN RENDERER --- */}
         
         {/* 1. CARDS & TEXT (5-Point Layout) */}
         {(pattern === 'cards' || pattern === 'text') && (
           <div className="w-full h-full relative">
             <div className="absolute top-8 left-8">{pattern === 'cards' ? <CardGroup /> : <TextGroup />}</div>
             <div className="absolute top-8 right-8">{pattern === 'cards' ? <CardGroup /> : <TextGroup className="text-right items-end" />}</div>
             <div className="absolute bottom-8 left-8">{pattern === 'cards' ? <CardGroup /> : <TextGroup />}</div>
             <div className="absolute bottom-8 right-8">{pattern === 'cards' ? <CardGroup /> : <TextGroup className="text-right items-end" />}</div>
             
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                {pattern === 'cards' ? <CardGroup /> : <TextGroup className="text-center items-center" />}
                <div className="mt-8 bg-black/50 backdrop-blur px-4 py-2 rounded text-white text-xs font-medium">
                   Compare Center vs Corners
                </div>
             </div>
           </div>
         )}

         {/* 2. GAMMA GRID (Full Grid) */}
         {pattern === 'gamma' && (
           <div className="w-full h-full grid grid-cols-4 grid-rows-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <GammaTile key={i} />
              ))}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-4 rounded-xl border border-white/20 text-center pointer-events-none">
                 <h3 className="font-bold text-lg mb-1">Gamma Shift Check</h3>
                 <p className="text-xs text-neutral-400 max-w-xs">
                   The solid circles should match the striped background brightness. 
                   If corners look darker/lighter than the center, your panel has gamma shift.
                 </p>
              </div>
           </div>
         )}

         {/* 3. GRADIENT (Spectrum) */}
         {pattern === 'gradient' && (
           <div className="w-full h-full flex flex-col">
              <div className="flex-1 bg-gradient-to-b from-black via-gray-500 to-white relative">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-black/50 text-white px-3 py-1 rounded text-sm backdrop-blur">Vertical Luma (Black to White)</span>
                 </div>
              </div>
              <div className="flex-1 bg-gradient-to-r from-[#ff0000] via-[#00ff00] to-[#0000ff] relative">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-black/50 text-white px-3 py-1 rounded text-sm backdrop-blur">Horizontal Chroma (RGB)</span>
                 </div>
              </div>
              <div className="flex-1 bg-gradient-to-r from-purple-900 via-pink-500 to-yellow-200 relative">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-black/50 text-white px-3 py-1 rounded text-sm backdrop-blur">Complex Saturation</span>
                 </div>
              </div>
           </div>
         )}

         {/* --- UI OVERLAY --- */}

         {/* Exit Button */}
         <button 
          onClick={stopTest}
          className="absolute top-6 left-6 z-[60] flex items-center gap-2 bg-neutral-900/90 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg hover:bg-neutral-800 transition-colors border border-neutral-700 font-medium text-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Exit
        </button>

        {/* Right Sidebar */}
        <div 
          className={`absolute top-6 right-6 bottom-6 z-[60] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-auto'}`}
        >
           {!isSidebarOpen && (
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="bg-white text-black p-3 rounded-full shadow-xl hover:bg-neutral-100 transition-colors opacity-50 hover:opacity-100"
             >
               <ChevronLeft size={24} />
             </button>
           )}

           {isSidebarOpen && (
             <div className="flex-1 bg-white/95 backdrop-blur-xl text-neutral-900 rounded-xl shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right-10 duration-200 border border-white/20">
                <div className="p-5 border-b border-neutral-200/50 flex justify-between items-center sticky top-0 bg-white/50 backdrop-blur z-20">
                   <h3 className="font-bold text-sm tracking-wider text-neutral-800">CONTROLS</h3>
                   <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-800">
                     <ChevronUp size={20} className="rotate-90" />
                   </button>
                </div>

                <div className="p-5 space-y-8 flex-1">
                   
                   {/* Pattern Select */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Test Pattern</label>
                      <div className="grid grid-cols-2 gap-2">
                         <button 
                           onClick={() => setPattern('cards')}
                           className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${pattern === 'cards' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-neutral-50'}`}
                         >
                           <LayoutGrid size={20} />
                           <span className="text-xs font-medium">Color Cards</span>
                         </button>
                         <button 
                           onClick={() => setPattern('gamma')}
                           className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${pattern === 'gamma' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-neutral-50'}`}
                         >
                           <Grip size={20} />
                           <span className="text-xs font-medium">Gamma Shift</span>
                         </button>
                         <button 
                           onClick={() => setPattern('text')}
                           className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${pattern === 'text' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-neutral-50'}`}
                         >
                           <Type size={20} />
                           <span className="text-xs font-medium">Text</span>
                         </button>
                         <button 
                           onClick={() => setPattern('gradient')}
                           className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${pattern === 'gradient' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-neutral-50'}`}
                         >
                           <Waves size={20} />
                           <span className="text-xs font-medium">Gradient</span>
                         </button>
                      </div>
                   </div>

                   {/* Background (Only for Cards/Text) */}
                   {(pattern === 'cards' || pattern === 'text') && (
                     <div className="space-y-3 pt-4 border-t border-neutral-100">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Background</label>
                        <div className="flex rounded-md bg-neutral-100 p-1 border border-neutral-200">
                           {(['gray', 'black', 'white'] as BgMode[]).map(mode => (
                             <button 
                               key={mode}
                               onClick={() => setBgShade(mode)}
                               className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-md transition-all ${bgShade === mode ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                             >
                               {mode}
                             </button>
                           ))}
                        </div>
                     </div>
                   )}

                   {/* Info Box */}
                   <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-[11px] text-blue-800 leading-relaxed">
                      {pattern === 'gamma' && "Look at the circles in the corners. If they appear significantly brighter or darker than the striped background compared to the center circle, your monitor suffers from Gamma Shift (common in VA panels)."}
                      {pattern === 'gradient' && "On TN panels, vertical viewing angles are poor. If you look from below, the black-to-white gradient might invert (turn black at the top)."}
                      {(pattern === 'cards' || pattern === 'text') && "Check if the colors in the corners look washed out or shift hue (e.g., Skin tone looking yellow/green) compared to the center."}
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
  };

  export default ViewingAngleTest;