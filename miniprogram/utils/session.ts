import { Topic } from '../data/types'

// 页面间传递的“本次占卜”草稿（问题文本可能较长，不放在 URL 里）
export interface Draft {
  spreadId: string
  topic: Topic
  question: string
  options?: string[]
}

let draft: Draft | null = null

export function setDraft(d: Draft) {
  draft = d
}

export function getDraft(): Draft | null {
  return draft
}
