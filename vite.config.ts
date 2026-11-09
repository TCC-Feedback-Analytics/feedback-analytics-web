import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'child_process';

function getGitVersionTag(): string {
  try {
    return execSync('git describe --tags --abbrev=0', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return 'dev';
  }
}

const gitVersion = getGitVersionTag();


// https://vite.dev/config/
export default defineConfig({
  root: import.meta.dirname,
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(gitVersion),
  },
  build: {
    outDir: path.resolve(import.meta.dirname, './dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      // Os schemas do @feedback/lib-shared (alias `lib`) importam o zod: força o da Web.
      zod: path.resolve(import.meta.dirname, './node_modules/zod'),
      src: path.resolve(import.meta.dirname, './src'),
      layouts: path.resolve(import.meta.dirname, './layouts'),
      pages: path.resolve(import.meta.dirname, './pages'),
      'lib/utils': path.resolve(import.meta.dirname, './src/lib/utils'),
      'lib/constants': path.resolve(import.meta.dirname, './src/lib/constants'),
      lib: path.resolve(import.meta.dirname, './node_modules/@feedback/lib-shared/dist'),
      components: path.resolve(import.meta.dirname, './components'),
      styles: path.resolve(import.meta.dirname, './styles'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(import.meta.dirname, './tests/setup.ts')],
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/utils/**', 'src/routes/**', 'pages/**', 'layouts/**'],
      exclude: ['**/*.test.*', '**/tests/**', '**/node_modules/**'],
    },
  },
});
