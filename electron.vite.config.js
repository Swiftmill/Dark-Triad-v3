import { defineConfig } from 'electron-vite';
import { resolve } from 'node:path';

export default defineConfig({
  main: {
    entry: resolve(__dirname, 'packages/main/src/index.ts'),
  },
  preload: {
    input: {
      index: resolve(__dirname, 'packages/preload/src/index.ts')
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'packages/renderer/src')
      }
    }
  }
});
