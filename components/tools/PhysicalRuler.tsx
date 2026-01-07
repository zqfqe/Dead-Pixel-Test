import React, { useState, useRef, useEffect } from 'react';
import { Ruler, CreditCard, ChevronLeft, RotateCcw, MoveHorizontal, Monitor, Maximize, HelpCircle } from 'lucide-react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { SEO } from '../common/SEO';

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
    <>
      <SEO 
        title="Online Screen Ruler - Actual Size Scale (1:1)" 
        description="Turn your phone or monitor into a real physical ruler. Calibrate quickly with a credit card to measure objects in centimeters (cm) and inches."
        canonical="/tools/ruler"
        keywords={['online ruler', 'screen ruler', 'actual size ruler', 'phone ruler', 'mm ruler online', '1:1 scale ruler']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Physical Ruler', path: '/tools/ruler' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Online 1:1 Screen Ruler",
              "url": "https://deadpixeltest.cc/tools/ruler",
              "description": "A browser-based ruler that calibrates to your screen's PPI for accurate physical measurements.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@type": "HowTo",
              "name": "How to Calibrate an Online Ruler",
              "step": [
                { "@type": "HowToStep", "text": "Place a standard credit card or ID card on the screen." },
                { "@type": "HowToStep", "text": "Use the slider to resize the blue box until it matches the card's width perfectly." },
                { "@type": "HowToStep", "text": "Click 'Calibrate' to lock in the scale and view the ruler." }
              ]
            }
          ]
        }}
      />
      <div className="min-h-screen bg-black text-white flex flex-col font-sans">
        
        {!isCalibrated ? (
          // --- CALIBRATION SCREEN ---
          <div className="w-full flex-1 flex flex-col">
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

            {/* Deep SEO Content (Only visible when not measuring) */}
            <section className="max-w-4xl mx-auto px-6 py-16 space-y-16 animate-slide-up w-full" style={{ animationDelay: '0.2s' }}>
               <article className="prose prose-invert max-w-none">
                  <div className="grid md:grid-cols-2 gap-12">
                     <div>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                           <Monitor className="text-blue-500" /> Why Calibrate?
                        </h2>
                        <p className="text-neutral-400 leading-relaxed mb-4">
                           Web browsers don't know the physical size of your screen. They only know "CSS Pixels", which are arbitrary units.
                        </p>
                        <p className="text-neutral-400 leading-relaxed">
                           A "10cm" line in CSS might be 2cm on a phone and 15cm on a TV. To get <strong>1:1 actual size</strong>, we must calculate your specific PPI (Pixels Per Inch) by comparing a known physical object (like a credit card) against the screen pixels.
                        </p>
                     </div>
                     
                     <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                           <Maximize className="text-yellow-500" /> Accuracy Tips
                        </h3>
                        <ul className="text-sm text-neutral-400 space-y-2 list-disc pl-4">
                           <li>Use a <strong>Standard ID-1 Card</strong> (Credit, Debit, Driver's License). They are universally 85.60mm wide.</li>
                           <li>Close one eye to align the card edge perfectly with the blue box to avoid parallax error.</li>
                           <li>Be gentle! Don't scratch your screen with the card.</li>
                        </ul>
                     </div>
                  </div>

                  <hr className="my-12 border-white/10" />

                  <div className="border-t border-white/10 pt-12">
                    <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                       <HelpCircle className="text-blue-400" /> Frequently Asked Questions
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                          <h4 className="font-bold text-white text-base mb-2">Can I use this on my phone?</h4>
                          <p className="text-neutral-400 text-sm">Yes. This tool is responsive. Place your card on the phone screen and use the slider. It's often handy for measuring ring sizes or small hardware parts.</p>
                       </div>
                       <div className="bg-neutral-900/30 p-6 rounded-xl border border-white/5">
                          <h4 className="font-bold text-white text-base mb-2">Is the scale accurate?</h4>
                          <p className="text-neutral-400 text-sm">Once calibrated correctly with a card, the ruler is typically accurate to within 0.5mm. It is perfect for estimations but use a metal caliper for engineering tasks.</p>
                       </div>
                    </div>
                 </div>
               </article>
            </section>
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
    </>
  );
};

export default PhysicalRuler;