import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    // 1. Output the build directly into a local 'dist' folder
    outDir: 'dist', 
    // 2. Clear the folder before building (fixes the warning)
    emptyOutDir: true, 
    sourcemap: false,
  }
});
