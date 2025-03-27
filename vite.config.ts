
import { defineConfig } from "vite";
import path from "path";

// Redirecting vite.config.ts in the root to the app directory
export default defineConfig({
  root: path.resolve(__dirname, "./app"),
  publicDir: path.resolve(__dirname, "./app/public"),
  server: {
    port: 8080
  },
  build: {
    outDir: path.resolve(__dirname, "./dist")
  }
});
