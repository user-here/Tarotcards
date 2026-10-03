import { SPREADS } from '../../data/spreads'
import { getDailyFortune } from '../../utils/daily'
import { greeting, prettyDate } from '../../utils/format'

interface MiniRect {
  left: number
  top: number
  width: number
  height: number
  rotate: number
}

// 把牌阵布局缩小成首页上的示意图
function miniLayout(spreadIndex: number) {
  const s = SPREADS[spreadIndex]
  const box = 108
  const scale = Math.min(box / 690, box / s.height) * 0.92
  const w = 690 * scale
  const h = s.height * scale
  const cw = Math.max(10, s.cardWidth * scale)
  const ch = cw * 1.74
  const rects: MiniRect[] = s.positions.map(p => ({
    left: (box - w) / 2 + (p.x / 100) * w - cw / 2,
    top: (box - h) / 2 + (p.y / 100) * h - ch / 2,
    width: cw,
    height: ch,
    rotate: p.rotate || 0,
  }))
  return rects
}

Page({
  data: {
    date: '',
    greeting: '',
    scrolled: false,
    daily: null as null | {
      revealed: boolean
      name: string
      rev: boolean
      thumb: string
      overall: number
      keywords: string[]
    },
    spreads: SPREADS.map((s, i) => ({
      id: s.id,
      name: s.name,
      sub: s.sub,
      desc: s.desc,
      tag: s.tag,
      count: s.positions.length,
      rects: miniLayout(i),
    })),
    stars: [1, 2, 3, 4, 5],
  },

  onShow() {
    const f = getDailyFortune()
    const now = new Date()
    this.setData({
      date: prettyDate(now),
      greeting: greeting(now),
      daily: {
        revealed: f.revealed,
        name: f.card.name,
        rev: f.rev,
        thumb: f.card.thumb,
        overall: f.overall,
        keywords: (f.rev ? f.card.kwRev : f.card.kw).slice(0, 3),
      },
    })
  },

  onPageScroll(e: WechatMiniprogram.Page.IPageScrollOption) {
    const scrolled = e.scrollTop > 20
    if (scrolled !== this.data.scrolled) this.setData({ scrolled })
  },

  goDaily() {
    wx.navigateTo({ url: '/tarot/pages/daily/daily' })
  },

  goSpread(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/tarot/pages/question/question?spread=${id}` })
  },

  go(e: WechatMiniprogram.TouchEvent) {
    wx.navigateTo({ url: e.currentTarget.dataset.url as string })
  },

  onShareAppMessage() {
    return {
      title: '星语塔罗 · 抽一张牌，听听内心的声音',
      path: '/pages/index/index',
      imageUrl: '/assets/share-cover.jpg',
    }
  },

  onShareTimeline() {
    return { title: '星语塔罗 · 抽一张牌，听听内心的声音' }
  },
})
