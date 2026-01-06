import React, { useRef, useEffect, useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, Monitor, Zap, Info, Camera } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';

const RefreshRateTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fps, setFps] = useState(0);
  
  const requestRef = useRef<number>();
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);

  const startTest = () => {
    setIsActive(true);
    enterFullscreen();
  };

  const stopTest = () => {
    setIsActive(false);
    exitFullscreen();
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // We want to divide the screen width into N columns where N is roughly the refresh rate
    // Actually, to visualize frame skipping, we just need a grid of N boxes.
    // The box moves 1 slot per frame.
    // If you take a 1/5th second exposure photo:
    // A 60Hz monitor will light up 12 boxes.
    // A 144Hz monitor will light up ~29 boxes.
    // Gaps mean frames were skipped.
    
    // We will use a fixed number of slots to fill the width.
    // Let's use 60 slots for simplicity, or dynamic?
    // Dynamic is better.
    
    let slots = 60; 
    let currentSlot = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Recalculate slots based on width to keep squares roughly 40px
      slots = Math.floor(canvas.width / 40);
    };
    window.addEventListener('resize', resize);
    resize();

    const render = (time: number) => {
        // FPS Counter
        if (time - lastTimeRef.current >= 1000) {
            setFps(Math.round((frameCountRef.current * 1000) / (time - lastTimeRef.current)));
            frameCountRef.current = 0;
            lastTimeRef.current = time;
        }
        frameCountRef.current++;

        // Draw Logic
        // Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        const slotWidth = canvas.width / slots;
        const startY = canvas.height / 2 - 50;
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for(let i=0; i<slots; i++) {
            ctx.strokeRect(i * slotWidth, startY, slotWidth, 100);
        }

        // Active Block
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(currentSlot * slotWidth + 2, startY + 2, slotWidth - 4, 96);
        
        // Block Number
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((currentSlot+1).toString(), currentSlot * slotWidth + slotWidth/2, startY + 50);

        // Advance
        currentSlot = (currentSlot + 1) % slots;

        requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
        window.removeEventListener('resize', resize);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive]);

  if (isActive) {
    return (
      <div className="fixed inset-0 z-50 bg-black cursor-none select-none">
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start">
            <button 
                onClick={stopTest}
                className="flex items-center gap-2 bg-neutral-900/80 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg border border-neutral-700 font-medium text-sm group cursor-pointer pointer-events-auto"
            >
                <ChevronLeft size={16} /> Exit
            </button>

            <div className="flex flex-col items-end">
                <div className="bg-black/60 backdrop-blur border border-white/20 px-6 py-4 rounded-xl text-center">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Browser FPS</div>
                    <div className="text-6xl font-mono font-bold text-green-400">{fps}</div>
                    <div className="text-xs text-neutral-600 mt-2">Target: {window.screen.width > 0 ? 'Max' : '60'} Hz</div>
                </div>
            </div>
        </div>

        <div className="absolute bottom-12 left-0 w-full text-center pointer-events-none">
            <p className="text-white/50 font-mono text-sm bg-black/50 inline-block px-4 py-2 rounded">
                Take a long exposure photo (1/5s) to check for gaps.
            </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Refresh Rate & Frame Skipping Test (Hz Check)" 
        description="Check your monitor's real refresh rate (Hz) and detect frame skipping. Essential for overclocked monitors to ensure they aren't dropping frames."
        canonical="/tests/refresh-rate"
        keywords={['refresh rate test', 'hz test', 'frame skipping test', 'monitor overclock test', 'fps test', 'vsync test']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Refresh Rate Test', path: '/tests/refresh-rate' }
        ]}
      />
      <TestIntro
        title="Refresh Rate & Frame Skipping"
        description="Validate your monitor's true refresh rate and check for dropped frames (common in overclocked monitors). Requires a smartphone camera for the Skipping Test."
        onStart={startTest}
      >
        <InfoCard title="How to Check Frame Skipping">
          <ol className="list-decimal pl-4 space-y-2 text-sm text-neutral-400 mt-2">
              <li>Start the test. A white block will move across the grid.</li>
              <li>Open your phone camera in <strong>Pro/Manual Mode</strong>.</li>
              <li>Set Shutter Speed to roughly <strong>1/5s</strong> or <strong>1/10s</strong>.</li>
              <li>Take a photo of the moving block.</li>
              <li><strong>Result:</strong> If the trail of blocks is continuous, it's perfect. If there are black gaps between blocks, your monitor is skipping frames.</li>
          </ol>
        </InfoCard>
        <InfoCard title="Hz vs FPS">
          <p>
            This tool measures <strong>Browser FPS</strong>. On a 144Hz monitor, this should read 144. If it's capped at 60, check your Windows Display Settings or Browser Hardware Acceleration settings.
          </p>
        </InfoCard>
      </TestIntro>
    </>
  );
};

export default RefreshRateTest;