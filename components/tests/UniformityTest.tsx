import React, { useState, useEffect, useCallback } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, ChevronUp, RotateCcw, Check, Grid, Crosshair, Sun, Palette, Keyboard, HelpCircle, Monitor, AlertTriangle, Layers, Laptop } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';
import { Link } from 'react-router-dom';
import { RelatedTools } from '../common/RelatedTools';
import { RelatedArticles } from '../common/RelatedArticles';

type PatternType = 'solid' | 'checkerboard';
type ColorType = 'white' | 'red' | 'green' | 'blue' | 'cyan' | 'magenta' | 'yellow' | 'black';

const GRAYS_PRESETS = [0, 5, 10, 20, 30, 40, 50, 75, 100];
const COLORS: { id: ColorType; label: string; hex: string }[] = [
  { id: 'white', label: 'White', hex: '#FFFFFF' },
  { id: 'red', label: 'Red', hex: '#FF0000' },
  { id: 'green', label: 'Green', hex: '#00FF00' },
  { id: 'blue', label: 'Blue', hex: '#0000FF' },
  { id: 'cyan', label: 'Cyan', hex: '#00FFFF' },
  { id: 'magenta', label: 'Magenta', hex: '#FF00FF' },
  { id: 'yellow', label: 'Yellow', hex: '#FFFF00' },
  { id: 'black', label: 'Black', hex: '#000000' },
];

const UniformityTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // State
  const [brightness, setBrightness] = useState(50);
  const [selectedColor, setSelectedColor] = useState<ColorType>('white');
  const [patternType, setPatternType] = useState<PatternType>('solid');
  const [checkerInvert, setCheckerInvert] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showCrosshair, setShowCrosshair] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [uiVisible, setUiVisible] = useState(true);

  // Refs for auto-hiding UI
  const uiTimeoutRef = React.useRef<number | null>(null);

  const startTest = () => {
    setIsActive(true);
    enterFullscreen();
    resetUiTimer();
  };

  const stopTest = useCallback(() => {
    setIsActive(false);
    exitFullscreen();
    if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
  }, [exitFullscreen]);

  const resetSettings = () => {
    setBrightness(50);
    setSelectedColor('white');
    setPatternType('solid');
    setCheckerInvert(false);
    setShowGrid(false);
    setShowCrosshair(false);
  };

  // Helper to calculate RGB based on brightness and selected base color
  const getFillColor = useCallback((overrideBrightness?: number) => {
    const b = overrideBrightness !== undefined ? overrideBrightness : brightness;
    const factor = b / 100;
    const val = Math.round(255 * factor);

    switch (selectedColor) {
      case 'white': return `rgb(${val}, ${val}, ${val})`;
      case 'black': return `rgb(0, 0, 0)`; // Black is always black regardless of brightness slider usually, but kept for logic consistency
      case 'red': return `rgb(${val}, 0, 0)`;
      case 'green': return `rgb(0, ${val}, 0)`;
      case 'blue': return `rgb(0, 0, ${val})`;
      case 'cyan': return `rgb(0, ${val}, ${val})`;
      case 'magenta': return `rgb(${val}, 0, ${val})`;
      case 'yellow': return `rgb(${val}, ${val}, 0)`;
      default: return `rgb(${val}, ${val}, ${val})`;
    }
  }, [brightness, selectedColor]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      resetUiTimer();
      switch(e.key) {
        case 'ArrowRight':
          setBrightness(prev => Math.min(100, prev + 5));
          break;
        case 'ArrowLeft':
          setBrightness(prev => Math.max(0, prev - 5));
          break;
        case 'ArrowUp':
          // Cycle colors prev
          const currIdxUp = COLORS.findIndex(c => c.id === selectedColor);
          const nextIdxUp = (currIdxUp - 1 + COLORS.length) % COLORS.length;
          setSelectedColor(COLORS[nextIdxUp].id);
          break;
        case 'ArrowDown':
          // Cycle colors next
          const currIdxDown = COLORS.findIndex(c => c.id === selectedColor);
          const nextIdxDown = (currIdxDown + 1) % COLORS.length;
          setSelectedColor(COLORS[nextIdxDown].id);
          break;
        case 'g':
        case 'G':
          setShowGrid(prev => !prev);
          break;
        case 'c':
        case 'C':
          setPatternType(prev => prev === 'solid' ? 'checkerboard' : 'solid');
          break;
        case 'Escape':
          stopTest();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, selectedColor, stopTest]);

  // Auto Hide UI Logic
  const resetUiTimer = () => {
    setUiVisible(true);
    if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
    uiTimeoutRef.current = window.setTimeout(() => {
       if (isActive && !isSidebarOpen) setUiVisible(false);
    }, 3000);
  };

  const handleMouseMove = () => {
    resetUiTimer();
  };

  if (isActive) {
    const mainColor = getFillColor();
    const secondaryColor = 'rgb(0,0,0)'; // In checkerboard, secondary is usually black
    
    // Logic for checkerboard inversion
    const colorA = checkerInvert ? secondaryColor : mainColor;
    const colorB = checkerInvert ? mainColor : secondaryColor;

    const checkerSize = '120px'; 
    
    const backgroundStyle = patternType === 'solid' 
      ? { backgroundColor: mainColor }
      : {
          backgroundColor: colorB, 
          backgroundImage: `
            conic-gradient(
              ${colorA} 90deg, 
              ${colorB} 90deg 180deg, 
              ${colorA} 180deg 270deg, 
              ${colorB} 270deg
            )`,
          backgroundSize: `${checkerSize} ${checkerSize}`
        };

    // Determine UI contrast color based on brightness
    const isDark = brightness < 40 || (patternType === 'checkerboard');
    const uiColor = isDark ? 'text-white' : 'text-black';
    const gridColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';

    return (
      <div 
        className={`fixed inset-0 z-50 flex flex-row overflow-hidden select-none font-sans ${!uiVisible ? 'cursor-none' : ''}`}
        style={backgroundStyle}
        onMouseMove={handleMouseMove}
        onClick={resetUiTimer}
      >
        {/* --- 1. Top-Left Exit Button --- */}
        <div className={`absolute top-6 left-6 z-[60] transition-opacity duration-300 ${uiVisible ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={stopTest}
            className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-lg hover:bg-neutral-800 transition-colors border border-white/10 font-medium text-sm group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Exit
          </button>
        </div>

        {/* --- 2. Overlays (Grid & Crosshair) --- */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {showGrid && (
             <div className="w-full h-full"
               style={{ 
                 backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
                 backgroundSize: '100px 100px'
               }} 
             />
          )}
          {showCrosshair && (
            <>
              <div className="absolute top-1/2 left-0 w-full h-px opacity-50 bg-red-500" />
              <div className="absolute top-0 left-1/2 h-full w-px opacity-50 bg-red-500" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-2 border-red-500 rounded-full" />
            </>
          )}
        </div>

        {/* --- 3. Right Sidebar Controls --- */}
        <div className={`absolute top-6 right-6 bottom-6 z-[60] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-auto'}`}>
           {/* Sidebar Toggle (If closed) */}
           {!isSidebarOpen && (
             <button 
               onClick={() => { setIsSidebarOpen(true); resetUiTimer(); }}
               className={`p-3 rounded-full shadow-xl transition-all ${uiVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} bg-white text-black`}
             >
               <ChevronLeft size={24} />
             </button>
           )}

           {/* The Panel */}
           {isSidebarOpen && (
             <div className="flex-1 bg-white/95 backdrop-blur-xl text-neutral-900 rounded-2xl shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right-10 duration-200 border border-white/20">
                {/* Header */}
                <div className="p-5 border-b border-neutral-200/50 flex justify-between items-center sticky top-0 bg-white/50 backdrop-blur z-20">
                   <div className="flex items-center gap-2">
                     <Sun size={18} className="text-blue-600" />
                     {/* SEO: Changed H3 to DIV */}
                     <div className="font-bold text-sm tracking-wider text-neutral-800">UNIFORMITY</div>
                   </div>
                   <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-800 p-1 hover:bg-neutral-100 rounded">
                     <ChevronUp size={20} className="rotate-90" />
                   </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-8 flex-1">
                   
                   {/* Pattern Type */}
                   <div className="space-y-3">
                      <div className="flex rounded-lg bg-neutral-100 p-1 border border-neutral-200">
                         <button 
                           onClick={() => setPatternType('solid')}
                           className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${patternType === 'solid' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                         >
                           SOLID
                         </button>
                         <button 
                           onClick={() => setPatternType('checkerboard')}
                           className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${patternType === 'checkerboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                         >
                           CHECKER
                         </button>
                      </div>
                      {patternType === 'checkerboard' && (
                        <button 
                          onClick={() => setCheckerInvert(!checkerInvert)}
                          className="w-full text-xs py-1.5 border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-600"
                        >
                          Invert Colors
                        </button>
                      )}
                   </div>

                   {/* Color Selection */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                        <Palette size={12} /> Color
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                         {COLORS.map(c => (
                           <button
                             key={c.id}
                             onClick={() => { setSelectedColor(c.id); setBrightness(50); }} // Reset brightness on color change for clarity? Maybe keep it.
                             className={`
                               aspect-square rounded-lg border-2 transition-all shadow-sm
                               ${selectedColor === c.id 
                                 ? 'border-blue-500 ring-2 ring-blue-200 scale-105 z-10' 
                                 : 'border-transparent hover:scale-105 hover:border-neutral-300'}
                             `}
                             style={{ backgroundColor: c.hex }}
                             title={c.label}
                           />
                         ))}
                      </div>
                   </div>

                   {/* Brightness / Greyscale Steps */}
                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Luminance (Gray %)</label>
                        <span className="text-xs font-mono font-bold text-blue-600">{brightness}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                      
                      {/* Presets */}
                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                         {GRAYS_PRESETS.map(val => (
                           <button
                             key={val}
                             onClick={() => { setBrightness(val); setSelectedColor('white'); }}
                             className={`
                               py-1.5 rounded text-[10px] font-medium border transition-colors
                               ${selectedColor === 'white' && brightness === val 
                                 ? 'bg-neutral-800 text-white border-neutral-800' 
                                 : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'}
                             `}
                           >
                             {val}%
                           </button>
                         ))}
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-tight pt-1">
                        Use <strong className="text-neutral-600">5%</strong> and <strong className="text-neutral-600">10%</strong> to check for OLED banding and dirty screen effect (DSE).
                      </p>
                   </div>

                   {/* Tools */}
                   <div className="space-y-2 pt-2 border-t border-neutral-100">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Overlay Tools</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setShowGrid(!showGrid)}
                          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${showGrid ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                        >
                           <Grid size={16} /> <span className="text-xs font-bold">Grid</span>
                        </button>
                        <button 
                          onClick={() => setShowCrosshair(!showCrosshair)}
                          className={`flex-1 items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${showCrosshair ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                        >
                           <Crosshair size={16} /> <span className="text-xs font-bold">Center</span>
                        </button>
                      </div>
                   </div>

                   {/* Shortcuts Hint */}
                   <div className="bg-neutral-50 rounded-lg p-3 text-[10px] text-neutral-500 space-y-1 border border-neutral-100">
                      <div className="flex items-center gap-2 font-bold mb-1 text-neutral-400"><Keyboard size={12}/> Shortcuts</div>
                      <div className="flex justify-between"><span>Arrows</span> <span>Brightness / Color</span></div>
                      <div className="flex justify-between"><span>G</span> <span>Toggle Grid</span></div>
                      <div className="flex justify-between"><span>C</span> <span>Pattern</span></div>
                   </div>
                </div>

                {/* Footer Reset */}
                <div className="p-5 border-t border-neutral-100 bg-neutral-50">
                  <button 
                    onClick={resetSettings}
                    className="w-full py-3 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-neutral-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Reset All
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
        title="Monitor Uniformity Test - Backlight Bleed & IPS Glow" 
        description="Check your screen for backlight bleed, clouding, IPS glow, and dirty screen effect (DSE). Use the 5% and 10% gray steps to reveal hidden panel defects."
        canonical="/tests/uniformity"
        keywords={['uniformity test', 'backlight bleed test', 'ips glow test', 'monitor clouding', 'dirty screen effect', 'oled banding test']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Uniformity Test', path: '/tests/uniformity' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Screen Uniformity Test",
              "url": "https://deadpixeltest.cc/tests/uniformity",
              "description": "Professional tool to test monitor uniformity, backlight bleed, and IPS glow.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [{
                "@type": "Question",
                "name": "What is IPS Glow vs Backlight Bleed?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "IPS Glow changes intensity when you change your viewing angle. Backlight bleed remains static regardless of your viewing position."
                }
              }, {
                "@type": "Question",
                "name": "How to check for Dirty Screen Effect (DSE)?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Use the 'Gray 5%' or 'Gray 10%' presets. DSE appears as faint vertical bands or patchy clouds on a uniform gray background."
                }
              }, {
                "@type": "Question",
                "name": "Can backlight bleed be fixed?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sometimes. Gently massaging the area with a microfiber cloth can occasionally reseat the panel layers and reduce bleed caused by bezel pressure. However, severe bleed is a permanent manufacturing defect."
                }
              }]
            },
            {
              "@type": "HowTo",
              "name": "How to Test for Backlight Bleed",
              "step": [
                { "@type": "HowToStep", "text": "Dim the lights in your room to create a dark environment for better visibility." },
                { "@type": "HowToStep", "text": "Start the Uniformity Test and select the 'Black' color pattern from the menu." },
                { "@type": "HowToStep", "text": "Inspect the edges and corners of the screen for uneven bright patches or spotlights." },
                { "@type": "HowToStep", "text": "Move your head side-to-side. If the glow moves, it is IPS Glow (Normal). If it stays static, it is Backlight Bleed (Defect)." }
              ]
            }
          ]
        }}
      />
      <div className="flex flex-col min-h-screen">
        <TestIntro
          title="Screen Uniformity Test"
          description="Evaluate backlight bleeding, IPS glow, and dirty screen effect (DSE). Use the specific gray steps (5%, 10%) to reveal panel imperfections often hidden by bright content."
          onStart={startTest}
        >
          <InfoCard title="The '5% Gray' Rule">
            <p>
              OLED and LED panels often struggle with very dark grays. Set the test to <strong>5%</strong> or <strong>10%</strong> Gray (White color, 5-10% brightness) to check for vertical banding and dark patches.
            </p>
          </InfoCard>
          <InfoCard title="IPS Glow vs Bleed">
            <p>
              Not sure if it's defect? Check our guide on <Link to="/blog/ips-glow-vs-backlight-bleed-guide" className="text-blue-400 hover:underline">IPS Glow vs Backlight Bleed</Link> before returning your monitor.
            </p>
          </InfoCard>
        </TestIntro>

        {/* Deep Content Section for SEO */}
        <section className="max-w-4xl mx-auto px-6 py-16 space-y-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           
           <article className="prose prose-invert max-w-none">
              <div className="grid md:grid-cols-2 gap-12">
                 <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                       <Monitor className="text-blue-500" /> What is Screen Uniformity?
                    </h2>
                    <p className="text-neutral-400 leading-relaxed text-sm mb-4">
                       Screen uniformity refers to the ability of a display to maintain the same brightness and color temperature across the entire panel. A perfect screen would look exactly the same in the corners as it does in the center. However, manufacturing tolerances often lead to "Clouding" (uneven brightness) or "Tinting" (color shifts).
                    </p>
                    <p className="text-neutral-400 leading-relaxed text-sm">
                       This test allows you to inspect solid colors (Black, White, Gray) to easily spot these imperfections.
                    </p>
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                       <HelpCircle className="text-yellow-500" /> Glow vs. Bleed
                    </h2>
                    <p className="text-neutral-400 leading-relaxed text-sm mb-2">
                       <strong>IPS Glow:</strong> A "shimmering" effect in the corners that changes when you move your head. This is normal technology behavior for IPS panels.
                    </p>
                    <p className="text-neutral-400 leading-relaxed text-sm">
                       <strong>Backlight Bleed:</strong> Bright spots leaking from the edges that remain static regardless of viewing angle. This is a manufacturing defect caused by poor bezel assembly.
                    </p>
                 </div>
              </div>

              <hr className="my-12 border-white/10" />

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                 <Layers className="text-purple-500" /> How to Interpret Results
              </h2>
              <div className="space-y-6">
                 <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/10 flex gap-6 items-start">
                    <div className="w-16 h-16 rounded bg-black border border-white/20 shrink-0 flex items-center justify-center">
                        <AlertTriangle className="text-red-500" size={24} />
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-white mb-1">The Black Test (Backlight Bleed)</h3>
                       <p className="text-sm text-neutral-400 mb-2">Use in a dim room. Look for "spotlights" beaming from the bezel.</p>
                       <ul className="text-sm text-neutral-500 list-disc pl-4 space-y-1">
                          <li><strong>LCD/IPS:</strong> It is normal for black to look dark gray.</li>
                          <li><strong>OLED:</strong> Should be perfectly black (pixels off).</li>
                       </ul>
                    </div>
                 </div>

                 <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/10 flex gap-6 items-start">
                    <div className="w-16 h-16 rounded bg-neutral-600 border border-white/20 shrink-0 flex items-center justify-center">
                        <Grid className="text-white/50" size={24} />
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-white mb-1">The 50% Gray Test (DSE)</h3>
                       <p className="text-sm text-neutral-400 mb-2">The "Dirty Screen Effect" (DSE) is most visible here.</p>
                       <p className="text-sm text-neutral-500">
                          Look for faint stationary shadows that look like a dirty window or vertical bands. This is very common in large TVs and can be distracting during sports (panning shots over grass/ice).
                       </p>
                    </div>
                 </div>
              </div>

              {/* Long-tail: Curved & Laptop */}
              <h2 className="text-2xl font-bold text-white mb-6 mt-16 flex items-center gap-2">
                 <Laptop className="text-blue-500" /> Curved Monitors & Laptops
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                 <div>
                    <h3 className="text-lg font-bold text-white mb-2">Curved Monitor Issues</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                       Curved monitors (1500R/1000R) are under immense physical stress. This often causes <strong>"Bat-Signal" bleed</strong> at the top and bottom edges.
                    </p>
                    <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
                       Some bleed is inevitable on aggressive curves. If it does not encroach into the center 50% of the screen, it is usually considered acceptable by manufacturers.
                    </p>
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white mb-2">Laptop Screen Clouding</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                       Thin laptop lids are prone to pressure spots. If you see white blotches in the center of your screen, check if your laptop lid is being pressed by books in a backpack.
                    </p>
                 </div>
              </div>
           </article>

           {/* FAQ Section Visual - Matches Schema */}
           <div className="border-t border-white/10 pt-12">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                 <HelpCircle className="text-blue-400" /> Frequently Asked Questions
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">What is IPS Glow vs Backlight Bleed?</h4>
                    <p className="text-neutral-400 text-sm">IPS Glow changes intensity when you change your viewing angle. Backlight bleed remains static regardless of your viewing position.</p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">How to check for Dirty Screen Effect (DSE)?</h4>
                    <p className="text-neutral-400 text-sm">Use the "Gray 5%" or "Gray 10%" presets. DSE appears as faint vertical bands or patchy clouds on a uniform gray background.</p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">Can backlight bleed be fixed?</h4>
                    <p className="text-neutral-400 text-sm">Sometimes. Gently massaging the area with a microfiber cloth can occasionally reseat the panel layers and reduce bleed caused by bezel pressure. However, severe bleed is a permanent manufacturing defect.</p>
                 </div>
              </div>
           </div>

           {/* Internal Linking */}
           <RelatedArticles currentPath="/tests/uniformity" />
        </section>

        <div className="max-w-7xl mx-auto px-6 w-full">
           <RelatedTools currentPath="/tests/uniformity" />
        </div>
      </div>
    </>
  );
};

export default UniformityTest;