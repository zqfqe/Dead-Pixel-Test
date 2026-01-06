import React from 'react';
import { Button } from './Button';

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
    <div className="max-w-[1200px] mx-auto py-12 px-6 lg:py-20 animate-fade-in relative">
      
      {/* Visual Flair: The Scanner Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent pointer-events-none opacity-50"></div>

      {/* Hero Section */}
      <div className="text-center mb-20 max-w-2xl mx-auto relative z-10">
        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-6 backdrop-blur-sm">
          Display Diagnostic Tool
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-[1.05]">
          {title}
        </h1>
        
        <p className="text-lg text-neutral-400 mb-10 leading-relaxed font-light">
          {description}
        </p>
        
        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={onStart} 
            className="px-10 py-4 text-base bg-white text-black hover:bg-neutral-200 rounded-full shadow-[0_0_50px_-15px_rgba(255,255,255,0.2)] transition-all transform hover:scale-105"
          >
            {startButtonText}
          </Button>
          <span className="text-[10px] text-neutral-600 font-mono tracking-wider">
            [{footerText.toUpperCase()}]
          </span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {children}
      </div>
    </div>
  );
};

export const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="group relative p-8 rounded-xl bg-[#080808] border border-white/5 overflow-hidden transition-all duration-500 hover:border-white/20">
    {/* Subtle Gradient Glow on Hover */}
    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    
    <div className="relative z-10">
      <h2 className="text-base font-medium text-white mb-3 tracking-wide flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 group-hover:bg-blue-500 transition-colors"></span>
        {title}
      </h2>
      <div className="text-neutral-400 leading-relaxed text-sm font-light">
        {children}
      </div>
    </div>
  </div>
);