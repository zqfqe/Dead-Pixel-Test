import React, { useState, useEffect, useRef } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useIdleCursor } from '../../hooks/useIdleCursor';
import { Play, Pause, RotateCcw, Zap, Monitor, Clock, ChevronLeft, AlertTriangle } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';
import { FullscreenControls } from '../common/FullscreenControls';

type Mode = 'cycle' | 'noise' | 'scan';

const BurnInWiper: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  const isIdle = useIdleCursor(3000);
  
  // Settings
  const [mode, setMode] = useState<Mode>('cycle');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reqRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const startTest = () => {
    setIsActive(true);
    setTimeLeft(durationMinutes * 60);
    enterFullscreen();
  };

  const stopTest = () => {
    setIsActive(false);
    exitFullscreen();
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive]);

  // Formatting Time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Render Loop
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Resize
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let frameCount = 0;
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#00FFFF', '#FF00FF', '#FFFF00'];
    
    // Scan Line Vars
    let scanY = 0;
    const scanSpeed = 8;

    // Noise Buffer (Optimization)
    const w = canvas.width;
    const h = canvas.height;
    // We create a smaller noise buffer and scale it up to save CPU/Battery
    const scale = 2; 
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = w / scale;
    noiseCanvas.height = h / scale;
    const noiseCtx = noiseCanvas.getContext('2d', { alpha: false });
    const noiseData = noiseCtx?.createImageData(noiseCanvas.width, noiseCanvas.height);
    const buffer32 = new Uint32Array(noiseData!.data.buffer);

    const render = () => {
      frameCount++;

      if (mode === 'cycle') {
        // Change color every 30 frames (approx 0.5s at 60hz)
        const colorIdx = Math.floor(frameCount / 30) % colors.length;
        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(0, 0, w, h);
      } 
      else if (mode === 'scan') {
        // Clear slightly to create trail or just clear
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, scanY, w, 20); // 20px white bar
        
        scanY += scanSpeed;
        if (scanY > h) scanY = -20;
      }
      else if (mode === 'noise') {
        // Optimized Noise
        if (noiseCtx && noiseData) {
            const len = buffer32.length;
            for (let i = 0; i < len; i++) {
                // Random grayscale noise
                const val = Math.random() < 0.5 ? 0 : 255;
                buffer32[i] = 0xFF000000 | (val << 16) | (val << 8) | val;
            }
            noiseCtx.putImageData(noiseData, 0, 0);
            ctx.imageSmoothingEnabled = false; // Nearest neighbor scaling
            ctx.drawImage(noiseCanvas, 0, 0, w, h);
        }
      }

      reqRef.current = requestAnimationFrame(render);
    };

    reqRef.current = requestAnimationFrame(render);

    return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); };
  }, [isActive, mode]);

  if (isActive) {
    return (
      <div className={`fixed inset-0 z-50 bg-black overflow-hidden ${isIdle ? 'cursor-none' : ''}`}>
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        <FullscreenControls onExit={stopTest} title={`Wiper: ${mode.toUpperCase()} (${formatTime(timeLeft)})`} visible={!isIdle} />

        {/* Floating Timer (Only visible when active, not idle) */}
        {!isIdle && (
           <div className="absolute top-6 right-6 bg-black/50 backdrop-blur border border-white/20 text-white font-mono px-4 py-2 rounded-lg pointer-events-none">
              Time Remaining: {formatTime(timeLeft)}
           </div>
        )}
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="OLED Burn-In Wiper - Screen Fixer Tool" 
        description="Fix image retention and reduce OLED burn-in with this professional screen conditioning tool. Features color cycling, white noise, and pixel refresh patterns."
        canonical="/tools/burn-in-wiper"
        keywords={['oled burn in fix', 'screen wiper', 'image retention fix', 'pixel refresher', 'oled screen repair', 'burn in remover']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Burn-in Wiper', path: '/tools/burn-in-wiper' }
        ]}
      />
      <div className="flex flex-col min-h-screen">
        <TestIntro
          title="OLED Burn-in Wiper"
          description="A specialized tool to condition OLED and Plasma screens. Helps reduce image retention and stuck pixels by exercising all sub-pixels evenly."
          startButtonText="Launch Wiper"
          onStart={startTest}
        >
          <InfoCard title="How it Works">
            <p>
              This tool cycles through primary colors and noise patterns to force every pixel to change state rapidly. This can help "wash away" temporary image retention (ghost images) left by static UI elements.
            </p>
          </InfoCard>
          <InfoCard title="Warning">
            <p>
              This tool creates rapidly flashing lights. <strong>Do not use if you have photosensitive epilepsy.</strong> For best results, run for at least 15 minutes.
            </p>
          </InfoCard>
        </TestIntro>

        <section className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           
           {/* Controls Card */}
           <div className="bg-neutral-900/50 border border-white/10 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <Zap className="text-yellow-500" /> Configuration
              </h3>

              <div className="space-y-8">
                 {/* Mode Select */}
                 <div className="space-y-3">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Repair Pattern</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <button 
                         onClick={() => setMode('cycle')}
                         className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${mode === 'cycle' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-black/20 border-white/10 text-neutral-400 hover:bg-white/5'}`}
                       >
                          <RotateCcw size={24} />
                          <span className="font-bold">Color Cycle</span>
                          <span className="text-[10px] opacity-70">Best for general maintenance</span>
                       </button>
                       <button 
                         onClick={() => setMode('noise')}
                         className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${mode === 'noise' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-black/20 border-white/10 text-neutral-400 hover:bg-white/5'}`}
                       >
                          <Monitor size={24} />
                          <span className="font-bold">Static Noise</span>
                          <span className="text-[10px] opacity-70">For stuck pixels & retention</span>
                       </button>
                       <button 
                         onClick={() => setMode('scan')}
                         className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${mode === 'scan' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-black/20 border-white/10 text-neutral-400 hover:bg-white/5'}`}
                       >
                          <Play size={24} />
                          <span className="font-bold">Scan Bar</span>
                          <span className="text-[10px] opacity-70">Horizontal band sweep</span>
                       </button>
                    </div>
                 </div>

                 {/* Duration Slider */}
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                          <Clock size={14} /> Duration
                       </label>
                       <span className="text-xl font-mono font-bold text-white">{durationMinutes} <span className="text-sm text-neutral-500">min</span></span>
                    </div>
                    <input 
                       type="range" 
                       min="5" 
                       max="120" 
                       step="5"
                       value={durationMinutes}
                       onChange={(e) => setDurationMinutes(Number(e.target.value))}
                       className="w-full accent-blue-600 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-neutral-600">
                       <span>5 min</span>
                       <span>2 Hours</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Warning Box */}
           <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex gap-4 items-start">
              <AlertTriangle className="text-red-500 shrink-0 mt-1" />
              <div>
                 <h4 className="text-red-400 font-bold text-sm mb-1">Important Note</h4>
                 <p className="text-red-200/70 text-xs leading-relaxed">
                    Permanent "Burn-in" (where organic pixels have degraded) cannot be fully fixed by software. This tool is effective for "Image Retention" (temporary ghosting). Running this tool for extended periods consumes power and screen life; use moderately.
                 </p>
              </div>
           </div>

        </section>
      </div>
    </>
  );
};

export default BurnInWiper;