import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Safely inject the API key
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process.env as an empty object to prevent "Uncaught ReferenceError: process is not defined"
      // This is crucial because some libraries or legacy code might check for process.env
      'process.env': {}
    }
  };
});