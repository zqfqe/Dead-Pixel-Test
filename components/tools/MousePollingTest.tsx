import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MousePointer2, Activity, Zap, Info, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

// Configuration
const GRAPH_POINTS = 100;

const MousePollingTest: React.FC = () => {
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
    const handlePointerMove = (e: PointerEvent) => {
      // Use getCoalescedEvents if available to get sub-frame updates (crucial for >60Hz mice)
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      
      const now = performance.now();
      
      // We only process if we have valid history to compare diff
      if (lastTimeRef.current > 0) {
         // Calculate rate based on the last event time
         // However, with coalesced events, we might have multiple events in one frame.
         // A more accurate way for visualization is to calculate instantaneous rate between events.
         
         let lastT = lastTimeRef.current;
         const rates: number[] = [];

         events.forEach(ev => {
             // For coalesced events, the timestamp might be high precision
             // but sometimes browser implementation varies. 
             // We use the event.timeStamp if strictly monotonic, else interpolate?
             // Safest is to just count events per time window, but for "Instant Hz", we use delta.
             
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
  }, []);

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
      const max = 2000; // Fixed scale for graph (2000hz) or dynamic?
      // Let's use dynamic but clamped to at least 1000
      const scaleMax = Math.max(1000, maxRate * 1.1);
      
      const points = history.map((val, i) => {
          const x = (i / (GRAPH_POINTS - 1)) * w;
          const y = h - (val / scaleMax) * h;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
      
      return `M ${points.join(' L ')}`;
  }, [history, maxRate]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-fade-in">
      <div className="text-center mb-12">
         <div className="inline-flex items-center justify-center p-4 bg-green-500/10 text-green-500 rounded-2xl mb-4">
            <Activity size={32} />
         </div>
         <h1 className="text-4xl font-bold text-white mb-4">Mouse Polling Rate</h1>
         <p className="text-neutral-400 max-w-lg mx-auto">
            Move your cursor quickly in circles to test the report rate (Hz) of your mouse.
            <br/><span className="text-xs opacity-60">Supports 8000Hz+ via Coalesced Events API.</span>
         </p>
      </div>

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

      {/* Info Section */}
      <div className="mt-16 bg-blue-900/10 border border-blue-500/20 rounded-xl p-6 text-sm text-neutral-400 flex gap-4 max-w-3xl mx-auto">
         <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
         <div className="space-y-2">
            <p>
               <strong className="text-blue-400">Why doesn't it lock to 1000Hz?</strong><br/>
               Polling rate is dynamic. If you move the mouse slowly, it sends fewer updates to save power/bandwidth. To test the maximum rate, you must move the mouse <strong>as fast as possible</strong>.
            </p>
            <p>
               <strong className="text-blue-400">Browser Limitations:</strong><br/>
               Modern browsers (Chrome 75+) use <code>getCoalescedEvents()</code> to expose high-frequency mouse updates. If you are stuck at 60Hz/144Hz, ensure your browser has hardware acceleration enabled.
            </p>
         </div>
      </div>

    </div>
  );
};

export default MousePollingTest;