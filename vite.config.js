import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/psci107-spring2026-slides/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        jan20: resolve(__dirname, 'presentations/jan20-essentials.html'),
        jan22: resolve(__dirname, 'presentations/jan22-ppt.html'),
        // Add more presentations here as you create them
      },
    },
  },
});
