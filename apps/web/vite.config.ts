import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://dustailabs.github.io/Concord/ via GitHub Pages,
// so all asset URLs need the /Concord/ base path in production.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? "/Concord/" : "/",
});
