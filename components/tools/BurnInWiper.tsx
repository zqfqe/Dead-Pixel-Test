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
  const [durationMinutes, setDurationMinutes] = useState(2);
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
    const buffer32 = noiseData ? new Uint32Array(noiseData.data.buffer) : null;

    const render = () => {
      frameCount++;

      if (mode === 'cycle') {
        // Slow transition every 120 frames (~2s at 60 Hz); this is a visual demo, not treatment.
        const colorIdx = Math.floor(frameCount / 120) % colors.length;
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
        // Generate the noise once; do not strobe a new frame every animation tick.
        if (frameCount === 1 && noiseCtx && noiseData && buffer32) {
            const len = buffer32.length;
            for (let i = 0; i < len; i++) {
                // Random grayscale noise
                const val = Math.random() < 0.5 ? 0 : 255;
                buffer32[i] = 0xFF000000 | (val << 16) | (val << 8) | val;
            }
            noiseCtx.putImageData(noiseData, 0, 0);
            ctx.imageSmoothingEnabled = false; // Nearest neighbor scaling
            ctx.drawImage(noiseCanvas, 0, 0, w, h);
        } else if (frameCount === 1) {
            ctx.fillStyle = '#202020';
            ctx.fillRect(0, 0, w, h);
        }
      }

      // Static noise needs one draw; do not waste frames in a 60+ FPS loop.
      reqRef.current = mode === 'noise' ? null : requestAnimationFrame(render);
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
        title="OLED Display Pattern Demo – No Burn-In Repair" 
        description="Display optional color, noise and moving-line patterns for visual inspection. This browser tool cannot repair temporary image retention or permanent OLED burn-in."
        canonical="/tools/burn-in-wiper"
        keywords={['OLED display pattern demo', 'image retention visual check', 'screen color pattern']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Burn-in Wiper', path: '/tools/burn-in-wiper' }
        ]}
      />
      <div className="flex flex-col min-h-screen">
        <TestIntro
          title="OLED Display Pattern Demo"
          description="An optional browser-based display-pattern demo. It does not condition the panel, repair stuck pixels or reverse OLED burn-in."
          startButtonText="Launch Pattern Demo"
          onStart={startTest}
        >
          <InfoCard title="What this tool does">
            <p>
              It displays optional color transitions, a static noise image or a moving scan bar. These are visual patterns only. There is no reliable evidence that this page can remove temporary retention, repair a stuck pixel or reverse permanent OLED burn-in.
            </p>
          </InfoCard>
          <InfoCard title="Visual sensitivity warning">
            <p>
              Color transitions and moving high-contrast patterns may be uncomfortable for some people. Do not use if you are sensitive to flashing or moving patterns; stop immediately if you feel discomfort. Keep brightness comfortable and keep sessions brief.
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
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Display Pattern</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <button 
                         onClick={() => setMode('cycle')}
                         className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${mode === 'cycle' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-black/20 border-white/10 text-neutral-400 hover:bg-white/5'}`}
                       >
                          <RotateCcw size={24} />
                          <span className="font-bold">Color Cycle</span>
                          <span className="text-[10px] opacity-70">Slow color transitions; no repair claim</span>
                       </button>
                       <button 
                         onClick={() => setMode('noise')}
                         className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${mode === 'noise' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-black/20 border-white/10 text-neutral-400 hover:bg-white/5'}`}
                       >
                          <Monitor size={24} />
                          <span className="font-bold">Static Noise</span>
                          <span className="text-[10px] opacity-70">Static noise image; no repair claim</span>
                       </button>
                       <button 
                         onClick={() => setMode('scan')}
                         className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${mode === 'scan' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-black/20 border-white/10 text-neutral-400 hover:bg-white/5'}`}
                       >
                          <Play size={24} />
                          <span className="font-bold">Scan Bar</span>
                          <span className="text-[10px] opacity-70">Moving line for visual inspection</span>
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
                       min="1" 
                       max="5" 
                       step="1"
                       value={durationMinutes}
                       onChange={(e) => setDurationMinutes(Number(e.target.value))}
                       className="w-full accent-blue-600 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-neutral-600">
                       <span>1 min</span>
                       <span>5 min</span>
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
                    Permanent OLED burn-in is uneven panel aging and cannot be reversed by a browser page. Temporary image retention may fade after content changes or time, but this tool is not a proven treatment. Avoid long sessions and follow the display manufacturer’s panel-care guidance.
                 </p>
              </div>
           </div>

        </section>
      </div>
    </>
  );
};

export default BurnInWiper;