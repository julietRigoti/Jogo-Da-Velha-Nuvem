import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL_NUVEM;
console.log('URL do backend:', backendUrl);

if (!backendUrl) {
  console.warn('⚠️ A variável VITE_REACT_APP_BACKEND_URL_NUVEM não está definida no arquivo .env.production');
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    proxy:backendUrl && backendUrl.startsWith('http')
      ? {
          '/auth': {
            target: backendUrl,
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