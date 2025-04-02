import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

const url = 
    process.env.NODE_ENV === "development"
    ? process.env.VITE_REACT_APP_BACKEND_URL_LOCAL
    : process.env.VITE_REACT_APP_BACKEND_URL_NUVEM;

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