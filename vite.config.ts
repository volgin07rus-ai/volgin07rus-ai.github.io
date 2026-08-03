import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // На GitHub Pages сайт живёт по адресу /volgin-portfolio/, локально — по /
  base: process.env.GITHUB_ACTIONS ? '/volgin-portfolio/' : '/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5181,
  },
})
