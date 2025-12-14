import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError
} from 'axios'
import qs from 'qs'
import type { CustomRequestConfig, InitOptions, Result } from './types'

// 导入插件模块
import {
  addPending,
  removePending,
  cancelRequest,
  cancelAllRequests
} from './plugins/requestQueue'
import { handleLoading } from './plugins/loading'
import { handleRetry } from './plugins/retry'
import { handleBusinessResponse } from './plugins/businessHandler'

export class SparkyRequest {
  private instance: AxiosInstance
  private options: InitOptions

  constructor(options: InitOptions) {
    this.options = options
    this.instance = axios.create({
      baseURL: options.baseUrl,
      timeout: options.timeout || 10000,
      headers: options.headers || { 'Content-Type': 'application/json' },
      withCredentials: true
    })

    this.setupInterceptors()
  }

  // --- 拦截器设置 ---

  private setupInterceptors() {
    // === 请求拦截 ===
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const customConfig = config as CustomRequestConfig

        // 1. [插件] 处理重复请求
        addPending(config)

        // 2. [插件] 处理 Loading
        if (customConfig.showLoading !== false && this.options.onShowLoading) {
          handleLoading(true, this.options.onShowLoading, this.options.onHideLoading!)
        }

        // 3. 执行外部注入的请求前置钩子 (例如注入 Token)
        if (this.options.requestInterceptor) {
          return this.options.requestInterceptor(config)
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    // === 响应拦截 ===
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const config = response.config as CustomRequestConfig

        // 1. [插件] 请求完成，从队列中移除
        removePending(response.config as InternalAxiosRequestConfig)

        // 2. [插件] 关闭 Loading
        if (config.showLoading !== false && this.options.onHideLoading) {
          handleLoading(false, this.options.onShowLoading!, this.options.onHideLoading)
        }

        // 3. [插件] 处理业务响应（成功/失败）
        return handleBusinessResponse(response, this.options)
      },
      async (error: AxiosError) => {
        const config = error.config as CustomRequestConfig

        // [插件] 即使请求失败，也应从队列中移除并关闭 Loading
        if (config) {
          removePending(config as InternalAxiosRequestConfig)
          if (config.showLoading !== false && this.options.onHideLoading) {
            handleLoading(false, this.options.onShowLoading!, this.options.onHideLoading)
          }
        }

        // 如果是 Axios 的取消错误，直接拒绝，不进行后续处理
        if (axios.isCancel(error)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Request canceled by queue.')
          }
          return Promise.reject(error)
        }

        // [插件] 尝试进行请求重试
        try {
          return await handleRetry(error, this.instance)
        } catch (retryError) {
          // 如果重试最终失败，或不满足重试条件，则执行全局错误处理
          if (this.options.onError) {
            this.options.onError(retryError as AxiosError)
          }
          return Promise.reject(retryError)
        }
      }
    )
  }

  // --- 公开 API 方法 ---

  request<T = any>(config: CustomRequestConfig): Promise<Result<T>> {
    return this.instance.request(config)
  }

  get<T = any>(url: string, params?: any, config?: CustomRequestConfig): Promise<Result<T>> {
    return this.request({ ...config, method: 'GET', url, params })
  }

  post<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<Result<T>> {
    return this.request({ ...config, method: 'POST', url, data })
  }

  put<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<Result<T>> {
    return this.request({ ...config, method: 'PUT', url, data })
  }

  delete<T = any>(url: string, params?: any, config?: CustomRequestConfig): Promise<Result<T>> {
    return this.request({ ...config, method: 'DELETE', url, params })
  }

  /** GET 请求，自动序列化数组参数 */
  getQs<T = any>(url: string, params?: any, config?: CustomRequestConfig): Promise<Result<T>> {
    return this.request({
      ...config,
      method: 'GET',
      url,
      params,
      paramsSerializer: (p) => qs.stringify(p, { arrayFormat: 'brackets' })
    })
  }

  /** 文件下载 */
  download(url: string, params?: any, config?: CustomRequestConfig): Promise<Blob> {
    return this.instance.request({
      ...config,
      url,
      method: 'GET',
      params,
      responseType: 'blob',
      isDownload: true
    }) as Promise<any>
  }

  /** 取消指定 URL 的请求 */
  cancelRequest(url: string) {
    cancelRequest(url)
  }

  /** 取消所有请求 */
  cancelAllRequests() {
    cancelAllRequests()
  }
}
