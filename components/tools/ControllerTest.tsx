import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Gamepad2, Zap, Target, Activity, RefreshCw, AlertCircle } from 'lucide-react';

// --- VISUAL ASSETS (Simplified SVG Controller) ---
const ControllerSVG = ({ gamepad }: { gamepad: Gamepad }) => {
  const { buttons, axes } = gamepad;
  
  // Helper to get button state safely
  const isPressed = (idx: number) => buttons[idx]?.pressed;
  const val = (idx: number) => buttons[idx]?.value || 0;

  // Standard Mapping (Xbox style usually)
  // 0:A, 1:B, 2:X, 3:Y
  // 4:LB, 5:RB, 6:LT, 7:RT
  // 8:Back, 9:Start, 10:LS, 11:RS
  // 12:Up, 13:Down, 14:Left, 15:Right
  // 16: Guide

  return (
    <div className="relative w-full max-w-[500px] aspect-[1.4] mx-auto select-none">
      <svg viewBox="0 0 300 210" className="w-full h-full drop-shadow-2xl">
        {/* Body Outline */}
        <path d="M75,60 C40,60 20,90 20,130 C20,180 50,200 80,200 C100,200 110,170 150,170 C190,170 200,200 220,200 C250,200 280,180 280,130 C280,90 260,60 225,60 H75 Z" 
              fill="#1a1a1a" stroke="#333" strokeWidth="2" />

        {/* --- TRIGGERS & SHOULDERS (Drawn behind or on top based on design, simplified here) --- */}
        {/* LB */}
        <path d="M40,50 Q60,30 90,50" stroke={isPressed(4) ? "#3b82f6" : "#444"} strokeWidth="8" fill="none" />
        {/* RB */}
        <path d="M210,50 Q240,30 260,50" stroke={isPressed(5) ? "#3b82f6" : "#444"} strokeWidth="8" fill="none" />
        
        {/* LT Fill (Analog) */}
        <rect x="20" y="20" width="10" height="40" rx="4" fill="#333" />
        <rect x="20" y={60 - (val(6) * 40)} width="10" height={val(6) * 40} rx="4" fill="#3b82f6" opacity="0.8" />
        {/* RT Fill (Analog) */}
        <rect x="270" y="20" width="10" height="40" rx="4" fill="#333" />
        <rect x="270" y={60 - (val(7) * 40)} width="10" height={val(7) * 40} rx="4" fill="#3b82f6" opacity="0.8" />


        {/* --- D-PAD --- */}
        <g transform="translate(80, 110)">
           {/* Base */}
           <path d="M-15,-45 h30 v30 h30 v30 h-30 v30 h-30 v-30 h-30 v-30 h30 z" fill="#111" />
           {/* Up */}
           <path d="M-10,-40 h20 v25 h-20 z" fill={isPressed(12) ? "#3b82f6" : "#333"} />
           {/* Down */}
           <path d="M-10,15 h20 v25 h-20 z" fill={isPressed(13) ? "#3b82f6" : "#333"} />
           {/* Left */}
           <path d="M-40,-10 h25 v20 h-25 z" fill={isPressed(14) ? "#3b82f6" : "#333"} />
           {/* Right */}
           <path d="M15,-10 h25 v20 h-25 z" fill={isPressed(15) ? "#3b82f6" : "#333"} />
        </g>

        {/* --- ABXY BUTTONS --- */}
        <g transform="translate(220, 110)">
           <circle cx="0" cy="30" r="10" fill={isPressed(0) ? "#3b82f6" : "#222"} stroke="#000" strokeWidth="1" /> {/* A (Down) */}
           <text x="0" y="33" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">A</text>

           <circle cx="30" cy="0" r="10" fill={isPressed(1) ? "#ef4444" : "#222"} stroke="#000" strokeWidth="1" /> {/* B (Right) */}
           <text x="30" y="3" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">B</text>

           <circle cx="-30" cy="0" r="10" fill={isPressed(2) ? "#3b82f6" : "#222"} stroke="#000" strokeWidth="1" /> {/* X (Left) */}
           <text x="-30" y="3" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">X</text>

           <circle cx="0" cy="-30" r="10" fill={isPressed(3) ? "#eab308" : "#222"} stroke="#000" strokeWidth="1" /> {/* Y (Up) */}
           <text x="0" y="-27" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">Y</text>
        </g>

        {/* --- STICKS --- */}
        {/* Left Stick (Axes 0, 1) */}
        <g transform="translate(80, 110)"> {/* D-pad pos? Wait, standard layout usually swaps Dpad/Stick based on controller. Assuming Xbox layout: LS is top left, Dpad is bottom left? Let's do generic layout */}
        </g>
        
        {/* Adjusted Layout for Generic "Xbox" Style */}
        {/* LS: Top Left (approx) */}
        <g transform={`translate(${65 + (axes[0] * 15)}, ${90 + (axes[1] * 15)})`}>
           <circle r="20" fill="#222" stroke="#111" strokeWidth="2" />
           <circle r="18" fill="url(#stickGradient)" opacity={isPressed(10) ? 0.8 : 0.2} /> {/* L3 Click */}
           <defs>
             <radialGradient id="stickGradient">
               <stop offset="0%" stopColor="#3b82f6" />
               <stop offset="100%" stopColor="#222" />
             </radialGradient>
           </defs>
        </g>

        {/* RS: Bottom Right */}
        <g transform={`translate(${185 + (axes[2] * 15)}, ${140 + (axes[3] * 15)})`}>
           <circle r="20" fill="#222" stroke="#111" strokeWidth="2" />
           <circle r="18" fill="url(#stickGradient)" opacity={isPressed(11) ? 0.8 : 0.2} /> {/* R3 Click */}
        </g>

        {/* --- CENTER BUTTONS --- */}
        <g transform="translate(150, 110)">
           <rect x="-30" y="-10" width="15" height="10" rx="2" fill={isPressed(8) ? "#fff" : "#222"} /> {/* Select/Back */}
           <rect x="15" y="-10" width="15" height="10" rx="2" fill={isPressed(9) ? "#fff" : "#222"} /> {/* Start */}
           <circle cx="0" cy="-20" r="12" fill={isPressed(16) ? "#3b82f6" : "#333"} stroke="#111" /> {/* Guide/Home */}
        </g>

      </svg>
    </div>
  );
};

// --- JOYSTICK ANALYZER COMPONENT ---
const StickVisualizer = ({ x, y, label }: { x: number, y: number, label: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32 bg-neutral-900 border border-neutral-700 rounded-full flex items-center justify-center overflow-hidden">
        {/* Crosshair */}
        <div className="absolute w-full h-px bg-neutral-800" />
        <div className="absolute h-full w-px bg-neutral-800" />
        
        {/* Deadzone visual (approx 10%) */}
        <div className="absolute w-[10%] h-[10%] bg-red-500/10 rounded-full border border-red-500/30" />

        {/* The Dot */}
        <div 
          className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          style={{ 
            transform: `translate(${x * 60}px, ${y * 60}px)`,
            transition: 'transform 0.05s linear' 
          }}
        />
      </div>
      <div className="mt-2 text-xs font-mono text-neutral-400">
        {label}: <span className="text-white">({x.toFixed(2)}, {y.toFixed(2)})</span>
      </div>
    </div>
  );
};


const ControllerTest: React.FC = () => {
  const [gamepads, setGamepads] = useState<(Gamepad | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const reqRef = useRef<number>();
  
  // Polling Rate Calc
  const lastUpdateRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const [pollingRate, setPollingRate] = useState(0);

  useEffect(() => {
    const scanGamepads = () => {
      const gps = navigator.getGamepads ? navigator.getGamepads() : [];
      setGamepads(Array.from(gps));
      
      // Calculate Polling Rate approx
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

  // Vibration Handler
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
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 animate-fade-in">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
             <Gamepad2 className="text-blue-500" size={32} />
             <h1 className="text-3xl font-bold text-white truncate max-w-md" title={activeGamepad.id}>
               {activeGamepad.id.split('(')[0] || "Generic Gamepad"}
             </h1>
          </div>
          <p className="text-neutral-500 text-sm mt-1 font-mono">
            ID: {activeGamepad.id}
          </p>
        </div>

        <div className="flex items-center gap-4">
           {/* Selector if multiple */}
           {gamepads.filter(g => g).length > 1 && (
             <select 
               className="bg-neutral-800 text-white text-sm p-2 rounded border border-neutral-700 outline-none"
               value={activeIdx}
               onChange={(e) => setActiveIdx(Number(e.target.value))}
             >
               {gamepads.map((g, i) => g ? <option key={i} value={i}>Gamepad {i+1}</option> : null)}
             </select>
           )}

           <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl flex flex-col items-center min-w-[100px]">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Polling Rate</span>
              <span className={`text-xl font-mono font-bold ${pollingRate > 200 ? 'text-green-500' : 'text-blue-400'}`}>
                {pollingRate} <span className="text-xs text-neutral-600">Hz</span>
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COL: ANALOG ANALYSIS --- */}
        <div className="space-y-6">
           {/* Joysticks */}
           <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                 <Target size={16} /> Stick Drift Analysis
              </h3>
              <div className="flex justify-around">
                 <StickVisualizer x={activeGamepad.axes[0]} y={activeGamepad.axes[1]} label="Left Stick" />
                 <StickVisualizer x={activeGamepad.axes[2]} y={activeGamepad.axes[3]} label="Right Stick" />
              </div>
           </div>

           {/* Triggers */}
           <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Activity size={16} /> Analog Triggers
              </h3>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                       <span className="font-bold text-neutral-300">L2 / LT</span>
                       <span className="font-mono text-blue-400">{activeGamepad.buttons[6].value.toFixed(2)}</span>
                    </div>
                    <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-75" style={{ width: `${activeGamepad.buttons[6].value * 100}%` }} />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                       <span className="font-bold text-neutral-300">R2 / RT</span>
                       <span className="font-mono text-blue-400">{activeGamepad.buttons[7].value.toFixed(2)}</span>
                    </div>
                    <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-75" style={{ width: `${activeGamepad.buttons[7].value * 100}%` }} />
                    </div>
                 </div>
              </div>
           </div>

           {/* Vibration */}
           <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Zap size={16} /> Force Feedback
              </h3>
              {activeGamepad.vibrationActuator ? (
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => triggerRumble(500, 1.0, 1.0)} className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-3 rounded transition-colors">
                       High Impact
                    </button>
                    <button onClick={() => triggerRumble(500, 0.2, 0.2)} className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-3 rounded transition-colors">
                       Subtle Rumble
                    </button>
                    <button onClick={() => triggerRumble(1000, 0.5, 0.0)} className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-3 rounded transition-colors">
                       Left Motor Only
                    </button>
                    <button onClick={() => triggerRumble(1000, 0.0, 0.5)} className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-3 rounded transition-colors">
                       Right Motor Only
                    </button>
                 </div>
              ) : (
                 <div className="text-xs text-neutral-500 flex items-center gap-2 bg-neutral-800/50 p-3 rounded">
                    <AlertCircle size={14} /> Vibration not supported by this browser/device.
                 </div>
              )}
           </div>
        </div>

        {/* --- CENTER: MAIN VISUAL --- */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex items-center justify-center min-h-[400px]">
              <ControllerSVG gamepad={activeGamepad} />
           </div>

           {/* Raw Data Grid (Fallback) */}
           <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {activeGamepad.buttons.map((btn, i) => (
                 <div 
                   key={i}
                   className={`
                      aspect-square rounded border flex flex-col items-center justify-center transition-all
                      ${btn.pressed 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg scale-95' 
                        : 'bg-neutral-900 border-neutral-800 text-neutral-600'}
                   `}
                 >
                    <span className="text-[10px] font-bold">B{i}</span>
                    {btn.value > 0 && btn.value < 1 && (
                      <span className="text-[8px] opacity-80">{btn.value.toFixed(1)}</span>
                    )}
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ControllerTest;