<template>
  <header class="creator-header">
    <div class="creator-header__bar">
      <div class="left-section">
        <router-link to="/" class="logo-link" title="返回首页">
          <svg class="logo-icon" viewBox="0 0 32 32" width="32" height="32">
            <rect width="32" height="32" rx="6" fill="var(--brand_pink)"/>
            <path d="M12 9L23 16L12 23V9Z" fill="white"/>
          </svg>
          <span class="logo-text">VideoHub</span>
        </router-link>
        <div class="divider"></div>
        <span class="creator-label">创作中心</span>
        <router-link to="/" class="nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          主站
        </router-link>
      </div>

      <div class="right-section">
        <div class="days-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>在 Video 空间站的第 {{ daysInSpace }} 天</span>
        </div>
        <div class="user-menu" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
          <div class="avatar-wrapper" @click="router.push('/profile')">
            <img v-if="isLoggedIn && user?.avatar" :src="user.avatar" class="avatar-img" :alt="user?.nickname || '用户头像'" />
            <div v-else class="avatar-default">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
          <transition name="dropdown-fade">
            <div v-if="isLoggedIn && showUserMenu" class="user-dropdown">
              <div class="dropdown-header">
                <img v-if="user?.avatar" :src="user.avatar" class="dropdown-avatar" :alt="user?.nickname || '用户头像'" />
                <div v-else class="dropdown-avatar-placeholder">
                  {{ (user?.nikeName || user?.nickname || 'U').charAt(0).toUpperCase() }}
                </div>
                <div class="dropdown-user-info">
                  <div class="dropdown-nickname">{{ user?.nikeName || user?.nickname || '用户' }}</div>
                  <div v-if="user?.isVip" class="vip-badge">
                    <IconVip :size="12" />
                    大会员
                  </div>
                </div>
              </div>
              <div class="dropdown-menu">
                <router-link to="/profile" class="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  个人中心
                </router-link>
                <router-link to="/contribution" class="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  投稿管理
                </router-link>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item logout" @click="handleLogout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  退出登录
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { clientLogout } from '../../api/auth'
import { IconVip } from '../../icons'

const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)

const showUserMenu = ref(false)
let userShowTimer = null
let userHideTimer = null

const daysInSpace = computed(() => {
  const joinDate = user.value?.createTime || user.value?.joinDate
  if (!joinDate) return 1
  const start = new Date(joinDate)
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const handleMouseEnter = () => {
  if (userHideTimer) {
    clearTimeout(userHideTimer)
    userHideTimer = null
  }
  if (isLoggedIn.value && user.value) {
    userShowTimer = setTimeout(() => {
      showUserMenu.value = true
    }, 150)
  }
}

const handleMouseLeave = () => {
  if (userShowTimer) {
    clearTimeout(userShowTimer)
    userShowTimer = null
  }
  userHideTimer = setTimeout(() => {
    showUserMenu.value = false
  }, 200)
}

const handleLogout = async () => {
  try {
    await clientLogout()
  } catch (e) {
    console.error('退出登录失败:', e)
  } finally {
    authStore.logout()
    showUserMenu.value = false
    router.push('/')
  }
}
</script>

<style scoped>
.creator-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--bg2);
  border-bottom: 1px solid var(--line_regular);
}

.creator-header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: opacity 0.2s;
}

.logo-link:hover {
  opacity: 0.9;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--text1);
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--line_regular);
}

.creator-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text1);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text2);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-link:hover {
  background: var(--bg3);
  color: var(--text1);
}

.days-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(255, 92, 122, 0.1) 0%, rgba(255, 107, 157, 0.1) 100%);
  border-radius: 20px;
  font-size: 13px;
  color: var(--brand_pink);
}

.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-menu {
  position: relative;
}

.avatar-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(255, 92, 122, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-default {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff6b9d 100%);
  color: #fff;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 200px;
  background: var(--bg2);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--line_regular);
}

.dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff6b9d 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.dropdown-user-info {
  flex: 1;
  min-width: 0;
}

.dropdown-nickname {
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vip-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #fb7299;
  margin-top: 2px;
}

.dropdown-menu {
  padding: 8px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text2);
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: var(--bg3);
  color: var(--text1);
}

.dropdown-item.logout {
  color: var(--text4);
}

.dropdown-item.logout:hover {
  background: rgba(255, 92, 122, 0.1);
  color: var(--brand_pink);
}

.dropdown-divider {
  height: 1px;
  background: var(--line_regular);
  margin: 8px 0;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
