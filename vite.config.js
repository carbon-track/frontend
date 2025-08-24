import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import checker from 'vite-plugin-checker'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // Run ESLint checker only during dev (serve) so production build won't fail on lint errors
    command === 'serve' && checker({ eslint: { lintCommand: 'eslint . --ext .js,.jsx' } }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
