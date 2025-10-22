import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import Store from 'electron-store';
import { z } from 'zod';

const GlyphSchema = z.object({
  id: z.string(),
  real: z.string(),
  glyphs: z.array(z.string()).min(1)
});

const BackgroundSchema = z.object({
  id: z.string(),
  file: z.string(),
  type: z.enum(['video', 'image']),
  label: z.string().optional(),
  overlayIntensity: z.number().min(0).max(1).optional()
});

const ConfigSchema = z.object({
  glyphRateMs: z.number().min(16).max(2000).default(70),
  revealDurationMs: z.number().min(100).max(5000).default(900)
});

const TimelineSchema = z.array(
  z.object({
    at: z.number().min(0),
    action: z.string(),
    payload: z.record(z.any()).optional()
  })
);

const store = new Store<{ lastBackgroundId?: string }>({ name: 'triad-preferences' });

let mainWindow: BrowserWindow | null = null;
let resourcesPath: string;
let backgrounds: z.infer<typeof BackgroundSchema>[] = [];
let glyphs: z.infer<typeof GlyphSchema>[] = [];
let config: z.infer<typeof ConfigSchema> = { glyphRateMs: 70, revealDurationMs: 900 };
let timeline: z.infer<typeof TimelineSchema> = [];

const ensureResourcesPath = () => {
  if (!resourcesPath) {
    resourcesPath = app.isPackaged
      ? join(process.resourcesPath, 'resources')
      : join(app.getAppPath(), 'resources');
  }
  return resourcesPath;
};

const resolveResourcePath = (...segments: string[]) => {
  const base = ensureResourcesPath();
  return resolve(base, ...segments);
};

const resourceToFileUrl = (filePath: string) => {
  return pathToFileURL(filePath).toString();
};

const getLogoResource = () => {
  const logoPath = resolveResourcePath('logo-triangle.png');
  if (existsSync(logoPath)) {
    return resourceToFileUrl(logoPath);
  }
  return undefined;
};

async function readJsonFile<T>(fileName: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  const target = resolveResourcePath(fileName);
  try {
    const raw = await readFile(target, 'utf8');
    const parsed = JSON.parse(raw);
    return schema.parse(parsed);
  } catch (error) {
    console.warn(`[triad] Failed to read ${fileName}:`, error);
    return fallback;
  }
}

async function bootstrapResources() {
  const resourceDir = ensureResourcesPath();
  if (!existsSync(resourceDir)) {
    mkdirSync(resourceDir, { recursive: true });
  }

  const glyphFallback = [
    { id: 'intro', real: 'ENTER TEMPLE', glyphs: ['ꖦꗃꕥ', 'ᚷᛃᛞ', '𐌂𐌂𐌂', '⛧⸸⛧', 'シ卍ネ'] },
    { id: 'triad', real: 'THE DARK TRIAD', glyphs: ['⎔⟟⟊', '𐍉𐍊𐌼', '卄丶乂', '₪✠₪', 'ᚾᛁᛟ'] },
    { id: 'library', real: 'LIBRARY', glyphs: ['◬◩◪', 'ϞϟϞ', '₪₪₪', '卐卍卐', '☿☌☍'] }
  ];

  const backgroundFallback = [
    { id: 'hero1', file: 'hero1.mp4', type: 'video', label: 'Incantation I', overlayIntensity: 0.55 },
    { id: 'hero2', file: 'hero2.mp4', type: 'video', label: 'Incantation II', overlayIntensity: 0.5 },
    { id: 'fallback', file: 'hero-fallback.jpg', type: 'image', label: 'Obelisk Still', overlayIntensity: 0.65 }
  ];

  glyphs = await readJsonFile('glyphs.json', z.array(GlyphSchema), glyphFallback);
  backgrounds = await readJsonFile('backgrounds.json', z.array(BackgroundSchema), backgroundFallback);
  config = await readJsonFile('config.json', ConfigSchema, { glyphRateMs: 70, revealDurationMs: 900 });
  timeline = await readJsonFile('timeline.json', TimelineSchema, []);
}

const getBackgroundById = (id?: string) => {
  if (!id) return backgrounds[0];
  return backgrounds.find((entry) => entry.id === id) ?? backgrounds[0];
};

const emitBackgroundPayload = (entry: z.infer<typeof BackgroundSchema>) => {
  const resourcePath = resolveResourcePath(entry.file);
  return {
    id: entry.id,
    file: resourceToFileUrl(resourcePath),
    type: entry.type,
    label: entry.label,
    overlayIntensity: entry.overlayIntensity ?? 0.5
  };
};

const cycleBackground = (mode: 'next' | 'previous' | 'set', id?: string) => {
  if (!backgrounds.length) {
    throw new Error('No backgrounds available.');
  }

  if (mode === 'set' && id) {
    const entry = getBackgroundById(id);
    store.set('lastBackgroundId', entry.id);
    return entry;
  }

  const currentId = store.get('lastBackgroundId') ?? backgrounds[0].id;
  const currentIndex = backgrounds.findIndex((b) => b.id === currentId);
  if (currentIndex === -1) {
    store.set('lastBackgroundId', backgrounds[0].id);
    return backgrounds[0];
  }

  if (mode === 'previous') {
    const previous = backgrounds[(currentIndex - 1 + backgrounds.length) % backgrounds.length];
    store.set('lastBackgroundId', previous.id);
    return previous;
  }

  const next = backgrounds[(currentIndex + 1) % backgrounds.length];
  store.set('lastBackgroundId', next.id);
  return next;
};

async function createWindow() {
  await bootstrapResources();

  nativeTheme.themeSource = 'dark';

  mainWindow = new BrowserWindow({
    width: 1480,
    height: 900,
    minWidth: 1200,
    minHeight: 720,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    show: false,
    title: 'THE DARK TRIAD',
    webPreferences: {
      preload: join(__dirname, '../../preload/dist/index.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      devTools: !app.isPackaged
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    await mainWindow.loadURL(devServerUrl);
  } else {
    const indexHtml = join(__dirname, '../../renderer/dist/index.html');
    await mainWindow.loadFile(indexHtml);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow().catch((error) => {
    console.error('Failed to create window', error);
    app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow().catch(console.error);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const BackgroundSwapPayloadSchema = z
  .object({
    mode: z.enum(['next', 'previous', 'set']).default('next'),
    id: z.string().optional()
  })
  .optional();

ipcMain.handle('glyphs:load', async () => {
  const lastBackgroundId = store.get('lastBackgroundId');
  const backgroundPayload = emitBackgroundPayload(getBackgroundById(lastBackgroundId));

  return {
    glyphRateMs: config.glyphRateMs,
    revealDurationMs: config.revealDurationMs,
    glyphs,
    backgrounds: backgrounds.map(emitBackgroundPayload),
    timeline,
    currentBackgroundId: backgroundPayload.id,
    logo: getLogoResource()
  };
});

ipcMain.handle('background:swap', async (_event, rawPayload) => {
  const parsed = BackgroundSwapPayloadSchema.parse(rawPayload ?? {});
  const entry = cycleBackground(parsed.mode ?? 'next', parsed.id);
  return emitBackgroundPayload(entry);
});

ipcMain.handle('timeline:play', async () => {
  return timeline;
});
