import React, { useRef, useEffect, useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft } from 'lucide-react';

const GRID_COLUMNS = 12;
const GRID_ROWS = 10;
const GRID_SLOTS = GRID_COLUMNS * GRID_ROWS;
const SHUTTER_DENOMINATORS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 125, 160, 200, 250];

const RefreshRateTest: React.FC<{embedded?: boolean}> = ({embedded = false}) => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const exitButtonRef = useRef<HTMLButtonElement>(null);
  const [fps, setFps] = useState(0);
  
  const requestRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);

  const startTest = () => {
    setFps(0);
    frameCountRef.current = 0;
    lastTimeRef.current = 0;
    setIsActive(true);
    enterFullscreen();
  };

  const stopTest = () => {
    setIsActive(false);
    exitFullscreen();
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  // A timing test must not keep drawing after its tab is hidden or the
  // browser leaves native fullscreen. Escape also exits the in-page fallback.
  useEffect(() => {
    if (!isActive) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    exitButtonRef.current?.focus();

    const stopWhenHidden = () => {
      if (document.visibilityState === 'hidden') {
        setIsActive(false);
        void exitFullscreen();
      }
    };
    const stopOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsActive(false);
        void exitFullscreen();
      }
    };
    const stopAfterFullscreenExit = () => {
      if (!document.fullscreenElement) setIsActive(false);
    };

    document.addEventListener('visibilitychange', stopWhenHidden);
    document.addEventListener('fullscreenchange', stopAfterFullscreenExit);
    window.addEventListener('keydown', stopOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      requestAnimationFrame(() => startButtonRef.current?.focus({preventScroll:true}));
      document.removeEventListener('visibilitychange', stopWhenHidden);
      document.removeEventListener('fullscreenchange', stopAfterFullscreenExit);
      window.removeEventListener('keydown', stopOnEscape);
    };
  }, [isActive, exitFullscreen]);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let currentSlot = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const render = (time: number) => {
        // Browser animation cadence: wait for a full measurement window.
        if (lastTimeRef.current === 0) lastTimeRef.current = time;
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

        const gridWidth = Math.min(canvas.width * 0.9, 840);
        const gridHeight = Math.min(canvas.height * 0.48, 420);
        const cellWidth = gridWidth / GRID_COLUMNS;
        const cellHeight = gridHeight / GRID_ROWS;
        const left = (canvas.width - gridWidth) / 2;
        const top = (canvas.height - gridHeight) / 2;
        const x = left + (currentSlot % GRID_COLUMNS) * cellWidth;
        const y = top + Math.floor(currentSlot / GRID_COLUMNS) * cellHeight;

        ctx.strokeStyle = '#333';
        ctx.beginPath();
        for (let column = 0; column <= GRID_COLUMNS; column++) {
          const lineX = left + column * cellWidth;
          ctx.moveTo(lineX, top);
          ctx.lineTo(lineX, top + gridHeight);
        }
        for (let row = 0; row <= GRID_ROWS; row++) {
          const lineY = top + row * cellHeight;
          ctx.moveTo(left, lineY);
          ctx.lineTo(left + gridWidth, lineY);
        }
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(currentSlot + 1), x + cellWidth / 2, y + cellHeight / 2);

        currentSlot = (currentSlot + 1) % GRID_SLOTS;

        requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
        window.removeEventListener('resize', resize);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive]);

  if (isActive) {
    // Keep the exposure within half a sequence, leaving room for cadence changes.
    const shutter = SHUTTER_DENOMINATORS.find(value => fps / value <= GRID_SLOTS / 2);
    return (
      <div role="dialog" aria-modal="true" aria-label="Frame skipping test" className="fixed inset-0 z-[100] bg-black cursor-none select-none">
        <canvas ref={canvasRef} aria-hidden="true" className="block w-full h-full" />
        
        <div className="absolute top-[env(safe-area-inset-top)] left-0 w-full p-3 sm:p-6 flex justify-between items-start gap-4">
            <button 
                ref={exitButtonRef}
                onClick={stopTest}
                className="flex items-center gap-2 bg-neutral-900/80 backdrop-blur text-white min-h-[44px] px-4 py-2 rounded-lg shadow-lg border border-neutral-700 font-medium text-sm group cursor-pointer pointer-events-auto"
            >
                <ChevronLeft size={16} /> Exit
            </button>

            <div className="flex flex-col items-end">
                <div className="bg-black/60 backdrop-blur border border-white/20 px-3 py-2 sm:px-6 sm:py-4 rounded-xl text-center">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Browser FPS</div>
                    <div className="text-4xl sm:text-6xl font-mono font-bold text-green-400">{fps}</div>
                    <div className="text-xs text-neutral-300 mt-2">Browser FPS estimate</div>
                </div>
            </div>
        </div>

        <div className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-0 w-full px-4 text-center pointer-events-none">
            <p className="text-neutral-200 font-mono text-sm bg-black/50 inline-block px-4 py-2 rounded">
                {fps === 0 ? 'Wait for the browser FPS reading before taking a photo.'
                  : shutter ? `Use 1/${shutter} s or faster. Compare repeated photos of the numbered grid.`
                  : 'Use an exposure shorter than half a grid cycle.'}
            </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!embedded && <h1 className="mb-5 text-3xl font-bold">Refresh Rate &amp; Frame Skipping Test</h1>}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button ref={startButtonRef} type="button" onClick={startTest} className="ui-primary-button min-h-[44px] rounded-lg bg-[#DDF58A] px-5 py-3 font-bold text-[#172419] hover:bg-[#E9FAB1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          Start frame skipping test
        </button>
        <p className="text-sm leading-6 text-neutral-300">Live browser FPS and a 120-cell grid.</p>
      </div>
    </div>
  );
};

export default RefreshRateTest;
