<template>
  <!-- 侧边栏容器，支持折叠/展开状态，支持深色/浅色主题 -->
  <div
    class="sidebar"
    :class="{ collapsed: appStore.sidebar.collapsed }"
    :data-sidebar="appStore.darkMode ? 'dark' : 'light'"
  >
    <!-- 背景光晕效果 -->
    <div class="glow-orb" />

    <!-- LOGO区域 -->
    <div class="logo-section" @click="router.push('/')">
      <div class="logo-icon">
        <!-- 渐变色SVG Logo -->
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
      <!-- Logo文字，收缩时隐藏 -->
      <transition name="fade-text">
        <span v-show="!appStore.sidebar.collapsed" class="logo-title">VideoHub</span>
      </transition>
    </div>

    <!-- 菜单滚动区域 -->
    <el-scrollbar class="menu-scrollbar" ref="scrollbarRef">
      <div class="menu-content">
        <!-- 主导航组 -->
        <div v-if="mainMenus.length" class="menu-group">
          <!-- 组标题，收缩时显示省略号 -->
          <div v-show="!appStore.sidebar.collapsed" class="group-title">主导航</div>
          <TransitionGroup name="menu-item" tag="div">
            <template v-for="item in mainMenus" :key="item.id || item.path">
              <!-- 有子菜单的项 -->
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
                <Transition name="fade">
                  <span v-if="getBadge(item.id) && !appStore.sidebar.collapsed" class="nav-badge">{{ getBadge(item.id) }}</span>
                </Transition>
                <span v-if="getBadge(item.id) && appStore.sidebar.collapsed" class="nav-badge-dot"></span>
                <!-- 箭头图标，展开时旋转 -->
                <span class="submenu-arrow" :class="{ rotated: expandedMenuIds.has(item.id) }">
                  <el-icon><ArrowDown /></el-icon>
                </span>
              </div>
              <!-- 子菜单容器，通过maxHeight控制展开/收起动画 -->
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
                  <Transition name="fade">
                    <span v-if="getBadge(child.id) && !appStore.sidebar.collapsed" class="nav-badge">{{ getBadge(child.id) }}</span>
                  </Transition>
                  <span v-if="getBadge(child.id) && appStore.sidebar.collapsed" class="nav-badge-dot"></span>
                </div>
              </div>
            </div>
            <!-- 无子菜单的项 -->
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
              <Transition name="fade">
                <span v-if="getBadge(item.id) && !appStore.sidebar.collapsed" class="nav-badge">{{ getBadge(item.id) }}</span>
              </Transition>
              <span v-if="getBadge(item.id) && appStore.sidebar.collapsed" class="nav-badge-dot"></span>
            </div>
            </template>
          </TransitionGroup>
        </div>

        <!-- 次导航组（系统管理） -->
        <div v-if="otherMenus.length" class="menu-group">
          <div v-show="!appStore.sidebar.collapsed" class="group-title">系统管理</div>
          <TransitionGroup name="menu-item" tag="div">
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
                <Transition name="fade">
                  <span v-if="getBadge(item.id) && !appStore.sidebar.collapsed" class="nav-badge">{{ getBadge(item.id) }}</span>
                </Transition>
                <span v-if="getBadge(item.id) && appStore.sidebar.collapsed" class="nav-badge-dot"></span>
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
                  <Transition name="fade">
                    <span v-if="getBadge(child.id) && !appStore.sidebar.collapsed" class="nav-badge">{{ getBadge(child.id) }}</span>
                  </Transition>
                  <span v-if="getBadge(child.id) && appStore.sidebar.collapsed" class="nav-badge-dot"></span>
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
              <Transition name="fade">
                <span v-if="getBadge(item.id) && !appStore.sidebar.collapsed" class="nav-badge">{{ getBadge(item.id) }}</span>
              </Transition>
              <span v-if="getBadge(item.id) && appStore.sidebar.collapsed" class="nav-badge-dot"></span>
            </div>
            </template>
          </TransitionGroup>
        </div>
      </div>

      <!-- 滑动激活指示条 -->
      <div class="active-indicator" :style="indicatorStyle" />
    </el-scrollbar>

    <!-- 底部用户卡片 -->
    <div class="user-card">
      <div class="user-card-inner">
        <!-- 用户头像 -->
        <el-avatar :size="36" class="user-avatar">
          <template v-if="userStore.userInfo?.avater || userStore.userInfo?.avatar">
            <img :src="fileBaseUrl + (userStore.userInfo.avater || userStore.userInfo.avatar)" alt="avatar" />
          </template>
          <template v-else>
            {{ userStore.userInfo?.nikeName?.[0] || userStore.user?.name?.[0] || 'A' }}
          </template>
        </el-avatar>
        <!-- 用户信息，收缩时隐藏 -->
        <transition name="fade-text">
          <div v-show="!appStore.sidebar.collapsed" class="user-info">
            <div class="user-name">{{ userStore.userInfo?.nikeName || userStore.user?.name || '管理员' }}</div>
            <div class="user-role">{{ userStore.userInfo?.roleName || '超级管理员' }}</div>
          </div>
        </transition>
        <!-- 登出按钮，收缩时隐藏 -->
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
/**
 * Sidebar 组件
 * 侧边栏导航组件，支持以下功能：
 * 1. 菜单折叠/展开
 * 2. 子菜单展开/收起
 * 3. 深色/浅色主题切换
 * 4. 滑动激活指示条
 * 5. 用户信息展示和登出
 */
import { ref, computed, watch, onMounted, nextTick, markRaw, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { constantRoutes } from '@/router'
import { getVideoReviewStats, getCommentStatusStats } from '@/api/review'
import { SwitchButton, Fold, Expand, ArrowDown, Document, Monitor, Edit, ChatDotRound, ChatLineSquare, VideoCamera, Comment, User, DataAnalysis, Bell, Setting, Menu, Tickets, Key, List, Reading, Star, Wallet, Connection, Picture, Film, Histogram, Grid, Stamp, Finished, Cpu, Flag, HomeFilled, Odometer, TrendCharts, UserFilled, Avatar, Lock, Search, Delete, Plus, Refresh, Download, Upload, Folder, FolderOpened, Aim, Location, Message, Trophy, Notebook, Calendar, Clock, Mic, VideoPlay, Headset } from '@element-plus/icons-vue'

// 路由和状态管理
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const scrollbarRef = ref(null)
const menuRefreshKey = ref(0)

// 文件基础URL
const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || ''

// 主题色（从CSS变量获取）
const primaryColor = computed(() => {
  return getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#fb7299'
})

// 监听菜单更新事件，重新拉取用户菜单
function onMenuUpdated() {
  userStore.getUserInfoAction().then(() => {
    menuRefreshKey.value++
  })
}
window.addEventListener('menu-updated', onMenuUpdated)

// Badge 逻辑：初始化 + 取数 + 匹配写入
const badgeMap = ref({})

function walkMenus(items, fn) {
  for (const item of items) {
    fn(item)
    if (item.children?.length) walkMenus(item.children, fn)
  }
}

function initAndFetchBadges() {
  const allMenus = [...mainMenus.value, ...otherMenus.value]
  console.log('[Badge] initAndFetchBadges, menuList length:', allMenus.length, 'sample item:', allMenus[0])
  console.log('[Badge] all menu paths:')
  allMenus.forEach(m => console.log('  id=' + m.id, 'name=' + (m.menuName||''), 'ident=' + (m.menuIdentification||''), '→ path=' + JSON.stringify(m.path), m.children?.length ? 'children: ' + m.children.map(c => JSON.stringify(c.path)).join(', ') : ''))
  const map = {}
  walkMenus(allMenus, item => { map[item.id] = 0 })
  badgeMap.value = map
  console.log('[Badge] badgeMap initialized:', JSON.stringify(map))
  fetchBadges()
}

function normalizeBadgePath(p) { return p?.replace(/\/+$/, '') || '' }

async function fetchBadges() {
  try {
    const [videoRes, commentRes] = await Promise.allSettled([
      getVideoReviewStats(),
      getCommentStatusStats()
    ])
    const videoStats = videoRes.status === 'fulfilled' ? (videoRes.value?.data || {}) : {}
    const commentStats = commentRes.status === 'fulfilled' ? (commentRes.value?.data || {}) : {}
    console.log('[Badge] videoStats:', videoStats, 'commentStats:', commentStats)
    const e = (videoStats.pendingCount || 0) + (videoStats.partialCount || 0) + (videoStats.pendingPublishCount || 0)
    const t = commentStats.pendingReviewCount || 0
    const n = e + t
    console.log('[Badge] values: /review=' + n, '/video-manage=' + e, '/comment-manage=' + t)
    const values = { '/review': n, '/video-manage': e, '/comment-manage': t }
    const map = { ...badgeMap.value }
    const allMenus = [...mainMenus.value, ...otherMenus.value]
    walkMenus(allMenus, item => {
      const val = values[normalizeBadgePath(item.path)]
      if (val !== undefined) {
        map[item.id] = val
        console.log('[Badge] matched:', item.path, '→ id:', item.id, 'val:', val)
      }
    })
    console.log('[Badge] final badgeMap:', JSON.stringify(map))
    badgeMap.value = map
  } catch (err) { console.error('[Badge] fetch error:', err) }
}

function getBadge(id) { return badgeMap.value[id] || 0 }

// 监听审核事件刷新 badge + 每分钟轮询
function onReviewUpdated() { fetchBadges() }
window.addEventListener('review-updated', onReviewUpdated)
const badgeTimer = setInterval(fetchBadges, 60 * 1000)

onUnmounted(() => {
  window.removeEventListener('menu-updated', onMenuUpdated)
  window.removeEventListener('review-updated', onReviewUpdated)
  clearInterval(badgeTimer)
})

// 当前激活的菜单路径
const activeMenu = computed(() => route.path)

/**
 * 将路由配置扁平化为一维数组
 * @param {Array} routes - 路由配置数组
 * @param {String} parentPath - 父级路径
 * @returns {Array} 扁平化后的路由数组
 */
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

// 扁平化路由列表
const flatRoutes = flattenRoutes(constantRoutes)

/**
 * 根据菜单名称、标识符或图标解析对应的路由路径
 * @param {String} menuName - 菜单名称
 * @param {String} menuIdentification - 菜单标识符
 * @param {String} menuIcon - 菜单图标
 * @returns {String} 匹配的路由路径
 */
function resolveMenuPath(menuName, menuIdentification, menuIcon) {
  // 优先通过菜单标识符匹配
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
  // 通过菜单名称匹配
  if (menuName) {
    const found = flatRoutes.find(r => r.title === menuName)
    if (found) return found.path
  }
  // 通过图标匹配
  if (menuIcon) {
    const found = flatRoutes.find(r => r.icon === menuIcon)
    if (found) return found.path
  }
  // 通过标识符名称匹配
  if (menuIdentification) {
    const s = String(menuIdentification).toLowerCase()
    const found = flatRoutes.find(r => r.name?.toLowerCase() === s)
    if (found) return found.path
  }
  return ''
}

/**
 * 标准化路径，确保以/开头
 * @param {String} p - 原始路径
 * @returns {String} 标准化后的路径
 */
function normalizePath(p) {
  if (p == null || p === '') return ''
  const s = String(p)
  return s.startsWith('/') ? s : '/' + s
}

/**
 * 判断菜单路径是否与当前路由路径匹配
 * @param {String} menuPath - 菜单路径
 * @param {String} routePath - 路由路径
 * @returns {Boolean} 是否匹配
 */
function isPathMatch(menuPath, routePath) {
  if (!menuPath) return false
  return normalizePath(menuPath).toLowerCase() === (routePath || '').toLowerCase()
}

// 菜单列表（从用户信息中获取并处理）
const menuList = computed(() => {
  const raw = userStore.userInfo?.menuList || userStore.user?.menuList || []
  const tree = Array.isArray(raw) ? raw : []
  return tree.map(item => processMenuItem(item)).sort((a, b) => (a.descSort || 0) - (b.descSort || 0))
})

watch(menuList, () => { nextTick(initAndFetchBadges) }, { immediate: true })

/**
 * 处理菜单项，解析路径并递归处理子菜单
 * @param {Object} item - 菜单项
 * @returns {Object} 处理后的菜单项
 */
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

// 主导航菜单（category为MAIN）
const mainMenus = computed(() => {
  return menuList.value.filter(m => m.category === 'MAIN')
})

// 次导航菜单（系统管理等）
const otherMenus = computed(() => {
  return menuList.value.filter(m => m.category !== 'MAIN')
})

// 图标缓存，避免重复创建
const iconCache = {}

/**
 * 根据图标名称解析对应的组件
 * @param {String} name - 图标名称
 * @returns {Component} 图标组件
 */
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

/**
 * 判断菜单项是否激活（自身或子菜单包含当前路由）
 * @param {Object} item - 菜单项
 * @returns {Boolean} 是否激活
 */
function isMenuActive(item) {
  if (isPathMatch(item.path, activeMenu.value)) return true
  return item.children?.some(c => isPathMatch(c.path, activeMenu.value))
}

// 展开的子菜单ID集合
const expandedMenuIds = ref(new Set())
const STORAGE_KEY = 'expandedMenus'

// 保存收缩前的展开状态（用于展开时恢复）
const savedExpandedIds = ref(new Set())

/**
 * 展开包含当前路由的父菜单
 */
function expandActiveParent() {
  const allMenus = [...mainMenus.value, ...otherMenus.value]
  for (const m of allMenus) {
    if (m.children?.some(c => isPathMatch(c.path, activeMenu.value))) {
      expandedMenuIds.value.add(m.id)
    }
  }
}

// 组件挂载时恢复展开状态
onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    expandedMenuIds.value = new Set(saved)
  } catch { /* ignore */ }
  expandActiveParent()
})

// 监听路由变化，自动展开父菜单并更新指示条
watch(activeMenu, () => {
  expandActiveParent()
  updateIndicator()
}, { immediate: true })

// 监听侧边栏折叠状态变化
watch(() => appStore.sidebar.collapsed, (isCollapsed) => {
  if (isCollapsed) {
    // 收缩时保存当前展开状态
    savedExpandedIds.value = new Set(expandedMenuIds.value)
  } else {
    // 展开时恢复之前保存的展开状态
    if (savedExpandedIds.value.size > 0) {
      expandedMenuIds.value = new Set(savedExpandedIds.value)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...expandedMenuIds.value]))
    }
  }
})

/**
 * 切换子菜单展开/收起状态
 * @param {Number} id - 菜单ID
 */
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

/**
 * 导航到指定路径
 * @param {String} path - 目标路径
 */
function navigateTo(path) {
  if (path) router.push(path)
}

// 滑动指示条位置
const indicatorTop = ref(0)
const indicatorHeight = ref(0)

/**
 * 更新滑动指示条位置
 */
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

// 监听折叠状态变化，延迟更新指示条
watch(() => appStore.sidebar.collapsed, () => setTimeout(updateIndicator, 350))

// 指示条样式
const indicatorStyle = computed(() => ({
  transform: `translateY(${indicatorTop.value}px)`,
  height: `${indicatorHeight.value}px`,
  opacity: activeMenu.value ? 1 : 0
}))

/**
 * 处理登出操作
 */
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
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  // 折叠状态
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
    .nav-badge { box-shadow: 0 0 0 2px #fff; }
    .nav-badge-dot { box-shadow: 0 0 0 1.5px rgba(29, 28, 44, 0.95); }
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

// 文字淡入淡出动画
.fade-text-enter-active, .fade-text-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-text-enter-from, .fade-text-leave-to { opacity: 0; transform: translateX(-10px); }

// 菜单项刷新动画
.menu-item-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  @for $i from 1 through 20 {
    &:nth-child(#{$i}) {
      transition-delay: #{$i * 0.03}s;
    }
  }
}
.menu-item-leave-active {
  transition: all 0.2s ease;
}
.menu-item-enter-from {
  opacity: 0;
  transform: translateX(-16px) scale(0.95);
}
.menu-item-leave-to {
  opacity: 0;
  transform: translateX(-10px) scale(0.98);
}
.menu-item-move {
  transition: transform 0.3s ease;
}

// ========== 菜单区域 ==========
.menu-scrollbar { flex: 1; overflow: hidden; }
.menu-content { padding: 8px 0; }
.menu-group { margin-bottom: 4px; }

// 菜单组标题
.group-title {
  padding: 12px 20px 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;

  // 折叠状态下显示省略号
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

  // 激活状态
  &.active {
    color: var(--color-primary);
    background: rgba(var(--color-primary-rgb, 251, 114, 153), 0.15);
    .menu-icon { filter: drop-shadow(0 0 6px var(--color-primary)); }
  }

  // 折叠状态下的样式
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
.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 2px 6px;
  border-radius: 10px;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  margin-left: auto;
  box-shadow: 0 0 0 2px var(--sidebar-bg, rgba(29, 28, 44, 0.95));
  animation: badgePulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

.nav-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  position: absolute;
  top: 4px;
  right: 4px;
  box-shadow: 0 0 0 1.5px #fff;
  animation: badgePulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

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

  // 子菜单容器动画
  .submenu-children {
    overflow: hidden;
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  }
}

// 子菜单项样式
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
