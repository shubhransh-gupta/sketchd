/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';
  return {
    base: isGitHubPages ? '/FixFR/' : '/',
    plugins: [react()],
    test: { globals: true, environment: 'node' },
    server: { port: 5173 },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('leaflet')) return 'leaflet';
          },
        },
      },
    },
  };
});
