import React, { useState, useEffect, useRef } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, ChevronUp, RotateCcw, Activity, Radar, Zap, MoveVertical, Sliders } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';

type Pattern = 'bar' | 'radar' | 'flash';

const AudioSyncTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // Settings
  const [bpm, setBpm] = useState(60);
  const [offsetMs, setOffsetMs] = useState(0); // User manual compensation
  const [pattern, setPattern] = useState<Pattern>('bar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Engine Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);

  const startTest = () => {
    setIsActive(true);
    enterFullscreen();
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Reset timer
    if (audioContextRef.current) {
      nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.5;
    }
  };

  const stopTest = () => {
    setIsActive(false);
    exitFullscreen();
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const resetSettings = () => {
    setBpm(60);
    setOffsetMs(0);
    setPattern('bar');
  };

  // Improved Click Sound (Short high-pitch transient)
  const playClick = (time: number) => {
    if (!audioContextRef.current) return;
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    
    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);
    
    // Sharp click
    osc.frequency.setValueAtTime(1200, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.03);
    
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
    
    osc.start(time);
    osc.stop(time + 0.05);
  };

  useEffect(() => {
    if (!isActive || !canvasRef.current || !audioContextRef.current) return;

    const ctx = canvasRef.current.getContext('2d', { alpha: false });
    const canvas = canvasRef.current;
    
    const intervalSeconds = 60.0 / bpm;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      if (!ctx || !audioContextRef.current) return;

      const currentTime = audioContextRef.current.currentTime;

      // 1. Audio Scheduling (Lookahead)
      while (nextNoteTimeRef.current < currentTime + 0.1) {
          // Play sound at exact scheduled time + user offset
          // Note: offsetMs effectively delays the SOUND relative to the visual loop logic
          // However, for calibration, it's often easier to think:
          // Visual hits @ T. Audio hits @ T + offset.
          playClick(nextNoteTimeRef.current + (offsetMs / 1000));
          nextNoteTimeRef.current += intervalSeconds;
      }

      // 2. Visual Logic
      // Calculate phase (0.0 to 1.0) relative to the BEAT (nextNoteTime)
      // Visuals are strictly tied to the metronome clock, Audio is shifted by offsetMs
      const timeToNextBeat = nextNoteTimeRef.current - currentTime;
      // Phase 0.0 = Beat just happened. Phase 1.0 = Next beat happening.
      // We want the "Hit" to happen when timeToNextBeat = intervalSeconds (start of cycle)
      // or simply:
      const totalCycle = intervalSeconds;
      const progress = 1 - (timeToNextBeat / totalCycle); 
      // progress goes from 0 -> 1 linearly

      // Clear Screen
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // --- RENDER PATTERNS ---

      if (pattern === 'flash') {
        // Simple Flash Frame
        // Flash exactly when progress wraps (around 0/1)
        // Since we are in rAF, we check closeness to 0
        // We use the adjusted audio time for visual feedback if we want "What you see is result"
        // But for calibration tool, we usually keep visual steady and move audio.
        // Let's flash at progress close to 0
        
        if (progress < 0.05) { // Flash for first 5% of beat
           ctx.fillStyle = '#ffffff';
           ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
           // Countdown Text
           ctx.fillStyle = '#333';
           ctx.font = 'bold 100px monospace';
           ctx.textAlign = 'center';
           ctx.textBaseline = 'middle';
           ctx.fillText(Math.ceil((1-progress) * 4).toString(), cx, cy);
        }
      } 
      else if (pattern === 'radar') {
         // Radar Clock
         const radius = Math.min(cx, cy) * 0.6;
         
         // Dial
         ctx.strokeStyle = '#333';
         ctx.lineWidth = 4;
         ctx.beginPath();
         ctx.arc(cx, cy, radius, 0, Math.PI * 2);
         ctx.stroke();

         // Markers (0, +50, +100ms approx based on angle speed)
         // Full circle = intervalSeconds. 
         // Angle per ms = (2PI) / (intervalSeconds * 1000)
         const msToAngle = (ms: number) => (ms / (intervalSeconds * 1000)) * Math.PI * 2;

         const drawMarker = (ms: number, label: string, color = '#444') => {
             const angle = -Math.PI/2 + msToAngle(ms); // Start at 12 o'clock
             const mx = cx + Math.cos(angle) * (radius + 20);
             const my = cy + Math.sin(angle) * (radius + 20);
             ctx.fillStyle = color;
             ctx.font = '12px monospace';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillText(label, mx, my);
             
             // Tick on circle
             const tx1 = cx + Math.cos(angle) * (radius - 10);
             const ty1 = cy + Math.sin(angle) * (radius - 10);
             const tx2 = cx + Math.cos(angle) * (radius + 10);
             const ty2 = cy + Math.sin(angle) * (radius + 10);
             ctx.strokeStyle = color;
             ctx.beginPath(); ctx.moveTo(tx1, ty1); ctx.lineTo(tx2, ty2); ctx.stroke();
         };

         drawMarker(0, '0', '#fff');
         drawMarker(50, '+50');
         drawMarker(100, '+100');
         drawMarker(-50, '-50');
         drawMarker(-100, '-100');

         // Hand
         const handAngle = -Math.PI/2 + (progress * Math.PI * 2);
         ctx.strokeStyle = '#00ff00';
         ctx.lineWidth = 4;
         ctx.beginPath();
         ctx.moveTo(cx, cy);
         ctx.lineTo(cx + Math.cos(handAngle) * radius, cy + Math.sin(handAngle) * radius);
         ctx.stroke();
      } 
      else {
         // STANDARD BAR
         const trackH = 600;
         const trackW = 60;
         
         // Draw Track
         ctx.fillStyle = '#1a1a1a';
         ctx.fillRect(cx - trackW/2, cy - trackH/2, trackW, trackH);
         
         // 0ms Center Line
         ctx.fillStyle = '#ff0000';
         ctx.fillRect(cx - 100, cy - 1, 200, 2);
         ctx.font = 'bold 12px monospace';
         ctx.fillText('0ms (Sync)', cx + 110, cy + 4);

         // Markers
         const msToPx = (ms: number) => (ms / 1000) * (trackH / intervalSeconds);
         
         const drawTick = (ms: number, label: string) => {
            const y = cy + msToPx(ms);
            // Only draw if within track
            if (y > cy - trackH/2 && y < cy + trackH/2) {
                ctx.fillStyle = '#444';
                ctx.fillRect(cx - 40, y, 80, 1);
                ctx.fillStyle = '#666';
                ctx.fillText(label, cx + 50, y + 4);
            }
         };
         
         // Markers are inverted relative to motion.
         // If ball is BELOW line (+y), it arrived LATE relative to sound? 
         // If sound plays at center...
         // If ball is at +100px when sound plays, Video is EARLY (ball moved too fast? no).
         // Ball moves Top -> Bottom.
         // Hits center at Time 0.
         // If Sound plays when Ball is at +100ms mark (below center), Sound is LATE.
         // If Sound plays when Ball is at -100ms mark (above center), Sound is EARLY.
         
         drawTick(-100, '-100ms');
         drawTick(-50, '-50ms');
         drawTick(50, '+50ms');
         drawTick(100, '+100ms');

         // Moving Puck
         // Progress 0 -> 1. We want 0 to be at top? No, we want hit at specific time.
         // Let's map progress so that 0.5 is Center Hit? No, audio schedules at interval.
         // Usually audio plays at start of beat.
         // So we want visual to cross center at start of beat (progress 0 or 1).
         
         let puckY = cy - (trackH/2) + (progress * trackH);
         // This moves Top to Bottom. At progress 0.5 (halfway through beat), it's at center.
         // But we schedule audio at nextNoteTime.
         // We need to phase shift so that progress 0 = Center.
         // Let's shift visually.
         
         // Adjust so Puck is at Center when progress = 0 (Beat).
         // Current: Top at 0.
         // We need Top to be at -0.5 and Bottom at +0.5?
         // Let's just animate continuous flow.
         
         // Better logic: distance = speed * time.
         // speed = trackH / intervalSeconds.
         // At time=0 (beat), y=cy.
         // At time=dt, y = cy + (dt * speed).
         const speed = trackH / intervalSeconds;
         // timeSinceBeat goes from 0 to intervalSeconds.
         // But we want to see it approach.
         // Let's use a wrapping window centered on the beat.
         // Time relative to closest beat:
         let dt = (audioContextRef.current.currentTime - nextNoteTimeRef.current); 
         // dt is negative (approaching) then positive (passed).
         // Range -0.5*interval to +0.5*interval
         
         // Wrap dt to stay within current window
         // This ensures the ball keeps flowing
         while (dt > intervalSeconds/2) dt -= intervalSeconds;
         while (dt < -intervalSeconds/2) dt += intervalSeconds;
         
         puckY = cy + (dt * speed);
         
         ctx.fillStyle = '#fff';
         ctx.beginPath();
         ctx.arc(cx, puckY, 20, 0, Math.PI*2);
         ctx.fill();
      }

      // Draw Offset Indicator (HUD)
      ctx.fillStyle = '#000';
      ctx.fillRect(cx - 60, canvas.height - 80, 120, 40);
      ctx.fillStyle = offsetMs === 0 ? '#444' : offsetMs > 0 ? '#4f4' : '#f44';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${offsetMs > 0 ? '+' : ''}${offsetMs}ms`, cx, canvas.height - 55);

      requestRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, bpm, offsetMs, pattern]);

  if (isActive) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        
        {/* Top-Left Exit */}
        <button 
          onClick={stopTest}
          className="absolute top-6 left-6 z-[60] flex items-center gap-2 bg-neutral-900/90 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg hover:bg-neutral-800 transition-colors border border-neutral-700 font-medium text-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Exit
        </button>

        {/* Right Sidebar Controls */}
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
                   <h3 className="font-bold text-sm tracking-wider text-neutral-800">A/V SYNC</h3>
                   <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-800">
                     <ChevronUp size={20} className="rotate-90" />
                   </button>
                </div>

                <div className="p-5 space-y-8 flex-1">
                   
                   {/* 1. Visual Pattern */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Visual Pattern</label>
                      <div className="flex rounded-md bg-neutral-100 p-1 border border-neutral-200">
                         <button onClick={() => setPattern('bar')} className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 ${pattern === 'bar' ? 'bg-white shadow-sm text-blue-600' : 'text-neutral-500'}`}>
                           <MoveVertical size={14} /> Bar
                         </button>
                         <button onClick={() => setPattern('radar')} className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 ${pattern === 'radar' ? 'bg-white shadow-sm text-blue-600' : 'text-neutral-500'}`}>
                           <Radar size={14} /> Radar
                         </button>
                         <button onClick={() => setPattern('flash')} className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 ${pattern === 'flash' ? 'bg-white shadow-sm text-blue-600' : 'text-neutral-500'}`}>
                           <Zap size={14} /> Flash
                         </button>
                      </div>
                   </div>

                   {/* 2. Manual Offset Calibration */}
                   <div className="space-y-4 pt-4 border-t border-neutral-100">
                      <div className="flex items-center gap-2 text-blue-600">
                         <Sliders size={16} />
                         <span className="text-sm font-bold">Manual Compensation</span>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                         <p className="text-[11px] text-blue-800 leading-relaxed mb-3">
                           If the sound is <strong>late</strong>, drag right. If <strong>early</strong>, drag left. Adjust until the click happens exactly when the visual hits the mark. The result is your system latency.
                         </p>
                         
                         <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-neutral-500">Audio Offset</span>
                            <span className={`text-sm font-mono font-bold ${offsetMs === 0 ? 'text-neutral-400' : offsetMs > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                              {offsetMs > 0 ? '+' : ''}{offsetMs} ms
                            </span>
                         </div>
                         <input 
                            type="range" 
                            min="-500" 
                            max="500" 
                            step="10"
                            value={offsetMs}
                            onChange={(e) => setOffsetMs(parseInt(e.target.value))}
                            className="w-full accent-blue-600 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                         />
                         <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                            <span>Early (-500)</span>
                            <span>Late (+500)</span>
                         </div>
                      </div>
                      <button 
                         onClick={() => setOffsetMs(0)}
                         className="w-full py-1.5 text-xs border rounded hover:bg-neutral-50 text-neutral-500"
                      >
                         Reset Offset to 0ms
                      </button>
                   </div>

                   {/* 3. Tempo */}
                   <div className="space-y-3 pt-4 border-t border-neutral-100">
                      <div className="flex justify-between items-end">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Speed (BPM)</label>
                        <span className="text-xs font-mono font-bold text-neutral-600">{bpm}</span>
                      </div>
                      <input 
                        type="range" 
                        min="30" 
                        max="120" 
                        step="5"
                        value={bpm}
                        onChange={(e) => setBpm(parseInt(e.target.value))}
                        className="w-full accent-neutral-600 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
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
        title="Audio Video Sync Test - Lip Sync Latency" 
        description="Fix audio delay issues. Measure the exact latency (ms) between your screen and speakers to correct lip-sync problems in movies and games."
        canonical="/tests/audio-sync"
        keywords={['audio sync test', 'lip sync test', 'audio latency test', 'audio video delay', 'av sync calibration']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Audio Sync', path: '/tests/audio-sync' }
        ]}
      />
      <TestIntro
        title="Audio/Video Sync Test"
        description="Measure and calibrate the delay between your display and speakers. Essential for home theater lip-sync and competitive gaming."
        onStart={startTest}
      >
        <InfoCard title="How to Calibrate">
          <p>
            1. Listen to the click and watch the visual marker.
            <br/>
            2. Use the <strong>Manual Compensation</strong> slider in the menu.
            <br/>
            3. Adjust until they feel perfectly synced. The final number (e.g., +100ms) is the delay you should enter in your TV or AV Receiver settings.
          </p>
        </InfoCard>
        <InfoCard title="Patterns">
          <p>
            <strong>Bar:</strong> Best for checking vertical sync.
            <br/>
            <strong>Radar:</strong> Easier to spot angular errors.
            <br/>
            <strong>Flash:</strong> High-speed photography reference.
          </p>
        </InfoCard>
      </TestIntro>
    </>
  );
};

export default AudioSyncTest;