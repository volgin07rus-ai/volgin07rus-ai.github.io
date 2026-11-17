import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5186 },
  build: {
    rollupOptions: {
      output: {
        // Движок Spline для пропуска в подвале лежит под постоянными именами:
        // так BadgeHang может заранее скачать его по известному адресу.
        // Версия движка закреплена в package-lock, кэш от этого не путается
        chunkFileNames: (chunk) =>
          chunk.moduleIds.some((id) => id.includes('@splinetool')) ? 'assets/spline/[name].js' : 'assets/[name]-[hash].js',
      },
    },
  },
})
