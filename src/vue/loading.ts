import { createApp, h, type App, type Component } from 'vue'

let loadingApp: App<Element> | undefined
let loadingHost: HTMLDivElement | undefined

const DefaultLoading: Component = {
  name: 'SparkyDefaultLoading',
  setup: () => () =>
    h(
      'div',
      {
        style:
          'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.35);backdrop-filter:blur(1px)'
      },
      [
        h('div', {
          style:
            'width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#409eff;border-radius:50%;animation:sparky-loading-spin .75s linear infinite'
        }),
        h('style', '@keyframes sparky-loading-spin{to{transform:rotate(360deg)}}')
      ]
    )
}

/** 创建默认的 Vue 全局 Loading；非浏览器环境会安全降级为空操作。 */
export function createDefaultLoadingCallbacks(component?: Component) {
  return {
    onShowLoading: () => mountLoading(component),
    onHideLoading: () => unmountLoading()
  }
}

function mountLoading(component?: Component) {
  if (typeof document === 'undefined' || loadingApp || loadingHost) return

  loadingHost = document.createElement('div')
  loadingHost.id = 'sparky-api-loading'
  document.body.appendChild(loadingHost)
  loadingApp = createApp(component ?? DefaultLoading)
  loadingApp.mount(loadingHost)
}

function unmountLoading() {
  loadingApp?.unmount()
  loadingApp = undefined
  loadingHost?.remove()
  loadingHost = undefined
}
