<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { cardsOfSuit, CARDS, SUITS } from '@mp/data/cards'
import type { Suit } from '@mp/data/types'
import { getSeen } from '@mp/utils/storage'
import NavBar from '@/components/NavBar.vue'
import { src, vibrate } from '@/lib/ui'

const router = useRouter()
const seen = getSeen()
const current = ref<Suit>((sessionStorage.getItem('gallery-suit') as Suit) || 'major')
const desc = computed(() => SUITS.find(s => s.key === current.value)!.desc)
const list = computed(() =>
  cardsOfSuit(current.value).map(c => ({ id: c.id, name: c.name, image: src(c.image), seen: seen.includes(c.id) })),
)

function switchSuit(key: Suit) {
  if (key === current.value) return
  vibrate()
  current.value = key
  sessionStorage.setItem('gallery-suit', key)
  window.scrollTo(0, 0)
}
</script>

<template>
  <div class="p-gallery">
    <NavBar title="塔罗图鉴" :solid="true" />
    <div class="tabs-wrap" style="top: calc(44px + env(safe-area-inset-top));">
      <div class="tabs">
        <div v-for="s in SUITS" :key="s.key" class="tab" :class="{ on: current === s.key }" @click="switchSuit(s.key)">
          <span>{{ s.name }}</span>
        </div>
      </div>
    </div>

    <div class="wrap">
      <div class="intro">
        <div class="desc">{{ desc }}</div>
        <div class="collect">已收集 <span class="gold-text">{{ seen.length }}</span> / {{ CARDS.length }}</div>
      </div>
      <div :key="current" class="grid">
        <div
          v-for="(item, index) in list"
          :key="item.id"
          class="cell fade-up tap"
          :style="{ animationDelay: index * 0.03 + 's' }"
          role="button"
          @click="router.push('/card/' + item.id)"
        >
          <div class="thumb">
            <img class="img" :src="item.image" :alt="item.name" loading="lazy" />
            <div v-if="item.seen" class="seen"><div class="icon icon-spark"></div></div>
          </div>
          <div class="cell-name">{{ item.name }}</div>
        </div>
      </div>
      <div class="foot-tip">在占卜或每日一牌中抽到的牌会被点亮 ✦</div>
      <div class="safe-bottom"></div>
    </div>
  </div>
</template>
