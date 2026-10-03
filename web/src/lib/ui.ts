// 网页端的小工具：素材路径、尺寸换算、震动、提示与确认框

export function src(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}

export function rpx(n: number): string {
  return `calc(${n} * var(--rpx))`
}

export function rpxToPx(n: number): number {
  return (Math.min(window.innerWidth, 480) / 750) * n
}

export function vibrate(ms = 12) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    // 不支持则忽略
  }
}

let toastTimer = 0
export function toast(text: string) {
  let el = document.getElementById('toast')
  if (!el) {
    el = document.createElement('div')
    el.id = 'toast'
    el.className = 'toast'
    document.body.appendChild(el)
  }
  el.textContent = text
  el.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => el!.classList.remove('show'), 1800)
}

export function confirmDialog(title: string, content: string, okText = '确定'): Promise<boolean> {
  return new Promise(resolve => {
    const mask = document.createElement('div')
    mask.className = 'dialog-mask'
    mask.innerHTML = `
      <div class="dialog">
        <div class="dialog-title serif"></div>
        <div class="dialog-content"></div>
        <div class="dialog-actions">
          <button class="dialog-btn cancel">取消</button>
          <button class="dialog-btn ok"></button>
        </div>
      </div>`
    mask.querySelector('.dialog-title')!.textContent = title
    mask.querySelector('.dialog-content')!.textContent = content
    mask.querySelector('.ok')!.textContent = okText
    const close = (v: boolean) => {
      mask.classList.add('hide')
      setTimeout(() => mask.remove(), 200)
      resolve(v)
    }
    mask.querySelector('.cancel')!.addEventListener('click', () => close(false))
    mask.querySelector('.ok')!.addEventListener('click', () => close(true))
    mask.addEventListener('click', e => { if (e.target === mask) close(false) })
    document.body.appendChild(mask)
  })
}

// 分享：优先使用系统分享，否则复制链接
export async function share(title: string, url: string) {
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
  if (nav.share) {
    try {
      await nav.share({ title, url })
      return
    } catch {
      // 用户取消
      return
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    toast('链接已复制，快去分享吧')
  } catch {
    window.prompt('复制下面的链接分享给好友', url)
  }
}
