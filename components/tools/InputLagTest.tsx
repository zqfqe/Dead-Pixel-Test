import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useIdleCursor } from '../../hooks/useIdleCursor';
import { Camera, MousePointer2, Keyboard, Zap, Play, RotateCcw, Monitor, Clock } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';
import { FullscreenControls } from '../common/FullscreenControls';

const InputLagTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  const [frameData, setFrameData] = useState<{ count: number, time: number }>({ count: 0, time: 0 });
  const [isFlashed, setIsFlashed] = useState(false);
  const isIdle = useIdleCursor(3000); // UI Hiding logic
  
  const reqRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const frameCountRef = useRef(0);

  const stopTest = useCallback(() => {
    setIsActive(false);
    setIsFlashed(false);
    if (reqRef.current !== null) {
      cancelAnimationFrame(reqRef.current);
      reqRef.current = null;
    }
    void exitFullscreen();
  }, [exitFullscreen]);

  const startTest = () => {
    if (reqRef.current !== null) cancelAnimationFrame(reqRef.current);
    reqRef.current = null;
    startRef.current = performance.now();
    frameCountRef.current = 0;
    setFrameData({ count: 0, time: 0 });
    setIsFlashed(false);
    setIsActive(true);
    void enterFullscreen();
  };

  useEffect(() => {
    if (!isActive) return;
    // RequestAnimationFrame timestamps share performance.now's time origin.
    // Count actual delivered callbacks rather than assuming a 60 Hz display.
    const tick = (now: number) => {
      frameCountRef.current += 1;
      setFrameData({ count: frameCountRef.current, time: Math.max(0, now - startRef.current) });
      reqRef.current = requestAnimationFrame(tick);
    };
    reqRef.current = requestAnimationFrame(tick);
    return () => {
      if (reqRef.current !== null) cancelAnimationFrame(reqRef.current);
      reqRef.current = null;
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const onMouseDown = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('button,a,input,[role="button"]')) return;
      setIsFlashed(previous => !previous);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); stopTest(); return; }
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey ||
          ['Tab','Shift','Control','Alt','Meta','F11'].includes(event.key)) return;
      if (event.target instanceof Element && event.target.closest('button,a,input,select,textarea,[role="button"]')) return;
      setIsFlashed(previous => !previous);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') stopTest();
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isActive, stopTest]);

  if (isActive) {
    return (
      <div 
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center font-mono cursor-crosshair select-none ${isFlashed ? 'bg-white text-black' : 'bg-black text-white'} ${isIdle ? 'cursor-none' : ''}`}
      >
        <FullscreenControls onExit={stopTest} title="Input Lag Counter" visible={!isIdle} />

        {/* Main Counter */}
        <div className="text-center">
            <div data-testid="input-lag-elapsed-ms" role="timer" aria-label="Elapsed milliseconds since starting the test" aria-live="off"
              className="text-[15vw] font-bold leading-none tracking-tighter tabular-nums">
                {frameData.time.toFixed(1)}
            </div>
            <div className="text-[2vw] opacity-70 uppercase tracking-[0.5em] mt-4">
                Elapsed since start (ms)
            </div>
            <div className="mt-4 text-sm opacity-70" data-testid="input-lag-rendered-frames">
              Animation frames displayed: {frameData.count}
            </div>
            <p className="mt-3 text-xs opacity-70">The elapsed timer and frames do not measure physical input-to-photon latency.</p>
        </div>

        {/* Visual Anchor for Camera focus */}
        <div className={`absolute bottom-20 w-full h-20 flex justify-center gap-10 opacity-50`}>
            <div className="w-20 h-20 border-4 border-current"></div>
            <div className="w-20 h-20 bg-current"></div>
            <div className="w-20 h-20 border-4 border-current"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Input Lag Test - Measure Monitor Latency" 
        description="Use a session-relative timer and visual flashes with your high-speed camera to estimate input-to-display delay. Browser timing alone does not measure physical latency."
        canonical="/tools/input-lag"
        keywords={['input lag test', 'monitor latency test', 'mouse delay test', 'system latency checker', 'click to photon test']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Input Lag Test', path: '/tools/input-lag' }
        ]}
      />
      <div className="flex flex-col min-h-screen">
        <TestIntro
          title="Input Lag Test"
          description="Record both your physical input and the screen using a slow-motion camera. The on-screen clock starts at zero and does not itself measure input-to-photon latency."
          startButtonText="Start Counter"
          onStart={startTest}
        >
          <InfoCard title="How to Measure">
            <ol className="list-decimal pl-4 space-y-2 text-sm text-neutral-400 mt-2">
                <li>Start the test to see the elapsed millisecond timer, beginning at zero.</li>
                <li>Setup your phone to record both your mouse/finger and the screen in the same frame.</li>
                <li>Record in <strong>Slow Motion (240fps+)</strong>.</li>
                <li>Click the mouse. The screen will flash White.</li>
                <li>Review video: Count frames between the physical click and the screen turning white.</li>
            </ol>
          </InfoCard>
          <InfoCard title="The Math">
            <p>
              <strong>Latency (ms) = (Frame Count / Video FPS) * 1000</strong>
              <br/>
              Example: 12 frames delay at 240fps = 50ms input lag.
            </p>
          </InfoCard>
        </TestIntro>

        <section className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           
           <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/10">
                 <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Monitor className="text-blue-500" /> System Latency Chain
                 </h3>
                 <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                    Input lag is the sum of delays in the entire pipeline:
                 </p>
                 <ul className="space-y-2 text-sm text-neutral-300">
                    <li className="flex justify-between border-b border-white/5 pb-1"><span>Mouse Click</span> <span className="text-neutral-500">1-10ms</span></li>
                    <li className="flex justify-between border-b border-white/5 pb-1"><span>USB Polling</span> <span className="text-neutral-500">1-8ms</span></li>
                    <li className="flex justify-between border-b border-white/5 pb-1"><span>CPU/Render Queue</span> <span className="text-neutral-500">5-20ms</span></li>
                    <li className="flex justify-between border-b border-white/5 pb-1"><span>Monitor Refresh</span> <span className="text-neutral-500">4-16ms</span></li>
                    <li className="flex justify-between border-b border-white/5 pb-1"><span>Monitor Processing</span> <span className="text-neutral-500">1-10ms</span></li>
                 </ul>
              </div>

              <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/10">
                 <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="text-green-500" /> Typical Values
                 </h3>
                 <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm font-bold text-white mb-1">E-Sports Pro Setup</div>
                        <div className="w-full h-2 bg-neutral-800 rounded-full"><div className="w-[15%] h-full bg-blue-500 rounded-full"></div></div>
                        <div className="text-xs text-neutral-500 mt-1">15ms - 25ms total</div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm font-bold text-white mb-1">Standard Gaming PC</div>
                        <div className="w-full h-2 bg-neutral-800 rounded-full"><div className="w-[35%] h-full bg-green-500 rounded-full"></div></div>
                        <div className="text-xs text-neutral-500 mt-1">30ms - 50ms total</div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm font-bold text-white mb-1">Console on TV</div>
                        <div className="w-full h-2 bg-neutral-800 rounded-full"><div className="w-[70%] h-full bg-yellow-500 rounded-full"></div></div>
                        <div className="text-xs text-neutral-500 mt-1">80ms - 150ms total</div>
                    </div>
                 </div>
              </div>
           </div>

        </section>
      </div>
    </>
  );
};

export default InputLagTest;