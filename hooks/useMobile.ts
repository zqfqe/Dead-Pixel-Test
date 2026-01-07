import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === 'undefined') return;
      // Check for touch capability and screen width
      const hasTouch = (window.matchMedia("(pointer: coarse)").matches);
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobile(hasTouch && isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};