import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts') || id.includes('d3')) {
                return 'charts-vendor';
              }
              if (id.includes('firebase')) {
                return 'firebase-vendor';
              }
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'pdf-vendor';
              }
              if (id.includes('quill')) {
                return 'editor-vendor';
              }
              return 'vendor';
            }
          },
          chunkFileNames: (chunkInfo) => {
            const safeName = chunkInfo.name.replace(/error/gi, 'err');
            return `assets/${safeName}-[hash].js`;
          },
          entryFileNames: (chunkInfo) => {
            const safeName = chunkInfo.name.replace(/error/gi, 'err');
            return `assets/${safeName}-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name) {
              const safeName = assetInfo.name.replace(/error/gi, 'err');
              return `assets/${safeName}`;
            }
            return 'assets/[name]-[hash][extname]';
          },
        }
      }
    }
  };
});
