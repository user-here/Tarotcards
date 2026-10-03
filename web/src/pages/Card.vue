<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CARDS, getCard } from '@mp/data/cards'
import NavBar from '@/components/NavBar.vue'
import { share, src, vibrate } from '@/lib/ui'

const route = useRoute()
const router = useRouter()
const card = computed(() => getCard(String(route.params.id)) || CARDS[0])
const rev = ref(route.query.rev === '1')
watch(() => route.params.id, () => { rev.value = false })

const prev = computed(() => (card.value.index > 0 ? CARDS[card.value.index - 1].id : ''))
const next = computed(() => (card.value.index < CARDS.length - 1 ? CARDS[card.value.index + 1].id : ''))
const sections = computed(() => {
  const c = card.value
  const k = rev.value ? 1 : 0
  return [
    { title: rev.value ? '逆位牌义' : '正位牌义', text: rev.value ? c.rev : c.up },
    { title: '爱情', text: c.love[k] },
    { title: '事业学业', text: c.career[k] },
    { title: '财富', text: c.wealth[k] },
  ]
})

function setRev(v: boolean) {
  if (v === rev.value) return
  vibrate()
  rev.value = v
}

function go(id: string) {
  if (!id) return
  router.replace('/card/' + id)
}

function doShare() {
  const c = card.value
  share(`塔罗牌「${c.name}」的含义：${c.kw.slice(0, 3).join('、')}`, location.href)
}
</script>

<template>
  <div class="p-card">
    <NavBar :scroll-title="card.name" />
    <div class="wrap">
      <div class="stage">
        <div class="halo"></div>
        <div :key="card.id" class="big fade-in" role="button" @click="setRev(!rev)">
          <img class="img" :class="{ rev }" :src="src(card.image)" :alt="card.name" />
        </div>
        <div class="hint">轻触切换正逆位</div>
      </div>

      <div class="title-box">
        <div class="suit">{{ card.suitName }} · {{ card.element }}</div>
        <div class="name serif">{{ card.name }}</div>
        <div class="en">{{ card.en }}</div>
      </div>

      <div class="seg">
        <div class="seg-item" :class="{ on: !rev }" @click="setRev(false)">正位</div>
        <div class="seg-item" :class="{ on: rev }" @click="setRev(true)">逆位</div>
      </div>

      <div class="kw"><span v-for="k in rev ? card.kwRev : card.kw" :key="k" class="chip">{{ k }}</span></div>

      <div v-for="s in sections" :key="s.title" class="sec panel">
        <div class="sec-title serif">{{ s.title }}</div>
        <div class="sec-text">{{ s.text }}</div>
      </div>

      <div class="advice">
        <div class="advice-l"><div class="icon icon-spark"></div>这张牌想对你说</div>
        <div class="advice-t serif">{{ card.advice }}</div>
      </div>

      <div class="pager">
        <div class="pg" :class="{ off: !prev }" @click="go(prev)">‹ 上一张</div>
        <div class="pg-mid" role="button" @click="doShare">{{ card.index + 1 }} / 78 · 分享</div>
        <div class="pg" :class="{ off: !next }" @click="go(next)">下一张 ›</div>
      </div>
      <div class="safe-bottom"></div>
    </div>
  </div>
</template>
