import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Play,
} from 'lucide-react';
import { useIdleCursor } from '../../hooks/useIdleCursor';

type TestShape = 'box' | 'circle' | 'text' | 'v-bar' | 'h-bar';
type ControlMode = 'auto' | 'manual';

const LocalDimmingTest: React.FC<{embedded?: boolean}> = ({embedded = false}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  const isIdle = useIdleCursor(3000);
  
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

  const stopTest = useCallback(() => {
    setIsActive(false);
    void exitFullscreen();
  }, [exitFullscreen]);

  useEffect(() => {
    if (!isActive) return;
    const onHidden = () => {
      if (document.hidden) stopTest();
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) stopTest();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        stopTest();
      }
    };
    document.addEventListener('visibilitychange', onHidden);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('keydown', onKey);
    };
  }, [isActive, stopTest]);

  const moveTestObject = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (controlMode !== 'manual') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    mousePos.current = {
      x: Math.max(0, Math.min(bounds.width, event.clientX - bounds.left)),
      y: Math.max(0, Math.min(bounds.height, event.clientY - bounds.top))
    };
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
    // UI visibility Logic
    const uiHidden = isIdle && !isSidebarOpen;

    return (
      <div 
        className={`fixed inset-0 z-[100] bg-black ${controlMode === 'manual' && uiHidden ? 'cursor-none' : ''}`}
      >
        <canvas ref={canvasRef} className="block w-full h-full"
          style={{ touchAction: controlMode === 'manual' ? 'none' : undefined }}
          onPointerDown={event => {
            if (controlMode === 'manual') event.currentTarget.setPointerCapture(event.pointerId);
            moveTestObject(event);
          }}
          onPointerMove={moveTestObject} />

        {/* Top-Left Exit */}
        <div className="absolute top-3 left-3 z-[70] sm:top-6 sm:left-6">
          <button 
            onClick={stopTest}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg shadow-lg border border-neutral-700 font-medium text-sm cursor-auto"
          >
            <ChevronLeft size={16} />
            Exit Test
          </button>
        </div>

        {/* Right Sidebar */}
        <div className={`absolute top-20 right-3 bottom-3 sm:top-6 sm:right-6 sm:bottom-6 z-[60] flex flex-col transition-all duration-300 cursor-auto ${isSidebarOpen ? 'w-80 max-w-[calc(100vw-1.5rem)]' : 'w-auto'}`}>
           {!isSidebarOpen && (
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="bg-white text-black p-3 rounded-full shadow-xl hover:bg-neutral-100"
               aria-label="Open dimming controls"
             >
               <ChevronLeft size={24} />
             </button>
           )}

           {isSidebarOpen && (
             <div className={`flex-1 bg-white text-neutral-900 rounded-xl shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right-10 duration-200 transition-opacity duration-300 ${uiHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="p-5 border-b border-neutral-100 flex justify-between items-center sticky top-0 bg-white z-20">
                   <div className="font-bold text-sm tracking-wider text-neutral-800">DIMMING TEST</div>
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
    <div>
      {!embedded && <h1 className="mb-5 text-3xl font-bold">Local Dimming &amp; Blooming Test</h1>}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="button" onClick={startTest} className="ui-primary-button min-h-[44px] rounded-lg bg-[#DDF58A] px-5 py-3 font-bold text-[#172419] hover:bg-[#E9FAB1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          Start local dimming test
        </button>
        <p className="text-sm leading-6 text-neutral-300">Automatic motion or manual mouse and touch control.</p>
      </div>
    </div>
  );
};

export default LocalDimmingTest;
