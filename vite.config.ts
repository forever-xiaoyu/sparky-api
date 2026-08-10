import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

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
      entry: './src/index.ts',
      name: 'sparkyie/api',
      fileName: 'sparkyie-api',
      formats: ['es']
    },
    rollupOptions: {
      external: ['axios', 'vue'],
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
        target: 'https://11wa768fa5711.vicp.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
