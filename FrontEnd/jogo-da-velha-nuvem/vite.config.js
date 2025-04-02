import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do arquivo correto (.env ou .env.production)
  const env = loadEnv(mode, process.cwd(), "");

  const backendUrl = env.VITE_REACT_APP_BACKEND_URL || "";

  if (!backendUrl) {
    console.warn("⚠️ A variável VITE_REACT_APP_BACKEND_URL não está definida.");
  }

  return {
    server: {
      host: "0.0.0.0",
      proxy: backendUrl.startsWith("http")
        ? {
            "/auth": {
              target: backendUrl,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
          },
        },
      },
    },
    plugins: [react()],
  };
});
