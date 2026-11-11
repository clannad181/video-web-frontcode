<template>
  <div id="app" v-cloak>
    <MobileHeader v-if="!hideLayout" />
    <main class="main-content" :class="{ 'full-page': hideLayout }">
      <router-view :key="route.fullPath" />
    </main>
    <van-tabbar v-if="showTabbar" route safe-area-inset-bottom placeholder>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/category" icon="apps-o">分区</van-tabbar-item>
      <van-tabbar-item to="/search" icon="search">搜索</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o" :badge="unreadBadge || ''">我的</van-tabbar-item>
    </van-tabbar>

    <!-- 大会员弹窗（与桌面版同一事件协议） -->
    <VipDialog v-model:show="vipDialogShow" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import MobileHeader from './components/layout/MobileHeader.vue'
import VipDialog from './components/vip/VipDialog.vue'
import { getDisplayConfig } from './api/client'
import { getUnreadCount } from './api/message'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const hideLayout = computed(() => route.meta?.hideLayout === true)
const showTabbar = computed(() => !hideLayout.value)

const vipDialogShow = ref(false)
const unreadBadge = ref(0)
const authStore = useAuthStore()

const onOpenVipDialog = () => { vipDialogShow.value = true }

const loadUnread = async () => {
  if (!authStore.isLoggedIn) {
    unreadBadge.value = 0
    return
  }
  try {
    const count = await getUnreadCount()
    unreadBadge.value = Number(count) || 0
  } catch {
    unreadBadge.value = 0
  }
}

onMounted(() => {
  window.addEventListener('open-vip-dialog', onOpenVipDialog)
  loadUnread()
  // 轮询未读消息
  unreadTimer = setInterval(loadUnread, 60000)
})

let unreadTimer = null

onUnmounted(() => {
  window.removeEventListener('open-vip-dialog', onOpenVipDialog)
  if (unreadTimer) clearInterval(unreadTimer)
})
</script>

<style>
.main-content {
  min-height: 100vh;
}

.main-content.full-page {
  padding-top: 0;
}
</style>
