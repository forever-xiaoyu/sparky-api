import { SparkyRequest } from './lib/axios'
import type { InitOptions } from './lib/types'
import { mountLoading, unmountLoading } from './services/loadingManager'

let requestInstance: SparkyRequest | null = null

/**
 * 初始化请求实例 (必须调用)
 */
export const initRequest = (options: InitOptions) => {
  const finalOptions: InitOptions = { ...options }

  // 如果用户没有自定义 onShow/onHideLoading，则使用内置的 Loading 管理器
  if (!options.onShowLoading && !options.onHideLoading) {
    finalOptions.onShowLoading = () => mountLoading(options.loadingComponent)
    finalOptions.onHideLoading = () => unmountLoading()
  }

  requestInstance = new SparkyRequest(finalOptions)
  return requestInstance
}

/**
 * 检查是否已初始化
 */
const checkInit = () => {
  if (!requestInstance) {
    throw new Error('[@sparkyie/api] Error: Please call initRequest() first!')
  }
  return requestInstance
}

// 导出方便调用的静态对象
export const request = {
  get: <T = any>(url: string, params?: any, config?: any) =>
    checkInit().get<T>(url, params, config),
  post: <T = any>(url: string, data?: any, config?: any) => checkInit().post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => checkInit().put<T>(url, data, config),
  delete: <T = any>(url: string, params?: any, config?: any) =>
    checkInit().delete<T>(url, params, config),
  getQs: <T = any>(url:string, params?: any, config?: any) =>
    checkInit().getQs<T>(url, params, config),
  download: (url: string, params?: any, config?: any) => checkInit().download(url, params, config),
  cancelRequest: (url: string) => checkInit().cancelRequest(url),
  cancelAllRequests: () => checkInit().cancelAllRequests()
}

// 导出类型
export * from './lib/types'

// 导出类本身 (如果用户想实例化多个请求器)
export { SparkyRequest }
