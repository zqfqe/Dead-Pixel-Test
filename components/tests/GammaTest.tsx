import React, { useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, ChevronUp, RotateCcw, Palette, MoveHorizontal, MoveVertical, Layers } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';

type GammaValue = '1.8' | '2.0' | '2.2' | '2.4' | '2.6';
type Channel = 'gray' | 'red' | 'green' | 'blue';
type Orientation = 'horizontal' | 'vertical';

const GammaTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // State
  const [currentGamma, setCurrentGamma] = useState<GammaValue>('2.2');
  const [channel, setChannel] = useState<Channel>('gray');
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
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
    setCurrentGamma('2.2');
    setChannel('gray');
    setOrientation('horizontal');
  };

  // 1. Calculate the Solid Color (Target)
  // Formula: Digital Level = 255 * (0.5 ^ (1/Gamma))
  const getSolidColor = (gamma: GammaValue, chan: Channel) => {
    const g = parseFloat(gamma);
    const val = Math.round(Math.pow(0.5, 1/g) * 255);
    
    switch (chan) {
        case 'red': return `rgb(${val}, 0, 0)`;
        case 'green': return `rgb(0, ${val}, 0)`;
        case 'blue': return `rgb(0, 0, ${val})`;
        default: return `rgb(${val}, ${val}, ${val})`;
    }
  };

  // 2. Generate the Dithered Background (Reference)
  // This simulates 50% luminance physically by alternating 0% and 100% lines
  const getBackgroundStyle = (chan: Channel, orient: Orientation) => {
    const colorOn = chan === 'gray' ? '#fff' : chan === 'red' ? '#ff0000' : chan === 'green' ? '#00ff00' : '#0000ff';
    const colorOff = '#000';
    
    const direction = orient === 'horizontal' ? 'to bottom' : 'to right';
    
    return {
        background: `repeating-linear-gradient(${direction}, ${colorOff} 0, ${colorOff} 1px, ${colorOn} 1px, ${colorOn} 2px)`
    };
  };

  if (isActive) {
    return (
      <div className="fixed inset-0 z-50 flex bg-neutral-900">
        {/* Top-Left Exit */}
        <button 
          onClick={stopTest}
          className="absolute top-6 left-6 z-[60] flex items-center gap-2 bg-neutral-900/90 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg hover:bg-neutral-800 transition-colors border border-neutral-700 font-medium text-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Exit
        </button>

        {/* Main View */}
        <div className="flex-1 flex items-center justify-center relative w-full h-full overflow-hidden">
           {/* The Test Patch Container */}
           <div className="relative w-[60vmin] h-[60vmin] shadow-2xl transition-all duration-300">
              
              {/* Layer 1: The Dithered Background (Reference 50%) */}
              <div 
                className="absolute inset-0 z-0 transition-all duration-300" 
                style={getBackgroundStyle(channel, orientation)} 
              />

              {/* Layer 2: The Solid Target (Calculated Gamma) */}
              <div 
                className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full shadow-2xl z-10 transition-colors duration-200"
                style={{ backgroundColor: getSolidColor(currentGamma, channel) }}
              >
                 {/* Optional: Tiny center dot to help focus */}
                 <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-black/50 -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
              </div>

              {/* Label Overlay (Fades out) */}
              <div className="absolute -bottom-12 w-full text-center text-white/50 font-mono text-xs">
                 Target: {currentGamma} | {channel.toUpperCase()}
              </div>
           </div>
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
                   <h3 className="font-bold text-sm tracking-wider text-neutral-800">GAMMA CONTROL</h3>
                   <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-800">
                     <ChevronUp size={20} className="rotate-90" />
                   </button>
                </div>

                <div className="p-5 space-y-8 flex-1">
                   {/* 1. Target Selection */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                        Target Gamma
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                         {(['1.8', '2.0', '2.2', '2.4', '2.6'] as GammaValue[]).map(g => (
                           <button
                             key={g}
                             onClick={() => setCurrentGamma(g)}
                             className={`
                               px-4 py-3 rounded-lg border text-left transition-all flex justify-between items-center
                               ${currentGamma === g ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}
                             `}
                           >
                             <span className="font-bold text-sm">Gamma {g}</span>
                             {g === '2.2' && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">STD</span>}
                             {g === '1.8' && <span className="text-[10px] font-bold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">MAC</span>}
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* 2. Color Channel */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                        <Palette size={12} /> Color Channel
                      </label>
                      <div className="flex rounded-md bg-neutral-100 p-1 border border-neutral-200">
                         {(['gray', 'red', 'green', 'blue'] as Channel[]).map(c => (
                            <button
                                key={c}
                                onClick={() => setChannel(c)}
                                className={`
                                    flex-1 py-1.5 capitalize text-xs font-bold rounded-md transition-all
                                    ${channel === c ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-neutral-600'}
                                    ${c === 'red' && channel === c ? '!text-red-600' : ''}
                                    ${c === 'green' && channel === c ? '!text-green-600' : ''}
                                    ${c === 'blue' && channel === c ? '!text-blue-600' : ''}
                                `}
                            >
                                {c}
                            </button>
                         ))}
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-tight">
                        Check RGB channels individually. If "Gray" is correct but "Red" is off, your monitor has a color tint issue in the shadows.
                      </p>
                   </div>

                   {/* 3. Pattern Orientation */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                         <Layers size={12} /> Pattern Style
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                         <button 
                           onClick={() => setOrientation('horizontal')} 
                           className={`p-2 border rounded flex items-center justify-center gap-2 ${orientation === 'horizontal' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-neutral-50'}`}
                         >
                            <MoveVertical size={16} /> <span className="text-xs font-medium">Horizontal</span>
                         </button>
                         <button 
                           onClick={() => setOrientation('vertical')} 
                           className={`p-2 border rounded flex items-center justify-center gap-2 ${orientation === 'vertical' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-neutral-50'}`}
                         >
                            <MoveHorizontal size={16} /> <span className="text-xs font-medium">Vertical</span>
                         </button>
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-tight">
                         Switch if the background flickers too much. This helps bypass "LCD Inversion" artifacts.
                      </p>
                   </div>
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
        title="Monitor Gamma Calibration Test - 1.8, 2.2, 2.4" 
        description="Calibrate your monitor gamma without hardware. Match the solid color to the stripes to find your screen's true gamma value (Standard 2.2 for Windows/Web)."
        canonical="/tests/gamma"
        keywords={['gamma test', 'monitor calibration', 'gamma 2.2 test', 'screen color test', 'display gamma', 'lcd inversion test']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Gamma Test', path: '/tests/gamma' }
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "name": "Monitor Gamma Checker",
              "url": "https://deadpixeltest.cc/tests/gamma",
              "description": "Visual gamma calibration tool. Determines if your monitor is crushing blacks (Gamma too high) or washing out colors (Gamma too low) relative to the 2.2 standard.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [{
                "@type": "Question",
                "name": "What is the correct Gamma for PC?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Gamma 2.2 is the industry standard for Windows, sRGB, and the Web. Gamma 1.8 was historically used on older Macs."
                }
              }, {
                "@type": "Question",
                "name": "How to use this Gamma Test?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sit back and squint your eyes. The solid inner circle should blend perfectly into the striped background. If the circle is darker, your gamma is too low. If brighter, your gamma is too high."
                }
              }]
            }
          ]
        }}
      />
      <TestIntro
        title="Gamma Calibration"
        description="Check if your monitor correctly translates digital values into light. Standard Gamma 2.2 ensures shadows aren't crushed and highlights aren't blown out."
        onStart={startTest}
      >
        <InfoCard title="The Squint Test">
          <p>
            Sit back or squint your eyes. The solid inner circle should blend perfectly into the striped background. If the circle is darker, your gamma is too low. If brighter, your gamma is too high.
          </p>
        </InfoCard>
        <InfoCard title="Color Balance">
          <p>
            Use the <strong>RGB Channels</strong>. It's common for monitors to have correct Gamma in Gray, but be misaligned in Blue (making dark scenes look cold) or Red (making skin tones look sunburnt).
          </p>
        </InfoCard>
      </TestIntro>
    </>
  );
};

export default GammaTest;