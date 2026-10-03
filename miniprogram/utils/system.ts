export interface Layout {
  statusBar: number
  navHeight: number // 状态栏 + 导航栏的总高度(px)
  windowWidth: number
  windowHeight: number
  rpx: number // 1rpx 对应的 px
  menuRight: number
}

let cached: Layout | null = null

export function getLayout(): Layout {
  if (cached) return cached
  // getWindowInfo 自基础库 2.20.1 起提供，旧版本回退到 getSystemInfoSync
  const w = wx as unknown as { getWindowInfo?: () => WechatMiniprogram.SystemInfo }
  const win = w.getWindowInfo ? w.getWindowInfo() : wx.getSystemInfoSync()
  let menu: WechatMiniprogram.Rect | null = null
  try { menu = wx.getMenuButtonBoundingClientRect() } catch (e) { menu = null }
  const statusBar = win.statusBarHeight || 20
  const bar = menu && menu.top ? (menu.top - statusBar) * 2 + menu.height : 44
  cached = {
    statusBar,
    navHeight: statusBar + bar,
    windowWidth: win.windowWidth,
    windowHeight: win.windowHeight,
    rpx: win.windowWidth / 750,
    menuRight: menu ? win.windowWidth - menu.left : 100,
  }
  return cached
}
