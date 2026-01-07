import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MousePointer2, Activity, Zap, Info, RotateCcw, Monitor, Gamepad2, Smartphone, HelpCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { SEO } from '../common/SEO';
import { RelatedTools } from '../common/RelatedTools';
import { useMobile } from '../../hooks/useMobile';

// Configuration
const GRAPH_POINTS = 100;

const MousePollingTest: React.FC = () => {
  const isMobile = useMobile();
  const [isActive, setIsActive] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [maxRate, setMaxRate] = useState(0);
  const [avgRate, setAvgRate] = useState(0);
  const [currentRate, setCurrentRate] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  const lastTimeRef = useRef<number>(0);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setHistory([]);
    setMaxRate(0);
    setAvgRate(0);
    setCurrentRate(0);
    setEventCount(0);
    lastTimeRef.current = 0;
  };

  useEffect(() => {
    if (isMobile) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Use getCoalescedEvents if available to get sub-frame updates (crucial for >60Hz mice)
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      
      const now = performance.now();
      
      // We only process if we have valid history to compare diff
      if (lastTimeRef.current > 0) {
         let lastT = lastTimeRef.current;
         const rates: number[] = [];

         events.forEach(ev => {
             const t = ev.timeStamp;
             if (t > lastT) {
                 const delta = t - lastT;
                 const hz = 1000 / delta;
                 // Filter impossible spikes (e.g. <0.1ms)
                 if (hz < 10000) {
                    rates.push(hz);
                 }
                 lastT = t;
             }
         });

         if (rates.length > 0) {
             // Average the rates in this frame for display stability
             const frameAvg = rates.reduce((a,b) => a+b, 0) / rates.length;
             setCurrentRate(frameAvg);
             
             // Update Stats
             setEventCount(prev => prev + events.length);
             setMaxRate(prev => Math.max(prev, ...rates));
             setHistory(prev => {
                 const next = [...prev, ...rates];
                 return next.slice(-GRAPH_POINTS); // Keep last N points
             });
         }
      }
      
      // Update last time to the latest event in the list
      if (events.length > 0) {
          lastTimeRef.current = events[events.length - 1].timeStamp;
      }
      
      setIsActive(true);
      
      // Reset active state if no motion for a while
      if (animationRef.current) clearTimeout(animationRef.current);
      animationRef.current = window.setTimeout(() => {
          setIsActive(false);
          setCurrentRate(0);
          lastTimeRef.current = 0;
      }, 100);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isMobile]);

  // Calculate Running Average efficiently
  useEffect(() => {
      if (history.length > 0) {
          // Average of the last 1000 points or all history
          const subset = history.slice(-1000); 
          setAvgRate(Math.round(subset.reduce((a, b) => a + b, 0) / subset.length));
      }
  }, [history.length]); // Only update when history grows

  // Generate SVG Path for Graph
  const graphPath = useMemo(() => {
      if (history.length < 2) return '';
      const w = 100; // viewbox width
      const h = 50;  // viewbox height
      const scaleMax = Math.max(1000, maxRate * 1.1);
      
      const points = history.map((val, i) => {
          const x = (i / (GRAPH_POINTS - 1)) * w;
          const y = h - (val / scaleMax) * h;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
      
      return `M ${points.join(' L ')}`;
  }, [history, maxRate]);

  return (
    <>
      <SEO 
        title="Mouse Polling Rate Checker - Test Hz (1000Hz, 8000Hz)" 
        description="Check your mouse polling rate (Hz) in real-time. Verify if your gaming mouse is truly running at 1000Hz, 4000Hz, or 8000Hz."
        canonical="/tools/mouse-polling"
        keywords={['mouse polling rate test', 'mouse hz checker', 'polling rate test', '1000hz mouse test', 'gaming mouse test']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Mouse Polling Rate', path: '/tools/mouse-polling' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Mouse Polling Rate Checker",
              "url": "https://deadpixeltest.cc/tools/mouse-polling",
              "description": "Test your mouse's report rate (Hz) in real-time. Supports high-frequency gaming mice (1000Hz, 4000Hz, 8000Hz).",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Is 1000Hz better than 500Hz for gaming?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Technically yes, as 1000Hz reports position every 1ms compared to 2ms for 500Hz. However, the difference is very subtle. Pro players prefer 1000Hz for maximum responsiveness, but 500Hz is smoother on some systems."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How to check my mouse Polling Rate?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Move your mouse quickly in continuous circles on this page. The 'Average' Hz counter will stabilize at your polling rate (usually 125, 500, or 1000)."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does high polling rate affect FPS?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. extremely high rates (4000Hz/8000Hz) can consume significant CPU resources, causing FPS drops or stuttering in older games that aren't optimized for high-frequency input."
                  }
                }
              ]
            },
            {
              "@type": "HowTo",
              "name": "How to Check Mouse Polling Rate",
              "step": [
                { "@type": "HowToStep", "text": "Close other CPU-intensive applications for the most accurate reading." },
                { "@type": "HowToStep", "text": "Move your mouse cursor quickly in continuous circles over the test area." },
                { "@type": "HowToStep", "text": "Observe the 'Live Rate' and 'Average' Hz counters." },
                { "@type": "HowToStep", "text": "Verify if the average matches your mouse settings (e.g., 1000Hz, 500Hz)." }
              ]
            }
          ]
        }}
      />
      <div className="max-w-5xl mx-auto py-12 px-6 animate-fade-in">
        {/* ... (Rest of component remains unchanged) ... */}
        {/* Header */}
        <div className="text-center mb-12">
           <div className="inline-flex items-center justify-center p-4 bg-green-500/10 text-green-500 rounded-2xl mb-4">
              <Activity size={32} />
           </div>
           <h1 className="text-4xl font-bold text-white mb-4">Mouse Polling Rate</h1>
           <p className="text-neutral-400 max-w-lg mx-auto">
              Move your cursor quickly in circles to test the report rate (Hz) of your mouse.
           </p>
        </div>

        {isMobile ? (
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl text-center">
             <Smartphone size={48} className="mx-auto text-neutral-600 mb-4" />
             <h2 className="text-xl font-bold text-white mb-2">Desktop Only Tool</h2>
             <p className="text-neutral-400 text-sm mb-6">
                Polling rate testing is designed for USB/Wireless mice on desktop computers. Touch screens work differently (usually 60Hz or 120Hz locked).
             </p>
             <p className="text-neutral-500 text-xs">Try the <a href="/tools/touch" className="text-blue-400 hover:underline">Touch Screen Test</a> instead.</p>
          </div>
        ) : (
          <>
            {/* Main Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
               {/* Live Rate */}
               <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center transition-colors duration-200 ${isActive ? 'bg-green-900/10 border-green-500/30' : 'bg-neutral-900/30 border-white/10'}`}>
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Live Rate</div>
                  <div className={`text-6xl font-mono font-bold tabular-nums ${isActive ? 'text-green-400' : 'text-neutral-600'}`}>
                     {Math.round(currentRate)}
                  </div>
                  <div className="text-sm font-bold text-neutral-500 mt-1">Hz</div>
               </div>

               {/* Average */}
               <div className="p-8 rounded-2xl bg-neutral-900/30 border border-white/10 flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Average</div>
                  <div className="text-6xl font-mono font-bold text-blue-400 tabular-nums">
                     {avgRate}
                  </div>
                  <div className="text-sm font-bold text-neutral-500 mt-1">Hz</div>
               </div>

               {/* Peak */}
               <div className="p-8 rounded-2xl bg-neutral-900/30 border border-white/10 flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Peak</div>
                  <div className="text-6xl font-mono font-bold text-purple-400 tabular-nums">
                     {Math.round(maxRate)}
                  </div>
                  <div className="text-sm font-bold text-neutral-500 mt-1">Hz</div>
               </div>
            </div>

            {/* Graph Area */}
            <div 
              ref={containerRef}
              className="w-full h-64 bg-black border border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center group cursor-crosshair"
            >
               {history.length > 2 ? (
                   <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full opacity-80">
                      <defs>
                         <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                         </linearGradient>
                      </defs>
                      <path d={graphPath} fill="none" stroke="#22c55e" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                      <path d={`${graphPath} V 50 H 0 Z`} fill="url(#lineGrad)" stroke="none" />
                   </svg>
               ) : (
                   <div className="flex flex-col items-center text-neutral-600">
                      <MousePointer2 size={48} className="mb-4 animate-bounce" />
                      <span className="font-bold">Move Mouse Here</span>
                   </div>
               )}
               
               {/* Stability Note */}
               <div className="absolute top-4 right-4 text-xs font-mono text-neutral-500 bg-black/50 px-2 py-1 rounded">
                  Events Processed: {eventCount}
               </div>
            </div>

            <div className="mt-8 flex justify-center">
               <Button onClick={reset} variant="secondary" icon={RotateCcw}>
                  Reset Statistics
               </Button>
            </div>
          </>
        )}

        {/* SEO Content Section */}
        <section className="mt-16 space-y-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           
           <div className="grid md:grid-cols-2 gap-12">
              <div>
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="text-yellow-500" /> 125Hz vs 500Hz vs 1000Hz
                 </h2>
                 <p className="text-neutral-400 leading-relaxed text-sm mb-4">
                    Polling rate measures how often your mouse reports its position to your computer.
                 </p>
                 <ul className="text-neutral-400 text-sm space-y-2 list-disc pl-4">
                    <li><strong>125Hz:</strong> Standard office mice. Reports every 8ms. Can feel "floaty" in games.</li>
                    <li><strong>500Hz:</strong> Gaming standard. Reports every 2ms. Smooth and stable.</li>
                    <li><strong>1000Hz:</strong> Pro gaming standard. Reports every 1ms.</li>
                 </ul>
              </div>
              <div>
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Monitor className="text-blue-500" /> Why 4000Hz/8000Hz?
                 </h2>
                 <p className="text-neutral-400 leading-relaxed text-sm mb-4">
                    Newer mice (Razer HyperPolling, Logitech Superlight 2) support up to 8000Hz (0.125ms delay). 
                 </p>
                 <p className="text-neutral-400 leading-relaxed text-sm">
                    <strong>Is it worth it?</strong> Only if you have a 240Hz+ monitor. On 60Hz screens, the visual difference is negligible, and high polling rates can actually cause CPU stutter in some older games.
                 </p>
              </div>
           </div>

           {/* FAQ Section Visual - Matches Schema */}
           <div className="border-t border-white/10 pt-12">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                 <HelpCircle className="text-blue-400" /> Frequently Asked Questions
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">Is 1000Hz better than 500Hz for gaming?</h4>
                    <p className="text-neutral-400 text-sm">Technically yes, as 1000Hz reports position every 1ms compared to 2ms for 500Hz. However, the difference is very subtle. Pro players prefer 1000Hz for maximum responsiveness, but 500Hz is smoother on some systems.</p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">Does high polling rate affect FPS?</h4>
                    <p className="text-neutral-400 text-sm">Yes. extremely high rates (4000Hz/8000Hz) can consume significant CPU resources, causing FPS drops or stuttering in older games that aren't optimized for high-frequency input.</p>
                 </div>
              </div>
           </div>

           <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-8 mt-8">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 <Gamepad2 className="text-purple-500" /> Troubleshooting Stutter
              </h3>
              <p className="text-sm text-neutral-400 mb-2">
                 If your game stutters or drops FPS when you move your mouse:
              </p>
              <ol className="text-sm text-neutral-400 list-decimal pl-4 space-y-2">
                 <li>Lower your polling rate from 1000Hz to 500Hz in your mouse software.</li>
                 <li>Some older game engines cannot handle 1000 updates per second.</li>
                 <li>Ensure your CPU is not maxing out at 100% usage.</li>
              </ol>
           </div>

        </section>

        <div className="max-w-7xl mx-auto px-6 w-full">
           <RelatedTools currentPath="/tools/mouse-polling" />
        </div>

      </div>
    </>
  );
};

export default MousePollingTest;