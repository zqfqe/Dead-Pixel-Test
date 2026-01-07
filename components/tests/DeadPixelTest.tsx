import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { 
  ChevronLeft, 
  Play, 
  Pause, 
  Flashlight, 
  Zap, 
  Palette,
  Grid3X3,
  Waves,
  Info,
  ShieldCheck,
  AlertTriangle,
  Monitor,
  Activity,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';
import { Link, useLocation } from 'react-router-dom';
import { RelatedTools } from '../common/RelatedTools';

// Standard pattern for pixel testing
const COLORS = [
  { hex: '#000000', name: 'Black' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#FF0000', name: 'Red' },
  { hex: '#00FF00', name: 'Green' },
  { hex: '#0000FF', name: 'Blue' },
  { hex: '#FFFF00', name: 'Yellow' },
  { hex: '#00FFFF', name: 'Cyan' },
  { hex: '#FF00FF', name: 'Magenta' },
  { hex: '#808080', name: '50% Gray' }
];

const DeadPixelTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  // Test State
  const [colorIndex, setColorIndex] = useState(0);
  const [isAutoCycle, setIsAutoCycle] = useState(false);
  
  // Modes
  const [isStrobeMode, setIsStrobeMode] = useState(false); // Repair Mode 1: Color Cycle
  const [isNoiseMode, setIsNoiseMode] = useState(false);   // Repair Mode 2: White Noise
  const [isFlashlightMode, setIsFlashlightMode] = useState(false); // Inspection Mode
  
  // Helpers
  const [showGrid, setShowGrid] = useState(false); // Focus Assist
  const [flashlightSize, setFlashlightSize] = useState(200);
  const [customColor, setCustomColor] = useState<string | null>(null);

  // UI State
  const [showControls, setShowControls] = useState(true);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  
  // Refs
  const controlsTimeoutRef = useRef<number | null>(null);
  const autoCycleIntervalRef = useRef<number | null>(null);
  const strobeIntervalRef = useRef<number | null>(null);
  const noiseReqRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef<number | null>(null);

  // --- Handlers ---

  const startTest = () => {
    setIsActive(true);
    enterFullscreen();
    resetControlsTimer();
  };

  const stopTest = useCallback(() => {
    setIsActive(false);
    setIsAutoCycle(false);
    setIsFlashlightMode(false);
    setIsStrobeMode(false);
    setIsNoiseMode(false);
    setShowGrid(false);
    setCustomColor(null);
    exitFullscreen();
  }, [exitFullscreen]);

  const handleNextColor = useCallback(() => {
    setCustomColor(null);
    setColorIndex((prev) => (prev + 1) % COLORS.length);
  }, []);

  const handlePrevColor = useCallback(() => {
    setCustomColor(null);
    setColorIndex((prev) => (prev - 1 + COLORS.length) % COLORS.length);
  }, []);

  const toggleAutoCycle = () => {
    resetModes();
    setIsAutoCycle(prev => !prev);
  };

  const toggleStrobeMode = () => {
    const newVal = !isStrobeMode;
    resetModes();
    if (newVal) setIsStrobeMode(true);
  };

  const toggleNoiseMode = () => {
    const newVal = !isNoiseMode;
    resetModes();
    if (newVal) setIsNoiseMode(true);
  };

  const toggleFlashlight = () => {
    // Flashlight can coexist with colors, but not noise/strobe
    setIsStrobeMode(false);
    setIsNoiseMode(false);
    setIsFlashlightMode(prev => !prev);
  };

  const resetModes = () => {
    setIsAutoCycle(false);
    setIsStrobeMode(false);
    setIsNoiseMode(false);
    // We don't necessarily reset Flashlight or Grid as they are overlays/tools
  };

  const handleColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
    resetModes();
    setIsFlashlightMode(false);
  };

  // --- Effects ---

  // 1. Auto Cycle Logic
  useEffect(() => {
    if (isAutoCycle) {
      autoCycleIntervalRef.current = window.setInterval(handleNextColor, 1500);
    }
    return () => { if (autoCycleIntervalRef.current) clearInterval(autoCycleIntervalRef.current); };
  }, [isAutoCycle, handleNextColor]);

  // 2. Strobe Logic (High Speed)
  useEffect(() => {
    if (isStrobeMode) {
      strobeIntervalRef.current = window.setInterval(() => {
        setColorIndex((prev) => (prev + 1) % COLORS.length);
      }, 40); 
    }
    return () => { if (strobeIntervalRef.current) clearInterval(strobeIntervalRef.current); };
  }, [isStrobeMode]);

  // 3. Noise Logic (Canvas)
  useEffect(() => {
    if (isNoiseMode && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const resize = () => {
          if (canvasRef.current) {
             canvasRef.current.width = window.innerWidth;
             canvasRef.current.height = window.innerHeight;
          }
      };
      window.addEventListener('resize', resize);
      resize();

      if (!ctx) return;

      const drawNoise = () => {
         const w = ctx.canvas.width;
         const h = ctx.canvas.height;
         const idata = ctx.createImageData(w, h);
         const buffer32 = new Uint32Array(idata.data.buffer);
         const len = buffer32.length;

         for (let i = 0; i < len; i++) {
             // Random grayscale noise
             const val = Math.random() < 0.5 ? 0 : 255; 
             // ABGR format (little endian) -> Alpha, Blue, Green, Red
             // Full opacity (0xFF000000) | Blue | Green | Red
             buffer32[i] = 0xFF000000 | (val << 16) | (val << 8) | val;
         }
         ctx.putImageData(idata, 0, 0);
         noiseReqRef.current = requestAnimationFrame(drawNoise);
      };

      drawNoise();
      return () => {
         window.removeEventListener('resize', resize);
         if (noiseReqRef.current) cancelAnimationFrame(noiseReqRef.current);
      };
    }
  }, [isNoiseMode]);

  // 4. Keyboard Navigation
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimer();
      
      // Number keys 1-9
      if (e.key >= '1' && e.key <= '9') {
          const idx = parseInt(e.key) - 1;
          if (idx < COLORS.length) {
              resetModes();
              setCustomColor(null);
              setColorIndex(idx);
          }
          return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case ' ': 
          if (isStrobeMode || isNoiseMode || isAutoCycle) toggleAutoCycle(); // Stop weird modes
          else handleNextColor();
          break;
        case 'ArrowLeft':
          handlePrevColor();
          break;
        case 'f':
        case 'F':
          toggleFlashlight();
          break;
        case 'g':
        case 'G':
          setShowGrid(prev => !prev);
          break;
        case 'Escape':
          stopTest();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isAutoCycle, isStrobeMode, isNoiseMode, handleNextColor, handlePrevColor, stopTest]);

  // 5. Mouse & Touch
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    resetControlsTimer();
  }, [resetControlsTimer]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (isFlashlightMode) {
       setFlashlightSize(prev => Math.max(50, Math.min(800, prev + (e.deltaY > 0 ? -20 : 20))));
    }
  }, [isFlashlightMode]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    resetControlsTimer();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
       if (diff > 0) handleNextColor(); 
       else handlePrevColor(); 
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
  }, []);

  // --- Render Active Test ---
  if (isActive) {
    const currentColor = COLORS[colorIndex];
    const displayColor = customColor || currentColor.hex;
    
    // UI Contrast Calc
    const isLightBg = isNoiseMode ? false : (customColor ? true : ['#FFFFFF', '#FFFF00', '#00FFFF', '#808080'].includes(currentColor.hex));
    const uiBaseColor = isLightBg ? 'text-black' : 'text-white';
    const uiBgColor = isLightBg ? 'bg-black/10 hover:bg-black/20' : 'bg-white/10 hover:bg-white/20';

    // Strobe/Noise override
    const containerClass = (isStrobeMode || isNoiseMode) ? 'text-white' : uiBaseColor;
    const buttonClass = (isStrobeMode || isNoiseMode)
        ? 'bg-black/40 hover:bg-black/60 backdrop-blur-md text-white'
        : `${uiBgColor} ${uiBaseColor} backdrop-blur-md`;

    return (
      <div 
        className="fixed inset-0 z-[100] cursor-none select-none transition-none touch-none"
        style={{ backgroundColor: isFlashlightMode ? '#000000' : displayColor }}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName === 'DIV' || (e.target as HTMLElement).tagName === 'CANVAS') {
             if (!isFlashlightMode && !isAutoCycle && !isStrobeMode && !isNoiseMode) handleNextColor();
          }
        }}
      >
        {/* Noise Canvas */}
        {isNoiseMode && (
           <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        )}

        {/* Alignment Grid Overlay */}
        {showGrid && (
           <div 
             className="absolute inset-0 pointer-events-none opacity-20"
             style={{
               backgroundImage: `
                 linear-gradient(to right, ${isLightBg ? '#000' : '#fff'} 1px, transparent 1px),
                 linear-gradient(to bottom, ${isLightBg ? '#000' : '#fff'} 1px, transparent 1px)
               `,
               backgroundSize: '33.33% 33.33%'
             }}
           >
             <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-4 h-4 border ${isLightBg ? 'border-black' : 'border-white'} rounded-full`} />
             </div>
           </div>
        )}

        {/* Flashlight Element */}
        {isFlashlightMode && (
          <div 
            className="fixed pointer-events-none border-2 border-white/50 bg-white shadow-[0_0_100px_rgba(255,255,255,0.5)] rounded-full mix-blend-overlay"
            style={{ 
              width: `${flashlightSize}px`,
              height: `${flashlightSize}px`,
              top: mousePos.y, 
              left: mousePos.x, 
              transform: 'translate(-50%, -50%)' 
            }}
          />
        )}

        {/* Top Left: Exit */}
        <div className={`absolute top-6 left-6 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={(e) => { e.stopPropagation(); stopTest(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${buttonClass}`}
          >
            <ChevronLeft size={16} />
            <span>Exit (Esc)</span>
          </button>
        </div>

        {/* Top Right: Status */}
        <div className={`absolute top-6 right-6 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`flex flex-col items-end gap-2`}>
             <div className={`px-4 py-2 rounded-full font-mono text-xs font-bold ${buttonClass} flex items-center gap-2`}>
                {isStrobeMode && <Zap size={12} className="text-yellow-400 fill-current" />}
                {isNoiseMode && <Waves size={12} className="text-blue-400" />}
                {isStrobeMode ? 'STROBE MODE' : isNoiseMode ? 'WHITE NOISE' : isFlashlightMode ? 'FLASHLIGHT' : customColor ? 'CUSTOM COLOR' : currentColor.name.toUpperCase()}
             </div>
             {(isFlashlightMode) && (
               <div className="text-[10px] opacity-70 font-mono tracking-wider bg-black/40 px-2 py-1 rounded text-white">
                 SCROLL TO RESIZE
               </div>
             )}
          </div>
        </div>

        {/* Bottom HUD */}
        <div className={`
          absolute bottom-10 left-1/2 -translate-x-1/2 
          flex flex-col items-center gap-4
          transition-all duration-500 ease-out
          ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}
        `}>
          
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            
            {/* Group 1: Auto Cycle */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleAutoCycle(); }}
              className={`p-3 rounded-xl transition-all ${isAutoCycle ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
              title="Auto Cycle (Space)"
            >
              {isAutoCycle ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>

            <div className="w-px h-8 bg-white/10 mx-1" />

            {/* Group 2: Colors */}
            <div className="flex items-center gap-1.5 px-2">
              {COLORS.map((c, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    resetModes();
                    setCustomColor(null);
                    setColorIndex(idx); 
                  }}
                  className={`
                    w-6 h-6 rounded-md border transition-all duration-200
                    ${!customColor && colorIndex === idx && !isFlashlightMode && !isStrobeMode && !isNoiseMode ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black z-10' : 'border-white/10 hover:scale-110 opacity-70 hover:opacity-100'}
                  `}
                  style={{ backgroundColor: c.hex }}
                  title={`${c.name} (${idx + 1})`}
                />
              ))}
            </div>
            
            {/* Custom Color */}
            <div className="relative group">
                <input 
                    ref={colorInputRef}
                    type="color" 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={handleColorPick}
                    title="Custom Color"
                />
                <button 
                    className={`
                        w-6 h-6 rounded-md border transition-all duration-200 flex items-center justify-center
                        ${customColor && !isFlashlightMode ? 'bg-white text-black scale-125' : 'border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'}
                    `}
                >
                    <Palette size={14} />
                </button>
            </div>

            <div className="w-px h-8 bg-white/10 mx-1" />

            {/* Group 3: Repair Tools */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleStrobeMode(); }}
              className={`p-3 rounded-xl transition-all ${isStrobeMode ? 'bg-red-500 text-white animate-pulse' : 'text-neutral-400 hover:text-red-400 hover:bg-white/10'}`}
              title="Fixer: RGB Strobe"
            >
              <Zap size={20} fill={isStrobeMode ? "currentColor" : "none"} />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); toggleNoiseMode(); }}
              className={`p-3 rounded-xl transition-all ${isNoiseMode ? 'bg-blue-500 text-white' : 'text-neutral-400 hover:text-blue-400 hover:bg-white/10'}`}
              title="Fixer: White Noise"
            >
              <Waves size={20} />
            </button>

            <div className="w-px h-8 bg-white/10 mx-1" />

            {/* Group 4: Assist Tools */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFlashlight(); }}
              className={`p-3 rounded-xl transition-all ${isFlashlightMode ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
              title="Flashlight Mode (F)"
            >
              <Flashlight size={20} />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); setShowGrid(prev => !prev); }}
              className={`p-3 rounded-xl transition-all ${showGrid ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
              title="Alignment Grid (G)"
            >
              <Grid3X3 size={20} />
            </button>

          </div>
        </div>
      </div>
    );
  }

  // --- Landing View with SEO Content ---
  return (
    <>
      <SEO 
        title={isHome ? "Dead Pixel Test - Free Screen Check & Monitor Calibration" : "Dead Pixel Test & Fixer"}
        description="Instantly check your screen for dead pixels, backlight bleed, and ghosting. The best free online monitor test tool for PC & Mobile. No download needed."
        canonical={isHome ? '/' : '/tests/dead-pixel'}
        breadcrumbs={isHome ? [] : [
          { name: 'Home', path: '/' },
          { name: 'Dead Pixel Test', path: '/tests/dead-pixel' }
        ]}
        keywords={['dead pixel test', 'stuck pixel fixer', 'screen test', 'monitor calibration', 'check monitor for defects', 'pixel repair', 'screen health check']}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SoftwareApplication",
              "name": "Dead Pixel Test & Fixer",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
              "featureList": "Dead Pixel Locator, Stuck Pixel Fixer, Screen Burn-in Check"
            },
            {
              "@type": "HowTo",
              "name": "How to Run a Dead Pixel Test",
              "step": [
                { "@type": "HowToStep", "text": "Clean your screen thoroughly to remove dust." },
                { "@type": "HowToStep", "text": "Start the Dead Pixel Test to enter fullscreen mode." },
                { "@type": "HowToStep", "text": "Cycle through the Red, Green, Blue, Black, and White screens." },
                { "@type": "HowToStep", "text": "Inspect the screen closely for any dead (black) or stuck (colored) pixels." }
              ]
            },
            {
              "@type": "FAQPage",
              "mainEntity": [{
                "@type": "Question",
                "name": "What is the difference between a dead and stuck pixel?",
                "acceptedAnswer": { "@type": "Answer", "text": "A dead pixel is permanently off (black), typically caused by a failed transistor. A stuck pixel is frozen on a specific color (Red, Green, or Blue) and can often be fixed with software." }
              }, {
                "@type": "Question",
                "name": "How do I fix a stuck pixel using this test?",
                "acceptedAnswer": { "@type": "Answer", "text": "Use the 'Strobe' or 'White Noise' tool on this page. Run it over the stuck area for 10-60 minutes to stimulate the liquid crystals." }
              }]
            }
          ]
        }}
      />
      <div className="flex flex-col min-h-screen">
        <TestIntro
          title="Dead Pixel Test"
          description="The industry standard Dead Pixel Test tool. Check for dead or stuck pixels with solid color patterns. Includes Flashlight inspection and Stuck Pixel Repair modes."
          onStart={startTest}
          footerText="Press F11 for Best Experience"
        >
          <InfoCard title="Pixel Defects">
            <div className="space-y-3">
              <p className="text-sm"><strong className="text-white">Dead Pixel:</strong> Black spot. Transistor off. Hard to fix.</p>
              <p className="text-sm"><strong className="text-red-400">Stuck Pixel:</strong> Red/Green/Blue spot. Transistor stuck. Can often be fixed using the <strong>Strobe</strong> or <strong>Noise</strong> tools within this <strong>Dead Pixel Test</strong>.</p>
              <Link to="/blog/dead-pixel-vs-stuck-pixel-ultimate-guide" className="text-xs text-blue-400 hover:text-blue-300 underline block mt-2">Read our repair guide &rarr;</Link>
            </div>
          </InfoCard>

          <InfoCard title="Pro Controls">
            <ul className="space-y-2 text-sm text-neutral-400 font-mono">
              <li><span className="text-white">SPACE</span> : Auto Cycle</li>
              <li><span className="text-white">1 - 9</span> : Direct Color</li>
              <li><span className="text-white">F / G</span> : Flashlight / Grid</li>
              <li><span className="text-white">Swipe</span> : Next/Prev Color</li>
            </ul>
          </InfoCard>
        </TestIntro>

        {/* Deep SEO Content Section */}
        <section className="max-w-4xl mx-auto px-6 py-16 space-y-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           
           <div className="grid md:grid-cols-2 gap-12">
              <div>
                 <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Info className="text-blue-500" /> What is a Dead Pixel?
                 </h2>
                 <p className="text-neutral-400 leading-relaxed mb-4">
                    A dead pixel occurs when a transistor in your monitor's panel fails to supply power, causing the pixel to remain permanently black. This is most noticeable on white backgrounds.
                 </p>
                 <p className="text-neutral-400 leading-relaxed">
                    The most effective way to spot these defects is by running a full-screen <strong>dead pixel test</strong>. Unlike stuck pixels, dead pixels are rarely fixable via software. However, dust trapped behind the glass can often look like a dead pixel. Use our <strong>Flashlight Mode</strong> to check if the spot casts a shadow (indicating dust).
                 </p>
              </div>
              <div>
                 <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="text-yellow-500" /> How to Fix Stuck Pixels
                 </h2>
                 <p className="text-neutral-400 leading-relaxed mb-4">
                    Stuck pixels are frozen in an "on" state (Red, Green, or Blue). This means the liquid crystal is jammed but the transistor is working.
                 </p>
                 <p className="text-neutral-400 leading-relaxed">
                    <strong>The Fix:</strong> Launch the <strong>dead pixel test</strong> and select the <span className="text-white font-bold">Strobe</span> or <span className="text-white font-bold">Noise</span> tool. Drag the flashing box over the stuck pixel and leave it for 10-20 minutes. The rapid voltage changes generated by the tool can often unstick the crystal.
                 </p>
              </div>
           </div>

           {/* New Educational Section to increase keyword density naturally */}
           <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                 <CheckCircle2 className="text-green-500" /> Why Run a Dead Pixel Test?
              </h2>
              <div className="space-y-4 text-neutral-400 leading-relaxed">
                 <p>
                    Performing a <strong>dead pixel test</strong> is crucial whenever you purchase a new monitor, laptop, or TV. Manufacturers often have a "return window" (typically 14-30 days) where you can exchange a defective panel.
                 </p>
                 <p>
                    By running our <strong>dead pixel test</strong> immediately after unboxing, you can identify defects that might be invisible during normal use but will become annoying later. A proper <strong>dead pixel test</strong> cycles through primary colors (Red, Green, Blue) to check each sub-pixel individually, ensuring your screen is 100% perfect.
                 </p>
              </div>
           </div>

           {/* --- NEW SECTION: COMPLETE HEALTH CHECK --- */}
           <div className="border-t border-white/10 pt-16">
              <h2 className="text-3xl font-bold text-center text-white mb-10">Beyond the Dead Pixel Test: Complete Monitor Check</h2>
              <p className="text-center text-neutral-400 max-w-2xl mx-auto mb-10">
                 A perfect panel requires more than just working pixels. After completing the <strong>dead pixel test</strong>, use these essential tools to verify your monitor's overall quality before the return window closes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Link to="/tests/uniformity" className="group bg-neutral-900/50 hover:bg-neutral-900 border border-white/10 p-6 rounded-xl transition-all hover:border-blue-500/30">
                    <div className="bg-blue-900/20 w-12 h-12 rounded-lg flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                       <Monitor size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Backlight Bleed</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                       Check for uneven lighting or "clouding" on dark screens. Essential for IPS and VA panels.
                    </p>
                 </Link>
                 
                 <Link to="/tests/response-time" className="group bg-neutral-900/50 hover:bg-neutral-900 border border-white/10 p-6 rounded-xl transition-all hover:border-green-500/30">
                    <div className="bg-green-900/20 w-12 h-12 rounded-lg flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
                       <Activity size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Ghosting & Motion</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                       Test pixel response times. Look for trails behind moving objects, critical for high-refresh gaming.
                    </p>
                 </Link>

                 <Link to="/tests/color-gradient" className="group bg-neutral-900/50 hover:bg-neutral-900 border border-white/10 p-6 rounded-xl transition-all hover:border-purple-500/30">
                    <div className="bg-purple-900/20 w-12 h-12 rounded-lg flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                       <Layers size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Color Banding</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                       Verify 8-bit/10-bit color depth. Ensure gradients are smooth without ugly steps or lines.
                    </p>
                 </Link>
              </div>
           </div>

           <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-8 mt-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                 <ShieldCheck className="text-green-500" /> ISO 9241-307 Warranty Standard
              </h2>
              <p className="text-neutral-400 mb-6">
                 Most manufacturers follow the ISO 9241-307 standard (formerly ISO 13406-2) to determine if a monitor is eligible for return based on the results of a <strong>dead pixel test</strong>.
              </p>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-neutral-400">
                    <thead className="bg-white/5 text-white uppercase font-bold text-xs tracking-wider">
                       <tr>
                          <th className="p-4 rounded-tl-lg">Class</th>
                          <th className="p-4">Description</th>
                          <th className="p-4 rounded-tr-lg">Defects Allowed (per million pixels)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       <tr>
                          <td className="p-4 font-bold text-white">Class 0</td>
                          <td className="p-4">Medical / Military Grade</td>
                          <td className="p-4">0 Defects</td>
                       </tr>
                       <tr>
                          <td className="p-4 font-bold text-white">Class 1</td>
                          <td className="p-4">Premium Consumer</td>
                          <td className="p-4">1 Bright / 1 Dark</td>
                       </tr>
                       <tr className="bg-white/5">
                          <td className="p-4 font-bold text-white">Class 2</td>
                          <td className="p-4">Standard (Most Monitors)</td>
                          <td className="p-4">2 Bright / 5 Dark</td>
                       </tr>
                       <tr>
                          <td className="p-4 font-bold text-white">Class 3</td>
                          <td className="p-4">Economy / Industrial</td>
                          <td className="p-4">5 Bright / 15 Dark</td>
                       </tr>
                    </tbody>
                 </table>
              </div>
              <p className="text-xs text-neutral-500 mt-4">
                 *Always check your specific manufacturer's "Zero Bright Dot" guarantee. If your <strong>dead pixel test</strong> reveals even one bright pixel on a Class 1 monitor, you are usually entitled to a replacement.
              </p>
           </div>

           {/* Epilepsy Warning */}
           <div className="flex gap-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
              <AlertTriangle className="text-red-500 shrink-0" />
              <p className="text-xs text-red-200/80 leading-relaxed">
                 <strong>Health Warning:</strong> The Strobe and Noise repair tools create rapidly flashing lights. Do not use these modes if you or anyone in the room suffers from photosensitive epilepsy.
              </p>
           </div>

        </section>

        <div className="max-w-7xl mx-auto px-6 w-full">
           <RelatedTools currentPath="/tests/dead-pixel" />
        </div>
      </div>
    </>
  );
};

export default DeadPixelTest;