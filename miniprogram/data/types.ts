export type RawCard = [
  string, string, string, string, string, number,
  string, string, string, string, string, string, string, string, string,
]

export type Suit = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'
export type Topic = 'general' | 'love' | 'career' | 'wealth'

export interface TarotCard {
  id: string
  index: number
  name: string
  en: string
  suit: Suit
  suitName: string
  element: string
  kw: string[]
  kwRev: string[]
  tone: number
  up: string
  rev: string
  love: [string, string]
  career: [string, string]
  wealth: [string, string]
  advice: string
  image: string
  thumb: string
}

export interface DrawnCard {
  id: string
  rev: boolean
}

export interface ReadingRecord {
  id: string
  spreadId: string
  topic: Topic
  question: string
  options?: string[]
  cards: DrawnCard[]
  time: number
}

// 牌阵组件中展示的牌
export interface LayoutCard {
  id: string
  rev: boolean
  flipped: boolean
}
