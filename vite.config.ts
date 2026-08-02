import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The single source of truth for the deploy path. `main.tsx` derives the
// router basename from this, so the deploy path lives in one place only.
// Served from the custom domain adityarawat.de, where GitHub Pages puts the
// repo at the domain root — hence '/', not the old '/Portfolio_page/' subpath
// that a project page under aditya0701.github.io required.
const BASE = '/'

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss()],
})
