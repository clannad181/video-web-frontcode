<template>
  <header class="m-header" :class="{ opaque: opaque || route.name === 'Search' }">
    <router-link to="/" class="m-header__logo">
      <svg viewBox="0 0 32 32" width="26" height="26">
        <rect width="32" height="32" rx="6" fill="var(--brand_pink)" />
        <path d="M12 9L23 16L12 23V9Z" fill="white" />
      </svg>
    </router-link>

    <div class="m-header__search" @click="router.push('/search')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span>搜索视频、番剧</span>
    </div>

    <div class="m-header__actions">
      <div
        class="m-header__icon vip-entry"
        title="大会员"
        @click="openVip"
      >
        <span class="vip-entry-dot">大</span>
      </div>
      <div class="m-header__icon" title="消息" @click="goMessages">
        <van-icon name="bell" size="23" />
        <span v-if="unread > 0" class="m-header__badge">{{ unread > 99 ? '99+' : unread }}</span>
      </div>
      <div class="m-header__icon" title="投稿" @click="router.push('/contribution')">
        <van-icon name="add-o" size="23" />
      </div>
      <div class="m-header__avatar" @click="goProfile">
        <img v-if="avatar" :src="avatar" alt="" />
        <van-icon v-else name="user-circle-o" size="29" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getUnreadCount } from '../../api/message'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const opaque = ref(false)
const unread = ref(0)

const avatar = computed(() => authStore.user?.avatarUrl || authStore.user?.avatar || '')

const openVip = () => {
  window.dispatchEvent(new CustomEvent('open-vip-dialog'))
}

const goMessages = () => {
  router.push('/messages')
}

const goProfile = () => {
  router.push('/profile')
}

const onScroll = () => {
  opaque.value = window.scrollY > 8
}

let timer = null
const loadUnread = async () => {
  if (!authStore.isLoggedIn) {
    unread.value = 0
    return
  }
  try {
    const count = await getUnreadCount()
    unread.value = Number(count) || 0
  } catch {
    unread.value = 0
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  loadUnread()
  timer = setInterval(loadUnread, 60000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.m-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1002;
  display: flex;
  align-items: center;
  gap: 8px;
  height: calc(var(--header-h) + var(--sat));
  padding: var(--sat) 12px 0;
  background: transparent;
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}

.m-header.opaque {
  background: var(--bg1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.m-header__logo {
  display: flex;
  flex-shrink: 0;
}

.m-header__search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  height: 38px;
  padding: 0 14px;
  border-radius: 19px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--line_regular);
  color: var(--text3);
  font-size: 14px;
}

.m-header.opaque .m-header__search {
  background: var(--bg2);
  border-color: transparent;
}

.m-header__search span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.m-header__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.m-header__icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--text2);
  cursor: pointer;
}

.m-header__icon:active {
  background: var(--graph_bg_thin);
}

.vip-entry-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 23px;
  height: 23px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFB199 0%, #FF6699 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.m-header__badge {
  position: absolute;
  top: 1px;
  right: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--brand_pink);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.m-header__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid var(--line_regular);
  color: var(--text3);
  cursor: pointer;
}

.m-header__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
