import { useEffect, useRef, useState } from 'react';
import type { BackgroundSwapResult } from '@types/ipc';

type DebugOverlayProps = {
  glyphRate: number;
  revealDuration: number;
  background: BackgroundSwapResult;
  actions: string[];
};

const DebugOverlay = ({ glyphRate, revealDuration, background, actions }: DebugOverlayProps) => {
  const [fps, setFps] = useState(0);
  const frameRef = useRef<number>();
  const lastRef = useRef(performance.now());
  const frames = useRef(0);

  useEffect(() => {
    const update = (now: number) => {
      frames.current += 1;
      const delta = now - lastRef.current;
      if (delta >= 500) {
        setFps(Math.round((frames.current / delta) * 1000));
        frames.current = 0;
        lastRef.current = now;
      }
      frameRef.current = requestAnimationFrame(update);
    };
    frameRef.current = requestAnimationFrame(update);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <aside className="absolute left-10 bottom-10 z-20 bg-black/60 border border-white/10 backdrop-blur-lg rounded-2xl px-5 py-4 text-[0.65rem] uppercase tracking-[0.35em] text-white/60 w-64">
      <div className="flex justify-between">
        <span>FPS</span>
        <span className="text-white/80">{fps}</span>
      </div>
      <div className="flex justify-between mt-2">
        <span>Glyph Rate</span>
        <span className="text-white/80">{glyphRate}ms</span>
      </div>
      <div className="flex justify-between mt-2">
        <span>Reveal</span>
        <span className="text-white/80">{revealDuration}ms</span>
      </div>
      <div className="mt-3 border-t border-white/10 pt-3 text-[0.6rem] tracking-[0.3em]">
        <div className="flex justify-between">
          <span>Background</span>
          <span className="text-white/80">{background.id}</span>
        </div>
        <div className="mt-2 space-y-1 max-h-24 overflow-hidden text-white/50">
          {actions.slice(0, 4).map((action, index) => (
            <div key={`${action}-${index}`}>{action}</div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default DebugOverlay;
