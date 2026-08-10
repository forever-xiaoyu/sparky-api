import { SparkyRequest } from './core/SparkyRequest'
import type { InitOptions, RequestConfig } from './core/types'
import { createDefaultLoadingCallbacks } from './vue/loading'

let requestInstance: SparkyRequest | undefined

/**
 * 创建 `request` 便捷对象使用的默认请求客户端。
 * 未提供 Loading 回调时，浏览器中会自动使用内置全局 Loading；传入两个回调后则完全交由宿主控制。
 */
export function initRequest(options: InitOptions) {
  const useCustomLoading = Boolean(options.onShowLoading && options.onHideLoading)
  const finalOptions = useCustomLoading
    ? options
    : { ...options, ...createDefaultLoadingCallbacks(options.loadingComponent) }
  requestInstance = new SparkyRequest(finalOptions)
  return requestInstance
}

function getDefaultClient() {
  if (!requestInstance) throw new Error('[@sparkyie/api] Call initRequest() before making requests.')
  return requestInstance
}

export const request = {
  get: <T = unknown>(url: string, params?: unknown, config?: RequestConfig) =>
    getDefaultClient().get<T>(url, params, config),
  post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
    getDefaultClient().post<T>(url, data, config),
  put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
    getDefaultClient().put<T>(url, data, config),
  delete: <T = unknown>(url: string, params?: unknown, config?: RequestConfig) =>
    getDefaultClient().delete<T>(url, params, config),
  getQs: <T = unknown>(url: string, params?: unknown, config?: RequestConfig) =>
    getDefaultClient().getQs<T>(url, params, config),
  download: (url: string, params?: unknown, config?: RequestConfig) =>
    getDefaultClient().download(url, params, config),
  cancelRequest: (url: string) => getDefaultClient().cancelRequest(url),
  cancelAllRequests: () => getDefaultClient().cancelAllRequests()
}

export { SparkyRequest }
export type * from './core/types'
