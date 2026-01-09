import React, { useState, useRef, useEffect } from 'react';
import { MousePointer2, AlertTriangle, RotateCcw, Settings, Activity, Clock, Mouse } from 'lucide-react';
import { SEO } from '../common/SEO';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { RelatedTools } from '../common/RelatedTools';

interface ClickLog {
  id: number;
  button: number; // 0, 1, 2
  timestamp: number;
  diff: number;
  isFault: boolean;
}

const BUTTON_NAMES = {
  0: 'Left',
  1: 'Middle',
  2: 'Right',
  3: 'Back',
  4: 'Forward'
};

const DoubleClickTest: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [threshold, setThreshold] = useState(80); // ms
  const [clickCount, setClickCount] = useState(0);
  const [faultCount, setFaultCount] = useState(0);
  const [logs, setLogs] = useState<ClickLog[]>([]);
  const [lastButton, setLastButton] = useState<number | null>(null);
  
  // Refs for tracking timestamps per button without triggering re-renders
  const lastClickTimes = useRef<Record<number, number>>({});
  const logIdCounter = useRef(0);

  const startTest = () => {
    setIsActive(true);
    setClickCount(0);
    setFaultCount(0);
    setLogs([]);
    lastClickTimes.current = {};
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent default browser actions (text selection, etc.)
    e.preventDefault();
    
    if (!isActive) {
        startTest();
        // Don't count the start click itself as a test click usually, 
        // but for UX let's just process it if they click the big box.
    }

    const now = performance.now();
    const btn = e.button;
    const prevTime = lastClickTimes.current[btn] || 0;
    const diff = prevTime === 0 ? 0 : now - prevTime;
    
    // Logic: If diff is extremely small (e.g. < 80ms) and > 0, it's likely a bounce (fault).
    // Note: First click (diff 0) is never a fault.
    const isFault = diff > 0 && diff <= threshold;

    // Update Refs
    lastClickTimes.current[btn] = now;
    logIdCounter.current += 1;

    // Update State
    setLastButton(btn);
    setClickCount(prev => prev + 1);
    if (isFault) {
        setFaultCount(prev => prev + 1);
        // Optional: Play error sound?
    }

    const newLog: ClickLog = {
        id: logIdCounter.current,
        button: btn,
        timestamp: now,
        diff: diff,
        isFault
    };

    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50
  };

  // Prevent Context Menu on Right Click in the test area
  useEffect(() => {
    const handleContext = (e: MouseEvent) => {
        if (isActive) e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContext);
    return () => document.removeEventListener('contextmenu', handleContext);
  }, [isActive]);

  const getButtonColor = (btn: number) => {
      switch(btn) {
          case 0: return 'text-blue-400';
          case 2: return 'text-green-400';
          case 1: return 'text-purple-400';
          default: return 'text-neutral-400';
      }
  };

  const resetButton = () => {
      setClickCount(0);
      setFaultCount(0);
      setLogs([]);
      lastClickTimes.current = {};
      setLastButton(null);
  };

  return (
    <>
      <SEO 
        title="Double Click Test - Check Mouse Switch Faults" 
        description="Test your mouse for double-clicking issues (switch bouncing). Check Left, Right, and Middle buttons for accidental double clicks."
        canonical="/tools/double-click-test"
        keywords={['double click test', 'mouse switch test', 'mouse bouncing test', 'logitech double click fix', 'mouse debounce test']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Double Click Test', path: '/tools/double-click-test' }
        ]}
      />
      
      <div className="max-w-6xl mx-auto py-12 px-6 animate-fade-in min-h-screen">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
                        <MousePointer2 size={28} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Double Click Test</h1>
                </div>
                <p className="text-neutral-400 max-w-lg">
                    Click the box below to check if your mouse registers multiple clicks when you only press once (Switch Bouncing).
                </p>
            </div>

            {/* Stats Panel */}
            <div className="flex gap-4">
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl text-center min-w-[100px]">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Clicks</div>
                    <div className="text-3xl font-mono font-bold text-white">{clickCount}</div>
                </div>
                <div className={`bg-neutral-900 border p-4 rounded-xl text-center min-w-[100px] ${faultCount > 0 ? 'border-red-500/50 bg-red-900/10' : 'border-neutral-800'}`}>
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                        {faultCount > 0 && <AlertTriangle size={12} className="text-red-500" />} Faults
                    </div>
                    <div className={`text-3xl font-mono font-bold ${faultCount > 0 ? 'text-red-500' : 'text-green-500'}`}>{faultCount}</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- Left: Click Area --- */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* The Click Pad */}
                <div 
                    onMouseDown={handleMouseDown}
                    className={`
                        w-full aspect-[4/3] md:aspect-video rounded-3xl border-2 cursor-pointer transition-all duration-75 relative overflow-hidden group select-none
                        flex flex-col items-center justify-center
                        ${lastButton !== null 
                            ? (logs[0]?.isFault ? 'bg-red-500/20 border-red-500' : 'bg-neutral-800 border-neutral-600 active:bg-neutral-700 active:border-white')
                            : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
                        }
                    `}
                >
                    {/* Visual Feedback Text */}
                    <div className="pointer-events-none text-center transform transition-transform duration-75 active:scale-95">
                        {lastButton === null ? (
                            <>
                                <Mouse className="w-16 h-16 mx-auto mb-4 text-neutral-600 opacity-50" />
                                <span className="text-xl font-bold text-neutral-500">Click here to test</span>
                                <p className="text-sm text-neutral-600 mt-2">Supports Left, Right, and Middle buttons</p>
                            </>
                        ) : (
                            <>
                                <div className={`text-6xl font-bold mb-2 ${logs[0]?.isFault ? 'text-red-500' : 'text-white'}`}>
                                    {logs[0]?.isFault ? 'DOUBLE CLICKED!' : 'SINGLE CLICK'}
                                </div>
                                <div className="text-lg font-mono text-neutral-400">
                                    {BUTTON_NAMES[lastButton as keyof typeof BUTTON_NAMES] || `Button ${lastButton}`} 
                                    <span className="mx-2">•</span> 
                                    {logs[0]?.diff === 0 ? 'Start' : `${Math.round(logs[0]?.diff)}ms`}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Fault Overlay Flash */}
                    {logs[0]?.isFault && (
                        <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none"></div>
                    )}
                </div>

                {/* Settings Bar */}
                <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 text-neutral-400">
                            <Settings size={18} />
                            <span className="text-sm font-bold">Failure Threshold</span>
                        </div>
                        <div className="flex items-center gap-3 flex-1 max-w-xs">
                            <input 
                                type="range" 
                                min="10" 
                                max="200" 
                                step="10"
                                value={threshold}
                                onChange={(e) => setThreshold(Number(e.target.value))}
                                className="flex-1 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <span className="font-mono text-white text-sm w-12">{threshold}ms</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={resetButton}
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>
            </div>

            {/* --- Right: Log --- */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity size={16} className="text-orange-500" /> Event Log
                    </h3>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Recent 50</span>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {logs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-600 text-sm">
                            <Clock size={32} className="mb-2 opacity-20" />
                            <p>Waiting for input...</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div 
                                key={log.id} 
                                className={`
                                    flex items-center justify-between p-3 rounded-lg border text-sm transition-all
                                    ${log.isFault 
                                        ? 'bg-red-900/10 border-red-900/30' 
                                        : 'bg-neutral-800/30 border-transparent hover:bg-neutral-800'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold w-12 ${getButtonColor(log.button)}`}>
                                        {BUTTON_NAMES[log.button as keyof typeof BUTTON_NAMES]?.toUpperCase().slice(0,3) || `B${log.button}`}
                                    </span>
                                    <span className="text-neutral-500 text-xs font-mono">
                                        {new Date(log.timestamp).toLocaleTimeString([], {hour12:false, minute:'2-digit', second:'2-digit'})}.{Math.floor(log.timestamp % 1000).toString().padStart(3,'0')}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className={`font-mono font-bold ${log.isFault ? 'text-white' : 'text-neutral-400'}`}>
                                        {Math.round(log.diff)}ms
                                    </span>
                                    {log.isFault && (
                                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded uppercase">
                                            Fault
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>

        {/* --- SEO Content --- */}
        <section className="mt-20 border-t border-white/10 pt-16">
            <h2 className="text-2xl font-bold text-white mb-8">About Mouse Double Clicking</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <InfoCard title="What is Switch Bouncing?">
                        <p>Mechanical switches inside mice use a metal spring contact. When you click, this metal creates a circuit. As it wears out (oxidation or metal fatigue), the contact may "bounce" microscopically, creating multiple electrical signals from a single press.</p>
                    </InfoCard>
                    <InfoCard title="The 'Double Click' Issue">
                        <p>This is notorious in popular gaming mice (like older Logitech G Pro or Razer models). It manifests as dragging items accidentally dropping, or single-clicking a file and having it open instantly.</p>
                    </InfoCard>
                </div>
                
                <div className="bg-neutral-900/50 p-8 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">How to Fix It?</h3>
                    <ul className="space-y-4 text-sm text-neutral-400">
                        <li className="flex gap-3">
                            <span className="text-white font-bold min-w-[20px]">1.</span>
                            <span><strong>Firmware Update:</strong> Manufacturers sometimes release updates that increase the "debounce time" (the software delay that ignores signals too close together).</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-white font-bold min-w-[20px]">2.</span>
                            <span><strong>Compressed Air:</strong> Sometimes static or dust causes the issue. Try blowing air under the buttons (while the mouse is off).</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-white font-bold min-w-[20px]">3.</span>
                            <span><strong>Replace Switches:</strong> If you are handy with soldering, replacing the Omron switches with Kailh GM 8.0 or Japanese Omrons is a permanent fix.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 w-full">
           <RelatedTools currentPath="/tools/double-click-test" />
        </div>

      </div>
    </>
  );
};

export default DoubleClickTest;