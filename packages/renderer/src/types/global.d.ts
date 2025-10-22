import type { BackgroundSwapResult, ConfigPayload, TimelineCue } from './ipc';

declare global {
  interface Window {
    api: {
      glyphs: {
        load: () => Promise<ConfigPayload>;
      };
      background: {
        swap: (payload?: { mode?: 'next' | 'previous' | 'set'; id?: string }) => Promise<BackgroundSwapResult>;
      };
      timeline: {
        play: () => Promise<TimelineCue[]>;
      };
    };
  }
}

export {};
