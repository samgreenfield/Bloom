import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import commonjs from '@rollup/plugin-commonjs'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), commonjs(), tailwindcss()],
  optimizeDeps: {
    include: ['@react-oauth/google', 'jwt-decode']
  },
  server: {
    proxy: {
      "/graphql": {
        target: "http://localhost:8000",
        changeOrigin: true,
      }
    }
  }
})
