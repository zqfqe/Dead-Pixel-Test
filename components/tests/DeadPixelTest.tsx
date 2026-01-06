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
  Waves
} from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';
import { Link } from 'react-router-dom';

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

  // --- Landing View ---
  return (
    <>
      <SEO 
        title="Dead Pixel Test" 
        description="The #1 Dead Pixel Test. Check your monitor for dead or stuck pixels. Includes repair tools like RGB flashing and white noise."
        canonical="/tests/dead-pixel"
        keywords={['dead pixel test', 'stuck pixel fixer', 'screen test', 'monitor calibration', 'white screen']}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SoftwareApplication",
              "name": "Dead Pixel Test & Fixer",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": "Dead Pixel Locator, Stuck Pixel Fixer, Screen Burn-in Check"
            },
            {
              "@type": "FAQPage",
              "mainEntity": [{
                "@type": "Question",
                "name": "What is the difference between a dead and stuck pixel?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A dead pixel is permanently off (black), typically caused by a failed transistor. A stuck pixel is frozen on a specific color (Red, Green, or Blue) and can often be fixed with software."
                }
              }, {
                "@type": "Question",
                "name": "How do I fix a stuck pixel?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Use the 'Strobe' or 'White Noise' tool on this page. Run it over the stuck area for 10-60 minutes to stimulate the liquid crystals."
                }
              }]
            },
            {
              "@type": "HowTo",
              "name": "How to Check for Dead Pixels",
              "step": [
                { "@type": "HowToStep", "text": "Clean your screen with a microfiber cloth." },
                { "@type": "HowToStep", "text": "Click 'Start Test' to enter fullscreen mode." },
                { "@type": "HowToStep", "text": "Use the arrow keys or click to cycle through solid colors (Red, Green, Blue, White, Black)." },
                { "@type": "HowToStep", "text": "Inspect the screen closely for any dots that do not match the background color." }
              ]
            }
          ]
        }}
      />
      <TestIntro
        title="Dead Pixel Test"
        description="The industry standard diagnostic suite. Includes solid color tests, Flashlight inspection, and advanced Stuck Pixel Repair modes (Strobe & Noise)."
        onStart={startTest}
        footerText="Press F11 for Best Experience"
      >
        <InfoCard title="Pixel Defects">
          <div className="space-y-3">
            <p className="text-sm"><strong className="text-white">Dead Pixel:</strong> Black spot. Transistor off. Hard to fix.</p>
            <p className="text-sm"><strong className="text-red-400">Stuck Pixel:</strong> Red/Green/Blue spot. Transistor stuck. Can often be fixed using the <strong>Strobe</strong> or <strong>Noise</strong> tools.</p>
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
    </>
  );
};

export default DeadPixelTest;