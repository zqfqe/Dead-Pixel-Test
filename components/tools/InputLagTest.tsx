import React, { useState, useEffect, useRef } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { Camera, MousePointer2, Keyboard, Zap, Play, RotateCcw, Monitor, Clock } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';
import { FullscreenControls } from '../common/FullscreenControls';

const InputLagTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  const [frameData, setFrameData] = useState<{ count: number, time: number }>({ count: 0, time: 0 });
  const [isFlashed, setIsFlashed] = useState(false);
  
  const reqRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const startTest = () => {
    setIsActive(true);
    enterFullscreen();
    startRef.current = performance.now();
    loop();
  };

  const stopTest = () => {
    setIsActive(false);
    exitFullscreen();
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
  };

  const loop = () => {
    const now = performance.now();
    // Update simple counter visible for camera
    setFrameData({
        count: Math.floor((now - startRef.current) / 16.666), // Approximate frame count
        time: now
    });
    reqRef.current = requestAnimationFrame(loop);
  };

  // Input Handler
  const handleInput = () => {
      // Toggle flash state on input
      setIsFlashed(prev => !prev);
  };

  useEffect(() => {
      if (isActive) {
          window.addEventListener('mousedown', handleInput);
          window.addEventListener('keydown', handleInput);
      }
      return () => {
          window.removeEventListener('mousedown', handleInput);
          window.removeEventListener('keydown', handleInput);
      };
  }, [isActive]);

  if (isActive) {
    return (
      <div 
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center font-mono cursor-crosshair select-none ${isFlashed ? 'bg-white text-black' : 'bg-black text-white'}`}
      >
        <FullscreenControls onExit={stopTest} title="Input Lag Counter" />

        {/* Main Counter */}
        <div className="text-center">
            <div className="text-[15vw] font-bold leading-none tracking-tighter tabular-nums">
                {frameData.time.toFixed(1)}
            </div>
            <div className="text-[2vw] opacity-50 uppercase tracking-[1em] mt-4">
                Milliseconds
            </div>
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
        description="Calculate system input lag using a high-speed camera (240fps/960fps). Features a millisecond-precision counter for measuring end-to-end latency."
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
          description="A professional tool to measure 'Click-to-Photon' latency. Requires a smartphone with Slow Motion video capability (240fps or higher)."
          startButtonText="Start Counter"
          onStart={startTest}
        >
          <InfoCard title="How to Measure">
            <ol className="list-decimal pl-4 space-y-2 text-sm text-neutral-400 mt-2">
                <li>Start the test to see the running millisecond timer.</li>
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