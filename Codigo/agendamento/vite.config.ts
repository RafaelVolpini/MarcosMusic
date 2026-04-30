import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy para evitar CORS: todas as rotas do backend são redirecionadas ao Spring Boot
    proxy: {
      '/aula':             { target: 'http://localhost:8080', changeOrigin: true },
      '/aluno':            { target: 'http://localhost:8080', changeOrigin: true },
      '/auth':             { target: 'http://localhost:8080', changeOrigin: true },
      '/disponibilidade':  { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})
