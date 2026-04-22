import { defineConfig } from 'vite'
import { createVuePlugin as vue2 } from 'vite-plugin-vue2'
import { resolve } from 'path'

export default defineConfig({
  base: '/legacy/',
  plugins: [vue2()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        pricing: resolve(__dirname, 'pricing/index.html'),
      },
    },
  },
})
