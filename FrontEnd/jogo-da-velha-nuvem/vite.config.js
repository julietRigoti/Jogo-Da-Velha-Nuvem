import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Carrega o arquivo .env.nuvem
dotenv.config({ path: '.env.production' });

const url = process.env.VITE_REACT_APP_BACKEND_URL_NUVEM;
console.log('URL do backend:', url);

if (!url) {
  console.warn('⚠️ A variável VITE_REACT_APP_BACKEND_URL_NUVEM não está definida no arquivo .env.nuvem');
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    proxy: url && url.startsWith('http')
      ? {
          '/auth': {
            target: url,
            changeOrigin: true,
            secure: false,
          },
        }
      : undefined,
    build: {
      outDir: '../dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          vendor: ['react', 'react-dom'], // Divide dependências em chunks separados
        },
      },
    },
  },
  plugins: [react()],
});