import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: './src/index.ts', // 入口文件
      name: 'sparkyie/api',
      fileName: 'sparkyie-api',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 你的真实后端 API 地址
        changeOrigin: true, // 必须设置为 true，以解决跨域问题
        rewrite: (path) => path.replace(/^\/api/, '') // 重写路径，去掉 /api 前缀
      }
    }
  },
})
