import type { AxiosError, AxiosInstance } from 'axios'
import type { CustomRequestConfig } from '../types'

/**
 * 判断是否应该重试
 * @param error Axios 错误对象
 * @param config 自定义请求配置
 */
function shouldRetry(error: AxiosError, config?: CustomRequestConfig): boolean {
  const retryConfig = config?.retry
  if (!retryConfig) {
    return false
  }

  // 强制重试，或匹配特定错误类型
  return (
    retryConfig.force ||
    error.message.includes('Network Error') ||
    error.message.includes('timeout') ||
    (error.response?.status ?? 0) >= 500
  )
}

/**
 * 处理请求重试的拦截器
 * @param error Axios 错误对象
 * @param instance Axios 实例
 */
export async function handleRetry(error: AxiosError, instance: AxiosInstance) {
  const config = error.config as CustomRequestConfig | undefined
  if (!shouldRetry(error, config)) {
    return Promise.reject(error)
  }

  // 断言 config 存在，因为 shouldRetry 已检查过
  const definiteConfig = config!

  const { count = 3, delay = 1000 } = definiteConfig.retry!
  definiteConfig.__retryCount = definiteConfig.__retryCount ?? 0

  if (definiteConfig.__retryCount < count) {
    definiteConfig.__retryCount++
    // 等待指定延迟
    await new Promise((resolve) => setTimeout(resolve, delay))
    // 重新发起请求
    return instance(definiteConfig)
  }

  return Promise.reject(error)
}
