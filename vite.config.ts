import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' erzeugt relative Asset-Pfade, damit das Deployment unter einem
// GitHub-Pages-Unterpfad (https://<user>.github.io/<repo>/) funktioniert,
// ohne den Repo-Namen fest verdrahten zu müssen. Siehe docs/adr/0004-hosting.md
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
