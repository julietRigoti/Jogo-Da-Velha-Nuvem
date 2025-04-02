import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isLocal = process.env.VITE_REACT_APP_ENV === 'local';

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: isLocal
      ? {
          '/auth': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          },
        }
      : undefined,
  },
  plugins: [react()],
});