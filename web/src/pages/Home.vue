<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { SPREADS } from '@mp/data/spreads'
import { getDailyFortune } from '@mp/utils/daily'
import { greeting, prettyDate } from '@mp/utils/format'
import NavBar from '@/components/NavBar.vue'
import { rpx, src } from '@/lib/ui'

const router = useRouter()

// 把牌阵布局缩小成示意图
function miniLayout(i: number) {
  const s = SPREADS[i]
  const box = 108
  const scale = Math.min(box / 690, box / s.height) * 0.92
  const w = 690 * scale
  const h = s.height * scale
  const cw = Math.max(10, s.cardWidth * scale)
  const ch = cw * 1.74
  return s.positions.map(p => ({
    left: (box - w) / 2 + (p.x / 100) * w - cw / 2,
    top: (box - h) / 2 + (p.y / 100) * h - ch / 2,
    width: cw,
    height: ch,
    rotate: p.rotate || 0,
  }))
}

const spreads = SPREADS.map((s, i) => ({
  id: s.id, name: s.name, sub: s.sub, desc: s.desc, tag: s.tag,
  count: s.positions.length, rects: miniLayout(i),
}))

const f = getDailyFortune()
const now = new Date()
const date = prettyDate(now)
const greet = greeting(now)
const daily = ref({
  revealed: f.revealed,
  name: f.card.name,
  rev: f.rev,
  thumb: src(f.card.thumb),
  overall: f.overall,
  keywords: (f.rev ? f.card.kwRev : f.card.kw).slice(0, 3),
})
const stars = [1, 2, 3, 4, 5]

const entries = [
  { url: '/gallery', icon: 'icon-cards', name: '塔罗图鉴' },
  { url: '/history', icon: 'icon-history', name: '占卜记录' },
  { url: '/guide', icon: 'icon-book', name: '入门指南' },
  { url: '/mine', icon: 'icon-moon', name: '我的星盘' },
]
</script>

<template>
  <div class="p-index">
    <NavBar :back="false" scroll-title="星语塔罗" />
    <div class="wrap">
      <div class="hero fade-up">
        <div class="date">{{ date }}</div>
        <div class="brand serif">星语塔罗</div>
        <div class="greet">{{ greet }}</div>
      </div>

      <div class="daily panel fade-up d1 tap" role="button" @click="router.push('/daily')">
        <div class="daily-glow"></div>
        <div class="daily-card" :class="{ floating: !daily.revealed }">
          <img v-if="daily.revealed" class="daily-img" :class="{ rev: daily.rev }" :src="daily.thumb" :alt="daily.name" />
          <img v-else class="daily-img" :src="src('/assets/card-back.jpg')" alt="牌背" />
        </div>
        <div class="daily-info">
          <div class="daily-label"><div class="icon icon-spark"></div>今日之牌</div>
          <template v-if="daily.revealed">
            <div class="daily-name serif">{{ daily.name }}<span class="daily-tag" :class="daily.rev ? 'tag-rev' : 'tag-up'">{{ daily.rev ? '逆位' : '正位' }}</span></div>
            <div class="stars-row daily-stars">
              <span class="muted small">综合运势</span>
              <div v-for="s in stars" :key="s" class="icon" :class="s <= daily.overall ? 'icon-star-on' : 'icon-star-off'"></div>
            </div>
            <div class="daily-kw"><span v-for="k in daily.keywords" :key="k" class="chip">{{ k }}</span></div>
            <div class="daily-link">查看今日运势 ›</div>
          </template>
          <template v-else>
            <div class="daily-name serif">翻开今天的指引</div>
            <div class="daily-desc">每天一张牌，看看宇宙想对你说什么</div>
            <div class="daily-cta">立即揭晓</div>
          </template>
        </div>
      </div>

      <div class="entries fade-up d2">
        <div v-for="e in entries" :key="e.url" class="entry tap" role="button" @click="router.push(e.url)">
          <div class="entry-icon"><div class="icon" :class="e.icon"></div></div>
          <span>{{ e.name }}</span>
        </div>
      </div>

      <div class="section-title fade-up d3">
        <div class="t">选择牌阵</div>
        <div class="more">静心 · 默念 · 抽牌</div>
      </div>

      <div class="spreads">
        <div
          v-for="(item, index) in spreads"
          :key="item.id"
          class="spread panel fade-up tap"
          :class="'d' + Math.min(index + 3, 6)"
          role="button"
          @click="router.push('/question/' + item.id)"
        >
          <div class="mini">
            <div
              v-for="(r, ri) in item.rects"
              :key="ri"
              class="mini-card"
              :style="{ left: rpx(r.left), top: rpx(r.top), width: rpx(r.width), height: rpx(r.height), transform: `rotate(${r.rotate}deg)` }"
            ></div>
          </div>
          <div class="spread-body">
            <div class="spread-head">
              <span class="spread-name serif">{{ item.name }}</span>
              <span class="spread-tag">{{ item.tag }}</span>
            </div>
            <div class="spread-sub">{{ item.sub }}</div>
            <div class="spread-desc">{{ item.desc }}</div>
          </div>
          <div class="spread-count">
            <span class="num serif">{{ item.count }}</span>
            <span class="unit">张</span>
          </div>
        </div>
      </div>

      <div class="disclaimer">塔罗是一面映照内心的镜子，结果仅供娱乐与自我探索参考<br />真正决定未来的，始终是你自己</div>
      <div class="safe-bottom"></div>
    </div>
  </div>
</template>
