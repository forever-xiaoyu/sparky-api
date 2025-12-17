import type {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import type { Component } from 'vue'

// 扩展 AxiosRequestConfig，支持重试、Loading、下载等自定义参数
export interface CustomRequestConfig extends AxiosRequestConfig {
  /** 是否显示 Loading (默认 true) */
  showLoading?: boolean
  /** 是否是下载流 (默认 false) */
  isDownload?: boolean
  /** 重试配置 */
  retry?: {
    /** 重试次数 */
    count?: number
    /** 延迟时间 (ms) */
    delay?: number
    /** 强制重试 (不管什么错误) */
    force?: boolean
  }
  /** 内部重试计数器 (无需手动传) */
  __retryCount?: number
  /** 是否取消重复请求 (默认 true) */
  cancelDuplicated?: boolean
}

// 初始化配置 (外部注入)
export interface InitOptions {
  baseUrl: string
  timeout?: number
  headers?: Record<string, any>
  /** 自定义 Loading 组件 (Vue Component) */
  loadingComponent?: Component
  /** 外部注入：显示 Loading 的回调 (如果传入，则 loadingComponent 失效) */
  onShowLoading?: () => void
  /** 外部注入：隐藏 Loading 的回调 (如果传入，则 loadingComponent 失效) */
  onHideLoading?: () => void
  /** 外部注入：请求失败的回调 (用于弹窗提示) */
  onError?: (error: Error | any) => void
  /** 外部注入：Token 或其他 Header 处理钩子 */
  requestInterceptor?: (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
  /** 外部注入：业务状态码校验 (如 code === 200) */
  responseSuccess?: (res: any) => boolean
}

// 统一返回结构 (根据后端实际情况调整)
export interface Result<T = any> {
  code: number
  message: string
  data: T
}
