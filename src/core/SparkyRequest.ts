import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { LoadingCounter } from './loading'
import { PendingRequests } from './pending-requests'
import { retryRequest } from './retry'
import { serializeQuery } from './serialize-query'
import type { InitOptions, RequestConfig, Result } from './types'

export class SparkyRequest {
  private readonly instance: AxiosInstance
  private readonly pending = new PendingRequests()
  private readonly loading: LoadingCounter

  constructor(private readonly options: InitOptions) {
    this.instance = axios.create({
      baseURL: options.baseUrl,
      timeout: options.timeout ?? 10_000,
      headers: options.headers,
      withCredentials: options.withCredentials ?? true
    })
    this.loading = new LoadingCounter(options.onShowLoading, options.onHideLoading)
    this.installInterceptors()
  }

  private installInterceptors() {
    this.instance.interceptors.request.use(
      async (config) => {
        const requestConfig = config as RequestConfig
        this.pending.begin(config)
        // 重试会复用同一份配置。已在 Loading 中的重试请求不重复计数，
        // 这样从首次请求到最后一次重试结束只显示一次 Loading。
        if (!requestConfig.__sparkyLoadingTracked) {
          requestConfig.__sparkyLoadingTracked =
            requestConfig.showLoading !== false && this.loading.start()
        }

        try {
          return this.options.requestSuccess ? await this.options.requestSuccess(config) : config
        } catch (error) {
          this.complete(config)
          this.options.requestFail?.(error)
          throw error
        }
      },
      (error: unknown) => {
        this.options.requestFail?.(error)
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      (response) => this.handleResponse(response),
      (error: AxiosError) => this.handleResponseError(error)
    )
  }

  private handleResponse(response: AxiosResponse) {
    this.complete(response.config)
    const config = response.config as RequestConfig
    if (config.responseType === 'blob') return response

    const success = this.options.responseSuccess
      ? this.options.responseSuccess(response)
      : isDefaultBusinessSuccess(response.data)
    if (success) return response.data

    this.options.responseFail?.(response)
    return Promise.reject(response)
  }

  private async handleResponseError(error: AxiosError) {
    if (axios.isCancel(error)) {
      this.complete(error.config)
      return Promise.reject(error)
    }

    try {
      return await retryRequest(error, this.instance)
    } catch (finalError) {
      const finalConfig = (finalError as AxiosError).config ?? error.config
      this.complete(finalConfig)
      this.options.responseFail?.(finalError)
      return Promise.reject(finalError)
    }
  }

  private complete(config: InternalAxiosRequestConfig | RequestConfig | undefined) {
    this.pending.finish(config)
    this.loading.finish((config as RequestConfig | undefined)?.__sparkyLoadingTracked)
  }

  request<T = unknown>(config: RequestConfig): Promise<Result<T>> {
    return this.instance.request(config) as Promise<Result<T>>
  }

  get<T = unknown>(url: string, params?: unknown, config?: RequestConfig) {
    return this.request<T>({ ...config, method: 'GET', url, params })
  }

  post<T = unknown>(url: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  put<T = unknown>(url: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  delete<T = unknown>(url: string, params?: unknown, config?: RequestConfig) {
    return this.request<T>({ ...config, method: 'DELETE', url, params })
  }

  getQs<T = unknown>(url: string, params?: unknown, config?: RequestConfig) {
    return this.request<T>({
      ...config,
      method: 'GET',
      url,
      params,
      paramsSerializer: (value) => serializeQuery(value)
    })
  }

  async download(url: string, params?: unknown, config?: RequestConfig): Promise<Blob> {
    const response = (await this.instance.request({
      ...config,
      url,
      method: 'GET',
      params,
      responseType: 'blob'
    })) as AxiosResponse<Blob>
    return response.data
  }

  cancelRequest(url: string) {
    this.pending.cancelUrl(url)
  }

  cancelAllRequests() {
    this.pending.cancelAll()
  }
}

function isDefaultBusinessSuccess(data: unknown) {
  if (!data || typeof data !== 'object') return false
  const code = (data as Result).code
  return code === 0 || code === 200
}
