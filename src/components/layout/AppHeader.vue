<template>
  <header class="bili-header">
    <div class="bili-header__bar" :class="{ 'is-opaque': headerOpaque || isSearchPage }">
      <div class="left-entry">
        <router-link to="/" class="entry-title" title="首页">
          <svg class="zhuzhan-icon" viewBox="0 0 32 32" width="28" height="28">
            <rect width="32" height="32" rx="6" fill="var(--brand_pink)"/>
            <path d="M12 9L23 16L12 23V9Z" fill="white"/>
          </svg>
          <span>VideoHub</span>
        </router-link>
        <div
          class="category-dropdown"
          @mouseenter="handleCategoryMouseEnter"
          @mouseleave="handleCategoryMouseLeave"
        >
          <a class="default-entry" href="/">
            首页
            <svg class="category-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </a>
          <transition name="dropdown-fade">
            <div v-if="showCategoryDropdown" class="category-dropdown-menu" @mouseenter="handleCategoryMouseEnter" @mouseleave="handleCategoryMouseLeave">
              <div v-if="loadingCategories" class="category-loading">
                <div class="loading-spinner-small"></div>
              </div>
              <div v-else class="category-grid">
                <router-link
                  v-for="category in categories"
                  :key="category.id"
                  :to="{ path: '/category/' + category.id }"
                  class="category-item"
                  @click="showCategoryDropdown = false"
                >
                  <span class="category-icon" v-html="getCategoryIcon(category.name)"></span>
                  <span class="category-name">{{ category.name }}</span>
                </router-link>
              </div>
            </div>
          </transition>
        </div>
        <a class="default-entry" href="#">直播</a>
        <a class="default-entry" href="#">游戏中心</a>
        <a class="default-entry" href="#">会员购</a>
        <a class="default-entry" href="#">漫画</a>
        <a class="default-entry" href="#">赛事</a>
        <a class="download-entry" href="#">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          下载客户端
        </a>
      </div>

      <div class="center-search-container" :class="{ 'is-search-page': isSearchPage }">
        <form v-if="!isSearchPage" class="center-search__bar" @submit.prevent="handleSearch">
          <input
            v-model="searchKeyword"
            class="nav-search-input"
            type="text"
            placeholder="搜索视频、番剧、UP主"
            maxlength="100"
          />
          <button type="submit" class="nav-search-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
        </form>
      </div>

        <div class="user-menu" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
          <div class="avatar-wrapper" @click="isLoggedIn ? router.push('/profile') : router.push({ path: '/login', query: { redirect: route.fullPath } })">
          <img v-if="isLoggedIn && user?.avatar" :src="user.avatar" class="avatar-img" />
          <div v-else class="avatar-default">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
        <transition name="dropdown-fade">
          <div v-if="isLoggedIn && showUserMenu" class="user-dropdown" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
            <div class="dropdown-arrow"></div>
            <div class="dropdown-user-center">
              <div class="dropdown-nickname">{{ user?.nikeName || user?.nickname || '用户' }}</div>
              <div v-if="user?.isVip" class="vip-badge">
                <IconVip :size="14" />
                大会员
              </div>
              <div class="user-stats">
                <div class="stat-item">
                  <span class="stat-num">{{ user?.followCount || 0 }}</span>
                  <span class="stat-label">关注</span>
                </div>
                <div class="stat-item">
                  <span class="stat-num">{{ user?.fansCount || 0 }}</span>
                  <span class="stat-label">粉丝</span>
                </div>
              </div>
            </div>
            <div class="dropdown-menu">
              <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>个人中心</span>
                <svg class="item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </router-link>
              <router-link to="/profile?tab=favorites" class="dropdown-item" @click="showUserMenu = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>我的收藏</span>
                <svg class="item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </router-link>
              <router-link to="/history" class="dropdown-item" @click="showUserMenu = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>观看历史</span>
                <svg class="item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </router-link>
            </div>
            <div class="dropdown-footer">
              <button class="logout-btn" @click="handleLogout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
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

      <div class="mini-header-right">
        <div class="header-action" title="大会员">
          <IconVip :size="22" class="header-action-icon" />
          <span class="header-action-text">大会员</span>
        </div>
        <div class="header-action" title="消息">
          <svg class="header-action-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="header-action-text">消息</span>
        </div>
        <div
          class="favorite-wrapper"
          @mouseenter="handleFavoriteMouseEnter"
          @mouseleave="handleFavoriteMouseLeave"
        >
          <div class="header-action" title="收藏" @click="router.push('/profile?tab=favorites')">
            <svg class="header-action-icon" width="24" height="24" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M317 856.1c-15.5 0-30.8-4.8-43.8-14-20.2-14.4-32-37.9-31.6-62.8l3.5-181.7L133 453.9c-15.3-19.5-20-45.4-12.5-69.1 7.5-23.7 26.2-42.2 49.9-49.4l173.9-52.9 102-151.1c13.9-20.6 37-33.1 61.9-33.3h0.6c24.6 0 47.7 12 61.8 32.3l104 149 0.5 0.4 174.8 49.9c23.9 6.8 42.9 25 50.8 48.6 7.9 23.6 3.6 49.5-11.4 69.3l-109.6 145 6.3 182.2c0.9 24.8-10.5 48.5-30.5 63.3-20 14.8-45.9 18.8-69.5 10.6l-171.7-59.5L343 851.5c-8.5 3.1-17.3 4.6-26 4.6zM509.5 173l-103 150.8c-9.6 14.3-24 25-40.6 30L192 406.6l111.6 144.5c10.7 13.6 16.3 30.7 16 47.9l-3.5 181.7L488 719.2c16.2-5.9 34.1-6.1 50.5-0.4l171.7 59.5-5.2-182.5c-0.6-17.3 4.8-34.4 15.2-48.1l109.6-145-175.3-51.3c-16.6-4.8-31.2-15.2-41.1-29.3L509.5 173z" fill="currentColor"/>
            </svg>
            <span class="header-action-text">收藏</span>
          </div>
          <FavoriteHoverPanel
            v-if="isLoggedIn"
            :visible="showFavoritePanel"
            @panel-enter="cancelHidePanel"
            @panel-leave="startHidePanel"
          />
        </div>
        <div
          class="history-wrapper"
          @mouseenter="handleHistoryMouseEnter"
          @mouseleave="handleHistoryMouseLeave"
        >
          <router-link to="/history" class="header-action" title="历史">
            <svg class="header-action-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span class="header-action-text">历史</span>
          </router-link>
          <HistoryHoverPanel
            v-if="isLoggedIn"
            :visible="showHistoryPanel"
            @panel-enter="cancelHideHistoryPanel"
            @panel-leave="startHideHistoryPanel"
          />
        </div>
        <div class="upload-btn" title="投稿" @click="router.push('/contribution')">
          <svg class="upload-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span class="upload-text">投稿</span>
        </div>
      </div>
    </div>

  </header>
  <!-- 顶部 banner 装饰条 - 播放页/搜索页隐藏 -->
  <div class="header-banner-bg" v-if="!isVideoPage && !isHistoryPage && !isSearchPage">
    <div class="banner-bg-img"></div>
    <div class="taper-line"></div>
    <!-- 个人中心页用户信息 -->
    <div v-if="isProfilePage && isLoggedIn" class="banner-profile-info">
      <div class="banner-avatar" @click="emitEditProfile">
        <img v-if="user?.avatar" :src="user.avatar" alt="avatar" />
        <span v-else>{{ (user?.nikeName || user?.nickname || 'U').charAt(0).toUpperCase() }}</span>
      </div>
      <div class="banner-user-detail">
        <div class="banner-nickname">{{ user?.nikeName || user?.nickname || '用户' }}</div>
        <div v-if="isEditingSignature" class="banner-signature-edit">
          <input
            ref="signatureInputRef"
            v-model="editingSignature"
            class="banner-signature-input"
            maxlength="100"
            @blur="saveSignature"
            @keydown.enter="$event.target.blur()"
            @input="resizeSignatureInput"
          />
          <span ref="signatureMeasureRef" class="banner-signature-measure">{{ editingSignature || ' ' }}</span>
        </div>
        <div
          v-else
          class="banner-signature"
          @click="startEditSignature"
        >{{ user?.descript || user?.signature || '这个人很懒，什么都没写...' }}</div>
      </div>
    </div>
    <!-- UP主页用户信息 -->
    <div v-if="isUpProfilePage && upUserInfo" class="banner-profile-info">
      <div class="banner-avatar">
        <img v-if="upUserInfo.avatar" :src="upUserInfo.avatar" alt="avatar" />
        <span v-else>{{ (upUserInfo.nikeName || 'U').charAt(0).toUpperCase() }}</span>
      </div>
      <div class="banner-user-detail">
        <div class="banner-nickname">{{ upUserInfo.nikeName || '用户' }}</div>
        <div class="banner-signature">{{ upUserInfo.descript || '这个人很懒，什么都没写...' }}</div>
      </div>
      <div class="banner-follow-action">
        <button 
          v-if="!upUserInfo.isFollowed" 
          class="follow-btn follow"
          @click="handleFollowUp"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          关注
        </button>
        <button 
          v-else 
          class="follow-btn followed"
          @mouseenter="hoverUnfollowUp = true"
          @mouseleave="hoverUnfollowUp = false"
          @click="handleUnfollowUp"
        >
          <svg v-if="hoverUnfollowUp" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ hoverUnfollowUp ? '取消关注' : '已关注' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { clientLogout, getUserInfoByUid } from '../../api/auth'
import { followUser, unfollowUser } from '../../api/video'
import { useAuthStore } from '../../stores/auth'
import FavoriteHoverPanel from '../FavoriteHoverPanel.vue'
import HistoryHoverPanel from '../HistoryHoverPanel.vue'
import { IconVip } from '../../icons'
import { getCategoryList } from '../../api/category'
import { updateUserProfile } from '../../api/video'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const searchKeyword = ref('')
const headerOpaque = ref('')

const isVideoPage = computed(() => route.name === 'VideoPlay')
const isProfilePage = computed(() => route.name === 'Profile')
const isUpProfilePage = computed(() => route.name === 'UpProfile')
const isHistoryPage = computed(() => route.name === 'History')
const isSearchPage = computed(() => route.name === 'Search')
const showUserMenu = ref(false)
const showFavoritePanel = ref(false)
const showHistoryPanel = ref(false)
const showCategoryDropdown = ref(false)
const loadingCategories = ref(false)
const categories = ref([])
const isHovering = ref(false)
const isFavoriteHovering = ref(false)
const isHistoryHovering = ref(false)
let userShowTimer = null
let userHideTimer = null
let favHideTimer = null
let historyHideTimer = null
let categoryHideTimer = null

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)

const upUserInfo = ref(null)
const hoverUnfollowUp = ref(false)

const loadUpUserInfo = async () => {
  if (isUpProfilePage.value && route.params.uid) {
    try {
      const res = await getUserInfoByUid(route.params.uid)
      upUserInfo.value = res
    } catch (e) {
      console.error('获取UP主信息失败:', e)
      upUserInfo.value = null
    }
  } else {
    upUserInfo.value = null
  }
}

watch(() => [route.name, route.params.uid], () => {
  loadUpUserInfo()
}, { immediate: true })

const handleFollowUp = async () => {
  if (!upUserInfo.value) return
  try {
    await followUser(upUserInfo.value.uid)
    upUserInfo.value.isFollowed = true
    upUserInfo.value.fansCount++
    window.dispatchEvent(new CustomEvent('up-follow-changed', { detail: { uid: upUserInfo.value.uid, isFollowed: true, fansCount: upUserInfo.value.fansCount } }))
  } catch (e) {
    console.error('关注失败:', e)
  }
}

const handleUnfollowUp = async () => {
  if (!upUserInfo.value) return
  try {
    await unfollowUser(upUserInfo.value.uid)
    upUserInfo.value.isFollowed = false
    upUserInfo.value.fansCount--
    hoverUnfollowUp.value = false
    window.dispatchEvent(new CustomEvent('up-follow-changed', { detail: { uid: upUserInfo.value.uid, isFollowed: false, fansCount: upUserInfo.value.fansCount } }))
  } catch (e) {
    console.error('取消关注失败:', e)
  }
}

const isEditingSignature = ref(false)
const editingSignature = ref('')
const signatureInputRef = ref(null)
const signatureMeasureRef = ref(null)

const startEditSignature = () => {
  if (!isOwnProfile.value) return
  editingSignature.value = user.value?.descript || user.value?.signature || ''
  isEditingSignature.value = true
  nextTick(() => {
    signatureInputRef.value?.focus()
    resizeSignatureInput()
  })
}

const resizeSignatureInput = () => {
  nextTick(() => {
    if (signatureMeasureRef.value && signatureInputRef.value) {
      const width = signatureMeasureRef.value.offsetWidth + 24
      signatureInputRef.value.style.width = Math.min(Math.max(width, 100), 700) + 'px'
    }
  })
}

const saveSignature = async () => {
  isEditingSignature.value = false
  const newSignature = editingSignature.value.trim()
  const oldSignature = user.value?.descript || user.value?.signature || ''
  if (newSignature === oldSignature) return
  try {
    await updateUserProfile({ descript: newSignature })
    if (authStore.user) {
      authStore.user.descript = newSignature
      localStorage.setItem('frontUser', JSON.stringify(authStore.user))
    }
  } catch (e) {
    ElMessage.error('修改签名失败')
  }
}

const isOwnProfile = computed(() => {
  return !route.params.uid || route.params.uid === authStore.user?.uid
})

const handleMouseEnter = () => {
  isHovering.value = true
  if (userHideTimer) {
    clearTimeout(userHideTimer)
    userHideTimer = null
  }
  if (isLoggedIn.value && user.value && !showUserMenu.value) {
    userShowTimer = setTimeout(() => {
      if (isLoggedIn.value && user.value) {
        showUserMenu.value = true
      }
    }, 150)
  }
}

const handleMouseLeave = () => {
  isHovering.value = false
  if (userShowTimer) {
    clearTimeout(userShowTimer)
    userShowTimer = null
  }
  userHideTimer = setTimeout(() => {
    if (!isHovering.value) {
      showUserMenu.value = false
    }
  }, 200)
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    const route = router.resolve({ path: '/search', query: { q: searchKeyword.value.trim() } })
    window.open(route.href, '_blank')
  }
}

const handleFavoriteMouseEnter = () => {
  if (!isLoggedIn.value) return
  isFavoriteHovering.value = true
  if (favHideTimer) {
    clearTimeout(favHideTimer)
    favHideTimer = null
  }
  showFavoritePanel.value = true
}

const handleFavoriteMouseLeave = () => {
  isFavoriteHovering.value = false
  startHidePanel()
}

const cancelHidePanel = () => {
  if (favHideTimer) {
    clearTimeout(favHideTimer)
    favHideTimer = null
  }
}

const startHidePanel = () => {
  favHideTimer = setTimeout(() => {
    showFavoritePanel.value = false
  }, 300)
}

const handleHistoryMouseEnter = () => {
  if (!isLoggedIn.value) return
  isHistoryHovering.value = true
  if (historyHideTimer) {
    clearTimeout(historyHideTimer)
    historyHideTimer = null
  }
  showHistoryPanel.value = true
}

const handleHistoryMouseLeave = () => {
  isHistoryHovering.value = false
  startHideHistoryPanel()
}

const cancelHideHistoryPanel = () => {
  if (historyHideTimer) {
    clearTimeout(historyHideTimer)
    historyHideTimer = null
  }
}

const startHideHistoryPanel = () => {
  historyHideTimer = setTimeout(() => {
    showHistoryPanel.value = false
  }, 300)
}

const handleCategoryMouseEnter = () => {
  isHovering.value = true
  if (categoryHideTimer) {
    clearTimeout(categoryHideTimer)
    categoryHideTimer = null
  }
  if (categories.value.length === 0) {
    loadCategories()
  }
  showCategoryDropdown.value = true
}

const handleCategoryMouseLeave = () => {
  isHovering.value = false
  startHideCategoryDropdown()
}

const startHideCategoryDropdown = () => {
  categoryHideTimer = setTimeout(() => {
    showCategoryDropdown.value = false
  }, 200)
}

const loadCategories = async () => {
  const cached = sessionStorage.getItem('categories')
  if (cached) {
    categories.value = JSON.parse(cached)
    return
  }
  loadingCategories.value = true
  try {
    const res = await getCategoryList()
    categories.value = res || []
    sessionStorage.setItem('categories', JSON.stringify(categories.value))
  } catch (e) {
    console.error('获取分类列表失败:', e)
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

const getCategoryIcon = (name) => {
  const category = categories.value.find(c => c.name === name)
  if (category?.svg) {
    return category.svg
  }
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
}

const emitEditProfile = () => {
  window.dispatchEvent(new CustomEvent('open-edit-profile'))
}

const handleLogout = async () => {
  try {
    await clientLogout()
  } catch (e) {
    console.error('登出接口调用失败:', e)
  }
  if (userShowTimer) {
    clearTimeout(userShowTimer)
    userShowTimer = null
  }
  if (userHideTimer) {
    clearTimeout(userHideTimer)
    userHideTimer = null
  }
  if (favHideTimer) {
    clearTimeout(favHideTimer)
    favHideTimer = null
  }
  if (categoryHideTimer) {
    clearTimeout(categoryHideTimer)
    categoryHideTimer = null
  }
  authStore.logout()
  showUserMenu.value = false
  showFavoritePanel.value = false
  showHistoryPanel.value = false
  showCategoryDropdown.value = false
  isHovering.value = false
  isFavoriteHovering.value = false
  isHistoryHovering.value = false
  router.push('/')
}

const loadUser = async () => {
  await authStore.init()
}

const handleScroll = () => {
  headerOpaque.value = window.scrollY > 50
}

onMounted(() => {
  loadUser()
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  if (userShowTimer) clearTimeout(userShowTimer)
  if (userHideTimer) clearTimeout(userHideTimer)
  if (favHideTimer) clearTimeout(favHideTimer)
  if (historyHideTimer) clearTimeout(historyHideTimer)
  if (categoryHideTimer) clearTimeout(categoryHideTimer)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.bili-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1002;
  overflow: visible;
}

.bili-header__bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 2560px;
  width: 100%;
  height: 64px;
  padding: 0 24px;
  overflow: visible;
  background: transparent;
  transition: background-color 0.3s ease;
}

.bili-header__bar.is-opaque {
  background: var(--bg1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* ===== 左侧入口 ===== */
.left-entry {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-right: 12px;
}

.entry-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 12px;
  text-decoration: none;
  color: var(--text1);
  font-size: 15px;
  font-weight: 500;
}

.zhuzhan-icon {
  flex-shrink: 0;
}

.default-entry {
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  height: 64px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s;
}

.default-entry:hover {
  color: var(--brand_pink);
  animation: jump 0.3s;
}

.category-dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.category-arrow {
  margin-left: 4px;
  transition: transform 0.2s;
}

.category-dropdown:hover .category-arrow {
  transform: rotate(180deg);
}

.category-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 160px;
  background: var(--bg1);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--line_light);
  padding: 8px 0;
  z-index: 1003;
}

.category-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid var(--line_regular);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.category-list {
  display: flex;
  flex-direction: column;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--text2);
  text-decoration: none;
  transition: all 0.15s;
}

.category-item:hover {
  background: var(--bg2);
  color: var(--brand_pink);
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--text3);
}

.category-item:hover .category-icon {
  color: var(--brand_pink);
}

.category-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes jump {
  0% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0); }
}

.download-entry {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
  height: 64px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text2);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s;
}

.download-entry:hover {
  color: var(--brand_pink);
}

/* ===== 搜索栏 ===== */
.center-search-container {
  flex: 1 auto;
  max-width: 420px;
}

.center-search-container.is-search-page {
  visibility: hidden;
}

.center-search__bar {
  display: flex;
  align-items: center;
  height: 38px;
  border-radius: 8px;
  border: 1px solid var(--line_regular);
  background: var(--bg2);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.center-search__bar:focus-within {
  border-color: var(--brand_pink);
  box-shadow: 0 0 0 2px rgba(255, 102, 153, 0.15);
}

.nav-search-input {
  flex: 1;
  height: 100%;
  padding: 0 14px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text1);
  line-height: 38px;
}

.nav-search-input::placeholder {
  color: var(--text4);
}

.nav-search-btn {
  width: 48px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text3);
  cursor: pointer;
  transition: color 0.2s;
  flex-shrink: 0;
}

.nav-search-btn:hover {
  color: var(--brand_pink);
}

/* ===== 右侧用户区 ===== */
.mini-header-right {
  display: flex;
  align-items: center;
  margin-left: 16px;
  flex-shrink: 0;
}

.header-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 4px;
  min-width: 50px;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  position: relative;
}

.favorite-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 50px;
}

.history-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 50px;
}

/* 收藏悬浮面板过渡动画 */
.fav-panel-enter-active,
.fav-panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fav-panel-enter-from,
.fav-panel-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

.header-action:hover .header-action-icon {
  animation: jump 0.3s;
  color: var(--brand_pink);
}

.header-action-icon {
  margin-bottom: 2px;
  color: var(--text1);
  transition: color 0.2s;
}

.header-action-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--text1);
  word-break: keep-all;
  line-height: 1.25;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
  width: 90px;
  height: 34px;
  border-radius: 8px;
  background: var(--brand_pink);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: var(--brand_pink_hover);
}

.upload-btn .upload-icon {
  margin-right: 5px;
  color: #fff;
}

.upload-btn .upload-text {
  color: #fff;
}

.login-btn {
  padding: 0 16px;
  height: 32px;
  line-height: 32px;
  font-size: 13px;
  color: var(--brand_pink);
  border: 1px solid var(--brand_pink);
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s;
}

.login-btn:hover {
  background: var(--brand_pink_thin);
}

.register-btn {
  padding: 0 16px;
  height: 32px;
  line-height: 32px;
  font-size: 13px;
  color: white;
  background: var(--brand_pink);
  border: 1px solid var(--brand_pink);
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s;
}

.register-btn:hover {
  background: var(--brand_pink_hover);
  border-color: var(--brand_pink_hover);
}

/* ===== 下拉框过渡动画 ===== */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ===== 用户下拉菜单 ===== */
.user-menu {
  position: relative;
  margin-left: 12px;
  z-index: 1004;
}

.avatar-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  overflow: visible;
  border: 2px solid var(--line_regular);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center top;
  position: relative;
  z-index: 1005;
}

.avatar-wrapper:hover,
.user-menu:hover .avatar-wrapper {
  border-color: var(--brand_pink);
  transform: scale(1.4) translateY(7px);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-default {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg2);
  color: var(--text3);
  border-radius: 50%;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 7px);
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  background: var(--bg1);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.14);
  border: 1px solid var(--line_light);
  overflow: hidden;
  z-index: 1003;
}

.dropdown-arrow {
  position: absolute;
  top: -6px;
  left: 50%;
  margin-left: -6px;
  width: 12px;
  height: 12px;
  background: var(--bg1);
  border: 1px solid var(--line_light);
  border-bottom: none;
  border-right: none;
  transform: rotate(45deg);
  z-index: 1;
}

.dropdown-user-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px 16px;
  border-bottom: 1px solid var(--line_light);
}

.dropdown-nickname {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
  text-align: center;
}

.vip-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 100%);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: #FB7299;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-num {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
}

.stat-label {
  font-size: 12px;
  color: var(--text3);
}

.dropdown-menu {
  padding: 6px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--text2);
  text-decoration: none;
  transition: all 0.15s;
  margin: 2px 8px;
  border-radius: 8px;
}

.dropdown-item:hover {
  background: var(--bg2);
  color: var(--text1);
}

.dropdown-item span {
  flex: 1;
}

.item-arrow {
  color: var(--text4);
  flex-shrink: 0;
}

.dropdown-footer {
  padding: 6px 0;
  border-top: 1px solid var(--line_light);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: calc(100% - 16px);
  margin: 2px 8px;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--text2);
  background: none;
  border: none;
  text-align: left;
  transition: all 0.15s;
  border-radius: 8px;
}

.logout-btn:hover {
  background: var(--bg2);
  color: var(--brand_pink);
}

/* ===== 顶部 banner 装饰 ===== */
.header-banner-bg {
  position: relative;
  display: flex;
  justify-content: center;
  min-height: 155px;
  height: 9.375vw;
  max-height: 240px;
  background: linear-gradient(135deg, #ff6699 0%, #ff9966 50%, #ffcc66 100%);
  overflow: hidden;
}

.banner-bg-img {
  position: absolute;
  width: 100%;
  height: 100%;
  background: url('/banner.avif') center/cover no-repeat;
  filter: brightness(0.95);
  transition: filter 0.3s;
}

.taper-line {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100px;
  background: linear-gradient(rgba(0, 0, 0, 0.5), transparent);
  pointer-events: none;
}

/* ===== 个人中心页 banner 用户信息 ===== */
.banner-profile-info {
  position: absolute;
  bottom: 20px;
  left: 75px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 2;
}

.banner-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.9);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-avatar span {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.banner-user-detail {
  flex: 1;
  text-align: left;
  width: 1055px;
}

.banner-nickname {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  margin-bottom: 2px;
}

.banner-signature {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 6px;
  margin: -2px -6px;
  transition: background 0.2s;
}

.banner-signature:hover {
  background: rgba(255, 255, 255, 0.15);
}

.banner-follow-action {
  padding-top: 4px;
}

.banner-follow-action .follow-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 180px;
  height: 36px;
  background: var(--brand_pink);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.banner-follow-action .follow-btn:hover {
  background: var(--brand_pink_hover);
}

.banner-follow-action .follow-btn.followed {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.banner-follow-action .follow-btn.followed:hover {
  background: rgba(255, 255, 255, 0.3);
}

.banner-signature-input {
  font-size: 13px;
  color: #333;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  padding: 2px 12px;
  outline: none;
  min-width: 100px;
  max-width: 700px;
  height: 30px;
  text-shadow: none;
}

.banner-signature-edit {
  position: relative;
  display: inline-block;
}

.banner-signature-measure {
  position: absolute;
  visibility: hidden;
  white-space: pre;
  font-size: 13px;
  padding: 2px 12px;
  pointer-events: none;
}

@media (max-width: 1200px) {
  .left-entry .download-entry,
  .left-entry .default-entry:nth-child(n+5) {
    display: none;
  }
}

@media (max-width: 768px) {
  .left-entry .default-entry {
    display: none;
  }

  .center-search-container {
    max-width: none;
    margin: 0 12px;
  }

  .register-btn {
    display: none;
  }
}
</style>
