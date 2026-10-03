import { cardsOfSuit, CARDS, SUITS } from '../../../data/cards'
import { Suit } from '../../../data/types'
import { getSeen } from '../../../utils/storage'
import { getLayout } from '../../../utils/system'

interface GridCard {
  id: string
  name: string
  image: string
  seen: boolean
}

function listOf(suit: Suit, seen: string[]): GridCard[] {
  return cardsOfSuit(suit).map(c => ({ id: c.id, name: c.name, image: c.image, seen: seen.indexOf(c.id) >= 0 }))
}

Page({
  data: {
    suits: SUITS.map(s => ({ key: s.key, name: s.name, count: cardsOfSuit(s.key).length })),
    current: 'major' as Suit,
    desc: SUITS[0].desc,
    list: [] as GridCard[],
    seenCount: 0,
    total: CARDS.length,
    navTop: getLayout().navHeight,
  },

  onShow() {
    const seen = getSeen()
    this.setData({
      seenCount: seen.length,
      list: listOf(this.data.current, seen),
    })
  },

  switchSuit(e: WechatMiniprogram.TouchEvent) {
    const key = e.currentTarget.dataset.key as Suit
    if (key === this.data.current) return
    wx.vibrateShort({ type: 'light' })
    this.setData({
      current: key,
      desc: SUITS.find(s => s.key === key)!.desc,
      list: listOf(key, getSeen()),
    })
    wx.pageScrollTo({ scrollTop: 0, duration: 0 })
  },

  open(e: WechatMiniprogram.TouchEvent) {
    wx.navigateTo({ url: `/tarot/pages/card/card?id=${e.currentTarget.dataset.id}` })
  },

  onShareAppMessage() {
    return { title: '78 张塔罗牌图鉴，一起认识每一张牌', path: '/tarot/pages/gallery/gallery', imageUrl: '/assets/share-cover.jpg' }
  },
})
