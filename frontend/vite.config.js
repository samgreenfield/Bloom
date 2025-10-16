import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import commonjs from '@rollup/plugin-commonjs'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // optimizeDeps: {
  //   include: 'node_modules/**'
  // },
  // // build: {
  // //   rollupOptions: {
  // //     external: [
  // //       '@react-oauth/google' // Add the problematic package here
  // //     ]
  // //   }
  // // }
})