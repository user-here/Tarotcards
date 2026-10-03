const pad = (n: number) => (n < 10 ? '0' + n : '' + n)

export function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const WEEK = ['日', '一', '二', '三', '四', '五', '六']

export function prettyDate(d: Date = new Date()): string {
  return `${d.getMonth() + 1}月${d.getDate()}日 · 星期${WEEK[d.getDay()]}`
}

export function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (dateKey(d) === dateKey(now)) return `今天 ${hm}`
  const y = new Date(now.getTime() - 86400000)
  if (dateKey(d) === dateKey(y)) return `昨天 ${hm}`
  if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日 ${hm}`
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours()
  if (h < 5) return '夜深了，星星仍在为你守候'
  if (h < 11) return '早安，今天也会有好事发生'
  if (h < 14) return '午安，给心灵留一点空白'
  if (h < 18) return '下午好，听听内心的声音'
  if (h < 23) return '晚上好，愿星光为你指引'
  return '夜深了，星星仍在为你守候'
}
