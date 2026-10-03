import { getSpread, topicName } from '../../../data/spreads'
import { DrawnCard, LayoutCard, ReadingRecord, Topic } from '../../../data/types'
import { formatTime } from '../../../utils/format'
import { buildReading, Reading } from '../../../utils/reading'
import { getRecord } from '../../../utils/storage'

// 分享链接中的牌：m19.0,w03.1（.1 表示逆位）
function encodeCards(cards: DrawnCard[]): string {
  return cards.map(c => `${c.id}.${c.rev ? 1 : 0}`).join(',')
}

function decodeCards(s: string): DrawnCard[] {
  return s.split(',').filter(Boolean).map(x => {
    const [id, r] = x.split('.')
    return { id, rev: r === '1' }
  })
}

Page({
  data: {
    ready: false,
    shared: false,
    fresh: false,
    scrolled: false,
    record: null as ReadingRecord | null,
    reading: null as Reading | null,
    layoutCards: [] as LayoutCard[],
    topicName: '',
    timeText: '',
    active: -1,
  },

  onLoad(query: Record<string, string | undefined>) {
    let record: ReadingRecord | undefined
    let shared = false
    if (query.id) {
      record = getRecord(query.id)
    } else if (query.c) {
      shared = true
      const spreadId = getSpread(query.s || 'single').id
      record = {
        id: 'shared',
        spreadId,
        topic: (query.t || 'general') as Topic,
        question: '',
        cards: decodeCards(decodeURIComponent(query.c)).slice(0, getSpread(spreadId).positions.length),
        time: Number(query.ts) || Date.now(),
      }
    }
    if (!record || !record.cards.length) {
      wx.showToast({ title: '记录不存在', icon: 'none' })
      setTimeout(() => wx.reLaunch({ url: '/pages/index/index' }), 1200)
      return
    }
    const reading = buildReading(record)
    this.setData({
      ready: true,
      shared,
      fresh: query.fresh === '1',
      record,
      reading,
      layoutCards: record.cards.map(c => ({ id: c.id, rev: c.rev, flipped: true })),
      topicName: topicName(record.topic),
      timeText: formatTime(record.time),
    })
  },

  onPageScroll(e: WechatMiniprogram.Page.IPageScrollOption) {
    const scrolled = e.scrollTop > 20
    if (scrolled !== this.data.scrolled) this.setData({ scrolled })
  },

  // 点击牌阵中的牌，滚动到对应解读
  onCardTap(e: WechatMiniprogram.CustomEvent<{ index: number }>) {
    const i = e.detail.index
    this.setData({ active: i })
    wx.pageScrollTo({ selector: `#item-${i}`, offsetTop: -100, duration: 400 })
  },

  openCard(e: WechatMiniprogram.TouchEvent) {
    const { id, rev } = e.currentTarget.dataset
    wx.navigateTo({ url: `/tarot/pages/card/card?id=${id}&rev=${rev ? 1 : 0}` })
  },

  again() {
    const spreadId = this.data.record!.spreadId
    const pages = getCurrentPages()
    const prev = pages[pages.length - 2]
    // 从提问页一路过来时直接返回，避免页面栈越叠越深
    if (prev && prev.route === 'tarot/pages/question/question') {
      wx.navigateBack()
    } else {
      wx.redirectTo({ url: `/tarot/pages/question/question?spread=${spreadId}` })
    }
  },

  home() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  onShareAppMessage() {
    const r = this.data.record
    const reading = this.data.reading
    if (!r || !reading) return { title: '星语塔罗', path: '/pages/index/index' }
    const first = reading.items[0]
    return {
      title: `我用「${reading.spread.name}」抽到了${first.card.name}${first.rev ? '（逆位）' : ''}，来看看塔罗怎么说`,
      path: `/tarot/pages/result/result?s=${r.spreadId}&t=${r.topic}&ts=${r.time}&c=${encodeURIComponent(encodeCards(r.cards))}`,
      imageUrl: '/assets/share-cover.jpg',
    }
  },
})
