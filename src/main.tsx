import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill window.matchMedia and browser events for iframe and legacy browser compatibility
if (typeof window !== 'undefined') {
  if (!window.matchMedia || typeof window.matchMedia !== 'function') {
    window.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      emit: () => {},
    }) as any;
  } else {
    const origMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) => {
      try {
        const res = origMatchMedia.call(window, query);
        if (res) {
          if (typeof res.addListener !== 'function') {
            res.addListener = (listener: any) => {
              if (res.addEventListener) res.addEventListener('change', listener);
            };
          }
          if (typeof res.removeListener !== 'function') {
            res.removeListener = (listener: any) => {
              if (res.removeEventListener) res.removeEventListener('change', listener);
            };
          }
          if (typeof (res as any).emit !== 'function') {
            (res as any).emit = () => {};
          }
          return res;
        }
      } catch (e) {
        // Fallback for iframe restrictions
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
        emit: () => {},
      } as any;
    };
  }

  // Screen orientation guard
  if (!window.screen) {
    (window as any).screen = {};
  }
  if (!window.screen.orientation) {
    (window as any).screen.orientation = {
      angle: 0,
      type: 'landscape-primary',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      emit: () => {},
    };
  } else {
    if (typeof (window.screen.orientation as any).addListener !== 'function') {
      (window.screen.orientation as any).addListener = () => {};
    }
    if (typeof (window.screen.orientation as any).emit !== 'function') {
      (window.screen.orientation as any).emit = () => {};
    }
  }

  // Visual Viewport guard
  if (window.visualViewport) {
    if (typeof (window.visualViewport as any).addListener !== 'function') {
      (window.visualViewport as any).addListener = (listener: any) => {
        window.visualViewport?.addEventListener('resize', listener);
      };
    }
    if (typeof (window.visualViewport as any).emit !== 'function') {
      (window.visualViewport as any).emit = () => {};
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
