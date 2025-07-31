import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "src/client"), // safer than "./src/client"
  plugins: [react()],
  envDir: path.resolve(__dirname),
  build: {
    outDir: "dist", // ✅ This stays inside src/client
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/client"),
    },
  },
});
