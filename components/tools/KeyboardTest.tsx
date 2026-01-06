import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw, Keyboard as KeyboardIcon, Activity } from 'lucide-react';

// --- DATA: Keyboard Layout Definition ---

interface KeyDef {
  code: string;
  label: string;
  w?: number; // width in units (1 unit = standard key)
  type?: 'empty'; // spacing
}

const ROWS_MAIN: KeyDef[][] = [
  [
    { code: 'Backquote', label: '`' }, { code: 'Digit1', label: '1' }, { code: 'Digit2', label: '2' }, { code: 'Digit3', label: '3' },
    { code: 'Digit4', label: '4' }, { code: 'Digit5', label: '5' }, { code: 'Digit6', label: '6' }, { code: 'Digit7', label: '7' },
    { code: 'Digit8', label: '8' }, { code: 'Digit9', label: '9' }, { code: 'Digit0', label: '0' }, { code: 'Minus', label: '-' },
    { code: 'Equal', label: '=' }, { code: 'Backspace', label: 'Backspace', w: 2 }
  ],
  [
    { code: 'Tab', label: 'Tab', w: 1.5 }, { code: 'KeyQ', label: 'Q' }, { code: 'KeyW', label: 'W' }, { code: 'KeyE', label: 'E' },
    { code: 'KeyR', label: 'R' }, { code: 'KeyT', label: 'T' }, { code: 'KeyY', label: 'Y' }, { code: 'KeyU', label: 'U' },
    { code: 'KeyI', label: 'I' }, { code: 'KeyO', label: 'O' }, { code: 'KeyP', label: 'P' }, { code: 'BracketLeft', label: '[' },
    { code: 'BracketRight', label: ']' }, { code: 'Backslash', label: '\\', w: 1.5 }
  ],
  [
    { code: 'CapsLock', label: 'Caps', w: 1.75 }, { code: 'KeyA', label: 'A' }, { code: 'KeyS', label: 'S' }, { code: 'KeyD', label: 'D' },
    { code: 'KeyF', label: 'F' }, { code: 'KeyG', label: 'G' }, { code: 'KeyH', label: 'H' }, { code: 'KeyJ', label: 'J' },
    { code: 'KeyK', label: 'K' }, { code: 'KeyL', label: 'L' }, { code: 'Semicolon', label: ';' }, { code: 'Quote', label: "'" },
    { code: 'Enter', label: 'Enter', w: 2.25 }
  ],
  [
    { code: 'ShiftLeft', label: 'Shift', w: 2.25 }, { code: 'KeyZ', label: 'Z' }, { code: 'KeyX', label: 'X' }, { code: 'KeyC', label: 'C' },
    { code: 'KeyV', label: 'V' }, { code: 'KeyB', label: 'B' }, { code: 'KeyN', label: 'N' }, { code: 'KeyM', label: 'M' },
    { code: 'Comma', label: ',' }, { code: 'Period', label: '.' }, { code: 'Slash', label: '/' }, { code: 'ShiftRight', label: 'Shift', w: 2.75 }
  ],
  [
    { code: 'ControlLeft', label: 'Ctrl', w: 1.25 }, { code: 'MetaLeft', label: 'Win', w: 1.25 }, { code: 'AltLeft', label: 'Alt', w: 1.25 },
    { code: 'Space', label: 'Space', w: 6.25 },
    { code: 'AltRight', label: 'Alt', w: 1.25 }, { code: 'MetaRight', label: 'Fn', w: 1.25 }, { code: 'ContextMenu', label: 'Menu', w: 1.25 }, { code: 'ControlRight', label: 'Ctrl', w: 1.25 }
  ]
];

const ROWS_FUNC: KeyDef[] = [
  { code: 'Escape', label: 'ESC' },
  { code: 'empty', label: '', w: 1 }, // Gap
  { code: 'F1', label: 'F1' }, { code: 'F2', label: 'F2' }, { code: 'F3', label: 'F3' }, { code: 'F4', label: 'F4' },
  { code: 'empty', label: '', w: 0.5 }, // Gap
  { code: 'F5', label: 'F5' }, { code: 'F6', label: 'F6' }, { code: 'F7', label: 'F7' }, { code: 'F8', label: 'F8' },
  { code: 'empty', label: '', w: 0.5 }, // Gap
  { code: 'F9', label: 'F9' }, { code: 'F10', label: 'F10' }, { code: 'F11', label: 'F11' }, { code: 'F12', label: 'F12' }
];

const ROWS_NAV: KeyDef[][] = [
  [ { code: 'PrintScreen', label: 'PrtSc' }, { code: 'ScrollLock', label: 'ScrLk' }, { code: 'Pause', label: 'Pause' } ],
  [ { code: 'Insert', label: 'Ins' }, { code: 'Home', label: 'Home' }, { code: 'PageUp', label: 'PgUp' } ],
  [ { code: 'Delete', label: 'Del' }, { code: 'End', label: 'End' }, { code: 'PageDown', label: 'PgDn' } ],
  [ { code: 'empty', label: '' }, { code: 'ArrowUp', label: '↑' }, { code: 'empty', label: '' } ], // Spacing for Arrow T-shape
  [ { code: 'ArrowLeft', label: '←' }, { code: 'ArrowDown', label: '↓' }, { code: 'ArrowRight', label: '→' } ]
];

const ROWS_NUM: KeyDef[][] = [
  [ { code: 'NumLock', label: 'Num' }, { code: 'NumpadDivide', label: '/' }, { code: 'NumpadMultiply', label: '*' }, { code: 'NumpadSubtract', label: '-' } ],
  [ { code: 'Numpad7', label: '7' }, { code: 'Numpad8', label: '8' }, { code: 'Numpad9', label: '9' }, { code: 'NumpadAdd', label: '+' } ], // + is usually tall
  [ { code: 'Numpad4', label: '4' }, { code: 'Numpad5', label: '5' }, { code: 'Numpad6', label: '6' }, { code: 'empty', label: '' } ], // + spans 2 rows visually in some logic, simplified here
  [ { code: 'Numpad1', label: '1' }, { code: 'Numpad2', label: '2' }, { code: 'Numpad3', label: '3' }, { code: 'NumpadEnter', label: 'Ent' } ],
  [ { code: 'Numpad0', label: '0', w: 2 }, { code: 'NumpadDecimal', label: '.' }, { code: 'empty', label: '' } ]
];

// --- Render Key Cap Component ---
const Key: React.FC<{ def: KeyDef; h?: number; isActive: boolean; isTested: boolean }> = ({ def, h = 12, isActive, isTested }) => {
  if (def.code === 'empty') return <div style={{ width: `${(def.w || 1) * 3.5}rem` }}></div>;

  // Numpad Enter and Plus usually span 2 rows vertically.
  // Simplifying layout by letting Flexbox handle heights or specific classes.
  const isTall = def.code === 'NumpadAdd' || def.code === 'NumpadEnter';
  
  let stateClass = "bg-neutral-800 border-neutral-700 text-neutral-500"; // Default
  if (isActive) {
      stateClass = "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] translate-y-0.5 scale-95 z-10";
  } else if (isTested) {
      stateClass = "bg-green-900/40 border-green-700/50 text-green-400";
  }

  return (
    <div 
      className={`
          relative flex items-center justify-center rounded-lg border-b-4 text-xs font-bold transition-all duration-75 select-none
          ${stateClass}
          ${isTall ? 'h-[6.5rem]' : `h-${h}`}
      `}
      style={{ 
          width: `${(def.w || 1) * 3.5}rem`,
          minWidth: `${(def.w || 1) * 3.5}rem`
      }}
    >
      {def.label}
      {/* Shine effect for active */}
      {isActive && <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse" />}
    </div>
  );
};

const KeyboardTest: React.FC = () => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [maxCombo, setMaxCombo] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);

  // --- Sound Logic ---
  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    
    // Init Audio Context on first user interaction if needed
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx && ctx.state === 'suspended') ctx.resume();
    if (!ctx) return;

    // Create a "Thock" sound using filtered noise + oscillator
    const t = ctx.currentTime;
    
    // 1. High-frequency click (Switch mechanism)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);

  }, [soundEnabled]);

  // --- Keyboard Events ---
  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      const code = e.code;
      if (!activeKeys.has(code)) playClick();

      setActiveKeys(prev => {
        const next = new Set(prev);
        next.add(code);
        // NKRO tracking
        if (next.size > maxCombo) setMaxCombo(next.size);
        return next;
      });

      setTestedKeys(prev => {
        const next = new Set(prev);
        next.add(code);
        return next;
      });

      setHistory(prev => [code, ...prev].slice(0, 15));
    };

    const handleUp = (e: KeyboardEvent) => {
      e.preventDefault();
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, [maxCombo, playClick, activeKeys]); 

  const reset = () => {
    setActiveKeys(new Set());
    setTestedKeys(new Set());
    setHistory([]);
    setMaxCombo(0);
  };

  return (
    <div className="max-w-[1600px] mx-auto py-12 px-4 lg:px-8 animate-fade-in font-sans">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20 text-white">
                <KeyboardIcon size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white">Keyboard Ghosting Test</h1>
          </div>
          <p className="text-neutral-400 max-w-lg">
            Test for dead keys, key chatter, and N-Key Rollover (NKRO). 
            Press as many keys as you can simultaneously to test ghosting limits.
          </p>
        </div>

        <div className="flex gap-4 items-center">
             {/* Stats Box */}
             <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex gap-8">
                <div className="text-center">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Current</div>
                    <div className="text-3xl font-bold text-blue-500 font-mono leading-none">{activeKeys.size}</div>
                </div>
                <div className="w-px bg-neutral-800"></div>
                <div className="text-center">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Max Combo</div>
                    <div className={`text-3xl font-bold font-mono leading-none ${maxCombo > 6 ? 'text-green-500' : 'text-neutral-300'}`}>{maxCombo}</div>
                </div>
                <div className="w-px bg-neutral-800"></div>
                <div className="text-center">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Tested</div>
                    <div className="text-3xl font-bold text-neutral-300 font-mono leading-none">{testedKeys.size}</div>
                </div>
             </div>

             <button 
               onClick={() => setSoundEnabled(!soundEnabled)}
               className={`p-4 rounded-xl border transition-all ${soundEnabled ? 'bg-neutral-800 text-green-400 border-green-900/50' : 'bg-neutral-900 text-neutral-600 border-neutral-800'}`}
               title="Toggle Mechanical Sound"
             >
               {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
             </button>

             <button 
               onClick={reset} 
               className="p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-all"
               title="Reset Test"
             >
               <RotateCcw size={20} />
             </button>
        </div>
      </div>
      
      {/* --- KEYBOARD VISUALIZER --- */}
      {/* Scaling container for smaller screens */}
      <div className="overflow-x-auto pb-8 custom-scrollbar">
         <div className="min-w-[1200px] bg-[#111] p-8 rounded-2xl border border-white/5 shadow-2xl relative">
            
            {/* Top Function Row */}
            <div className="flex gap-4 mb-8">
               {ROWS_FUNC.map((key, i) => <Key key={i} def={key} h={10} isActive={activeKeys.has(key.code)} isTested={testedKeys.has(key.code)} />)}
            </div>

            {/* Main Area */}
            <div className="flex gap-6">
               
               {/* 60% Block */}
               <div className="flex flex-col gap-2">
                  {ROWS_MAIN.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-2">
                        {row.map((key, kIdx) => <Key key={kIdx} def={key} isActive={activeKeys.has(key.code)} isTested={testedKeys.has(key.code)} />)}
                    </div>
                  ))}
               </div>

               {/* Navigation Cluster */}
               <div className="flex flex-col gap-2">
                  {ROWS_NAV.map((row, rIdx) => (
                    <div key={rIdx} className={`flex gap-2 ${rIdx === 3 ? 'mt-8' : ''}`}> {/* Spacer for arrows */}
                        {row.map((key, kIdx) => <Key key={kIdx} def={key} isActive={activeKeys.has(key.code)} isTested={testedKeys.has(key.code)} />)}
                    </div>
                  ))}
               </div>

               {/* Numpad */}
               <div className="flex flex-col gap-2 ml-4">
                   <div className="flex gap-2">
                      {ROWS_NUM[0].map((k, i) => <Key key={i} def={k} isActive={activeKeys.has(k.code)} isTested={testedKeys.has(k.code)} />)}
                   </div>
                   <div className="flex gap-2 h-full">
                       {/* Numpad Main Grid */}
                       <div className="flex flex-col gap-2">
                           <div className="flex gap-2">{ROWS_NUM[1].map((k, i) => <Key key={i} def={k} isActive={activeKeys.has(k.code)} isTested={testedKeys.has(k.code)} />)}</div>
                           <div className="flex gap-2">{ROWS_NUM[2].map((k, i) => <Key key={i} def={k} isActive={activeKeys.has(k.code)} isTested={testedKeys.has(k.code)} />)}</div>
                           <div className="flex gap-2">{ROWS_NUM[3].map((k, i) => <Key key={i} def={k} isActive={activeKeys.has(k.code)} isTested={testedKeys.has(k.code)} />)}</div>
                           <div className="flex gap-2">{ROWS_NUM[4].map((k, i) => <Key key={i} def={k} isActive={activeKeys.has(k.code)} isTested={testedKeys.has(k.code)} />)}</div>
                       </div>
                       {/* Numpad Right Column (Tall Keys handled via absolute or special logic, simplified here by grid structure in data) */}
                   </div>
               </div>

            </div>

            {/* Brand / Logo Area */}
            <div className="absolute top-8 right-12 opacity-20 pointer-events-none">
               <div className="flex items-center gap-2">
                  <Activity size={24} />
                  <span className="font-bold font-mono tracking-widest text-lg">NKRO TESTER</span>
               </div>
            </div>

         </div>
      </div>

      {/* --- Log Stream --- */}
      <div className="mt-8 flex gap-2 overflow-hidden mask-fade-right h-12 items-center opacity-70">
         <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest mr-4 shrink-0">Recent Activity:</span>
         {history.map((code, i) => (
             <div key={i} className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono text-blue-400 whitespace-nowrap animate-in slide-in-from-left-2 fade-in">
                {code}
             </div>
         ))}
      </div>

    </div>
  );
};

export default KeyboardTest;
