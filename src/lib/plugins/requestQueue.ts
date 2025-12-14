import type { InternalAxiosRequestConfig } from 'axios'
import qs from 'qs'
import type { CustomRequestConfig } from '../types'

// 使用 Map 管理进行中的请求
const pendingMap = new Map<string, AbortController>()

/**
 * 生成唯一的请求 Key
 * @param config Axios 请求配置
 */
export const generateRequestKey = (config: InternalAxiosRequestConfig): string => {
  const { url, method, params, data } = config

  // 特殊处理 FormData，因其无法被 JSON.stringify 正常序列化
  if (data instanceof FormData) {
    return [url, method, qs.stringify(params), 'FormData'].join('&')
  }

  return [
    url,
    method,
    qs.stringify(params),
    typeof data === 'string' ? data : JSON.stringify(data)
  ].join('&')
}

/**
 * 将请求添加到队列
 * @param config Axios 请求配置
 */
export const addPending = (config: InternalAxiosRequestConfig) => {
  const customConfig = config as CustomRequestConfig
  // 如果配置了 cancelDuplicated: false，则不添加，允许重复请求
  if (customConfig.cancelDuplicated === false) return

  removePending(config) // 在添加前，先尝试取消已存在的相同请求
  const key = generateRequestKey(config)
  const controller = new AbortController()
  config.signal = controller.signal
  pendingMap.set(key, controller)
}

/**
 * 从队列中移除请求（并可选择性地取消它）
 * @param config Axios 请求配置
 */
export const removePending = (config: InternalAxiosRequestConfig) => {
  const key = generateRequestKey(config)
  if (pendingMap.has(key)) {
    const controller = pendingMap.get(key)
    controller?.abort() // 取消请求
    pendingMap.delete(key)
  }
}

/**
 * 取消指定 URL 的所有请求
 * @param url 要取消的请求的 URL
 */
export const cancelRequest = (url: string) => {
  for (const [key, controller] of pendingMap) {
    const [keyUrl] = key.split('&')
    if (keyUrl === url) {
      controller.abort('Manual Cancel')
      pendingMap.delete(key)
    }
  }
}

/**
 * 取消所有进行中的请求
 */
export const cancelAllRequests = () => {
  pendingMap.forEach((controller) => {
    controller.abort('Cancel All')
  })
  pendingMap.clear()
}

/**
 * 获取当前的 pendingMap 实例
 */
export const getPendingMap = () => pendingMap
