<template>
  <div class="search-page">
    <div class="search-container">
      <div class="search-header">
        <div class="search-box">
          <input
            v-model="keyword"
            type="text"
            class="search-input"
            placeholder="搜索视频、UP主..."
            @keydown.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="filter-section">
        <div class="type-tabs">
          <button
            :class="['type-tab', { active: searchType === 'video' }]"
            @click="switchType('video')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            视频
          </button>
          <button
            :class="['type-tab', { active: searchType === 'up' }]"
            @click="switchType('up')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            用户
          </button>
        </div>

        <div class="sort-bar">
          <button
            v-for="opt in currentSortOptions"
            :key="opt.value"
            :class="['sort-item', { active: sortType === opt.value }]"
            @click="changeSort(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>搜索中...</span>
      </div>

      <div v-else-if="searchType === 'video' && videoResults.length > 0" class="video-results">
        <div class="result-info">
          <span class="result-count">找到 {{ total }} 个视频</span>
        </div>
        <div class="video-grid">
          <div
            v-for="video in videoResults"
            :key="video.videoUid"
            class="bili-video-card"
            @click="goToVideo(video)"
          >
            <div class="bili-video-card__wrap">
              <div class="bili-video-card__image">
                <img
                  :src="video.coverUrl || video.videoCover"
                  :alt="video.title"
                  class="bili-video-card__cover"
                  loading="lazy"
                />
                <div class="bili-video-card__mask">
                  <div class="bili-video-card__stats">
                    <div class="bili-video-card__stats--left">
                      <span class="bili-video-card__stats--item">
                        <IconVideo :size="14" color="#fff" />
                        {{ formatCount(video.playCount) }}
                      </span>
                      <span class="bili-video-card__stats--item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {{ formatCount(video.favoriteCount) }}
                      </span>
                    </div>
                    <span class="bili-video-card__stats__duration">{{ formatDuration(video.duration) }}</span>
                  </div>
                </div>
              </div>
              <div class="bili-video-card__info">
                <a class="bili-video-card__info--tit">{{ video.title }}</a>
                <div class="bili-video-card__info--bottom">
                  <span class="bili-video-card__info--owner">
                    <svg width="16" height="16" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="none" class="owner-icon">
                      <path d="M800 128H224C134.4 128 64 198.4 64 288v448c0 89.6 70.4 160 160 160h576c89.6 0 160-70.4 160-160V288c0-89.6-70.4-160-160-160z m96 608c0 54.4-41.6 96-96 96H224c-54.4 0-96-41.6-96-96V288c0-54.4 41.6-96 96-96h576c54.4 0 96 41.6 96 96v448z" fill="currentColor"/>
                      <path d="M419.2 544c0 51.2-3.2 108.8-83.2 108.8S252.8 595.2 252.8 544v-217.6H192v243.2c0 96 51.2 140.8 140.8 140.8 89.6 0 147.2-48 147.2-144v-240h-60.8V544zM710.4 326.4h-156.8V704h60.8v-147.2h96c102.4 0 121.6-67.2 121.6-115.2 0-44.8-19.2-115.2-121.6-115.2z m-3.2 179.2h-92.8V384h92.8c32 0 60.8 12.8 60.8 60.8 0 44.8-32 60.8-60.8 60.8z" fill="currentColor"/>
                    </svg>
                    <span class="bili-video-card__info--author">{{ video.nickName }}</span>
                  </span>
                  <span class="bili-video-card__info--date">{{ formatDate(video.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="searchType === 'up' && upResults.length > 0" class="up-results">
        <div class="result-info">
          <span class="result-count">找到 {{ total }} 位UP主</span>
        </div>
        <div class="up-grid">
          <div
            v-for="up in upResults"
            :key="up.uid"
            class="bili-user-card"
          >
            <div class="bili-user-card__avatar" @click="goToProfile(up)">
              <img :src="up.avatar" :alt="up.nikeName" />
              <span v-if="up.isVip" class="bili-user-card__vip">
                <svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path d="M512 512m-416 0a416 416 0 1 0 832 0 416 416 0 1 0-832 0Z" fill="#FB7199"/>
                  <path d="M430.464 287.808c1.568-8.864 7.84-13.792 18.848-14.816 16.48-1.536 36.224-3.264 55.712 11.168 19.52 14.4 49.44 46.592 48.32 63.296-0.768 11.104-4.256 29.984-10.528 56.64 60.544-28.8 91.584-44.032 93.184-45.664 2.4-2.464 25.728 2.976 34.4 5.696 8.704 2.688 26.112-4.832 31.808-4.16 5.728 0.704 18.24 21.952 17.792 29.056-0.48 7.04 0 19.456-1.792 26.88-1.824 7.392 0.8 24.032 0 33.824-0.8 9.824-6.912 12.8-10.272 11.072-3.36-1.792-7.84 4.608-10.368 8.8-2.528 4.16-24.608-5.6-31.904-6.304-7.296-0.672-33.792-2.56-52.768 0-12.64 1.728-36.256 7.104-70.816 16.16-16.064 6.496-25.504 11.104-28.32 13.856-4.224 4.16-52.032 127.232-56.48 137.6-4.48 10.304-39.104 78.56-44.864 82.24-5.76 3.648-40.32 20.96-65.76 22.336-25.472 1.376-41.216 0.864-59.232-12.64-18.016-13.536-24.64-23.616 4.672-35.776 29.344-12.16 63.808-57.248 80.384-81.728 16.544-24.512 60.288-89.6 60.288-94.144 0-4.576 1.984-4.576-13.92-2.24-15.904 2.24-41.696 6.144-59.488 9.376-17.792 3.2-41.248 10.56-49.312 6.048-8.096-4.544-27.84-44.576-25.728-59.616 2.08-15.04-7.328-33.44 2.08-31.936 9.376 1.504 19.776 8.32 44.224 11.008 24.48 2.72 114.88-18.368 118.688-18.976 3.776-0.608 2.848-14.4 2.848-22.368 0-7.936-1.28-72.768-10.336-85.984a67.68 67.68 0 0 1-11.36-28.704zM512 559.36l8.128-1.152-5.92-14.208 44.8 19.776v-10.496c29.28 4.608 48.096 8.8 56.448 12.48 12.48 5.6 120.032 84.672 131.776 99.744 11.776 15.104 0 53.6-16.48 75.776-16.48 22.176-30.016 6.016-42.464-13.12-8.256-12.736-67.04-68.992-176.288-168.8z" fill="#FFFFFF"/>
                </svg>
              </span>
            </div>
            <div class="bili-user-card__info">
              <div class="bili-user-card__name" @click="goToProfile(up)">
                <span class="bili-user-card__name-text">{{ up.nikeName || '未知用户' }}</span>
              </div>
              <span class="bili-user-card__fans">{{ formatCount(up.fansCount) }}粉丝</span>
              <button v-if="!up.isFollowed" class="bili-user-card__follow" @click.stop="handleFollow(up)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                关注
              </button>
              <button 
                v-else 
                class="bili-user-card__follow bili-user-card__follow--followed" 
                :class="{ 'bili-user-card__follow--unfollow': hoveredUpUid === up.uid }"
                @click.stop="handleUnfollow(up)"
                @mouseenter="hoveredUpUid = up.uid"
                @mouseleave="hoveredUpUid = null"
              >
                <svg v-if="hoveredUpUid === up.uid" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ hoveredUpUid === up.uid ? '取消关注' : '已关注' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.15">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p v-if="keyword" class="empty-title">未找到 "{{ keyword }}" 相关结果</p>
        <p v-else class="empty-title">输入关键词开始搜索</p>
        <span class="empty-hint">试试其他关键词或切换搜索类型</span>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage <= 1"
          @click="changePage(currentPage - 1)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="['page-num', { active: page === currentPage }]"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </div>
        <button
          class="page-btn"
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchContent, followUser as followUserApi, unfollowUser as unfollowUserApi } from '../api/video'
import { IconVideo } from '../icons'

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const searchType = ref('video')
const sortType = ref('latest')
const currentPage = ref(1)
const total = ref(0)
const pageSize = 20

const videoResults = ref([])
const upResults = ref([])
const loading = ref(false)
const hoveredUpUid = ref(null)

const sortOptions = {
  video: [
    { label: '综合排序', value: 'latest' },
    { label: '最多播放', value: 'hot' },
    { label: '最多收藏', value: 'favorite' }
  ],
  up: [
    { label: '粉丝最多', value: 'fans' },
    { label: '获赞最多', value: 'like' },
    { label: '播放最多', value: 'play' }
  ]
}

const currentSortOptions = computed(() => sortOptions[searchType.value])

const totalPages = computed(() => Math.ceil(total.value / pageSize))

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 7
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const handleSearch = () => {
  currentPage.value = 1
  doSearch()
}

const switchType = (type) => {
  searchType.value = type
  sortType.value = sortOptions[type][0].value
  currentPage.value = 1
  doSearch()
}

const changeSort = (sort) => {
  sortType.value = sort
  currentPage.value = 1
  doSearch()
}

const changePage = (page) => {
  currentPage.value = page
  doSearch()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const doSearch = async () => {
  loading.value = true
  try {
    const res = await searchContent({
      type: searchType.value,
      keyword: keyword.value || undefined,
      page: currentPage.value,
      size: pageSize,
      sortType: sortType.value
    })
    if (searchType.value === 'video') {
      videoResults.value = res?.records || []
    } else {
      upResults.value = res?.records || []
    }
    total.value = res?.total || 0
  } catch (e) {
    console.error('搜索失败:', e)
    videoResults.value = []
    upResults.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const goToVideo = (video) => {
  let path = ''
  if (video.playLink) {
    path = video.playLink
    try {
      const url = new URL(path)
      path = url.pathname
    } catch {}
    if (path.startsWith('/api')) {
      path = path.slice(4)
    }
  } else if (video.videoUid && video.episodeUid) {
    path = `/client/video/${video.videoUid}/episode/${video.episodeUid}`
  } else if (video.id) {
    path = `/client/video/${video.id}/episode/${video.currentEpisode?.id || video.id}`
  }
  if (path) {
    window.open(path, '_blank')
  }
}

const goToProfile = (up) => {
  if (up.uid) {
    window.open(`/up/${up.uid}`, '_blank')
  }
}

const handleFollow = async (up) => {
  try {
    await followUserApi(up.uid)
    up.isFollowed = true
    up.fansCount++
  } catch (e) {
    console.error('关注失败:', e)
  }
}

const handleUnfollow = async (up) => {
  try {
    await unfollowUserApi(up.uid)
    up.isFollowed = false
    up.fansCount--
  } catch (e) {
    console.error('取消关注失败:', e)
  }
}

const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.floor((today - target) / (1000 * 60 * 60 * 24))

  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff < 7) return `${diff}天前`

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  if (year === now.getFullYear()) {
    return `${month}-${day}`
  }
  return `${year}-${month}-${day}`
}

const formatCount = (count) => {
  if (!count) return '0'
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

onMounted(() => {
  if (route.query.q) {
    keyword.value = route.query.q
  }
  if (route.query.type) {
    searchType.value = route.query.type
    sortType.value = sortOptions[route.query.type][0].value
  }
  doSearch()
})

watch(() => route.query.q, (val) => {
  if (val !== keyword.value) {
    keyword.value = val || ''
    doSearch()
  }
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: var(--bg1);
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px 60px;
}

.search-header {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.search-box {
  display: flex;
  width: 100%;
  max-width: 680px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid var(--brand_pink);
  border-right: none;
  background: var(--bg1);
  color: var(--text1);
  font-size: 15px;
  outline: none;
}

.search-input::placeholder {
  color: var(--text4);
}

.search-btn {
  padding: 12px 24px;
  border: 2px solid var(--brand_pink);
  background: var(--brand_pink);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover {
  background: #ff5a8a;
  border-color: #ff5a8a;
}

.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line_light);
}

.type-tabs {
  display: flex;
  gap: 4px;
}

.type-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text3);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-tab:hover {
  color: var(--text1);
  background: var(--bg2);
}

.type-tab.active {
  color: var(--brand_pink);
  background: rgba(255, 92, 122, 0.1);
  font-weight: 500;
}

.sort-bar {
  display: flex;
  gap: 4px;
}

.sort-item {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text3);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-item:hover {
  color: var(--text1);
}

.sort-item.active {
  color: var(--brand_pink);
  background: rgba(255, 92, 122, 0.08);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 100px;
  color: var(--text3);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--line_regular);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.result-info {
  margin-bottom: 16px;
}

.result-count {
  font-size: 13px;
  color: var(--text4);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.bili-video-card {
  display: flex;
  flex-direction: column;
}

.bili-video-card__wrap {
  display: block;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.bili-video-card__wrap:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.bili-video-card__image {
  position: relative;
  padding-top: 56.25%;
  background: var(--bg3);
}

.bili-video-card__cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.bili-video-card__wrap:hover .bili-video-card__cover {
  transform: scale(1.06);
}

.bili-video-card__mask {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  height: 42px;
  padding: 18px 10px 8px;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.85));
}

.bili-video-card__stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bili-video-card__stats--left {
  display: flex;
  gap: 14px;
}

.bili-video-card__stats--item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.bili-video-card__stats__duration {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 4px;
}

.bili-video-card__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 0 0;
}

.bili-video-card__info--tit {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
}

.bili-video-card__info--tit:hover {
  color: var(--brand_pink);
}

.bili-video-card__info--bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bili-video-card__info--owner {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text3);
  text-decoration: none;
  transition: color 0.2s;
}

.bili-video-card__info--owner:hover {
  color: var(--brand_pink);
}

.bili-video-card__info--owner .owner-icon {
  width: 16px;
  height: 16px;
  color: var(--text4);
}

.bili-video-card__info--author {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

.bili-video-card__info--date {
  font-size: 13px;
  color: var(--text4);
  flex-shrink: 0;
}

.up-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.bili-user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  height: 110px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bili-user-card:hover {
}

.bili-user-card__avatar {
  position: relative;
  width: 86px;
  height: 86px;
  flex-shrink: 0;
  cursor: pointer;
}

.bili-user-card__avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.bili-user-card__vip {
  position: absolute;
  bottom: -6px;
  right: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.bili-user-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bili-user-card__name {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.bili-user-card__name:hover .bili-user-card__name-text {
  color: var(--brand_pink);
}

.bili-user-card__name-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bili-user-card__fans {
  font-size: 13px;
  color: var(--text3);
}

.bili-user-card__follow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100px;
  height: 32px;
  background: var(--brand_pink);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.bili-user-card__follow:not(.bili-user-card__follow--followed):hover {
  background: var(--brand_pink_hover);
}

.bili-user-card__follow--followed {
  background: var(--bg3);
  color: var(--text3);
}

.bili-user-card__follow--followed:hover {
  background: var(--graph_bg_thick);
}

.bili-user-card__follow--unfollow {
  background: var(--bg3);
  color: var(--brand_pink);
  border-color: var(--brand_pink);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 40px;
  gap: 12px;
}

.empty-title {
  font-size: 18px;
  color: var(--text2);
  margin: 0;
}

.empty-hint {
  font-size: 14px;
  color: var(--text4);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 40px;
}

.page-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  background: var(--bg1);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--brand_pink);
  color: var(--brand_pink);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 6px;
}

.page-num {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  background: var(--bg1);
  color: var(--text2);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-num:hover {
  border-color: var(--brand_pink);
  color: var(--brand_pink);
}

.page-num.active {
  background: var(--brand_pink);
  border-color: var(--brand_pink);
  color: #fff;
}

@media (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .video-grid {
    grid-template-columns: 1fr;
  }

  .up-grid {
    grid-template-columns: 1fr;
  }

  .search-box {
    max-width: 100%;
  }

  .type-tabs,
  .sort-bar {
    flex-wrap: wrap;
  }
}
</style>
