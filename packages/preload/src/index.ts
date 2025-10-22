import { contextBridge, ipcRenderer } from 'electron';
import { z } from 'zod';

const GlyphSchema = z.object({
  id: z.string(),
  real: z.string(),
  glyphs: z.array(z.string())
});

const BackgroundSchema = z.object({
  id: z.string(),
  file: z.string(),
  type: z.enum(['video', 'image']),
  label: z.string().optional(),
  overlayIntensity: z.number().optional()
});

const ConfigSchema = z.object({
  glyphRateMs: z.number(),
  revealDurationMs: z.number(),
  glyphs: z.array(GlyphSchema),
  backgrounds: z.array(BackgroundSchema),
  timeline: z.array(
    z.object({
      at: z.number(),
      action: z.string(),
      payload: z.record(z.any()).optional()
    })
  ),
  currentBackgroundId: z.string().optional(),
  logo: z.string().optional()
});

const BackgroundSwapRequestSchema = z
  .object({
    mode: z.enum(['next', 'previous', 'set']).optional(),
    id: z.string().optional()
  })
  .optional();

contextBridge.exposeInMainWorld('api', {
  glyphs: {
    load: async () => {
      const response = await ipcRenderer.invoke('glyphs:load');
      return ConfigSchema.parse(response);
    }
  },
  background: {
    swap: async (payload?: { mode?: 'next' | 'previous' | 'set'; id?: string }) => {
      const body = BackgroundSwapRequestSchema.parse(payload);
      const response = await ipcRenderer.invoke('background:swap', body);
      return BackgroundSchema.parse(response);
    }
  },
  timeline: {
    play: async () => {
      const response = await ipcRenderer.invoke('timeline:play');
      return ConfigSchema.shape.timeline.parse(response);
    }
  }
});

export {}; 
