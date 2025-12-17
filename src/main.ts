import { createApp } from 'vue'
import App from './App.vue'

// src/main.ts 或 业务项目的 main.ts
import { initRequest, request } from './index' // 引入你的包

// 1. 全局初始化配置
initRequest({
  baseUrl: '/api', // 动态传入 baseUrl

  // 注入 Token
  requestInterceptor: async (config: any) => {
    // 【新增】模拟延迟，用于测试 Loading
    if (config._mockDelay) {
      await new Promise((resolve) => setTimeout(resolve, config._mockDelay))
    }

    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },

  // 注入 UI Loading
  // onShowLoading: () => {},
  // onHideLoading: () => {},

  // 注入全局报错
  responseFail: (err) => {
    // 可以在这里处理 401 跳转
    if (err.response?.status === 401) {
      window.location.href = '/login'
    }
  }
})

// 2. 业务中使用
async function getUser() {
  // 支持重试，支持不显示 loading
  const res = await request.get(
    '/user/info',
    { id: 1 },
    {
      showLoading: false,
      retry: { count: 3, delay: 500 }
    }
  )
  console.log(res)
}

createApp(App).mount('#app')
