<template>
  <div class="history-page">
    <div class="page-head">
      <h1>观看历史</h1>
      <van-search
        v-model="keyword"
        shape="round"
        placeholder="搜索历史"
        background="transparent"
        @search="handleSearch"
        @clear="handleSearch"
      />
    </div>

    <van-loading v-if="loading && !groups.length" class="page-loading" color="#FF6699">加载中…</van-loading>

    <template v-else-if="groups.length">
      <div v-for="group in groups" :key="group.date" class="date-group">
        <div class="date-label">{{ group.date }}</div>
        <div
          v-for="item in group.items"
          :key="item.id || item.playLink"
          class="history-item"
          @click="playItem(item)"
        >
          <div class="history-cover">
            <img :src="fileUrl(item.coverUrl)" :alt="item.title" loading="lazy" />
            <span v-if="item.needVip" class="vip-badge history-vip">大会员</span>
            <span class="history-progress" v-if="item.watchProgress">
              {{ Math.min(100, Math.round(item.watchProgress * 100)) }}%
            </span>
          </div>
          <div class="history-info">
            <div class="history-title">{{ item.title }}</div>
            <div class="history-meta">{{ item.episodeTitle || item.nickName }}</div>
            <div class="history-actions">
              <span class="history-time">{{ formatDate(item.updateTime || item.createTime) }}</span>
              <button class="history-delete" @click.stop="removeItem(item)">
                <van-icon name="delete-o" size="15" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="list-end">
        <van-button
          v-if="!noMore && !loading"
          plain size="small"
          round
          @click="loadHistory(currentPage + 1)"
        >加载更多</van-button>
        <span v-else>没有更多了</span>
      </div>
    </template>

    <van-empty v-else description="暂无观看历史">
      <van-button round type="primary" color="#FF6699" size="small" @click="router.push('/')">去首页逛逛</van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { searchWatchHistory, deleteWatchHistory } from '../api/video'
import { fileUrl } from '../config'
import { formatDate } from '../utils/fileUpload'
import { handleVideoClick } from '../utils/video'

const router = useRouter()
const PAGE_SIZE = 20

const groups = ref([])
const loading = ref(false)
const noMore = ref(false)
const currentPage = ref(1)
const keyword = ref('')

const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const endDate = ref(fmt(now))
const startDate = ref(fmt(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())))

const loadHistory = async (page = 1) => {
  if (loading.value) return
  loading.value = true
  try {
    const res = await searchWatchHistory({
      page,
      size: PAGE_SIZE,
      keyword: keyword.value || undefined,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined
    })
    const records = res?.records || []
    const flatList = []
    for (const month of records) {
      for (const day of (month.days || [])) {
        flatList.push({ date: day.date, items: day.items || [] })
      }
    }
    const resTotal = res?.total || 0
    if (page === 1) {
      groups.value = flatList
    } else {
      groups.value = [...groups.value, ...flatList]
    }
    currentPage.value = page
    if (page >= resTotal || flatList.length === 0) {
      noMore.value = true
    }
  } catch (e) {
    console.error('获取观看历史失败:', e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  noMore.value = false
  loadHistory(1)
}

const playItem = (item) => {
  handleVideoClick({
    ...item,
    videoAvid: item.videoAvid || item.videoUid,
    episodeAvid: item.episodeAvid || item.episodeUid
  }, router)
}

const removeItem = async (item) => {
  try {
    await showConfirmDialog({ title: '删除记录', message: '确定删除这条观看记录吗？' })
    await deleteWatchHistory({
      videoId: item.videoAvid || item.videoUid,
      episodeId: item.episodeAvid || item.episodeUid
    })
    showToast('已删除')
    handleSearch()
  } catch {}
}

onMounted(() => {
  loadHistory(1)
})
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: var(--bg3);
  padding-top: calc(48px + var(--sat));
}

.page-head {
  position: sticky;
  top: calc(48px + var(--sat));
  z-index: 20;
  background: var(--bg1);
  padding-top: 10px;
}

.page-head h1 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text1);
  padding: 0 14px;
  margin-bottom: 4px;
}

.page-loading {
  justify-content: center;
  padding: 60px 0;
}

.date-group {
  padding: 6px 12px 0;
}

.date-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
  padding: 10px 2px 8px;
}

.history-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  margin-bottom: 8px;
  background: var(--bg1);
  border-radius: 10px;
  cursor: pointer;
}

.history-cover {
  position: relative;
  width: 132px;
  flex-shrink: 0;
  aspect-ratio: 16 / 10;
  border-radius: 6px;
  overflow: hidden;
  background: var(--graph_bg_thin);
}

.history-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-vip {
  position: absolute;
  top: 4px;
  right: 4px;
}

.history-progress {
  position: absolute;
  left: 4px;
  bottom: 4px;
  padding: 1px 5px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 10px;
  border-radius: 3px;
}

.history-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.history-title {
  font-size: 13px;
  line-height: 1.4;
  color: var(--text1);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.history-meta {
  font-size: 11px;
  color: var(--text3);
  margin-top: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.history-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.history-time {
  font-size: 10px;
  color: var(--text4);
}

.history-delete {
  background: none;
  border: none;
  color: var(--text4);
  padding: 4px;
  cursor: pointer;
}

.list-end {
  padding: 16px 0 32px;
  text-align: center;
  font-size: 12px;
  color: var(--text4);
}
</style>
