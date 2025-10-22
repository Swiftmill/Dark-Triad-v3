import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import type { BackgroundSwapResult, TimelineCue } from '@types/ipc';

type HeroVideoProps = {
  background: BackgroundSwapResult;
  overlayMultiplier?: number;
  timeline: TimelineCue[];
  onTimelineEvent?: (action: string, payload?: Record<string, unknown>) => void;
};

type VideoWithRequestCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    callback: (now: number, metadata: { mediaTime: number }) => void
  ) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

const HeroVideo = ({ background, overlayMultiplier = 1, timeline, onTimelineEvent }: HeroVideoProps) => {
  const videoRef = useRef<VideoWithRequestCallback | null>(null);
  const triggeredRef = useRef(new Set<string>());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const overlayOpacity = useMemo(() => {
    const base = background.overlayIntensity ?? 0.55;
    return Math.min(1, Math.max(0, base * overlayMultiplier));
  }, [background.overlayIntensity, overlayMultiplier]);

  useEffect(() => {
    triggeredRef.current.clear();
  }, [background.id, timeline]);

  useEffect(() => {
    if (background.type !== 'video') {
      if (timeline.length) {
        timeline
          .filter((cue) => cue.at === 0)
          .forEach((cue) => onTimelineEvent?.(cue.action, cue.payload));
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const sortedCues = [...timeline].sort((a, b) => a.at - b.at);
    const dispatched = triggeredRef.current;

    const dispatch = (currentTime: number) => {
      for (const cue of sortedCues) {
        if (currentTime >= cue.at && !dispatched.has(cue.action)) {
          dispatched.add(cue.action);
          onTimelineEvent?.(cue.action, cue.payload);
        }
      }
    };

    const useRequestCallback = typeof video.requestVideoFrameCallback === 'function';

    if (useRequestCallback) {
      let handle = 0;
      const step = (_now: number, metadata: { mediaTime: number }) => {
        dispatch(metadata.mediaTime);
        handle = video.requestVideoFrameCallback!(step);
      };
      handle = video.requestVideoFrameCallback!(step);
      return () => {
        if (handle && typeof video.cancelVideoFrameCallback === 'function') {
          video.cancelVideoFrameCallback(handle);
        }
      };
    }

    intervalRef.current = setInterval(() => {
      if (!video) return;
      dispatch(video.currentTime);
    }, 120);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [background, timeline, onTimelineEvent]);

  useEffect(() => {
    if (background.type !== 'video') return;
    const element = videoRef.current;
    if (!element) return;

    element.currentTime = 0;

    const attemptPlay = async () => {
      try {
        await element.play();
      } catch (error) {
        console.warn('[triad] video playback blocked', error);
      }
    };

    if (element.readyState >= 2) {
      void attemptPlay();
    } else {
      const onCanPlay = () => void attemptPlay();
      element.addEventListener('canplay', onCanPlay, { once: true });
      return () => {
        element.removeEventListener('canplay', onCanPlay);
      };
    }
  }, [background]);

  return (
    <motion.div
      key={background.id}
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {background.type === 'video' ? (
        <video
          ref={videoRef}
          src={background.file}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img src={background.file} alt={background.label ?? background.id} className="w-full h-full object-cover" />
      )}

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(246, 200, 76, 0.1), transparent 55%)',
        }}
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 3.6, repeat: Infinity }}
      />

      <div
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/55 to-black"
        style={{ opacity: overlayOpacity }}
      />

      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-screen bg-white/5"
        initial={{ opacity: 0.05 }}
        animate={{ opacity: [0.08, 0.16, 0.08] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
};

export default HeroVideo;
