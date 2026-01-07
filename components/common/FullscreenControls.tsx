import React, { useState, useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';

interface FullscreenControlsProps {
  onExit: () => void;
  title?: string;
  visible?: boolean;
}

export const FullscreenControls: React.FC<FullscreenControlsProps> = ({ onExit, title, visible = true }) => {
  const [isHoveringTop, setIsHoveringTop] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Show controls if mouse is within top 80px
      if (e.clientY < 80) {
        setIsHoveringTop(true);
      } else {
        setIsHoveringTop(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!visible) return null;

  return (
    <div 
      className={`
        fixed top-0 left-0 w-full z-[150] flex justify-center pt-4 pb-12
        transition-all duration-300 ease-out bg-gradient-to-b from-black/80 to-transparent pointer-events-none
        ${isHoveringTop ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      <div className="pointer-events-auto bg-neutral-900/90 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 shadow-2xl flex items-center gap-4">
        {title && <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider border-r border-white/10 pr-4">{title}</span>}
        
        <button 
          onClick={(e) => { e.stopPropagation(); onExit(); }}
          className="flex items-center gap-2 text-white hover:text-red-400 transition-colors text-sm font-bold"
        >
          <X size={18} />
          <span>Exit Test</span>
        </button>
      </div>
    </div>
  );
};