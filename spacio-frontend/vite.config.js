import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  server: {
    https: true,
    proxy: {
      '/api': {
        target: 'https://localhost:2005',
        changeOrigin: true,
        secure: false, // Accept self-signed certs
      },
    },
  },
    build: {
    sourcemap: false,  
    minify: 'esbuild', //  Obfuscate output
  },
  plugins: [react(), mkcert(), tailwindcss()],
});
