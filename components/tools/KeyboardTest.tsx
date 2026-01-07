import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw, Keyboard as KeyboardIcon, Activity, PaintBucket, Terminal, Settings, LayoutTemplate, Ghost, Zap, Cpu } from 'lucide-react';
import { SEO } from '../common/SEO';
import { RelatedTools } from '../common/RelatedTools';

// ... (Keep existing Imports and KeyDefs remain unchanged)
// Assume they are here exactly as they were in the previous file.

interface KeyDef {
  code: string;
  label: string;
  w?: number; // width in units (1 unit = standard key)
  type?: 'empty'; // spacing
}

// Standard ANSI Layout Data
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
  [ { code: 'Numpad7', label: '7' }, { code: 'Numpad8', label: '8' }, { code: 'Numpad9', label: '9' }, { code: 'NumpadAdd', label: '+' } ],
  [ { code: 'Numpad4', label: '4' }, { code: 'Numpad5', label: '5' }, { code: 'Numpad6', label: '6' }, { code: 'empty', label: '' } ],
  [ { code: 'Numpad1', label: '1' }, { code: 'Numpad2', label: '2' }, { code: 'Numpad3', label: '3' }, { code: 'NumpadEnter', label: 'Ent' } ],
  [ { code: 'Numpad0', label: '0', w: 2 }, { code: 'NumpadDecimal', label: '.' }, { code: 'empty', label: '' } ]
];

type LayoutType = 'full' | 'tkl' | '60';
type SoundProfile = 'off' | 'mechanical' | 'thock' | 'beep';

const Key: React.FC<{ 
  def: KeyDef; 
  h?: number; 
  isActive: boolean; 
  isTested: boolean;
  latchMode: boolean;
}> = ({ def, h = 12, isActive, isTested, latchMode }) => {
  if (def.code === 'empty') return <div style={{ width: `${(def.w || 1) * 3.5}rem` }}></div>;

  const isTall = def.code === 'NumpadAdd' || def.code === 'NumpadEnter';
  
  let bgClass = "bg-[#1a1a1a] border-neutral-800 text-neutral-500 shadow-[0_4px_0_#0a0a0a]"; // Default 3D look
  let transformClass = "translate-y-0";

  if (isActive) {
      bgClass = "bg-blue-600 border-blue-700 text-white shadow-[0_1px_0_#1e3a8a]";
      transformClass = "translate-y-1";
  } else if (isTested) {
      bgClass = "bg-[#112211] border-green-900/50 text-green-500 shadow-[0_4px_0_#051105]";
      if (latchMode) {
         bgClass = "bg-green-600 border-green-700 text-white shadow-[0_4px_0_#14532d]";
      }
  }

  return (
    <div 
      className={`
          relative flex items-center justify-center rounded-md border-2 text-xs font-bold transition-all duration-75 select-none
          ${bgClass} ${transformClass}
          ${isTall ? 'h-[7rem]' : `h-14`}
      `}
      style={{ 
          width: `${(def.w || 1) * 3.5}rem`,
          minWidth: `${(def.w || 1) * 3.5}rem`
      }}
    >
      {def.label}
    </div>
  );
};

const KeyboardTest: React.FC = () => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  
  // Settings
  const [latchMode, setLatchMode] = useState(true);
  const [layoutType, setLayoutType] = useState<LayoutType>('full');
  const [soundProfile, setSoundProfile] = useState<SoundProfile>('mechanical');
  
  // Stats
  const [maxCombo, setMaxCombo] = useState(0);
  const [lastEvent, setLastEvent] = useState<KeyboardEvent | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback(() => {
    if (soundProfile === 'off') return;
    
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx && ctx.state === 'suspended') ctx.resume();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (soundProfile === 'mechanical') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    } else if (soundProfile === 'thock') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);

  }, [soundProfile]);

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      e.preventDefault();
      setLastEvent(e);
      
      const code = e.code;
      if (!activeKeys.has(code)) playSound();

      setActiveKeys(prev => {
        const next = new Set(prev);
        next.add(code);
        if (next.size > maxCombo) setMaxCombo(next.size);
        return next;
      });

      setTestedKeys(prev => {
        const next = new Set(prev);
        next.add(code);
        return next;
      });
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
  }, [maxCombo, playSound, activeKeys]); 

  const reset = () => {
    setActiveKeys(new Set());
    setTestedKeys(new Set());
    setMaxCombo(0);
    setLastEvent(null);
  };

  return (
    <>
      <SEO 
        title="Keyboard Test - Check Keys & Ghosting"
        description="Test every key on your keyboard. Check for dead keys, key chatter (double typing), and N-Key Rollover (NKRO) ghosting issues."
        canonical="/tools/keyboard"
        keywords={['keyboard test', 'key test', 'ghosting test', 'nkro test', 'mechanical keyboard test', 'keyboard chatter']}
        type="WebApplication"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Keyboard Tester', path: '/tools/keyboard' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Online Keyboard Tester",
              "url": "https://deadpixeltest.cc/tools/keyboard",
              "description": "Test mechanical and laptop keyboards for dead keys, ghosting, and N-Key Rollover.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [{
                "@type": "Question",
                "name": "What is Keyboard Ghosting (NKRO)?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Ghosting occurs when a keyboard cannot register multiple keys pressed simultaneously. N-Key Rollover (NKRO) means the keyboard can register all keys at once."
                }
              }, {
                "@type": "Question",
                "name": "How to fix Key Chatter?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Key Chatter (double typing) is often caused by dust in the switch. Try cleaning the switch with compressed air or isopropyl alcohol."
                }
              }]
            },
            {
              "@type": "HowTo",
              "name": "How to Test for Keyboard Ghosting",
              "step": [
                { "@type": "HowToStep", "text": "Open the Keyboard Tester tool." },
                { "@type": "HowToStep", "text": "Press and hold both Shift keys simultaneously." },
                { "@type": "HowToStep", "text": "While holding Shift, try to type a sentence. If keys are missing, your keyboard has ghosting issues." },
                { "@type": "HowToStep", "text": "Check the 'Max Rollover' stat to see how many keys registered at once." }
              ]
            }
          ]
        }}
      />
      <div className="max-w-[1600px] mx-auto py-12 px-4 lg:px-8 animate-fade-in font-sans">
        
        {/* Header Area */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20 text-white">
                  <KeyboardIcon size={24} />
              </div>
              <h1 className="text-3xl font-bold text-white">Keyboard Tester</h1>
            </div>
            <p className="text-neutral-400 max-w-lg text-sm">
              Check for ghosting, key chatter, and dead switches. Supports N-Key Rollover testing.
            </p>
          </div>

          {/* Controls Toolbar */}
          <div className="flex flex-wrap gap-3 items-center">
              
              {/* Layout Switcher */}
              <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                  <button onClick={() => setLayoutType('full')} className={`px-3 py-1.5 text-xs font-bold rounded ${layoutType === 'full' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-white'}`}>Full</button>
                  <button onClick={() => setLayoutType('tkl')} className={`px-3 py-1.5 text-xs font-bold rounded ${layoutType === 'tkl' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-white'}`}>TKL</button>
                  <button onClick={() => setLayoutType('60')} className={`px-3 py-1.5 text-xs font-bold rounded ${layoutType === '60' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-white'}`}>60%</button>
              </div>

              <div className="w-px h-8 bg-white/10 mx-2"></div>

              {/* Sound Toggle */}
              <button 
                onClick={() => setSoundProfile(prev => prev === 'off' ? 'mechanical' : prev === 'mechanical' ? 'thock' : 'off')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all ${soundProfile !== 'off' ? 'bg-blue-900/30 border-blue-500/50 text-blue-400' : 'bg-neutral-900 border-neutral-800 text-neutral-500'}`}
              >
                {soundProfile === 'off' ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span className="uppercase">{soundProfile}</span>
              </button>

              {/* Latch Mode */}
              <button 
                onClick={() => setLatchMode(!latchMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all ${latchMode ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-neutral-900 border-neutral-800 text-neutral-500'}`}
                title="Keys stay green after pressing"
              >
                <PaintBucket size={16} />
                <span>PAINT: {latchMode ? 'ON' : 'OFF'}</span>
              </button>

              {/* Reset */}
              <button 
                onClick={reset} 
                className="p-2 bg-neutral-900 hover:bg-red-900/20 border border-neutral-800 hover:border-red-500/50 rounded-lg text-neutral-400 hover:text-red-400 transition-all"
                title="Reset All"
              >
                <RotateCcw size={18} />
              </button>
          </div>
        </div>
        
        {/* --- VISUALIZER CONTAINER --- */}
        <div className="overflow-x-auto pb-8 custom-scrollbar">
          <div className="min-w-[1250px] bg-[#050505] p-8 rounded-2xl border border-white/10 shadow-2xl relative">
              
              {/* Top Function Row (Hidden in 60%) */}
              {layoutType !== '60' && (
                <div className="flex gap-3 mb-6">
                  {ROWS_FUNC.map((key, i) => <Key key={i} def={key} h={10} isActive={activeKeys.has(key.code)} isTested={testedKeys.has(key.code)} latchMode={latchMode} />)}
                </div>
              )}

              {/* Main Board Layout */}
              <div className="flex gap-6">
                
                {/* 60% Core Block */}
                <div className="flex flex-col gap-2">
                    {ROWS_MAIN.map((row, rIdx) => (
                      <div key={rIdx} className="flex gap-2">
                          {row.map((key, kIdx) => <Key key={kIdx} def={key} isActive={activeKeys.has(key.code)} isTested={testedKeys.has(key.code)} latchMode={latchMode} />)}
                      </div>
                    ))}
                </div>

                {/* Navigation Cluster (Hidden in 60%) */}
                {layoutType !== '60' && (
                  <div className="flex flex-col gap-2">
                      {ROWS_NAV.map((row, rIdx) => (
                        <div key={rIdx} className={`flex gap-2 ${rIdx === 3 ? 'mt-10' : ''}`}> 
                            {row.map((key, kIdx) => <Key key={kIdx} def={key} isActive={activeKeys.has(key.code)} isTested={testedKeys.has(key.code)} latchMode={latchMode} />)}
                        </div>
                      ))}
                  </div>
                )}

                {/* Numpad (Hidden in TKL and 60%) */}
                {layoutType === 'full' && (
                  <div className="flex flex-col gap-2 ml-4 pl-6 border-l border-white/5">
                      <div className="flex gap-2">
                          {ROWS_NUM[0].map((k, i) => <Key key={i} def={k} isActive={activeKeys.has(k.code)} isTested={testedKeys.has(k.code)} latchMode={latchMode} />)}
                      </div>
                      <div className="flex gap-2 h-full">
                          <div className="flex flex-col gap-2">
                              <div className="flex gap-2">{ROWS_NUM[1].map((k, i) => <Key key={i} def={k} isActive={activeKeys.has(k.code)} isTested={testedKeys.has(k.code)} latchMode={latchMode} />)}</div>
                              <div className="flex gap-2">{ROWS_NUM[2].map((k, i) => <Key key={i} def={k} isActive={activeKeys.has(k.code)} isTested={testedKeys.has(k.code)} latchMode={latchMode} />)}</div>
                              <div className="flex gap-2">{ROWS_NUM[3].map((k, i) => <Key key={i} def={k} isActive={activeKeys.has(k.code)} isTested={testedKeys.has(k.code)} latchMode={latchMode} />)}</div>
                              <div className="flex gap-2">{ROWS_NUM[4].map((k, i) => <Key key={i} def={k} isActive={activeKeys.has(k.code)} isTested={testedKeys.has(k.code)} latchMode={latchMode} />)}</div>
                          </div>
                      </div>
                  </div>
                )}

              </div>
          </div>
        </div>

        {/* --- INFO PANELS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          
          {/* 1. Technical Inspector */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 font-mono text-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <Terminal size={48} />
              </div>
              <h3 className="text-neutral-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={16} /> Event Inspector
              </h3>
              
              <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-neutral-300">
                <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-neutral-500">e.key</span>
                    <span className="font-bold text-white">{lastEvent ? lastEvent.key : '-'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-neutral-500">e.code</span>
                    <span className="font-bold text-blue-400">{lastEvent ? lastEvent.code : '-'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-neutral-500">e.which</span>
                    <span className="font-bold">{lastEvent ? lastEvent.which : '-'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-neutral-500">Location</span>
                    <span className="font-bold">{lastEvent ? lastEvent.location : '-'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-neutral-500">Shift Key</span>
                    <span className={lastEvent?.shiftKey ? "text-green-500" : "text-neutral-600"}>{lastEvent?.shiftKey ? 'TRUE' : 'FALSE'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-neutral-500">Ctrl Key</span>
                    <span className={lastEvent?.ctrlKey ? "text-green-500" : "text-neutral-600"}>{lastEvent?.ctrlKey ? 'TRUE' : 'FALSE'}</span>
                </div>
              </div>
          </div>

          {/* 2. NKRO Stats */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-around relative">
              <div className="text-center">
                  <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-2">Current Press</div>
                  <div className="text-5xl font-mono text-white font-bold">{activeKeys.size}</div>
              </div>
              <div className="w-px h-16 bg-neutral-800"></div>
              <div className="text-center">
                  <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-2">Max Rollover</div>
                  <div className={`text-5xl font-mono font-bold ${maxCombo > 6 ? 'text-green-500' : 'text-blue-500'}`}>
                    {maxCombo}
                    <span className="text-lg text-neutral-600 ml-1">KRO</span>
                  </div>
              </div>
          </div>

        </div>

        {/* SEO Content Section */}
        <section className="mt-20 space-y-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           
           <article className="prose prose-invert max-w-none">
              <div className="grid md:grid-cols-2 gap-12">
                 <div>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                       <Ghost className="text-blue-500" /> What is Keyboard Ghosting?
                    </h2>
                    <p className="text-neutral-400 leading-relaxed mb-4">
                       <strong>Ghosting</strong> occurs when a keyboard fails to register a keypress because too many other keys are being held down simultaneously. This is common in cheap membrane keyboards which share wiring circuits (matrix).
                    </p>
                    <p className="text-neutral-400 leading-relaxed">
                       <strong>NKRO (N-Key Rollover)</strong> means the keyboard can register an unlimited number of simultaneous presses. Most mechanical keyboards support 6KRO (6 keys) or NKRO (infinite).
                    </p>
                 </div>
                 
                 <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <Zap className="text-yellow-500" /> Key Chatter (Double Typing)
                    </h3>
                    <p className="text-sm text-neutral-400 mb-4">
                       Does your keyboard type "tthhe" instead of "the"? This is called Key Chatter.
                    </p>
                    <div className="flex gap-4 p-4 bg-black/40 rounded-lg border border-white/5">
                        <Cpu className="text-neutral-500 shrink-0" />
                        <div className="text-xs text-neutral-400">
                           <strong>The Fix:</strong> Chatter is usually caused by dust inside the mechanical switch. Try removing the keycap and cleaning the switch with compressed air or a drop of isopropyl alcohol.
                        </div>
                    </div>
                 </div>
              </div>

              <hr className="my-12 border-white/10" />

              <h2 className="text-2xl font-bold text-white mb-6">Switch Types Explained</h2>
              <div className="grid md:grid-cols-3 gap-6">
                 <div className="bg-neutral-900/30 p-6 rounded-lg border border-red-500/20">
                    <h4 className="font-bold text-red-400 mb-2">Linear (Red)</h4>
                    <p className="text-sm text-neutral-400">
                       Smooth, consistent keystroke with no bump. Preferred by gamers for rapid double-tapping. Quiet.
                    </p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-lg border border-blue-500/20">
                    <h4 className="font-bold text-blue-400 mb-2">Clicky (Blue)</h4>
                    <p className="text-sm text-neutral-400">
                       Tactile bump + audible "click" sound. Great for typing accuracy, but loud for office environments.
                    </p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-lg border border-yellow-700/20">
                    <h4 className="font-bold text-amber-600 mb-2">Tactile (Brown)</h4>
                    <p className="text-sm text-neutral-400">
                       A subtle bump to feel the actuation point, but without the loud click. The middle ground for mixed use.
                    </p>
                 </div>
              </div>
           </article>

        </section>

        <div className="max-w-7xl mx-auto px-6 w-full">
           <RelatedTools currentPath="/tools/keyboard" />
        </div>

      </div>
    </>
  );
};

export default KeyboardTest;