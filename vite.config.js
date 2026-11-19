import { defineConfig } from 'vite';

export default defineConfig({
  base: '/rootnote-converter/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020'
  }
});