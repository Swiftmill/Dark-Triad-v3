import { useEffect } from 'react';

const useCustomCursor = () => {
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const handleMove = (event: PointerEvent) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    };

    const handleDown = () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    };

    const handleUp = () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      cursor.remove();
    };
  }, []);
};

export default useCustomCursor;
