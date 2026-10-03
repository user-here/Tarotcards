import { getCard } from '../../data/cards'
import { getSpread, topicName } from '../../data/spreads'
import { formatTime } from '../../utils/format'
import { clearRecords, getRecords, removeRecord } from '../../utils/storage'

interface Row {
  id: string
  spread: string
  topic: string
  question: string
  time: string
  thumbs: { src: string; rev: boolean }[]
  names: string
}

Page({
  data: {
    list: [] as Row[],
    loaded: false,
  },

  onShow() {
    this.load()
  },

  load() {
    const list: Row[] = getRecords().map(r => ({
      id: r.id,
      spread: getSpread(r.spreadId).name,
      topic: topicName(r.topic),
      question: r.question || '心中默念的问题',
      time: formatTime(r.time),
      thumbs: r.cards.slice(0, 3).map(c => ({ src: getCard(c.id).thumb, rev: c.rev })),
      names: r.cards.map(c => getCard(c.id).name).join(' · '),
    }))
    this.setData({ list, loaded: true })
  },

  open(e: WechatMiniprogram.TouchEvent) {
    wx.navigateTo({ url: `/tarot/pages/result/result?id=${e.currentTarget.dataset.id}` })
  },

  remove(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.vibrateShort({ type: 'medium' })
    wx.showActionSheet({
      itemList: ['删除这条记录'],
      itemColor: '#e6879f',
      success: () => {
        removeRecord(id)
        this.load()
        wx.showToast({ title: '已删除', icon: 'none' })
      },
    })
  },

  clearAll() {
    wx.showModal({
      title: '清空记录',
      content: '确定清空全部占卜记录吗？此操作无法恢复。',
      confirmColor: '#e6879f',
      success: res => {
        if (res.confirm) {
          clearRecords()
          this.load()
        }
      },
    })
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },
})
