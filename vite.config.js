import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const configuredBase = '/branch';
  const base = configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`;
  return { plugins: [react()], base };
});
