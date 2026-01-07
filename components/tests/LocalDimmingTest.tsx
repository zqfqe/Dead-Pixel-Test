import React, { useState, useEffect, useRef } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { 
  ChevronLeft, 
  ChevronUp, 
  Box, 
  Stars, 
  MousePointer2, 
  Type, 
  Circle, 
  MoveHorizontal, 
  MoveVertical,
  Play
} from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';

type TestShape = 'box' | 'circle' | 'text' | 'v-bar' | 'h-bar';
type ControlMode = 'auto' | 'manual';

const LocalDimmingTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // Settings
  const [objectSize, setObjectSize] = useState(100);
  const [speed, setSpeed] = useState(4);
  const [showStars, setShowStars] = useState(true);
  const [shape, setShape] = useState<TestShape>('box');
  const [controlMode, setControlMode] = useState<ControlMode>('auto');
  const [colorHex, setColorHex] = useState('#FFFFFF');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mouse tracking refs to avoid re-renders
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const startTest = () => {
    setIsActive(true);
    enterFullscreen();
  };

  const stopTest = () => {
    setIsActive(false);
    exitFullscreen();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (controlMode === 'manual') {
      mousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    
    // Starfield Data (Static per session)
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.5,
      opacity: Math.random() * 0.5 + 0.1
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      // 1. Clear Background (Deep Black)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Stars (Low brightness to test dimming zones sensitivity)
      if (showStars && shape !== 'v-bar' && shape !== 'h-bar') {
        stars.forEach(star => {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 3. Calculate Position
      let x = 0;
      let y = 0;

      if (controlMode === 'manual') {
        x = mousePos.current.x;
        y = mousePos.current.y;
      } else {
        // Auto Path logic
        const w = canvas.width;
        const h = canvas.height;
        
        if (shape === 'v-bar') {
           // Sweep horizontal
           const sweepWidth = w + objectSize;
           const progress = (angle * 100) % sweepWidth; 
           x = progress - objectSize/2;
           y = h/2;
        } else if (shape === 'h-bar') {
           // Sweep vertical
           const sweepHeight = h + objectSize;
           const progress = (angle * 100) % sweepHeight;
           x = w/2;
           y = progress - objectSize/2;
        } else {
           // Figure 8
           const scaleX = w * 0.4;
           const scaleY = h * 0.4;
           x = w/2 + Math.sin(angle) * scaleX;
           y = h/2 + Math.sin(angle * 2) * scaleY;
        }
      }

      // 4. Draw Object
      ctx.fillStyle = colorHex;
      ctx.shadowColor = colorHex;
      // We do NOT add shadowBlur here intentionally. 
      // We want to test the MONITOR'S bloom, not render software bloom.

      ctx.beginPath();
      
      switch (shape) {
        case 'circle':
          ctx.arc(x, y, objectSize / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'text':
          ctx.font = `bold ${objectSize}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText("HDR SUBTITLE", x, y);
          break;
        case 'v-bar':
          // Vertical bar moving horizontally
          ctx.fillRect(x - 2, 0, 4, canvas.height); // Thin line for precise zone counting
          break;
        case 'h-bar':
          // Horizontal bar moving vertically
          ctx.fillRect(0, y - 2, canvas.width, 4);
          break;
        case 'box':
        default:
          ctx.fillRect(x - objectSize/2, y - objectSize/2, objectSize, objectSize);
          break;
      }

      // Update State
      angle += 0.005 * (speed / 2);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, objectSize, speed, showStars, shape, controlMode, colorHex]);

  if (isActive) {
    return (
      <div 
        className={`fixed inset-0 z-50 bg-black ${controlMode === 'manual' ? 'cursor-none' : ''}`}
        onMouseMove={handleMouseMove}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* Top-Left Exit (Hover to show) */}
        <div className="absolute top-0 left-0 p-6 opacity-0 hover:opacity-100 transition-opacity duration-300 z-[70]">
          <button 
            onClick={stopTest}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg shadow-lg border border-neutral-700 font-medium text-sm cursor-auto"
          >
            <ChevronLeft size={16} />
            Exit Test
          </button>
        </div>

        {/* Right Sidebar */}
        <div className={`absolute top-6 right-6 bottom-6 z-[60] flex flex-col transition-all duration-300 cursor-auto ${isSidebarOpen ? 'w-80' : 'w-auto'}`}>
           {!isSidebarOpen && (
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="bg-white text-black p-3 rounded-full shadow-xl hover:bg-neutral-100 transition-colors opacity-30 hover:opacity-100"
             >
               <ChevronLeft size={24} />
             </button>
           )}

           {isSidebarOpen && (
             <div className="flex-1 bg-white text-neutral-900 rounded-xl shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right-10 duration-200">
                <div className="p-5 border-b border-neutral-100 flex justify-between items-center sticky top-0 bg-white z-20">
                   <h3 className="font-bold text-sm tracking-wider text-neutral-800">DIMMING TEST</h3>
                   <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-800">
                     <ChevronUp size={20} className="rotate-90" />
                   </button>
                </div>

                <div className="p-5 space-y-6 flex-1">
                   {/* Control Mode */}
                   <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200">
                      <button 
                        onClick={() => setControlMode('auto')}
                        className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${controlMode === 'auto' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-500'}`}
                      >
                        <Play size={14} /> Auto
                      </button>
                      <button 
                        onClick={() => setControlMode('manual')}
                        className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${controlMode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-500'}`}
                      >
                        <MousePointer2 size={14} /> Manual
                      </button>
                   </div>

                   {/* Shapes */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Test Object</label>
                      <div className="grid grid-cols-3 gap-2">
                         <button onClick={() => setShape('box')} className={`p-2 border rounded flex flex-col items-center gap-1 ${shape === 'box' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-neutral-50'}`}>
                            <Box size={20} /> <span className="text-[10px]">Box</span>
                         </button>
                         <button onClick={() => setShape('circle')} className={`p-2 border rounded flex flex-col items-center gap-1 ${shape === 'circle' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-neutral-50'}`}>
                            <Circle size={20} /> <span className="text-[10px]">Circle</span>
                         </button>
                         <button onClick={() => setShape('text')} className={`p-2 border rounded flex flex-col items-center gap-1 ${shape === 'text' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-neutral-50'}`}>
                            <Type size={20} /> <span className="text-[10px]">Text</span>
                         </button>
                      </div>
                      
                      {/* Zone Sweeps */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                         <button onClick={() => { setShape('v-bar'); setControlMode('auto'); }} className={`p-2 border rounded flex items-center justify-center gap-2 ${shape === 'v-bar' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-neutral-50'}`}>
                            <MoveHorizontal size={16} /> <span className="text-[10px]">H-Sweep</span>
                         </button>
                         <button onClick={() => { setShape('h-bar'); setControlMode('auto'); }} className={`p-2 border rounded flex items-center justify-center gap-2 ${shape === 'h-bar' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-neutral-50'}`}>
                            <MoveVertical size={16} /> <span className="text-[10px]">V-Sweep</span>
                         </button>
                      </div>
                      { (shape === 'v-bar' || shape === 'h-bar') && (
                        <p className="text-[10px] text-neutral-500 leading-tight">
                          Use sweeps to count dimming zones. Watch for the backlight turning on/off as the line moves.
                        </p>
                      )}
                   </div>

                   {/* Size & Speed */}
                   {shape !== 'v-bar' && shape !== 'h-bar' && (
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <div className="flex justify-between items-end">
                              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Size</label>
                              <span className="text-xs font-mono">{objectSize}px</span>
                           </div>
                           <input 
                              type="range" min="20" max="400" step="10"
                              value={objectSize} onChange={(e) => setObjectSize(Number(e.target.value))}
                              className="w-full accent-blue-600 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                           />
                        </div>
                     </div>
                   )}
                   
                   {controlMode === 'auto' && (
                      <div className="space-y-2">
                         <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Speed</label>
                            <span className="text-xs font-mono">{speed}</span>
                         </div>
                         <input 
                            type="range" min="1" max="20" step="1"
                            value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                            className="w-full accent-blue-600 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                         />
                      </div>
                   )}

                   {/* Toggles */}
                   <div className="pt-4 border-t border-neutral-100 space-y-3">
                      <button 
                        onClick={() => setShowStars(!showStars)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${showStars ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'}`}
                      >
                          <div className="flex items-center gap-2">
                            <Stars size={16} />
                            <span className="text-sm font-medium">Starfield Background</span>
                          </div>
                      </button>

                      {/* Color Picker Simple */}
                      <div className="flex gap-2 justify-between items-center bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                         <span className="text-xs font-bold text-neutral-400 uppercase ml-1">Color</span>
                         <div className="flex gap-1">
                            {['#FFFFFF', '#FF0000', '#00FF00', '#0000FF'].map(c => (
                              <button
                                key={c}
                                onClick={() => setColorHex(c)}
                                className={`w-6 h-6 rounded-full border border-neutral-300 shadow-sm ${colorHex === c ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                         </div>
                      </div>
                   </div>
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
        title="Local Dimming Test - Bloom & Zone Check" 
        description="Test your Mini-LED or FALD monitor for blooming (halo effect) and zone transition speed. Essential for checking HDR performance."
        canonical="/tests/local-dimming"
        keywords={['local dimming test', 'fald test', 'mini-led bloom test', 'monitor halo test', 'hdr test pattern', 'dimming zones check']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Local Dimming', path: '/tests/local-dimming' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Monitor Local Dimming Test",
              "url": "https://deadpixeltest.cc/tests/local-dimming",
              "description": "Test FALD and Mini-LED monitors for blooming, halo effects, and zone transition latency.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [{
                "@type": "Question",
                "name": "What is Blooming / Halo Effect?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Blooming creates a glow or halo around bright objects on dark backgrounds. It occurs when a backlight dimming zone is larger than the bright object it's illuminating, causing light to spill into adjacent dark areas."
                }
              }, {
                "@type": "Question",
                "name": "How to check for Local Dimming Zones?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Use the 'Starfield' pattern or the 'Box' tool. Move a small white box across a black screen. If you see blocky squares lighting up behind the box as it moves, those are your dimming zones activating."
                }
              }]
            }
          ]
        }}
      />
      <TestIntro
        title="Local Dimming / Blooming"
        description="Evaluate your Mini-LED or FALD monitor's zone transitions. Use the mouse to drag the test object into corners to check for edge blooming."
        onStart={startTest}
      >
        <InfoCard title="Manual Testing">
          <p>
            Switch to <strong>Manual Mode</strong> to drag the white box into the black bars of a movie aspect ratio (top/bottom) to see if the backlight bleeds into the black bars.
          </p>
        </InfoCard>
        <InfoCard title="Zone Counting">
          <p>
            Use the <strong>Sweep</strong> tools. As the line moves across the screen, a poor local dimming algorithm will show visible 'steps' or blocks lighting up ahead of the line.
          </p>
        </InfoCard>
      </TestIntro>
    </>
  );
};

export default LocalDimmingTest;