<template>
  <div class="category-page">
    <div class="channel-bar">
      <div class="channel-chips">
        <router-link 
          v-for="cat in categories.slice(0, 28)" 
          :key="cat.id" 
          :to="`/category/${cat.id}`" 
          class="channel-link"
          :class="{ active: currentCategoryId == cat.id }"
        >
          {{ cat.name }}
        </router-link>
        <div class="channel-more-dropdown" v-if="categories.length > 28">
          <button class="more-btn" @click.stop="showMoreCategories = !showMoreCategories">
            更多
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div v-if="showMoreCategories" class="more-dropdown-panel">
            <router-link 
              v-for="cat in categories.slice(28)" 
              :key="cat.id" 
              :to="`/category/${cat.id}`" 
              class="more-dropdown-item" 
              @click="showMoreCategories = false"
              :class="{ active: currentCategoryId == cat.id }"
            >
              {{ cat.name }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="category-header">
        <h1 class="category-title">
          <span v-if="currentCategorySvg" class="category-icon" v-html="currentCategorySvg"></span>
          {{ currentCategoryName || '全部分类' }}
        </h1>
      </div>

      <div class="video-content">
        <Transition name="fade-slide" mode="out-in">
          <div :key="currentCategoryId" class="video-grid" v-if="videos.length > 0">
            <div 
              v-for="(video, index) in videos" 
              :key="video.id" 
              class="video-card"
              :style="{ animationDelay: `${index * 0.05}s` }"
              @click="handleVideoClick(video)"
            >
              <a class="video-card__wrap">
                <div class="video-card__image">
                  <img :src="fileUrl(video.coverUrl)" :alt="video.title" loading="lazy" class="video-card__cover" />
                  <span v-if="video.needVip" class="vip-corner-badge">大会员</span>
                  <div class="video-card__mask">
                    <div class="video-card__stats">
                      <div class="video-card__stats--left">
                        <span class="video-card__stats--item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                          <span>{{ formatCount(video.playCount) }}</span>
                        </span>
                        <span class="video-card__stats--item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                          <span>{{ formatCount(video.danmakuCount || 0) }}</span>
                        </span>
                      </div>
                      <span class="video-card__stats__duration">{{ formatDuration(video.totalDuration) }}</span>
                    </div>
                  </div>
                </div>
                <div class="video-card__info">
                  <a class="video-card__info--tit">{{ video.title }}</a>
                  <div class="video-card__info--bottom">
                    <a class="video-card__info--owner">
                      <IconUp :size="14" color="var(--text4)" />
                      <span class="video-card__info--author">{{ video.nickName }}</span>
                    </a>
                    <span class="video-card__info--date">{{ formatDate(video.createTime) }}</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </Transition>
        <Transition name="fade" mode="out-in">
          <div v-if="videos.length === 0 && !loading" :key="'empty'" class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <line x1="2" y1="7" x2="7" y2="7"/>
              <line x1="2" y1="17" x2="7" y2="17"/>
              <line x1="17" y1="7" x2="22" y2="7"/>
              <line x1="17" y1="17" x2="22" y2="17"/>
            </svg>
            <p>该分类暂无视频</p>
            <span class="empty-hint">去看看其他分类吧</span>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategoryList } from '../api/category'
import { getClientVideoList } from '../api/video'
import { formatDuration, formatCount } from '../utils/fileUpload'
import { fileUrl } from '../config'
import IconUp from '../icons/IconUp.vue'
import { handleVideoClick } from '../utils/video'

const route = useRoute()
const router = useRouter()

const videos = ref([])
const categories = ref([])
const showMoreCategories = ref(false)

const currentCategoryId = computed(() => route.params.id || null)

const currentCategoryName = computed(() => {
  if (!currentCategoryId.value) return ''
  const cat = categories.value.find(c => c.id == currentCategoryId.value)
  return cat?.name || ''
})

const currentCategorySvg = computed(() => {
  if (!currentCategoryId.value) return ''
  const cat = categories.value.find(c => c.id == currentCategoryId.value)
  return cat?.svg || ''
})

const loadCategories = async () => {
  const cached = sessionStorage.getItem('categories')
  if (cached) {
    categories.value = JSON.parse(cached)
    return
  }
  try {
    const res = await getCategoryList()
    categories.value = (res || []).filter(c => c.id !== 1)
    sessionStorage.setItem('categories', JSON.stringify(categories.value))
  } catch (e) {
    console.error('获取分类失败:', e)
  }
}

const loadVideos = async () => {
  try {
    const params = {
      page: 1,
      size: 40,
      categoryId: currentCategoryId.value || undefined
    }
    const res = await getClientVideoList(params)
    videos.value = res?.records || []
  } catch (e) {
    console.error('获取视频失败:', e)
    videos.value = []
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${d.getMonth() + 1}-${d.getDate()}`
}

const handleClickOutside = (e) => {
  if (!e.target.closest('.channel-more-dropdown')) {
    showMoreCategories.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadVideos()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => route.params.id, () => {
  loadVideos()
})
</script>

<style scoped>
.category-page {
  padding-top: 0px;
  min-height: calc(100vh - 60px);
  background: var(--bg1);
}

.channel-bar {
  position: relative;
  z-index: 10;
  max-width: 2078px;
  margin: 0 auto;
  padding: 0 var(--layout-padding);
  background: var(--bg1);
  border-bottom: 1px solid var(--line_light);
}

.channel-chips {
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  grid-auto-flow: column;
  grid-gap: 8px;
  padding: 12px 0;
}

.channel-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 30px;
  padding: 0 14px;
  border: none;
  border-radius: 15px;
  background: var(--graph_bg_thin);
  color: var(--text2);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.channel-link:hover {
  background: var(--brand_pink);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 102, 153, 0.3);
}

.channel-link.active {
  background: var(--brand_pink);
  color: #fff;
}

.channel-more-dropdown {
  position: relative;
  display: flex;
  align-items: center;
}

.more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 100%;
  min-height: 30px;
  padding: 0 14px;
  border: none;
  border-radius: 15px;
  background: var(--graph_bg_thin);
  color: var(--text2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.more-btn:hover {
  background: var(--brand_pink);
  color: #fff;
}

.more-dropdown-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 100;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
  min-width: 320px;
  max-width: 500px;
  background: var(--bg1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--line_light);
}

.more-dropdown-item {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  color: var(--text2);
  font-size: 13px;
  text-decoration: none;
  transition: all 0.2s;
}

.more-dropdown-item:hover {
  background: var(--brand_pink);
  color: #fff;
}

.more-dropdown-item.active {
  background: var(--brand_pink);
  color: #fff;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.category-header {
  padding: 0 0 20px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text1);
  margin: 15px 0px 0px 0px;
}

.category-icon {
  display: flex;
  align-items: center;
}

.category-icon :deep(svg) {
  width: 40px;
  height: 40px;
}

.video-content {
  padding: 0 0 40px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.video-card {
  display: flex;
  flex-direction: column;
  animation: cardFadeIn 0.4s ease-out both;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 分类切换过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 空状态过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
  padding-top: 62.5%;
  background: var(--bg3);
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
}

.vip-corner-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 3;
  padding: 2px 7px;
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff8cb0 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  pointer-events: none;
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
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 4px;
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
  gap: 4px;
}

.video-card__info--owner {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: var(--text3);
  transition: color 0.2s;
  flex: 1;
  min-width: 0;
}

.video-card__info--owner:hover {
  color: var(--brand_pink);
}

.video-card__info--author {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-card__info--date {
  font-size: 13px;
  color: var(--text3);
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px;
  gap: 16px;
  color: var(--text3);
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.empty-hint {
  font-size: 13px;
  color: var(--text4);
}

@media (max-width: 1400px) {
  .video-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1100px) {
  .channel-bar { padding: 0 56px; }
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .channel-bar { padding: 0 16px; }
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
