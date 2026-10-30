<template>
  <!-- 顶部导航栏 -->
  <div class="topbar">
    <!-- 左侧：汉堡菜单 + 面包屑 -->
    <div class="topbar-left">
      <!-- 汉堡菜单按钮，点击展开/收起侧边栏 -->
      <div class="hamburger" @click="appStore.toggleSidebar">
        <el-icon :size="20"><Fold v-if="!appStore.sidebar.collapsed" /><Expand v-else /></el-icon>
      </div>
      <!-- 面包屑导航 -->
      <div class="breadcrumb">
        <span class="bc-home">🏠</span>
        <span class="bc-sep">/</span>
        <span class="bc-current">{{ $t(route.meta?.title || '') || $t('common.dashboard') }}</span>
      </div>
    </div>

    <!-- 中间：搜索框 -->
    <div class="topbar-center">
      <div class="search-box" :class="{ focused: searchFocused }">
        <el-icon class="search-icon" :class="{ active: searchFocused }"><Search /></el-icon>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          class="search-input"
          :placeholder="$t('common.searchPlaceholder')"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          @input="onSearchInput"
          @keydown="onSearchKeydown"
        />
        <span v-if="searchLoading" class="search-spinner" aria-hidden="true" />
        <kbd v-show="!searchFocused" class="search-shortcut">Ctrl+K</kbd>

        <!-- 全局搜索结果面板（GET /admin/search） -->
        <transition name="dropdown">
          <div v-if="searchVisible" class="search-panel" @mousedown.prevent>
            <div v-if="searchLoading && !hasSearchResults" class="sp-state">
              <span class="sp-spinner" aria-hidden="true" />{{ $t('搜索中...') }}
            </div>
            <div v-else-if="searchError" class="sp-state sp-state-error">{{ $t('搜索失败，请重试') }}</div>
            <div v-else-if="!hasSearchResults" class="sp-state">{{ $t('未找到相关内容') }}</div>
            <template v-else>
              <!-- 视频结果 -->
              <section v-if="searchResults.videos.length" class="sp-section">
                <div class="sp-head">{{ $t('视频') }}<span class="sp-count">{{ searchResults.videos.length }}</span></div>
                <div
                  v-for="(v, i) in searchResults.videos"
                  :key="'sv' + v.id"
                  class="sp-item"
                  :class="{ active: itemIndex('video', i) === activeIndex }"
                  @mouseenter="activeIndex = itemIndex('video', i)"
                  @click="goSearchResult('video', v)"
                >
                  <div class="sp-cover">
                    <img v-if="resUrl(v.coverUrl)" :src="resUrl(v.coverUrl)" alt="" />
                    <span v-else class="sp-cover-fb">▶</span>
                  </div>
                  <div class="sp-main">
                    <div class="sp-title">{{ v.title }}</div>
                    <div class="sp-meta">
                      <span v-if="v.avid" class="sp-mono">{{ v.avid }}</span>
                      <span v-if="v.categoryName">{{ v.categoryName }}</span>
                      <span v-if="v.nickName">{{ $t('UP主') }} · {{ v.nickName }}</span>
                    </div>
                  </div>
                  <div class="sp-side">
                    <span class="sp-stat">▶ {{ fmtCount(v.playCount) }}</span>
                    <span class="sp-tag" :class="videoStatusClass(v.videoStatus)">{{ $t(videoStatusText(v.videoStatus)) }}</span>
                  </div>
                </div>
              </section>

              <!-- 用户结果 -->
              <section v-if="searchResults.users.length" class="sp-section">
                <div class="sp-head">{{ $t('用户') }}<span class="sp-count">{{ searchResults.users.length }}</span></div>
                <div
                  v-for="(u, i) in searchResults.users"
                  :key="'su' + u.id"
                  class="sp-item"
                  :class="{ active: itemIndex('user', i) === activeIndex }"
                  @mouseenter="activeIndex = itemIndex('user', i)"
                  @click="goSearchResult('user', u)"
                >
                  <div class="sp-avatar">
                    <img v-if="resUrl(u.avatar)" :src="resUrl(u.avatar)" alt="" />
                    <span v-else class="sp-avatar-fb">{{ (u.userName || '?')[0].toUpperCase() }}</span>
                  </div>
                  <div class="sp-main">
                    <div class="sp-title">{{ u.nikeName || u.userName }}<span class="sp-sub">{{ u.userName }}</span></div>
                    <div class="sp-meta">
                      <span v-if="u.email">{{ u.email }}</span>
                      <span v-if="u.uid" class="sp-mono">UID {{ u.uid }}</span>
                    </div>
                  </div>
                  <div class="sp-side">
                    <span v-if="u.roleName" class="sp-role">{{ $t(u.roleName) }}</span>
                    <span class="sp-tag" :class="u.status === 0 ? 'ok' : 'bad'">{{ u.status === 0 ? $t('启用') : $t('禁用') }}</span>
                  </div>
                </div>
              </section>

              <!-- 评论结果 -->
              <section v-if="searchResults.comments.length" class="sp-section">
                <div class="sp-head">{{ $t('评论') }}<span class="sp-count">{{ searchResults.comments.length }}</span></div>
                <div
                  v-for="(c, i) in searchResults.comments"
                  :key="'sc' + c.id"
                  class="sp-item sp-item-comment"
                  :class="{ active: itemIndex('comment', i) === activeIndex }"
                  @mouseenter="activeIndex = itemIndex('comment', i)"
                  @click="goSearchResult('comment', c)"
                >
                  <div class="sp-avatar">
                    <img v-if="resUrl(c.avatar)" :src="resUrl(c.avatar)" alt="" />
                    <span v-else class="sp-avatar-fb">{{ (c.nickName || '?')[0].toUpperCase() }}</span>
                  </div>
                  <div class="sp-main">
                    <div class="sp-line1">
                      <span class="sp-name">{{ c.nickName }}</span>
                      <span v-if="c.createTime" class="sp-time">{{ c.createTime }}</span>
                    </div>
                    <div class="sp-content">{{ c.content }}</div>
                    <div v-if="c.videoTitle" class="sp-meta"><span class="sp-video">{{ c.videoTitle }}</span></div>
                  </div>
                  <span class="sp-tag" :class="commentStatusClass(c.status)">{{ $t(commentStatusText(c.status)) }}</span>
                </div>
              </section>
            </template>
            <div v-if="hasSearchResults" class="sp-foot">
              <span class="sp-foot-note">{{ $t('最多显示10条') }}</span>
              <span class="sp-foot-keys">{{ $t('↑↓ 选择 · Enter 打开 · Esc 关闭') }}</span>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 右侧：功能按钮 + 用户信息 -->
    <div class="topbar-right">
      <!-- 语言切换按钮 -->
      <div 
        class="action-btn lang-toggle"
        :class="{ 'is-dark': appStore.darkMode }"
        @click="handleLanguageToggle"
      >
        <div class="lang-icon-wrapper">
          <transition name="lang-icon" mode="out-in">
            <span class="lang-text" :key="appStore.language">
              {{ appStore.language === 'zh-cn' ? $t('中文') : 'EN' }}
            </span>
          </transition>
        </div>
      </div>

      <!-- 深色模式切换按钮 -->
      <div 
        class="action-btn theme-toggle" 
        :class="{ 'is-dark': appStore.darkMode }"
        @click="handleThemeToggle"
      >
        <div class="theme-icon-wrapper">
          <transition name="theme-icon" mode="out-in">
            <el-icon :size="18" :key="appStore.darkMode ? 'moon' : 'sunny'">
              <Moon v-if="appStore.darkMode" />
              <Sunny v-else />
            </el-icon>
          </transition>
        </div>
      </div>

      <!-- 字体设置按钮 -->
      <div class="action-btn font-toggle" @click="showFontPopover = !showFontPopover">
        <span class="font-icon-text">Aa</span>
      </div>

      <!-- 字体设置弹出框 -->
      <transition name="dropdown">
        <div v-if="showFontPopover" class="font-popover" ref="fontPopoverRef">
          <div class="font-popover-title">{{ $t('字体设置') }}</div>
          <div class="font-option-group">
            <div class="font-option-label">{{ $t('字体') }}</div>
            <el-select v-model="currentFont" :placeholder="$t('选择字体')" @change="handleFontChange" style="width: 100%">
              <el-option v-for="font in fontOptions" :key="font" :label="$t(font)" :value="font" />
            </el-select>
          </div>
          <div class="font-option-group">
            <div class="font-option-label">{{ $t('字号') }}</div>
            <el-slider v-model="currentFontSize" :min="12" :max="20" :step="1" show-stops @input="handleFontSizeInput" @change="handleFontSizeChange" />
            <div class="font-size-labels">
              <span>{{ $t('小') }}</span>
              <span>{{ $t('大') }}</span>
            </div>
          </div>
          <div class="font-preview" :style="{ fontFamily: getFontFamily(currentFont), fontSize: currentFontSize + 'px' }">
            {{ $t('预览文字 Abc 123') }}
          </div>
        </div>
      </transition>

      <!-- 通知按钮 -->
      <div class="action-btn" @click="router.push('/notice')">
        <el-icon :size="18"><Bell /></el-icon>
        <span class="notif-dot" />
      </div>

      <!-- 用户头像和下拉菜单触发器 -->
      <div class="user-trigger" ref="userTriggerRef" @click="showDropdown = !showDropdown" @mouseenter="handleAvatarMouseEnter" @mouseleave="handleAvatarMouseLeave">
        <div class="avatar-ring">
          <div class="avatar-inner">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              class="avatar-img"
              @error="e => e.target.style.display='none'"
            />
            <span v-else class="avatar-text">{{ initials }}</span>
          </div>
        </div>
        <span class="user-name">{{ userStore.userInfo?.nikeName || 'Admin' }}</span>
        <el-icon class="arrow" :class="{ open: showDropdown }"><ArrowDown /></el-icon>
      </div>

      <!-- 用户下拉菜单 -->
      <transition name="dropdown">
        <div v-if="showDropdown" class="user-dropdown" ref="dropdownRef">
          <div class="dd-header">
            <div class="dd-name">{{ userStore.userInfo?.nikeName || 'Admin' }}</div>
            <div class="dd-role">{{ $t(userStore.userInfo?.roleName || '') || $t('管理员') }}</div>
          </div>
          <div class="dd-divider" />
          <div class="dd-item" @click="openProfileModal">
            <el-icon><User /></el-icon>{{ $t('编辑资料') }}
          </div>
          <div class="dd-item" @click="router.push('/settings')">
            <el-icon><Setting /></el-icon>{{ $t('系统设置') }}
          </div>
          <div class="dd-divider" />
          <div class="dd-item danger" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>{{ $t('登出') }}
          </div>
        </div>
      </transition>
    </div>

    <!-- 弹窗区域（使用Teleport渲染到body） -->
    <teleport to="body">
      <!-- 个人中心弹窗 -->
      <transition name="modal-fade">
        <div v-if="profileVisible" class="profile-overlay" @click.self="profileVisible = false">
          <div class="profile-modal">
            <div class="modal-header">
              <span>{{ $t('个人中心') }}</span>
              <el-icon class="close-btn" @click="profileVisible = false"><Close /></el-icon>
            </div>
            <div class="modal-body">
              <div class="profile-layout">
                <!-- 左侧：头像和用户信息 -->
                <div class="profile-left">
                  <div class="avatar-upload" @click="fileInputRef?.click()">
                    <img v-if="profileForm.avatarPreview || avatarUrl" :src="profileForm.avatarPreview || avatarUrl" class="preview-img" />
                    <div v-else class="preview-placeholder">{{ initials }}</div>
                    <div class="upload-overlay">
                      <el-icon :size="28"><Upload /></el-icon>
                      <span class="overlay-text">{{ $t('点击上传') }}</span>
                    </div>
                  </div>
                  <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="handleAvatarUpload" />
                  <div class="profile-username">{{ userStore.userInfo?.userName || 'administer' }}</div>
                  <div class="profile-email-text">{{ userStore.userInfo?.email || 'user@example.com' }}</div>
                  <button class="view-avatar-btn" @click="showFullAvatar = true">{{ $t('查看头像') }}</button>
                </div>
                <!-- 右侧：表单 -->
                <div class="profile-right">
                  <div class="form-group">
                    <label class="form-label">{{ $t('用户名') }}</label>
                    <el-input :model-value="userStore.userInfo?.userName" disabled size="large" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">{{ $t('昵称') }}</label>
                    <el-input v-model="profileForm.nikeName" :placeholder="$t('请输入昵称')" size="large" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">{{ $t('邮箱') }}</label>
                    <el-input v-model="profileForm.email" :disabled="!profileForm.emailEditing" :placeholder="$t('请输入邮箱')" size="large" />
                    <span v-if="!profileForm.emailEditing" class="edit-email-link" @click="profileForm.emailEditing = true">{{ $t('修改邮箱') }}</span>
                  </div>
                  <div v-if="profileForm.emailEditing" class="form-group">
                    <div class="code-row">
                      <el-input v-model="profileForm.emailCode" :placeholder="$t('请输入验证码')" size="large" />
                      <el-button class="code-btn" size="large" :disabled="codeCountdown > 0" @click="handleSendCode">
                        {{ codeCountdown > 0 ? `${codeCountdown}s` : $t('获取验证码') }}
                      </el-button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">{{ $t('角色') }}</label>
                    <el-input :model-value="userStore.userInfo?.roleName" disabled size="large" />
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <el-button size="large" @click="profileVisible = false">{{ $t('取消') }}</el-button>
              <el-button size="large" type="primary" :loading="profileSaving" class="confirm-btn" @click="handleSaveProfile">{{ $t('确认') }}</el-button>
            </div>
          </div>
        </div>
      </transition>
      <!-- 头像全屏预览 -->
      <transition name="modal-fade">
        <div v-if="showFullAvatar" class="full-avatar-overlay" @click="showFullAvatar = false">
          <img :src="profileForm.avatarPreview || avatarUrl" class="full-avatar-img" />
        </div>
      </transition>
      <!-- 头像悬浮大图预览（鼠标悬浮5秒后显示） -->
      <transition name="modal-fade">
        <div v-if="showAvatarTooltip" class="avatar-tooltip-overlay" @click="showAvatarTooltip = false">
          <div class="avatar-tooltip">
            <img :src="avatarUrl" class="avatar-tooltip-img" />
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
/**
 * Navbar 组件
 * 顶部导航栏组件，包含以下功能：
 * 1. 汉堡菜单按钮（展开/收起侧边栏）
 * 2. 面包屑导航
 * 3. 搜索框
 * 4. 语言切换
 * 5. 深色模式切换
 * 6. 通知按钮
 * 7. 用户信息和下拉菜单
 * 8. 个人中心弹窗（头像上传、信息修改）
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { logout as logoutApi, getUserInfo as getUserInfoApi, sendEmailCode } from '@/api/auth'
import { globalSearch } from '@/api/search'
import { clearAuth, setUserInfo } from '@/utils/auth'
import { resUrl } from '@/utils/resUrl'

const { t } = useI18n()

// 路由和状态管理
const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()


// 搜索相关状态
const searchQuery = ref('')
const searchFocused = ref(false)
const searchInputRef = ref(null)
const searchLoading = ref(false)
const searchError = ref(false)
const searchResults = ref({ videos: [], users: [], comments: [] })
const activeIndex = ref(0)
let searchTimer = null
let searchSeq = 0

// 面板仅在聚焦且关键词非空时展示
const searchVisible = computed(() => searchFocused.value && !!searchQuery.value.trim())
const hasSearchResults = computed(() => {
  const r = searchResults.value
  return r.videos.length + r.users.length + r.comments.length > 0
})
// 扁平化结果用于 ↑↓ 键盘导航
const flatSearchItems = computed(() => {
  const r = searchResults.value
  return [
    ...r.videos.map((data) => ({ type: 'video', data })),
    ...r.users.map((data) => ({ type: 'user', data })),
    ...r.comments.map((data) => ({ type: 'comment', data }))
  ]
})
const itemIndex = (type, i) => {
  const r = searchResults.value
  if (type === 'video') return i
  if (type === 'user') return r.videos.length + i
  return r.videos.length + r.users.length + i
}

// 状态文案与配色（后端固定中文枚举，渲染处包 $t()）
const VIDEO_STATUS_TEXT = { 0: '草稿', 1: '待发布', 2: '已发布', 3: '已下架' } // i18n-key
const COMMENT_STATUS_TEXT = { 0: '正常', 1: '用户删除', 2: '运营屏蔽', 3: '待审核' } // i18n-key
const videoStatusText = (s) => VIDEO_STATUS_TEXT[s] || '未知' // i18n-key
const commentStatusText = (s) => COMMENT_STATUS_TEXT[s] || '未知' // i18n-key
const videoStatusClass = (s) => ({ 0: 'muted', 1: 'warn', 2: 'ok', 3: 'bad' }[s] || 'muted')
const commentStatusClass = (s) => ({ 0: 'ok', 1: 'muted', 2: 'bad', 3: 'warn' }[s] || 'muted')

const fmtCount = (n) => Number(n || 0).toLocaleString('en-US')

/** 防抖 300ms 调用全局搜索，带序号防串号 */
async function doGlobalSearch(keyword) {
  const seq = ++searchSeq
  searchLoading.value = true
  searchError.value = false
  try {
    const res = await globalSearch({ keyword, limit: 10 })
    if (seq !== searchSeq) return
    const d = res?.data || {}
    searchResults.value = { videos: d.videos || [], users: d.users || [], comments: d.comments || [] }
    activeIndex.value = 0
  } catch (e) {
    if (seq !== searchSeq) return
    searchResults.value = { videos: [], users: [], comments: [] }
    searchError.value = true
    console.warn('[navbar] 全局搜索失败：', e?.message || e)
  } finally {
    if (seq === searchSeq) searchLoading.value = false
  }
}

function onSearchInput() {
  activeIndex.value = 0
  searchError.value = false
  if (searchTimer) clearTimeout(searchTimer)
  const keyword = searchQuery.value.trim()
  if (!keyword) {
    searchSeq++ // 作废进行中的请求
    searchLoading.value = false
    searchResults.value = { videos: [], users: [], comments: [] }
    return
  }
  searchLoading.value = true // 防抖等待期间也显示 loading，避免闪「无结果」
  searchTimer = setTimeout(() => doGlobalSearch(keyword), 300)
}

function moveActive(delta) {
  const total = flatSearchItems.value.length
  if (!total) return
  activeIndex.value = (activeIndex.value + delta + total) % total
}

function openActive() {
  const item = flatSearchItems.value[activeIndex.value] || flatSearchItems.value[0]
  if (item) goSearchResult(item.type, item.data)
}

function onSearchKeydown(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1) }
  else if (e.key === 'Enter') { e.preventDefault(); openActive() }
  else if (e.key === 'Escape') { e.preventDefault(); closeSearch() }
}

function closeSearch() {
  searchFocused.value = false
  searchInputRef.value?.blur()
}

function resetSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchSeq++
  searchQuery.value = ''
  searchLoading.value = false
  searchError.value = false
  searchResults.value = { videos: [], users: [], comments: [] }
  activeIndex.value = 0
}

/** 点击/回车打开结果：视频→视频管理、用户→用户管理（带 userName + tab 回填，按用户类型落到对应 tab）、评论→评论管理（带 query 回填） */
function goSearchResult(type, data) {
  if (!data) return
  let target = null
  if (type === 'video') target = { path: '/video-manage', query: { videoId: data.avid } }
  else if (type === 'user') target = { path: '/users', query: { userName: data.userName, tab: data.type === 1 ? 'admin' : 'user' } }
  else if (type === 'comment') target = { path: '/comment-manage', query: { keyword: data.content } }
  if (!target) return
  resetSearch()
  closeSearch()
  router.push(target)
}

// Ctrl+K / Cmd+K 全局聚焦搜索框
function handleGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k') {
    e.preventDefault()
    searchInputRef.value?.focus()
  }
}

// 下拉菜单状态
const showDropdown = ref(false)

// 个人中心弹窗状态
const profileVisible = ref(false)
const showFullAvatar = ref(false)
const profileSaving = ref(false)

// 验证码倒计时
const codeCountdown = ref(0)
let codeTimer = null

// 头像悬浮计时器（5秒后显示大图）
let avatarHoverTimer = null
const showAvatarTooltip = ref(false)

// DOM引用
const userTriggerRef = ref(null)
const dropdownRef = ref(null)
const fileInputRef = ref(null)
const fontPopoverRef = ref(null)

// 字体设置状态
const showFontPopover = ref(false)
const currentFont = ref(appStore.fontFamily || '默认') // i18n-key
const currentFontSize = ref(parseInt(appStore.fontSize) || 14)

// 字体选项（中文值作为字体标识，展示时走 $t()）
const fontOptions = ['默认', '微软雅黑', '宋体', '黑体', '楷体', '仿宋', '思源黑体', '思源宋体', '苹方', '等线'] // i18n-key

// 计算属性：头像URL
const avatarUrl = computed(() => {
  const av = userStore.userInfo?.avatar || userStore.userInfo?.avater
  return resUrl(av)
})

// 计算属性：用户首字母（用于头像占位符）
const initials = computed(() => {
  return (userStore.userInfo?.nikeName || 'A')[0].toUpperCase()
})

// 个人中心表单数据
const profileForm = ref({
  nikeName: '',
  email: '',
  emailEditing: false,
  emailCode: '',
  emailKey: '',
  avatarPreview: '',
  avatarUrl: '',
  uploadProgress: 0
})

/**
 * 切换语言（中文/英文）
 */
function toggleLanguage() {
  const newLang = appStore.language === 'zh-cn' ? 'en' : 'zh-cn'
  appStore.setLanguage(newLang)
}

// 语言切换按钮点击状态
const isLangToggling = ref(false)

/**
 * 处理语言切换（带动画）
 */
function handleLanguageToggle() {
  if (isLangToggling.value) return
  isLangToggling.value = true
  toggleLanguage()
  setTimeout(() => {
    isLangToggling.value = false
  }, 400)
}

// 主题切换按钮点击状态
const isThemeToggling = ref(false)

/**
 * 处理主题切换（带动画）
 */
function handleThemeToggle() {
  if (isThemeToggling.value) return
  isThemeToggling.value = true
  appStore.toggleDarkMode()
  setTimeout(() => {
    isThemeToggling.value = false
  }, 500)
}

/**
 * 打开个人中心弹窗
 */
function openProfileModal() {
  showDropdown.value = false
  profileForm.value = {
    nikeName: userStore.userInfo?.nikeName || '',
    email: userStore.userInfo?.email || '',
    emailEditing: false,
    emailCode: '',
    emailKey: '',
    avatarPreview: '',
    avatarUrl: userStore.userInfo?.avatar || userStore.userInfo?.avater || '',
    uploadProgress: 0
  }
  profileVisible.value = true
}

/**
 * 处理头像上传
 * @param {Event} e - 文件选择事件
 */
async function handleAvatarUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.warning(t('请选择图片文件'))
    return
  }
  
  // 验证文件大小（最大5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning(t('图片大小不能超过5MB'))
    return
  }
  
  // 预览图片
  const reader = new FileReader()
  reader.onload = (ev) => {
    profileForm.value.avatarPreview = ev.target.result
  }
  reader.readAsDataURL(file)

  // 使用统一上传工具
  profileForm.value.uploadProgress = 1
  try {
    const { uploadFile } = await import('@/utils/upload')
    const result = await uploadFile(file, {
      category: 'image',
      onProgress: (p) => { profileForm.value.uploadProgress = p }
    })
    profileForm.value.avatarUrl = result.url
    ElMessage.success(t('头像上传成功'))
  } catch {} finally {
    setTimeout(() => { profileForm.value.uploadProgress = 0 }, 1000)
  }
}

/**
 * 发送邮箱验证码
 */
async function handleSendCode() {
  if (!profileForm.value.email) {
    ElMessage.warning(t('请先输入邮箱'))
    return
  }
  try {
    const key = `email_${Date.now()}`
    profileForm.value.emailKey = key
    await sendEmailCode(profileForm.value.email)
    ElMessage.success(t('验证码已发送'))
    // 开始60秒倒计时
    codeCountdown.value = 60
    codeTimer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) clearInterval(codeTimer)
    }, 1000)
  } catch {}
}

/**
 * 保存个人资料
 */
async function handleSaveProfile() {
  if (!profileForm.value.nikeName) {
    ElMessage.warning(t('请输入昵称'))
    return
  }
  profileSaving.value = true
  try {
    const { default: request } = await import('@/utils/request')
    const payload = {
      id: userStore.userInfo?.id,
      nikeName: profileForm.value.nikeName
    }
    if (profileForm.value.avatarUrl) payload.avatar = profileForm.value.avatarUrl
    if (profileForm.value.emailEditing && profileForm.value.emailCode) {
      payload.email = profileForm.value.email
      payload.key = profileForm.value.emailKey
      payload.captcha = profileForm.value.emailCode
    }
    const res = await request.post('/admin/user/update', payload)
    if (res.code === 200) {
      // 更新本地用户信息
      const userRes = await getUserInfoApi()
      if (userRes.code === 200) {
        userStore.userInfo = userRes.data
        setUserInfo(userRes.data)
      }
      // 触发用户更新事件
      window.dispatchEvent(new CustomEvent('user-updated'))
      ElMessage.success(t('保存成功'))
      profileVisible.value = false
    }
  } catch {} finally {
    profileSaving.value = false
  }
}

/**
 * 处理登出
 */
async function handleLogout() {
  showDropdown.value = false
  try {
    await logoutApi()
  } catch {
    console.log('登出接口失败')
  }
  clearAuth()
  localStorage.removeItem('expandedMenus')
  sessionStorage.clear()
  userStore.userInfo = null
  userStore.user = null
  router.push('/login')
}

/**
 * 点击外部关闭下拉菜单
 */
function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target) && userTriggerRef.value && !userTriggerRef.value.contains(e.target)) {
    showDropdown.value = false
  }
  if (fontPopoverRef.value && !fontPopoverRef.value.contains(e.target) && !e.target.closest('.font-toggle')) {
    showFontPopover.value = false
  }
}

/**
 * 获取字体样式
 */
function getFontFamily(fontName) {
  const fontMap = {
    '默认': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif", // i18n-key
    '微软雅黑': "'Microsoft YaHei', sans-serif", // i18n-key
    '宋体': "'SimSun', serif", // i18n-key
    '黑体': "'SimHei', sans-serif", // i18n-key
    '楷体': "'KaiTi', serif", // i18n-key
    '仿宋': "'FangSong', serif", // i18n-key
    '思源黑体': "'Noto Sans SC', sans-serif", // i18n-key
    '思源宋体': "'Noto Serif SC', sans-serif", // i18n-key
    '苹方': "'PingFang SC', 'Helvetica Neue', sans-serif", // i18n-key
    '等线': "'DengXian', sans-serif" // i18n-key
  }
  return fontMap[fontName] || fontMap['默认'] // i18n-key
}

/**
 * 处理字体切换
 */
function handleFontChange(value) {
  appStore.setFontFamily(value)
}

/**
 * 处理字号实时变化（拖动时）
 */
function handleFontSizeInput(value) {
  currentFontSize.value = value
  applyFontSizeRealtime(value)
}

/**
 * 处理字号变化（松开鼠标时）
 */
function handleFontSizeChange(value) {
  appStore.setFontSize(String(value))
}

/**
 * 实时应用字号（不保存到localStorage）
 */
function applyFontSizeRealtime(size) {
  const sizeNum = parseInt(size) || 14
  const ratio = sizeNum / 14
  // 更新自定义CSS变量
  document.documentElement.style.setProperty('--font-size-base', `${sizeNum}px`)
  document.documentElement.style.setProperty('--font-size-sm', `${Math.round(12 * ratio)}px`)
  document.documentElement.style.setProperty('--font-size-lg', `${Math.round(16 * ratio)}px`)
  let styleEl = document.getElementById('dynamic-font-size')
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'dynamic-font-size'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = `
    html { font-size: ${sizeNum}px !important; }
    body { font-size: ${sizeNum}px !important; }
    :root {
      --el-font-size-extra-large: ${Math.round(18 * ratio)}px !important;
      --el-font-size-large: ${Math.round(16 * ratio)}px !important;
      --el-font-size-medium: ${sizeNum}px !important;
      --el-font-size-base: ${sizeNum}px !important;
      --el-font-size-small: ${Math.round(13 * ratio)}px !important;
      --el-font-size-extra-small: ${Math.round(12 * ratio)}px !important;
    }
    /* Element Plus 组件 */
    .el-button, .el-input, .el-select, .el-textarea,
    .el-table, .el-dialog, .el-card, .el-tag, .el-menu,
    .el-pagination, .el-form-item__label, .el-dropdown-menu__item,
    .el-checkbox__label, .el-radio__label,
    .el-collapse-item__header, .el-transfer__panel,
    .el-statistic__head, .el-statistic__content,
    .el-result__title, .el-result__subtitle,
    .el-empty__description, .el-page-header__title,
    .el-breadcrumb__item, .el-tabs__item,
    .el-step__title, .el-alert__title, .el-alert__description,
    .el-divider__text, .el-timeline-item__timestamp,
    .el-table__header th, .el-table__body td,
    .el-popover__title, .el-message-box__title,
    .el-message-box__content, .el-notification__title,
    .el-notification__content, .el-drawer__header,
    .el-color-picker__trigger, .el-date-editor .el-input__inner,
    .el-cascader, .el-slider__runway, .el-slider__button-wrapper span,
    .el-date-editor .el-range-input {
      font-size: ${sizeNum}px !important;
    }
    .el-dialog__title { font-size: ${Math.round(16 * ratio)}px !important; }
    .el-message-box__title { font-size: ${Math.round(16 * ratio)}px !important; }
    .el-table th { font-size: ${Math.round(13 * ratio)}px !important; }
    /* 通用页面元素 */
    p, span, div, a, li, td, th, label, input, textarea, select,
    h1, h2, h3, h4, h5, h6 {
      font-size: inherit;
    }
    /* 侧边栏 */
    .sidebar-menu .el-menu-item,
    .sidebar-menu .el-sub-menu__title,
    .sidebar-link, .menu-title, .submenu-item {
      font-size: ${sizeNum}px !important;
    }
    .logo-text { font-size: ${Math.round(18 * ratio)}px !important; }
    .user-name { font-size: ${sizeNum}px !important; }
    .user-role { font-size: ${Math.round(11 * ratio)}px !important; }
    /* 导航栏 */
    .breadcrumb-item { font-size: ${Math.round(13 * ratio)}px !important; }
    .nav-username { font-size: ${sizeNum}px !important; }
    /* 卡片标题 */
    .card-header__title, .stat-label { font-size: ${sizeNum}px !important; }
    .stat-value { font-size: ${Math.round(28 * ratio)}px !important; }
    /* 表格 */
    .el-table .cell { font-size: ${Math.round(13 * ratio)}px !important; }
  `
}

/**
 * 头像鼠标悬浮事件处理（5秒后显示大图）
 */
function handleAvatarMouseEnter() {
  avatarHoverTimer = setTimeout(() => {
    showAvatarTooltip.value = true
  }, 5000)
}

/**
 * 头像鼠标离开事件处理（取消计时器）
 */
function handleAvatarMouseLeave() {
  if (avatarHoverTimer) {
    clearTimeout(avatarHoverTimer)
    avatarHoverTimer = null
  }
}

// 组件挂载时添加点击外部关闭下拉菜单的事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleGlobalKeydown)
  // 初始化字体设置
  appStore.applyFontFamily()
  appStore.applyFontSize()
})

// 组件卸载时清理事件监听和计时器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleGlobalKeydown)
  if (searchTimer) clearTimeout(searchTimer)
  if (codeTimer) clearInterval(codeTimer)
  if (avatarHoverTimer) clearTimeout(avatarHoverTimer)
})
</script>

<style lang="scss" scoped>
// ========== 顶部导航栏 ==========
.topbar {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: var(--card-bg, rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
  position: sticky;
  top: 0;
  z-index: 999;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.el-button{
    border-radius: 10px !important;
}

// 汉堡菜单按钮
.hamburger {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  color: #606266;
  transition: all 0.25s;
  &:hover {
    background: rgba(251, 114, 153, 0.08);
    color: #fb7299;
  }
}

// 面包屑导航
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #909399;
}
.bc-sep { color: #c0c4cc; }
.bc-current { color: #303133; font-weight: 500; }

// 搜索区域
.topbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 480px;
  height: 36px;
  padding: 0 14px;
  background: var(--bg-color, #f5f7fa);
  border: 2px solid transparent;
  border-radius: 999px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &.focused {
    background: var(--card-bg, #fff);
    border-color: #fb7299;
    box-shadow: 0 0 0 4px rgba(251, 114, 153, 0.15);
  }
}

.search-icon {
  color: #c0c4cc;
  font-size: 15px;
  flex-shrink: 0;
  transition: color 0.2s;
  &.active { color: #fb7299; }
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-primary, #303133);
  outline: none;
  &::placeholder { color: #c0c4cc; }
}

.search-shortcut {
  font-size: 11px;
  color: #c0c4cc;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e4e7ed);
  border-radius: 4px;
  padding: 1px 6px;
  font-family: monospace;
  flex-shrink: 0;
}

// 搜索 loading 转圈
.search-spinner,
.sp-spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(251, 114, 153, 0.25);
  border-top-color: #fb7299;
  animation: search-spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes search-spin {
  to { transform: rotate(360deg); }
}

// ========== 全局搜索结果面板 ==========
.search-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #f0f2f5);
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.14);
  z-index: 1001;
  max-height: min(460px, 62vh);
  overflow-y: auto;
  padding: 4px 0;
  display: flex;
  flex-direction: column;
}

.sp-state {
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary, #909399);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.sp-state-error { color: #f56c6c; }

.sp-section {
  padding: 2px 0;
  &:not(:last-of-type) {
    border-bottom: 1px solid var(--border-color, #f0f2f5);
  }
}

.sp-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary, #909399);
}
.sp-count {
  min-width: 18px;
  height: 16px;
  padding: 0 5px;
  border-radius: 8px;
  background: rgba(251, 114, 153, 0.12);
  color: #fb7299;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sp-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover,
  &.active {
    background: rgba(251, 114, 153, 0.07);
  }
}

.sp-cover {
  width: 56px;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg-color, #f5f7fa);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  img { width: 100%; height: 100%; object-fit: cover; }
}
.sp-cover-fb { color: #c0c4cc; font-size: 12px; }

.sp-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #fb7299, #7c5cfc);
  display: flex;
  align-items: center;
  justify-content: center;
  img { width: 100%; height: 100%; object-fit: cover; }
}
.sp-avatar-fb { color: #fff; font-size: 13px; font-weight: 700; }

.sp-main { flex: 1; min-width: 0; }

.sp-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sp-sub {
  margin-left: 6px;
  font-size: 12px;
  font-weight: 400;
  color: #909399;
}
.sp-meta {
  display: flex;
  gap: 8px;
  margin-top: 2px;
  font-size: 11px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sp-mono { font-family: monospace; }

.sp-line1 {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sp-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sp-time { font-size: 11px; color: #c0c4cc; flex-shrink: 0; }
.sp-content {
  font-size: 12px;
  color: var(--text-secondary, #606266);
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}
.sp-video { color: #fb7299; }

.sp-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}
.sp-stat { font-size: 11px; color: #909399; }
.sp-role {
  font-size: 10px;
  font-weight: 600;
  color: #7c5cfc;
  background: rgba(124, 92, 252, 0.1);
  padding: 1px 6px;
  border-radius: 999px;
}

.sp-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 999px;
  flex-shrink: 0;
  &.ok { color: #67c23a; background: rgba(103, 194, 58, 0.12); }
  &.warn { color: #e6a23c; background: rgba(230, 162, 60, 0.12); }
  &.bad { color: #f56c6c; background: rgba(245, 108, 108, 0.12); }
  &.muted { color: #909399; background: rgba(144, 147, 153, 0.12); }
}

.sp-foot {
  position: sticky;
  bottom: 0;
  margin-top: auto;
  padding: 6px 14px;
  font-size: 11px;
  color: #c0c4cc;
  background: var(--card-bg, #fff);
  border-top: 1px solid var(--border-color, #f0f2f5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.sp-foot-note { flex-shrink: 0; }
.sp-foot-keys { text-align: right; }

// 右侧功能区
.topbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

// 功能按钮（语言、深色模式、通知）
.action-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: #606266;
  transition: all 0.25s;
  position: relative;
  &:hover {
    background: #f5f7fa;
    color: #fb7299;
  }
}

// 语言切换按钮动画
.lang-toggle {
  overflow: hidden;
  width: auto;
  min-width: 40px;
  padding: 0 8px;
  
  &:hover {
    background: rgba(251, 114, 153, 0.1);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &.is-dark {
    color: #e2e8f0;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffd700;
    }
  }
}

// 语言图标容器
.lang-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

// 语言文字样式
.lang-text {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

// 语言切换动画
.lang-icon-enter-active {
  animation: langIconIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.lang-icon-leave-active {
  animation: langIconOut 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes langIconIn {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.8);
  }
  60% {
    opacity: 0.8;
    transform: translateY(-2px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes langIconOut {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-12px) scale(0.8);
  }
}

// 语言切换按钮涟漪效果
.lang-toggle::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 114, 153, 0.3) 0%, transparent 70%);
  transform: scale(0);
  opacity: 0;
  transition: transform 0.5s, opacity 0.5s;
  pointer-events: none;
}

.lang-toggle:active::after {
  transform: scale(2);
  opacity: 1;
  transition: 0s;
}

html.dark-mode .lang-toggle::after {
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
}

// 主题切换按钮动画
.theme-toggle {
  overflow: hidden;
  
  &:hover {
    background: rgba(251, 114, 153, 0.1);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &.is-dark {
    color: #e2e8f0;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffd700;
    }
  }
}

// 图标容器
.theme-icon-wrapper {
  position: relative;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 图标切换动画 - 更自然的过渡效果
.theme-icon-enter-active {
  animation: themeIconIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-icon-leave-active {
  animation: themeIconOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes themeIconIn {
  0% {
    opacity: 0;
    transform: rotate(-90deg) scale(0.3);
    filter: blur(2px);
  }
  40% {
    opacity: 0.6;
    transform: rotate(-20deg) scale(1.15);
    filter: blur(0);
  }
  70% {
    opacity: 0.9;
    transform: rotate(10deg) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: rotate(0deg) scale(1);
    filter: blur(0);
  }
}

@keyframes themeIconOut {
  0% {
    opacity: 1;
    transform: rotate(0deg) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: rotate(90deg) scale(0.3);
    filter: blur(2px);
  }
}

// 按钮点击涟漪效果
.theme-toggle::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 114, 153, 0.3) 0%, transparent 70%);
  transform: scale(0);
  opacity: 0;
  transition: transform 0.5s, opacity 0.5s;
  pointer-events: none;
}

.theme-toggle:active::after {
  transform: scale(2);
  opacity: 1;
  transition: 0s;
}

// 深色模式下的涟漪效果
html.dark-mode .theme-toggle::after {
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
}

// 字体设置按钮
.font-toggle {
  &:hover {
    background: rgba(251, 114, 153, 0.1);
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.95);
  }
}

.font-icon-text {
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}

// 字体设置弹出框
.font-popover {
  position: absolute;
  top: 56px;
  right: 70px;
  width: 280px;
  background: var(--card-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 16px;
  z-index: 1000;
  border: 1px solid var(--border-color, #f0f2f5);
}

.font-popover-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin-bottom: 16px;
}

.font-option-group {
  margin-bottom: 16px;
}

.font-option-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary, #909399);
  margin-bottom: 8px;
}

.font-size-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary, #909399);
  margin-top: 4px;
}

.font-preview {
  padding: 12px;
  background: var(--bg-color, #f5f7fa);
  border-radius: 8px;
  text-align: center;
  color: var(--text-primary, #303133);
}

// 通知红点
.notif-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
  border: 2px solid #fff;
  animation: dot-pulse 2s ease-in-out infinite;
}
@keyframes dot-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

// 用户触发器（头像+用户名）
.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s;
  &:hover { background: #f5f7fa; }
}

// 头像外环（渐变色）
.avatar-ring {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, #fb7299, #7c5cfc);
  transition: all 0.3s;
  .user-trigger:hover & {
    transform: scale(1.1);
    box-shadow: 0 0 12px rgba(251, 114, 153, 0.4);
  }
}

// 头像内部容器
.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--card-bg, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// 头像占位符（首字母）
.avatar-text {
  font-size: 14px;
  font-weight: 700;
  color: #fb7299;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #303133);
}

// 下拉箭头
.arrow {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  transition: transform 0.25s;
  &.open { transform: rotate(180deg); }
}

// 用户下拉菜单
.user-dropdown {
  position: absolute;
  top: 56px;
  right: 20px;
  width: 200px;
  background: var(--card-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 8px 0;
  z-index: 1000;
  border: 1px solid var(--border-color, #f0f2f5);
}

.dd-header {
  padding: 12px 16px 8px;
}
.dd-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}
.dd-role {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  margin-top: 2px;
}

.dd-divider {
  height: 1px;
  background: var(--border-color, #f0f2f5);
  margin: 4px 0;
}

.dd-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  color: var(--text-primary, #303133);
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: var(--bg-color, #f5f7fa); }
  &.danger {
    color: #f56c6c;
    &:hover { background: rgba(245, 108, 108, 0.1); }
  }
}

// 下拉菜单动画
.dropdown-enter-active { animation: dd-in 0.2s ease-out; }
.dropdown-leave-active { animation: dd-in 0.15s ease-in reverse; }
@keyframes dd-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

// ========== 个人中心弹窗 ==========
.profile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.profile-modal {
  width: 700px;
  max-width: 90vw;
  max-height: 85vh;
  background: var(--card-bg, #fff);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 32px;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  border-bottom: 1px solid #ebeef5;
}
.close-btn {
  cursor: pointer;
  color: #c0c4cc;
  font-size: 20px;
  transition: color 0.2s;
  &:hover { color: #606266; }
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
}

.profile-layout {
  display: flex;
  gap: 40px;
}

// 左侧：头像区域
.profile-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 160px;
  flex-shrink: 0;
}

// 头像上传区域
.avatar-upload {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 3px solid #e4e7ed;
  transition: border-color 0.3s;
  &:hover {
    border-color: #00bcd4;
  }
  &:hover .upload-overlay { opacity: 1; }
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// 头像占位符
.preview-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fb7299, #7c5cfc);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 700;
  color: #fff;
}

// 上传遮罩层
.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.25s ease;
  gap: 6px;
}

.overlay-text {
  font-size: 12px;
  font-weight: 500;
}

.profile-username {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  margin-top: 16px;
}

.profile-email-text {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.view-avatar-btn {
  margin-top: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #00bcd4;
  background: none;
  border: 1.5px solid #00bcd4;
  border-radius: 20px;
  padding: 6px 18px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(0, 188, 212, 0.08);
  }
}

// 右侧：表单区域
.profile-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

// 表单输入框样式覆盖
.profile-modal :deep(.el-input__wrapper) {
  border-radius: 10px;
  background-color: #f5f7fa;
  box-shadow: none;
  border: 1px solid #e4e7ed;
  padding: 0 14px;
  height: 42px;
  transition: border-color 0.2s;
}

.profile-modal :deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

.profile-modal :deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  box-shadow: none;
  cursor: default;
}

.profile-modal :deep(.el-input__inner) {
  font-size: 14px;
  color: #303133;
  height: 40px;
  line-height: 40px;
}

.profile-modal :deep(.el-input.is-disabled .el-input__inner) {
  color: #a8abb2;
  -webkit-text-fill-color: #a8abb2;
}

.profile-modal :deep(.el-input__inner::placeholder) {
  color: #c0c4cc;
}

// 修改邮箱链接
.edit-email-link {
  font-size: 13px;
  font-weight: 600;
  color: #00bcd4;
  cursor: pointer;
  display: inline-block;
  transition: opacity 0.2s;
  &:hover { opacity: 0.75; }
}

// 验证码输入行
.code-row {
  display: flex;
  gap: 10px;
  width: 100%;
  .el-input { flex: 1; }
}

.code-btn {
  flex-shrink: 0;
  border-radius: 10px;
  background: #00bcd4;
  border-color: #00bcd4;
  color: #fff;
  font-weight: 600;
  padding: 0 18px;
  &:hover, &:focus {
    background: #00a5bb;
    border-color: #00a5bb;
    color: #fff;
  }
  &:disabled {
    background: #b2ebf2;
    border-color: #b2ebf2;
    color: #fff;
  }
}

.confirm-btn {
  background: #00bcd4;
  border-color: #00bcd4;
  border-radius: 10px;
  font-weight: 600;
  &:hover, &:focus {
    background: #00a5bb;
    border-color: #00a5bb;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 32px;
  border-top: 1px solid #ebeef5;
}

// 弹窗动画
.modal-fade-enter-active { animation: modal-in 0.25s ease-out; }
.modal-fade-leave-active { animation: modal-in 0.2s ease-in reverse; }
@keyframes modal-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

// ========== 头像全屏预览 ==========
.full-avatar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  cursor: pointer;
}
.full-avatar-img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  object-fit: contain;
}

// ========== 头像悬浮大图预览 ==========
.avatar-tooltip-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
  cursor: pointer;
}

.avatar-tooltip {
  background: transparent;
  border-radius: 16px;
  box-shadow: none;
  animation: tooltip-in 0.3s ease-out;
}

.avatar-tooltip-img {
  max-width: 80vw;
  max-height: 80vh;
  border-radius: 8px;
  object-fit: contain;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

@keyframes tooltip-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
