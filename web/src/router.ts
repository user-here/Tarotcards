import { createRouter, createWebHashHistory } from 'vue-router'

// 使用 hash 路由：GitHub Pages 是静态托管，不支持任意路径回退到 index.html
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('./pages/Home.vue'), meta: { title: '星语塔罗' } },
    { path: '/question/:spread', component: () => import('./pages/Question.vue'), meta: { title: '写下问题' } },
    { path: '/draw', component: () => import('./pages/Draw.vue'), meta: { title: '抽牌' } },
    { path: '/result', component: () => import('./pages/Result.vue'), meta: { title: '塔罗解读' } },
    { path: '/daily', component: () => import('./pages/Daily.vue'), meta: { title: '今日运势' } },
    { path: '/gallery', component: () => import('./pages/Gallery.vue'), meta: { title: '塔罗图鉴' } },
    { path: '/card/:id', component: () => import('./pages/Card.vue'), meta: { title: '牌义' } },
    { path: '/mine', component: () => import('./pages/Mine.vue'), meta: { title: '我的星盘' } },
    { path: '/history', component: () => import('./pages/History.vue'), meta: { title: '占卜记录' } },
    { path: '/guide', component: () => import('./pages/Guide.vue'), meta: { title: '入门指南' } },
    { path: '/about', component: () => import('./pages/About.vue'), meta: { title: '关于与声明' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(_to, _from, saved) {
    return saved || { top: 0 }
  },
})

router.afterEach(to => {
  const t = to.meta.title as string
  document.title = t === '星语塔罗' ? '星语塔罗 · 抽一张牌，听听内心的声音' : `${t} · 星语塔罗`
})
