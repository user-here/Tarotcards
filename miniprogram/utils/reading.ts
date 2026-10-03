import { getCard } from '../data/cards'
import { getSpread, Spread, SpreadPosition } from '../data/spreads'
import { DrawnCard, ReadingRecord, Suit, TarotCard, Topic } from '../data/types'

export interface ReadingItem {
  card: TarotCard
  rev: boolean
  pos: SpreadPosition
  index: number
  keywords: string[]
  general: string
  topical: string
}

export interface ElementStat {
  key: Suit
  name: string
  count: number
  pct: number
}

export interface Energy {
  level: 'bright' | 'steady' | 'caution'
  label: string
  desc: string
  score: number
}

export interface Reading {
  spread: Spread
  items: ReadingItem[]
  energy: Energy
  majors: number
  reversed: number
  elements: ElementStat[]
  summary: string[]
  keyAdvice: string
}

// 牌的“有效能量”：正位取本身倾向，逆位时积极牌减弱、消极牌反而得到缓解
export function effectiveTone(card: TarotCard, rev: boolean): number {
  if (!rev) return card.tone
  if (card.tone < 0) return Math.abs(card.tone) * 0.5
  return -card.tone * 0.5 - 0.3
}

export function meaningFor(card: TarotCard, rev: boolean, topic: Topic): string {
  const i = rev ? 1 : 0
  if (topic === 'love') return card.love[i]
  if (topic === 'career') return card.career[i]
  if (topic === 'wealth') return card.wealth[i]
  return rev ? card.rev : card.up
}

const ELEMENT_LABEL: Record<string, string> = {
  wands: '火', cups: '水', swords: '风', pentacles: '土',
}

const ELEMENT_TEXT: Record<string, string> = {
  wands: '权杖（火元素）较为突出，行动力与热情是此事的关键。想到就去做，但也要提防急躁冒进。',
  cups: '圣杯（水元素）较为突出，情感与关系是这件事的核心。比起分析利弊，更要倾听内心真实的感受。',
  swords: '宝剑（风元素）较为突出，思虑与沟通占据主导，可能伴随焦虑或摩擦。先理清思路、把话说清楚，是破局的第一步。',
  pentacles: '星币（土元素）较为突出，现实层面的考量最为重要。脚踏实地，关注具体的资源、时间与安排。',
}

// 每个牌阵中最能代表“结果/核心”的牌位
const KEY_POSITION: Record<string, number> = {
  single: 0, time: 2, insight: 2, love: 3, choice: 0, celtic: 9,
}

export function buildReading(record: Pick<ReadingRecord, 'spreadId' | 'topic' | 'cards' | 'options'>): Reading {
  const spread = getSpread(record.spreadId)
  const topic = record.topic
  const items: ReadingItem[] = record.cards.map((d: DrawnCard, i: number) => {
    const card = getCard(d.id)
    return {
      card,
      rev: d.rev,
      pos: spread.positions[i],
      index: i,
      keywords: d.rev ? card.kwRev : card.kw,
      general: d.rev ? card.rev : card.up,
      topical: topic === 'general' ? '' : meaningFor(card, d.rev, topic),
    }
  })

  const total = items.length
  const tones = items.map(it => effectiveTone(it.card, it.rev))
  const avg = tones.reduce((a, b) => a + b, 0) / total
  const score = Math.max(5, Math.min(98, Math.round(50 + avg * 24)))

  let energy: Energy
  if (avg >= 0.8) {
    energy = { level: 'bright', label: '明朗', score, desc: '牌面能量积极而通畅，顺势而为会有不错的收获。' }
  } else if (avg >= -0.2) {
    energy = { level: 'steady', label: '平稳', score, desc: '机遇与挑战并存，保持觉察，结果取决于你的选择。' }
  } else {
    energy = { level: 'caution', label: '需留心', score, desc: '能量偏向沉重，此刻更需要耐心、休整与自我照顾。' }
  }

  const majors = items.filter(it => it.card.suit === 'major').length
  const reversed = items.filter(it => it.rev).length

  const counts: Record<string, number> = { wands: 0, cups: 0, swords: 0, pentacles: 0 }
  items.forEach(it => { if (it.card.suit !== 'major') counts[it.card.suit]++ })
  const elements: ElementStat[] = (['wands', 'cups', 'swords', 'pentacles'] as Suit[]).map(key => ({
    key,
    name: ELEMENT_LABEL[key],
    count: counts[key],
    pct: total ? Math.round((counts[key] / total) * 100) : 0,
  }))

  const summary: string[] = []

  if (total === 1) {
    const it = items[0]
    summary.push(`你抽到了「${it.card.name}」${it.rev ? '逆位' : '正位'}。${it.general}`)
  } else {
    summary.push(`整体来看，牌面能量${energy.label === '需留心' ? '偏向沉重，提示你此刻需要多一些耐心与觉察' : energy.label === '明朗' ? '明朗而积极，事情正朝着好的方向流动' : '平稳，机遇与挑战并存'}。`)

    if (majors / total >= 0.5) {
      summary.push(`本次共出现 ${majors} 张大阿卡纳，说明这件事牵动着你人生中较为重要的课题，背后有更深层的力量在推动，值得认真对待。`)
    } else if (majors === 0 && total >= 3) {
      summary.push('牌面中没有大阿卡纳，此事更多取决于日常的选择与行动，主动权就握在你自己手里。')
    }

    const sorted = elements.slice().sort((a, b) => b.count - a.count)
    if (sorted[0].count >= 2 && sorted[0].count > sorted[1].count) {
      summary.push(ELEMENT_TEXT[sorted[0].key])
    }

    if (reversed / total >= 0.6) {
      summary.push('逆位牌占多数，能量有些受阻或向内收敛。与其强行推进，不如先放慢脚步、调整心态。')
    } else if (reversed === 0 && total >= 3) {
      summary.push('所有牌均为正位，能量流动顺畅，是推进计划、表达想法的好时机。')
    }

    if (record.spreadId === 'choice') {
      const a = tones[1] + tones[3]
      const b = tones[2] + tones[4]
      const opts = record.options || []
      const nameA = opts[0] ? `「${opts[0]}」` : '选项 A'
      const nameB = opts[1] ? `「${opts[1]}」` : '选项 B'
      if (Math.abs(a - b) < 0.6) {
        summary.push(`${nameA}与${nameB}的能量相差不大，两条路各有得失。不妨回到“现状”牌，想想哪一个更贴近你真正想要的生活。`)
      } else {
        const better = a > b ? nameA : nameB
        summary.push(`从牌面看，${better}的发展更为顺畅，阻力相对较小。但塔罗呈现的是趋势而非定局，最终的选择仍在于你。`)
      }
    } else {
      const k = items[KEY_POSITION[record.spreadId] || 0]
      summary.push(`「${k.pos.name}」位置上的「${k.card.name}」${k.rev ? '逆位' : '正位'}是本次解读的关键：${k.rev ? k.card.rev : k.card.up}`)
    }
  }

  const keyItem = items[KEY_POSITION[record.spreadId] || 0]
  return {
    spread, items, energy, majors, reversed, elements, summary,
    keyAdvice: keyItem.card.advice,
  }
}
