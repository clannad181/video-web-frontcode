<template>
  <div class="home-page">
    <div class="channel-bar">
      <div class="channel-chips">
        <router-link v-for="cat in categories.slice(0, 28)" :key="cat.id" :to="`/category/${cat.id}`" class="channel-link">{{ cat.name }}</router-link>
        <div class="channel-more-dropdown" v-if="categories.length > 28">
          <button class="more-btn" @click.stop="showMoreCategories = !showMoreCategories">
            更多
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div v-if="showMoreCategories" class="more-dropdown-panel">
            <router-link v-for="cat in categories.slice(28)" :key="cat.id" :to="`/category/${cat.id}`" class="more-dropdown-item" @click="showMoreCategories = false">{{ cat.name }}</router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="main-container">
      <!-- 个性推荐 -->
      <div class="feed-section">
        <div class="feed-card">
          <div class="bili-carousel-cell">
            <div class="carousel" @mouseenter="pauseAutoplay" @mouseleave="resumeAutoplay">
              <div class="carousel-slides" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
                <div v-for="(slide, idx) in bannerSlides" :key="idx" class="carousel-slide">
                  <a @click.prevent="handleVideoClick(slide)" class="carousel-item">
                    <div class="carousel-item__image">
                      <img :src="fileUrl(slide.coverUrl)" :alt="slide.title" loading="lazy" />
                      <span v-if="slide.needVip" class="vip-corner-badge">大会员</span>
                    </div>
                  </a>
                </div>
              </div>
              <div class="carousel-dots">
                <span v-for="(_, idx) in bannerSlides" :key="idx" class="carousel-dots__dot" :class="{ 'is-active': currentIndex === idx }" @click="currentIndex = idx"></span>
              </div>
              <div class="carousel-arrows">
                <button class="carousel-arrows__btn" @click="prev"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
                <button class="carousel-arrows__btn" @click="next"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
              </div>
              <div class="carousel-bottom">
                <a @click.prevent="handleVideoClick(bannerSlides[currentIndex])" class="carousel-bottom-title">{{ bannerSlides[currentIndex]?.title }}</a>
              </div>
            </div>
          </div>
          <div v-for="(v, index) in topVideos" :key="'t'+v.id" class="bili-video-card" :style="{ animationDelay: `${index * 0.05}s` }">
            <a @click.prevent="handleVideoClick(v)" class="bili-video-card__wrap">
              <div class="bili-video-card__image">
                <img :src="fileUrl(v.coverUrl)" :alt="v.title" loading="lazy" class="bili-video-card__cover" />
                <span v-if="v.needVip" class="vip-corner-badge">大会员</span>
              </div>
              <div class="bili-video-card__mask">
                <div class="bili-video-card__stats">
                  <div class="bili-video-card__stats--left">
                    <span class="bili-video-card__stats--item"><IconVideo :size="14" color="#fff" /><span>{{ formatCount(v.playCount) }}</span></span>
                    <span class="bili-video-card__stats--item"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg><span>{{ formatCount(v.favoriteCount) }}</span></span>
                  </div>
                  <span class="bili-video-card__stats__duration">{{ formatDuration(v.totalDuration) }}</span>
                </div>
              </div>
            </a>
            <div class="bili-video-card__info">
              <a @click.prevent="handleVideoClick(v)" class="bili-video-card__info--tit">{{ v.title }}</a>
              <div class="bili-video-card__info--bottom">
                <a class="bili-video-card__info--owner">
                  <span v-if="v.isFollowed" class="followed-badge">已关注</span>
                  <IconUp v-else :size="16" color="var(--text4)" />
                  <span class="bili-video-card__info--author">{{ v.nickName }}</span>
                </a>
                <span class="bili-video-card__info--date">{{ formatDate(v.createTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最新视频 -->
      <div class="feed-section">
        <div class="feed-card">
          <div v-for="(v, index) in videoList" :key="'r'+v.id" class="bili-video-card" :style="{ animationDelay: `${(index % 10) * 0.05}s` }">
            <a @click.prevent="handleVideoClick(v)" class="bili-video-card__wrap">
              <div class="bili-video-card__image">
                <img :src="fileUrl(v.coverUrl)" :alt="v.title" loading="lazy" class="bili-video-card__cover" />
                <span v-if="v.needVip" class="vip-corner-badge">大会员</span>
              </div>
              <div class="bili-video-card__mask">
                <div class="bili-video-card__stats">
                  <div class="bili-video-card__stats--left">
                    <span class="bili-video-card__stats--item"><IconVideo :size="14" color="#fff" /><span>{{ formatCount(v.playCount) }}</span></span>
                    <span class="bili-video-card__stats--item"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg><span>{{ formatCount(v.favoriteCount) }}</span></span>
                  </div>
                  <span class="bili-video-card__stats__duration">{{ formatDuration(v.totalDuration) }}</span>
                </div>
              </div>
            </a>
            <div class="bili-video-card__info">
              <a @click.prevent="handleVideoClick(v)" class="bili-video-card__info--tit">{{ v.title }}</a>
              <div class="bili-video-card__info--bottom">
                <a class="bili-video-card__info--owner">
                  <span v-if="v.isFollowed" class="followed-badge">已关注</span>
                  <IconUp v-else :size="16" color="var(--text4)" />
                  <span class="bili-video-card__info--author">{{ v.nickName }}</span>
                </a>
                <span class="bili-video-card__info--date">{{ formatDate(v.createTime) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div ref="loadMoreSentinel" class="load-more-sentinel">
          <div v-if="loading" class="loading-spinner">
            <div class="spinner"></div>
            <span>加载中...</span>
          </div>
          <div v-else-if="noMore && videoList.length > 0" class="no-more">没有更多了</div>
          <div v-else-if="!loading && videoList.length === 0" class="no-data">暂无视频</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { formatDuration, formatCount, formatDate } from '../utils/fileUpload'
import { getCategoryList } from '../api/category'
import { getClientVideoList, getRecommendVideos } from '../api/video'
import { useRouter } from 'vue-router'
import request from '../api/request'
import { fileUrl } from '../config'
import IconUp from '../icons/IconUp.vue'
import { IconVideo } from '../icons'
import { handleVideoClick } from '../utils/video'

const router = useRouter()

const PAGE_SIZE = 20

const categories = ref([])
const bannerSlides = ref([])
const topVideos = ref([])
const videoList = ref([])
const currentIndex = ref(0)
const showMoreCategories = ref(false)
const loading = ref(false)
const noMore = ref(false)
const loadMoreSentinel = ref(null)

let currentPage = 1
let autoplayTimer = null
let observer = null

const next = () => { if (bannerSlides.value.length > 0) currentIndex.value = (currentIndex.value + 1) % bannerSlides.value.length }
const prev = () => { if (bannerSlides.value.length > 0) currentIndex.value = (currentIndex.value - 1 + bannerSlides.value.length) % bannerSlides.value.length }
const startAutoplay = () => { autoplayTimer = setInterval(next, 4000) }
const pauseAutoplay = () => { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null } }
const resumeAutoplay = () => { if (!autoplayTimer) startAutoplay() }

const handleMoreClickOutside = (e) => {
  if (!e.target.closest('.channel-more-dropdown')) {
    showMoreCategories.value = false
  }
}

const fetchVideos = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  try {
    const res = await getClientVideoList({ page: currentPage, size: PAGE_SIZE })
    const records = res.records || []
    const total = res.total || 0

    videoList.value = [...videoList.value, ...records]

    if (videoList.value.length >= total || records.length < PAGE_SIZE) {
      noMore.value = true
    }
    currentPage++
  } catch (e) {
    console.error('获取视频列表失败:', e)
  } finally {
    loading.value = false
  }
}

const setupObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading.value && !noMore.value) {
        fetchVideos()
      }
    },
    { rootMargin: '200px' }
  )
  if (loadMoreSentinel.value) {
    observer.observe(loadMoreSentinel.value)
  }
}

onMounted(async () => {
  const cached = sessionStorage.getItem('categories')
  if (cached) {
    categories.value = JSON.parse(cached)
  } else {
    try {
      const data = await getCategoryList()
      categories.value = (data || []).filter(c => c.id !== 1)
      sessionStorage.setItem('categories', JSON.stringify(categories.value))
    } catch (e) {
      console.error('获取分类失败:', e)
    }
  }
  try {
    const res = await getRecommendVideos()
    bannerSlides.value = res.banner || []
    topVideos.value = res.cards || []
  } catch (e) {
    console.error('获取推荐视频失败:', e)
  }
  await fetchVideos()
  await nextTick()
  setupObserver()
  startAutoplay()
  document.addEventListener('click', handleMoreClickOutside)
})

onUnmounted(() => {
  pauseAutoplay()
  document.removeEventListener('click', handleMoreClickOutside)
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--bg3);
}

/* ===== 分类栏 ===== */
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

.channel-chips--more {
  grid-auto-flow: column;
  padding-top: 0;
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

.channel-link.more {
  background: transparent;
  border-color: transparent;
  color: var(--text3);
}

.channel-link.more:hover {
  color: var(--brand_pink);
  background: var(--brand_pink_thin);
}

/* ===== 主容器 ===== */
.main-container {
  max-width: 2078px;
  margin: 0 auto;
  padding: 24px var(--layout-padding) 60px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.feed-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
}

/* ===== 视频网格 ===== */
.feed-card {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-auto-rows: minmax(0, auto);
  gap: 20px;
}

.bili-carousel-cell {
  grid-column: span 2;
  grid-row: span 2;
  display: flex;
  flex-direction: column;
}

.bili-carousel-cell .carousel {
  width: 100%;
  height: calc(100% - 72px);
}

/* ===== 轮播图 ===== */
.carousel {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  height: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
}

.carousel-slides {
  display: flex;
  height: 100%;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-slide {
  flex: 0 0 100%;
  height: 100%;
}

.carousel-item {
  display: block;
  width: 100%;
  position: relative;
}

.carousel-item__image {
  position: relative;
  padding-top: 56.25%;
  width: 100%;
}

.carousel-item__image::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(transparent, #0d0d0d);
  pointer-events: none;
}

.carousel-item__image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-item__image .vip-corner-badge {
  top: 14px;
  right: 14px;
  font-size: 13px;
  padding: 3px 10px;
  border-radius: 5px;
}

.carousel-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  padding: 12px 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.carousel-bottom-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  transition: color 0.2s;
}

.carousel-bottom-title:hover {
  color: var(--brand_pink);
}

.carousel-dots {
  position: absolute;
  left: 16px;
  bottom: 56px;
  z-index: 3;
  display: flex;
  gap: 6px;
}

.carousel-dots__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s;
}

.carousel-dots__dot:hover {
  background: rgba(255, 255, 255, 0.7);
}

.carousel-dots__dot.is-active {
  background: var(--brand_pink);
  border-radius: 4px;
  width: 20px;
}

.carousel-arrows {
  position: absolute;
  right: 16px;
  bottom: 56px;
  z-index: 3;
  display: flex;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.carousel:hover .carousel-arrows {
  opacity: 1;
}

.carousel-arrows__btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.carousel-arrows__btn:hover {
  background: var(--brand_pink);
  transform: scale(1.1);
}

/* ===== 视频卡片 ===== */
.bili-video-card {
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

.bili-video-card__wrap {
  display: block;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.bili-video-card__wrap:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.bili-video-card__image {
  position: relative;
  padding-top: 56.25%;
  background: var(--graph_bg_regular);
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
  margin-top: 10px;
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
}

.bili-video-card__info--tit:hover {
  color: var(--brand_pink);
}

.bili-video-card__info--bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.bili-video-card__info--owner {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: var(--text3);
  transition: color 0.2s;
  flex: 1;
  min-width: 0;
}

.bili-video-card__info--owner:hover {
  color: var(--brand_pink);
}

.bili-video-card__info--author {
  font-size: 13px;
  color: var(--text3);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bili-video-card__info--date {
  font-size: 13px;
  color: var(--text3);
  flex-shrink: 0;
}

/* ===== 关注状态徽章 ===== */
.followed-badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  margin-left: 4px;
  background: var(--brand_pink);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 3px;
  line-height: 1;
  flex-shrink: 0;
}

.up-badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 5px;
  margin-left: 4px;
  background: var(--brand_pink_thin);
  color: var(--brand_pink);
  font-size: 11px;
  border-radius: 3px;
  line-height: 1;
  flex-shrink: 0;
}

/* ===== 加载更多 ===== */
.load-more-sentinel {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 0;
  min-height: 60px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text3);
  font-size: 14px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--graph_bg_regular);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.no-more {
  color: var(--text4);
  font-size: 14px;
}

.no-data {
  color: var(--text4);
  font-size: 14px;
}

/* ===== 响应式 ===== */
@media (max-width: 1400px) {
  .feed-card { grid-template-columns: repeat(4, 1fr); }
  .bili-carousel-cell { grid-column: span 2; grid-row: span 2; }
}

@media (max-width: 1100px) {
  .main-container { padding: 20px 56px 60px; }
  .channel-bar { padding: 0 56px; }
  .feed-card { grid-template-columns: repeat(3, 1fr); }
  .bili-carousel-cell { grid-column: span 3; grid-row: span 2; }
}

@media (max-width: 768px) {
  .main-container { padding: 16px 16px 40px; }
  .channel-bar { padding: 0 16px; }
  .feed-card { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .bili-carousel-cell { grid-column: span 2; grid-row: span 2; }
}
</style>
