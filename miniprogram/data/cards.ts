import { RawCard, Suit, TarotCard } from './types'
import { MAJOR, MAJOR_ASTRO } from './major'
import { WANDS } from './wands'
import { CUPS } from './cups'
import { SWORDS } from './swords'
import { PENTACLES } from './pentacles'

export const SUITS: { key: Suit; name: string; element: string; desc: string }[] = [
  { key: 'major', name: '大阿卡纳', element: '灵性', desc: '22 张大牌讲述“愚者之旅”，象征人生的重大课题与命运转折。' },
  { key: 'wands', name: '权杖', element: '火', desc: '火元素，关乎行动、热情、创造与意志力。' },
  { key: 'cups', name: '圣杯', element: '水', desc: '水元素，关乎情感、关系、直觉与内心世界。' },
  { key: 'swords', name: '宝剑', element: '风', desc: '风元素，关乎思想、沟通、冲突与真相。' },
  { key: 'pentacles', name: '星币', element: '土', desc: '土元素，关乎物质、财富、工作与身体。' },
]

const SUIT_BY_PREFIX: Record<string, Suit> = { m: 'major', w: 'wands', c: 'cups', s: 'swords', p: 'pentacles' }

function build(raw: RawCard, index: number): TarotCard {
  const [id, name, en, kw, kwRev, tone, up, rev, loveUp, loveRev, careerUp, careerRev, wealthUp, wealthRev, advice] = raw
  const suit = SUIT_BY_PREFIX[id[0]]
  const meta = SUITS.find(s => s.key === suit)!
  return {
    id, index, name, en, suit,
    suitName: meta.name,
    element: suit === 'major' ? MAJOR_ASTRO[Number(id.slice(1))] : `${meta.element}元素`,
    kw: kw.split('、'),
    kwRev: kwRev.split('、'),
    tone, up, rev,
    love: [loveUp, loveRev],
    career: [careerUp, careerRev],
    wealth: [wealthUp, wealthRev],
    advice,
    // 大阿卡纳放在主包（同时充当缩略图），小阿卡纳放在 tarot 分包，以满足单包 2MB 限制
    image: suit === 'major' ? `/assets/cards/${id}.jpg` : `/tarot/cards/${id}.jpg`,
    thumb: suit === 'major' ? `/assets/cards/${id}.jpg` : `/assets/thumbs/${id}.jpg`,
  }
}

export const CARDS: TarotCard[] = [...MAJOR, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES].map(build)

const byId: Record<string, TarotCard> = {}
CARDS.forEach(c => { byId[c.id] = c })

export function getCard(id: string): TarotCard {
  return byId[id]
}

export function cardsOfSuit(suit: Suit): TarotCard[] {
  return CARDS.filter(c => c.suit === suit)
}
