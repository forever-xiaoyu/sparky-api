import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { Component } from 'vue'

export interface RetryOptions {
  /** 首次请求失败后，最多额外重试的次数。 */
  count?: number
  /** 每次重试前的等待时间，单位毫秒。 */
  delay?: number
  /** 是否强制重试所有错误（包括 4xx），请谨慎使用。 */
  force?: boolean
}

/** sparky-api 在 Axios 配置基础上扩展的选项。 */
export interface RequestConfig extends AxiosRequestConfig {
  /** 设为 false 后，此请求不参与全局 Loading 计数。 */
  showLoading?: boolean
  /** 设为 false 后，允许完全相同的请求同时进行。 */
  cancelDuplicated?: boolean
  retry?: RetryOptions
  /** @internal 内部请求唯一标识，无需手动设置。 */
  __sparkyPendingKey?: string
  /** @internal 内部请求唯一标识，无需手动设置。 */
  __sparkyRequestId?: symbol
  /** @internal 是否已计入 Loading，无需手动设置。 */
  __sparkyLoadingTracked?: boolean
  /** @internal 当前重试次数，无需手动设置。 */
  __retryCount?: number
}

export interface InitOptions {
  baseUrl: string
  timeout?: number
  headers?: AxiosRequestConfig['headers']
  withCredentials?: boolean
  /** 自定义 Vue Loading 组件；未传回调时会替换内置默认组件。 */
  loadingComponent?: Component
  onShowLoading?: () => void
  onHideLoading?: () => void
  requestSuccess?: (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
  requestFail?: (error: unknown) => void
  /** 返回 true 表示后端业务成功。 */
  responseSuccess?: (response: AxiosResponse) => boolean
  /** 请求最终失败时调用一次。 */
  responseFail?: (error: unknown) => void
}

export interface Result<T = unknown> {
  code: number
  message: string
  data: T
}
