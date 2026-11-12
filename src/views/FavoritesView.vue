<template>
  <div class="fav-page">
    <div class="page-head">
      <div class="head-row">
        <h1>我的收藏</h1>
        <span v-if="!keyword && selectedFolder" class="head-count">{{ total }} 个视频</span>
      </div>
      <van-search
        v-model="keyword"
        shape="round"
        placeholder="搜索收藏的视频"
        background="transparent"
        @search="handleSearch"
        @clear="handleSearch"
      />
    </div>

    <!-- 收藏夹切换 -->
    <div v-if="!keyword && folders.length" class="folder-bar hide-scrollbar">
      <div
        v-for="folder in folders"
        :key="folder.uid"
        class="folder-chip"
        :class="{ active: selectedFolder?.uid === folder.uid }"
        @click="selectFolder(folder)"
      >
        <van-icon name="star-o" size="13" />
        <span class="folder-name">{{ folder.name }}</span>
        <span v-if="folder.count" class="folder-count">{{ folder.count }}</span>
      </div>
    </div>

    <div v-if="keyword" class="search-tip">
      搜索「{{ keyword }}」<span v-if="videos.length">· 共 {{ total }} 个结果</span>
    </div>

    <van-loading v-if="loading && !videos.length" class="page-loading" color="#FF6699">加载中…</van-loading>

    <template v-else-if="videos.length">
      <div class="video-grid">
        <VideoCard v-for="v in videos" :key="v.episodeAvid || v.id" :video="v" />
      </div>
      <div class="list-end">
        <van-button
          v-if="!noMore && !loading"
          plain
          size="small"
          round
          @click="loadVideos(currentPage + 1)"
        >加载更多</van-button>
        <span v-else>{{ loading ? '加载中…' : '没有更多了' }}</span>
      </div>
    </template>

    <van-empty v-else :description="keyword ? '没有找到相关收藏' : '收藏夹还是空的'">
      <van-button v-if="!keyword" round type="primary" color="#FF6699" size="small" @click="router.push('/')">去首页逛逛</van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFavoriteFolderList, getFavoriteFolderDetail, searchFavorite } from '../api/video'
import VideoCard from '../components/video/VideoCard.vue'

const router = useRouter()
const PAGE_SIZE = 20

const folders = ref([])
const selectedFolder = ref(null)
const videos = ref([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const noMore = ref(false)
const keyword = ref('')

/* 收藏夹字段归一化 */
const normalizeFolder = (f, idx) => ({
  uid: f.folderUid || f.uid || f.id || `folder-${idx}`,
  name: f.name || f.title || '默认收藏夹',
  count: Number(f.mediaCount ?? f.videoCount ?? f.count ?? 0)
})

/* 收藏视频字段归一化：接口返回 videoTitle / videoCover / duration */
const normalizeVideo = (v) => ({
  ...v,
  id: v.id || v.episodeAvid || v.videoAvid || v.videoUid,
  title: v.title || v.videoTitle || '',
  coverUrl: v.coverUrl || v.videoCover || '',
  totalDuration: v.totalDuration ?? v.duration ?? 0,
  playCount: v.playCount ?? 0,
  favoriteCount: v.favoriteCount ?? 0,
  nickName: v.nickName || v.upName || '',
  createTime: v.createTime || v.favoriteTime || '',
  episodeAvid: v.episodeAvid || v.avid || v.videoAvid,
  videoAvid: v.videoAvid || v.videoUid || v.avid
})

const loadVideos = async (page = 1) => {
  if (loading.value) return
  loading.value = true
  try {
    let records = []
    let resTotal = 0
    if (keyword.value.trim()) {
      const res = await searchFavorite({
        title: keyword.value.trim(),
        page,
        size: PAGE_SIZE
      })
      const data = res?.data || res
      records = data?.records || data?.list?.records || []
      resTotal = data?.total || data?.list?.total || 0
    } else if (selectedFolder.value) {
      const res = await getFavoriteFolderDetail({
        folderUid: selectedFolder.value.uid,
        page,
        size: PAGE_SIZE
      })
      records = res?.list?.records || res?.records || []
      resTotal = res?.list?.total || res?.total || 0
    }

    const list = records.map(normalizeVideo)
    videos.value = page === 1 ? list : [...videos.value, ...list]
    total.value = resTotal || videos.value.length
    currentPage.value = page
    noMore.value = list.length === 0 || videos.value.length >= total.value
  } catch (e) {
    console.error('获取收藏视频失败:', e)
    if (page === 1) {
      videos.value = []
      total.value = 0
    }
  } finally {
    loading.value = false
  }
}

const loadFolders = async () => {
  try {
    const res = await getFavoriteFolderList()
    const list = Array.isArray(res) ? res : res?.list || []
    folders.value = list.map(normalizeFolder)
    if (folders.value.length) {
      selectedFolder.value = folders.value[0]
      await loadVideos(1)
    }
  } catch (e) {
    console.error('获取收藏夹列表失败:', e)
    folders.value = []
  }
}

const selectFolder = (folder) => {
  if (selectedFolder.value?.uid === folder.uid) return
  selectedFolder.value = folder
  keyword.value = ''
  noMore.value = false
  loadVideos(1)
}

const handleSearch = () => {
  noMore.value = false
  loadVideos(1)
}

onMounted(loadFolders)
</script>

<style scoped>
.fav-page {
  min-height: 100vh;
  background: var(--bg3);
  padding-top: calc(var(--header-h) + var(--sat));
}

.page-head {
  position: sticky;
  top: calc(var(--header-h) + var(--sat));
  z-index: 20;
  background: var(--bg1);
  padding-top: 10px;
  box-shadow: 0 1px 0 var(--line_light);
}

.head-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 14px;
}

.page-head h1 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text1);
}

.head-count {
  font-size: 11px;
  color: var(--text3);
}

/* ---------- 收藏夹胶囊 ---------- */
.folder-bar {
  display: flex;
  gap: 8px;
  padding: 12px 12px 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.folder-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
  max-width: 62vw;
  height: 30px;
  padding: 0 12px;
  border-radius: 15px;
  background: var(--bg1);
  border: 1px solid var(--line_light);
  color: var(--text2);
  font-size: 12px;
  cursor: pointer;
}

.folder-chip.active {
  background: var(--brand_pink_thin);
  border-color: transparent;
  color: var(--brand_pink);
  font-weight: 600;
}

.folder-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.folder-count {
  font-size: 10px;
  opacity: 0.7;
}

.search-tip {
  padding: 12px 14px 2px;
  font-size: 12px;
  color: var(--text3);
}

.page-loading {
  justify-content: center;
  padding: 60px 0;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 10px;
  padding: 12px 12px 0;
}

.list-end {
  padding: 16px 0 32px;
  text-align: center;
  font-size: 12px;
  color: var(--text4);
}
</style>
