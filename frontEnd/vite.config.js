import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:8080",
        ws: true, // Ativa suporte a WebSocket
        changeOrigin: true,
      },
    },
  },
});
