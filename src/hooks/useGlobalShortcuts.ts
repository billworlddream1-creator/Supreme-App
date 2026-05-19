import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const bufferRef = useRef<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl and Alt are pressed
      if (!e.ctrlKey || !e.altKey) {
        // If they release Ctrl or Alt, we could clear the buffer, but let's let the timeout handle it
        return;
      }

      // Ignore if it's just the modifier keys
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        return;
      }

      // Don't trigger if typing in an input field
      const activeElement = document.activeElement as HTMLElement;
      if (
        activeElement &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) ||
          activeElement.isContentEditable)
      ) {
        return;
      }

      e.preventDefault();

      if (e.repeat) return;

      const key = e.key.toLowerCase();
      bufferRef.current.push(key);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const combo = bufferRef.current.join('+');
        bufferRef.current = []; // Reset buffer

        switch (combo) {
          case 'g':
            navigate('/supreme-gmt');
            break;
          case 'c':
            navigate('/supreme-core');
            break;
          case 'b':
            navigate('/celeb-hub');
            break;
          case 'n':
            navigate('/network');
            break;
          case 'm':
            navigate('/market');
            break;
          case 'a':
            navigate('/media');
            break;
          case 'd':
            navigate('/discover');
            break;
          case 'a+i':
          case 'i+a':
            navigate('/ai-tools');
            break;
          case 'p':
            navigate('/project-power');
            break;
          case 's':
            navigate('/streams');
            break;
          case 'c+h':
          case 'h+c':
            navigate('/chat');
            break;
          case 'i':
            navigate('/industrial-tools');
            break;
          case 'b+t':
          case 't+b':
            navigate('/business-tools');
            break;
          case 'b+p':
          case 'p+b':
            navigate('/pricing');
            break;
          case 'a+m':
          case 'm+a':
            navigate('/ads');
            break;
          case 'w':
            navigate('/wallet');
            break;
          case 'c+c':
            navigate('/content-creator');
            break;
          case 'h':
            navigate('/');
            break;
          case 'g+m':
          case 'm+g':
            navigate('/supreme-mode');
            break;
          case 'h+h':
            navigate('/heart-to-heart');
            break;
        }
      }, 400); // 400ms window to complete the chord
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [navigate]);
}
