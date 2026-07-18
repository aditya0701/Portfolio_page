import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The single source of truth for the deploy path. `main.tsx` derives the
// router basename from this, so renaming the repo means editing this line
// only. Serving from a user domain (aditya0701.github.io) means base: '/'.
const BASE = '/Portfolio_page/'

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss()],
})
