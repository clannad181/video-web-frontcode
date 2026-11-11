<template>
  <div class="home-page">
    <!-- 分类 chips -->
    <div class="channel-bar">
      <div class="channel-chips hide-scrollbar">
        <router-link to="/category" class="channel-link channel-link--all">全部</router-link>
        <router-link
          v-for="cat in categories"
          :key="cat.id"
          :to="`/category/${cat.id}`"
          class="channel-link"
        >{{ cat.name }}</router-link>
      </div>
    </div>

    <!-- 轮播 banner -->
    <div v-if="bannerSlides.length" class="banner-wrap">
      <van-swipe :autoplay="4000" indicator-color="#FF6699" class="banner-swipe">
        <van-swipe-item v-for="(slide, idx) in bannerSlides" :key="idx">
          <a class="banner-item" @click.prevent="handleVideoClick(slide, router)">
            <img :src="fileUrl(slide.coverUrl)" :alt="slide.title" />
            <span v-if="slide.needVip" class="vip-badge banner-vip">大会员</span>
            <div class="banner-title">{{ slide.title }}</div>
          </a>
        </van-swipe-item>
      </van-swipe>
    </div>

    <!-- 推荐卡片 -->
    <div v-if="topVideos.length" class="section">
      <div class="section-title">个性推荐</div>
      <div class="video-grid">
        <VideoCard v-for="v in topVideos" :key="'t' + v.id" :video="v" />
      </div>
    </div>

    <!-- 最新视频 -->
    <div class="section">
      <div class="section-title">最新视频</div>
      <div class="video-grid">
        <VideoCard v-for="v in videoList" :key="'r' + v.id" :video="v" />
      </div>
      <van-loading v-if="loading" class="list-loading" color="#FF6699">加载中…</van-loading>
      <div v-else-if="noMore && videoList.length" class="list-end">没有更多了</div>
      <div v-else-if="!videoList.length" class="list-end">暂无视频</div>
      <div ref="loadMoreSentinel" class="load-sentinel" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getCategoryList } from '../api/category'
import { getClientVideoList, getRecommendVideos } from '../api/video'
import { fileUrl } from '../config'
import { handleVideoClick } from '../utils/video'
import VideoCard from '../components/video/VideoCard.vue'

const router = useRouter()
const PAGE_SIZE = 20

const categories = ref([])
const bannerSlides = ref([])
const topVideos = ref([])
const videoList = ref([])
const loading = ref(false)
const noMore = ref(false)
const loadMoreSentinel = ref(null)

let currentPage = 1
let observer = null

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
    { rootMargin: '300px' }
  )
  if (loadMoreSentinel.value) observer.observe(loadMoreSentinel.value)
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
})

onUnmounted(() => {
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
  padding-top: calc(48px + var(--sat));
}

.channel-bar {
  position: sticky;
  top: calc(48px + var(--sat));
  z-index: 20;
  background: var(--bg1);
  border-bottom: 1px solid var(--line_light);
}

.channel-chips {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.channel-link {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 14px;
  background: var(--graph_bg_thin);
  color: var(--text2);
  font-size: 13px;
  white-space: nowrap;
  transition: all 0.2s;
}

.channel-link--all {
  background: var(--brand_pink_thin);
  color: var(--brand_pink);
}

.channel-link:active {
  background: var(--brand_pink);
  color: #fff;
}

.banner-wrap {
  padding: 12px 12px 0;
}

.banner-swipe {
  border-radius: 10px;
  overflow: hidden;
}

.banner-item {
  position: relative;
  display: block;
  aspect-ratio: 16 / 7;
  background: var(--graph_bg_thin);
}

.banner-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-vip {
  position: absolute;
  top: 8px;
  right: 8px;
}

.banner-title {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18px 10px 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  color: #fff;
  font-size: 13px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.section {
  padding: 14px 12px 0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text1);
  margin-bottom: 10px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 10px;
}

.list-loading {
  justify-content: center;
  padding: 16px 0;
}

.list-end {
  padding: 16px 0;
  text-align: center;
  font-size: 12px;
  color: var(--text4);
}

.load-sentinel {
  height: 1px;
}
</style>
