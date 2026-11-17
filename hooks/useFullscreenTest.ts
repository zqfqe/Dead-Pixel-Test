import { useCallback, useEffect, useRef, useState } from 'react';

interface TestSession {
  opener: HTMLElement | null;
  previousOverflow: string;
  native: boolean;
}

const leaveNativeFullscreen = () => {
  if (document.fullscreenElement === document.documentElement) {
    void document.exitFullscreen().catch(() => {});
  }
};

export function useFullscreenTest(onStop?: () => void) {
  const [isActive, setIsActive] = useState(false);
  const sessionRef = useRef<TestSession | null>(null);

  const releaseSession = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return null;
    sessionRef.current = null;
    document.body.style.overflow = session.previousOverflow;
    if (session.native) leaveNativeFullscreen();
    return session;
  }, []);

  const stopTest = useCallback(() => {
    const session = releaseSession();
    if (!session) return;
    setIsActive(false);
    onStop?.();
    requestAnimationFrame(() => {
      if (!sessionRef.current && session.opener?.isConnected) {
        session.opener.focus({ preventScroll: true });
      }
    });
  }, [onStop, releaseSession]);

  const startTest = useCallback(() => {
    if (sessionRef.current || document.hidden) return;
    const session: TestSession = {
      opener: document.activeElement instanceof HTMLElement ? document.activeElement : null,
      previousOverflow: document.body.style.overflow,
      native: false,
    };
    sessionRef.current = session;
    document.body.style.overflow = 'hidden';
    setIsActive(true);

    const root = document.documentElement;
    if (document.fullscreenElement || typeof root.requestFullscreen !== 'function') return;
    void root.requestFullscreen().then(() => {
      if (sessionRef.current === session) {
        session.native = document.fullscreenElement === root;
      } else if (!sessionRef.current) {
        leaveNativeFullscreen();
      }
    }).catch(() => {
      // The full-viewport overlay is also usable without native fullscreen.
    });
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        stopTest();
      }
    };
    const onVisibility = () => {
      if (document.hidden) stopTest();
    };
    const onFullscreen = () => {
      const session = sessionRef.current;
      if (session && document.fullscreenElement === document.documentElement) {
        session.native = true;
      } else if (session?.native) {
        stopTest();
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreen);
    document.querySelector<HTMLElement>('[data-fullscreen-test-exit]')?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, [isActive, stopTest]);

  useEffect(() => () => { releaseSession(); }, [releaseSession]);

  return { isActive, startTest, stopTest };
}
