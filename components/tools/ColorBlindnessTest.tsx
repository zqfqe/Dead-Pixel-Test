import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Eye, EyeOff, SplitSquareHorizontal, Download, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { SEO } from '../common/SEO';
import { TestIntro, InfoCard } from '../common/TestIntro';

type SimMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

const MODES: { id: SimMode; label: string; desc: string }[] = [
  { id: 'normal', label: 'Normal Vision', desc: 'No filter applied.' },
  { id: 'protanopia', label: 'Protanopia (Red-Blind)', desc: 'Difficulty distinguishing red and green. Reds look dark/brown.' },
  { id: 'deuteranopia', label: 'Deuteranopia (Green-Blind)', desc: 'Most common. Reds and greens look brownish-yellow.' },
  { id: 'tritanopia', label: 'Tritanopia (Blue-Blind)', desc: 'Rare. Difficulty with blue/yellow. World looks pink/red.' },
  { id: 'achromatopsia', label: 'Achromatopsia (Total)', desc: 'Complete color blindness. Seeing in grayscale.' },
];

const ColorBlindnessTest: React.FC = () => {
  const [sourceType, setSourceType] = useState<'camera' | 'image' | null>(null);
  const [activeMode, setActiveMode] = useState<SimMode>('deuteranopia');
  const [splitView, setSplitView] = useState(true);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // SVG Filters Definitions (Standard matrices for CVD simulation)
  // Source: libdaltonia / color-blindness-simulation research
  const filters = (
    <svg style={{ display: 'none' }}>
      <defs>
        <filter id="protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567, 0.433, 0,     0, 0
                    0.558, 0.442, 0,     0, 0
                    0,     0.242, 0.758, 0, 0
                    0,     0,     0,     1, 0"
          />
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625, 0.375, 0,   0, 0
                    0.7,   0.3,   0,   0, 0
                    0,     0.3,   0.7, 0, 0
                    0,     0,     0,   1, 0"
          />
        </filter>
        <filter id="tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95, 0.05,  0,     0, 0
                    0,    0.433, 0.567, 0, 0
                    0,    0.475, 0.525, 0, 0
                    0,    0,     0,     1, 0"
          />
        </filter>
        <filter id="achromatopsia">
          <feColorMatrix
            type="matrix"
            values="0.299, 0.587, 0.114, 0, 0
                    0.299, 0.587, 0.114, 0, 0
                    0.299, 0.587, 0.114, 0, 0
                    0,     0,     0,     1, 0"
          />
        </filter>
      </defs>
    </svg>
  );

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 } } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setSourceType('camera');
      setError(null);
    } catch (err) {
      setError("Could not access camera. Please allow permissions or try uploading an image.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setSourceType('image');
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <>
      <SEO 
        title="Color Blindness Simulator - View World as Colorblind" 
        description="Simulate Red-Green (Deuteranopia), Red (Protanopia), and Blue-Yellow (Tritanopia) color blindness using your camera or images. Essential tool for accessible design."
        canonical="/tools/color-blindness"
        keywords={['color blindness simulator', 'cvd simulator', 'colorblind camera', 'protanopia filter', 'deuteranopia filter', 'accessibility testing']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Color Blindness Sim', path: '/tools/color-blindness' }
        ]}
      />
      
      {filters}

      <div className="max-w-6xl mx-auto py-12 px-6 animate-fade-in min-h-screen flex flex-col">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-bold text-white mb-4">Color Blindness Simulator</h1>
           <p className="text-neutral-400 max-w-2xl mx-auto">
             Visualize how people with different types of color vision deficiencies see the world. 
             Use your camera to explore your environment or upload a design to test accessibility.
           </p>
        </div>

        {/* Input Selection */}
        {!sourceType && (
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto w-full">
             <button 
               onClick={startCamera}
               className="flex flex-col items-center justify-center p-12 bg-neutral-900 border border-white/10 rounded-3xl hover:bg-neutral-800 hover:border-blue-500/50 transition-all group"
             >
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                   <Camera size={40} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Use Camera</h3>
                <p className="text-neutral-500 text-sm text-center">Real-time AR simulation using your webcam.</p>
             </button>

             <label className="flex flex-col items-center justify-center p-12 bg-neutral-900 border border-white/10 rounded-3xl hover:bg-neutral-800 hover:border-green-500/50 transition-all group cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6 group-hover:scale-110 transition-transform">
                   <Upload size={40} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upload Image</h3>
                <p className="text-neutral-500 text-sm text-center">Test screenshots, designs, or photos.</p>
             </label>
          </div>
        )}

        {error && (
           <div className="max-w-md mx-auto mt-8 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-300">
              <AlertCircle size={20} />
              {error}
           </div>
        )}

        {/* Simulator Interface */}
        {sourceType && (
           <div className="space-y-8 animate-slide-up">
              
              {/* Controls Toolbar */}
              <div className="bg-neutral-900/80 backdrop-blur border border-white/10 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 sticky top-24 z-30 shadow-2xl">
                 <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar max-w-full">
                    {MODES.map(m => (
                       <button
                         key={m.id}
                         onClick={() => setActiveMode(m.id)}
                         className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeMode === m.id ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                       >
                         {m.label}
                       </button>
                    ))}
                 </div>

                 <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                    <button 
                      onClick={() => setSplitView(!splitView)}
                      className={`p-2 rounded-lg transition-all ${splitView ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
                      title="Toggle Split View"
                    >
                       <SplitSquareHorizontal size={20} />
                    </button>
                    <button 
                      onClick={() => { stopCamera(); setSourceType(null); }}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-bold"
                    >
                       Change Source
                    </button>
                 </div>
              </div>

              {/* Viewport */}
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                 {/* This container holds the content. We duplicate it for split view effect */}
                 
                 {/* Layer 1: Simulated (Filtered) - Full width or Right Half */}
                 <div 
                    className="absolute inset-0 z-10 bg-black"
                    style={{ 
                        filter: activeMode !== 'normal' ? `url(#${activeMode})` : 'none',
                        clipPath: splitView ? 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' : 'none'
                    }}
                 >
                    {sourceType === 'camera' ? (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
                    ) : (
                        <img src={imageSrc!} alt="Test" className="w-full h-full object-contain" />
                    )}
                 </div>

                 {/* Layer 2: Original (Normal) - Left Half (Only visible in split) */}
                 {splitView && (
                    <div 
                        className="absolute inset-0 z-20 pointer-events-none"
                        style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                    >
                        {sourceType === 'camera' ? (
                            /* We can't reuse the video element easily without canvas, so we clone stream or just let user know limitation.
                               Actually, for webcam, we can just render the video element once and use a parent wrapper for the filter?
                               No, `filter` applies to the element. 
                               Trick: Render video ONCE. Use a parent div for Original, and a sibling absolute div for filtered that CLONES? 
                               Actually, for simple CSS split view on video, we need two video elements sharing stream.
                            */
                            <VideoMirror stream={streamRef.current} />
                        ) : (
                            <img src={imageSrc!} alt="Original" className="w-full h-full object-contain" />
                        )}
                        <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur">Original</div>
                    </div>
                 )}

                 {/* Labels */}
                 <div className={`absolute top-4 right-4 z-30 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur ${activeMode === 'normal' ? 'hidden' : ''}`}>
                    {MODES.find(m => m.id === activeMode)?.label} Simulation
                 </div>

                 {/* Divider Line */}
                 {splitView && (
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50 z-40 pointer-events-none">
                       <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white text-black rounded-full p-1 shadow-lg">
                          <SplitSquareHorizontal size={14} />
                       </div>
                    </div>
                 )}
              </div>

              {/* Info Description */}
              <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/10 flex items-start gap-4">
                 <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                    <Eye size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white mb-2">{MODES.find(m => m.id === activeMode)?.label}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                       {MODES.find(m => m.id === activeMode)?.desc}
                    </p>
                 </div>
              </div>

           </div>
        )}
      </div>
    </>
  );
};

// Helper for Split View Video
const VideoMirror = ({ stream }: { stream: MediaStream | null }) => {
    const ref = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (ref.current && stream) ref.current.srcObject = stream;
    }, [stream]);
    return <video ref={ref} autoPlay playsInline muted className="w-full h-full object-contain" />;
};

export default ColorBlindnessTest;