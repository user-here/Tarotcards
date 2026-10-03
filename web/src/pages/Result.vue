<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSpread, topicName } from '@mp/data/spreads'
import type { DrawnCard, ReadingRecord, Topic } from '@mp/data/types'
import { formatTime } from '@mp/utils/format'
import { buildReading } from '@mp/utils/reading'
import { getRecord } from '@mp/utils/storage'
import NavBar from '@/components/NavBar.vue'
import SpreadLayout from '@/components/SpreadLayout.vue'
import { share, src, toast } from '@/lib/ui'

// 分享链接中的牌：m19.0,w03.1（.1 表示逆位）
const encodeCards = (cards: DrawnCard[]) => cards.map(c => `${c.id}.${c.rev ? 1 : 0}`).join(',')
const decodeCards = (s: string): DrawnCard[] =>
  s.split(',').filter(Boolean).map(x => {
    const [id, r] = x.split('.')
    return { id, rev: r === '1' }
  })

const route = useRoute()
const router = useRouter()
const q = route.query as Record<string, string | undefined>

let record: ReadingRecord | undefined
let shared = false
if (q.id) {
  record = getRecord(q.id)
} else if (q.c) {
  shared = true
  const spreadId = getSpread(q.s || 'single').id
  record = {
    id: 'shared',
    spreadId,
    topic: (q.t || 'general') as Topic,
    question: '',
    cards: decodeCards(q.c).slice(0, getSpread(spreadId).positions.length),
    time: Number(q.ts) || Date.now(),
  }
}

const ready = !!record && record.cards.length > 0
if (!ready) {
  toast('记录不存在')
  setTimeout(() => router.replace('/'), 1200)
}

const reading = ready ? buildReading(record!) : null
const layoutCards = ready ? record!.cards.map(c => ({ id: c.id, rev: c.rev, flipped: true })) : []
const tName = ready ? topicName(record!.topic) : ''
const timeText = ready ? formatTime(record!.time) : ''
const fresh = q.fresh === '1'
const active = ref(-1)

async function onCardTap(i: number) {
  active.value = i
  await nextTick()
  const el = document.getElementById('item-' + i)
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' })
}

function openCard(id: string, rev: boolean) {
  router.push({ path: '/card/' + id, query: { rev: rev ? '1' : '0' } })
}

function again() {
  const from = window.history.state?.back as string | undefined
  if (from && from.startsWith('/question/')) router.back()
  else router.replace('/question/' + record!.spreadId)
}

function doShare() {
  const r = record!
  const first = reading!.items[0]
  const query = `s=${r.spreadId}&t=${r.topic}&ts=${r.time}&c=${encodeURIComponent(encodeCards(r.cards))}`
  const url = `${location.origin}${location.pathname}#/result?${query}`
  share(`我用「${reading!.spread.name}」抽到了${first.card.name}${first.rev ? '（逆位）' : ''}，来看看塔罗怎么说`, url)
}
</script>

<template>
  <div class="p-result">
    <NavBar scroll-title="塔罗解读" />
    <div v-if="ready && reading && record" class="wrap">
      <div v-if="shared" class="shared-banner fade-in">
        <div class="icon icon-spark"></div>
        <span>这是好友分享给你的塔罗解读</span>
      </div>

      <div class="head fade-up">
        <div class="head-meta">
          <span class="meta-tag">{{ reading.spread.name }}</span>
          <span class="meta-tag">{{ tName }}</span>
          <span class="meta-time">{{ timeText }}</span>
        </div>
        <div class="head-q serif">{{ record.question ? `“${record.question}”` : '心中默念的问题' }}</div>
        <div v-if="record.options && (record.options[0] || record.options[1])" class="head-opts">
          <span>A：{{ record.options[0] || '选项 A' }}</span>
          <span>B：{{ record.options[1] || '选项 B' }}</span>
        </div>
      </div>

      <div class="layout-box fade-up d1">
        <SpreadLayout :spread-id="record.spreadId" :cards="layoutCards" :deal="fresh" :active="active" @cardtap="onCardTap" />
        <div class="layout-tip">轻触牌面，查看对应解读</div>
      </div>

      <div class="energy panel fade-up d2" :class="reading.energy.level">
        <div class="energy-top">
          <div>
            <div class="energy-label">整体能量</div>
            <div class="energy-value serif">{{ reading.energy.label }}</div>
          </div>
          <div class="energy-score">
            <span class="score-num serif">{{ reading.energy.score }}</span>
            <span class="score-unit">/100</span>
          </div>
        </div>
        <div class="bar"><div class="bar-fill" :style="{ width: reading.energy.score + '%' }"></div></div>
        <div class="energy-desc">{{ reading.energy.desc }}</div>
        <div class="stats">
          <div class="stat"><span class="stat-n serif">{{ reading.majors }}</span><span class="stat-l">大阿卡纳</span></div>
          <div class="stat"><span class="stat-n serif">{{ reading.items.length - reading.reversed }}</span><span class="stat-l">正位</span></div>
          <div class="stat"><span class="stat-n serif">{{ reading.reversed }}</span><span class="stat-l">逆位</span></div>
        </div>
        <div class="elements">
          <div v-for="el in reading.elements" :key="el.key" class="el" :class="'el-' + el.key">
            <div class="el-dot"></div>
            <span class="el-name">{{ el.name }}</span>
            <span class="el-count">{{ el.count }}</span>
          </div>
        </div>
      </div>

      <div class="section-title fade-up d3"><div class="t">逐张解读</div></div>
      <div
        v-for="(item, index) in reading.items"
        :id="'item-' + index"
        :key="index"
        class="item panel fade-up"
        :class="{ active: active === index }"
      >
        <div class="item-head">
          <div class="pos-badge">{{ index + 1 }}</div>
          <div>
            <div class="pos-name serif">{{ item.pos.name }}</div>
            <div class="pos-desc">{{ item.pos.desc }}</div>
          </div>
        </div>
        <div class="item-body">
          <div class="item-card tap" role="button" @click="openCard(item.card.id, item.rev)">
            <img class="item-img" :class="{ rev: item.rev }" :src="src(item.card.image)" :alt="item.card.name" />
          </div>
          <div class="item-info">
            <div class="card-name serif">{{ item.card.name }}<span class="name-tag" :class="item.rev ? 'tag-rev' : 'tag-up'">{{ item.rev ? '逆位' : '正位' }}</span></div>
            <div class="card-en">{{ item.card.en }}</div>
            <div class="kw"><span v-for="k in item.keywords" :key="k" class="chip">{{ k }}</span></div>
          </div>
        </div>
        <div class="item-text">{{ item.general }}</div>
        <div v-if="item.topical" class="item-topic">
          <div class="topic-label">{{ tName }}指引</div>
          <div class="topic-text">{{ item.topical }}</div>
        </div>
      </div>

      <div class="section-title"><div class="t">综合解读</div></div>
      <div class="summary panel">
        <div v-for="p in reading.summary" :key="p" class="sum-p">{{ p }}</div>
        <div class="advice">
          <div class="advice-label"><div class="icon icon-spark"></div>星语寄言</div>
          <div class="advice-text serif">{{ reading.keyAdvice }}</div>
        </div>
      </div>

      <div class="actions">
        <button v-if="shared" class="btn btn-primary" @click="router.replace('/')">我也来抽一次</button>
        <template v-else>
          <button class="btn btn-primary" @click="doShare"><div class="icon icon-share btn-icon"></div>分享给好友</button>
          <div class="actions-row">
            <button class="btn btn-ghost half" @click="again">再问一次</button>
            <button class="btn btn-ghost half" @click="router.replace('/')">返回首页</button>
          </div>
        </template>
      </div>

      <div class="disclaimer">塔罗呈现的是当下的能量趋势，而非注定的结局。结果仅供娱乐参考，请理性看待。</div>
      <div class="safe-bottom"></div>
    </div>
  </div>
</template>
