import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://metrics.devoltaaojogo.com',
        changeOrigin: true,
        secure: true,
        headers: {
          'x-api-key': 'MAaDylN2bs0Y01Ep66' // Utilizando a chave já presente no código
        }
      }
    }
  }
})