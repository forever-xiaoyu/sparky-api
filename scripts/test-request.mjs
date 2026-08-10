import assert from 'node:assert/strict'
import { AxiosError } from 'axios'
import { initRequest, request, SparkyRequest } from '../dist/sparkyie-api.mjs'

const response = (config, data, status = 200) => ({
  config,
  data,
  status,
  statusText: 'OK',
  headers: {}
})

const client = new SparkyRequest({ baseUrl: 'https://example.test' })
const successful = await client.get('/ok', undefined, {
  adapter: async (config) => response(config, { code: 200, message: 'ok', data: { id: 1 } })
})
assert.deepEqual(successful.data, { id: 1 })

// Node 环境没有 document；默认 Loading 应自动降级且不影响请求。
initRequest({ baseUrl: 'https://example.test' })
const defaultLoadingResult = await request.get('/default-loading', undefined, {
  adapter: async (config) => response(config, { code: 200, message: 'ok', data: 'safe' })
})
assert.equal(defaultLoadingResult.data, 'safe')

let retries = 0
let retryShowCount = 0
let retryHideCount = 0
const retryClient = new SparkyRequest({
  baseUrl: 'https://example.test',
  onShowLoading: () => retryShowCount++,
  onHideLoading: () => retryHideCount++
})
const retried = await retryClient.get('/retry', undefined, {
  retry: { count: 1, delay: 1 },
  adapter: async (config) => {
    retries += 1
    if (retries === 1) {
      throw new AxiosError('Server error', 'ERR_BAD_RESPONSE', config, undefined, response(config, {}, 500))
    }
    return response(config, { code: 0, message: 'ok', data: 'retried' })
  }
})
assert.equal(retries, 2)
assert.equal(retried.data, 'retried')
assert.equal(retryShowCount, 1)
assert.equal(retryHideCount, 1)

let showCount = 0
let hideCount = 0
const duplicateClient = new SparkyRequest({
  baseUrl: 'https://example.test',
  onShowLoading: () => showCount++,
  onHideLoading: () => hideCount++
})
const delayedAdapter = (config) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(response(config, { code: 200, message: 'ok', data: 'latest' })), 20)
    config.signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new AxiosError('Canceled', 'ERR_CANCELED', config))
    })
  })
const first = duplicateClient.get('/duplicate', undefined, { adapter: delayedAdapter })
const second = duplicateClient.get('/duplicate', undefined, { adapter: delayedAdapter })
const [firstResult, secondResult] = await Promise.allSettled([first, second])
assert.equal(firstResult.status, 'rejected')
assert.equal(secondResult.status, 'fulfilled')
assert.equal(showCount, 1)
assert.equal(hideCount, 1)

console.log('请求核心校验通过：成功响应、默认 Loading 降级、重试、重复请求取消和 Loading 生命周期。')
