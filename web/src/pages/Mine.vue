<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CARDS, getCard } from '@mp/data/cards'
import { clearAll, getRecords, getSeen, getStreak } from '@mp/utils/storage'
import NavBar from '@/components/NavBar.vue'
import { confirmDialog, share, src, toast } from '@/lib/ui'

const router = useRouter()
const stats = ref(load())

function load() {
  const records = getRecords()
  const seen = getSeen().length
  const counter: Record<string, number> = {}
  records.forEach(r => r.cards.forEach(c => { counter[c.id] = (counter[c.id] || 0) + 1 }))
  let favId = ''
  Object.keys(counter).forEach(id => { if (!favId || counter[id] > counter[favId]) favId = id })
  const fav = favId && counter[favId] > 1 ? getCard(favId) : null
  return {
    readings: records.length,
    streak: getStreak(),
    seen,
    percent: Math.round((seen / CARDS.length) * 100),
    favorite: fav ? { id: fav.id, name: fav.name, thumb: src(fav.thumb), count: counter[favId] } : null,
  }
}

async function clear() {
  const ok = await confirmDialog('清除本地数据', '将删除所有占卜记录、每日一牌与收集进度，且无法恢复。', '清除')
  if (!ok) return
  clearAll()
  toast('已清除')
  stats.value = load()
}

function doShare() {
  share('星语塔罗 · 抽一张牌，听听内心的声音', `${location.origin}${location.pathname}`)
}

const menu = [
  { icon: 'icon-history', name: '占卜记录', url: '/history' },
  { icon: 'icon-cards', name: '塔罗图鉴', url: '/gallery' },
  { icon: 'icon-book', name: '入门指南', url: '/guide' },
]
</script>

<template>
  <div class="p-mine">
    <NavBar title="我的星盘" />
    <div class="wrap">
      <div class="profile fade-up">
        <div class="emblem">
          <div class="emblem-ring"></div>
          <div class="icon icon-moon"></div>
        </div>
        <div class="p-name serif">星语旅人</div>
        <div class="p-sub">每一次抽牌，都是与自己的一次对话</div>
      </div>

      <div class="stats panel fade-up d1">
        <div class="stat"><span class="n serif">{{ stats.readings }}</span><span class="l">占卜次数</span></div>
        <div class="sep"></div>
        <div class="stat"><span class="n serif">{{ stats.streak }}</span><span class="l">连续翻牌</span></div>
        <div class="sep"></div>
        <div class="stat"><span class="n serif">{{ stats.seen }}</span><span class="l">已收集</span></div>
      </div>

      <div class="collect panel fade-up d2 tap" role="button" @click="router.push('/gallery')">
        <div class="c-head">
          <span class="serif c-title">图鉴收集</span>
          <span class="c-num">{{ stats.seen }} / {{ CARDS.length }}</span>
        </div>
        <div class="c-bar"><div class="c-fill" :style="{ width: stats.percent + '%' }"></div></div>
        <div class="c-tip">{{ stats.percent >= 100 ? '你已集齐全部 78 张塔罗牌 ✦' : '抽到的牌会自动点亮，去集齐全部 78 张吧' }}</div>
      </div>

      <div v-if="stats.favorite" class="fav panel fade-up d3 tap" role="button" @click="router.push('/card/' + stats.favorite.id)">
        <img class="fav-img" :src="stats.favorite.thumb" :alt="stats.favorite.name" />
        <div class="fav-info">
          <div class="fav-l">与你最有缘的牌</div>
          <div class="fav-name serif">{{ stats.favorite.name }}</div>
          <div class="fav-c">在你的占卜中出现了 {{ stats.favorite.count }} 次</div>
        </div>
        <div class="icon icon-chevron"></div>
      </div>

      <div class="menu panel fade-up d4">
        <div v-for="m in menu" :key="m.url" class="row" @click="router.push(m.url)">
          <div class="icon" :class="m.icon"></div><span class="row-t">{{ m.name }}</span><div class="icon icon-chevron"></div>
        </div>
        <div class="row" @click="doShare">
          <div class="icon icon-share"></div><span class="row-t">分享给好友</span><div class="icon icon-chevron"></div>
        </div>
        <div class="row" @click="router.push('/about')">
          <div class="icon icon-info"></div><span class="row-t">关于与声明</span><div class="icon icon-chevron"></div>
        </div>
        <div class="row" @click="clear">
          <div class="icon icon-trash"></div><span class="row-t">清除本地数据</span><div class="icon icon-chevron"></div>
        </div>
      </div>

      <div class="disclaimer">所有数据仅保存在你的浏览器本地</div>
      <div class="safe-bottom"></div>
    </div>
  </div>
</template>
