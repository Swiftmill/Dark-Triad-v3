import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import HeroVideo from '@components/HeroVideo';
import TitleGlitch from '@components/TitleGlitch';
import GlyphButton from '@components/GlyphButton';
import LinesOverlay from '@components/LinesOverlay';
import NavBar from '@components/NavBar';
import ThemeController from '@components/ThemeController';
import DebugOverlay from '@components/DebugOverlay';
import useCustomCursor from '@hooks/useCustomCursor';
import type { BackgroundSwapResult, ConfigPayload, GlyphDefinition, TimelineCue } from '@types/ipc';

const centerCopy = "The gate to everything divine intellectual and the hidden knowledge laid by the hierarchy to be bestowed upon all who seek the true divine knowledge. Enter the temple now.";

const App = () => {
  const [config, setConfig] = useState<ConfigPayload | null>(null);
  const [currentBackground, setCurrentBackground] = useState<BackgroundSwapResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [themeIntensity, setThemeIntensity] = useState(1);
  const [navVisible, setNavVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);

  useCustomCursor();

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const payload = await window.api.glyphs.load();
        if (!mounted) return;
        setConfig(payload);
        const preferred =
          payload.backgrounds.find((background) => background.id === payload.currentBackgroundId) ??
          payload.backgrounds[0];
        setCurrentBackground(preferred ?? null);
      } finally {
        setLoading(false);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const handleBackgroundSwap = useCallback(async () => {
    const next = await window.api.background.swap({ mode: 'next' });
    setCurrentBackground(next);
    setActionLog((log) => [`background:${next.id}`, ...log].slice(0, 12));
  }, []);

  const glyphs: GlyphDefinition[] = useMemo(() => config?.glyphs ?? [], [config]);
  const timeline: TimelineCue[] = useMemo(() => config?.timeline ?? [], [config]);

  useEffect(() => {
    if (!timeline.length) {
      setNavVisible(true);
      setButtonsVisible(true);
      return;
    }

    setNavVisible(!timeline.some((cue) => cue.action === 'reveal.nav'));
    setButtonsVisible(!timeline.some((cue) => cue.action === 'reveal.buttons'));
  }, [timeline]);

  const handleTimelineEvent = useCallback((action: string) => {
    setActionLog((log) => [`timeline:${action}`, ...log].slice(0, 12));
    if (action === 'reveal.nav') {
      setNavVisible(true);
    }
    if (action === 'reveal.buttons') {
      setButtonsVisible(true);
    }
  }, []);

  if (loading || !config || !currentBackground) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <span className="tracking-[0.6em] text-sm uppercase text-white/60">Invoking the Triad...</span>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      <AnimatePresence mode="wait">
        {currentBackground ? (
          <HeroVideo
            key={currentBackground.id}
            background={currentBackground}
            overlayMultiplier={themeIntensity}
            timeline={timeline}
            onTimelineEvent={handleTimelineEvent}
          />
        ) : null}
      </AnimatePresence>

      <LinesOverlay />
      <NavBar logoSrc={config.logo} onCycle={handleBackgroundSwap} visible={navVisible} />

      <main className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none select-none">
        <TitleGlitch onActivate={handleBackgroundSwap} />
        <p className="max-w-3xl text-center text-sm md:text-base lg:text-lg tracking-[0.35em] uppercase text-white/70 mt-10 px-6">
          {centerCopy}
        </p>
      </main>

      {buttonsVisible && (
        <div className="absolute inset-x-0 bottom-16 flex justify-center z-10 pointer-events-auto">
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
            {glyphs.map((definition) => (
              <GlyphButton
                key={definition.id}
                glyph={definition}
                glyphRate={config.glyphRateMs}
                revealDuration={config.revealDurationMs}
              />
            ))}
          </div>
        </div>
      )}

      <ThemeController value={themeIntensity} onChange={setThemeIntensity} />
      <DebugOverlay
        glyphRate={config.glyphRateMs}
        revealDuration={config.revealDurationMs}
        background={currentBackground}
        actions={actionLog}
      />
    </div>
  );
};

export default App;
