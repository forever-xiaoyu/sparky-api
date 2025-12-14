// Loading 计数器
let loadingCount = 0

/**
 * 处理 Loading 状态的函数
 * @param show - 是否显示 Loading
 * @param onShow - 显示 Loading 的回调
 * @param onHide - 隐藏 Loading 的回调
 */
export const handleLoading = (
  show: boolean,
  onShow: () => void,
  onHide: () => void
) => {
  if (show) {
    loadingCount++
    if (loadingCount === 1) {
      onShow()
    }
  } else {
    // 确保计数器不会变为负数
    if (loadingCount > 0) {
      loadingCount--
    }
    if (loadingCount === 0) {
      onHide()
    }
  }
}

/**
 * 重置 Loading 计数器，在测试或特定场景下有用
 */
export const resetLoadingCount = () => {
  loadingCount = 0
}
