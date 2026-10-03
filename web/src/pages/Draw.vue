<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CARDS } from '@mp/data/cards'
import { getSpread } from '@mp/data/spreads'
import type { DrawnCard, LayoutCard, ReadingRecord } from '@mp/data/types'
import { shuffle } from '@mp/utils/random'
import { getDraft } from '@mp/utils/session'
import { saveRecord } from '@mp/utils/storage'
import NavBar from '@/components/NavBar.vue'
import SpreadLayout from '@/components/SpreadLayout.vue'
import { rpx, rpxToPx, src, vibrate } from '@/lib/ui'

type Phase = 'shuffle' | 'cut' | 'cutting' | 'pick' | 'reveal'

const WHEEL_RADIUS = 720
const REVERSE_RATE = 0.35

const router = useRouter()
const draft = getDraft()
const spread = getSpread(draft ? draft.spreadId : 'single')
const total = spread.positions.length

const phase = ref<Phase>('shuffle')
const deck = shuffle(CARDS.map(c => c.id))
const step = 360 / deck.length
const wheelCards = ref(deck.map((_, i) => ({ i, angle: i * step, picked: false })))
const tray = ref(spread.positions.map(p => ({ name: p.name, filled: false })))
const trayW = Math.min(104, Math.floor((690 - 12 * (total - 1)) / total))
const trayCompact = total > 5
const picks: DrawnCard[] = []
const picked = ref(0)
const cards = ref<LayoutCard[]>([])
const flippedCount = ref(0)

const timers: number[] = []
const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms))

onMounted(() => {
  if (!draft) {
    router.replace('/')
    return
  }
  later(() => { phase.value = 'cut' }, 2600)
})

onBeforeUnmount(() => {
  timers.forEach(t => clearTimeout(t))
  cancelAnimationFrame(raf)
})

function onCut() {
  if (phase.value !== 'cut') return
  vibrate(20)
  phase.value = 'cutting'
  later(() => {
    phase.value = 'pick'
    later(() => kick(), 250)
  }, 900)
}

/* ---------- 牌轮手势：直接改 DOM 样式，避免响应式更新带来的卡顿 ---------- */
const wheelEl = ref<HTMLElement | null>(null)
let angle = 0
let velocity = 0 // 度/毫秒
let dragging = false
let moved = false
let x0 = 0
let base = 0
let lastX = 0
let lastT = 0
let raf = 0

function degPerPx() {
  return (180 / Math.PI) / rpxToPx(WHEEL_RADIUS - 100)
}

function apply() {
  if (wheelEl.value) wheelEl.value.style.transform = `rotate(${angle}deg)`
}

function spin() {
  velocity *= 0.955
  angle += velocity * 16
  apply()
  if (Math.abs(velocity) < 0.004) return
  raf = requestAnimationFrame(spin)
}

function kick() {
  velocity = -0.9
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(spin)
}

function onDown(e: PointerEvent) {
  cancelAnimationFrame(raf)
  dragging = true
  moved = false
  x0 = lastX = e.clientX
  lastT = performance.now()
  velocity = 0
  base = angle
}

function onMove(e: PointerEvent) {
  if (!dragging) return
  const k = degPerPx()
  const t = performance.now()
  const dt = t - lastT
  if (dt > 0) velocity = velocity * 0.3 + ((e.clientX - lastX) * k / dt) * 0.7
  lastX = e.clientX
  lastT = t
  if (Math.abs(e.clientX - x0) > 6) moved = true
  angle = base + (e.clientX - x0) * k
  apply()
}

function onUp() {
  if (!dragging) return
  dragging = false
  if (performance.now() - lastT > 80) velocity = 0
  if (Math.abs(velocity) > 0.01) {
    velocity = Math.max(-1.6, Math.min(1.6, velocity))
    raf = requestAnimationFrame(spin)
  }
}

function onPick(i: number) {
  // 拖动结束时的点击不算选牌
  if (moved || phase.value !== 'pick') return
  const target = wheelCards.value[i]
  if (!target || target.picked) return
  const k = picks.length
  if (k >= total) return
  picks.push({ id: deck[i], rev: Math.random() < REVERSE_RATE })
  vibrate()
  target.picked = true
  tray.value[k].filled = true
  picked.value = k + 1
  if (k + 1 === total) later(toReveal, 700)
}

function toReveal() {
  cards.value = picks.map(p => ({ id: p.id, rev: p.rev, flipped: false }))
  flippedCount.value = 0
  phase.value = 'reveal'
  window.scrollTo(0, 0)
}

function onFlip(i: number) {
  if (cards.value[i].flipped) return
  vibrate()
  cards.value[i] = { ...cards.value[i], flipped: true }
  flippedCount.value++
}

function flipAll() {
  let delay = 0
  cards.value.forEach((c, i) => {
    if (c.flipped) return
    later(() => onFlip(i), delay)
    delay += 220
  })
}

function viewResult() {
  if (!draft) return
  const record: ReadingRecord = {
    id: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
    spreadId: draft.spreadId,
    topic: draft.topic,
    question: draft.question,
    options: draft.options,
    cards: picks,
    time: Date.now(),
  }
  saveRecord(record)
  router.replace({ path: '/result', query: { id: record.id, fresh: '1' } })
}

const back = src('/assets/card-back.jpg')
</script>

<template>
  <div class="p-draw" :class="{ locked: phase !== 'reveal' }">
    <NavBar :title="spread.name" />

    <div v-if="phase === 'shuffle' || phase === 'cut' || phase === 'cutting'" class="stage">
      <div class="stage-q serif">{{ draft && draft.question ? `“${draft.question}”` : '' }}</div>
      <div class="pile" :class="phase" role="button" @click="onCut">
        <div class="pile-glow"></div>
        <div v-for="n in 5" :key="n" class="pc" :class="'c' + n"><img :src="back" alt="" /></div>
      </div>
      <div class="stage-tip">
        <template v-if="phase === 'shuffle'">
          <div class="tip-main serif">正在洗牌</div>
          <div class="tip-sub">请在心中默念你的问题</div>
        </template>
        <template v-else-if="phase === 'cut'">
          <div class="tip-main serif glow">轻触牌堆 · 切牌</div>
          <div class="tip-sub">将你的能量注入牌中</div>
        </template>
        <template v-else>
          <div class="tip-main serif">牌已就绪</div>
          <div class="tip-sub">命运之轮即将展开</div>
        </template>
      </div>
    </div>

    <template v-if="phase === 'pick'">
      <div class="pick-head fade-in">
        <div class="pick-title serif">凭直觉选出 <span class="gold-text">{{ total }}</span> 张牌</div>
        <div class="pick-sub">左右滑动转动牌轮，轻触你有感应的那一张</div>
        <div class="tray">
          <div
            v-for="(item, index) in tray"
            :key="item.name"
            class="tray-slot"
            :class="{ filled: item.filled }"
            :style="{ width: rpx(trayW), height: rpx(trayW * 1.74) }"
          >
            <img v-if="item.filled" class="tray-img" :src="back" alt="" />
            <span v-else class="tray-num">{{ index + 1 }}</span>
            <div v-if="!trayCompact" class="tray-name">{{ item.name }}</div>
          </div>
        </div>
        <div class="pick-count">{{ picked }} / {{ total }}</div>
      </div>

      <div
        class="wheel-zone fixed-col"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
        @pointerleave="onUp"
      >
        <div ref="wheelEl" class="wheel">
          <div v-for="item in wheelCards" :key="item.i" class="wc" :style="{ transform: `rotate(${item.angle}deg)` }">
            <div class="wc-in" :class="{ picked: item.picked }" role="button" @click="onPick(item.i)">
              <img class="wc-img" :src="back" alt="" draggable="false" />
            </div>
          </div>
        </div>
        <div class="wheel-hint">‹ 滑动 ›</div>
      </div>
    </template>

    <div v-if="phase === 'reveal'" class="reveal">
      <div class="reveal-head fade-in">
        <div class="pick-title serif">{{ flippedCount < total ? '依次轻触，揭示牌面' : '牌面已全部揭示' }}</div>
        <div v-if="draft && draft.question" class="pick-sub">“{{ draft.question }}”</div>
      </div>
      <SpreadLayout :spread-id="spread.id" :cards="cards" @cardtap="onFlip" />
      <div class="reveal-actions">
        <button v-if="flippedCount < total" class="btn btn-ghost" @click="flipAll">全部翻开</button>
        <button v-else class="btn btn-primary fade-up" @click="viewResult">查看解读</button>
      </div>
      <div class="safe-bottom"></div>
    </div>
  </div>
</template>

<style>
/* 抽牌阶段禁止页面滚动，并让牌轮接管触摸手势 */
.p-draw.locked {
  height: 100vh;
  overflow: hidden;
}

.p-draw .wheel-zone {
  touch-action: none;
  user-select: none;
}
</style>
