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
      sourcemap: true,
    }
  }
})
