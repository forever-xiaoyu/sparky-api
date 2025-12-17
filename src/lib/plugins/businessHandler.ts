import type { AxiosResponse } from 'axios'
import type { CustomRequestConfig, InitOptions } from '../types'

/**
 * 处理业务响应的拦截器逻辑
 *
 * @param response Axios 响应对象
 * @param options SparkyRequest 初始化选项
 * @returns 返回处理后的数据或 Promise.reject
 */
export function handleBusinessResponse(response: AxiosResponse, options: InitOptions) {
  const config = response.config as CustomRequestConfig

  // 1. 如果是下载请求或流，直接返回原始响应
  if (config.isDownload || config.responseType === 'blob') {
    return response
  }

  // 2. 提取响应数据
  const data = response.data

  // 3. 判断业务是否成功
  // 优先使用外部注入的验证函数，否则使用默认逻辑
  const isSuccess = options.responseSuccess
    ? options.responseSuccess(response)
    : data && (data.code === 200 || data.code === 0)

  // 4. 根据业务成功与否进行处理
  if (isSuccess) {
    // 业务成功，直接返回核心数据
    return data
  } else {
    // 调用外部统一错误处理钩子
    if (options.responseFail) {
      options.responseFail(response)
    }

    return Promise.reject(response)
  }
}
