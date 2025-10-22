export interface GlyphDefinition {
  id: string;
  real: string;
  glyphs: string[];
}

export interface BackgroundDefinition {
  id: string;
  label?: string;
  file: string;
  type: 'video' | 'image';
  overlayIntensity?: number;
}

export interface TimelineCue {
  at: number;
  action: string;
  payload?: Record<string, unknown>;
}

export interface ConfigPayload {
  glyphRateMs: number;
  revealDurationMs: number;
  glyphs: GlyphDefinition[];
  backgrounds: BackgroundDefinition[];
  timeline: TimelineCue[];
  currentBackgroundId?: string;
  logo?: string;
}

export interface BackgroundSwapResult {
  id: string;
  file: string;
  type: 'video' | 'image';
  label?: string;
  overlayIntensity?: number;
}
