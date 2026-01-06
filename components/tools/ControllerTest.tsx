import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Gamepad2, Zap, Target, Activity, RefreshCw, AlertCircle, Settings2, Trash2, MousePointer2 } from 'lucide-react';
import { SEO } from '../common/SEO';

// --- TYPES ---
type ControllerLayout = 'xbox' | 'playstation' | 'nintendo';

interface Point {
  x: number;
  y: number;
  t: number; // timestamp for fading
}

// --- CONTROLLER SVG RENDERER ---
const ControllerVisualizer = ({ 
  gamepad, 
  layout 
}: { 
  gamepad: Gamepad; 
  layout: ControllerLayout;
}) => {
  const { buttons, axes } = gamepad;
  
  // Helper to get button state safely
  const isPressed = (idx: number) => buttons[idx]?.pressed;
  
  // Layout Mappings (Visual Labels)
  const labels = {
    xbox: { a: 'A', b: 'B', x: 'X', y: 'Y', lb: 'LB', rb: 'RB', lt: 'LT', rt: 'RT' },
    playstation: { a: '×', b: '○', x: '□', y: '△', lb: 'L1', rb: 'R1', lt: 'L2', rt: 'R2' },
    nintendo: { a: 'A', b: 'B', x: 'X', y: 'Y', lb: 'L', rb: 'R', lt: 'ZL', rt: 'ZR' },
  };

  // Nintendo swaps A/B and X/Y positions physically relative to Xbox, 
  // but standard Gamepad API maps by physical location usually:
  // 0: Bottom, 1: Right, 2: Left, 3: Top.
  // We will keep the physical circles same, just change labels/colors.

  const currentLabels = labels[layout];
  
  // Colors
  const btnActive = "#3b82f6";
  const btnBase = "#222";

  return (
    <div className="relative w-full max-w-[600px] aspect-[1.5] mx-auto select-none">
      <svg viewBox="0 0 320 220" className="w-full h-full drop-shadow-2xl">
        {/* Body Outline */}
        <path d="M85,60 C50,60 30,90 30,130 C30,180 60,200 90,200 C110,200 120,170 160,170 C200,170 210,200 230,200 C260,200 290,180 290,130 C290,90 270,60 235,60 H85 Z" 
              fill="#1a1a1a" stroke="#333" strokeWidth="2" />

        {/* --- TRIGGERS (Visual indicators behind) --- */}
        <path d="M50,50 Q70,30 100,50" stroke={isPressed(4) ? btnActive : "#444"} strokeWidth="8" fill="none" />
        <text x="75" y="45" fontSize="8" fill="#888" textAnchor="middle">{currentLabels.lb}</text>

        <path d="M220,50 Q250,30 270,50" stroke={isPressed(5) ? btnActive : "#444"} strokeWidth="8" fill="none" />
        <text x="245" y="45" fontSize="8" fill="#888" textAnchor="middle">{currentLabels.rb}</text>

        {/* --- D-PAD (Left Side) --- */}
        <g transform="translate(90, 110)">
           <path d="M-15,-45 h30 v30 h30 v30 h-30 v30 h-30 v-30 h-30 v-30 h30 z" fill="#111" />
           <path d="M-10,-40 h20 v25 h-20 z" fill={isPressed(12) ? btnActive : "#333"} /> {/* Up */}
           <path d="M-10,15 h20 v25 h-20 z" fill={isPressed(13) ? btnActive : "#333"} /> {/* Down */}
           <path d="M-40,-10 h25 v20 h-25 z" fill={isPressed(14) ? btnActive : "#333"} /> {/* Left */}
           <path d="M15,-10 h25 v20 h-25 z" fill={isPressed(15) ? btnActive : "#333"} /> {/* Right */}
        </g>

        {/* --- FACE BUTTONS (Right Side) --- */}
        <g transform="translate(230, 110)">
           {/* Bottom (Xbox A, PS Cross) */}
           <circle cx="0" cy="30" r="11" fill={isPressed(0) ? btnActive : btnBase} stroke="#000" />
           <text x="0" y="34" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">{currentLabels.a}</text>

           {/* Right (Xbox B, PS Circle) */}
           <circle cx="30" cy="0" r="11" fill={isPressed(1) ? "#ef4444" : btnBase} stroke="#000" />
           <text x="30" y="4" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">{currentLabels.b}</text>

           {/* Left (Xbox X, PS Square) */}
           <circle cx="-30" cy="0" r="11" fill={isPressed(2) ? btnActive : btnBase} stroke="#000" />
           <text x="-30" y="4" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">{currentLabels.x}</text>

           {/* Top (Xbox Y, PS Triangle) */}
           <circle cx="0" cy="-30" r="11" fill={isPressed(3) ? "#eab308" : btnBase} stroke="#000" />
           <text x="0" y="-26" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">{currentLabels.y}</text>
        </g>

        {/* --- STICKS --- */}
        {/* Left Stick */}
        <g transform={`translate(${75 + (axes[0] * 15)}, ${90 + (axes[1] * 15)})`}>
           <circle r="22" fill="#151515" stroke="#000" />
           <circle r="20" fill="url(#stickGradient)" opacity={isPressed(10) ? 0.9 : 0.4} />
           <defs>
             <radialGradient id="stickGradient">
               <stop offset="0%" stopColor="#3b82f6" />
               <stop offset="100%" stopColor="#222" />
             </radialGradient>
           </defs>
        </g>

        {/* Right Stick */}
        <g transform={`translate(${195 + (axes[2] * 15)}, ${140 + (axes[3] * 15)})`}>
           <circle r="22" fill="#151515" stroke="#000" />
           <circle r="20" fill="url(#stickGradient)" opacity={isPressed(11) ? 0.9 : 0.4} />
        </g>

        {/* --- CENTER BUTTONS --- */}
        <g transform="translate(160, 110)">
           <rect x="-35" y="-10" width="20" height="10" rx="3" fill={isPressed(8) ? "#fff" : "#222"} /> {/* Select */}
           <rect x="15" y="-10" width="20" height="10" rx="3" fill={isPressed(9) ? "#fff" : "#222"} /> {/* Start */}
           <circle cx="0" cy="-25" r="14" fill={isPressed(16) ? btnActive : "#333"} stroke="#111" /> {/* Guide */}
           <text x="0" y="-45" fontSize="8" fill="#555" textAnchor="middle">GUIDE</text>
        </g>
      </svg>
    </div>
  );
};

// --- ADVANCED STICK ANALYZER ---
const StickAnalysis = ({ 
  x, y, label, isCircular, onReset 
}: { 
  x: number; y: number; label: string; isCircular: boolean; onReset?: () => void 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [errorRate, setErrorRate] = useState<number | null>(null);

  // Track points for trail and circularity
  useEffect(() => {
    const now = performance.now();
    
    // Add point
    setPoints(prev => {
       const newPoints = [...prev, { x, y, t: now }];
       // Keep only last 2s of trail for visual, but we might keep circularity points differently
       // For this demo, we keep separate circularity logic inside the component state if needed, 
       // but strictly speaking, circularity usually accumulates max values.
       return newPoints.filter(p => now - p.t < 500); // 500ms trail
    });

  }, [x, y]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w / 2 - 2; // padding

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw Bounds
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

    // Draw Trail
    if (points.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      points.forEach((p, i) => {
         const px = cx + (p.x * radius);
         const py = cy + (p.y * radius);
         const alpha = i / points.length;
         ctx.globalAlpha = alpha;
         ctx.lineWidth = 2 + (alpha * 4);
         
         if (i === 0) ctx.moveTo(px, py);
         else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw Current Position Cursor
    const currX = cx + (x * radius);
    const currY = cy + (y * radius);
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(currX, currY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Calculate Circularity Error (If pushed to edge)
    // Distance from center
    const dist = Math.sqrt(x*x + y*y);
    if (dist > 0.8) {
       // Only calculate error on outer ring attempts
       // Error is deviation from 1.0
       const err = Math.abs(dist - 1.0) * 100;
       // We'd ideally average this over time in a ref
       // For simple visualizer, we just show current deviation if near edge
       // setErrorRate(err); 
    }

  }, [points, x, y]);

  // Circularity Logic (Accumulated)
  const maxPoints = useRef<{x:number, y:number}[]>([]);
  useEffect(() => {
     const dist = Math.sqrt(x*x + y*y);
     // If user is rotating along the edge (mag > 0.7)
     if (dist > 0.7) {
        maxPoints.current.push({x, y});
     }
  }, [x,y]);

  const calcError = () => {
     if (maxPoints.current.length < 50) return 0;
     let totalErr = 0;
     maxPoints.current.forEach(p => {
        const d = Math.sqrt(p.x*p.x + p.y*p.y);
        totalErr += Math.abs(d - 1.0);
     });
     return (totalErr / maxPoints.current.length) * 100;
  };

  const avgError = calcError();

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32 md:w-40 md:h-40 bg-black rounded-full border border-neutral-800 shadow-inner">
        <canvas ref={canvasRef} width={160} height={160} className="w-full h-full" />
      </div>
      
      <div className="mt-3 flex items-center justify-between w-full px-2">
         <div className="text-xs font-mono text-neutral-400">
           {label}
         </div>
         <div className="text-xs font-mono text-white">
            {x.toFixed(2)}, {y.toFixed(2)}
         </div>
      </div>
      
      <div className="mt-1 w-full bg-neutral-900 rounded p-2 border border-white/5 flex justify-between items-center">
         <span className="text-[10px] text-neutral-500 uppercase font-bold">Circularity Error</span>
         <span className={`text-xs font-mono font-bold ${avgError > 15 ? 'text-red-500' : avgError > 10 ? 'text-yellow-500' : 'text-green-500'}`}>
            {avgError > 0 ? `${avgError.toFixed(1)}%` : '--'}
         </span>
      </div>
      <button 
        onClick={() => { maxPoints.current = []; setPoints([]); onReset?.(); }}
        className="mt-1 text-[10px] text-blue-500 hover:text-white flex items-center gap-1"
      >
        <Trash2 size={10} /> Reset Stats
      </button>
    </div>
  );
};


const ControllerTest: React.FC = () => {
  const [gamepads, setGamepads] = useState<(Gamepad | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [layout, setLayout] = useState<ControllerLayout>('xbox');
  const reqRef = useRef<number>();
  
  // Polling Rate Calc
  const lastUpdateRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const [pollingRate, setPollingRate] = useState(0);

  useEffect(() => {
    const scanGamepads = () => {
      const gps = navigator.getGamepads ? navigator.getGamepads() : [];
      setGamepads(Array.from(gps));
      
      const now = performance.now();
      frameCountRef.current++;
      if (now - lastUpdateRef.current >= 1000) {
        setPollingRate(frameCountRef.current);
        frameCountRef.current = 0;
        lastUpdateRef.current = now;
      }

      reqRef.current = requestAnimationFrame(scanGamepads);
    };

    window.addEventListener("gamepadconnected", scanGamepads);
    window.addEventListener("gamepaddisconnected", scanGamepads);
    reqRef.current = requestAnimationFrame(scanGamepads);

    return () => {
      window.removeEventListener("gamepadconnected", scanGamepads);
      window.removeEventListener("gamepaddisconnected", scanGamepads);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, []);

  const activeGamepad = gamepads[activeIdx];

  // Vibration
  const triggerRumble = useCallback((duration: number, weak: number, strong: number) => {
    if (activeGamepad && activeGamepad.vibrationActuator) {
      activeGamepad.vibrationActuator.playEffect("dual-rumble", {
        startDelay: 0,
        duration: duration,
        weakMagnitude: weak,
        strongMagnitude: strong,
      });
    }
  }, [activeGamepad]);

  if (!activeGamepad) {
    return (
      <>
        <SEO 
          title="Gamepad Tester - Check Controller Inputs Online" 
          description="Test your Xbox, PlayStation (PS4/PS5), or Nintendo Switch controller online. Check buttons, joystick drift, circularity error, and vibration."
          canonical="/tools/controller"
          keywords={['gamepad tester', 'controller test', 'joystick drift test', 'xbox controller test', 'ps5 controller test', 'input lag test']}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Gamepad Tester', path: '/tools/controller' }
          ]}
        />
        <div className="max-w-4xl mx-auto py-20 px-6 text-center animate-fade-in">
          <div className="bg-neutral-900/50 p-12 rounded-2xl border border-neutral-800 flex flex-col items-center">
            <Gamepad2 size={64} className="text-neutral-600 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No Controller Detected</h2>
            <p className="text-neutral-400 mb-8">Plug in a USB or Bluetooth gamepad and press any button to wake it up.</p>
            <div className="flex items-center gap-2 text-xs text-neutral-500 bg-black/20 px-4 py-2 rounded-full">
              <RefreshCw size={12} className="animate-spin" /> Scanning for devices...
            </div>
          </div>
        </div>
      </>
    );
  }

  // Helper for Trigger Bar
  const TriggerBar = ({ val, label }: { val: number, label: string }) => (
    <div className="flex flex-col gap-1 w-full">
       <div className="flex justify-between text-xs">
          <span className="font-bold text-neutral-400">{label}</span>
          <span className="font-mono text-blue-400">{val.toFixed(3)}</span>
       </div>
       <div className="h-6 bg-neutral-950 rounded border border-neutral-800 relative overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 flex justify-between px-2">
             <div className="w-px h-full bg-white/5"></div>
             <div className="w-px h-full bg-white/5"></div>
             <div className="w-px h-full bg-white/5"></div>
          </div>
          <div 
             className="h-full bg-gradient-to-r from-blue-900 to-blue-500 transition-all duration-75" 
             style={{ width: `${val * 100}%` }} 
          />
       </div>
    </div>
  );

  return (
    <>
      <SEO 
        title="Gamepad Tester - Check Controller Inputs Online" 
        description="Test your Xbox, PlayStation (PS4/PS5), or Nintendo Switch controller online. Check buttons, joystick drift, circularity error, and vibration."
        canonical="/tools/controller"
        keywords={['gamepad tester', 'controller test', 'joystick drift test', 'xbox controller test', 'ps5 controller test', 'input lag test']}
      />
      <div className="max-w-7xl mx-auto py-12 px-4 lg:px-8 animate-fade-in">
        
        {/* --- HEADER --- */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${pollingRate > 200 ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  <Gamepad2 size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white truncate max-w-md" title={activeGamepad.id}>
                  {activeGamepad.id.split('(')[0] || "Generic Gamepad"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700 font-mono">
                    INDEX: {activeGamepad.index}
                  </span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700 font-mono">
                    {activeGamepad.buttons.length} BTNS / {activeGamepad.axes.length} AXES
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Layout Toggle */}
            <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                <button onClick={() => setLayout('xbox')} className={`px-3 py-1.5 text-xs font-bold rounded ${layout === 'xbox' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>Xbox</button>
                <button onClick={() => setLayout('playstation')} className={`px-3 py-1.5 text-xs font-bold rounded ${layout === 'playstation' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>PS</button>
                <button onClick={() => setLayout('nintendo')} className={`px-3 py-1.5 text-xs font-bold rounded ${layout === 'nintendo' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>Switch</button>
            </div>

            {/* Polling Rate */}
            <div className="bg-neutral-950 border border-neutral-800 px-4 py-2 rounded-lg flex flex-col items-center min-w-[100px]">
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold">Polling Rate</span>
                <span className={`text-lg font-mono font-bold ${pollingRate > 200 ? 'text-green-500' : 'text-blue-400'}`}>
                  {pollingRate} <span className="text-xs text-neutral-600">Hz</span>
                </span>
            </div>

            {/* Controller Selector */}
            {gamepads.filter(g => g).length > 1 && (
              <select 
                className="bg-neutral-800 text-white text-sm p-2 rounded border border-neutral-700 outline-none hover:border-neutral-500 transition-colors"
                value={activeIdx}
                onChange={(e) => setActiveIdx(Number(e.target.value))}
              >
                {gamepads.map((g, i) => g ? <option key={i} value={i}>Gamepad {i+1}</option> : null)}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COL: ANALOG ANALYSIS (4 Cols) --- */}
          <div className="lg:col-span-4 space-y-6">
            {/* Joysticks */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                      <Target size={16} /> Stick Analysis
                  </h3>
                  <span className="text-[10px] text-neutral-600 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                      Rotate edge to test circularity
                  </span>
                </div>
                
                <div className="flex justify-around gap-4">
                  <StickAnalysis 
                      x={activeGamepad.axes[0]} 
                      y={activeGamepad.axes[1]} 
                      label="Left Stick" 
                      isCircular={true}
                  />
                  <StickAnalysis 
                      x={activeGamepad.axes[2]} 
                      y={activeGamepad.axes[3]} 
                      label="Right Stick" 
                      isCircular={true} 
                  />
                </div>
            </div>

            {/* Triggers */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity size={16} /> Trigger Linearity
                </h3>
                <div className="space-y-6">
                  <TriggerBar val={activeGamepad.buttons[6].value} label={layout === 'playstation' ? 'L2' : 'LT'} />
                  <TriggerBar val={activeGamepad.buttons[7].value} label={layout === 'playstation' ? 'R2' : 'RT'} />
                </div>
            </div>

            {/* Vibration */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Zap size={16} /> Force Feedback
                </h3>
                {activeGamepad.vibrationActuator ? (
                  <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => triggerRumble(400, 1.0, 1.0)} className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-3 rounded transition-colors border border-neutral-700">
                        Heavy Rumble
                      </button>
                      <button onClick={() => triggerRumble(200, 0.2, 0.2)} className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-3 rounded transition-colors border border-neutral-700">
                        Micro Pulse
                      </button>
                      <button onClick={() => triggerRumble(1000, 1.0, 0.0)} className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-3 rounded transition-colors border border-neutral-700">
                        Left Motor
                      </button>
                      <button onClick={() => triggerRumble(1000, 0.0, 1.0)} className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-3 rounded transition-colors border border-neutral-700">
                        Right Motor
                      </button>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500 flex items-center gap-2 bg-neutral-950 p-4 rounded border border-neutral-800">
                      <AlertCircle size={14} /> Vibration API not supported by this browser or device.
                  </div>
                )}
            </div>
          </div>

          {/* --- CENTER: MAIN VISUAL (8 Cols) --- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex items-center justify-center min-h-[500px] relative overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-10" 
                  style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />
                
                <div className="relative z-10 w-full">
                  <ControllerVisualizer gamepad={activeGamepad} layout={layout} />
                </div>

                {/* Input Log Overlay (Simple) */}
                <div className="absolute bottom-4 left-4 text-[10px] text-neutral-600 font-mono">
                  {/* Can add history log here later */}
                  Mode: {layout.toUpperCase()}
                </div>
            </div>

            {/* Raw Data Grid */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 size={14} className="text-neutral-500" />
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Raw Input Map</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {activeGamepad.buttons.map((btn, i) => (
                      <div 
                        key={i}
                        className={`
                          aspect-square rounded border flex flex-col items-center justify-center transition-all relative overflow-hidden
                          ${btn.pressed 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                            : 'bg-neutral-900 border-neutral-800 text-neutral-600'}
                        `}
                      >
                        <span className="text-[10px] font-bold z-10">B{i}</span>
                        {/* Analog fill background */}
                        {btn.value > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-white/20 z-0" style={{ height: `${btn.value * 100}%` }} />
                        )}
                      </div>
                  ))}
                  {activeGamepad.axes.map((ax, i) => (
                      <div key={`ax-${i}`} className="aspect-square rounded border border-neutral-800 bg-neutral-900 flex flex-col items-center justify-center text-neutral-500">
                        <span className="text-[9px] font-bold">AX{i}</span>
                        <span className={`text-[9px] font-mono ${Math.abs(ax) > 0.1 ? 'text-white' : ''}`}>
                            {ax.toFixed(1)}
                        </span>
                      </div>
                  ))}
                </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ControllerTest;