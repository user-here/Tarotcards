// 让小程序的 utils/storage.ts 在浏览器里直接运行：用 localStorage 实现同名接口
const PREFIX = 'xingyu:'

const shim = {
  getStorageSync(key: string): unknown {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw === null ? '' : JSON.parse(raw)
    } catch {
      return ''
    }
  },
  setStorageSync(key: string, value: unknown) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // 隐私模式等情况下存储不可用，忽略
    }
  },
  removeStorageSync(key: string) {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch {
      // 忽略
    }
  },
}

;(globalThis as unknown as { wx: typeof shim }).wx = shim
