import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Репозиторий называется volgin07rus-ai.github.io — это пользовательский сайт,
  // он отдаётся с корня домена. Отдельный base для Pages больше не нужен.
  base: '/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5181,
  },
})
