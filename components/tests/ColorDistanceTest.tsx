import React, { useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, ChevronUp, RotateCcw, Palette, LayoutTemplate, BoxSelect, Type, Eye, EyeOff, Activity, Droplet, HelpCircle } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';
import { RelatedTools } from '../common/RelatedTools';

type BaseColor = 'gray' | 'red' | 'green' | 'blue' | 'cyan' | 'magenta' | 'yellow' | 'skin' | 'teal';
type ShapeMode = 'split' | 'inset' | 'text';
type DiffDirection = 'lighter' | 'darker';

const COLORS: Record<BaseColor, { r: number, g: number, b: number, label: string }> = {
  gray: { r: 128, g: 128, b: 128, label: 'Mid Gray' },
  red: { r: 128, g: 0, b: 0, label: 'Red' },
  green: { r: 0, g: 128, b: 0, label: 'Green' },
  blue: { r: 0, g: 0, b: 128, label: 'Blue' },
  cyan: { r: 0, g: 128, b: 128, label: 'Cyan' },
  magenta: { r: 128, g: 0, b: 128, label: 'Magenta' },
  yellow: { r: 128, g: 128, b: 0, label: 'Yellow' },
  teal: { r: 0, g: 128, b: 128, label: 'Teal' },
  skin: { r: 198, g: 134, b: 66, label: 'Skin Tone' },
};

const ColorDistanceTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // State
  const [difference, setDifference] = useState(10); // 0-50 scale
  const [baseColor, setBaseColor] = useState<BaseColor>('gray');
  const [shape, setShape] = useState<ShapeMode>('inset');
  const [direction, setDirection] = useState<DiffDirection>('lighter');
  const [isBlindMode, setIsBlindMode] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const startTest = () => {
    setIsActive(true);
    enterFullscreen();
  };

  const stopTest = () => {
    setIsActive(false);
    exitFullscreen();
  };

  const resetSettings = () => {
    setDifference(10);
    setBaseColor('gray');
    setShape('inset');
    setDirection('lighter');
    setIsBlindMode(false);
  };

  // Helper to calculate variant color
  const getColors = () => {
    const base = COLORS[baseColor];
    const sign = direction === 'lighter' ? 1 : -1;
    
    // Calculate new RGB values clamping between 0-255
    const r2 = Math.max(0, Math.min(255, base.r + (difference * sign)));
    const g2 = Math.max(0, Math.min(255, base.g + (difference * sign)));
    const b2 = Math.max(0, Math.min(255, base.b + (difference * sign)));

    return {
      c1: `rgb(${base.r}, ${base.g}, ${base.b})`,
      c2: `rgb(${r2}, ${g2}, ${b2})`,
      val1: [base.r, base.g, base.b],
      val2: [r2, g2, b2]
    };
  };

  if (isActive) {
    const { c1, c2, val1, val2 } = getColors();

    return (
      <div className="fixed inset-0 z-50 flex bg-black select-none">
        {/* Top-Left Exit */}
        <button 
          onClick={stopTest}
          className="absolute top-6 left-6 z-[60] flex items-center gap-2 bg-neutral-900/50 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg hover:bg-neutral-800 transition-colors border border-neutral-700 font-medium text-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Exit
        </button>

        {/* Main Content View */}
        <div className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden" style={{ backgroundColor: c1 }}>
           
           {/* Geometry: Split */}
           {shape === 'split' && (
             <div className="absolute top-0 right-0 w-1/2 h-full" style={{ backgroundColor: c2 }}>
                {/* Center Line for visual reference */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-black/10 mix-blend-overlay"></div>
             </div>
           )}

           {/* Geometry: Inset */}
           {shape === 'inset' && (
             <div className="w-[40vmin] h-[40vmin] rounded-full shadow-sm transition-all duration-200" style={{ backgroundColor: c2 }}></div>
           )}

           {/* Geometry: Text */}
           {shape === 'text' && (
             <div className="text-center transition-all duration-200" style={{ color: c2 }}>
                <h1 className="text-[15vw] font-bold leading-none tracking-tighter">HELLO</h1>
                <p className="text-[3vw] font-mono opacity-80 mt-4">Can you read this clearly?</p>
             </div>
           )}
           
           {/* Floating Info (Blind Mode logic) */}
           {!isSidebarOpen && (
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 text-white px-6 py-3 rounded-full backdrop-blur font-mono text-sm border border-white/10 flex items-center gap-4">
               {isBlindMode ? (
                 <span className="text-neutral-400 italic flex items-center gap-2"><EyeOff size={14}/> Value Hidden</span>
               ) : (
                 <>
                   <span className="font-bold">Diff: {difference}</span>
                   <span className="opacity-50 text-xs">|</span>
                   <span className="text-xs opacity-70">
                     RGB({val1.join(',')}) vs RGB({val2.join(',')})
                   </span>
                 </>
               )}
             </div>
           )}
        </div>

        {/* Right Sidebar */}
        <div 
          className={`absolute top-6 right-6 bottom-6 z-[60] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-auto'}`}
        >
           {!isSidebarOpen && (
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="bg-white text-black p-3 rounded-full shadow-xl hover:bg-neutral-100 transition-colors"
             >
               <ChevronLeft size={24} />
             </button>
           )}

           {isSidebarOpen && (
             <div className="flex-1 bg-white/95 backdrop-blur-xl text-neutral-900 rounded-xl shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right-10 duration-200 border border-white/20">
                <div className="p-5 border-b border-neutral-200/50 flex justify-between items-center sticky top-0 bg-white/50 backdrop-blur z-20">
                   <h3 className="font-bold text-sm tracking-wider text-neutral-800">COLOR DISTANCE</h3>
                   <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-800">
                     <ChevronUp size={20} className="rotate-90" />
                   </button>
                </div>

                <div className="p-5 space-y-8 flex-1">
                   {/* 1. Base Color */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                        <Palette size={12} /> Base Color
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                         {(Object.keys(COLORS) as BaseColor[]).map(c => (
                           <button
                             key={c}
                             onClick={() => setBaseColor(c)}
                             className={`
                               aspect-square rounded border shadow-sm transition-transform hover:scale-105
                               ${baseColor === c ? 'ring-2 ring-blue-500 ring-offset-1 z-10' : 'border-transparent'}
                             `}
                             style={{ backgroundColor: `rgb(${COLORS[c].r},${COLORS[c].g},${COLORS[c].b})` }}
                             title={COLORS[c].label}
                           />
                         ))}
                      </div>
                      <div className="text-center text-xs font-medium text-neutral-500">{COLORS[baseColor].label}</div>
                   </div>

                   {/* 2. Shape / Geometry */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Test Pattern</label>
                      <div className="flex rounded-md bg-neutral-100 p-1 border border-neutral-200">
                         <button onClick={() => setShape('split')} className={`flex-1 py-1.5 flex justify-center rounded-md transition-all ${shape === 'split' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-500'}`} title="Split Screen"><LayoutTemplate size={16} /></button>
                         <button onClick={() => setShape('inset')} className={`flex-1 py-1.5 flex justify-center rounded-md transition-all ${shape === 'inset' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-500'}`} title="Inset Shape"><BoxSelect size={16} /></button>
                         <button onClick={() => setShape('text')} className={`flex-1 py-1.5 flex justify-center rounded-md transition-all ${shape === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-500'}`} title="Typography"><Type size={16} /></button>
                      </div>
                   </div>

                   {/* 3. Slider Control */}
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Difference Level</label>
                        {!isBlindMode && (
                           <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{difference}</span>
                        )}
                      </div>
                      
                      <input 
                        type="range" 
                        min="0" 
                        max="50" 
                        value={difference} 
                        onChange={(e) => setDifference(parseInt(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                      
                      <div className="flex gap-2">
                        {/* Lighter/Darker Toggle */}
                        <div className="flex-1 flex rounded-md bg-neutral-100 p-1 border border-neutral-200">
                           <button onClick={() => setDirection('lighter')} className={`flex-1 py-1 text-[10px] font-bold rounded ${direction === 'lighter' ? 'bg-white shadow-sm text-black' : 'text-neutral-500'}`}>Lighter +</button>
                           <button onClick={() => setDirection('darker')} className={`flex-1 py-1 text-[10px] font-bold rounded ${direction === 'darker' ? 'bg-white shadow-sm text-black' : 'text-neutral-500'}`}>Darker -</button>
                        </div>
                      </div>

                      <button 
                         onClick={() => setIsBlindMode(!isBlindMode)}
                         className={`w-full py-2 flex items-center justify-center gap-2 text-xs font-bold rounded border transition-all ${isBlindMode ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
                      >
                         {isBlindMode ? <EyeOff size={14} /> : <Eye size={14} />}
                         {isBlindMode ? 'Blind Mode (Values Hidden)' : 'Blind Mode (Values Visible)'}
                      </button>
                   </div>

                   {!isBlindMode && (
                     <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 font-mono text-[10px] text-neutral-500 space-y-1">
                        <div className="flex justify-between"><span>Base RGB:</span> <span>{val1.join(', ')}</span></div>
                        <div className="flex justify-between"><span>Comp RGB:</span> <span>{val2.join(', ')}</span></div>
                     </div>
                   )}
                </div>

                <div className="p-5 border-t border-neutral-100 bg-neutral-50">
                  <button 
                    onClick={resetSettings}
                    className="w-full py-3 bg-neutral-900 hover:bg-black text-white rounded-lg font-bold shadow-lg shadow-neutral-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </div>
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Color Distance Test - Check Eye Sensitivity" 
        description="Test your color vision sensitivity. Can you distinguish subtle shade differences? Compare colors against gray, skin tones, and pastels."
        canonical="/tests/color-distance"
        keywords={['color distance test', 'color sensitivity test', 'delta e test', 'monitor color accuracy', 'eye test color', 'just noticeable difference']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Color Distance', path: '/tests/color-distance' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Color Sensitivity & Distance Test",
              "url": "https://deadpixeltest.cc/tests/color-distance",
              "description": "Interactive tool to test human eye sensitivity to subtle color differences (Delta E) and monitor color reproduction.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [{
                "@type": "Question",
                "name": "What is Delta E?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Delta E is a metric for understanding how the human eye perceives color difference. A Delta E of less than 2 is generally considered imperceptible to the standard observer."
                }
              }, {
                "@type": "Question",
                "name": "What is JND (Just Noticeable Difference)?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "JND represents the smallest difference in sensory input that is detectable by a human. In this test, it's the minimum RGB step where you can still distinguish the shape from the background."
                }
              }]
            }
          ]
        }}
      />
      <div className="flex flex-col min-h-screen">
        <TestIntro
          title="Color Distance Test"
          description="Test your eyes and your monitor's ability to distinguish subtle shade differences. Use the 'Inset' and 'Text' modes to simulate real-world UI scenarios."
          onStart={startTest}
        >
          <InfoCard title="The 'Inset' Advantage">
            <p>
              The human eye is much better at detecting contrast when one color is surrounded by another. Use the <strong>Inset Mode</strong> to detect subtle differences that are invisible in Split mode.
            </p>
          </InfoCard>
          <InfoCard title="Lighter vs. Darker">
            <p>
              Some monitors crush blacks (can't see dark gray on black) but handle whites fine. Switch between <strong>Lighter</strong> and <strong>Darker</strong> modes to test both ends of the spectrum.
            </p>
          </InfoCard>
        </TestIntro>

        {/* Deep SEO Content */}
        <section className="max-w-4xl mx-auto px-6 py-16 space-y-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           
           <article className="prose prose-invert max-w-none">
              <div className="grid md:grid-cols-2 gap-12">
                 <div>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                       <Activity className="text-blue-500" /> What is Delta E?
                    </h2>
                    <p className="text-neutral-400 leading-relaxed mb-4">
                       <strong>Delta E (dE)</strong> is the standard metric used to quantify the difference between two colors.
                    </p>
                    <ul className="text-neutral-400 text-sm space-y-2 list-disc pl-4">
                        <li><strong>dE &lt; 1.0:</strong> Not perceptible by human eyes. Considered "perfect" calibration.</li>
                        <li><strong>dE 1.0 - 2.0:</strong> Perceptible only through close observation.</li>
                        <li><strong>dE 2.0 - 10.0:</strong> Perceptible at a glance.</li>
                    </ul>
                 </div>
                 
                 <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <Eye className="text-yellow-500" /> Human Vision Limits
                    </h3>
                    <p className="text-sm text-neutral-400 mb-4">
                       Most people can distinguish a difference of about 1-2 RGB steps on a decent monitor.
                    </p>
                    <div className="flex gap-4 p-4 bg-black/40 rounded-lg border border-white/5">
                        <Droplet className="text-neutral-500 shrink-0" />
                        <div className="text-xs text-neutral-400">
                           <strong>Age Factor:</strong> The lens of the human eye yellows with age, reducing sensitivity to blue light differences. Use the "Blind Mode" to test your friends without bias!
                        </div>
                    </div>
                 </div>
              </div>

              <hr className="my-12 border-white/10" />

              <h2 className="text-2xl font-bold text-white mb-6">Monitor Calibration Importance</h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                 If you cannot distinguish steps below "5" on this test, your monitor might be set up incorrectly.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-neutral-900/30 p-6 rounded-lg border border-white/5">
                    <h4 className="font-bold text-white mb-2">Contrast too High?</h4>
                    <p className="text-sm text-neutral-400">
                       If you can't distinguish light colors (250 vs 255), your Contrast setting is clipping highlights.
                    </p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-lg border border-blue-500/20">
                    <h4 className="font-bold text-white mb-2">Gamma incorrect?</h4>
                    <p className="text-sm text-neutral-400">
                       If mid-tones (like the Skin Tone test) look identical despite large numerical differences, check your Gamma.
                    </p>
                 </div>
              </div>
           </article>

           {/* FAQ Section Visual - Matches Schema */}
           <div className="border-t border-white/10 pt-12">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                 <HelpCircle className="text-blue-400" /> Frequently Asked Questions
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">What is Delta E?</h4>
                    <p className="text-neutral-400 text-sm">Delta E is a metric for understanding how the human eye perceives color difference. A Delta E of less than 2 is generally considered imperceptible to the standard observer.</p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">What is JND (Just Noticeable Difference)?</h4>
                    <p className="text-neutral-400 text-sm">JND represents the smallest difference in sensory input that is detectable by a human. In this test, it's the minimum RGB step where you can still distinguish the shape from the background.</p>
                 </div>
              </div>
           </div>

        </section>

        <div className="max-w-7xl mx-auto px-6 w-full">
           <RelatedTools currentPath="/tests/color-distance" />
        </div>
      </div>
    </>
  );
};

export default ColorDistanceTest;