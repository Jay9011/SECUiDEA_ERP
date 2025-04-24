import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const env = loadEnv(mode, __dirname, '')
  const isDevelopment = mode === 'development';

  return {
    plugins: [react()],
    base: '/visit',
    server: {
      port: 3000,
      proxy: isDevelopment ? {
        [env.VITE_API_PREFIX]: {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(new RegExp(`^${env.VITE_API_PREFIX}`), ''),
        }
      } : undefined,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            i18n: ['i18next', 'react-i18next', 'i18next-http-backend', 'i18next-browser-languagedetector'],
          }
        }
      }
    }
  }
})
