# @sparkyie/api

一个基于 Axios 的请求工具包，提供统一请求配置、业务状态码判断、失败重试、重复请求取消与全局 Loading。

## 特性

- 默认内置全局 Loading，初始化后无需额外配置即可使用。
- 支持宿主注入 Loading、鉴权、业务成功判断和全局错误处理。
- 默认取消相同的进行中请求，并避免旧请求误取消新请求。
- 支持网络错误与 HTTP 5xx 自动重试。
- 支持文件下载、数组参数序列化和多个独立请求实例。
- 生成 ESM 产物和 TypeScript 类型声明。

## 目录职责

```
src/
├── index.ts                 # 对外入口：initRequest、request
├── core/
│   ├── SparkyRequest.ts     # 主流程：拦截器、响应、重试、下载
│   ├── pending-requests.ts  # 重复请求取消
│   ├── loading.ts           # 并发 Loading 计数
│   ├── retry.ts             # 重试规则
│   ├── serialize-query.ts   # 参数序列化、生成请求唯一键
│   └── types.ts             # 所有公开类型
└── vue/
    └── loading.ts           # 内置 Vue 默认 Loading 与自定义组件挂载
```

## 初始化

在应用入口调用一次 `initRequest`：

```ts
import { initRequest, request } from '@sparkyie/api'

initRequest({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  requestSuccess: (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  responseSuccess: (response) => response.data?.code === 200,
  responseFail: (error) => console.error('请求失败：', error)
})

const result = await request.get<User>('/users/me')
console.log(result.data)
```

不传 Loading 配置时，浏览器会自动显示内置全局 Loading。非浏览器环境（例如 SSR）会安全降级为空操作。

## 自定义 Loading

### 方式一：由项目完全接管

同时传入 `onShowLoading` 与 `onHideLoading`，包不再挂载默认 Loading：

```ts
initRequest({
  baseUrl: '/api',
  onShowLoading: () => loadingStore.show(),
  onHideLoading: () => loadingStore.hide()
})
```

### 方式二：传入自定义 Vue 组件

未传上述两个回调时，可以用 `loadingComponent` 替换默认组件：

```ts
import AppLoading from './components/AppLoading.vue'

initRequest({
  baseUrl: '/api',
  loadingComponent: AppLoading
})
```

## 单次请求配置

```ts
await request.get('/reports', { page: 1, tags: ['sales', 'daily'] }, {
  showLoading: false,
  cancelDuplicated: false,
  retry: { count: 2, delay: 500 }
})
```

- `showLoading: false`：该请求不触发全局 Loading。
- `cancelDuplicated: false`：允许完全相同的请求并行执行。
- `retry`：默认仅重试网络错误和 HTTP 5xx；`force: true` 会重试所有错误，请谨慎使用。

## 下载与取消

```ts
const file = await request.download('/exports/report', { month: '2026-08' })

request.cancelRequest('/exports/report')
request.cancelAllRequests()
```

## 本地运行与校验

```bash
npm run type-check    # 校验源码、示例与公开类型
npm run test:request  # 构建后执行本地请求测试，不依赖后端
npm run dev           # 启动 Vite 示例，实际请求使用 /api 代理
npm run validate      # 执行完整校验
```

`test:request` 会验证成功响应、默认 Loading 在非浏览器环境的安全降级、失败重试、重复请求取消和并发 Loading 生命周期。
