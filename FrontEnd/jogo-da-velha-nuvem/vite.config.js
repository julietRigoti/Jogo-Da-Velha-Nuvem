import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Carrega o arquivo .env.nuvem
dotenv.config({ path: '.env.nuvem' });

const url = process.env.VITE_REACT_APP_BACKEND_URL_NUVEM;

if (!url) {
  console.warn('⚠️ A variável VITE_REACT_APP_BACKEND_URL_NUVEM não está definida no arquivo .env.nuvem');
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: url
      ? {
          '/auth': {
            target: url,
            changeOrigin: true,
            secure: false,
          },
        }
      : undefined,
  },
  plugins: [react()],
});