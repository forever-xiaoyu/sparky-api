import type { InternalAxiosRequestConfig } from 'axios'
import type { RequestConfig } from './types'
import { serializeQuery } from './serialize-query'

interface PendingRequest {
  controller: AbortController
  requestId: symbol
}

/** 仅追踪单个 SparkyRequest 实例发出的请求。 */
export class PendingRequests {
  private readonly requests = new Map<string, PendingRequest>()

  begin(config: InternalAxiosRequestConfig) {
    const requestConfig = config as RequestConfig
    if (requestConfig.cancelDuplicated === false) return

    const key = createRequestKey(config)
    this.requests.get(key)?.controller.abort('Duplicate request')

    const requestId = Symbol(key)
    const controller = new AbortController()
    requestConfig.__sparkyPendingKey = key
    requestConfig.__sparkyRequestId = requestId
    config.signal = controller.signal
    this.requests.set(key, { controller, requestId })
  }

  /** 仅当请求仍拥有该记录时才清理；响应结束时绝不主动取消请求。 */
  finish(config: InternalAxiosRequestConfig | RequestConfig | undefined) {
    const requestConfig = config as RequestConfig | undefined
    const key = requestConfig?.__sparkyPendingKey
    const requestId = requestConfig?.__sparkyRequestId
    if (!key || !requestId) return

    if (this.requests.get(key)?.requestId === requestId) {
      this.requests.delete(key)
    }
  }

  cancelUrl(url: string) {
    for (const [key, pending] of this.requests) {
      if (key.startsWith(`${url}&`)) {
        pending.controller.abort('Manual cancellation')
        this.requests.delete(key)
      }
    }
  }

  cancelAll() {
    for (const pending of this.requests.values()) pending.controller.abort('Cancel all requests')
    this.requests.clear()
  }
}

function createRequestKey(config: InternalAxiosRequestConfig) {
  const { url = '', method = '', params, data } = config
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
  const body = isFormData ? 'FormData' : typeof data === 'string' ? data : serializeQuery(data)
  return [url, method.toUpperCase(), serializeQuery(params), body].join('&')
}
