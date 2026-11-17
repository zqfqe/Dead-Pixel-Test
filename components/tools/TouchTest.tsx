import React, { useEffect, useRef, useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, RotateCcw, Hand, Fingerprint, Maximize2, Smartphone, Tablet, Zap, Layers, HelpCircle } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  radius: number;
  force: number | null;
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
  const MAX_POINTS_PER_PATH = 400;
  const MAX_SAVED_PATHS = 30;

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

  const drawTrails = (canvas: HTMLCanvasElement,ctx:CanvasRenderingContext2D) => {
    const width=canvas.clientWidth,height=canvas.clientHeight;
    ctx.clearRect(0,0,width,height);
    ctx.strokeStyle='#333';ctx.lineWidth=1;ctx.beginPath();
    for(let x=0;x<width;x+=100){ctx.moveTo(x,0);ctx.lineTo(x,height);}
    for(let y=0;y<height;y+=100){ctx.moveTo(0,y);ctx.lineTo(width,y);}
    ctx.stroke();
    pathsRef.current.forEach((points,id)=>{
      if(points.length<2)return;
      ctx.beginPath();
      ctx.strokeStyle=COLORS[((id%COLORS.length)+COLORS.length)%COLORS.length];
      ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';
      ctx.moveTo(points[0].x,points[0].y);
      for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
      ctx.stroke();
    });
  };
  const clearCanvas = () => {
    pathsRef.current.clear();
    setTouches([]);
    const canvas=canvasRef.current;
    const ctx=canvas?.getContext('2d');
    if(canvas&&ctx)drawTrails(canvas,ctx);
  };

  useEffect(() => {
    if(!isActive)return;
    const canvas=canvasRef.current;
    if(!canvas)return;
    // Restrict touch-action:none to the test canvas; Exit/Clear remain interactive.
    const resize=()=>{
      const rect=canvas.getBoundingClientRect();
      const dpr=Math.min(3,window.devicePixelRatio||1);
      canvas.width=Math.max(1,Math.round(rect.width*dpr));
      canvas.height=Math.max(1,Math.round(rect.height*dpr));
      const ctx=canvas.getContext('2d');
      if(!ctx)return;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      drawTrails(canvas,ctx);
    };
    window.addEventListener('resize',resize);
    resize();
    return ()=>window.removeEventListener('resize',resize);
  },[isActive]);

  const handleTouch = (event:React.TouchEvent<HTMLCanvasElement>) => {
    if(!isActive)return;
    const canvas=canvasRef.current;
    const ctx=canvas?.getContext('2d');
    if(!canvas||!ctx)return;
    const rect=canvas.getBoundingClientRect();
    const active:TouchPoint[]=[];
    for(let i=0;i<event.targetTouches.length;i++){
      const touch=event.targetTouches[i],id=touch.identifier;
      const x=touch.clientX-rect.left,y=touch.clientY-rect.top;
      const optionalTouch=touch as Touch & {radiusX?:number;force?:number};
      const force=typeof optionalTouch.force==='number'&&Number.isFinite(optionalTouch.force)?optionalTouch.force:null;
      active.push({id,x,y,radius:optionalTouch.radiusX||10,force,
        color:COLORS[((id%COLORS.length)+COLORS.length)%COLORS.length]});
      if(!pathsRef.current.has(id)){
        if(pathsRef.current.size>=MAX_SAVED_PATHS){
          const oldest=pathsRef.current.keys().next().value;
          if(oldest!==undefined)pathsRef.current.delete(oldest);
        }
        pathsRef.current.set(id,[]);
      }
      const path=pathsRef.current.get(id)!;
      path.push({x,y});
      if(path.length>MAX_POINTS_PER_PATH)path.splice(0,path.length-MAX_POINTS_PER_PATH);
    }
    setTouches(active);
    drawTrails(canvas,ctx);
  };

  if (isActive) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black select-none overflow-hidden"
      >
        <canvas ref={canvasRef} data-testid="touch-test-canvas" aria-label="Multi-touch tracing area" className="absolute inset-0 w-full h-full touch-none" onTouchStart={handleTouch} onTouchMove={handleTouch} onTouchEnd={handleTouch} onTouchCancel={handleTouch} />

        {/* HUD Info */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
            <div className="bg-neutral-900/80 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-white font-mono text-sm flex items-center gap-2">
                <Fingerprint size={16} className="text-blue-400" />
                <span data-testid="touch-active-count">Points: {touches.length}</span>
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
                    F:{t.force===null?'N/A':t.force.toFixed(2)}
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
    <>
      <SEO 
        title="Touch Screen Test - Multi-Touch & Digitizer Check" 
        description="Test your smartphone or tablet touch screen. Check for dead zones, ghost touches, and verify multi-touch support (up to 10 fingers)."
        canonical="/tools/touch"
        keywords={['touch screen test', 'multi touch test', 'digitizer test', 'android screen test', 'ipad screen test', 'dead zone test']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Touch Test', path: '/tools/touch' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Multi-Touch Screen Tester",
              "url": "https://deadpixeltest.cc/tools/touch",
              "description": "Visualize touch inputs to detect dead zones, ghost touches, and test multi-touch capabilities (up to 10 points).",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [{
                "@type": "Question",
                "name": "How to check for Ghost Touches?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Open the test and leave your hands off the screen. If you see circles appearing or lines drawing themselves, your digitizer is registering 'ghost touches'."
                }
              }, {
                "@type": "Question",
                "name": "How to check for Dead Zones?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Drag your finger across the entire screen, painting a grid. If there are areas where the line breaks or doesn't draw, you have found a dead zone."
                }
              }]
            }
          ]
        }}
      />
      <div className="flex flex-col">
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

      </div>
    </>
  );
};

export default TouchTest;