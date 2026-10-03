import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // 相对路径，部署在 GitHub Pages 的任意子路径下都能正常加载
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@mp': fileURLToPath(new URL('../miniprogram', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { port: 5178 },
})
