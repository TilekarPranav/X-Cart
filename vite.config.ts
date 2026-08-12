import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"
import { copyFileSync, existsSync } from "node:fs"

function spaFallback() {
  return {
    name: "spa-fallback",
    closeBundle() {
      const index = path.resolve(__dirname, "dist/index.html")
      const notFound = path.resolve(__dirname, "dist/404.html")
      if (existsSync(index)) {
        copyFileSync(index, notFound)
        console.log("✓ Created dist/404.html (SPA fallback)")
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), spaFallback()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: true,
  },
})
