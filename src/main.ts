import { createApp } from 'vue'
import App from './App.vue'
import { initRequest } from './index'

initRequest({
  baseUrl: '/api',
  requestSuccess: async (config) => {
    // 仅用于本地示例，确保能观察到默认 Loading；构建库时不会包含此入口。
    if (import.meta.env.DEV) {
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  responseSuccess: (response) => {
    const code = response.data?.code
    return code === 0 || code === 200
  },
  responseFail: (error) => console.error('Request failed:', error)
})

createApp(App).mount('#app')
