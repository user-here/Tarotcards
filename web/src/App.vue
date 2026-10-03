<script setup lang="ts">
import Cosmos from './components/Cosmos.vue'
</script>

<template>
  <Cosmos />
  <router-view v-slot="{ Component, route }">
    <transition name="route" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>
</template>
