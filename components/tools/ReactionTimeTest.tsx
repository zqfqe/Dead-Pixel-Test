import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Timer, RotateCcw, MousePointer2, Keyboard, Trophy, BarChart3, Info, Volume2, Eye } from 'lucide-react';
import { Button } from '../common/Button';

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
  // We can adjust threshold or just keep same for comparison
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

      {/* --- Technical Note --- */}
      <div className="mt-12 bg-blue-900/10 border border-blue-500/20 rounded-xl p-6 text-sm text-neutral-400 max-w-4xl mx-auto flex gap-4">
        <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
        <div className="space-y-2">
          <p>
            <strong className="text-blue-400">Science Fact:</strong> Auditory stimuli reach the brain faster (8-10ms) than visual stimuli (20-40ms). You should score 30-50ms faster in Audio Mode!
          </p>
          <ul className="list-disc pl-4 space-y-1 text-xs">
            <li><strong>Monitor Lag:</strong> Visual mode includes input lag + display response time + refresh delay.</li>
            <li><strong>Audio Latency:</strong> Audio mode relies on sound card latency, which is typically lower than total display chain latency on 60Hz screens.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReactionTimeTest;