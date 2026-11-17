import React, { useRef, useEffect, useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, Monitor, Zap, Info, Camera, Activity, AlertTriangle, Cpu, Layers, HelpCircle } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';
import { RelatedTools } from '../common/RelatedTools';

const GRID_COLUMNS = 12;
const GRID_ROWS = 10;
const GRID_SLOTS = GRID_COLUMNS * GRID_ROWS;
const SHUTTER_DENOMINATORS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 125, 160, 200, 250];

const RefreshRateTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fps, setFps] = useState(0);
  
  const requestRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);

  const startTest = () => {
    setFps(0);
    frameCountRef.current = 0;
    lastTimeRef.current = 0;
    setIsActive(true);
    enterFullscreen();
  };

  const stopTest = () => {
    setIsActive(false);
    exitFullscreen();
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  // A timing test must not keep drawing after its tab is hidden or the
  // browser leaves native fullscreen. Escape also exits the in-page fallback.
  useEffect(() => {
    if (!isActive) return;

    const stopWhenHidden = () => {
      if (document.visibilityState === 'hidden') {
        setIsActive(false);
        void exitFullscreen();
      }
    };
    const stopOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsActive(false);
        void exitFullscreen();
      }
    };
    const stopAfterFullscreenExit = () => {
      if (!document.fullscreenElement) setIsActive(false);
    };

    document.addEventListener('visibilitychange', stopWhenHidden);
    document.addEventListener('fullscreenchange', stopAfterFullscreenExit);
    window.addEventListener('keydown', stopOnEscape);
    return () => {
      document.removeEventListener('visibilitychange', stopWhenHidden);
      document.removeEventListener('fullscreenchange', stopAfterFullscreenExit);
      window.removeEventListener('keydown', stopOnEscape);
    };
  }, [isActive, exitFullscreen]);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let currentSlot = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const render = (time: number) => {
        // Browser animation cadence: wait for a full measurement window.
        if (lastTimeRef.current === 0) lastTimeRef.current = time;
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

        const gridWidth = Math.min(canvas.width * 0.9, 840);
        const gridHeight = Math.min(canvas.height * 0.48, 420);
        const cellWidth = gridWidth / GRID_COLUMNS;
        const cellHeight = gridHeight / GRID_ROWS;
        const left = (canvas.width - gridWidth) / 2;
        const top = (canvas.height - gridHeight) / 2;
        const x = left + (currentSlot % GRID_COLUMNS) * cellWidth;
        const y = top + Math.floor(currentSlot / GRID_COLUMNS) * cellHeight;

        ctx.strokeStyle = '#333';
        ctx.beginPath();
        for (let column = 0; column <= GRID_COLUMNS; column++) {
          const lineX = left + column * cellWidth;
          ctx.moveTo(lineX, top);
          ctx.lineTo(lineX, top + gridHeight);
        }
        for (let row = 0; row <= GRID_ROWS; row++) {
          const lineY = top + row * cellHeight;
          ctx.moveTo(left, lineY);
          ctx.lineTo(left + gridWidth, lineY);
        }
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(currentSlot + 1), x + cellWidth / 2, y + cellHeight / 2);

        currentSlot = (currentSlot + 1) % GRID_SLOTS;

        requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
        window.removeEventListener('resize', resize);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive]);

  if (isActive) {
    // Keep the exposure within half a sequence, leaving room for cadence changes.
    const shutter = SHUTTER_DENOMINATORS.find(value => fps / value <= GRID_SLOTS / 2);
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
                    <div className="text-xs text-neutral-600 mt-2">Browser FPS estimate</div>
                </div>
            </div>
        </div>

        <div className="absolute bottom-12 left-0 w-full text-center pointer-events-none">
            <p className="text-white/50 font-mono text-sm bg-black/50 inline-block px-4 py-2 rounded">
                {fps === 0 ? 'Wait for the browser FPS reading before taking a photo.'
                  : shutter ? `Use 1/${shutter} s or faster. Compare repeated photos of the numbered grid.`
                  : 'Use an exposure shorter than half a grid cycle.'}
            </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Refresh Rate & Frame Skipping Test (Hz Check)" 
        description="Estimate browser animation FPS and investigate possible frame skipping with an external camera; this is not a direct measurement of hardware Hz."
        canonical="/tests/refresh-rate"
        keywords={['refresh rate test', 'hz test', 'frame skipping test', 'monitor overclock test', 'fps test', 'vsync test']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Refresh Rate Test', path: '/tests/refresh-rate' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Monitor Refresh Rate Checker",
              "description": "Estimate browser animation FPS and help investigate possible frame skipping using an external camera; hardware refresh Hz is not directly measured.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How to check for Frame Skipping?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Let the browser FPS stabilize and use the exposure recommendation displayed in the test. Gaps can suggest irregular frame presentation, but browser timing and camera exposure can also cause them. Repeat under controlled conditions; this photo alone cannot diagnose hardware frame skipping."
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
                    "text": "Hz describes display refreshes per second, whereas FPS describes rendered frames. Browser animation cadence can approximate refresh timing but cannot confirm the panel’s hardware refresh rate; VRR and frame pacing affect the relationship."
                  }
                }
              ]
            },
            {
              "@type": "HowTo",
              "name": "How to Check Monitor Refresh Rate",
              "step": [
                { "@type": "HowToStep", "text": "Close all other browser tabs and applications to ensure maximum performance." },
                { "@type": "HowToStep", "text": "Start the test. A white block will move across the grid slots." },
                { "@type": "HowToStep", "text": "Read the 'Browser FPS' estimate. Compare it with your operating-system display setting, but do not treat it as a direct measurement of physical refresh Hz." },
                { "@type": "HowToStep", "text": "To check for frame skipping (on overclocked monitors), take a photo with a separate camera set to the recommended exposure or faster." }
              ]
            }
          ]
        }}
      />
      <div className="flex flex-col min-h-screen">
        <TestIntro
          title="Refresh Rate & Frame Skipping"
          description="Observe browser animation FPS and use an external camera to investigate frame skipping. Browser FPS is not hardware Hz."
          onStart={startTest}
        >
          <InfoCard title="How to Check Frame Skipping">
            <ol className="list-decimal pl-4 space-y-2 text-sm text-neutral-400 mt-2">
                <li>Start the test. A white block will move across the grid.</li>
                <li>Open your phone camera in <strong>Pro/Manual Mode</strong>.</li>
                <li>Use the shutter speed shown after the FPS estimate stabilizes, or set a shorter exposure.</li>
                <li>Take a photo of the moving block.</li>
                <li><strong>Result:</strong> A regular trail can be consistent with stable presentation, but gaps may also come from browser timing or camera exposure. Repeat the test and verify with your display's settings or a dedicated hardware method.</li>
            </ol>
          </InfoCard>
          <InfoCard title="Hz vs FPS">
            <p>
              This tool measures <strong>Browser FPS</strong>, not guaranteed hardware Hz. Browser throttling, power settings, and the operating system can affect the result.
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
                       This results in stuttery motion, which defeats the purpose of a higher refresh rate. This animation can help you investigate possible irregular frame presentation with an external camera. It cannot certify that an overclock is stable.
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
                 This test uses requestAnimationFrame, whose cadence is affected by the browser, operating system and display pipeline. It is not a direct hardware refresh-rate measurement.
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
              {/* SEO OPTIMIZATION: H3 -> H2 for main FAQ section */}
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2"><HelpCircle size={24} /> Frequently Asked Questions</h2>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">How to check for Frame Skipping?</h4>
                    <p className="text-neutral-400 text-sm">Let the browser FPS stabilize and use the exposure recommendation displayed in the test. Gaps can suggest irregular frame presentation, but browser timing and camera exposure can also cause them. Repeat under controlled conditions; this photo alone cannot diagnose hardware frame skipping.</p>
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