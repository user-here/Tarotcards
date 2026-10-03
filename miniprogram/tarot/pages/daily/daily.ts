import { DailyFortune, getDailyFortune, revealDaily } from '../../../utils/daily'
import { prettyDate } from '../../../utils/format'
import { getStreak } from '../../../utils/storage'

let fortune: DailyFortune | null = null

Page({
  data: {
    date: '',
    flipped: false,
    showInfo: false,
    scrolled: false,
    streak: 0,
    stars: [1, 2, 3, 4, 5],
    card: {
      id: '', name: '', en: '', image: '', element: '',
    },
    rev: false,
    keywords: [] as string[],
    meaning: '',
    advice: '',
    overall: 3,
    scores: [] as { key: string; name: string; value: number }[],
    color: { name: '', hex: '#fff' },
    number: 7,
    yi: [] as string[],
    ji: [] as string[],
  },

  onLoad() {
    fortune = getDailyFortune()
    const f = fortune
    this.setData({
      date: prettyDate(),
      flipped: f.revealed,
      showInfo: f.revealed,
      streak: getStreak(),
      card: { id: f.card.id, name: f.card.name, en: f.card.en, image: f.card.image, element: f.card.element },
      rev: f.rev,
      keywords: f.rev ? f.card.kwRev : f.card.kw,
      meaning: f.rev ? f.card.rev : f.card.up,
      advice: f.card.advice,
      overall: f.overall,
      scores: f.scores,
      color: f.color,
      number: f.number,
      yi: f.yi,
      ji: f.ji,
    })
  },

  onPageScroll(e: WechatMiniprogram.Page.IPageScrollOption) {
    const scrolled = e.scrollTop > 20
    if (scrolled !== this.data.scrolled) this.setData({ scrolled })
  },

  flip() {
    if (this.data.flipped || !fortune) return
    wx.vibrateShort({ type: 'medium' })
    revealDaily(fortune)
    this.setData({ flipped: true })
    setTimeout(() => {
      this.setData({ showInfo: true, streak: getStreak() })
    }, 700)
  },

  openCard() {
    if (!this.data.flipped) return this.flip()
    wx.navigateTo({ url: `/tarot/pages/card/card?id=${this.data.card.id}&rev=${this.data.rev ? 1 : 0}` })
  },

  goSpreads() {
    wx.navigateBack({ fail: () => wx.reLaunch({ url: '/pages/index/index' }) })
  },

  onShareAppMessage() {
    return {
      title: this.data.flipped
        ? `我的今日之牌是「${this.data.card.name}」，你的呢？`
        : '翻开今天的塔罗之牌，看看宇宙想对你说什么',
      path: '/pages/index/index',
      imageUrl: '/assets/share-cover.jpg',
    }
  },
})
