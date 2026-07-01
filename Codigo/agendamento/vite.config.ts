import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    hmr: { clientPort: 5173 },
    // Proxy para evitar CORS: todas as rotas do backend são redirecionadas ao Spring Boot
    proxy: {
      '/aula':             { target: 'http://localhost:8080', changeOrigin: true },
      '/aluno':            { target: 'http://localhost:8080', changeOrigin: true },
      '/auth':             { target: 'http://localhost:8080', changeOrigin: true },
      '/credito-reposicao': { target: 'http://localhost:8080', changeOrigin: true },
      '/disponibilidade':  { target: 'http://localhost:8080', changeOrigin: true },
      '/reposicao':        { target: 'http://localhost:8080', changeOrigin: true },
      '/upload-modulo':    { target: 'http://localhost:8080', changeOrigin: true },
      '/google':           { target: 'http://localhost:8080', changeOrigin: true },
      '/chat':             { target: 'http://localhost:8080', changeOrigin: true },
      '/notificacao':      { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})
