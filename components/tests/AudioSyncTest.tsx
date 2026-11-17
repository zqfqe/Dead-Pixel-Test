import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ChevronLeft, ChevronUp, RotateCcw, Activity, Radar, Zap, MoveVertical, Sliders, Mic, Bluetooth, Monitor, HelpCircle, Film } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';
import { RelatedTools } from '../common/RelatedTools';
import { TestResultControls } from '../common/TestResultControls';

type Pattern = 'bar' | 'radar' | 'flash';

const AudioSyncTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // Persistent State
  const [offsetMs, setOffsetMs] = useLocalStorage('audiosync-offset', 0);
  const [pattern, setPattern] = useLocalStorage<Pattern>('audiosync-pattern', 'bar');
  
  // Local State
  const [bpm, setBpm] = useState(60);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Engine Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [audioError, setAudioError] = useState('');

  const stopTest = useCallback(() => {
    setIsActive(false);
    const audio = audioContextRef.current;
    audioContextRef.current = null;
    if (audio) void audio.close().catch(() => {});
    void exitFullscreen();
  }, [exitFullscreen]);

  const startTest = async () => {
    if (audioContextRef.current) return;
    setAudioError('');
    let audio: AudioContext | undefined;
    try {
      const Audio = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Audio) throw new Error('Web Audio unavailable');
      audio = new Audio();
      audioContextRef.current = audio;
      const resume = audio.resume();
      void enterFullscreen();
      await resume;
      if (audioContextRef.current === audio) setIsActive(true);
    } catch {
      if (audio && audioContextRef.current !== audio) return;
      stopTest();
      setAudioError('Audio could not start. Check browser sound permissions and try again.');
    }
  };

  useEffect(() => {
    const onHidden = () => {
      if (document.hidden && audioContextRef.current) stopTest();
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && audioContextRef.current) stopTest();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && audioContextRef.current) stopTest();
    };
    document.addEventListener('visibilitychange', onHidden);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('keydown', onKey);
      const audio = audioContextRef.current;
      audioContextRef.current = null;
      if (audio) {
        void audio.close().catch(() => {});
        void exitFullscreen();
      }
    };
  }, [stopTest, exitFullscreen]);

  const resetSettings = () => {
    setBpm(60);
    setOffsetMs(0);
    setPattern('bar');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioContextRef.current;
    if (!isActive || !canvas || !audio) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const intervalSeconds = 60 / bpm;
    const offset = typeof offsetMs === 'number' && Number.isFinite(offsetMs)
      ? Math.max(-500, Math.min(500, offsetMs)) / 1000
      : 0;
    const lookahead = 0.1;
    const firstBeat = audio.currentTime + lookahead + Math.max(0, -offset);
    let nextSound = firstBeat + offset;
    const output = audio.createGain();
    output.connect(audio.destination);

    const scheduleAudio = () => {
      const now = audio.currentTime;
      // Skip missed beats instead of replaying a burst after a main-thread stall.
      if (nextSound < now) {
        nextSound += Math.ceil((now - nextSound) / intervalSeconds) * intervalSeconds;
      }
      while (nextSound < now + lookahead) {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.connect(gain);
        gain.connect(output);
        osc.frequency.setValueAtTime(1200, nextSound);
        osc.frequency.exponentialRampToValueAtTime(100, nextSound + 0.03);
        gain.gain.setValueAtTime(0.5, nextSound);
        gain.gain.exponentialRampToValueAtTime(0.01, nextSound + 0.03);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
        osc.start(nextSound);
        osc.stop(nextSound + 0.05);
        nextSound += intervalSeconds;
      }
    };
    const scheduler = window.setInterval(scheduleAudio, 25);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      const timeSinceFirstBeat = audio.currentTime - firstBeat;
      const progress = ((timeSinceFirstBeat % intervalSeconds + intervalSeconds) % intervalSeconds) / intervalSeconds;

      // Clear Screen
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // --- RENDER PATTERNS ---

      if (pattern === 'flash') {
         if (timeSinceFirstBeat >= 0 && progress < 0.05) {
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
         const trackH = Math.min(600, canvas.height * 0.72);
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
         
         drawTick(-100, '-100ms');
         drawTick(-50, '-50ms');
         drawTick(50, '+50ms');
         drawTick(100, '+100ms');

         // Moving Puck
         const centeredPhase = progress > 0.5 ? progress - 1 : progress;
         const puckY = cy + centeredPhase * trackH;

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
      clearInterval(scheduler);
      output.disconnect();
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
          className={`absolute top-20 right-3 bottom-3 sm:top-6 sm:right-6 sm:bottom-6 z-[60] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80 max-w-[calc(100vw-1.5rem)]' : 'w-auto'}`}
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
                   <div className="font-bold text-sm tracking-wider text-neutral-800">A/V SYNC</div>
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
                           If the sound seems <strong>late</strong>, move left to schedule it earlier. If it seems <strong>early</strong>, move right. The setting records the compensation you choose for this setup.
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

                {/* Footer Report Actions */}
                <div className="p-5 border-t border-neutral-100 bg-neutral-50 space-y-4">
                  
                  <TestResultControls testId="audiosync" testName="Audio / Video Sync Latency" />

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
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Audio/Video Sync Tester",
              "url": "https://deadpixeltest.cc/tests/audio-sync",
              "description": "Measure and fix audio delay/latency (lip sync) issues between your display and speakers.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [{
                "@type": "Question",
                "name": "How to fix Lip Sync Delay?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most modern TVs and AV Receivers have an 'Audio Delay' or 'Lip Sync' setting. Use this tool to find the exact millisecond offset (e.g., +100ms) and enter that value in your device settings."
                }
              }, {
                "@type": "Question",
                "name": "Is Bluetooth lag normal?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Standard Bluetooth audio typically introduces 100-200ms of latency, which is noticeable in gaming and movies. Use AptX Low Latency codecs or wired connections for better sync."
                }
              }]
            },
            {
              "@type": "HowTo",
              "name": "How to Fix Audio Video Sync",
              "step": [
                { "@type": "HowToStep", "text": "Turn up your volume and watch the moving bar." },
                { "@type": "HowToStep", "text": "Listen for the 'Click' sound as the bar hits the center mark." },
                { "@type": "HowToStep", "text": "If the sound is early or late, use the 'Manual Compensation' slider to adjust it until it feels perfectly synced." },
                { "@type": "HowToStep", "text": "The resulting offset (e.g., +50ms) is your system latency. Enter this value into your TV or AV Receiver's 'Audio Delay' setting." }
              ]
            }
          ]
        }}
      />
      <div className="flex flex-col min-h-screen">
        {audioError && <p role="alert" className="mx-auto max-w-xl p-4 text-red-300">{audioError}</p>}
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

        {/* Deep SEO Content */}
        <section className="max-w-4xl mx-auto px-6 py-16 space-y-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           
           <article className="prose prose-invert max-w-none">
              <div className="grid md:grid-cols-2 gap-12">
                 <div>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                       <Film className="text-blue-500" /> What causes Lip Sync issues?
                    </h2>
                    <p className="text-neutral-400 leading-relaxed mb-4">
                       Modern TVs do heavy image processing (motion smoothing, upscaling) which adds video delay. Audio receivers process sound almost instantly.
                    </p>
                    <p className="text-neutral-400 leading-relaxed">
                       This results in the sound arriving <strong>before</strong> the picture (negative lag), making characters look like poorly dubbed movies.
                    </p>
                 </div>
                 
                 <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <Bluetooth className="text-purple-500" /> Bluetooth Lag Explained
                    </h3>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-neutral-300">Wired Audio</span>
                          <span className="text-green-400 font-mono">0-5 ms</span>
                       </div>
                       <div className="w-full h-1 bg-neutral-800 rounded"><div className="w-1 h-full bg-green-500 rounded"></div></div>
                       
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-neutral-300">AptX Low Latency</span>
                          <span className="text-blue-400 font-mono">~40 ms</span>
                       </div>
                       <div className="w-full h-1 bg-neutral-800 rounded"><div className="w-1/4 h-full bg-blue-500 rounded"></div></div>

                       <div className="flex justify-between items-center text-sm">
                          <span className="text-neutral-300">Standard Bluetooth (SBC)</span>
                          <span className="text-red-400 font-mono">~200 ms</span>
                       </div>
                       <div className="w-full h-1 bg-neutral-800 rounded"><div className="w-3/4 h-full bg-red-500 rounded"></div></div>
                    </div>
                 </div>
              </div>

              <hr className="my-12 border-white/10" />

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                 <Monitor className="text-green-500" /> TV Game Mode
              </h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                 If you are experiencing heavy video lag (your mouse feels floaty or audio is way ahead), make sure your TV is set to <strong>Game Mode</strong>. This disables post-processing features and reduces input lag significantly, often fixing sync issues automatically.
              </p>
           </article>

           {/* FAQ Section Visual - Matches Schema */}
           <div className="border-t border-white/10 pt-12">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                 <HelpCircle className="text-blue-400" /> Frequently Asked Questions
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">How to fix Lip Sync Delay?</h4>
                    <p className="text-neutral-400 text-sm">Most modern TVs and AV Receivers have an "Audio Delay" or "Lip Sync" setting. Use this tool to find the exact millisecond offset (e.g., +100ms) and enter that value in your device settings.</p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">Is Bluetooth lag normal?</h4>
                    <p className="text-neutral-400 text-sm">Yes. Standard Bluetooth audio typically introduces 100-200ms of latency, which is noticeable in gaming and movies. Use AptX Low Latency codecs or wired connections for better sync.</p>
                 </div>
              </div>
           </div>

        </section>

        <div className="max-w-7xl mx-auto px-6 w-full">
           <RelatedTools currentPath="/tests/audio-sync" />
        </div>
      </div>
    </>
  );
};

export default AudioSyncTest;