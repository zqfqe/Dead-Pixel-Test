import React, { useEffect, useRef, useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, RotateCcw, Hand, Fingerprint, Maximize2 } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  radius: number;
  force: number;
  color: string;
}

const COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#eab308', // Yellow
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

const TouchTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  const [touches, setTouches] = useState<TouchPoint[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Persistent tracking for drawing paths
  // Map<TouchIdentifier, {x,y}[]>
  const pathsRef = useRef<Map<number, {x:number, y:number}[]>>(new Map());

  const startTest = () => {
    setIsActive(true);
    enterFullscreen();
  };

  const stopTest = () => {
    setIsActive(false);
    exitFullscreen();
    pathsRef.current.clear();
    setTouches([]);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // We also clear paths, but keep active touches? 
        // Better to clear trails but keep current points logic separate.
        // Actually, let's just clear the "dead" paths.
        // For simplicity: Clear all trails.
        pathsRef.current.clear();
    }
  };

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resize handling
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Prevent default touch actions (scrolling, zooming)
    const preventDefault = (e: Event) => e.preventDefault();
    document.body.addEventListener('touchstart', preventDefault, { passive: false });
    document.body.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
        window.removeEventListener('resize', resize);
        document.body.removeEventListener('touchstart', preventDefault);
        document.body.removeEventListener('touchmove', preventDefault);
    };
  }, [isActive]);

  const handleTouch = (e: React.TouchEvent) => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const newTouches: TouchPoint[] = [];
    const rect = canvas.getBoundingClientRect();

    // Update active touches list
    for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        const color = COLORS[t.identifier % COLORS.length];
        
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;

        newTouches.push({
            id: t.identifier,
            x,
            y,
            radius: t.radiusX || 10,
            force: t.force || 0.5, // 0-1
            color
        });

        // Update Paths
        if (!pathsRef.current.has(t.identifier)) {
            pathsRef.current.set(t.identifier, []);
        }
        pathsRef.current.get(t.identifier)?.push({ x, y });
    }
    setTouches(newTouches);

    // Render loop is manual here (dirty render on event) for lowest latency feeling
    // Ideally we use rAF, but for simple drawing lines, event-driven is responsive enough.
    
    // Clear and Redraw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid (faint)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let x=0; x<canvas.width; x+=100) { ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); }
    for(let y=0; y<canvas.height; y+=100) { ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); }
    ctx.stroke();

    // Draw Paths
    pathsRef.current.forEach((points, id) => {
        if (points.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = COLORS[id % COLORS.length];
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    });
  };

  if (isActive) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black touch-none select-none overflow-hidden"
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleTouch}
        onTouchCancel={handleTouch}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* HUD Info */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
            <div className="bg-neutral-900/80 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-white font-mono text-sm flex items-center gap-2">
                <Fingerprint size={16} className="text-blue-400" />
                <span>Points: {touches.length}</span>
            </div>
        </div>

        {/* Active Touch Bubbles (React Overlay for crisp text) */}
        {touches.map(t => (
            <div 
                key={t.id}
                className="absolute w-24 h-24 pointer-events-none flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
                style={{ left: t.x, top: t.y }}
            >
                {/* Visual Ring */}
                <div 
                    className="rounded-full border-2 opacity-50"
                    style={{ 
                        borderColor: t.color, 
                        width: Math.max(40, t.radius * 2), 
                        height: Math.max(40, t.radius * 2),
                        backgroundColor: `${t.color}20` 
                    }}
                ></div>
                
                {/* Coordinates Label */}
                <div className="mt-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-mono whitespace-nowrap border border-white/10">
                    X:{Math.round(t.x)} Y:{Math.round(t.y)}
                    <br/>
                    F:{t.force.toFixed(2)}
                </div>
            </div>
        ))}

        {/* Controls */}
        <div className="absolute top-6 left-6 z-[60]">
          <button 
            onClick={stopTest}
            className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-lg border border-neutral-700 font-medium text-sm"
          >
            <ChevronLeft size={16} /> Exit
          </button>
        </div>

        <div className="absolute top-6 right-6 z-[60]">
          <button 
            onClick={clearCanvas}
            className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-lg border border-neutral-700 font-medium text-sm"
          >
            <RotateCcw size={16} /> Clear
          </button>
        </div>
      </div>
    );
  }

  return (
    <TestIntro
      title="Touch Screen Test"
      description="Test your digitizer for dead zones, phantom touches, and multi-touch capability. Supports pressure sensitivity on compatible devices (iPad/Surface)."
      startButtonText="Start Touch Test"
      onStart={startTest}
    >
      <InfoCard title="Multi-Touch Check">
        <p>
          Try placing 10 fingers on the screen at once. High-quality digitizers support 10+ points. Budget devices may ghost or merge points when more than 5 fingers are used.
        </p>
      </InfoCard>
      <InfoCard title="Linearity Test">
        <p>
          Use a ruler (plastic, not metal) to draw a straight diagonal line slowly. If the line becomes wavy or jagged ("jitter"), the digitizer's grid resolution is low or noisy.
        </p>
      </InfoCard>
    </TestIntro>
  );
};

export default TouchTest;