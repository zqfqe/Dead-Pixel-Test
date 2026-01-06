import React, { useState, useMemo } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, ChevronUp, RotateCcw, MoveHorizontal, MoveVertical, Circle, Palette, Play, Pause, Layers } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';

type GradientType = 'linear' | 'radial';
type ColorPreset = 'gray' | 'red' | 'green' | 'blue' | 'cyan' | 'magenta' | 'yellow' | 'sky' | 'sunset';

const COLOR_MAP: Record<ColorPreset, { start: string; end: string; label: string }> = {
  gray: { start: '#000000', end: '#FFFFFF', label: 'Grayscale' },
  red: { start: '#000000', end: '#FF0000', label: 'Red' },
  green: { start: '#000000', end: '#00FF00', label: 'Green' },
  blue: { start: '#000000', end: '#0000FF', label: 'Blue' },
  cyan: { start: '#000000', end: '#00FFFF', label: 'Cyan' },
  magenta: { start: '#000000', end: '#FF00FF', label: 'Magenta' },
  yellow: { start: '#000000', end: '#FFFF00', label: 'Yellow' },
  sky: { start: '#000000', end: '#87CEEB', label: 'Deep Sky' }, // Stress test for dark blues
  sunset: { start: '#2b1055', end: '#7597de', label: 'Sunset' }, // Complex gradient
};

const ColorGradientTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // State
  const [steps, setSteps] = useState<number>(256); // 256 = 8-bit
  const [isSmooth, setIsSmooth] = useState(true);
  const [type, setType] = useState<GradientType>('linear');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [color, setColor] = useState<ColorPreset>('gray');
  const [animate, setAnimate] = useState(false);
  
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
    setSteps(256);
    setIsSmooth(true);
    setType('linear');
    setOrientation('horizontal');
    setColor('gray');
    setAnimate(false);
  };

  // Generate CSS Gradient String
  const gradientStyle = useMemo(() => {
    const { start, end } = COLOR_MAP[color];
    
    // 1. Determine Direction/Shape
    let rule = '';
    if (type === 'linear') {
      rule = orientation === 'horizontal' ? '90deg' : '180deg';
    } else {
      rule = 'circle';
    }

    // 2. Generate Color Stops
    let stops = '';

    if (isSmooth) {
      // Simple smooth gradient
      stops = `${start}, ${end}`;
    } else {
      // Hard stops for banding simulation
      // e.g. "Black 0%, Black 10%, White 10%, White 20%..."
      const stopList = [];
      
      // Interpolation helper
      const interpolateColor = (color1: string, color2: string, factor: number) => {
         // Simple linear interpolation for hex/rgb is complex without a library.
         // For the sake of this component without external deps, 
         // we will rely on CSS `mix-blend-mode` logic or just sticking to RGBA logic if possible.
         // However, standard CSS gradients don't support "calculated" stops easily without generating the string.
         
         // Let's use `color-mix` (modern CSS) or just assume browser interpolation between hard stops isn't what we want.
         // actually, for "Banding" test, we want SOLID blocks.
         // We can use the browser's own gradient engine to calculate intermediate colors 
         // by creating A LOT of stops.
         
         // Limitation: Writing a full JS hex interpolator is verbose. 
         // ALTERNATIVE: Use `rgba` logic for the primary colors, but `sunset` is hard.
         // TRICK: We will stick to single channel colors mostly for the manual math, 
         // or use `transparent` overlay on background color? No.

         // Let's keep it simple: The visual banding effect is best achieved by telling CSS 
         // to render specific blocks. But calculating the hex for "Step 5 of 64" is hard without a lib.
         // 
         // BETTER APPROACH FOR CSS: 
         // Use a repeating-linear-gradient with a transparent overlay? No.
         //
         // Actually, if we want TRUE banding simulation for 'steps', we just need to let CSS 
         // interpolate, but we use a specialized step function? No CSS doesn't have that.
         
         // Fallback: For the complex colors (sky/sunset), 'Stepped' mode might revert to a 
         // simplified logic or we just stick to "Smooth" for them?
         // No, users need to test banding.
         
         // Let's stick to the 3 main colors + Gray which we can math easily.
         // For complex ones, we might accept a limitation or try a simple RGB lerp.
         return null; 
      };
      
      // Since we can't easily math mixed hex codes without a huge function, 
      // let's create the gradient string using `color-mix` if supported, 
      // OR just rely on the fact that `steps` implies visible bands.
      //
      // For now, let's implement the 'div' approach logic BUT inside a linear-gradient string 
      // is impossible.
      //
      // REVERTING STRATEGY:
      // We will use `linear-gradient` for smooth.
      // For Stepped: We will use a JS function to generate RGB values.
      
      const parseHex = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
      };

      const [r1, g1, b1] = parseHex(start);
      const [r2, g2, b2] = parseHex(end);

      for (let i = 0; i < steps; i++) {
        const factor = i / (steps - 1);
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        const colorString = `rgb(${r},${g},${b})`;
        
        // CSS Hard Stop Syntax: Color N%, Color (N+1)%
        const startPct = (i / steps) * 100;
        const endPct = ((i + 1) / steps) * 100;
        
        stopList.push(`${colorString} ${startPct}%`);
        stopList.push(`${colorString} ${endPct}%`);
      }
      stops = stopList.join(', ');
    }

    return `${type}-gradient(${rule}, ${stops})`;

  }, [color, isSmooth, steps, orientation, type]);


  if (isActive) {
    return (
      <div className="fixed inset-0 z-50 flex bg-black overflow-hidden">
        {/* Top-Left Exit */}
        <button 
          onClick={stopTest}
          className="absolute top-6 left-6 z-[60] flex items-center gap-2 bg-neutral-900/50 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg hover:bg-neutral-800 transition-colors border border-neutral-700 font-medium text-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Exit
        </button>

        {/* The Gradient Content */}
        <div 
           className={`flex-1 w-full h-full relative ${animate ? 'animate-scan' : ''}`}
           style={{ 
             background: gradientStyle,
             // If creating a huge string, maybe optimization is needed, but for <256 steps it's fine.
           }} 
        />
        
        {/* Animation specific styles if needed */}
        {animate && (
          <style>{`
            @keyframes scan {
              0% { background-position: 0% 0%; }
              100% { background-position: 100% 100%; }
            }
            .animate-scan {
              background-size: 200% 200%;
              animation: scan 10s linear infinite alternate;
            }
          `}</style>
        )}

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
                   <h3 className="font-bold text-sm tracking-wider text-neutral-800">GRADIENT</h3>
                   <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-800">
                     <ChevronUp size={20} className="rotate-90" />
                   </button>
                </div>

                <div className="p-5 space-y-8 flex-1">
                   
                   {/* 1. Color Selection */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                        <Palette size={12} /> Color Channel
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                         {(Object.keys(COLOR_MAP) as ColorPreset[]).map(c => (
                           <button
                             key={c}
                             onClick={() => setColor(c)}
                             className={`
                               aspect-square rounded-md border shadow-sm transition-transform hover:scale-105 relative group
                               ${color === c ? 'ring-2 ring-blue-500 ring-offset-1 z-10' : 'border-transparent'}
                             `}
                             style={{ background: `linear-gradient(135deg, ${COLOR_MAP[c].start}, ${COLOR_MAP[c].end})` }}
                             title={COLOR_MAP[c].label}
                           >
                              {/* Tooltip */}
                           </button>
                         ))}
                      </div>
                      <div className="text-center text-xs font-medium text-neutral-500">{COLOR_MAP[color].label}</div>
                   </div>

                   {/* 2. Mode Toggle */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                         <Layers size={12} /> Render Mode
                      </label>
                      <div className="flex rounded-md bg-neutral-100 p-1 border border-neutral-200">
                         <button 
                           onClick={() => { setIsSmooth(true); }}
                           className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${isSmooth ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                         >
                           Smooth
                         </button>
                         <button 
                           onClick={() => { setIsSmooth(false); setSteps(64); }}
                           className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!isSmooth ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                         >
                           Stepped
                         </button>
                      </div>
                   </div>

                   {/* 3. Steps (Bit Depth) */}
                   {!isSmooth && (
                     <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-end">
                           <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Bit Depth Emulation</label>
                           <span className="text-xs font-mono font-bold text-blue-600">{steps} levels</span>
                        </div>
                        <input 
                           type="range" 
                           min="8" 
                           max="256" 
                           step="8"
                           value={steps}
                           onChange={(e) => setSteps(parseInt(e.target.value))}
                           className="w-full accent-blue-600 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between gap-1 mt-1">
                          {[
                             {l: '6-Bit', v: 64}, 
                             {l: '8-Bit', v: 256}
                           ].map(item => (
                             <button 
                               key={item.v} 
                               onClick={() => setSteps(item.v)} 
                               className={`flex-1 text-[10px] py-1 border rounded transition-colors ${steps === item.v ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'}`}
                             >
                               {item.l}
                             </button>
                          ))}
                        </div>
                     </div>
                   )}

                   {/* 4. Geometry & Motion */}
                   <div className="space-y-3 pt-2 border-t border-neutral-100">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Geometry</label>
                      
                      <div className="grid grid-cols-2 gap-2">
                         <button 
                           onClick={() => setType('linear')}
                           className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 ${type === 'linear' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                         >
                           <MoveHorizontal size={14} /> Linear
                         </button>
                         <button 
                           onClick={() => setType('radial')}
                           className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 ${type === 'radial' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                         >
                           <Circle size={14} /> Radial
                         </button>
                      </div>

                      {type === 'linear' && (
                        <div className="flex rounded-md bg-neutral-100 p-1 border border-neutral-200">
                           <button onClick={() => setOrientation('horizontal')} className={`flex-1 py-1 text-[10px] font-bold rounded ${orientation === 'horizontal' ? 'bg-white shadow-sm text-black' : 'text-neutral-500'}`}>Horz</button>
                           <button onClick={() => setOrientation('vertical')} className={`flex-1 py-1 text-[10px] font-bold rounded ${orientation === 'vertical' ? 'bg-white shadow-sm text-black' : 'text-neutral-500'}`}>Vert</button>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => setAnimate(!animate)}
                        className={`w-full py-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${animate ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                      >
                        {animate ? <Pause size={14} /> : <Play size={14} />}
                        {animate ? 'Stop Motion' : 'Animate (Check FRC)'}
                      </button>
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
      title="Color Gradient Test"
      description="Test your display's bit depth and banding. 8-bit panels should display 256 steps smoothly. Use the 'Sky' and 'Sunset' presets to check for real-world banding artifacts."
      onStart={startTest}
    >
      <InfoCard title="Color Banding">
        <p>
          Banding looks like distinct "steps" or lines in a gradient that should be smooth. It occurs when the monitor cannot display enough colors to bridge the gap between two shades.
        </p>
      </InfoCard>
      <InfoCard title="Temporal Dithering (FRC)">
        <p>
          Enable <strong>Animate</strong> to check for Frame Rate Control. If you see flickering noise or "dancing ants" in the gradient as it moves, your monitor uses aggressive FRC to simulate colors it can't natively display.
        </p>
      </InfoCard>
    </TestIntro>
  );
};

export default ColorGradientTest;