import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { 
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
  CheckCircle2,
  Hand
} from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';
import { Link, useLocation } from 'react-router-dom';
import { RelatedTools } from '../common/RelatedTools';
import { useTestReport } from '../../contexts/TestReportContext';
import { TestGuideOverlay, ReportDialog } from '../common/TestGuideOverlay';
import { FullscreenControls } from '../common/FullscreenControls';
import { useMobile } from '../../hooks/useMobile';

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
  const isMobile = useMobile();
  
  // Context
  const { addResult } = useTestReport();

  // Dialog States
  const [showGuide, setShowGuide] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Test State
  const [colorIndex, setColorIndex] = useState(0);
  const [isAutoCycle, setIsAutoCycle] = useState(false);
  
  // Modes
  const [isStrobeMode, setIsStrobeMode] = useState(false); 
  const [isNoiseMode, setIsNoiseMode] = useState(false);   
  const [isFlashlightMode, setIsFlashlightMode] = useState(false); 
  
  // Helpers
  const [showGrid, setShowGrid] = useState(false); 
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

  const initiateTest = () => {
    setShowGuide(true);
  };

  const startTest = () => {
    setShowGuide(false);
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
    
    // Trigger Report Dialog
    setShowReport(true);
  }, [exitFullscreen]);

  const handleReport = (status: 'pass' | 'fail') => {
    addResult({
      testId: 'dead-pixel',
      testName: 'Dead Pixel Test',
      status,
      timestamp: Date.now()
    });
    setShowReport(false);
  };

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
    setIsStrobeMode(false);
    setIsNoiseMode(false);
    setIsFlashlightMode(prev => !prev);
  };

  const resetModes = () => {
    setIsAutoCycle(false);
    setIsStrobeMode(false);
    setIsNoiseMode(false);
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

  // 2. Strobe Logic
  useEffect(() => {
    if (isStrobeMode) {
      strobeIntervalRef.current = window.setInterval(() => {
        setColorIndex((prev) => (prev + 1) % COLORS.length);
      }, 40); 
    }
    return () => { if (strobeIntervalRef.current) clearInterval(strobeIntervalRef.current); };
  }, [isStrobeMode]);

  // 3. Noise Logic
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
             const val = Math.random() < 0.5 ? 0 : 255; 
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
          if (isStrobeMode || isNoiseMode || isAutoCycle) toggleAutoCycle();
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

  // --- MOBILE GESTURES ---
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    resetControlsTimer();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    // Swipe Threshold
    if (Math.abs(diff) > 50) {
       if (diff > 0) handleNextColor(); // Swipe Left -> Next
       else handlePrevColor(); // Swipe Right -> Prev
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
    const isLightBg = isNoiseMode ? false : (customColor ? true : ['#FFFFFF', '#FFFF00', '#00FFFF', '#808080'].includes(currentColor.hex));
    const uiBaseColor = isLightBg ? 'text-black' : 'text-white';
    const uiBgColor = isLightBg ? 'bg-black/10 hover:bg-black/20' : 'bg-white/10 hover:bg-white/20';
    const buttonClass = (isStrobeMode || isNoiseMode)
        ? 'bg-black/40 hover:bg-black/60 backdrop-blur-md text-white'
        : `${uiBgColor} ${uiBaseColor} backdrop-blur-md`;

    return (
      <div 
        className="fixed inset-0 z-[100] cursor-none select-none transition-none touch-pan-y"
        style={{ backgroundColor: isFlashlightMode ? '#000000' : displayColor }}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          // Only handle click navigation if not interacting with controls
          if ((e.target as HTMLElement).tagName === 'DIV' || (e.target as HTMLElement).tagName === 'CANVAS') {
             if (!isMobile && !isFlashlightMode && !isAutoCycle && !isStrobeMode && !isNoiseMode) handleNextColor();
          }
        }}
      >
        {/* Universal Exit Button (Hover top to show) */}
        <FullscreenControls onExit={stopTest} title="Dead Pixel Test" visible={!isMobile} />

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
           />
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

        {/* Mobile Swipe Hint */}
        {isMobile && showControls && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 pointer-events-none flex flex-col items-center animate-pulse">
              <Hand size={48} />
              <span className="text-xs font-bold mt-2">SWIPE</span>
           </div>
        )}

        {/* Bottom HUD */}
        <div className={`
          absolute bottom-10 left-1/2 -translate-x-1/2 
          flex flex-col items-center gap-4
          transition-all duration-500 ease-out
          ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}
        `}>
          
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            
            {/* Auto Cycle */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleAutoCycle(); }}
              className={`p-3 rounded-xl transition-all ${isAutoCycle ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
            >
              {isAutoCycle ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>

            <div className="w-px h-8 bg-white/10 mx-1" />

            {/* Colors */}
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
                />
              ))}
            </div>
            
            {/* Custom */}
            <div className="relative group">
                <input 
                    ref={colorInputRef}
                    type="color" 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={handleColorPick}
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

            {/* Tools */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleStrobeMode(); }}
              className={`p-3 rounded-xl transition-all ${isStrobeMode ? 'bg-red-500 text-white animate-pulse' : 'text-neutral-400 hover:text-red-400 hover:bg-white/10'}`}
            >
              <Zap size={20} fill={isStrobeMode ? "currentColor" : "none"} />
            </button>

            {!isMobile && (
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFlashlight(); }}
                className={`p-3 rounded-xl transition-all ${isFlashlightMode ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
              >
                <Flashlight size={20} />
              </button>
            )}

            {/* Mobile Exit (Since no top-hover) */}
            {isMobile && (
               <button 
                 onClick={(e) => { e.stopPropagation(); stopTest(); }}
                 className="p-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 border-l border-white/10 ml-1"
               >
                 Exit
               </button>
            )}

          </div>
        </div>
      </div>
    );
  }

  // --- Landing View ---
  return (
    <>
      <SEO 
        title={isHome ? "Dead Pixel Test - Free Screen Check & Monitor Calibration" : "Dead Pixel Test & Fixer"}
        description="Instantly check your screen for dead pixels, backlight bleed, and ghosting. The best free online monitor test tool for PC & Mobile. No download needed."
        canonical={isHome ? '/' : '/tests/dead-pixel'}
        breadcrumbs={isHome ? [] : [{ name: 'Home', path: '/' }, { name: 'Dead Pixel Test', path: '/tests/dead-pixel' }]}
        disableSuffix={isHome}
      />
      
      {showGuide && (
        <TestGuideOverlay 
          title="Dead Pixel Test Guide"
          instructions={[
            "Clean your screen thoroughly before starting the Dead Pixel Test.",
            "We will cycle through full-screen colors (Black, White, Red, Green, Blue).",
            "On Black screens, look for 'stuck' pixels (tiny red/green/blue dots).",
            "On White screens, look for 'dead' pixels (black dots).",
            isMobile ? "Swipe Left/Right to change colors." : "Use Arrow Keys or click to change colors."
          ]}
          onStart={startTest}
        />
      )}

      {showReport && (
        <ReportDialog 
          testName="Dead Pixel Test"
          onResult={handleReport}
          onRetry={() => { setShowReport(false); startTest(); }}
        />
      )}

      <div className="flex flex-col min-h-screen">
        <TestIntro
          title="Dead Pixel Test"
          description="The #1 industry-standard Dead Pixel Test tool. Accurately detect screen defects on any monitor or smartphone. Our comprehensive Dead Pixel Test includes solid color patterns, Flashlight inspection, and specialized repair tools."
          onStart={initiateTest}
          footerText="Press F11 for Best Experience"
        >
          <InfoCard title="Dead Pixel Test: Defects">
            <div className="space-y-3">
              <p className="text-sm"><strong className="text-white">Dead Pixel:</strong> Black spot. Transistor off.</p>
              <p className="text-sm"><strong className="text-red-400">Stuck Pixel:</strong> Red/Green/Blue spot. Transistor stuck.</p>
              <Link to="/blog/dead-pixel-vs-stuck-pixel-ultimate-guide" className="text-xs text-blue-400 hover:text-blue-300 underline block mt-2">Read our repair guide &rarr;</Link>
            </div>
          </InfoCard>

          <InfoCard title="Dead Pixel Test Controls">
            <ul className="space-y-2 text-sm text-neutral-400 font-mono">
              <li><span className="text-white">{isMobile ? 'SWIPE' : 'CLICK'}</span> : Next Color</li>
              <li><span className="text-white">{isMobile ? 'DOUBLE TAP' : 'SPACE'}</span> : Auto Cycle</li>
              {!isMobile && <li><span className="text-white">F / G</span> : Flashlight / Grid</li>}
            </ul>
          </InfoCard>
        </TestIntro>

        <section className="max-w-4xl mx-auto px-6 py-16 space-y-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           <div className="grid md:grid-cols-2 gap-12">
              <div>
                 <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Info className="text-blue-500" /> Why run a Dead Pixel Test?
                 </h2>
                 <p className="text-neutral-400 leading-relaxed mb-4">
                    A <strong>Dead Pixel Test</strong> is the only way to verify your screen's health. A dead pixel occurs when a transistor fails to supply power, causing the pixel to remain permanently black. This is most noticeable on white backgrounds during the test.
                 </p>
              </div>
              <div>
                 <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="text-yellow-500" /> Fixing Dead Pixel Test Results
                 </h2>
                 <p className="text-neutral-400 leading-relaxed mb-4">
                    If your <strong>Dead Pixel Test</strong> reveals stuck pixels (Red/Green/Blue dots), they can often be fixed. Use the <span className="text-white font-bold">Strobe</span> tool to massage the liquid crystal back into place.
                 </p>
              </div>
           </div>
           
           <div className="flex gap-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
              <AlertTriangle className="text-red-500 shrink-0" />
              <p className="text-xs text-red-200/80 leading-relaxed">
                 <strong>Health Warning:</strong> The Strobe and Noise repair tools create rapidly flashing lights. Do not use if you suffer from photosensitive epilepsy.
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