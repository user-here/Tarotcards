import { CARDS } from '../../../data/cards'
import { getSpread, Spread } from '../../../data/spreads'
import { DrawnCard, LayoutCard, ReadingRecord } from '../../../data/types'
import { shuffle } from '../../../utils/random'
import { getDraft } from '../../../utils/session'
import { saveRecord } from '../../../utils/storage'
import { getLayout } from '../../../utils/system'

type Phase = 'shuffle' | 'cut' | 'cutting' | 'pick' | 'reveal'

const WHEEL_RADIUS = 720 // rpx，牌轮半径
const REVERSE_RATE = 0.35

interface WheelCard {
  i: number
  angle: number
  picked: boolean
}

interface TraySlot {
  name: string
  filled: boolean
}

let deck: string[] = []
const timers: number[] = []

function later(fn: () => void, ms: number) {
  timers.push(setTimeout(fn, ms) as unknown as number)
}

Page({
  data: {
    phase: 'shuffle' as Phase,
    spread: null as Spread | null,
    question: '',
    total: 0,
    picked: 0,
    wheelCards: [] as WheelCard[],
    tray: [] as TraySlot[],
    trayW: 100,
    trayCompact: false,
    kick: 0,
    degPerPx: 0.15,
    cards: [] as LayoutCard[],
    flippedCount: 0,
    scrollH: 600,
  },

  picks: [] as DrawnCard[],

  onLoad() {
    const draft = getDraft()
    if (!draft) {
      wx.redirectTo({ url: '/pages/index/index' })
      return
    }
    const spread = getSpread(draft.spreadId)
    const n = spread.positions.length
    const layout = getLayout()
    deck = shuffle(CARDS.map(c => c.id))
    this.picks = []
    const step = 360 / deck.length
    const gap = 12
    const trayW = Math.min(104, Math.floor((690 - gap * (n - 1)) / n))
    this.setData({
      spread,
      question: draft.question,
      total: n,
      wheelCards: deck.map((_, i) => ({ i, angle: i * step, picked: false })),
      tray: spread.positions.map(p => ({ name: p.name, filled: false })),
      trayW,
      trayCompact: n > 5,
      // 手指位置大约在牌面中部，以此换算拖动距离到旋转角度
      degPerPx: (180 / Math.PI) / ((WHEEL_RADIUS - 100) * layout.rpx),
      scrollH: layout.windowHeight - layout.navHeight,
    })
    later(() => this.setData({ phase: 'cut' }), 2600)
  },

  onUnload() {
    timers.forEach(t => clearTimeout(t))
    timers.length = 0
  },

  // 切牌
  onCut() {
    if (this.data.phase !== 'cut') return
    wx.vibrateShort({ type: 'medium' })
    this.setData({ phase: 'cutting' })
    later(() => {
      this.setData({ phase: 'pick' })
      later(() => this.setData({ kick: Date.now() }), 250)
    }, 900)
  },

  onPick(e: WechatMiniprogram.TouchEvent) {
    if (this.data.phase !== 'pick') return
    const i = Number(e.currentTarget.dataset.i)
    const target = this.data.wheelCards[i]
    if (!target || target.picked) return
    const k = this.picks.length
    if (k >= this.data.total) return
    this.picks.push({ id: deck[i], rev: Math.random() < REVERSE_RATE })
    wx.vibrateShort({ type: 'light' })
    this.setData({
      [`wheelCards[${i}].picked`]: true,
      [`tray[${k}].filled`]: true,
      picked: k + 1,
    })
    if (k + 1 === this.data.total) {
      later(() => this.toReveal(), 700)
    }
  },

  toReveal() {
    this.setData({
      phase: 'reveal',
      cards: this.picks.map(p => ({ id: p.id, rev: p.rev, flipped: false })),
      flippedCount: 0,
    })
  },

  onFlip(e: WechatMiniprogram.CustomEvent<{ index: number }>) {
    const i = e.detail.index
    if (this.data.cards[i].flipped) return
    wx.vibrateShort({ type: 'light' })
    this.setData({
      [`cards[${i}].flipped`]: true,
      flippedCount: this.data.flippedCount + 1,
    })
  },

  flipAll() {
    const cards = this.data.cards
    let delay = 0
    cards.forEach((c, i) => {
      if (c.flipped) return
      later(() => this.onFlip({ detail: { index: i } } as WechatMiniprogram.CustomEvent<{ index: number }>), delay)
      delay += 220
    })
  },

  viewResult() {
    const draft = getDraft()!
    const record: ReadingRecord = {
      id: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
      spreadId: draft.spreadId,
      topic: draft.topic,
      question: draft.question,
      options: draft.options,
      cards: this.picks,
      time: Date.now(),
    }
    saveRecord(record)
    wx.redirectTo({ url: `/tarot/pages/result/result?id=${record.id}&fresh=1` })
  },
})
