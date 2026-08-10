/** 每个请求客户端独立维护计数，避免并发请求导致 Loading 闪烁。 */
export class LoadingCounter {
  private count = 0

  constructor(
    private readonly show?: () => void,
    private readonly hide?: () => void
  ) {}

  start() {
    if (!this.show || !this.hide) return false
    this.count += 1
    if (this.count === 1) this.show()
    return true
  }

  finish(tracked: boolean | undefined) {
    if (!tracked) return
    this.count = Math.max(0, this.count - 1)
    if (this.count === 0) this.hide?.()
  }
}
