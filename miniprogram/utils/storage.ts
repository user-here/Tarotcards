import { DrawnCard, ReadingRecord } from '../data/types'
import { dateKey } from './format'

const KEY_RECORDS = 'tarot_records'
const KEY_DAILY = 'tarot_daily'
const KEY_SEEN = 'tarot_seen'
const KEY_SALT = 'tarot_salt'
const MAX_RECORDS = 100

function read<T>(key: string, fallback: T): T {
  try {
    const v = wx.getStorageSync(key)
    return v === '' || v === undefined || v === null ? fallback : (v as T)
  } catch (e) {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    wx.setStorageSync(key, value)
  } catch (e) {
    console.warn('storage write failed', key, e)
  }
}

/* ---------- 占卜记录 ---------- */

export function getRecords(): ReadingRecord[] {
  return read<ReadingRecord[]>(KEY_RECORDS, [])
}

export function getRecord(id: string): ReadingRecord | undefined {
  return getRecords().find(r => r.id === id)
}

export function saveRecord(record: ReadingRecord) {
  const list = getRecords().filter(r => r.id !== record.id)
  list.unshift(record)
  write(KEY_RECORDS, list.slice(0, MAX_RECORDS))
  markSeen(record.cards)
}

export function removeRecord(id: string) {
  write(KEY_RECORDS, getRecords().filter(r => r.id !== id))
}

export function clearRecords() {
  write(KEY_RECORDS, [])
}

/* ---------- 每日一牌 ---------- */

export interface DailyEntry {
  cardId: string
  rev: boolean
}

export function getDailyLog(): Record<string, DailyEntry> {
  return read<Record<string, DailyEntry>>(KEY_DAILY, {})
}

export function getTodayDaily(): DailyEntry | undefined {
  return getDailyLog()[dateKey()]
}

export function saveTodayDaily(entry: DailyEntry) {
  const log = getDailyLog()
  log[dateKey()] = entry
  // 只保留最近 120 天
  const keys = Object.keys(log).sort().reverse().slice(0, 120)
  const trimmed: Record<string, DailyEntry> = {}
  keys.forEach(k => { trimmed[k] = log[k] })
  write(KEY_DAILY, trimmed)
  markSeen([{ id: entry.cardId, rev: entry.rev }])
}

// 连续翻牌天数（今天未翻则从昨天起算）
export function getStreak(): number {
  const log = getDailyLog()
  let streak = 0
  const d = new Date()
  if (!log[dateKey(d)]) d.setDate(d.getDate() - 1)
  while (log[dateKey(d)]) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

/* ---------- 收集的牌 ---------- */

export function getSeen(): string[] {
  return read<string[]>(KEY_SEEN, [])
}

function markSeen(cards: DrawnCard[]) {
  const seen = getSeen()
  let changed = false
  cards.forEach(c => {
    if (seen.indexOf(c.id) < 0) {
      seen.push(c.id)
      changed = true
    }
  })
  if (changed) write(KEY_SEEN, seen)
}

/* ---------- 用户随机盐（让每位用户的每日一牌各不相同） ---------- */

export function getSalt(): string {
  let salt = read<string>(KEY_SALT, '')
  if (!salt) {
    salt = Math.random().toString(36).slice(2, 10)
    write(KEY_SALT, salt)
  }
  return salt
}

export function clearAll() {
  ;[KEY_RECORDS, KEY_DAILY, KEY_SEEN].forEach(k => wx.removeStorageSync(k))
}
