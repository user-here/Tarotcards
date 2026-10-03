<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { src } from '@/lib/ui'
</script>

<template>
  <div class="p-about">
    <NavBar title="关于与声明" />
    <div class="wrap">
      <div class="logo-box fade-up">
        <img class="logo" :src="src('/assets/card-back.jpg')" alt="星语塔罗" />
        <div class="name serif">星语塔罗</div>
        <div class="ver">Web Version 1.0.0</div>
      </div>

      <div class="panel sec fade-up d1">
        <div class="t serif">关于</div>
        <div class="p">星语塔罗是一款以塔罗牌为载体的心灵探索小工具。我们希望你在忙碌的日常中，留出片刻与自己对话，借由牌面上的象征，换一个角度看待生活。</div>
      </div>
      <div class="panel sec fade-up d2">
        <div class="t serif">免责声明</div>
        <div class="p">本站所有占卜结果均由随机抽牌与预设牌义生成，仅供娱乐与自我探索参考，不构成任何医疗、法律、投资或人生决策建议。请理性看待，切勿迷信。</div>
      </div>
      <div class="panel sec fade-up d3">
        <div class="t serif">隐私说明</div>
        <div class="p">我们不收集你的任何个人信息，也没有服务器。你的问题、占卜记录与每日一牌仅保存在当前浏览器的本地存储中，清除浏览器数据或在“我的星盘”页面清除后即会消失。</div>
      </div>
      <div class="panel sec fade-up d4">
        <div class="t serif">图像来源</div>
        <div class="p">牌面基于 1909 年出版的韦特塔罗（Rider–Waite–Smith Tarot），由 Pamela Colman Smith 绘制，现已进入公有领域。本站在原作线稿基础上重新着色为“金线夜幕”风格；牌背与界面图形为原创设计。</div>
      </div>
      <div class="foot">愿星光照亮你前行的路 ✦</div>
      <div class="safe-bottom"></div>
    </div>
  </div>
</template>
