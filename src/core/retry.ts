import type { AxiosError, AxiosInstance } from 'axios'
import type { RequestConfig } from './types'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function retryRequest(error: AxiosError, instance: AxiosInstance) {
  const config = error.config as RequestConfig | undefined
  const retry = config?.retry
  if (!config || !retry || !isRetryable(error, retry.force)) throw error

  const count = retry.count ?? 3
  const completed = config.__retryCount ?? 0
  if (completed >= count) throw error

  config.__retryCount = completed + 1
  await wait(retry.delay ?? 1000)
  return instance.request(config)
}

function isRetryable(error: AxiosError, force = false) {
  if (force) return true
  if (!error.response) return error.code !== 'ERR_CANCELED'
  return error.response.status >= 500
}
