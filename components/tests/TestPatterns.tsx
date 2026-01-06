import React, { useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, ChevronUp, RotateCcw, Grid, Palette, Zap, ScanLine, BoxSelect, Maximize } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';

type PatternMode = 'smpte' | 'grid' | 'sharpness' | 'ramp' | 'focus';

const TestPatterns: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // State
  const [pattern, setPattern] = useState<PatternMode>('smpte');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const startTest = () => {
    setIsActive(true);
    enterFullscreen();
  };

  const stopTest = () => {
    setIsActive(false);
    exitFullscreen();
  };

  if (isActive) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans select-none">
         {/* Top-Left Exit */}
         <button 
          onClick={stopTest}
          className="absolute top-6 left-6 z-[60] flex items-center gap-2 bg-neutral-900/80 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg hover:bg-neutral-800 transition-colors border border-neutral-700 font-medium text-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Exit
        </button>

        {/* Patterns Container */}
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
           
           {/* 1. SMPTE Color Bars (Simulated) */}
           {pattern === 'smpte' && (
              <div className="w-full h-full flex flex-col">
                 {/* Top 67%: Standard Colors (75% Intensity) */}
                 <div className="flex h-[67%] w-full">
                    <div className="flex-1 bg-[#c0c0c0]" /> {/* Gray */}
                    <div className="flex-1 bg-[#c0c000]" /> {/* Yellow */}
                    <div className="flex-1 bg-[#00c0c0]" /> {/* Cyan */}
                    <div className="flex-1 bg-[#00c000]" /> {/* Green */}
                    <div className="flex-1 bg-[#c000c0]" /> {/* Magenta */}
                    <div className="flex-1 bg-[#c00000]" /> {/* Red */}
                    <div className="flex-1 bg-[#0000c0]" /> {/* Blue */}
                 </div>
                 
                 {/* Middle 8%: Reverse Blue Bars */}
                 <div className="flex h-[8%] w-full">
                    <div className="flex-1 bg-[#0000c0]" /> 
                    <div className="flex-1 bg-[#131313]" /> {/* Black reference */}
                    <div className="flex-1 bg-[#c000c0]" /> 
                    <div className="flex-1 bg-[#131313]" /> 
                    <div className="flex-1 bg-[#00c0c0]" /> 
                    <div className="flex-1 bg-[#131313]" /> 
                    <div className="flex-1 bg-[#c0c0c0]" /> 
                 </div>
                 
                 {/* Bottom 25%: PLUGE Section */}
                 <div className="flex h-[25%] w-full relative">
                    {/* I + Q signals (Simulated) */}
                    <div className="w-[18%] bg-[#00214c]" />
                    <div className="w-[18%] bg-[#ffffff]" />
                    <div className="w-[18%] bg-[#32006a]" />
                    
                    {/* The PLUGE (Picture Line-Up Generation Equipment) */}
                    {/* This is the most critical part for brightness calibration */}
                    <div className="flex-1 bg-[#131313] relative flex items-center justify-center">
                       {/* Super Black (-4% IRE) - Should be invisible/clipped */}
                       <div className="h-full w-[33%] bg-[#000000]"></div>
                       {/* Black (0% IRE) - Background */}
                       <div className="h-full w-[33%] bg-[#131313]"></div>
                       {/* Gray (+4% IRE) - Should be barely visible */}
                       <div className="h-full w-[33%] bg-[#252525]"></div>
                    </div>
                 </div>
                 
                 {/* Overlay Label */}
                 {!isSidebarOpen && (
                   <div className="absolute bottom-10 left-10 text-[10px] text-white/50 font-mono bg-black/50 p-2 rounded">
                      PLUGE: Black(Left) should vanish. Gray(Right) should be visible.
                   </div>
                 )}
              </div>
           )}

           {/* 2. Geometry Grid & Overscan */}
           {pattern === 'grid' && (
             <div 
                className="w-full h-full bg-black relative"
                style={{ 
                  backgroundImage: `
                    linear-gradient(#333 1px, transparent 1px), 
                    linear-gradient(90deg, #333 1px, transparent 1px)
                  `,
                  backgroundSize: '5% 5%' // Proportional grid
                }} 
             >
                {/* Center Circle (Geometry Check) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50vmin] h-[50vmin] border-2 border-white rounded-full flex items-center justify-center">
                   <div className="w-[2px] h-4 bg-white absolute top-0 left-1/2 -translate-x-1/2"></div>
                   <div className="w-[2px] h-4 bg-white absolute bottom-0 left-1/2 -translate-x-1/2"></div>
                   <div className="h-[2px] w-4 bg-white absolute left-0 top-1/2 -translate-y-1/2"></div>
                   <div className="h-[2px] w-4 bg-white absolute right-0 top-1/2 -translate-y-1/2"></div>
                </div>

                {/* Overscan Lines (Safe Areas) */}
                {/* 5% Safe Action */}
                <div className="absolute inset-[5%] border-2 border-green-500/50 pointer-events-none">
                    <span className="absolute top-2 left-2 text-green-500 text-[10px] font-mono">90% SAFE ACTION</span>
                </div>
                {/* 2.5% Safe Title */}
                <div className="absolute inset-[2.5%] border border-red-500/50 pointer-events-none">
                    <span className="absolute top-2 right-2 text-red-500 text-[10px] font-mono">95% OVERSCAN</span>
                </div>
             </div>
           )}

           {/* 3. Multiburst / Sharpness */}
           {pattern === 'sharpness' && (
             <div className="w-full h-full bg-[#808080] flex items-center justify-center">
                <div className="flex flex-col w-[90%] h-[80%] bg-white shadow-xl">
                    
                    {/* Header */}
                    <div className="h-12 border-b border-black flex items-center justify-center font-bold text-xs tracking-widest uppercase">
                       Multiburst Frequency Response
                    </div>

                    {/* Bursts */}
                    <div className="flex-1 flex">
                        {/* 1px Lines (Highest Frequency) */}
                        <div className="flex-1 border-r border-black relative group">
                           <div className="absolute top-2 left-2 bg-white px-1 text-[10px] font-bold">1px</div>
                           <div className="w-full h-full" style={{ background: 'repeating-linear-gradient(90deg, #000 0, #000 1px, #fff 1px, #fff 2px)' }}></div>
                        </div>
                        {/* 2px Lines */}
                        <div className="flex-1 border-r border-black relative">
                           <div className="absolute top-2 left-2 bg-white px-1 text-[10px] font-bold">2px</div>
                           <div className="w-full h-full" style={{ background: 'repeating-linear-gradient(90deg, #000 0, #000 2px, #fff 2px, #fff 4px)' }}></div>
                        </div>
                        {/* 3px Lines */}
                        <div className="flex-1 border-r border-black relative">
                           <div className="absolute top-2 left-2 bg-white px-1 text-[10px] font-bold">3px</div>
                           <div className="w-full h-full" style={{ background: 'repeating-linear-gradient(90deg, #000 0, #000 3px, #fff 3px, #fff 6px)' }}></div>
                        </div>
                        {/* 4px Lines */}
                        <div className="flex-1 border-r border-black relative">
                           <div className="absolute top-2 left-2 bg-white px-1 text-[10px] font-bold">4px</div>
                           <div className="w-full h-full" style={{ background: 'repeating-linear-gradient(90deg, #000 0, #000 4px, #fff 4px, #fff 8px)' }}></div>
                        </div>
                        {/* Checkerboard (Moiré check) */}
                        <div className="flex-1 relative">
                           <div className="absolute top-2 left-2 bg-white px-1 text-[10px] font-bold">Check</div>
                           <div className="w-full h-full" style={{ 
                                backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
                                backgroundSize: '4px 4px',
                                backgroundColor: '#fff'
                           }}></div>
                        </div>
                    </div>
                    
                    <div className="h-24 border-t border-black bg-neutral-100 p-4 text-center">
                       <h1 className="text-3xl font-serif">The Quick Brown Fox Jumps Over The Lazy Dog.</h1>
                       <p className="text-xs text-neutral-500 mt-2">Check for halos around text (Over-sharpening)</p>
                    </div>
                </div>
             </div>
           )}

           {/* 4. Grayscale Ramp */}
           {pattern === 'ramp' && (
              <div className="w-full h-full flex flex-col">
                 <div className="flex-1 w-full bg-gradient-to-r from-black to-white"></div>
                 <div className="h-1/3 w-full bg-black flex">
                     {Array.from({length: 32}).map((_, i) => (
                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: `rgb(${i*8},${i*8},${i*8})` }}></div>
                     ))}
                 </div>
              </div>
           )}
           
           {/* 5. Corner Focus */}
           {pattern === 'focus' && (
              <div className="w-full h-full bg-black relative">
                  {/* Center Cross */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-px h-[100vh] bg-white/20 mx-auto"></div>
                      <div className="h-px w-[100vw] bg-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                  
                  {/* Corners */}
                  {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                      <div key={i} className={`absolute ${pos} w-32 h-32 border-2 border-white bg-black`}>
                          <div className="w-full h-full flex items-center justify-center relative">
                             <div className="w-full h-px bg-white absolute top-1/2"></div>
                             <div className="h-full w-px bg-white absolute left-1/2"></div>
                             <div className="w-16 h-16 border border-white rounded-full"></div>
                          </div>
                      </div>
                  ))}

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-mono text-center bg-black p-4 border border-white">
                      FOCUS CHECK
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
                   <h3 className="font-bold text-sm tracking-wider text-neutral-800">PATTERN SELECT</h3>
                   <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-800">
                     <ChevronUp size={20} className="rotate-90" />
                   </button>
                </div>

                <div className="p-5 space-y-4 flex-1">
                   {/* 1. SMPTE */}
                   <button 
                     onClick={() => setPattern('smpte')}
                     className={`w-full p-3 rounded-lg border-2 text-left transition-all ${pattern === 'smpte' ? 'border-blue-500 bg-blue-50' : 'border-neutral-100 hover:border-blue-200 hover:bg-neutral-50'}`}
                   >
                     <div className="flex items-center gap-2 mb-1">
                        <Palette size={18} className={pattern === 'smpte' ? 'text-blue-600' : 'text-neutral-400'} />
                        <span className={`font-bold text-sm ${pattern === 'smpte' ? 'text-blue-700' : 'text-neutral-700'}`}>SMPTE + PLUGE</span>
                     </div>
                     <p className="text-[11px] text-neutral-500 leading-relaxed ml-7">
                       Standard reference bars. Use the bottom-right PLUGE bars to set Brightness (Black should vanish, Gray visible).
                     </p>
                   </button>

                   {/* 2. Grid */}
                   <button 
                     onClick={() => setPattern('grid')}
                     className={`w-full p-3 rounded-lg border-2 text-left transition-all ${pattern === 'grid' ? 'border-blue-500 bg-blue-50' : 'border-neutral-100 hover:border-blue-200 hover:bg-neutral-50'}`}
                   >
                     <div className="flex items-center gap-2 mb-1">
                        <Grid size={18} className={pattern === 'grid' ? 'text-blue-600' : 'text-neutral-400'} />
                        <span className={`font-bold text-sm ${pattern === 'grid' ? 'text-blue-700' : 'text-neutral-700'}`}>Geometry & Overscan</span>
                     </div>
                     <p className="text-[11px] text-neutral-500 leading-relaxed ml-7">
                       Check if your TV cuts off the edges (Overscan). The center circle should be perfectly round, not oval.
                     </p>
                   </button>

                   {/* 3. Sharpness */}
                   <button 
                     onClick={() => setPattern('sharpness')}
                     className={`w-full p-3 rounded-lg border-2 text-left transition-all ${pattern === 'sharpness' ? 'border-blue-500 bg-blue-50' : 'border-neutral-100 hover:border-blue-200 hover:bg-neutral-50'}`}
                   >
                     <div className="flex items-center gap-2 mb-1">
                        <Zap size={18} className={pattern === 'sharpness' ? 'text-blue-600' : 'text-neutral-400'} />
                        <span className={`font-bold text-sm ${pattern === 'sharpness' ? 'text-blue-700' : 'text-neutral-700'}`}>Multiburst Sharpness</span>
                     </div>
                     <p className="text-[11px] text-neutral-500 leading-relaxed ml-7">
                       If the 1px lines merge into gray, you have resolution loss or scaling artifacts. Lower sharpness to remove halos.
                     </p>
                   </button>

                   {/* 4. Ramp */}
                   <button 
                     onClick={() => setPattern('ramp')}
                     className={`w-full p-3 rounded-lg border-2 text-left transition-all ${pattern === 'ramp' ? 'border-blue-500 bg-blue-50' : 'border-neutral-100 hover:border-blue-200 hover:bg-neutral-50'}`}
                   >
                     <div className="flex items-center gap-2 mb-1">
                        <Maximize size={18} className={pattern === 'ramp' ? 'text-blue-600' : 'text-neutral-400'} />
                        <span className={`font-bold text-sm ${pattern === 'ramp' ? 'text-blue-700' : 'text-neutral-700'}`}>Grayscale Ramp</span>
                     </div>
                     <p className="text-[11px] text-neutral-500 leading-relaxed ml-7">
                       Check for smooth gradient transitions and color tinting in gray areas (White Balance).
                     </p>
                   </button>

                   {/* 5. Focus */}
                   <button 
                     onClick={() => setPattern('focus')}
                     className={`w-full p-3 rounded-lg border-2 text-left transition-all ${pattern === 'focus' ? 'border-blue-500 bg-blue-50' : 'border-neutral-100 hover:border-blue-200 hover:bg-neutral-50'}`}
                   >
                     <div className="flex items-center gap-2 mb-1">
                        <ScanLine size={18} className={pattern === 'focus' ? 'text-blue-600' : 'text-neutral-400'} />
                        <span className={`font-bold text-sm ${pattern === 'focus' ? 'text-blue-700' : 'text-neutral-700'}`}>Corner Focus</span>
                     </div>
                     <p className="text-[11px] text-neutral-500 leading-relaxed ml-7">
                       Critical for projectors. Ensure corners are as sharp as the center.
                     </p>
                   </button>
                </div>

                <div className="p-5 border-t border-neutral-100 bg-neutral-50">
                  <button 
                    onClick={stopTest}
                    className="w-full py-3 bg-neutral-900 hover:bg-black text-white rounded-lg font-bold shadow-lg shadow-neutral-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Return to Home
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
        title="Test Patterns - SMPTE, Sharpness & Geometry" 
        description="Professional test patterns for display calibration. Includes SMPTE Color Bars (PLUGE), Multiburst Sharpness, Geometry Grid, and Grayscale Ramps."
        canonical="/tests/test-patterns"
        keywords={['monitor test patterns', 'smpte bars', 'pluge pattern', 'sharpness test pattern', 'display geometry test', 'calibration images']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Test Patterns', path: '/tests/test-patterns' }
        ]}
      />
      <TestIntro
        title="Test Patterns"
        description="Reference patterns for setting up display color, brightness, contrast, and geometry. Includes industry-standard SMPTE bars and Multiburst charts."
        onStart={startTest}
      >
        <InfoCard title="SMPTE & PLUGE">
          <p>
            We use a simulated SMPTE pattern with a <strong>PLUGE</strong> section (bottom right). Adjust your monitor's brightness so the left black bar vanishes, but the right gray bar remains barely visible.
          </p>
        </InfoCard>
        <InfoCard title="Multiburst">
          <p>
            The <strong>Sharpness</strong> pattern features single-pixel lines. If these lines look gray or blurry, your monitor isn't displaying 1:1 pixels (likely due to scaling or overscan).
          </p>
        </InfoCard>
      </TestIntro>
    </>
  );
};

export default TestPatterns;