import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useMobile } from '../../hooks/useMobile';

interface FullscreenControlsProps {
  onExit: () => void;
  title?: string;
  visible?: boolean;
}

export const FullscreenControls: React.FC<FullscreenControlsProps> = ({ onExit, title, visible = true }) => {
  const isMobile = useMobile();
  const [isHoveringTop, setIsHoveringTop] = useState(false);

  useEffect(() => {
    if (isMobile) return; // Skip hover logic on mobile

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
  }, [isMobile]);

  // Mobile Logic: Strictly obey the 'visible' prop (usually controlled by isIdle state from parent)
  // Desktop Logic: Show if 'visible' is explicitly true AND (mouse is hovering top OR parent forces it)
  // Note: We use 'visible' as a force-show on desktop only if specifically needed, typically desktop relies on hover.
  // But to unify, if visible is false (idle), we hide. If visible is true (active), we show on mobile immediately, desktop waits for hover.
  
  const show = isMobile ? visible : (visible && isHoveringTop);

  if (isMobile) {
    // Mobile Layout: Fixed bubble in top-left
    return (
      <div 
        className={`
          fixed top-6 left-6 z-[150]
          transition-all duration-300 ease-out
          ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
        `}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); onExit(); }}
          className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md border border-white/20 text-white px-4 py-2.5 rounded-full shadow-2xl active:scale-95 transition-transform"
        >
          <X size={18} />
          <span className="text-xs font-bold">Exit</span>
        </button>
      </div>
    );
  }

  // Desktop Layout: Top Center Bar
  return (
    <div 
      className={`
        fixed top-0 left-0 w-full z-[150] flex justify-center pt-4 pb-12
        transition-all duration-300 ease-out bg-gradient-to-b from-black/80 to-transparent pointer-events-none
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
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