import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The app is served from mythwired.com/blackstone/. Assets are built into
// dist/blackstone/ with absolute /blackstone/ URLs, so the same build works when this
// Vercel project owns the domain and when another site proxies /blackstone to it.
// BASE can override this (e.g. BASE=./ for a standalone preview).
const base = process.env.BASE || '/blackstone/'

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    outDir: base === '/blackstone/' ? 'dist/blackstone' : 'dist',
    emptyOutDir: true,
  },
})
