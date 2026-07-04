import { defineConfig } from 'vite';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  // Match your GitHub repo name for GitHub Pages (see README).
  base: process.env.GITHUB_PAGES === 'true' ? '/post-date-debrief/' : '/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      input: 'index.html',
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
