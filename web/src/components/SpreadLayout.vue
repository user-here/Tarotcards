<script setup lang="ts">
import { computed } from 'vue'
import { getCard } from '@mp/data/cards'
import { getSpread } from '@mp/data/spreads'
import type { LayoutCard } from '@mp/data/types'
import { rpx, src } from '@/lib/ui'

const LAYOUT_WIDTH = 690

const props = withDefaults(defineProps<{
  spreadId: string
  cards: LayoutCard[]
  showNames?: boolean
  deal?: boolean
  active?: number
}>(), { showNames: true, deal: true, active: -1 })

const emit = defineEmits<{ cardtap: [index: number] }>()

const view = computed(() => {
  const spread = getSpread(props.spreadId)
  const cw = spread.cardWidth
  const ch = Math.round(cw * 1.74)
  const slots = spread.positions.map((p, i) => {
    const c = props.cards[i]
    const card = c ? getCard(c.id) : null
    return {
      left: (p.x / 100) * LAYOUT_WIDTH - cw / 2,
      top: (p.y / 100) * spread.height - ch / 2,
      rotate: p.rotate || 0,
      name: p.name,
      num: i + 1,
      image: card ? src(card.image) : '',
      cardName: card ? card.name : '',
      rev: c ? c.rev : false,
      flipped: c ? c.flipped : false,
    }
  })
  return { height: spread.height, cw, ch, compact: !!spread.compact, slots }
})
</script>

<template>
  <div class="p-spread">
    <div class="layout" :style="{ height: rpx(view.height) }">
      <div
        v-for="(item, index) in view.slots"
        :key="item.num"
        class="slot"
        :class="{ deal, active: active === index }"
        :style="{
          left: rpx(item.left), top: rpx(item.top), width: rpx(view.cw), height: rpx(view.ch),
          animationDelay: index * 0.12 + 's', zIndex: item.rotate ? 5 : 1,
        }"
        role="button"
        @click="emit('cardtap', index)"
      >
        <div class="rot" :style="{ transform: `rotate(${item.rotate}deg)` }">
          <div class="flip" :class="{ flipped: item.flipped }">
            <div class="face back"><img class="img" :src="src('/assets/card-back.jpg')" alt="牌背" /></div>
            <div class="face front">
              <img v-if="item.image" class="img" :class="{ rev: item.rev }" :src="item.image" :alt="item.cardName" />
            </div>
          </div>
        </div>
        <div v-if="view.compact" class="num" :class="{ 'num-cross': item.rotate }">{{ item.num }}</div>
        <div v-else class="label">
          <div class="pos">{{ item.name }}</div>
          <div v-if="showNames && item.flipped" class="cname fade-in">{{ item.cardName }}{{ item.rev ? '·逆' : '' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
