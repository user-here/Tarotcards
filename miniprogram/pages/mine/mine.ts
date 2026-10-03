import { CARDS, getCard } from '../../data/cards'
import { clearAll, getRecords, getSeen, getStreak } from '../../utils/storage'

Page({
  data: {
    readings: 0,
    streak: 0,
    seen: 0,
    total: CARDS.length,
    percent: 0,
    favorite: null as null | { id: string; name: string; thumb: string; count: number },
  },

  onShow() {
    const records = getRecords()
    const seen = getSeen().length
    const counter: Record<string, number> = {}
    records.forEach(r => r.cards.forEach(c => { counter[c.id] = (counter[c.id] || 0) + 1 }))
    let favId = ''
    Object.keys(counter).forEach(id => {
      if (!favId || counter[id] > counter[favId]) favId = id
    })
    const fav = favId && counter[favId] > 1 ? getCard(favId) : null
    this.setData({
      readings: records.length,
      streak: getStreak(),
      seen,
      percent: Math.round((seen / CARDS.length) * 100),
      favorite: fav ? { id: fav.id, name: fav.name, thumb: fav.thumb, count: counter[favId] } : null,
    })
  },

  go(e: WechatMiniprogram.TouchEvent) {
    wx.navigateTo({ url: e.currentTarget.dataset.url as string })
  },

  openFavorite() {
    if (this.data.favorite) wx.navigateTo({ url: `/tarot/pages/card/card?id=${this.data.favorite.id}` })
  },

  clear() {
    wx.showModal({
      title: '清除本地数据',
      content: '将删除所有占卜记录、每日一牌与收集进度，且无法恢复。',
      confirmText: '清除',
      confirmColor: '#e6879f',
      success: res => {
        if (!res.confirm) return
        clearAll()
        wx.showToast({ title: '已清除', icon: 'success' })
        this.onShow()
      },
    })
  },

  onShareAppMessage() {
    return {
      title: '星语塔罗 · 抽一张牌，听听内心的声音',
      path: '/pages/index/index',
      imageUrl: '/assets/share-cover.jpg',
    }
  },
})
