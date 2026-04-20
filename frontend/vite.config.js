import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      // Helper for local development; point to your backend.
      "/api": "http://localhost:8080",
    },
  },
});

