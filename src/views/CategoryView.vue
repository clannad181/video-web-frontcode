<template>
  <div class="category-page">
    <div class="channel-bar">
      <div class="channel-chips hide-scrollbar">
        <router-link
          v-for="cat in categories"
          :key="cat.id"
          :to="`/category/${cat.id}`"
          class="channel-link"
          :class="{ active: currentCategoryId == cat.id }"
        >{{ cat.name }}</router-link>
      </div>
    </div>

    <div class="category-header">
      <h1 class="category-title">{{ currentCategoryName || '全部分类' }}</h1>
    </div>

    <van-loading v-if="loading" class="page-loading" color="#FF6699">加载中…</van-loading>

    <template v-else>
      <div v-if="videos.length" class="video-grid">
        <VideoCard v-for="video in videos" :key="video.id" :video="video" />
      </div>
      <van-empty v-else image="error" description="该分类暂无视频">
        <van-button round plain type="primary" size="small" @click="router.push('/')">去首页看看</van-button>
      </van-empty>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategoryList } from '../api/category'
import { getClientVideoList } from '../api/video'
import VideoCard from '../components/video/VideoCard.vue'

const route = useRoute()
const router = useRouter()

const videos = ref([])
const categories = ref([])
const loading = ref(false)

const currentCategoryId = computed(() => route.params.id || null)

const currentCategoryName = computed(() => {
  if (!currentCategoryId.value) return ''
  const cat = categories.value.find(c => c.id == currentCategoryId.value)
  return cat?.name || ''
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
  loading.value = true
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
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadVideos()
})

watch(() => route.params.id, () => {
  loadVideos()
})
</script>

<style scoped>
.category-page {
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

.channel-link.active {
  background: var(--brand_pink);
  color: #fff;
}

.category-header {
  padding: 14px 12px 0;
}

.category-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text1);
}

.page-loading {
  justify-content: center;
  padding: 60px 0;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 10px;
  padding: 14px 12px 24px;
}
</style>
