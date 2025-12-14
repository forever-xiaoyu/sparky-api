import { createApp, type Component, type App as VueApp } from 'vue'
import DefaultLoadingComponent from '../components/GlobalLoading.vue'

// 存储 Vue 应用实例和 DOM 元素的变量
let loadingApp: VueApp | null = null
let loadingHost: HTMLDivElement | null = null

/**
 * 挂载 Loading 组件
 * @param customComponent - 用户提供的可选自定义 Loading 组件
 */
export const mountLoading = (customComponent?: Component) => {
  // 如果当前已有 loading 实例，则不再创建
  if (loadingApp || loadingHost) {
    return
  }

  // 决定使用哪个组件
  const componentToMount = customComponent || DefaultLoadingComponent

  // 创建一个宿主 div
  loadingHost = document.createElement('div')
  loadingHost.id = 'global-loading-host'
  document.body.appendChild(loadingHost)

  // 创建并挂载 Vue 应用实例
  loadingApp = createApp(componentToMount)
  loadingApp.mount(loadingHost)
}

/**
 * 卸载 Loading 组件
 */
export const unmountLoading = () => {
  if (loadingApp) {
    loadingApp.unmount()
    loadingApp = null
  }
  if (loadingHost) {
    document.body.removeChild(loadingHost)
    loadingHost = null
  }
}
