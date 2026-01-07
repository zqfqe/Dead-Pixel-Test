import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Timer, RotateCcw, MousePointer2, Keyboard, Trophy, BarChart3, Info, Volume2, Eye, Zap, Brain, HelpCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { SEO } from '../common/SEO';
import { RelatedTools } from '../common/RelatedTools';

// ... (Keep existing Type definitions and GameState logic exactly the same)
type GameState = 'idle' | 'waiting' | 'ready' | 'finished' | 'early';
type Mode = 'visual' | 'audio';

const RANKS = [
  { threshold: 150, title: 'Godlike', color: 'text-purple-400' },
  { threshold: 180, title: 'Pro Gamer', color: 'text-blue-400' },
  { threshold: 220, title: 'Average', color: 'text-green-400' },
  { threshold: 300, title: 'Sluggish', color: 'text-yellow-400' },
  { threshold: 9999, title: 'Turtle', color: 'text-red-400' },
];

const ReactionTimeTest: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [mode, setMode] = useState<Mode>('visual');
  const [result, setResult] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio on first user interaction
  const initAudio = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
  };

  const playBeep = () => {
    if (!audioContextRef.current) return;
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    
    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);
    
    osc.frequency.value = 1000;
    osc.type = 'square';
    
    gain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1);
    
    osc.start();
    osc.stop(audioContextRef.current.currentTime + 0.1);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault(); // Prevent page scroll
        handleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, mode]);

  const startGame = () => {
    initAudio();
    setGameState('waiting');
    const randomDelay = Math.floor(Math.random() * 2500) + 1500; // 1.5s to 4.0s
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = performance.now();
      if (mode === 'audio') {
          playBeep();
      }
    }, randomDelay);
  };

  const handleAction = () => {
    if (gameState === 'idle') {
      startGame();
    } else if (gameState === 'waiting') {
      // Clicked too early
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('early');
    } else if (gameState === 'ready') {
      // Successful click
      const endTime = performance.now();
      const rawReactionTime = endTime - startTimeRef.current;
      
      const reactionTime = Math.round(rawReactionTime);
      setResult(reactionTime);
      setHistory(prev => [...prev, reactionTime]);
      setGameState('finished');
    } else if (gameState === 'finished' || gameState === 'early') {
      startGame();
    }
  };

  const resetHistory = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setHistory([]);
    setGameState('idle');
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const switchMode = (newMode: Mode) => {
      setMode(newMode);
      resetHistory();
  };

  // Stats Calculations
  const average = history.length > 0 ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : 0;
  const best = history.length > 0 ? Math.min(...history) : 0;
  
  // Custom Rank logic for Audio (Audio is usually 40ms faster than visual)
  const currentRank = RANKS.find(r => average <= r.threshold) || RANKS[RANKS.length - 1];

  // Distribution Data for Chart
  const distribution = useMemo(() => {
    if (history.length === 0) return [];
    const buckets = [0, 0, 0, 0, 0, 0];
    history.forEach(t => {
      if (t < 150) buckets[0]++;
      else if (t < 200) buckets[1]++;
      else if (t < 250) buckets[2]++;
      else if (t < 300) buckets[3]++;
      else if (t < 400) buckets[4]++;
      else buckets[5]++;
    });
    const maxVal = Math.max(...buckets);
    return buckets.map(val => ({ count: val, height: maxVal > 0 ? (val / maxVal) * 100 : 0 }));
  }, [history]);

  const bucketLabels = ['<150', '200', '250', '300', '400', '400+'];

  // UI Config
  const config = {
    idle: {
      bg: 'bg-[#111111] hover:bg-[#1a1a1a]',
      icon: mode === 'visual' ? <MousePointer2 size={48} className="text-blue-500" /> : <Volume2 size={48} className="text-blue-500" />,
      title: mode === 'visual' ? 'Visual Reflex' : 'Audio Reflex',
      sub: mode === 'visual' ? 'Click when screen turns GREEN.' : 'Click when you HEAR the beep.',
      textColor: 'text-white'
    },
    waiting: {
      bg: 'bg-red-600',
      icon: mode === 'visual' ? <Timer size={48} className="text-white animate-pulse" /> : <Volume2 size={48} className="text-white opacity-50" />,
      title: mode === 'visual' ? 'Wait for Green...' : 'Listen...',
      sub: mode === 'visual' ? 'Do not click yet.' : 'Wait for the sound.',
      textColor: 'text-white'
    },
    ready: {
      bg: 'bg-[#22c55e]',
      icon: mode === 'visual' ? <MousePointer2 size={48} className="text-white" /> : <Volume2 size={64} className="text-white animate-bounce" />,
      title: 'CLICK NOW!',
      sub: '',
      textColor: 'text-white'
    },
    finished: {
      bg: 'bg-blue-600',
      icon: <Timer size={48} className="text-white" />,
      title: `${result} ms`,
      sub: 'Click to try again.',
      textColor: 'text-white'
    },
    early: {
      bg: 'bg-orange-500',
      icon: <RotateCcw size={48} className="text-white" />,
      title: 'Too Soon!',
      sub: 'You clicked before the signal.',
      textColor: 'text-white'
    }
  };

  const current = config[gameState];

  return (
    <>
      <SEO 
        title="Reaction Time Test - Human Benchmark (Visual & Audio)" 
        description="Measure your reaction time in milliseconds. Compare your visual reflexes vs auditory reflexes. The average human visual reaction is ~215ms."
        canonical="/tools/reaction-time"
        keywords={['reaction time test', 'human benchmark', 'reflex test', 'click speed test', 'visual reaction time', 'audio reaction time']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Reaction Time', path: '/tools/reaction-time' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is the average human reaction time?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The average visual reaction time is around 215-250ms. Auditory reaction time is typically faster, around 170ms."
              }
            },
            {
              "@type": "Question",
              "name": "Why is audio reaction faster?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Auditory stimuli reach the brain faster (8-10ms) than visual stimuli (20-40ms), allowing for a quicker reflex response."
              }
            },
            {
              "@type": "Question",
              "name": "Does age affect reaction time?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Reaction time peaks around age 24 and slowly declines by about 2-6ms per decade thereafter."
              }
            }
          ]
        }}
      />
      <div className="max-w-5xl mx-auto py-12 px-6 animate-fade-in select-none">
        
        {/* --- Mode Switcher --- */}
        <div className="flex justify-center mb-8">
           <div className="bg-neutral-900 p-1 rounded-xl border border-white/10 flex gap-1">
              <button 
                  onClick={() => switchMode('visual')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'visual' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
              >
                  <Eye size={16} /> Visual
              </button>
              <button 
                  onClick={() => switchMode('audio')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'audio' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
              >
                  <Volume2 size={16} /> Audio
              </button>
           </div>
        </div>

        {/* --- Main Game Area --- */}
        <div 
          className={`
            w-full aspect-video md:aspect-[21/9] rounded-3xl shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-100 ease-linear
            ${current.bg} ${current.textColor} relative overflow-hidden group
          `}
          onMouseDown={handleAction}
        >
          {/* Helper Hint */}
          {gameState === 'idle' && (
            <div className="absolute top-6 right-6 flex items-center gap-2 text-xs font-mono opacity-50 border border-white/20 px-3 py-1 rounded-full">
              <Keyboard size={14} /> SPACEBAR Supported
            </div>
          )}

          <div className="mb-6 opacity-90 transform group-hover:scale-110 transition-transform duration-200">{current.icon}</div>
          <h1 className="text-5xl md:text-8xl font-bold mb-4 tracking-tighter tabular-nums">{current.title}</h1>
          <p className="text-xl md:text-2xl font-medium opacity-80">{current.sub}</p>
          
          {/* Reset button only visible in result screens */}
          {(gameState === 'finished' || gameState === 'early' || (gameState === 'idle' && history.length > 0)) && (
            <button 
               onClick={resetHistory}
               className="absolute bottom-8 text-xs font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full"
            >
              <RotateCcw size={14} /> Reset Stats
            </button>
          )}
        </div>

        {/* --- Stats Dashboard --- */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Rank Card */}
          <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
             <Trophy size={24} className={history.length > 0 ? currentRank.color : 'text-neutral-700'} />
             <div className="mt-2 text-xs font-bold uppercase tracking-widest text-neutral-500">Current Rank</div>
             <div className={`text-3xl font-bold mt-1 ${history.length > 0 ? currentRank.color : 'text-neutral-700'}`}>
               {history.length > 0 ? currentRank.title : '-'}
             </div>
          </div>

          {/* 2. Average & Best */}
          <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-2xl flex justify-between items-center px-8">
             <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">Average</div>
                <div className="text-4xl font-mono font-bold text-white">{average}<span className="text-sm text-neutral-500 ml-1">ms</span></div>
             </div>
             <div className="w-px h-12 bg-white/10"></div>
             <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">Best</div>
                <div className="text-4xl font-mono font-bold text-blue-400">{best}<span className="text-sm text-neutral-500 ml-1">ms</span></div>
             </div>
          </div>

          {/* 3. Distribution Graph */}
          <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-2xl flex flex-col justify-end relative h-36">
             {history.length === 0 && (
               <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-700 italic">
                 Play to see stats
               </div>
             )}
             <div className="flex items-end justify-between h-20 gap-2">
               {distribution.map((bar, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                   <div 
                     className="w-full bg-blue-600/50 rounded-t-sm transition-all duration-500 relative hover:bg-blue-500" 
                     style={{ height: `${Math.max(bar.height, 5)}%` }}
                   >
                     {/* Tooltip */}
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                       {bar.count} attempts
                     </div>
                   </div>
                   <span className="text-[9px] text-neutral-500 font-mono">{bucketLabels[i]}</span>
                 </div>
               ))}
             </div>
             <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
               <BarChart3 size={14} /> Distribution
             </div>
          </div>
        </div>

        {/* --- Detailed History Strip --- */}
        {history.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 justify-center opacity-50 hover:opacity-100 transition-opacity">
             {history.slice().reverse().slice(0, 20).map((time, i) => (
               <span key={i} className="bg-neutral-800 text-neutral-400 px-2 py-1 rounded-md font-mono text-xs border border-neutral-700">
                 {time}
               </span>
             ))}
             {history.length > 20 && <span className="text-xs text-neutral-600 py-1">...</span>}
          </div>
        )}

        {/* --- Deep Content Section for SEO --- */}
        <section className="mt-24 space-y-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           
           <div className="grid md:grid-cols-2 gap-12">
              <div>
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Brain className="text-blue-500" /> Human Benchmarks
                 </h2>
                 <p className="text-neutral-400 leading-relaxed text-sm mb-4">
                    The average human visual reaction time is approximately <strong>215 to 250 milliseconds (ms)</strong>. Professional e-sports athletes often achieve scores between 150-180ms.
                 </p>
                 <p className="text-neutral-400 leading-relaxed text-sm">
                    <strong>Auditory Reflex:</strong> Sound reaches the brain faster than visual processing. Expect your Audio Test score to be 30-50ms faster (around 170ms average).
                 </p>
              </div>
              <div>
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="text-yellow-500" /> Hardware Latency (Input Lag)
                 </h2>
                 <p className="text-neutral-400 leading-relaxed text-sm mb-4">
                    Your score includes your biological reaction + computer latency. A standard 60Hz monitor adds ~16ms of delay. A wireless mouse can add 10-20ms.
                 </p>
                 <p className="text-neutral-400 leading-relaxed text-sm">
                    <strong>Tip:</strong> For the best score, use a wired mouse and a high refresh rate monitor (144Hz or higher).
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
                    <h4 className="font-bold text-white text-base mb-2">What is the average human reaction time?</h4>
                    <p className="text-neutral-400 text-sm">The average visual reaction time is around 215-250ms. Auditory reaction time is typically faster, around 170ms.</p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">Does age affect reaction time?</h4>
                    <p className="text-neutral-400 text-sm">Yes. Reaction time peaks around age 24 and slowly declines by about 2-6ms per decade thereafter.</p>
                 </div>
              </div>
           </div>

           <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-8 mt-8">
              <h3 className="text-lg font-bold text-white mb-4">Age Factors</h3>
              <p className="text-sm text-neutral-400 mb-6">
                 Reaction time naturally declines with age. This decline typically starts around age 24.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                 <div className="bg-black border border-white/10 p-4 rounded-lg">
                    <strong className="text-white block mb-2">Age 18-24</strong>
                    <span className="text-green-400 font-bold">~210ms</span>
                 </div>
                 <div className="bg-black border border-white/10 p-4 rounded-lg">
                    <strong className="text-white block mb-2">Age 25-35</strong>
                    <span className="text-blue-400 font-bold">~220ms</span>
                 </div>
                 <div className="bg-black border border-white/10 p-4 rounded-lg">
                    <strong className="text-white block mb-2">Age 35-45</strong>
                    <span className="text-yellow-400 font-bold">~240ms</span>
                 </div>
                 <div className="bg-black border border-white/10 p-4 rounded-lg">
                    <strong className="text-white block mb-2">Age 45+</strong>
                    <span className="text-red-400 font-bold">~270ms+</span>
                 </div>
              </div>
           </div>

        </section>

        <div className="max-w-7xl mx-auto px-6 w-full">
           <RelatedTools currentPath="/tools/reaction-time" />
        </div>

      </div>
    </>
  );
};

export default ReactionTimeTest;