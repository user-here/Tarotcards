import { CARDS, getCard } from '../data/cards'
import { TarotCard } from '../data/types'
import { dateKey } from './format'
import { hashString, pick, seededRandom, shuffle } from './random'
import { effectiveTone } from './reading'
import { getSalt, getTodayDaily, saveTodayDaily } from './storage'

export interface LuckyColor {
  name: string
  hex: string
}

export interface DailyFortune {
  date: string
  card: TarotCard
  rev: boolean
  revealed: boolean
  scores: { key: string; name: string; value: number }[]
  overall: number
  color: LuckyColor
  number: number
  yi: string[]
  ji: string[]
}

const COLORS: LuckyColor[] = [
  { name: '星空紫', hex: '#8a6ae0' }, { name: '琥珀金', hex: '#e2b65f' },
  { name: '月光白', hex: '#f3efe4' }, { name: '薄荷绿', hex: '#7fd1b9' },
  { name: '珊瑚橙', hex: '#ff8f6b' }, { name: '雾霾蓝', hex: '#7ea6d8' },
  { name: '樱花粉', hex: '#f4a6c1' }, { name: '酒红', hex: '#b3475b' },
  { name: '天青', hex: '#5ec8e0' }, { name: '橄榄绿', hex: '#9bab5a' },
  { name: '奶茶棕', hex: '#c49a7a' }, { name: '薰衣草', hex: '#b9a6f0' },
]

const YI = [
  '整理房间', '早点睡觉', '联系老朋友', '学习新技能', '散步晒太阳', '写日记',
  '表达感谢', '尝试新餐厅', '运动出汗', '静坐冥想', '制定计划', '断舍离',
  '阅读', '听喜欢的歌', '主动表达', '复盘总结', '喝足够的水', '整理账单',
]
const JI = [
  '冲动消费', '熬夜', '背后议论', '过度承诺', '拖延', '情绪化回复',
  '暴饮暴食', '钻牛角尖', '与人争执', '盲目跟风', '久坐不动', '过度比较',
]

// 根据日期和用户盐，生成当天固定的一张牌与运势
export function getDailyFortune(date: Date = new Date()): DailyFortune {
  const key = dateKey(date)
  const rand = seededRandom(hashString(`${key}#${getSalt()}`))
  const stored = getTodayDaily()

  let card: TarotCard
  let rev: boolean
  if (stored && key === dateKey()) {
    card = getCard(stored.cardId)
    rev = stored.rev
    rand(); rand()
  } else {
    card = CARDS[Math.floor(rand() * CARDS.length)]
    rev = rand() < 0.3
  }

  const tone = effectiveTone(card, rev)
  const bonus: Record<string, string> = { cups: 'love', wands: 'career', swords: 'career', pentacles: 'wealth' }
  const score = (k: string) => {
    let v = 3 + tone * 0.7 + (rand() - 0.5) * 1.6
    if (bonus[card.suit] === k) v += 0.7
    return Math.max(1, Math.min(5, Math.round(v)))
  }
  const scores = [
    { key: 'love', name: '爱情', value: score('love') },
    { key: 'career', name: '事业', value: score('career') },
    { key: 'wealth', name: '财运', value: score('wealth') },
    { key: 'health', name: '健康', value: score('health') },
  ]
  const overall = Math.max(1, Math.min(5, Math.round(scores.reduce((a, s) => a + s.value, 0) / 4 + tone * 0.2)))

  return {
    date: key,
    card,
    rev,
    revealed: !!stored,
    scores,
    overall,
    color: pick(COLORS, rand),
    number: 1 + Math.floor(rand() * 9),
    yi: shuffle(YI, rand).slice(0, 3),
    ji: shuffle(JI, rand).slice(0, 2),
  }
}

export function revealDaily(f: DailyFortune) {
  saveTodayDaily({ cardId: f.card.id, rev: f.rev })
}
