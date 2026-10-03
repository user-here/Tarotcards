<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getDailyFortune, revealDaily } from '@mp/utils/daily'
import { prettyDate } from '@mp/utils/format'
import { getStreak } from '@mp/utils/storage'
import NavBar from '@/components/NavBar.vue'
import { share, src, vibrate } from '@/lib/ui'

const router = useRouter()
const f = getDailyFortune()
const date = prettyDate()
const flipped = ref(f.revealed)
const showInfo = ref(f.revealed)
const streak = ref(getStreak())
const card = f.card
const rev = f.rev
const keywords = rev ? card.kwRev : card.kw
const meaning = rev ? card.rev : card.up
const stars = [1, 2, 3, 4, 5]

function flip() {
  if (flipped.value) return
  vibrate(20)
  revealDaily(f)
  flipped.value = true
  setTimeout(() => {
    showInfo.value = true
    streak.value = getStreak()
  }, 700)
}

function openCard() {
  if (!flipped.value) return flip()
  router.push({ path: '/card/' + card.id, query: { rev: rev ? '1' : '0' } })
}

function goSpreads() {
  if (window.history.state?.back) router.back()
  else router.replace('/')
}

function doShare() {
  share(`我的今日之牌是「${card.name}」，你的呢？`, `${location.origin}${location.pathname}`)
}
</script>

<template>
  <div class="p-daily">
    <NavBar title="今日运势" />
    <div class="wrap">
      <div class="head fade-up">
        <div class="date">{{ date }}</div>
        <div class="title serif">{{ flipped ? '今日之牌' : '翻开今日之牌' }}</div>
        <div v-if="streak > 0" class="streak">已连续翻牌 <span class="gold-text">{{ streak }}</span> 天</div>
      </div>

      <div class="card-stage fade-up d1" role="button" @click="openCard">
        <div class="halo" :class="{ on: flipped }"></div>
        <div class="big" :class="{ float: !flipped }">
          <div class="flip" :class="{ flipped }">
            <div class="face back"><img class="img" :src="src('/assets/card-back.jpg')" alt="牌背" /></div>
            <div class="face front"><img class="img" :class="{ rev }" :src="src(card.image)" :alt="card.name" /></div>
          </div>
        </div>
        <div v-if="!flipped" class="flip-tip">轻触卡牌 · 揭晓今日指引</div>
      </div>

      <template v-if="showInfo">
        <div class="name-box fade-up">
          <div class="name serif">{{ card.name }}<span class="name-tag" :class="rev ? 'tag-rev' : 'tag-up'">{{ rev ? '逆位' : '正位' }}</span></div>
          <div class="en">{{ card.en }} · {{ card.element }}</div>
          <div class="kw"><span v-for="k in keywords" :key="k" class="chip">{{ k }}</span></div>
        </div>

        <div class="panel block fade-up d1">
          <div class="overall">
            <span class="overall-l serif">综合运势</span>
            <div class="stars-row big-stars">
              <div v-for="s in stars" :key="s" class="icon" :class="s <= f.overall ? 'icon-star-on' : 'icon-star-off'"></div>
            </div>
          </div>
          <div class="scores">
            <div v-for="s in f.scores" :key="s.key" class="score">
              <span class="score-name">{{ s.name }}</span>
              <div class="score-bar"><div class="score-fill" :style="{ width: s.value * 20 + '%' }"></div></div>
              <span class="score-v">{{ s.value }}</span>
            </div>
          </div>
        </div>

        <div class="lucky fade-up d2">
          <div class="lucky-item panel">
            <div class="swatch" :style="{ background: f.color.hex }"></div>
            <div>
              <div class="lucky-l">幸运色</div>
              <div class="lucky-v serif">{{ f.color.name }}</div>
            </div>
          </div>
          <div class="lucky-item panel">
            <div class="lucky-num serif">{{ f.number }}</div>
            <div>
              <div class="lucky-l">幸运数字</div>
              <div class="lucky-v serif">{{ f.number }}</div>
            </div>
          </div>
        </div>

        <div class="yiji panel fade-up d3">
          <div class="yj">
            <div class="yj-k yi">宜</div>
            <div class="yj-list"><span v-for="y in f.yi" :key="y">{{ y }}</span></div>
          </div>
          <div class="yj">
            <div class="yj-k ji">忌</div>
            <div class="yj-list"><span v-for="j in f.ji" :key="j">{{ j }}</span></div>
          </div>
        </div>

        <div class="panel block message fade-up d4">
          <div class="msg-title serif">今日讯息</div>
          <div class="msg-text">{{ meaning }}</div>
          <div class="msg-advice serif">— {{ card.advice }}</div>
        </div>

        <div class="actions fade-up d5">
          <button class="btn btn-primary" @click="doShare">分享今日之牌</button>
          <div class="actions-row">
            <button class="btn btn-ghost half" @click="openCard">牌义详解</button>
            <button class="btn btn-ghost half" @click="goSpreads">去占卜</button>
          </div>
        </div>
        <div class="disclaimer">每日运势仅供娱乐，愿你拥有美好的一天</div>
      </template>
      <div class="safe-bottom"></div>
    </div>
  </div>
</template>
