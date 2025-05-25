// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url"; // <--- 1. Import fileURLToPath

// Get the directory name in an ES module environment
const __filename = fileURLToPath(import.meta.url); // <--- 2. Get current file's URL and convert to path
const __dirname = path.dirname(__filename); // <--- 3. Get directory name from the file path

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
