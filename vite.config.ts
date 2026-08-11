/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sketchdApiMiddleware } from './vite-plugin-api.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';

  // Make GitHub env vars available to dev API middleware
  process.env.GITHUB_TOKEN = env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  process.env.GITHUB_REPO = env.GITHUB_REPO || process.env.GITHUB_REPO;
  process.env.GITHUB_BRANCH = env.GITHUB_BRANCH || process.env.GITHUB_BRANCH;
  process.env.SITE_URL = env.SITE_URL || process.env.SITE_URL;

  return {
    base: isGitHubPages ? '/sketchd/' : '/',
    plugins: [
      react(),
      {
        name: 'sketchd-api',
        configureServer(server) {
          server.middlewares.use(sketchdApiMiddleware());
        },
      },
    ],
    define: {
      'import.meta.env.VITE_SITE_URL': JSON.stringify(
        env.VITE_SITE_URL || process.env.VITE_SITE_URL || '',
      ),
      'import.meta.env.VITE_DRAWINGS_RAW_BASE': JSON.stringify(
        env.VITE_DRAWINGS_RAW_BASE || process.env.VITE_DRAWINGS_RAW_BASE || '',
      ),
      'import.meta.env.VITE_GITHUB_REPO': JSON.stringify(
        env.VITE_GITHUB_REPO || 'shubhransh-gupta/sketchd',
      ),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
    server: {
      port: 5173,
    },
  };
});
