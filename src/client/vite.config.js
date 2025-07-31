// src/client/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname), // now client folder is root
  build: {
    outDir: "dist", // will generate dist/ inside client
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
