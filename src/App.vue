<template>
  <div id="app" v-cloak>
    <MobileHeader v-if="!hideLayout" />
    <main class="main-content" :class="{ 'full-page': hideLayout }">
      <router-view v-slot="{ Component }">
        <transition :name="pageTransition" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </main>
    <van-tabbar v-if="showTabbar" route safe-area-inset-bottom placeholder class="app-tabbar">
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/category" icon="apps-o">分区</van-tabbar-item>
      <van-tabbar-item to="/contribution" class="tabbar-post">
        <span class="post-btn"><van-icon name="add" size="22" color="#fff" /></span>
        <span class="post-spacer"></span>
        <span class="post-label">投稿</span>
      </van-tabbar-item>
      <van-tabbar-item to="/history" icon="underway-o">历史记录</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o" :badge="unreadBadge || ''">我的</van-tabbar-item>
    </van-tabbar>

    <!-- 大会员弹窗（与桌面版同一事件协议） -->
    <VipDialog v-model:show="vipDialogShow" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import MobileHeader from './components/layout/MobileHeader.vue'
import VipDialog from './components/vip/VipDialog.vue'
import { getDisplayConfig } from './api/client'
import { getUnreadCount } from './api/message'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const hideLayout = computed(() => route.meta?.hideLayout === true)
const showTabbar = computed(() => !hideLayout.value)

// 页面切换过渡：进/出搜索页用滑入滑出，其余路由不加动画（保持即时切换）
const pageTransition = ref('no-anim')
watch(
  () => route.fullPath,
  (to, from) => {
    const toPath = String(to || '').split('?')[0]
    const fromPath = String(from || '').split('?')[0]
    if (toPath === '/search' && fromPath !== '/search') pageTransition.value = 'search-in'
    else if (fromPath === '/search' && toPath !== '/search') pageTransition.value = 'search-out'
    else pageTransition.value = 'no-anim'
  }
)

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

/* 搜索页过渡动画：进入时从下方滑入，离开时向下滑出 */
.search-in-enter-active {
  animation: search-page-in 0.3s cubic-bezier(0.22, 0.8, 0.36, 1);
}

.search-in-leave-active {
  animation: page-quick-fade 0.12s ease;
}

.search-out-enter-active {
  animation: page-quick-in 0.2s ease;
}

.search-out-leave-active {
  animation: search-page-out 0.2s ease-in;
}

@keyframes search-page-in {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes search-page-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(24px);
  }
}

@keyframes page-quick-fade {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes page-quick-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 底部栏：中间凸起的投稿按钮（bilibili 式） */
.app-tabbar {
  overflow: visible;
  z-index: 1001;
}

.tabbar-post {
  position: relative;
  overflow: visible;
}

.tabbar-post .van-tabbar-item__text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.post-spacer {
  display: block;
  width: 22px;
  height: 22px;
}

.post-btn {
  position: absolute;
  left: 50%;
  top: -14px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff8cb0 0%, #ff6699 100%);
  border: 3px solid var(--bg1);
  box-shadow: 0 4px 10px rgba(255, 102, 153, 0.4);
  z-index: 1;
  transition: transform 0.15s;
}

.tabbar-post:active .post-btn {
  transform: translateX(-50%) scale(0.94);
}

.post-label {
  display: block;
  font-size: 11px;
  line-height: 1;
}
</style>
