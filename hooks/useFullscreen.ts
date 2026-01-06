import { useState, useEffect, useCallback } from 'react';

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.error("Failed to enter fullscreen", e);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.error("Failed to exit fullscreen", e);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Hide cursor in fullscreen
      document.body.style.cursor = document.fullscreenElement ? 'none' : 'auto';
    };

    document.addEventListener('fullscreenchange', handleChange);
    
    // Keyboard listener for ESC (handled by browser usually) or F11
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        // Optional: Allow 'f' key to toggle for convenience
        // toggleFullscreen(); 
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.cursor = 'auto'; // Reset on unmount
    };
  }, [toggleFullscreen]);

  return { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen };
};