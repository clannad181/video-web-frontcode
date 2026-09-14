<template>
  <div
    class="sidebar"
    :class="{ collapsed: appStore.sidebar.collapsed }"
    :data-sidebar="appStore.darkMode ? 'dark' : 'light'"
  >
    <div class="glow-orb" />

    <!-- LOGO区 -->
    <div class="logo-section" @click="router.push('/')">
      <div class="logo-icon">
        <svg viewBox="0 0 32 32" class="logo-svg">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" :style="{ stopColor: primaryColor }" />
              <stop offset="100%" stop-color="#7c5cfc" />
            </linearGradient>
          </defs>
          <rect rx="8" ry="8" width="32" height="32" fill="url(#logoGrad)" />
          <polygon points="13,9 13,23 24,16" fill="white" />
        </svg>
      </div>
      <transition name="fade-text">
        <span v-show="!appStore.sidebar.collapsed" class="logo-title">VideoHub</span>
      </transition>
    </div>

    <!-- 菜单区域 -->
    <el-scrollbar class="menu-scrollbar" ref="scrollbarRef">
      <div class="menu-content">
        <!-- 主导航组 -->
        <div v-if="mainMenus.length" class="menu-group">
          <div v-show="!appStore.sidebar.collapsed" class="group-title">主导航</div>
          <template v-for="item in mainMenus" :key="item.id || item.path">
            <!-- 有子菜单 -->
            <div v-if="item.children?.length" class="menu-submenu" :class="{ expanded: expandedMenuIds.has(item.id) }">
              <div
                class="menu-item submenu-title"
                :class="{ active: isMenuActive(item) }"
                @click="toggleSubMenu(item.id)"
              >
                <span class="menu-icon">
                  <el-icon><component :is="resolveIcon(item.icon)" /></el-icon>
                </span>
                <span class="menu-text">{{ item.menuName || item.name }}</span>
                <span class="submenu-arrow" :class="{ rotated: expandedMenuIds.has(item.id) }">
                  <el-icon><ArrowDown /></el-icon>
                </span>
              </div>
              <div class="submenu-children" :style="{ maxHeight: expandedMenuIds.has(item.id) ? `${item.children.length * 44}px` : '0px', opacity: expandedMenuIds.has(item.id) ? 1 : 0 }">
                <div
                  v-for="child in item.children"
                  :key="child.id || child.path"
                  class="menu-item sub-item"
                  :class="{ active: isPathMatch(child.path, activeMenu) }"
                  @click="navigateTo(child.path)"
                >
                  <span class="sub-icon" :class="{ active: isPathMatch(child.path, activeMenu) }">
                    <el-icon :size="14"><component :is="resolveIcon(child.icon)" /></el-icon>
                  </span>
                  <span class="menu-text">{{ child.menuName || child.name }}</span>
                </div>
              </div>
            </div>
            <!-- 无子菜单 -->
            <div
              v-else
              class="menu-item"
              :class="{ active: isPathMatch(item.path, activeMenu) }"
              @click="navigateTo(item.path)"
            >
              <span class="menu-icon">
                <el-icon><component :is="resolveIcon(item.icon)" /></el-icon>
              </span>
              <span class="menu-text">{{ item.menuName || item.name }}</span>
            </div>
          </template>
        </div>

        <!-- 次导航组 -->
        <div v-if="otherMenus.length" class="menu-group">
          <div v-show="!appStore.sidebar.collapsed" class="group-title">系统管理</div>
          <template v-for="item in otherMenus" :key="item.id || item.path">
            <div v-if="item.children?.length" class="menu-submenu" :class="{ expanded: expandedMenuIds.has(item.id) }">
              <div
                class="menu-item submenu-title"
                :class="{ active: isMenuActive(item) }"
                @click="toggleSubMenu(item.id)"
              >
                <span class="menu-icon">
                  <el-icon><component :is="resolveIcon(item.icon)" /></el-icon>
                </span>
                <span class="menu-text">{{ item.menuName || item.name }}</span>
                <span class="submenu-arrow" :class="{ rotated: expandedMenuIds.has(item.id) }">
                  <el-icon><ArrowDown /></el-icon>
                </span>
              </div>
              <div class="submenu-children" :style="{ maxHeight: expandedMenuIds.has(item.id) ? `${item.children.length * 44}px` : '0px', opacity: expandedMenuIds.has(item.id) ? 1 : 0 }">
                <div
                  v-for="child in item.children"
                  :key="child.id || child.path"
                  class="menu-item sub-item"
                  :class="{ active: isPathMatch(child.path, activeMenu) }"
                  @click="navigateTo(child.path)"
                >
                  <span class="sub-icon" :class="{ active: isPathMatch(child.path, activeMenu) }">
                    <el-icon :size="14"><component :is="resolveIcon(child.icon)" /></el-icon>
                  </span>
                  <span class="menu-text">{{ child.menuName || child.name }}</span>
                </div>
              </div>
            </div>
            <div
              v-else
              class="menu-item"
              :class="{ active: isPathMatch(item.path, activeMenu) }"
              @click="navigateTo(item.path)"
            >
              <span class="menu-icon">
                <el-icon><component :is="resolveIcon(item.icon)" /></el-icon>
              </span>
              <span class="menu-text">{{ item.menuName || item.name }}</span>
            </div>
          </template>
        </div>
      </div>

      <!-- 滑动激活指示条 -->
      <div class="active-indicator" :style="indicatorStyle" />
    </el-scrollbar>

    <!-- 底部用户卡片 -->
    <div class="user-card">
      <div class="user-card-inner">
        <el-avatar :size="36" class="user-avatar">
          <template v-if="userStore.userInfo?.avater || userStore.userInfo?.avatar">
            <img :src="fileBaseUrl + (userStore.userInfo.avater || userStore.userInfo.avatar)" alt="avatar" />
          </template>
          <template v-else>
            {{ userStore.userInfo?.nikeName?.[0] || userStore.user?.name?.[0] || 'A' }}
          </template>
        </el-avatar>
        <transition name="fade-text">
          <div v-show="!appStore.sidebar.collapsed" class="user-info">
            <div class="user-name">{{ userStore.userInfo?.nikeName || userStore.user?.name || '管理员' }}</div>
            <div class="user-role">{{ userStore.userInfo?.roleName || '超级管理员' }}</div>
          </div>
        </transition>
        <transition name="fade-text">
          <el-button
            v-show="!appStore.sidebar.collapsed"
            class="logout-btn"
            :icon="SwitchButton"
            circle
            size="small"
            @click="handleLogout"
          />
        </transition>
      </div>
    </div>

    <!-- 折叠按钮 -->
    <div class="collapse-btn" @click="appStore.toggleSidebar">
      <el-icon :size="16">
        <Fold v-if="!appStore.sidebar.collapsed" />
        <Expand v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { constantRoutes } from '@/router'
import { SwitchButton, Fold, Expand, ArrowDown, Document, Monitor, Edit, ChatDotRound, ChatLineSquare, VideoCamera, Comment, User, DataAnalysis, Bell, Setting, Menu, Tickets, Key, List, Reading, Star, Wallet, Connection, Picture, Film, Histogram, Grid, Stamp, Finished, Cpu, Flag, HomeFilled, Odometer, TrendCharts, UserFilled, Avatar, Lock, Search, Delete, Plus, Refresh, Download, Upload, Folder, FolderOpened, Aim, Location, Message, Trophy, Notebook, Calendar, Clock, Mic, VideoPlay, Headset } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const scrollbarRef = ref(null)

const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || ''

const primaryColor = computed(() => {
  return getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#fb7299'
})

const activeMenu = computed(() => route.path)

function flattenRoutes(routes, parentPath = '') {
  const result = []
  for (const r of routes) {
    const fullPath = (parentPath + '/' + r.path).replace(/\/+/g, '/')
    if (r.children) {
      result.push(...flattenRoutes(r.children, fullPath))
    } else {
      result.push({ path: fullPath === '//' ? '/' : fullPath, name: r.name, title: r.meta?.title || '', icon: r.meta?.icon || '' })
    }
  }
  return result
}

const flatRoutes = flattenRoutes(constantRoutes)

function resolveMenuPath(menuName, menuIdentification, menuIcon) {
  if (menuIdentification) {
    const s = String(menuIdentification)
    if (s.startsWith('/')) {
      const exists = flatRoutes.some(r => r.path === s)
      if (exists) return s
      const matched = flatRoutes.find(r => r.title === menuName || r.icon === menuIcon)
      if (matched) return matched.path
      if (s === '/') {
        const root = constantRoutes.find(r => r.path === '/')
        if (root?.redirect) return root.redirect
      }
    }
  }
  if (menuName) {
    const found = flatRoutes.find(r => r.title === menuName)
    if (found) return found.path
  }
  if (menuIcon) {
    const found = flatRoutes.find(r => r.icon === menuIcon)
    if (found) return found.path
  }
  if (menuIdentification) {
    const s = String(menuIdentification).toLowerCase()
    const found = flatRoutes.find(r => r.name?.toLowerCase() === s)
    if (found) return found.path
  }
  return ''
}

function normalizePath(p) {
  if (p == null || p === '') return ''
  const s = String(p)
  return s.startsWith('/') ? s : '/' + s
}

function isPathMatch(menuPath, routePath) {
  if (!menuPath) return false
  return normalizePath(menuPath).toLowerCase() === (routePath || '').toLowerCase()
}

const menuList = computed(() => {
  const raw = userStore.userInfo?.menuList || userStore.user?.menuList || []
  const tree = Array.isArray(raw) ? raw : []
  return tree.map(item => processMenuItem(item)).sort((a, b) => (a.descSort || 0) - (b.descSort || 0))
})

function processMenuItem(item) {
  const resolvedPath = resolveMenuPath(item.menuName, item.menuIdentification, item.icon)
  return {
    ...item,
    path: resolvedPath,
    children: item.children
      ? item.children.map(child => processMenuItem(child)).sort((a, b) => (a.descSort || 0) - (b.descSort || 0))
      : []
  }
}

const mainMenus = computed(() => {
  return menuList.value.filter(m => m.category === 'MAIN')
})

const otherMenus = computed(() => {
  return menuList.value.filter(m => m.category !== 'MAIN')
})

const iconCache = {}
function resolveIcon(name) {
  if (!name) return markRaw(Document)
  if (iconCache[name]) return iconCache[name]
  const icons = {
    Monitor, Edit, ChatDotRound, ChatLineSquare, VideoCamera, Comment,
    User, DataAnalysis, Bell, Setting, Document, Menu, Tickets, Key,
    List, Reading, Star, Wallet, Connection, Picture, Film, Histogram,
    Grid, Stamp, Finished, Cpu, Flag, ArrowDown, HomeFilled, Odometer,
    TrendCharts, UserFilled, Avatar, Lock, Search, Delete, Plus, Refresh,
    Download, Upload, Folder, FolderOpened, Aim, Location, Message,
    Trophy, Notebook, Calendar, Clock, Mic, VideoPlay, Headset,
    Fold, Expand, SwitchButton
  }
  iconCache[name] = markRaw(icons[name] || Document)
  return iconCache[name]
}

function isMenuActive(item) {
  if (isPathMatch(item.path, activeMenu.value)) return true
  return item.children?.some(c => isPathMatch(c.path, activeMenu.value))
}

// 展开的子菜单
const expandedMenuIds = ref(new Set())
const STORAGE_KEY = 'expandedMenus'

function expandActiveParent() {
  const allMenus = [...mainMenus.value, ...otherMenus.value]
  for (const m of allMenus) {
    if (m.children?.some(c => isPathMatch(c.path, activeMenu.value))) {
      expandedMenuIds.value.add(m.id)
    }
  }
}

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    expandedMenuIds.value = new Set(saved)
  } catch { /* ignore */ }
  expandActiveParent()
})

watch(activeMenu, () => {
  expandActiveParent()
  updateIndicator()
}, { immediate: true })

// 收缩侧边栏时自动收起所有展开的子菜单
watch(() => appStore.sidebar.collapsed, (isCollapsed) => {
  if (isCollapsed) {
    expandedMenuIds.value = new Set()
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...expandedMenuIds.value]))
  }
})

function toggleSubMenu(id) {
  // 收缩状态下点击含子菜单的菜单项，先展开侧边栏
  if (appStore.sidebar.collapsed) {
    appStore.toggleSidebar()
    return
  }
  
  if (expandedMenuIds.value.has(id)) {
    expandedMenuIds.value.delete(id)
  } else {
    expandedMenuIds.value.add(id)
  }
  expandedMenuIds.value = new Set(expandedMenuIds.value)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...expandedMenuIds.value]))
}

function navigateTo(path) {
  if (path) router.push(path)
}

// 滑动指示条位置
const indicatorTop = ref(0)
const indicatorHeight = ref(0)

function updateIndicator() {
  nextTick(() => {
    const activeEl = document.querySelector('.sidebar .menu-item.active')
    if (activeEl) {
      const sidebar = document.querySelector('.sidebar')
      const sidebarRect = sidebar.getBoundingClientRect()
      const elRect = activeEl.getBoundingClientRect()
      indicatorTop.value = elRect.top - sidebarRect.top + 8
      indicatorHeight.value = elRect.height - 16
    }
  })
}

watch(() => appStore.sidebar.collapsed, () => setTimeout(updateIndicator, 350))

const indicatorStyle = computed(() => ({
  transform: `translateY(${indicatorTop.value}px)`,
  height: `${indicatorHeight.value}px`,
  opacity: activeMenu.value ? 1 : 0
}))

// 登出
async function handleLogout() {
  try {
    await userStore.logoutAction()
  } catch {
    userStore.forceLogoutAction()
  }
}
</script>

<style lang="scss" scoped>
// ========== 深色主题（默认） ==========
.sidebar {
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 72px;

  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  height: 100vh;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background: rgba(29, 28, 44, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &.collapsed {
    width: var(--sidebar-collapsed-width);
  }

  // ========== 浅色主题 ==========
  &[data-sidebar="light"] {
    background: rgba(255, 255, 255, 0.95);

    .glow-orb { opacity: 0.15; }
    .group-title { color: rgba(0, 0, 0, 0.35); }

    .menu-item {
      color: #606266;
      &:hover { background: rgba(0, 0, 0, 0.04); color: #303133; transform: none; }
      &.active { color: var(--color-primary); background: rgba(var(--color-primary-rgb, 251, 114, 153), 0.1); }
    }

    .submenu-title {
      color: #303133;
      &:hover { background: rgba(0, 0, 0, 0.04); }
      &.active { color: var(--color-primary); background: rgba(var(--color-primary-rgb, 251, 114, 153), 0.1); }
    }

    .submenu-arrow { color: #909399; }
    .sub-icon { color: #c0c4cc; &.active { color: var(--color-primary); } }
    .user-card { border-top: 1px solid rgba(0, 0, 0, 0.06); }
    .user-name { color: #303133; }
    .user-role { color: #909399; }
    .logout-btn { color: #909399; &:hover { color: #f44336; background: rgba(244, 67, 54, 0.1); } }
    .collapse-btn { color: #909399; border-top: 1px solid rgba(0, 0, 0, 0.06); &:hover { color: var(--color-primary); } }
    .logo-title { background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  }
}

// ========== 氛围光晕 ==========
.glow-orb {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-primary) 0%, transparent 70%);
  opacity: 0.3;
  filter: blur(40px);
  pointer-events: none;
  animation: glowPulse 4s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

// ========== LOGO区 ==========
.logo-section {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  overflow: hidden;
  transition: padding 0.3s;

  .collapsed & { padding: 0; justify-content: center; }
}

.logo-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
}

.logo-svg {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.logo-title {
  font-size: 18px;
  font-weight: 800;
  white-space: nowrap;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, var(--color-primary), #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.fade-text-enter-active, .fade-text-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-text-enter-from, .fade-text-leave-to { opacity: 0; transform: translateX(-10px); }

// ========== 菜单区域 ==========
.menu-scrollbar { flex: 1; overflow: hidden; }
.menu-content { padding: 8px 0; }
.menu-group { margin-bottom: 4px; }

.group-title {
  padding: 12px 20px 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;

  .collapsed & {
    padding: 12px 0 6px;
    text-align: center;
    font-size: 0;
    &::after { content: '···'; font-size: 11px; }
  }
}

// ========== 菜单项 ==========
.menu-item {
  display: flex;
  align-items: center;
  height: 44px;
  margin: 2px 8px;
  padding: 0 12px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    transform: translateX(2px);
  }

  &.active {
    color: var(--color-primary);
    background: rgba(var(--color-primary-rgb, 251, 114, 153), 0.15);
    .menu-icon { filter: drop-shadow(0 0 6px var(--color-primary)); }
  }

  .collapsed & { justify-content: center; padding: 0; margin: 2px 8px; }
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 18px;
  flex-shrink: 0;
  transition: filter 0.25s;
  .collapsed & { margin: 0; }
}

.menu-text {
  flex: 1;
  margin-left: 10px;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  .collapsed & { display: none; }
}

// ========== 徽标 ==========
.menu-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
  animation: badgePulse 2s ease-in-out infinite;

  .collapsed & {
    min-width: 8px;
    height: 8px;
    padding: 0;
    border-radius: 50%;
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 0;
  }
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

// ========== 子菜单 ==========
.menu-submenu {
  .submenu-title {
    .submenu-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      font-size: 12px;
      transition: transform 0.3s ease;
      margin-left: auto;
      &.rotated { transform: rotate(90deg); }
      .collapsed & { display: none; }
    }
  }

  .submenu-children {
    overflow: hidden;
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  }
}

.sub-item { padding-left: 42px !important; }
.collapsed .sub-item { display: none !important; }

.sub-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.45);
  margin-right: 8px;
  flex-shrink: 0;
  transition: all 0.25s ease;

  &.active { color: var(--color-primary); }
}

// ========== 滑动指示条 ==========
.active-indicator {
  position: absolute;
  left: 0;
  width: 3px;
  height: 28px;
  background: var(--color-primary);
  border-radius: 0 3px 3px 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  box-shadow: 0 0 12px var(--color-primary);
  animation: indicatorPulse 2s ease-in-out infinite;

  .collapsed & { opacity: 0 !important; }
}

@keyframes indicatorPulse {
  0%, 100% { box-shadow: 0 0 12px var(--color-primary); }
  50% { box-shadow: 0 0 20px var(--color-primary); }
}

// ========== 底部用户卡片 ==========
.user-card {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 8px;
  flex-shrink: 0;
}

.user-card-inner {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover { background: rgba(255, 255, 255, 0.06); }
  .collapsed & { justify-content: center; padding: 8px 0; }
}

.user-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  transition: transform 0.25s, box-shadow 0.25s;

  &:hover { transform: scale(1.1); box-shadow: 0 0 12px var(--color-primary); }
  img { width: 100%; height: 100%; object-fit: cover; }
}

.user-info {
  flex: 1;
  margin-left: 10px;
  overflow: hidden;
  .collapsed & { display: none; }
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  flex-shrink: 0;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  background: transparent;
  transition: all 0.25s;
  &:hover { color: #f44336; background: rgba(244, 67, 54, 0.1); }
  .collapsed & { display: none; }
}

// ========== 折叠按钮 ==========
.collapse-btn {
  position: absolute;
  right: -14px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.25s;
  z-index: 10;
  color: #606266;

  &:hover {
    background: var(--color-primary);
    color: #ffffff;
    transform: translateY(-50%) scale(1.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}
</style>
