<template>
  <div class="category-page">
    <!-- ============ 分区入口（/category）：bilibili app 风宫格 ============ -->
    <template v-if="!currentCategoryId">
      <div class="cat-hero">
        <h1>分区</h1>
        <p>发现你感兴趣的内容</p>
      </div>

      <div class="cat-grid-card">
        <div class="cat-grid">
          <div
            v-for="(cat, idx) in categories"
            :key="cat.id"
            class="cat-cell"
            @click="goCategory(cat.id)"
          >
            <span class="cat-badge" :style="{ background: iconFor(cat, idx).bg }">
              <van-icon :name="iconFor(cat, idx).name" size="24" />
            </span>
            <span class="cat-name">{{ cat.name }}</span>
          </div>
        </div>
      </div>

      <section v-if="recommendVideos.length" class="rec-section">
        <div class="sec-head">
          <h2>为你推荐</h2>
          <span class="sec-more" @click="router.push('/')">去首页</span>
        </div>
        <div class="rec-scroll hide-scrollbar">
          <div v-for="v in recommendVideos" :key="v.id" class="rec-card" @click="playVideo(v)">
            <div class="rec-cover">
              <img :src="fileUrl(v.coverUrl)" :alt="v.title" loading="lazy" />
              <span v-if="v.needVip" class="vip-badge rec-vip">大会员</span>
            </div>
            <div class="rec-title">{{ v.title }}</div>
            <div class="rec-meta">{{ formatCount(v.playCount || 0) }}播放</div>
          </div>
        </div>
      </section>
    </template>

    <!-- ============ 分区详情（/category/:id） ============ -->
    <template v-else>
      <div class="detail-hero" :style="{ background: currentIcon.bg }">
        <div class="hero-row">
          <span class="hero-back" @click="goCategory(null)">
            <van-icon name="arrow-left" size="13" />
            <span>分区</span>
          </span>
          <span class="hero-icon">
            <van-icon :name="currentIcon.name" size="28" />
          </span>
          <div class="hero-info">
            <h1>{{ currentCategoryName || '分区' }}</h1>
            <span>{{ total || videos.length }} 个视频</span>
          </div>
        </div>
      </div>

      <!-- 其他分区快速切换 -->
      <div class="switch-bar hide-scrollbar">
        <div
          v-for="(cat, idx) in categories"
          :key="cat.id"
          class="switch-chip"
          :class="{ active: currentCategoryId == cat.id }"
          @click="goCategory(cat.id)"
        >
          <van-icon :name="iconFor(cat, idx).name" size="13" />
          <span>{{ cat.name }}</span>
        </div>
      </div>

      <van-loading v-if="loading" class="page-loading" color="#FF6699">加载中…</van-loading>

      <template v-else>
        <div v-if="videos.length" class="video-grid">
          <VideoCard v-for="video in videos" :key="video.id" :video="video" />
          <div class="list-end">已经到底了</div>
        </div>
        <van-empty v-else image="error" description="该分区暂无视频" />
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategoryList } from '../api/category'
import { getClientVideoList, getRecommendVideos } from '../api/video'
import { fileUrl } from '../config'
import { formatCount } from '../utils/format'
import { handleVideoClick } from '../utils/video'
import VideoCard from '../components/video/VideoCard.vue'

const route = useRoute()
const router = useRouter()

const videos = ref([])
const categories = ref([])
const recommendVideos = ref([])
const total = ref(0)
const loading = ref(false)

const currentCategoryId = computed(() => route.params.id || null)

const currentCategoryName = computed(() => {
  if (!currentCategoryId.value) return ''
  const cat = categories.value.find(c => c.id == currentCategoryId.value)
  return cat?.name || ''
})

/* 分区预设图标与配色（分类数据里没有图标字段） */
const grad = (a, b) => `linear-gradient(135deg, ${a}, ${b})`
const PRESETS = [
  { keys: ['动画', '动漫', '番剧', '漫画'], icon: 'flower-o', bg: grad('#FF8CB0', '#FF6699') },
  { keys: ['音乐', '歌曲', '音频'], icon: 'music-o', bg: grad('#5AC8FA', '#00AEEC') },
  { keys: ['演唱', '现场'], icon: 'live', bg: grad('#FF7A9E', '#FF4D6D') },
  { keys: ['舞蹈'], icon: 'good-job-o', bg: grad('#A78BFA', '#8B5CF6') },
  { keys: ['游戏', '竞技', '电竞'], icon: 'medal-o', bg: grad('#FF7875', '#FF4D4F') },
  { keys: ['科技', '数码', '科普', '知识', '编程'], icon: 'bulb-o', bg: grad('#2CE0C4', '#00B8A9') },
  { keys: ['生活', '日常', '美食', '旅行', '户外'], icon: 'smile-o', bg: grad('#5DDB7B', '#07C160') },
  { keys: ['鬼畜', '搞笑', '剪辑'], icon: 'video-o', bg: grad('#FFD666', '#F5A623') },
  { keys: ['时尚', '美妆', '穿搭'], icon: 'gem-o', bg: grad('#FF8CB0', '#EB5757') },
  { keys: ['娱乐', '综艺', '明星'], icon: 'star-o', bg: grad('#FFB199', '#FF976A') },
  { keys: ['影视', '电影', '电视剧'], icon: 'tv-o', bg: grad('#7B8CFF', '#4C6FFF') },
  { keys: ['纪录片', '纪实'], icon: 'notes-o', bg: grad('#4FD1C5', '#00A8A8') },
  { keys: ['体育', '运动'], icon: 'flag-o', bg: grad('#00C2FF', '#00AEEC') },
  { keys: ['动态', '资讯', '新闻'], icon: 'newspaper-o', bg: grad('#A0AEC0', '#61666D') }
]
const FALLBACK = ['video-o', 'photo-o', 'chat-o', 'like-o', 'gift-o', 'bookmark-o', 'orders-o', 'shield-o', 'label-o', 'eye-o']
const FALLBACK_BG = [
  grad('#7B8CFF', '#4C6FFF'), grad('#5AC8FA', '#00AEEC'), grad('#5DDB7B', '#07C160'),
  grad('#FFB199', '#FF6699'), grad('#FFD666', '#F5A623'), grad('#A78BFA', '#8B5CF6'),
  grad('#FF9B8A', '#FF4D4F'), grad('#4FD1C5', '#00B8A9'), grad('#F6A5C0', '#EB5757'),
  grad('#A0AEC0', '#61666D')
]
const iconFor = (cat, idx) => {
  const name = String(cat?.name || '')
  const hit = PRESETS.find(p => p.keys.some(k => name.includes(k)))
  if (hit) return { name: hit.icon, bg: hit.bg }
  return { name: FALLBACK[idx % FALLBACK.length], bg: FALLBACK_BG[idx % FALLBACK_BG.length] }
}

const currentIcon = computed(() => {
  const cat = categories.value.find(c => c.id == currentCategoryId.value)
  if (!cat) return { name: 'apps-o', bg: grad('#FF8CB0', '#FF6699') }
  return iconFor(cat, categories.value.indexOf(cat))
})

const goCategory = (id) => {
  const path = id ? `/category/${id}` : '/category'
  if (route.path !== path) router.push(path)
}

const playVideo = (v) => handleVideoClick(v, router)

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

const loadRecommend = async () => {
  try {
    const res = await getRecommendVideos()
    recommendVideos.value = res?.cards || []
  } catch (e) {
    console.error('获取推荐视频失败:', e)
    recommendVideos.value = []
  }
}

const loadVideos = async () => {
  loading.value = true
  try {
    const params = {
      page: 1,
      size: 40,
      categoryId: currentCategoryId.value || undefined
    }
    const res = await getClientVideoList(params)
    videos.value = res?.records || []
    total.value = res?.total || videos.value.length
  } catch (e) {
    console.error('获取视频失败:', e)
    videos.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCategories()
  if (currentCategoryId.value) loadVideos()
  else loadRecommend()
})

watch(() => route.params.id, (id) => {
  if (id) loadVideos()
  else loadRecommend()
})
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  background: var(--bg3);
  padding-top: calc(var(--header-h) + var(--sat));
  padding-bottom: calc(70px + var(--sab));
}

/* ---------- 分区入口 ---------- */
.cat-hero {
  padding: 18px 16px 4px;
}

.cat-hero h1 {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--text1);
}

.cat-hero p {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text3);
}

.cat-grid-card {
  margin: 12px;
  padding: 20px 8px 8px;
  background: var(--bg1);
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px 0;
}

.cat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.cat-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 16px;
  color: #fff;
  transition: transform 0.15s;
}

.cat-cell:active .cat-badge {
  transform: scale(0.9);
}

.cat-name {
  font-size: 12px;
  color: var(--text2);
}

/* 推荐横滑 */
.sec-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 14px 16px 10px;
}

.sec-head h2 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text1);
}

.sec-more {
  font-size: 12px;
  color: var(--text3);
}

.rec-scroll {
  display: flex;
  gap: 10px;
  padding: 0 16px 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.rec-card {
  width: 150px;
  flex: 0 0 auto;
  cursor: pointer;
}

.rec-cover {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 8px;
  overflow: hidden;
  background: var(--graph_bg_thin);
}

.rec-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rec-vip {
  position: absolute;
  top: 6px;
  right: 6px;
}

.rec-title {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text1);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.rec-meta {
  margin-top: 3px;
  font-size: 11px;
  color: var(--text3);
}

/* ---------- 分区详情 ---------- */
.detail-hero {
  padding: 14px 16px 20px;
  border-radius: 0 0 18px 18px;
  color: #fff;
}

.hero-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero-back {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 12px;
  color: #fff;
  cursor: pointer;
}

.hero-back:active {
  background: rgba(255, 255, 255, 0.32);
}

.hero-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.22);
  flex-shrink: 0;
}

.hero-info {
  min-width: 0;
}

.hero-info h1 {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.hero-info span {
  font-size: 12px;
  opacity: 0.85;
}

.switch-bar {
  position: sticky;
  top: calc(var(--header-h) + var(--sat));
  z-index: 10;
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  overflow-x: auto;
  background: var(--bg3);
  -webkit-overflow-scrolling: touch;
}

.switch-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
  height: 28px;
  padding: 0 12px;
  border-radius: 14px;
  background: var(--bg1);
  border: 1px solid var(--line_light);
  color: var(--text2);
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}

.switch-chip.active {
  background: var(--brand_pink_thin);
  border-color: transparent;
  color: var(--brand_pink);
  font-weight: 600;
}

.page-loading {
  justify-content: center;
  padding: 60px 0;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 10px;
  padding: 4px 12px 24px;
}

.list-end {
  grid-column: span 2;
  padding: 10px 0 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text4);
}
</style>
