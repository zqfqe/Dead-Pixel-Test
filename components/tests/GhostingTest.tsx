import React, { useRef, useEffect, useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, ChevronUp, RotateCcw, Activity, Layers, ArrowRight, ArrowDown, Type, Rocket, FastForward, Eye, Settings, Zap, Camera, HelpCircle, Monitor } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';
import { RelatedTools } from '../common/RelatedTools';
import { RelatedArticles } from '../common/RelatedArticles';

type Direction = 'horizontal' | 'vertical';
type Pattern = 'ufo' | 'text' | 'blocks';
type Preset = 'default' | 'black-smear' | 'overshoot';

const GhostingTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // State
  const [speed, setSpeed] = useState(960); // px per second
  const [fps, setFps] = useState(0);
  const [direction, setDirection] = useState<Direction>('horizontal');
  const [pattern, setPattern] = useState<Pattern>('ufo');
  const [preset, setPreset] = useState<Preset>('default');
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
    setSpeed(960);
    setDirection('horizontal');
    setPattern('ufo');
    setPreset('default');
  };

  // Preset Configurations
  const getTheme = () => {
    switch (preset) {
      case 'black-smear':
        return { bg: '#000000', lanes: ['#101010', '#1a1a1a', '#202020'], obj: '#404040' };
      case 'overshoot':
        return { bg: '#808080', lanes: ['#808080', '#808080', '#808080'], obj: '#404040' }; // Classic gray-to-gray
      case 'default':
      default:
        return { bg: '#202020', lanes: ['#00FFFF', '#FF00FF', '#101010'], obj: 'white' }; // Cyan/Magenta/Dark
    }
  };

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for speed
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsTime = lastTime;
    let pos = 0; // Generic position (x or y)

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Drawing Helpers
    const drawUFO = (x: number, y: number, color: string) => {
      // Body
      ctx.fillStyle = color === 'white' ? '#e0e0e0' : color;
      ctx.beginPath();
      ctx.ellipse(x, y, 40, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Dome
      ctx.fillStyle = '#606060';
      ctx.beginPath();
      ctx.arc(x, y - 8, 14, Math.PI, 0);
      ctx.fill();
      
      // Lights
      ctx.fillStyle = '#ffff00';
      [ -20, 0, 20 ].forEach(offset => {
         ctx.beginPath();
         ctx.arc(x + offset, y + 4, 3, 0, Math.PI * 2);
         ctx.fill();
      });
    };

    const drawText = (x: number, y: number, color: string) => {
      ctx.fillStyle = color === 'white' ? '#ffffff' : color;
      ctx.font = 'bold 24px monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText("Response Time Test 123 Go!", x, y);
    };

    const drawBlock = (x: number, y: number, color: string) => {
      ctx.fillStyle = color === 'white' ? '#e0e0e0' : color;
      ctx.fillRect(x - 30, y - 30, 60, 60);
      // Sync lines for pursuit camera
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 1, y - 50, 2, 10); // Top tick
      ctx.fillRect(x - 1, y + 40, 2, 10); // Bottom tick
    };

    const render = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      // FPS Calculation
      frameCount++;
      if (time - lastFpsTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (time - lastFpsTime)));
        frameCount = 0;
        lastFpsTime = time;
      }

      const theme = getTheme();
      const w = canvas.width;
      const h = canvas.height;
      const isVert = direction === 'vertical';
      const limit = isVert ? h : w;

      // 1. Clear & Background
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, w, h);

      // 2. Update Position
      pos += speed * deltaTime;
      if (pos > limit + 150) pos = -150;

      // 3. Draw Lanes (3 Lanes)
      const laneCount = 3;
      
      for (let i = 0; i < laneCount; i++) {
         const laneColor = theme.lanes[i];
         const objectColor = (preset === 'default' && i === 0) ? 'red' : (preset === 'default' && i === 1) ? 'green' : theme.obj;
         
         if (isVert) {
            // Vertical Columns
            const colW = w / laneCount;
            const cx = i * colW + colW / 2;
            
            // Draw background strip if default mode
            if (preset === 'default') {
               ctx.fillStyle = laneColor;
               ctx.fillRect(i * colW, 0, colW, h);
            }

            // Draw Object
            if (pattern === 'ufo') drawUFO(cx, pos, objectColor);
            else if (pattern === 'text') drawText(cx, pos, objectColor);
            else drawBlock(cx, pos, objectColor);

         } else {
            // Horizontal Rows
            const rowH = h / laneCount;
            const cy = i * rowH + rowH / 2;

             // Draw background strip if default mode
            if (preset === 'default') {
               ctx.fillStyle = laneColor;
               ctx.fillRect(0, i * rowH, w, rowH);
            }

            // Draw Object
            if (pattern === 'ufo') drawUFO(pos, cy, objectColor);
            else if (pattern === 'text') drawText(pos, cy, objectColor);
            else drawBlock(pos, cy, objectColor);
         }
      }

      // 4. Draw Static Grid Lines (for reference)
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      const gridStep = 200;
      
      if (isVert) {
         for(let y = 0; y < h; y += gridStep) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
         }
      } else {
         for(let x = 0; x < w; x += gridStep) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
         }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, speed, direction, pattern, preset]);

  // Render Fullscreen Tool
  if (isActive) {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-900 overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        {/* Top-Left Exit */}
        <button 
          onClick={stopTest}
          className="absolute top-6 left-6 z-[60] flex items-center gap-2 bg-neutral-900/80 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg hover:bg-neutral-800 transition-colors border border-neutral-700 font-medium text-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Exit
        </button>

        {/* FPS Counter */}
        <div className="absolute top-6 left-36 bg-black/50 backdrop-blur text-green-400 px-3 py-2 rounded border border-green-900 font-mono text-sm flex items-center gap-2 z-[60]">
           <Activity size={14} />
           {fps} FPS
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
             <div className="flex-1 bg-white text-neutral-900 rounded-xl shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right-10 duration-200">
                <div className="p-5 border-b border-neutral-100 flex justify-between items-center sticky top-0 bg-white z-20">
                   {/* SEO OPTIMIZATION: Changed h3 to div to not interfere with document outline */}
                   <div className="font-bold text-sm tracking-wider text-neutral-800">MOTION TEST</div>
                   <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-800">
                     <ChevronUp size={20} className="rotate-90" />
                   </button>
                </div>

                <div className="p-5 space-y-8 flex-1">
                   {/* Speed Control */}
                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Scroll Speed</label>
                        <span className="text-xs font-mono font-bold">{speed} px/s</span>
                      </div>
                      <input 
                        type="range" 
                        min="240" 
                        max="2880" 
                        step="120"
                        value={speed}
                        onChange={(e) => setSpeed(parseInt(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between gap-2 mt-2">
                          {[480, 960, 1440, 1920].map(s => (
                             <button 
                                key={s} 
                                onClick={() => setSpeed(s)} 
                                className={`flex-1 text-[10px] py-1.5 border rounded transition-colors ${speed === s ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'}`}
                             >
                               {s}
                             </button>
                          ))}
                      </div>
                   </div>

                   {/* Direction */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Direction</label>
                      <div className="flex rounded-md bg-neutral-100 p-1 border border-neutral-200">
                         <button onClick={() => setDirection('horizontal')} className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 ${direction === 'horizontal' ? 'bg-white shadow-sm text-black' : 'text-neutral-500'}`}>
                           <ArrowRight size={14} /> Horizontal
                         </button>
                         <button onClick={() => setDirection('vertical')} className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 ${direction === 'vertical' ? 'bg-white shadow-sm text-black' : 'text-neutral-500'}`}>
                           <ArrowDown size={14} /> Vertical
                         </button>
                      </div>
                      {direction === 'vertical' && (
                        <p className="text-[10px] text-orange-600 bg-orange-50 p-2 rounded border border-orange-100 leading-tight">
                          VA panels often show severe purple/black smearing in vertical scrolling.
                        </p>
                      )}
                   </div>

                   {/* Presets (The most important part) */}
                   <div className="space-y-3 pt-2 border-t border-neutral-100">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Test Scenario</label>
                      <div className="flex flex-col gap-2">
                         <button 
                           onClick={() => setPreset('default')}
                           className={`p-3 rounded-lg border flex flex-col items-start gap-1 transition-all ${preset === 'default' ? 'bg-blue-50 border-blue-300' : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'}`}
                         >
                           <span className={`text-sm font-bold ${preset === 'default' ? 'text-blue-700' : 'text-neutral-700'}`}>Standard (UFO)</span>
                           <span className="text-[10px] text-neutral-500">Cyan/Magenta backgrounds. Best for general response time check.</span>
                         </button>
                         
                         <button 
                           onClick={() => setPreset('black-smear')}
                           className={`p-3 rounded-lg border flex flex-col items-start gap-1 transition-all ${preset === 'black-smear' ? 'bg-blue-50 border-blue-300' : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'}`}
                         >
                           <span className={`text-sm font-bold ${preset === 'black-smear' ? 'text-blue-700' : 'text-neutral-700'}`}>Dark Mode (Black Smear)</span>
                           <span className="text-[10px] text-neutral-500">Dark grays on pure black. Reveals VA panel smearing and OLED true black handling.</span>
                         </button>

                         <button 
                           onClick={() => setPreset('overshoot')}
                           className={`p-3 rounded-lg border flex flex-col items-start gap-1 transition-all ${preset === 'overshoot' ? 'bg-blue-50 border-blue-300' : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'}`}
                         >
                           <span className={`text-sm font-bold ${preset === 'overshoot' ? 'text-blue-700' : 'text-neutral-700'}`}>Light Mode (Overshoot)</span>
                           <span className="text-[10px] text-neutral-500">Medium gray transitions. Reveals inverse ghosting (bright coronas) from high overdrive.</span>
                         </button>
                      </div>
                   </div>

                   {/* Pattern Type */}
                   <div className="space-y-3 pt-2 border-t border-neutral-100">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Object Type</label>
                      <div className="flex rounded-md bg-neutral-100 p-1 border border-neutral-200">
                         <button onClick={() => setPattern('ufo')} className={`flex-1 py-1.5 text-[10px] font-bold rounded flex items-center justify-center gap-1 ${pattern === 'ufo' ? 'bg-white shadow-sm text-black' : 'text-neutral-500'}`}><Rocket size={12}/> UFO</button>
                         <button onClick={() => setPattern('text')} className={`flex-1 py-1.5 text-[10px] font-bold rounded flex items-center justify-center gap-1 ${pattern === 'text' ? 'bg-white shadow-sm text-black' : 'text-neutral-500'}`}><Type size={12}/> Text</button>
                         <button onClick={() => setPattern('blocks')} className={`flex-1 py-1.5 text-[10px] font-bold rounded flex items-center justify-center gap-1 ${pattern === 'blocks' ? 'bg-white shadow-sm text-black' : 'text-neutral-500'}`}><Layers size={12}/> Chart</button>
                      </div>
                   </div>

                </div>

                <div className="p-5 border-t border-neutral-100 bg-neutral-50">
                  <button 
                    onClick={resetSettings}
                    className="w-full py-3 bg-neutral-900 hover:bg-black text-white rounded-lg font-bold shadow-lg shadow-neutral-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} />
                    Reset
                  </button>
                </div>
             </div>
           )}
        </div>
      </div>
    );
  }

  // Main Page View with SEO
  return (
    <>
      <SEO 
        title="UFO Ghosting Test - Monitor Response Time"
        description="Check your monitor for motion blur, ghosting, black smearing, and inverse ghosting (overshoot). Essential for 144Hz, 240Hz, and competitive gaming."
        canonical="/tests/response-time"
        keywords={['ghosting test', 'ufo test', 'monitor response time', 'motion blur test', 'black smear test', '144hz test']}
        type="WebApplication"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Response Time', path: '/tests/response-time' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Monitor Ghosting Test",
              "url": "https://deadpixeltest.cc/tests/response-time",
              "description": "Visualize pixel transitions and motion blur. Test for ghosting, black smearing, and inverse ghosting.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [{
                "@type": "Question",
                "name": "What is Ghosting vs Inverse Ghosting?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Ghosting is a trail behind moving objects caused by slow pixel transitions. Inverse Ghosting (Overshoot) is a bright 'halo' or 'corona' caused by the monitor's Overdrive setting being too high."
                }
              }, {
                "@type": "Question",
                "name": "How to fix Black Smearing?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Black smearing is common on VA panels. Try increasing the 'Black Stabilizer' or 'Dark Boost' setting in your monitor menu to lift dark shades, making them easier to transition."
                }
              }, {
                "@type": "Question",
                "name": "What does Response Time (GtG) mean?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "GtG (Gray-to-Gray) measures how long it takes a pixel to change from one shade of gray to another. Lower is better (e.g. 1ms). High response times (&gt;5ms) cause visible blur."
                }
              }]
            },
            {
              "@type": "HowTo",
              "name": "How to Check for Monitor Ghosting",
              "step": [
                { "@type": "HowToStep", "text": "Set your monitor to its maximum refresh rate (e.g., 144Hz)." },
                { "@type": "HowToStep", "text": "Start the UFO test and track the moving alien with your eyes." },
                { "@type": "HowToStep", "text": "Look for a trail. A faint blurred trail is normal ghosting. A bright white trail is inverse ghosting (overshoot)." },
                { "@type": "HowToStep", "text": "Adjust your monitor's 'Overdrive' or 'Response Time' setting until the trail is minimal without causing bright halos." }
              ]
            }
          ]
        }}
      />
      <div className="flex flex-col min-h-screen">
        <TestIntro
          title="Response Time (Ghosting)"
          description="Visualize pixel transitions and motion blur. Test for ghosting, black smearing (common on VA panels), and inverse ghosting (overshoot). Supports vertical scrolling for checking webpage clarity."
          onStart={startTest}
        >
          <InfoCard title="Black Smear">
            <p>
              Select the <strong>Dark Mode</strong> preset and <strong>Vertical</strong> direction. If you see purple or brown trails behind the dark gray squares, your monitor (likely a VA panel) struggles with dark color transitions.
            </p>
          </InfoCard>
          <InfoCard title="Overshoot (Coronas)">
            <p>
              Select the <strong>Light Mode</strong>. If you see a bright white halo trailing behind the moving object, your monitor's Overdrive setting is too high. Lower it in your monitor's OSD menu.
            </p>
          </InfoCard>
        </TestIntro>

        <section className="max-w-5xl mx-auto px-6 py-16 space-y-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
           
           <article className="prose prose-invert max-w-none">
              <div className="grid md:grid-cols-2 gap-12">
                 <div>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                       <FastForward className="text-blue-500" /> What is Response Time?
                    </h2>
                    <p className="text-neutral-400 leading-relaxed mb-4">
                       Response time measures how quickly a pixel can change from one color to another, typically measured in milliseconds (ms). The industry standard is <strong>GtG (Gray-to-Gray)</strong>. 
                    </p>
                    <p className="text-neutral-400 leading-relaxed">
                       If pixels change too slowly, the previous image lingers while the new one is drawn, creating a visual "trail" or blur behind moving objects. This is called <strong>Ghosting</strong>.
                    </p>
                 </div>
                 
                 <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <Eye className="text-yellow-500" /> Pursuit Camera Tracking
                    </h3>
                    <p className="text-sm text-neutral-400 mb-4">
                       Stationary photos of this test are misleading because your eyes naturally track moving objects.
                    </p>
                    <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                        <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><Camera size={14}/> How to Photograph</h4>
                        <p className="text-xs text-neutral-500">
                           To capture what your eyes actually see, you must move your camera sideways at the exact same speed as the UFO (a "Pursuit Camera" shot). This simulates eye tracking and reveals the true motion blur performance of your monitor.
                        </p>
                    </div>
                 </div>
              </div>

              <hr className="my-12 border-white/10" />

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                 <Settings className="text-purple-500" /> Troubleshooting: Overdrive & Overshoot
              </h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                 Most gaming monitors have a setting called "Overdrive", "Response Time", or "Trace Free". This increases the voltage sent to pixels to make them change colors faster.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                 <div className="bg-neutral-900/30 p-6 rounded-lg border border-white/5">
                    <div className="h-2 w-12 bg-red-500 rounded mb-4"></div>
                    <h4 className="font-bold text-white mb-2">Weak Overdrive</h4>
                    <p className="text-sm text-neutral-400">
                       <strong>Symptom:</strong> Long, blurry trails behind objects.
                       <br/><strong>Fix:</strong> Increase the Overdrive setting in your monitor menu.
                    </p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-lg border border-green-500/20">
                    <div className="h-2 w-12 bg-green-500 rounded mb-4"></div>
                    <h4 className="font-bold text-white mb-2">Balanced</h4>
                    <p className="text-sm text-neutral-400">
                       <strong>Symptom:</strong> Short, faint trail. Image looks sharp in motion.
                       <br/><strong>Fix:</strong> This is the ideal setting. Keep it here.
                    </p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-lg border border-white/5">
                    <div className="h-2 w-12 bg-blue-500 rounded mb-4"></div>
                    <h4 className="font-bold text-white mb-2">Strong Overdrive</h4>
                    <p className="text-sm text-neutral-400">
                       <strong>Symptom:</strong> "Inverse Ghosting" or <strong>Overshoot</strong>. You see a bright white halo or "corona" around moving objects.
                       <br/><strong>Fix:</strong> Lower the Overdrive setting.
                    </p>
                 </div>
              </div>

              <h3 className="text-xl font-bold text-white mt-12 mb-4 flex items-center gap-2"><Monitor size={24} /> Black Smearing (VA Panels)</h3>
              <p className="text-neutral-400 leading-relaxed">
                 VA (Vertical Alignment) panels are known for high contrast ratios (deep blacks). However, pixels take much longer to transition from <strong>Black to Gray</strong> than from White to Gray. This causes dark objects moving on dark backgrounds to leave a long purple or brown smear. Use the <strong>"Dark Mode"</strong> preset in this tool to test for it.
              </p>

              {/* Long-tail: High Refresh Rate */}
              <h3 className="text-xl font-bold text-white mt-12 mb-4 flex items-center gap-2"><Zap size={24} /> 144Hz vs 240Hz Ghosting</h3>
              <p className="text-neutral-400 leading-relaxed">
                 At higher refresh rates (144Hz, 240Hz, 360Hz), the frame time is shorter (6.9ms at 144Hz vs 4.1ms at 240Hz). This means pixels have <em>less time</em> to change color before the next frame. Ghosting that is invisible at 60Hz can become obvious at 144Hz if the pixel response time cannot keep up with the refresh rate.
              </p>
           </article>

           {/* FAQ Section Visual - Matches Schema */}
           <div className="border-t border-white/10 pt-12">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                 <HelpCircle className="text-blue-400" /> Frequently Asked Questions
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">What is Ghosting vs Inverse Ghosting?</h4>
                    <p className="text-neutral-400 text-sm">Ghosting is a trail behind moving objects caused by slow pixel transitions. Inverse Ghosting (Overshoot) is a bright "halo" or "corona" caused by the monitor's Overdrive setting being too high.</p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">How to fix Black Smearing?</h4>
                    <p className="text-neutral-400 text-sm">Black smearing is common on VA panels. Try increasing the "Black Stabilizer" or "Dark Boost" setting in your monitor menu to lift dark shades, making them easier to transition.</p>
                 </div>
                 <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                    <h4 className="font-bold text-white text-base mb-2">What does Response Time (GtG) mean?</h4>
                    <p className="text-neutral-400 text-sm">GtG (Gray-to-Gray) measures how long it takes a pixel to change from one shade of gray to another. Lower is better (e.g. 1ms). High response times (&gt;5ms) cause visible blur.</p>
                 </div>
              </div>
           </div>

           {/* Internal Linking */}
           <RelatedArticles currentPath="/tests/response-time" />
        </section>

        <div className="max-w-7xl mx-auto px-6 w-full">
           <RelatedTools currentPath="/tests/response-time" />
        </div>
      </div>
    </>
  );
};

export default GhostingTest;