import React, { useState, useMemo } from 'react';
import { Calculator, Monitor, Ruler, Info, Smartphone, Tablet, Laptop, Grid, Box } from 'lucide-react';

const DEVICE_PRESETS = {
  monitors: [
    { name: '24" 1080p (FHD)', w: 1920, h: 1080, d: 24 },
    { name: '27" 1440p (QHD)', w: 2560, h: 1440, d: 27 },
    { name: '32" 4K (UHD)', w: 3840, h: 2160, d: 32 },
    { name: '34" Ultrawide', w: 3440, h: 1440, d: 34 },
    { name: '49" Super Ultrawide', w: 5120, h: 1440, d: 49 },
  ],
  laptops: [
    { name: 'MacBook Air 13"', w: 2560, h: 1664, d: 13.6 },
    { name: 'MacBook Pro 16"', w: 3456, h: 2234, d: 16.2 },
    { name: 'Surface Laptop 13.5"', w: 2256, h: 1504, d: 13.5 },
    { name: 'Standard 15.6" FHD', w: 1920, h: 1080, d: 15.6 },
  ],
  mobile: [
    { name: 'iPhone 15 Pro', w: 2556, h: 1179, d: 6.1 },
    { name: 'iPhone 15 Pro Max', w: 2796, h: 1290, d: 6.7 },
    { name: 'Samsung S24 Ultra', w: 3120, h: 1440, d: 6.8 },
    { name: 'iPad Pro 11"', w: 2388, h: 1668, d: 11 },
    { name: 'iPad Pro 12.9"', w: 2732, h: 2048, d: 12.9 },
  ]
};

const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

const PPICalculator: React.FC = () => {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [diagonal, setDiagonal] = useState(24);
  const [activeTab, setActiveTab] = useState<'monitors' | 'laptops' | 'mobile'>('monitors');

  const stats = useMemo(() => {
    if (!width || !height || !diagonal) return null;

    // PPI
    const diagonalPixels = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
    const ppi = diagonalPixels / diagonal;

    // Dot Pitch (mm) = 25.4 / PPI
    const dotPitch = 25.4 / ppi;

    // Physical Dimensions
    // angle theta = atan(h/w)
    const angle = Math.atan(height / width);
    const widthIn = diagonal * Math.cos(angle);
    const heightIn = diagonal * Math.sin(angle);
    const widthCm = widthIn * 2.54;
    const heightCm = heightIn * 2.54;
    const areaSqCm = widthCm * heightCm;

    // Aspect Ratio
    const divisor = gcd(width, height);
    const arX = width / divisor;
    const arY = height / divisor;
    // For visualization aspect ratio (clamped to avoid extreme CSS issues)
    const visualRatio = width / height;

    // Retina Distances
    // 20/20 vision typically resolves 1 arcminute.
    // Distance = 3438 / PPI (inches) or 8732 / PPI (cm)
    const retinaCm = 8732 / ppi;

    // Total Pixels
    const mp = (width * height) / 1000000;

    return {
      ppi: ppi.toFixed(2),
      dotPitch: dotPitch.toFixed(4),
      widthIn: widthIn.toFixed(2),
      heightIn: heightIn.toFixed(2),
      widthCm: widthCm.toFixed(1),
      heightCm: heightCm.toFixed(1),
      area: areaSqCm.toFixed(0),
      arLabel: `${arX}:${arY}`,
      visualRatio,
      retinaCm: retinaCm.toFixed(0),
      mp: mp.toFixed(2)
    };
  }, [width, height, diagonal]);

  const loadPreset = (preset: typeof DEVICE_PRESETS.monitors[0]) => {
    setWidth(preset.w);
    setHeight(preset.h);
    setDiagonal(preset.d);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 animate-fade-in font-sans">
      <div className="text-center mb-12">
        <div className="inline-flex justify-center items-center w-16 h-16 bg-blue-900/20 text-blue-400 rounded-2xl mb-6 shadow-lg shadow-blue-900/10">
           <Calculator size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">PPI Calculator</h1>
        <p className="text-neutral-400 max-w-lg mx-auto leading-relaxed">
          Analyze display sharpness, calculate physical dimensions, and determine the ideal viewing distance for any screen size.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT COL: INPUTS & PRESETS (5 cols) --- */}
        <div className="lg:col-span-5 space-y-6">
           
           {/* Manual Inputs */}
           <div className="bg-neutral-900/80 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                 <Grid size={16} /> Screen Specs
              </h3>
              
              <div className="space-y-5">
                 {/* Resolution Row */}
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-neutral-500 mb-1.5 block">Width (px)</label>
                        <input 
                            type="number" 
                            value={width} 
                            onChange={(e) => setWidth(Number(e.target.value))}
                            className="w-full bg-black border border-neutral-800 focus:border-blue-500 rounded-lg p-3 text-white font-mono outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-neutral-500 mb-1.5 block">Height (px)</label>
                        <input 
                            type="number" 
                            value={height} 
                            onChange={(e) => setHeight(Number(e.target.value))}
                            className="w-full bg-black border border-neutral-800 focus:border-blue-500 rounded-lg p-3 text-white font-mono outline-none transition-colors"
                        />
                    </div>
                 </div>

                 {/* Diagonal Row */}
                 <div>
                    <label className="text-xs font-bold text-neutral-500 mb-1.5 block">Diagonal Size (inches)</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={diagonal} 
                            onChange={(e) => setDiagonal(Number(e.target.value))}
                            className="w-full bg-black border border-neutral-800 focus:border-blue-500 rounded-lg p-3 text-white font-mono outline-none transition-colors pr-12"
                        />
                        <span className="absolute right-4 top-3.5 text-neutral-600 text-sm font-medium">inch</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Load Presets */}
           <div className="bg-neutral-900/80 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Quick Load</h3>
              
              {/* Tabs */}
              <div className="flex bg-black p-1 rounded-lg mb-4 border border-neutral-800">
                 <button onClick={() => setActiveTab('monitors')} className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all ${activeTab === 'monitors' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}>
                    <Monitor size={14} /> Monitors
                 </button>
                 <button onClick={() => setActiveTab('laptops')} className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all ${activeTab === 'laptops' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}>
                    <Laptop size={14} /> Laptops
                 </button>
                 <button onClick={() => setActiveTab('mobile')} className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all ${activeTab === 'mobile' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}>
                    <Smartphone size={14} /> Mobile
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                 {DEVICE_PRESETS[activeTab].map((p, idx) => (
                    <button 
                      key={idx}
                      onClick={() => loadPreset(p)}
                      className="text-left px-3 py-2 bg-neutral-800/30 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 rounded-lg transition-all group"
                    >
                       <div className="text-xs font-bold text-neutral-300 group-hover:text-white truncate">{p.name}</div>
                       <div className="text-[10px] text-neutral-500 font-mono mt-0.5 group-hover:text-blue-400">{p.w}x{p.h} · {p.d}"</div>
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* --- RIGHT COL: RESULTS (7 cols) --- */}
        {stats && (
            <div className="lg:col-span-7 space-y-6">
                
                {/* Hero PPI Card */}
                <div className="bg-gradient-to-br from-blue-900/40 via-neutral-900 to-black border border-blue-500/30 p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <div className="text-center md:text-left z-10">
                        <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-1">Pixel Density</div>
                        <div className="text-6xl font-bold text-white tracking-tighter leading-none mb-2">{stats.ppi} <span className="text-2xl text-neutral-500 font-medium">PPI</span></div>
                        <p className="text-neutral-400 text-sm max-w-xs">
                            {Number(stats.ppi) > 300 ? "Retina Quality. Pixels invisible at 10 inches." : 
                             Number(stats.ppi) > 150 ? "Sharp. Excellent for laptops and 4K monitors." :
                             Number(stats.ppi) > 90 ? "Standard. Good for desktop use at arm's length." : "Low Density. Pixelation visible."}
                        </p>
                    </div>

                    {/* Visual Aspect Ratio Box */}
                    <div className="relative shrink-0 z-10">
                        <div 
                            className="border-2 border-white/30 bg-white/5 rounded flex items-center justify-center relative shadow-lg"
                            style={{ 
                                width: '160px', 
                                height: `${160 / stats.visualRatio}px`,
                                maxHeight: '160px',
                                maxWidth: '160px'
                            }}
                        >
                            <span className="text-xs font-bold text-white">{stats.arLabel}</span>
                            {/* Dimension Labels */}
                            <span className="absolute -bottom-6 text-[10px] text-neutral-500 font-mono whitespace-nowrap">{stats.widthCm} cm</span>
                            <span className="absolute -left-12 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500 font-mono -rotate-90 whitespace-nowrap">{stats.heightCm} cm</span>
                        </div>
                    </div>
                </div>

                {/* Retina Distance */}
                <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-2xl flex items-center gap-6">
                    <div className="bg-purple-500/10 p-4 rounded-xl text-purple-400 shrink-0">
                        <Info size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white mb-1">Retina Viewing Distance</h4>
                        <p className="text-sm text-neutral-400 mb-3">
                            The minimum distance you need to sit for the pixels to become indistinguishable to the human eye (20/20 vision).
                        </p>
                        <div className="inline-flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white font-mono">{stats.retinaCm}</span>
                            <span className="text-sm text-neutral-500 font-bold">cm</span>
                            <span className="text-neutral-600 mx-2">/</span>
                            <span className="text-xl font-bold text-neutral-300 font-mono">{(Number(stats.retinaCm) / 2.54).toFixed(1)}</span>
                            <span className="text-sm text-neutral-500 font-bold">inches</span>
                        </div>
                    </div>
                </div>

                {/* Detailed Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-black border border-neutral-800 p-4 rounded-xl">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                            <Box size={12} /> Dot Pitch
                        </div>
                        <div className="text-xl font-mono text-white">{stats.dotPitch}<span className="text-xs text-neutral-500 ml-1">mm</span></div>
                    </div>
                    <div className="bg-black border border-neutral-800 p-4 rounded-xl">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                            <Grid size={12} /> Total Pixels
                        </div>
                        <div className="text-xl font-mono text-white">{stats.mp}<span className="text-xs text-neutral-500 ml-1">MP</span></div>
                    </div>
                    <div className="bg-black border border-neutral-800 p-4 rounded-xl">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                            <Ruler size={12} /> Screen Area
                        </div>
                        <div className="text-xl font-mono text-white">{stats.area}<span className="text-xs text-neutral-500 ml-1">cm²</span></div>
                    </div>
                    <div className="bg-black border border-neutral-800 p-4 rounded-xl">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                            <Monitor size={12} /> Aspect Ratio
                        </div>
                        <div className="text-xl font-mono text-white">{stats.arLabel}</div>
                    </div>
                </div>

            </div>
        )}
      </div>
    </div>
  );
};

export default PPICalculator;