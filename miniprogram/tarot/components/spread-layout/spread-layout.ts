import { getCard } from '../../../data/cards'
import { getSpread } from '../../../data/spreads'
import { LayoutCard } from '../../../data/types'

interface Slot {
  left: number
  top: number
  rotate: number
  name: string
  num: number
  image: string
  cardName: string
  rev: boolean
  flipped: boolean
}

const LAYOUT_WIDTH = 690

Component({
  properties: {
    spreadId: { type: String, value: 'single' },
    cards: { type: Array, value: [] },
    // 是否在翻开后显示牌名
    showNames: { type: Boolean, value: true },
    // 是否播放发牌动画
    deal: { type: Boolean, value: true },
    // 高亮的牌位序号（-1 表示无）
    active: { type: Number, value: -1 },
  },
  data: {
    height: 400,
    cw: 200,
    ch: 348,
    compact: false,
    slots: [] as Slot[],
  },
  observers: {
    'spreadId, cards'(spreadId: string, cards: LayoutCard[]) {
      const spread = getSpread(spreadId)
      const cw = spread.cardWidth
      const ch = Math.round(cw * 1.74)
      const slots: Slot[] = spread.positions.map((p, i) => {
        const c = cards[i]
        const card = c ? getCard(c.id) : null
        return {
          left: (p.x / 100) * LAYOUT_WIDTH - cw / 2,
          top: (p.y / 100) * spread.height - ch / 2,
          rotate: p.rotate || 0,
          name: p.name,
          num: i + 1,
          image: card ? card.image : '',
          cardName: card ? card.name : '',
          rev: c ? c.rev : false,
          flipped: c ? c.flipped : false,
        }
      })
      this.setData({ height: spread.height, cw, ch, compact: !!spread.compact, slots })
    },
  },
  methods: {
    onTap(e: WechatMiniprogram.TouchEvent) {
      this.triggerEvent('cardtap', { index: e.currentTarget.dataset.index })
    },
  },
})
