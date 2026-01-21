import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/psci107-spring2026-slides/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        '0120': resolve(__dirname, 'presentations/0120-course-essentials.html'),
        '0122': resolve(__dirname, 'presentations/0122-ppt-what-why.html'),
        // Add more presentations here as you create them
      },
    },
  },
});
