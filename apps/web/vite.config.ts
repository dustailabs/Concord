import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://dustailabs.github.io/concord/ via GitHub Pages,
// so all asset URLs need the /concord/ base path in production.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? "/concord/" : "/",
});
