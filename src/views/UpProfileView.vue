<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- UP主信息区域 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-else-if="upInfo" class="up-profile-content">
        <!-- 标签页导航 -->
        <div class="profile-tabs">
          <div class="tab-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            首页
          </div>
          <!-- <div class="tab-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
            投稿
          </div> -->
          <div class="tabs-spacer"></div>
          <div class="tabs-stats">
            <div class="tabs-stat-item">
              <span class="tabs-stat-num">{{ formatCount(upInfo.followCount || 0) }}</span>
              <span class="tabs-stat-label">关注</span>
            </div>
            <div class="tabs-stat-item">
              <span class="tabs-stat-num">{{ formatCount(upInfo.fansCount || 0) }}</span>
              <span class="tabs-stat-label">粉丝</span>
            </div>
            <div class="tabs-stat-item">
              <span class="tabs-stat-num">{{ formatCount(upInfo.totalLikeCount || 0) }}</span>
              <span class="tabs-stat-label">获赞</span>
            </div>
            <div class="tabs-stat-item">
              <span class="tabs-stat-num">{{ formatCount(upInfo.totalPlayCount || 0) }}</span>
              <span class="tabs-stat-label">播放</span>
            </div>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="profile-body">
          <div class="profile-content">
            <!-- 投稿视频列表 -->
            <div class="home-section">
              <h3 class="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <line x1="7" y1="2" x2="7" y2="22"/>
                  <line x1="17" y1="2" x2="17" y2="22"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                </svg>
                TA的投稿
              </h3>
              <div v-if="loadingVideos" class="loading-state">
                <div class="loading-spinner"></div>
              </div>
              <div v-else-if="videos.length > 0" class="video-grid">
                <div 
                  v-for="video in videos" 
                  :key="video.id || video.videoUid" 
                  class="video-card"
                  @click="goToVideo(video)"
                >
                  <div class="video-card__wrap">
                    <div class="video-card__image">
                      <img :src="video.coverUrl || video.videoCover" :alt="video.title" loading="lazy" class="video-card__cover" />
                    </div>
                    <div class="video-card__mask">
                      <div class="video-card__stats">
                        <div class="video-card__stats--left">
                          <span class="video-card__stats--item">
                            <IconVideo :size="14" color="#fff" />
                            {{ formatCount(video.playCount || 0) }}
                          </span>
                        </div>
                        <span class="video-card__stats__duration">{{ formatDuration(video.duration || video.totalDuration) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="video-card__info">
                    <div class="video-card__info--tit">{{ video.title }}</div>
                    <div class="video-card__info--bottom">
                      <span class="video-card__info--date">{{ formatDate(video.createTime) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="loadingMore && videos.length > 0" class="loading-more">
                <div class="loading-spinner"></div>
                <span>加载中...</span>
              </div>
              <div v-if="!hasMore && videos.length > 0" class="no-more">没有更多了</div>
              <div v-else class="empty-small">暂无投稿视频</div>
            </div>
          </div>

          <!-- 右侧信息卡 -->
          <div class="profile-sidebar">
            <div class="info-card">
              <div class="card-header">
                <h3 class="card-title">基本信息</h3>
              </div>
              <div class="card-list">
                <div class="card-item">
                  <span class="item-label">UID</span>
                  <span class="item-value">{{ upInfo.uid || '--' }}</span>
                </div>
                <div class="card-item">
                  <span class="item-label">性别</span>
                  <span class="item-value">{{ upInfo.sex === true ? '男' : upInfo.sex === false ? '女' : '保密' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>用户不存在</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getUserInfoByUid } from '../api/auth'
import { getUserVideos } from '../api/video'
import { IconVideo } from '../icons'

const route = useRoute()

const upInfo = ref(null)
const videos = ref([])
const loading = ref(true)
const loadingVideos = ref(false)

const page = ref(1)
const pageSize = 10
const hasMore = ref(true)
const loadingMore = ref(false)

const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count
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
  if (diff < 30) return `${Math.floor(diff / 7)}周前`
  if (diff < 365) return `${Math.floor(diff / 30)}个月前`
  return `${Math.floor(diff / 365)}年前`
}

const loadUpInfo = async () => {
  loading.value = true
  try {
    const uid = route.params.uid
    const res = await getUserInfoByUid(uid)
    upInfo.value = res
  } catch (e) {
    console.error('获取UP主信息失败:', e)
    upInfo.value = null
  } finally {
    loading.value = false
  }
}

const loadVideos = async (reset = false) => {
  if (loadingMore.value || (!hasMore.value && !reset)) return
  
  if (reset) {
    page.value = 1
    hasMore.value = true
    videos.value = []
  }
  
  loadingMore.value = true
  loadingVideos.value = page.value === 1
  try {
    const uid = route.params.uid
    const res = await getUserVideos({ userUid: uid, page: page.value, size: pageSize })
    const newVideos = res?.records || res || []
    
    if (reset) {
      videos.value = newVideos
    } else {
      videos.value = [...videos.value, ...newVideos]
    }
    
    if (newVideos.length < pageSize) {
      hasMore.value = false
    } else {
      page.value++
    }
  } catch (e) {
    console.error('获取投稿视频失败:', e)
    if (reset) videos.value = []
  } finally {
    loadingVideos.value = false
    loadingMore.value = false
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

const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
  const clientHeight = document.documentElement.clientHeight || window.innerHeight
  
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    loadVideos()
  }
}

const handleFollowChanged = (e) => {
  const { uid, isFollowed, fansCount } = e.detail
  if (upInfo.value && upInfo.value.uid === uid) {
    upInfo.value.isFollowed = isFollowed
    upInfo.value.fansCount = fansCount
  }
}

onMounted(() => {
  loadUpInfo()
  loadVideos()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('up-follow-changed', handleFollowChanged)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('up-follow-changed', handleFollowChanged)
})

watch(() => route.params.uid, () => {
  loadUpInfo()
  loadVideos(true)
})
</script>

<style scoped>
.profile-page {
  padding-top: 0;
  min-height: 100vh;
  background: var(--bg1);
}

.profile-container {
  margin: 0;
  padding: 0 75px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text3);
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--bg3);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--text4);
  gap: 16px;
}

.empty-small {
  padding: 40px;
  text-align: center;
  color: var(--text3);
  font-size: 14px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--text3);
  font-size: 14px;
  gap: 8px;
}

.no-more {
  padding: 20px;
  text-align: center;
  color: var(--text4);
  font-size: 13px;
}

/* 标签页导航 */
.profile-tabs {
  display: flex;
  gap: 0;
  padding: 0;
  margin-top: 0;
  border-bottom: 1px solid var(--line_light);
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 25px 20px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text2);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
}

.tab-item:hover {
  color: var(--text1);
}

.tab-item.active {
  color: var(--brand_pink);
  border-bottom-color: var(--brand_pink);
  font-weight: 600;
}

.tab-item svg {
  color: inherit;
}

.tabs-spacer {
  flex: 1;
}

.tabs-stats {
  display: flex;
  align-items: center;
  gap: 40px;
}

.tabs-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.tabs-stat-num {
  font-size: 15px;
  font-weight: 600;
  color: var(--text2);
  font-family: inherit;
  line-height: 1.2;
  transition: color 0.2s;
}

.tabs-stat-label {
  font-size: 15px;
  color: var(--text2);
  transition: color 0.2s;
}

/* 标签页内容 */
.profile-body {
  display: flex;
  gap: 24px;
}

.profile-content {
  flex: 1;
  padding: 20px 0 60px;
  min-width: 0;
}

.profile-sidebar {
  width: 280px;
  flex-shrink: 0;
  padding: 20px 0 60px;
}

.info-card {
  background: var(--bg2);
  border-radius: 8px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
  margin: 0;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-label {
  font-size: 13px;
  color: var(--text3);
}

.item-value {
  font-size: 13px;
  color: var(--text1);
  font-weight: 500;
}

.home-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text1);
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title svg {
  color: var(--brand_pink);
}

/* 视频卡片通用样式 */
.video-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.video-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.video-card:hover {
  transform: translateY(-4px);
}

.video-card__wrap {
  display: block;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.video-card__wrap:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.video-card__image {
  position: relative;
  padding-top: 56.25%;
  background: var(--graph_bg_regular);
}

.video-card__cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-card__wrap:hover .video-card__cover {
  transform: scale(1.06);
}

.video-card__mask {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  height: 42px;
  padding: 18px 10px 8px;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.85));
  border-radius: 0 0 8px 8px;
}

.video-card__stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-card__stats--left {
  display: flex;
  gap: 14px;
}

.video-card__stats--item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.video-card__stats__duration {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.video-card__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.video-card__info--tit {
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
}

.video-card__info--tit:hover {
  color: var(--brand_pink);
}

.video-card__info--bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text4);
}

.video-card__info--date {
  flex-shrink: 0;
}

@media (max-width: 1400px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .profile-container {
    padding: 0 40px;
  }
  
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 0 20px;
  }
  
  .profile-body {
    flex-direction: column;
  }
  
  .profile-sidebar {
    width: 100%;
  }
  
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>
