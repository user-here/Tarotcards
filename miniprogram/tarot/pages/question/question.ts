import { getSpread, Spread, TOPICS } from '../../../data/spreads'
import { Topic } from '../../../data/types'
import { setDraft } from '../../../utils/session'

const MEDITATE_MS = 3600

let timer: number | null = null

Page({
  data: {
    spread: null as Spread | null,
    positionNames: '',
    topics: TOPICS,
    topic: 'general' as Topic,
    hint: '',
    question: '',
    optionA: '',
    optionB: '',
    meditating: false,
    leaving: false,
  },

  onLoad(query: Record<string, string | undefined>) {
    const spread = getSpread(query.spread || 'single')
    const topic = spread.topic
    this.setData({
      spread,
      topic,
      positionNames: spread.positions.map(p => p.name).join(' · '),
      hint: TOPICS.find(t => t.key === topic)!.hint,
    })
  },

  onHide() {
    this.stopMeditate()
  },

  onUnload() {
    this.stopMeditate()
  },

  pickTopic(e: WechatMiniprogram.TouchEvent) {
    const topic = e.currentTarget.dataset.key as Topic
    if (topic === this.data.topic) return
    wx.vibrateShort({ type: 'light' })
    this.setData({ topic, hint: TOPICS.find(t => t.key === topic)!.hint })
  },

  onInput(e: WechatMiniprogram.Input) {
    this.setData({ question: e.detail.value })
  },

  onOptionA(e: WechatMiniprogram.Input) {
    this.setData({ optionA: e.detail.value })
  },

  onOptionB(e: WechatMiniprogram.Input) {
    this.setData({ optionB: e.detail.value })
  },

  start() {
    const spread = this.data.spread!
    setDraft({
      spreadId: spread.id,
      topic: this.data.topic,
      question: this.data.question.trim(),
      options: spread.needOptions ? [this.data.optionA.trim(), this.data.optionB.trim()] : undefined,
    })
    this.setData({ meditating: true, leaving: false })
    timer = setTimeout(() => this.enterDraw(), MEDITATE_MS) as unknown as number
  },

  skipMeditate() {
    this.enterDraw()
  },

  enterDraw() {
    if (!this.data.meditating) return
    this.stopMeditate()
    wx.navigateTo({
      url: '/tarot/pages/draw/draw',
      success: () => {
        // 返回本页时冥想层已收起
        setTimeout(() => this.setData({ meditating: false }), 400)
      },
    })
  },

  stopMeditate() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  },

  cancelMeditate() {
    this.stopMeditate()
    this.setData({ meditating: false })
  },
})
