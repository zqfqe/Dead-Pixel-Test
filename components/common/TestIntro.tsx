import React from 'react';
import { Button } from './Button';
import { ScanLine } from 'lucide-react';

interface TestIntroProps {
  title: string;
  description: string;
  onStart: () => void;
  startButtonText?: string;
  footerText?: string;
  children?: React.ReactNode;
}

export const TestIntro: React.FC<TestIntroProps> = ({
  title,
  description,
  onStart,
  startButtonText = "Start Calibration",
  footerText = "Press F11 for Fullscreen",
  children
}) => {
  return (
    <div className="relative w-full overflow-hidden">
      {/* --- Optimized Background --- */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* 1. Static Grid (CSS Pattern is cheap) */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
          }}
        ></div>

        {/* 2. Simplified Scan Animation (Hardware Accelerated via Tailwind Config) */}
        <div className="absolute top-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-transparent via-blue-500/5 to-transparent animate-scan-slow pointer-events-none will-change-transform"></div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-[1200px] mx-auto py-16 px-6 lg:py-24 relative z-10 animate-fade-in">
        
        {/* Center Line Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-white/20"></div>

        {/* Hero Section */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono uppercase tracking-widest text-blue-300 mb-8 backdrop-blur-md shadow-lg shadow-blue-900/10">
            <ScanLine size={12} /> Display Diagnostic Suite
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter leading-[1.1] drop-shadow-2xl">
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-300 mb-10 leading-relaxed font-light max-w-2xl mx-auto">
            {description}
          </p>
          
          <div className="flex flex-col items-center gap-5">
            <Button 
              onClick={onStart} 
              className="px-12 py-5 text-lg font-bold bg-white text-black hover:bg-blue-50 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] transition-all transform hover:scale-105 active:scale-95"
            >
              {startButtonText}
            </Button>
            <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase opacity-70">
              {footerText}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="group relative p-8 rounded-2xl bg-[#0a0a0a]/80 border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 hover:bg-[#0f0f0f]/90 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-900/5">
    {/* Simple hover border instead of expensive blur effects */}
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    
    <div className="relative z-10">
      <h2 className="text-base font-bold text-white mb-4 tracking-wide flex items-center gap-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/5 text-blue-400 group-hover:text-white group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors shadow-inner">
           <div className="w-1.5 h-1.5 bg-current rounded-full" />
        </span>
        {title}
      </h2>
      <div className="text-neutral-300 leading-relaxed text-sm font-light pl-9">
        {children}
      </div>
    </div>
  </div>
);