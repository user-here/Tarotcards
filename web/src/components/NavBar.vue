<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = withDefaults(defineProps<{
  title?: string
  // 页面滚动后才显示的标题
  scrollTitle?: string
  back?: boolean
  solid?: boolean
}>(), { title: '', scrollTitle: '', back: true, solid: false })

const router = useRouter()
const scrolled = ref(false)
const isRoot = ref(window.history.length <= 1 || !window.history.state?.back)

const shownTitle = computed(() => props.title || (scrolled.value ? props.scrollTitle : ''))

function onScroll() {
  scrolled.value = window.scrollY > 20
}

function onBack() {
  if (window.history.state?.back) router.back()
  else router.replace('/')
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="p-navbar">
    <div class="nav fixed-col" :class="{ solid: solid || scrolled }" style="height: calc(44px + env(safe-area-inset-top)); padding-top: env(safe-area-inset-top);">
      <div class="nav-inner" style="padding: 0 56px;">
        <div v-if="back" class="nav-btn" style="width: 56px;" role="button" :aria-label="isRoot ? '首页' : '返回'" @click="onBack">
          <div class="icon" :class="isRoot ? 'icon-home' : 'icon-back'"></div>
        </div>
        <div v-else class="nav-left" style="width: 56px;"><slot name="left" /></div>
        <div class="nav-title serif">{{ shownTitle }}</div>
      </div>
    </div>
    <div style="height: calc(44px + env(safe-area-inset-top));"></div>
  </div>
</template>
