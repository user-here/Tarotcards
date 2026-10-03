import { CARDS, getCard } from '../../../data/cards'
import { TarotCard } from '../../../data/types'

Page({
  data: {
    card: null as TarotCard | null,
    rev: false,
    scrolled: false,
    prev: '',
    next: '',
    sections: [] as { title: string; text: string }[],
  },

  onLoad(query: Record<string, string | undefined>) {
    this.show(query.id || 'm00', query.rev === '1')
  },

  show(id: string, rev: boolean) {
    const card = getCard(id) || CARDS[0]
    const i = card.index
    this.setData({
      card,
      rev,
      prev: i > 0 ? CARDS[i - 1].id : '',
      next: i < CARDS.length - 1 ? CARDS[i + 1].id : '',
    })
    this.buildSections()
  },

  buildSections() {
    const c = this.data.card!
    const k = this.data.rev ? 1 : 0
    this.setData({
      sections: [
        { title: this.data.rev ? '逆位牌义' : '正位牌义', text: this.data.rev ? c.rev : c.up },
        { title: '爱情', text: c.love[k] },
        { title: '事业学业', text: c.career[k] },
        { title: '财富', text: c.wealth[k] },
      ],
    })
  },

  onPageScroll(e: WechatMiniprogram.Page.IPageScrollOption) {
    const scrolled = e.scrollTop > 20
    if (scrolled !== this.data.scrolled) this.setData({ scrolled })
  },

  setOrientation(e: WechatMiniprogram.TouchEvent) {
    const rev = e.currentTarget.dataset.rev === '1'
    if (rev === this.data.rev) return
    wx.vibrateShort({ type: 'light' })
    this.setData({ rev })
    this.buildSections()
  },

  toggle() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ rev: !this.data.rev })
    this.buildSections()
  },

  go(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    if (!id) return
    this.show(id, false)
    wx.pageScrollTo({ scrollTop: 0, duration: 300 })
  },

  preview() {
    const c = this.data.card!
    wx.previewImage({ urls: [c.image], current: c.image })
  },

  onShareAppMessage() {
    const c = this.data.card!
    return {
      title: `塔罗牌「${c.name}」的含义：${c.kw.slice(0, 3).join('、')}`,
      path: `/tarot/pages/card/card?id=${c.id}`,
    }
  },
})
