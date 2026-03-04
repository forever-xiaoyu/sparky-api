import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 没有附带 .d.ts 类型声明文件，其他项目引用时无法类型推导
    dts({
      insertTypesEntry: true, // 自动生成类型入口文件，保证 npm 包类型可正确推导
      include: ['src/**/*.ts', 'src/**/*.d.ts', 'src/**/*.vue']
    })
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
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://11wa768fa5711.vicp.fun', // 你的真实后端 API 地址
        changeOrigin: true, // 必须设置为 true，以解决跨域问题
        rewrite: (path) => path.replace(/^\/api/, '') // 重写路径，去掉 /api 前缀
      }
    }
  }
})
