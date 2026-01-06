import React, { useState, useRef, useEffect } from 'react';
import { Ruler, CreditCard, ChevronLeft, RotateCcw, MoveHorizontal } from 'lucide-react';
import { useFullscreen } from '../../hooks/useFullscreen';

const PhysicalRuler: React.FC = () => {
  const { enterFullscreen, exitFullscreen, isFullscreen } = useFullscreen();
  
  // Standard ID-1 Card Size (mm)
  const CARD_WIDTH_MM = 85.60;
  
  // State: Pixels per Millimeter
  // Default guess: 96 PPI / 25.4 = ~3.78 px/mm
  const [pxPerMm, setPxPerMm] = useState(3.78);
  const [isCalibrated, setIsCalibrated] = useState(false);
  
  // Interaction
  const [sliderVal, setSliderVal] = useState(50); // abstract 0-100 slider
  const sliderRef = useRef<HTMLInputElement>(null);

  // Map slider 0-100 to a reasonable range of pixels width for the card
  // Min width: 200px (very high PPI phone)
  // Max width: 600px (very low PPI TV)
  const minCardPx = 200;
  const maxCardPx = 800;

  // Derived current card width in pixels based on slider
  const currentCardPx = minCardPx + (sliderVal / 100) * (maxCardPx - minCardPx);

  const handleCalibrate = () => {
     // Calculate px/mm based on user adjustment
     const newPPM = currentCardPx / CARD_WIDTH_MM;
     setPxPerMm(newPPM);
     setIsCalibrated(true);
     enterFullscreen();
  };

  const handleReset = () => {
      setIsCalibrated(false);
      exitFullscreen();
  };

  // --- Render Ruler Ticks ---
  const renderTicks = () => {
    const screenWidthMm = window.innerWidth / pxPerMm;
    const ticks = [];
    
    // Create ticks for every mm
    for (let i = 0; i < screenWidthMm; i++) {
        const isCm = i % 10 === 0;
        const isHalfCm = i % 5 === 0 && !isCm;
        const height = isCm ? 40 : isHalfCm ? 25 : 15;
        
        ticks.push(
            <div 
                key={i}
                className="absolute top-0 w-px bg-black flex flex-col justify-end items-center"
                style={{ left: `${i * pxPerMm}px`, height: `${height}px` }}
            >
                {isCm && (
                    <span className="mb-[-20px] text-xs font-bold font-mono">{i/10}</span>
                )}
            </div>
        );
    }
    return ticks;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      
      {!isCalibrated ? (
        // --- CALIBRATION SCREEN ---
        <div className="max-w-3xl mx-auto py-12 px-6 flex-1 flex flex-col items-center">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 text-blue-400 rounded-2xl mb-4">
                    <Ruler size={32} />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Physical Scale Calibration</h1>
                <p className="text-neutral-400 max-w-lg mx-auto">
                    To use your screen as a ruler, we first need to know your pixel density. 
                    Please grab a standard credit card (or ID card) and place it on the screen.
                </p>
            </div>

            <div className="w-full max-w-xl bg-neutral-900/50 border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col items-center">
                <div className="relative mb-12 flex items-center justify-center">
                    {/* Visual representation of Card on screen */}
                    <div 
                        className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-2xl flex items-center justify-center relative z-10 transition-all duration-75 border-t border-white/20"
                        style={{ 
                            width: `${currentCardPx}px`, 
                            height: `${currentCardPx / 1.586}px` // Aspect ratio of ID-1
                        }}
                    >
                        <CreditCard size={48} className="text-white/20" />
                        <span className="absolute bottom-4 left-6 text-white/40 font-mono text-sm tracking-widest">0000 0000 0000 0000</span>
                    </div>
                    
                    {/* Outline indicator */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div 
                            className="border-2 border-dashed border-white/30 rounded-xl"
                            style={{ 
                                width: `${currentCardPx + 20}px`, 
                                height: `${(currentCardPx / 1.586) + 20}px` 
                            }}
                        />
                    </div>
                </div>

                <div className="w-full space-y-6">
                    <div className="flex justify-between text-sm text-neutral-400 font-bold uppercase tracking-wider">
                        <span>Smaller</span>
                        <span>Adjust Width</span>
                        <span>Larger</span>
                    </div>
                    <input 
                        ref={sliderRef}
                        type="range" 
                        min="0" 
                        max="100" 
                        step="0.1"
                        value={sliderVal}
                        onChange={(e) => setSliderVal(Number(e.target.value))}
                        className="w-full h-3 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <p className="text-center text-sm text-neutral-400">
                        Adjust the slider until the blue box creates a perfect background for your physical card.
                    </p>
                </div>

                <button 
                    onClick={handleCalibrate}
                    className="mt-12 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-neutral-200 transition-transform active:scale-95 flex items-center gap-2"
                >
                    <MoveHorizontal size={18} /> Calibrate & Measure
                </button>
            </div>
        </div>
      ) : (
        // --- ACTIVE RULER SCREEN ---
        <div className="fixed inset-0 bg-white text-black flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-20">
                <button 
                    onClick={handleReset}
                    className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-xl hover:bg-neutral-800 flex items-center gap-2 text-sm"
                >
                    <RotateCcw size={16} /> Recalibrate
                </button>
                <div className="bg-neutral-100 border border-neutral-300 px-6 py-3 rounded-full font-mono text-sm font-bold shadow-xl">
                    {(pxPerMm * 25.4).toFixed(0)} PPI
                </div>
            </div>

            {/* Ruler Area */}
            <div className="flex-1 relative flex items-center justify-center cursor-crosshair">
                
                {/* Horizontal Ruler (Top) */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-yellow-50 border-b border-black">
                    {renderTicks()}
                </div>

                {/* Vertical Ruler (Left) */}
                <div className="absolute top-0 left-0 bottom-0 w-24 bg-yellow-50 border-r border-black hidden md:block">
                    {/* Render Ticks Vertical logic would be similar but rotated */}
                    <div className="absolute inset-0 flex flex-col items-end pt-24">
                        <span className="pr-2 text-[10px] text-neutral-400 rotate-90 origin-right whitespace-nowrap">Vertical Scale (Coming Soon)</span>
                    </div>
                </div>

                {/* Center Helper */}
                <div className="text-center opacity-50 pointer-events-none select-none">
                    <Ruler size={64} className="mx-auto mb-4 text-neutral-300" />
                    <h1 className="text-4xl font-bold text-neutral-300">1:1 Physical Scale</h1>
                    <p className="text-neutral-400 mt-2">Place objects on screen to measure.</p>
                </div>

            </div>
        </div>
      )}
    </div>
  );
};

export default PhysicalRuler;