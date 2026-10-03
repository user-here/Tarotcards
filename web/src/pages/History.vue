<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCard } from '@mp/data/cards'
import { getSpread, topicName } from '@mp/data/spreads'
import { formatTime } from '@mp/utils/format'
import { clearRecords, getRecords, removeRecord } from '@mp/utils/storage'
import NavBar from '@/components/NavBar.vue'
import { confirmDialog, src, toast } from '@/lib/ui'

const router = useRouter()
const list = ref(load())

function load() {
  return getRecords().map(r => ({
    id: r.id,
    spread: getSpread(r.spreadId).name,
    topic: topicName(r.topic),
    question: r.question || '心中默念的问题',
    time: formatTime(r.time),
    thumbs: r.cards.slice(0, 3).map(c => ({ src: src(getCard(c.id).thumb), rev: c.rev })),
    names: r.cards.map(c => getCard(c.id).name).join(' · '),
  }))
}

async function remove(id: string) {
  if (!(await confirmDialog('删除记录', '确定删除这条占卜记录吗？', '删除'))) return
  removeRecord(id)
  list.value = load()
  toast('已删除')
}

async function clearAll() {
  if (!(await confirmDialog('清空记录', '确定清空全部占卜记录吗？此操作无法恢复。', '清空'))) return
  clearRecords()
  list.value = load()
}
</script>

<template>
  <div class="p-history">
    <NavBar title="占卜记录" />
    <div class="wrap">
      <template v-if="list.length">
        <div class="top">
          <span class="muted">共 {{ list.length }} 条</span>
          <span class="clear" role="button" @click="clearAll">清空</span>
        </div>
        <div
          v-for="(item, index) in list"
          :key="item.id"
          class="rec panel fade-up tap"
          :style="{ animationDelay: (index < 10 ? index * 0.05 : 0) + 's' }"
          role="button"
          @click="router.push({ path: '/result', query: { id: item.id } })"
        >
          <div class="fan">
            <img v-for="(t, ti) in item.thumbs" :key="ti" class="fan-img" :class="['f' + ti, { rev: t.rev }]" :src="t.src" alt="" />
          </div>
          <div class="rec-body">
            <div class="rec-meta">
              <span class="rec-spread">{{ item.spread }}</span>
              <span class="rec-topic">{{ item.topic }}</span>
            </div>
            <div class="rec-q serif">{{ item.question }}</div>
            <div class="rec-names">{{ item.names }}</div>
            <div class="rec-time">{{ item.time }}</div>
          </div>
          <div class="rec-del" role="button" aria-label="删除" @click.stop="remove(item.id)"><div class="icon icon-trash"></div></div>
        </div>
      </template>

      <div v-else class="empty fade-up">
        <img class="empty-img" :src="src('/assets/card-back.jpg')" alt="" />
        <div class="empty-t serif">还没有占卜记录</div>
        <div class="empty-s">每一次提问，都会在这里留下星光的痕迹</div>
        <button class="btn btn-primary empty-btn" @click="router.replace('/')">开始第一次占卜</button>
      </div>
      <div class="safe-bottom"></div>
    </div>
  </div>
</template>

<style>
.p-history .rec-del {
  align-self: flex-start;
  padding: 4px;
  margin: -4px -6px 0 4px;
  opacity: 0.55;
}

.p-history .rec-del .icon {
  width: 18px;
  height: 18px;
}
</style>
