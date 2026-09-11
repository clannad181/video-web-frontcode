<template>
  <div class="navbar">
    <div class="left-section">
      <div class="hamburger" @click="appStore.toggleSidebar">
        <el-icon :size="20">
          <Fold v-if="!appStore.sidebar.collapsed" />
          <Expand v-else />
        </el-icon>
      </div>
      <Breadcrumb />
    </div>

    <div class="right-section">
      <div class="search-box" :class="{ focused: searchFocused }">
        <el-icon class="search-icon"><Search /></el-icon>
        <input
          v-model="searchQuery"
          class="search-input"
          placeholder="搜索视频、用户、评论..."
          @focus="searchFocused = true"
          @blur="searchFocused = false"
        />
        <kbd v-show="!searchFocused" class="search-shortcut">Ctrl+K</kbd>
      </div>

      <div class="nav-actions">
        <el-tooltip content="语言" placement="bottom">
          <div class="action-btn" @click="toggleLanguage">
            <span class="lang-text">{{ appStore.language === 'zh-cn' ? '中' : 'EN' }}</span>
          </div>
        </el-tooltip>

        <el-tooltip content="通知" placement="bottom">
          <div class="action-btn" @click="router.push('/notice')">
            <el-badge :value="3" :max="99" class="notification-badge">
              <el-icon :size="18"><Bell /></el-icon>
            </el-badge>
          </div>
        </el-tooltip>

        <el-tooltip :content="appStore.darkMode ? '浅色模式' : '深色模式'" placement="bottom">
          <div class="action-btn" @click="appStore.toggleDarkMode">
            <el-icon :size="18">
              <Sunny v-if="appStore.darkMode" />
              <Moon v-else />
            </el-icon>
          </div>
        </el-tooltip>

        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-section">
            <el-avatar :size="30" class="user-avatar">
              {{ userStore.userInfo?.nickname?.[0] || 'A' }}
            </el-avatar>
            <span class="username">{{ userStore.userInfo?.nickname || '管理员' }}</span>
            <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import Breadcrumb from './Breadcrumb.vue'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const searchQuery = ref('')
const searchFocused = ref(false)

const toggleLanguage = () => {
  const newLang = appStore.language === 'zh-cn' ? 'en' : 'zh-cn'
  appStore.setLanguage(newLang)
}

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--card-bg);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 999;
  transition: background-color 0.3s;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hamburger {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-regular);
  transition: all 0.25s ease;

  &:hover {
    background-color: rgba(64, 158, 255, 0.08);
    color: var(--primary-color);
  }
}

.right-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 34px;
  background: var(--bg-color);
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.focused {
    background: #ffffff;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
    width: 280px;
  }

  &:not(.focused):hover {
    border-color: var(--border-color);
  }
}

.search-icon {
  color: var(--text-secondary);
  font-size: 14px;
  flex-shrink: 0;
}

.search-input {
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-primary);
  width: 160px;
  outline: none;

  &::placeholder {
    color: var(--text-secondary);
  }
}

.search-shortcut {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1px 5px;
  font-family: monospace;
  flex-shrink: 0;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-regular);
  transition: all 0.25s ease;
  position: relative;

  &:hover {
    background-color: rgba(64, 158, 255, 0.08);
    color: var(--primary-color);
  }
}

.lang-text {
  font-size: 13px;
  font-weight: 600;
}

.notification-badge {
  :deep(.el-badge__content) {
    background-color: #fb7299;
    border: none;
    height: 16px;
    line-height: 16px;
    padding: 0 4px;
    font-size: 10px;
  }
}

.user-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background-color: rgba(64, 158, 255, 0.08);
  }
}

.user-avatar {
  background: linear-gradient(135deg, #00a1d6, #fb7299);
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
}

.username {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 12px;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}
</style>
