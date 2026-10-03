<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSpread, TOPICS } from '@mp/data/spreads'
import type { Topic } from '@mp/data/types'
import { setDraft } from '@mp/utils/session'
import NavBar from '@/components/NavBar.vue'
import { vibrate } from '@/lib/ui'

const MEDITATE_MS = 3600

const route = useRoute()
const router = useRouter()
const spread = getSpread(String(route.params.spread || 'single'))
const positionNames = spread.positions.map(p => p.name).join(' · ')

const topic = ref<Topic>(spread.topic)
const hint = computed(() => TOPICS.find(t => t.key === topic.value)!.hint)
const question = ref('')
const optionA = ref('')
const optionB = ref('')
const meditating = ref(false)
let timer = 0

function pickTopic(key: Topic) {
  if (key === topic.value) return
  vibrate()
  topic.value = key
}

function start() {
  setDraft({
    spreadId: spread.id,
    topic: topic.value,
    question: question.value.trim(),
    options: spread.needOptions ? [optionA.value.trim(), optionB.value.trim()] : undefined,
  })
  meditating.value = true
  timer = window.setTimeout(enterDraw, MEDITATE_MS)
}

function enterDraw() {
  if (!meditating.value) return
  clearTimeout(timer)
  router.push('/draw')
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="p-question">
    <NavBar :title="spread.name" />
    <div class="wrap">
      <div class="intro fade-up">
        <div class="intro-sub">{{ spread.sub }}</div>
        <div class="intro-desc">{{ spread.desc }}</div>
        <div class="intro-pos">
          <div class="icon icon-spark"></div>
          <span>{{ positionNames }}</span>
        </div>
      </div>

      <div class="block fade-up d1">
        <div class="label serif">你想问的方向</div>
        <div class="topics">
          <div v-for="t in TOPICS" :key="t.key" class="topic" :class="{ on: topic === t.key }" @click="pickTopic(t.key)">{{ t.name }}</div>
        </div>
      </div>

      <div class="block fade-up d2">
        <div class="label serif">写下你的问题 <span class="label-opt">（可选）</span></div>
        <div class="field panel">
          <textarea v-model="question" class="textarea" :placeholder="hint" maxlength="60" rows="3"></textarea>
          <div class="count">{{ question.length }}/60</div>
        </div>
        <div v-if="spread.needOptions" class="options">
          <div class="opt panel">
            <span class="opt-k serif">A</span>
            <input v-model="optionA" class="opt-input" placeholder="选项 A，如：留在现在的公司" maxlength="16" />
          </div>
          <div class="opt panel">
            <span class="opt-k serif">B</span>
            <input v-model="optionB" class="opt-input" placeholder="选项 B，如：接受新的offer" maxlength="16" />
          </div>
        </div>
      </div>

      <div class="tips fade-up d3">
        <div class="tips-title">提问小贴士</div>
        <div class="tip">· 用“如何 / 怎样”代替“是不是 / 会不会”，答案会更有启发</div>
        <div class="tip">· 一次只问一件事，越具体越好</div>
        <div class="tip">· 聚焦你自己能改变的部分，而非他人的想法</div>
      </div>
      <div class="bottom-space"></div>
    </div>

    <div class="footer fixed-col">
      <button class="btn btn-primary" @click="start">开始占卜</button>
    </div>

    <div v-if="meditating" class="meditate fixed-col fade-in" @click="enterDraw">
      <div class="breath">
        <div class="ring r1"></div>
        <div class="ring r2"></div>
        <div class="ring r3"></div>
        <div class="core"><div class="icon icon-moon"></div></div>
      </div>
      <div class="m-title serif">深呼吸</div>
      <div class="m-text">在心中默念你的问题</div>
      <div v-if="question" class="m-question">“{{ question }}”</div>
      <div class="m-skip">轻触屏幕继续</div>
    </div>
  </div>
</template>
