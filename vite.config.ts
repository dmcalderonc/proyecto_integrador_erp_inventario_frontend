/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const apiRoutes = [
  '/auth', '/users', '/bodegas', '/categorias', '/materiales',
  '/inventario', '/movimientos', '/proveedores', '/proyectos',
  '/requirements', '/compras', '/ajustes-inventario',
  '/cotizaciones', '/solicitudes-compra', '/despachos', '/dashboard',
]

function createProxy() {
  const proxy: Record<string, any> = {}
  for (const route of apiRoutes) {
    proxy[route] = {
      target: 'http://localhost:3000',
      bypass: (req: { headers: { accept?: string } }) => {
        if (req.headers.accept?.includes('text/html')) {
          return '/index.html'
        }
      },
    }
  }
  return proxy
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: createProxy(),
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['src/api/http.ts', 'src/test/**'],
      thresholds: {
        statements: 75,
        branches: 75,
        functions: 75,
        lines: 75
      }
    }
  }
})