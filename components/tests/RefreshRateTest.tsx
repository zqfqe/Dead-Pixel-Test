import React, { useRef, useEffect, useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, Monitor, Zap, Info, Camera, Activity, AlertTriangle, Cpu, Layers, HelpCircle } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';
import { RelatedTools } from '../common/RelatedTools';

const RefreshRateTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fps, setFps] = useState(0);
  
  const requestRef = useRef<number>();
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);

  const startTest = () => {
    setIsActive(true);
    enterFullscreen();
  };

  const stopTest = () => {
    setIsActive(false);
    exitFullscreen();
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // We want to divide the screen width into N columns where N is roughly the refresh rate
    let slots = 60; 
    let currentSlot = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Recalculate slots based on width to keep squares roughly 40px
      slots = Math.floor(canvas.width / 40);
    };
    window.addEventListener('resize', resize);
    resize();

    const render = (time: number) => {
        // FPS Counter
        if (time - lastTimeRef.current >= 1000) {
            setFps(Math.round((frameCountRef.current * 1000) / (time - lastTimeRef.current)));
            frameCountRef.current = 0;
            lastTimeRef.current = time;
        }
        frameCountRef.current++;

        // Draw Logic
        // Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        const slotWidth = canvas.width / slots;
        const startY = canvas.height / 2 - 50;
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for(let i=0; i<slots; i++) {
            ctx.strokeRect(i * slotWidth, startY, slotWidth, 100);
        }

        // Active Block
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(currentSlot * slotWidth + 2, startY + 2, slotWidth - 4, 96);
        
        // Block Number
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((currentSlot+1).toString(), currentSlot * slotWidth + slotWidth/2, startY + 50);

        // Advance
        currentSlot = (currentSlot + 1) % slots;

        requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
        window.removeEventListener('resize', resize);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive]);

  if (isActive) {
    return (
      <div className="fixed inset-0 z-50 bg-black cursor-none select-none">
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start">
            <button 
                onClick={stopTest}
                className="flex items-center gap-2 bg-neutral-900/80 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg border border-neutral-700 font-medium text-sm group cursor-pointer pointer-events-auto"
            >
                <ChevronLeft size={16} /> Exit
            </button>

            <div className="flex flex-col items-end">
                <div className="bg-black/60 backdrop-blur border border-white/20 px-6 py-4 rounded-xl text-center">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Browser FPS</div>
                    <div className="text-6xl font-mono font-bold text-green-400">{fps}</div>
                    <div className="text-xs text-neutral-600 mt-2">Target: {window.screen.width > 0 ? 'Max' : '60'} Hz</div>
                </div>
            </div>
        </div>

        <div className="absolute bottom-12 left-0 w-full text-center pointer-events-none">
            <p className="text-white/50 font-mono text-sm bg-black/50 inline-block px-4 py-2 rounded">
                Take a long exposure photo (1/5s) to check for gaps.
            </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Refresh Rate & Frame Skipping Test (Hz Check)" 
        description="Check your monitor's real refresh rate (Hz) and detect frame skipping. Essential for overclocked monitors to ensure they aren't dropping frames."
        canonical="/tests/refresh-rate"
        keywords={['refresh rate test', 'hz test', 'frame skipping test', 'monitor overclock test', 'fps test', 'vsync test']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Refresh Rate Test', path: '/tests/refresh-rate' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How to check for Frame Skipping?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Start the test and take a photo of the screen with a shutter speed of 1/5th or 1/10th of a second. If the trail of squares has gaps, your monitor is dropping frames."
              }
            }, 
            {
              "@type": "Question",
              "name": "Why is my 144Hz monitor showing 60Hz?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Check your Windows Display Settings > Advanced Display Settings to ensure the refresh rate is set correctly. Also, verify that your browser has 'Hardware Acceleration' enabled."
              }
            },
            {
              "@type": "Question",
              "name": "What is the difference between Hz and FPS?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Hz (Hertz) is how many times per second your monitor refreshes the image. FPS (Frames Per Second) is how many images your computer generates. For smooth motion, FPS should match Hz."
              }
            }
          ]
        }}
      />
      <div className="flex flex-col min-h-screen">
        <TestIntro
          title="Refresh Rate & Frame Skipping"
          description="Validate your monitor's true refresh rate and check for dropped frames (common in overclocked monitors). Requires a smartphone camera for the Skipping Test."
          onStart={startTest}
        >
          <InfoCard title="How to Check Frame Skipping">
            <ol className="list-decimal pl-4 space-y-2 text-sm text-neutral-400 mt-2">
                <li>Start the test. A white block will move across the grid.</li>
                <li>Open your phone camera in <strong>Pro/Manual Mode</strong>.</li>
                <li>Set Shutter Speed to roughly <strong>1/5s</strong> or <strong>1/10s</strong>.</li>
                <li>Take a photo of the moving block.</li>
                <li><strong>Result:</strong> If the trail of blocks is continuous, it's perfect. If there are black gaps between blocks, your monitor is skipping frames.</li>
            </ol>
          </InfoCard>
          <InfoCard title="Hz vs FPS">
            <p>
              This tool measures <strong>Browser FPS</strong>. On a 144Hz monitor, this should read 144. If it's capped at 60, check your Windows Display Settings or Browser Hardware Acceleration settings.
            </p>
          </InfoCard>
        </TestIntro>

        <section className="max-w-5xl mx-auto px-6 py-16 space-y-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           
           <article className="prose prose-invert max-w-none">
              <div className="grid md:grid-cols-2 gap-12">
                 <div>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                       <Activity className="text-blue-500" /> What is Frame Skipping?
                    </h2>
                    <p className="text-neutral-400 leading-relaxed mb-4">
                       When you overclock a monitor (e.g., forcing a 60Hz panel to run at 75Hz), the internal electronics might accept the higher signal but fail to display every frame. Instead, it drops (skips) frames to keep up.
                    </p>
                    <p className="text-neutral-400 leading-relaxed">
                       This results in stuttery motion, which defeats the purpose of a higher refresh rate. This test helps you verify if your overclock is stable.
                    </p>
                 </div>
                 
                 <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <Cpu className="text-purple-500" /> Why am I capped at 60 FPS?
                    </h3>
                    <ul className="space-y-3 text-sm text-neutral-400">
                       <li className="flex gap-2">
                          <span className="text-white font-bold min-w-[80px]">OS Settings:</span>
                          <span>Check Windows Display Settings {'>'} Advanced Display {'>'} Refresh Rate. It often defaults to 60Hz.</span>
                       </li>
                       <li className="flex gap-2">
                          <span className="text-white font-bold min-w-[80px]">Cables:</span>
                          <span>Older HDMI cables may limit 4K or 1440p screens to 60Hz. Use DisplayPort or HDMI 2.1 for high refresh rates.</span>
                       </li>
                       <li className="flex gap-2">
                          <span className="text-white font-bold min-w-[80px]">Browser:</span>
                          <span>Some browsers limit animations to 60fps for battery saving. Ensure your laptop is plugged in.</span>
                       </li>
                    </ul>
                 </div>
              </div>

              <hr className="my-12 border-white/10" />

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                 <Layers className="text-green-500" /> V-Sync & G-Sync Interaction
              </h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                 This test runs using `requestAnimationFrame`, which naturally syncs to your monitor's refresh rate (V-Sync).
              </p>
              <div className="flex gap-4 p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-lg">
                 <AlertTriangle className="text-yellow-500 shrink-0" />
                 <p className="text-sm text-neutral-400">
                    <strong>Note for G-Sync/FreeSync Users:</strong> If you have Variable Refresh Rate (VRR) enabled for "Windowed Mode", this test might fluctuate in FPS. For the most accurate result, verify your desktop is set to a fixed maximum refresh rate.
                 </p>
              </div>
           </article>

           {/* Explicit FAQ Section for SEO Visibility */}
           <div className="border-t border-white/10 pt-12">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2"><HelpCircle size={24} /> Frequently Asked Questions</h3>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">How to check for Frame Skipping?</h4>
                    <p className="text-neutral-400 text-sm">Start the test and take a photo of the screen with a shutter speed of 1/5th or 1/10th of a second. If the trail of squares has gaps, your monitor is dropping frames.</p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">Why is my 144Hz monitor showing 60Hz?</h4>
                    <p className="text-neutral-400 text-sm">Check your Windows Display Settings to ensure the refresh rate is set correctly. Also, verify that your browser has 'Hardware Acceleration' enabled.</p>
                 </div>
              </div>
           </div>

        </section>

        <div className="max-w-7xl mx-auto px-6 w-full">
           <RelatedTools currentPath="/tests/refresh-rate" />
        </div>
      </div>
    </>
  );
};

export default RefreshRateTest;