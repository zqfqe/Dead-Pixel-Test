import React, { useState } from 'react';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChevronLeft, ChevronUp, RotateCcw, Type, MoveVertical, MoveHorizontal, Palette, Grid } from 'lucide-react';
import { TestIntro, InfoCard } from '../common/TestIntro';
import { SEO } from '../common/SEO';

type FontType = 'sans' | 'serif' | 'mono';
type ColorMode = 'standard' | 'chroma' | 'inverted';
type ScrollMode = 'none' | 'vertical' | 'horizontal';

// Constants
const loremShort = "The quick brown fox jumps over the lazy dog.";
const loremLong = "Sphinx of black quartz, judge my vow. 0123456789. !@#$%^&*()_+";
const sizes = [10, 12, 14, 16, 18, 24, 32, 48];

const TextBlock: React.FC<{ size: number }> = ({ size }) => (
  <div className="mb-12 whitespace-nowrap">
    <div className="flex items-center gap-4 mb-2 opacity-50 text-xs font-mono">
       <span>{size}px</span>
       {/* Sharpness check pattern next to text */}
       <div className="h-4 w-32 bg-current opacity-20" style={{ 
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 1px, currentColor 1px, currentColor 2px)` 
       }}></div>
    </div>
    <p style={{ fontSize: `${size}px`, lineHeight: 1.2 }}>{loremShort}</p>
    <p style={{ fontSize: `${size}px`, lineHeight: 1.2, fontWeight: 'bold' }}>{loremLong}</p>
    <p style={{ fontSize: `${size}px`, lineHeight: 1.2, fontStyle: 'italic' }}>{loremShort} (Italic)</p>
  </div>
);

const TextClarityTest: React.FC = () => {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isActive, setIsActive] = useState(false);
  
  // State
  const [focusSize, setFocusSize] = useState<number | 'all'>('all');
  const [scrollMode, setScrollMode] = useState<ScrollMode>('none');
  const [colorMode, setColorMode] = useState<ColorMode>('standard');
  const [fontType, setFontType] = useState<FontType>('sans');
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
    setFocusSize('all');
    setScrollMode('none');
    setColorMode('standard');
    setFontType('sans');
  };

  const getFontClass = () => {
    switch (fontType) {
      case 'mono': return 'font-mono';
      case 'serif': return 'font-serif';
      default: return 'font-sans';
    }
  };

  // Define colors based on mode
  const getPanelColors = () => {
    switch (colorMode) {
      case 'chroma':
        // Test specifically for 4:2:0 subsampling issues (Red/Blue are worst offenders)
        return {
          left: { bg: '#000000', text: '#FF0000', label: 'Red on Black' }, // Red subpixel stress
          right: { bg: '#000000', text: '#0000FF', label: 'Blue on Black' } // Blue subpixel stress
        };
      case 'inverted':
        return {
          left: { bg: '#FFFFFF', text: '#000000', label: 'Black on White' },
          right: { bg: '#000000', text: '#FFFFFF', label: 'White on Black' }
        };
      case 'standard':
      default:
        return {
          left: { bg: '#000000', text: '#FFFFFF', label: 'White on Black' },
          right: { bg: '#FFFFFF', text: '#000000', label: 'Black on White' }
        };
    }
  };

  const colors = getPanelColors();

  const renderContent = (textColor: string) => {
    const visibleSizes = sizes.filter(s => focusSize === 'all' || focusSize === s);
    
    // Animation Wrapper
    let animClass = "";
    if (scrollMode === 'vertical') animClass = "animate-scroll-vertical";
    if (scrollMode === 'horizontal') animClass = "animate-scroll-horizontal inline-block";

    return (
      <div className={`w-full ${scrollMode === 'horizontal' ? 'whitespace-nowrap overflow-visible' : ''}`}>
        <div className={animClass}>
           {visibleSizes.map(size => (
              <TextBlock key={size} size={size} />
           ))}
           {/* Duplicate for seamless loop if needed, though simple CSS loop usually enough */}
        </div>
      </div>
    );
  };

  if (isActive) {
    return (
      <div className={`fixed inset-0 z-50 flex w-full h-full bg-black overflow-hidden ${getFontClass()}`}>
        {/* Top-Left Exit */}
        <button 
          onClick={stopTest}
          className="absolute top-6 left-6 z-[60] flex items-center gap-2 bg-neutral-900/90 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-neutral-800 transition-colors border border-neutral-700 font-medium text-sm group backdrop-blur"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Exit
        </button>

        {/* Main Content Area - Split View */}
        <div className="flex-1 flex h-full relative">
          
          {/* LEFT PANEL */}
          <div 
             className="w-1/2 h-full relative overflow-hidden flex flex-col items-center justify-center border-r border-white/10"
             style={{ backgroundColor: colors.left.bg, color: colors.left.text }}
          >
             <div className="absolute top-4 left-0 w-full text-center opacity-30 text-xs font-bold uppercase tracking-widest">{colors.left.label}</div>
             <div className="w-full h-full p-12 overflow-hidden flex items-center">
                {renderContent(colors.left.text)}
             </div>
          </div>

          {/* RIGHT PANEL */}
          <div 
             className="w-1/2 h-full relative overflow-hidden flex flex-col items-center justify-center"
             style={{ backgroundColor: colors.right.bg, color: colors.right.text }}
          >
             <div className="absolute top-4 left-0 w-full text-center opacity-30 text-xs font-bold uppercase tracking-widest">{colors.right.label}</div>
             <div className="w-full h-full p-12 overflow-hidden flex items-center">
                {renderContent(colors.right.text)}
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
             <div className="flex-1 bg-white text-neutral-900 rounded-xl shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right-10 duration-200">
                <div className="p-5 border-b border-neutral-100 flex justify-between items-center sticky top-0 bg-white z-20">
                   <h3 className="font-bold text-sm tracking-wider text-neutral-800">TEXT CLARITY</h3>
                   <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-neutral-800">
                     <ChevronUp size={20} className="rotate-90" />
                   </button>
                </div>

                <div className="p-5 space-y-8 flex-1">
                   
                   {/* 1. Color Mode (Chroma) */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                        <Palette size={12} /> Color Mode
                      </label>
                      <div className="flex flex-col gap-2">
                         <button 
                           onClick={() => setColorMode('standard')}
                           className={`p-2 rounded border text-left text-xs font-medium transition-all ${colorMode === 'standard' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-neutral-50'}`}
                         >
                           Standard (B&W)
                         </button>
                         <button 
                           onClick={() => setColorMode('chroma')}
                           className={`p-2 rounded border text-left text-xs font-medium transition-all ${colorMode === 'chroma' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-neutral-50'}`}
                         >
                           Chroma Check (Red/Blue)
                           <span className="block text-[10px] opacity-70 font-normal mt-1">Tests for 4:2:0 subsampling issues common on TVs.</span>
                         </button>
                      </div>
                   </div>

                   {/* 2. Font Selection */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                        <Type size={12} /> Typeface
                      </label>
                      <div className="flex rounded-lg bg-neutral-100 p-1 border border-neutral-200">
                         <button 
                           onClick={() => setFontType('sans')}
                           className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${fontType === 'sans' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'}`}
                         >
                           Sans
                         </button>
                         <button 
                           onClick={() => setFontType('serif')}
                           className={`flex-1 py-1.5 text-xs font-serif font-bold rounded transition-all ${fontType === 'serif' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'}`}
                         >
                           Serif
                         </button>
                         <button 
                           onClick={() => setFontType('mono')}
                           className={`flex-1 py-1.5 text-xs font-mono font-bold rounded transition-all ${fontType === 'mono' ? 'bg-white text-black shadow-sm' : 'text-neutral-500'}`}
                         >
                           Mono
                         </button>
                      </div>
                   </div>

                   {/* 3. Animation */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                         Motion
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                         <button onClick={() => setScrollMode('none')} className={`py-2 text-xs border rounded ${scrollMode === 'none' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-neutral-50'}`}>Static</button>
                         <button onClick={() => setScrollMode('vertical')} className={`py-2 text-xs border rounded flex items-center justify-center gap-1 ${scrollMode === 'vertical' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-neutral-50'}`}><MoveVertical size={12}/> Vert</button>
                         <button onClick={() => setScrollMode('horizontal')} className={`py-2 text-xs border rounded flex items-center justify-center gap-1 ${scrollMode === 'horizontal' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-neutral-50'}`}><MoveHorizontal size={12}/> Horz</button>
                      </div>
                   </div>

                   {/* 4. Focus Size */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Focus Size</label>
                      <div className="grid grid-cols-4 gap-2">
                         <button 
                           onClick={() => setFocusSize('all')}
                           className={`col-span-4 py-1.5 text-xs font-bold rounded border ${focusSize === 'all' ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`}
                         >
                           Show All
                         </button>
                         {[10, 12, 14, 16, 24, 32, 48].map(s => (
                           <button
                             key={s}
                             onClick={() => setFocusSize(s)}
                             className={`py-1.5 text-xs font-medium rounded border ${focusSize === s ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`}
                           >
                             {s}
                           </button>
                         ))}
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

        {/* CSS for animations */}
        <style>{`
          @keyframes scrollVertical {
            0% { transform: translateY(50%); }
            100% { transform: translateY(-100%); }
          }
          @keyframes scrollHorizontal {
            0% { transform: translateX(50%); }
            100% { transform: translateX(-100%); }
          }
          .animate-scroll-vertical {
            animation: scrollVertical 20s linear infinite;
          }
          .animate-scroll-horizontal {
            animation: scrollHorizontal 20s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Text Clarity & Chroma Subsampling Test" 
        description="Check if your monitor displays clear text. Identify chroma subsampling (4:2:0) artifacts, over-sharpening halos, and readability issues on high-DPI screens."
        canonical="/tests/text-clarity"
        keywords={['text clarity test', 'chroma subsampling test', '4:4:4 test', 'monitor sharpness test', 'font readability test', 'ycbcr 420 test']}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Text Clarity', path: '/tests/text-clarity' }
        ]}
      />
      <TestIntro
        title="Text Clarity Test"
        description="Check for chroma subsampling artifacts (fuzzy colored text), over-sharpening halos, and readability. Essential for setting up TVs as PC monitors."
        onStart={startTest}
      >
        <InfoCard title="The 'Chroma' Test">
          <p>
            If Red or Blue text on a black background looks jagged, broken, or unreadable compared to white text, your display might be running in <strong>YCbCr 4:2:0</strong> or <strong>4:2:2</strong> mode instead of full <strong>4:4:4 RGB</strong>.
          </p>
        </InfoCard>
        <InfoCard title="Sharpening Halos">
          <p>
            Look at the faint lines next to the text. If you see white glowing edges (halos) around the text or lines, your monitor's <strong>Sharpness</strong> setting is too high. Lower it until the halos disappear.
          </p>
        </InfoCard>
      </TestIntro>
    </>
  );
};

export default TextClarityTest;