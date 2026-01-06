import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, Headphones, Radio, Mic2, AlertTriangle, Speaker, Waves } from 'lucide-react';
import { SEO } from '../common/SEO';

type TestMode = 'stereo' | 'phase' | 'sweep';

const SpeakerTest: React.FC = () => {
  const [activeTest, setActiveTest] = useState<TestMode>('stereo');
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(0); // For sweep visualization
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const sweepIntervalRef = useRef<number>();

  const initAudio = () => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
    }
    return audioCtxRef.current!;
  };

  const stopAudio = () => {
    if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
    }
    if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
    }
    if (sweepIntervalRef.current) {
        clearInterval(sweepIntervalRef.current);
        sweepIntervalRef.current = undefined;
    }
    setIsPlaying(false);
    setFrequency(0);
  };

  // --- TEST 1: STEREO CHECK ---
  const playStereoCheck = (channel: 'left' | 'right' | 'center') => {
    const ctx = initAudio();
    stopAudio(); // Stop any previous sound
    setIsPlaying(true);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.5); // Drop pitch for pleasant UI sound

    // Pan
    panner.pan.value = channel === 'left' ? -1 : channel === 'right' ? 1 : 0;

    // Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
    
    // Auto reset state after playback
    setTimeout(() => setIsPlaying(false), 600);
  };

  // --- TEST 2: PHASE (POLARITY) ---
  const playPhaseTest = (isInPhase: boolean) => {
    const ctx = initAudio();
    stopAudio();
    setIsPlaying(true);

    // Create Pink Noise
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const data0 = buffer.getChannelData(0);
    const data1 = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Simple white noise is enough for phase check
        data0[i] = white;
        // If In-Phase: L = R. If Out-of-Phase: L = -R
        data1[i] = isInPhase ? white : -white;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    const gain = ctx.createGain();
    gain.gain.value = 0.2; // Keep volume safe

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    sourceNodeRef.current = source;
  };

  // --- TEST 3: FREQUENCY SWEEP ---
  const playSweep = () => {
    const ctx = initAudio();
    stopAudio();
    setIsPlaying(true);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    gain.gain.value = 0.3;

    // Sweep 20Hz to 20000Hz over 10 seconds
    const startFreq = 20;
    const endFreq = 20000;
    const duration = 10;
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(now + duration);
    oscillatorRef.current = osc;

    // Update UI
    const startTime = Date.now();
    sweepIntervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= duration) {
            stopAudio();
            return;
        }
        // Calculate current freq based on exponential ramp formula
        // f(t) = f0 * (f1/f0)^(t/T)
        const currFreq = startFreq * Math.pow(endFreq / startFreq, elapsed / duration);
        setFrequency(Math.round(currFreq));
    }, 50);
  };

  useEffect(() => {
    return () => {
        if (audioCtxRef.current) audioCtxRef.current.close();
        if (sweepIntervalRef.current) clearInterval(sweepIntervalRef.current);
    };
  }, []);

  return (
    <>
      <SEO 
        title="Online Speaker Test - Left/Right Stereo & Phase Check" 
        description="Test your speakers or headphones online. Verify Left/Right stereo separation, check polarity (phase), and test frequency response (20Hz - 20kHz)."
        canonical="/tools/speaker-test"
        keywords={['speaker test', 'left right audio test', 'stereo test', 'headphone test', 'audio phase test', 'frequency sweep test', 'sound check']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Speaker Test', path: '/tools/speaker-test' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Speaker & Headphone Test",
          "url": "https://deadpixeltest.cc/tools/speaker-test",
          "description": "Test left/right stereo channels, phase polarity, and frequency response range.",
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Web Browser",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        }}
      />
      <div className="max-w-5xl mx-auto py-12 px-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-12">
           <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 text-purple-400 rounded-2xl mb-4">
              <Volume2 size={32} />
           </div>
           <h1 className="text-4xl font-bold text-white mb-4">Audio System Test</h1>
           <p className="text-neutral-400 max-w-lg mx-auto">
              Verify your left/right channels, check for wiring phase issues, and test the frequency response range of your speakers or headphones.
           </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
           <div className="bg-neutral-900 p-1 rounded-xl border border-white/10 flex">
              {[
                  { id: 'stereo', label: 'Stereo Check', icon: Headphones },
                  { id: 'phase', label: 'Polarity / Phase', icon: Radio },
                  { id: 'sweep', label: 'Frequency Sweep', icon: Waves },
              ].map((tab) => (
                  <button
                      key={tab.id}
                      onClick={() => { setActiveTest(tab.id as TestMode); stopAudio(); }}
                      className={`
                          flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all
                          ${activeTest === tab.id ? 'bg-purple-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}
                      `}
                  >
                      <tab.icon size={16} />
                      {tab.label}
                  </button>
              ))}
           </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-[#050505] border border-white/10 rounded-3xl p-8 md:p-12 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
           
           {/* Background Visuals */}
           <div className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(circle at center, #222 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
           />

           {/* --- STEREO TEST --- */}
           {activeTest === 'stereo' && (
               <div className="flex flex-col items-center w-full max-w-2xl relative z-10 animate-fade-in">
                   <div className="flex justify-between w-full mb-12">
                       <button 
                          onClick={() => playStereoCheck('left')}
                          className="group flex flex-col items-center gap-4 transition-transform active:scale-95"
                       >
                          <div className="w-32 h-32 rounded-full border-4 border-neutral-800 group-hover:border-purple-500 flex items-center justify-center bg-neutral-900 shadow-2xl transition-colors">
                              <Speaker size={48} className="text-neutral-600 group-hover:text-purple-400" />
                          </div>
                          <span className="text-xl font-bold text-neutral-500 group-hover:text-white">LEFT</span>
                       </button>

                       <button 
                          onClick={() => playStereoCheck('right')}
                          className="group flex flex-col items-center gap-4 transition-transform active:scale-95"
                       >
                          <div className="w-32 h-32 rounded-full border-4 border-neutral-800 group-hover:border-purple-500 flex items-center justify-center bg-neutral-900 shadow-2xl transition-colors">
                              <Speaker size={48} className="text-neutral-600 group-hover:text-purple-400" />
                          </div>
                          <span className="text-xl font-bold text-neutral-500 group-hover:text-white">RIGHT</span>
                       </button>
                   </div>
                   
                   <div className="bg-neutral-900/80 px-6 py-3 rounded-full text-neutral-400 text-sm border border-white/10">
                      Click speakers to verify spatial positioning.
                   </div>
               </div>
           )}

           {/* --- PHASE TEST --- */}
           {activeTest === 'phase' && (
               <div className="flex flex-col items-center w-full max-w-2xl relative z-10 animate-fade-in text-center">
                   <div className="flex gap-4 mb-8">
                      <button 
                          onClick={() => playPhaseTest(true)}
                          className={`px-8 py-4 rounded-xl font-bold border-2 transition-all ${isPlaying && sourceNodeRef.current ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-neutral-800 border-neutral-700 hover:border-neutral-500'}`}
                      >
                          IN PHASE (Center)
                      </button>
                      <button 
                          onClick={() => playPhaseTest(false)}
                          className={`px-8 py-4 rounded-xl font-bold border-2 transition-all ${isPlaying && sourceNodeRef.current ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-neutral-800 border-neutral-700 hover:border-neutral-500'}`}
                      >
                          OUT OF PHASE (Wide)
                      </button>
                   </div>
                   
                   {isPlaying && (
                      <button onClick={stopAudio} className="mb-8 flex items-center gap-2 text-neutral-400 hover:text-white bg-white/5 px-4 py-2 rounded-full">
                          <Pause size={16} /> Stop Noise
                      </button>
                   )}

                   <div className="max-w-lg text-sm text-neutral-400 bg-neutral-900/50 p-6 rounded-2xl border border-white/10">
                      <p className="mb-2"><strong className="text-white">In Phase:</strong> The sound should appear to come from a focused point directly between the speakers (or center of your head).</p>
                      <p><strong className="text-white">Out of Phase:</strong> The sound feels "hollow", diffuse, and hard to locate. If "In Phase" sounds like this, your speaker wires are reversed (+/-).</p>
                   </div>
               </div>
           )}

           {/* --- SWEEP TEST --- */}
           {activeTest === 'sweep' && (
               <div className="flex flex-col items-center w-full max-w-2xl relative z-10 animate-fade-in text-center">
                   <div className="mb-8">
                      <div className="text-6xl font-mono font-bold text-white mb-2 tabular-nums">
                          {frequency > 0 ? frequency : '--'} <span className="text-2xl text-neutral-500">Hz</span>
                      </div>
                      <div className="text-sm text-neutral-500 uppercase tracking-widest">Current Frequency</div>
                   </div>

                   <div className="w-full h-2 bg-neutral-800 rounded-full mb-8 overflow-hidden relative">
                      <div 
                          className="h-full bg-purple-500 transition-all duration-75" 
                          style={{ width: `${Math.min(100, (frequency / 20000) * 100)}%` }} 
                      />
                   </div>

                   {!isPlaying ? (
                      <button 
                          onClick={playSweep}
                          className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                      >
                          <Play size={18} /> Start 20Hz - 20kHz Sweep
                      </button>
                   ) : (
                      <button 
                          onClick={stopAudio}
                          className="flex items-center gap-2 bg-red-500 text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition-colors"
                      >
                          <Pause size={18} /> Stop
                      </button>
                   )}
                   
                   <div className="mt-8 flex items-start gap-3 text-left text-xs text-neutral-500 bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-xl">
                      <AlertTriangle className="text-yellow-500 shrink-0" size={16} />
                      <p>
                          <strong>Warning:</strong> Start with a LOW volume. High frequency sounds can be damaging to hearing and tweeters at high volumes. If you hear rattling, your enclosure may have loose parts.
                      </p>
                   </div>
               </div>
           )}

        </div>
      </div>
    </>
  );
};

export default SpeakerTest;