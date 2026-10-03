import { Topic } from './types'

export interface SpreadPosition {
  name: string
  desc: string
  x: number // 中心点横向百分比
  y: number // 中心点纵向百分比
  rotate?: number
}

export interface Spread {
  id: string
  name: string
  sub: string
  desc: string
  tag: string
  topic: Topic
  cardWidth: number // rpx
  height: number // 牌阵区域高度 rpx（宽度固定 690rpx）
  needOptions?: boolean
  compact?: boolean // 牌位过密时以序号代替文字标签
  positions: SpreadPosition[]
}

export const SPREADS: Spread[] = [
  {
    id: 'single', name: '单牌指引', sub: 'One Card', tag: '入门',
    desc: '心中默念一个问题，抽取一张牌，获得最直接的指引。',
    topic: 'general', cardWidth: 260, height: 560,
    positions: [{ name: '指引', desc: '宇宙此刻给你的讯息', x: 50, y: 50 }],
  },
  {
    id: 'time', name: '时间之流', sub: 'Past · Present · Future', tag: '经典',
    desc: '看清一件事的来龙去脉：过去的影响、当下的状态与未来的走向。',
    topic: 'general', cardWidth: 196, height: 440,
    positions: [
      { name: '过去', desc: '影响此事的过往因素', x: 17, y: 50 },
      { name: '现在', desc: '你当下所处的状态', x: 50, y: 50 },
      { name: '未来', desc: '顺其自然的发展趋势', x: 83, y: 50 },
    ],
  },
  {
    id: 'insight', name: '困境突破', sub: 'Situation · Obstacle · Advice', tag: '实用',
    desc: '卡住了？看清现状、找到阻碍，并获得破局的建议。',
    topic: 'general', cardWidth: 196, height: 440,
    positions: [
      { name: '现状', desc: '问题的核心与当前局面', x: 17, y: 50 },
      { name: '阻碍', desc: '让你停滞不前的因素', x: 50, y: 50 },
      { name: '建议', desc: '突破困境的方向', x: 83, y: 50 },
    ],
  },
  {
    id: 'love', name: '恋人金字塔', sub: 'Lovers Pyramid', tag: '爱情',
    desc: '洞察你与 TA 的真实心意、关系现状，以及感情的未来走向。',
    topic: 'love', cardWidth: 170, height: 760,
    positions: [
      { name: '你的心意', desc: '你在这段关系中的状态与想法', x: 17, y: 72 },
      { name: '关系现状', desc: '你们之间目前的连结', x: 50, y: 72 },
      { name: 'TA 的心意', desc: '对方的状态与想法', x: 83, y: 72 },
      { name: '未来发展', desc: '这段感情可能的走向', x: 50, y: 22 },
    ],
  },
  {
    id: 'choice', name: '二选一', sub: 'Two Paths', tag: '抉择',
    desc: '面临两个选择犹豫不决？看看每条路的发展与结果。',
    topic: 'general', cardWidth: 170, height: 1040, needOptions: true,
    positions: [
      { name: '现状', desc: '你此刻的处境与心态', x: 50, y: 81 },
      { name: '选择 A 的过程', desc: '选择 A 后的发展过程', x: 27, y: 48.5 },
      { name: '选择 B 的过程', desc: '选择 B 后的发展过程', x: 73, y: 48.5 },
      { name: '选择 A 的结果', desc: '选择 A 的最终结果', x: 13, y: 16 },
      { name: '选择 B 的结果', desc: '选择 B 的最终结果', x: 87, y: 16 },
    ],
  },
  {
    id: 'celtic', name: '凯尔特十字', sub: 'Celtic Cross', tag: '深度',
    desc: '最经典的十张牌阵，全面剖析问题的内外因素与最终结果。',
    topic: 'general', cardWidth: 128, height: 980, compact: true,
    positions: [
      { name: '现状', desc: '问题的核心', x: 37.97, y: 50 },
      { name: '阻碍', desc: '横亘在你面前的挑战', x: 37.97, y: 50, rotate: 90 },
      { name: '目标', desc: '你意识层面的期望', x: 37.97, y: 25.6 },
      { name: '根基', desc: '潜意识与深层原因', x: 37.97, y: 74.4 },
      { name: '过去', desc: '正在离去的影响', x: 10.14, y: 50 },
      { name: '近未来', desc: '即将到来的发展', x: 65.8, y: 50 },
      { name: '自我', desc: '你对此事的态度', x: 89.86, y: 87.2 },
      { name: '环境', desc: '他人与外部的影响', x: 89.86, y: 62.4 },
      { name: '希望与恐惧', desc: '你内心的期待与担忧', x: 89.86, y: 37.7 },
      { name: '最终结果', desc: '事情最可能的结局', x: 89.86, y: 12.9 },
    ],
  },
]

export function getSpread(id: string): Spread {
  return SPREADS.find(s => s.id === id) || SPREADS[0]
}

export const TOPICS: { key: Topic; name: string; hint: string }[] = [
  { key: 'general', name: '综合', hint: '例如：我最近的整体运势如何？' },
  { key: 'love', name: '感情', hint: '例如：我和 TA 的关系会如何发展？' },
  { key: 'career', name: '事业学业', hint: '例如：这次面试/考试结果会如何？' },
  { key: 'wealth', name: '财富', hint: '例如：近期的财务状况需要注意什么？' },
]

export function topicName(t: Topic): string {
  const found = TOPICS.find(x => x.key === t)
  return found ? found.name : '综合'
}
