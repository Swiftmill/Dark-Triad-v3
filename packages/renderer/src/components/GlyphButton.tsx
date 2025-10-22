import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GlyphDefinition } from '@types/ipc';

type GlyphButtonProps = {
  glyph: GlyphDefinition;
  glyphRate: number;
  revealDuration: number;
};

type DisplayMode = 'glyph' | 'reveal' | 'steady';

const GlyphButton = ({ glyph, glyphRate, revealDuration }: GlyphButtonProps) => {
  const [displayText, setDisplayText] = useState(() => glyph.glyphs[0] ?? glyph.real);
  const [mode, setMode] = useState<DisplayMode>('glyph');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const revealFrame = useRef<number | null>(null);
  const revealStart = useRef<number>(0);
  const revertRef = useRef<NodeJS.Timeout | null>(null);

  const randomGlyph = useCallback(() => {
    return glyph.glyphs[Math.floor(Math.random() * glyph.glyphs.length)] ?? glyph.real;
  }, [glyph.glyphs, glyph.real]);

  useEffect(() => {
    if (mode !== 'glyph') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setDisplayText(randomGlyph());
    }, Math.max(16, glyphRate));

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [mode, glyphRate, randomGlyph]);

  const cancelReveal = () => {
    if (revealFrame.current) {
      cancelAnimationFrame(revealFrame.current);
      revealFrame.current = null;
    }
  };

  const beginGlyphStream = () => {
    setMode('glyph');
    setDisplayText(randomGlyph());
  };

  const animateReveal = useCallback(
    (timestamp: number) => {
      if (!revealStart.current) {
        revealStart.current = timestamp;
      }
      const progress = Math.min(1, (timestamp - revealStart.current) / revealDuration);
      const visibleCharacters = Math.round(glyph.real.length * progress);
      const stable = glyph.real.slice(0, visibleCharacters);
      const remainderCount = Math.max(0, glyph.real.length - visibleCharacters);
      let remainder = '';
      for (let index = 0; index < remainderCount; index += 1) {
        const sample = randomGlyph();
        remainder += sample.charAt(index % sample.length);
      }
      setDisplayText(stable + remainder);

      if (progress >= 1) {
        setDisplayText(glyph.real);
        setMode('steady');
        revealStart.current = 0;
        revealFrame.current = null;
        return;
      }

      revealFrame.current = requestAnimationFrame(animateReveal);
    },
    [glyph.real, randomGlyph, revealDuration]
  );

  const beginReveal = useCallback(() => {
    cancelReveal();
    if (revertRef.current) {
      clearTimeout(revertRef.current);
      revertRef.current = null;
    }
    setMode('reveal');
    revealStart.current = 0;
    revealFrame.current = requestAnimationFrame(animateReveal);
  }, [animateReveal]);

  const scheduleRevert = useCallback(() => {
    if (revertRef.current) {
      clearTimeout(revertRef.current);
    }
    revertRef.current = setTimeout(() => {
      revealStart.current = 0;
      cancelReveal();
      beginGlyphStream();
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (revertRef.current) {
        clearTimeout(revertRef.current);
      }
      cancelReveal();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <motion.button
      type="button"
      className="relative px-5 py-3 rounded-xl border border-white/15 bg-white/5 backdrop-blur hover:bg-white/15 hover:text-triadGold-light transition-all duration-200 uppercase tracking-[0.4em] text-xs"
      onPointerEnter={beginReveal}
      onFocus={beginReveal}
      onPointerLeave={scheduleRevert}
      onBlur={scheduleRevert}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative z-10 whitespace-nowrap">{displayText}</span>
      <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  );
};

export default GlyphButton;
