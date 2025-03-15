import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react-dom/client": "react-dom",
    },
  },
  build: {
    outDir: 'dist',
  },
});
