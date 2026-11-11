<template>
  <div class="clist">
    <div class="clist-toolbar">
      <van-search
        v-model="searchKey"
        shape="round"
        placeholder="搜索我的稿件"
        background="transparent"
        @search="handleSearch"
        @clear="handleSearch"
      />
      <div class="status-chips hide-scrollbar">
        <button
          v-for="s in statusOptions"
          :key="s.value"
          type="button"
          class="status-chip"
          :class="{ active: statusFilter === s.value }"
          @click="changeStatus(s.value)"
        >{{ s.label }}</button>
      </div>
    </div>

    <van-loading v-if="loading && !list.length" class="page-loading" color="#FF6699">加载中…</van-loading>

    <template v-else-if="list.length">
      <div v-for="item in list" :key="item.id" class="clist-item" @click="playItem(item)">
        <div class="clist-cover">
          <img :src="fileUrl(item.coverUrl)" :alt="item.title" loading="lazy" />
          <span v-if="item.needVip" class="vip-badge clist-vip">大会员</span>
          <span class="clist-status" :class="`s-${item.status}`">{{ statusText(item.status) }}</span>
        </div>
        <div class="clist-info">
          <div class="clist-title">{{ item.title }}</div>
          <div class="clist-meta">
            <span>{{ formatCount(item.playCount || 0) }}播放</span>
            <span>{{ item.createTime ? formatDate(item.createTime) : '' }}</span>
          </div>
          <div class="clist-actions" @click.stop>
            <van-button size="mini" round plain color="#FF6699" @click="editItem(item)">编辑</van-button>
            <van-button size="mini" round plain color="#FF6699" @click="manageEpisodes(item)">选集管理</van-button>
            <van-button size="mini" round plain @click="toggleOngoing(item)">
              {{ item.isOngoing ? '完结' : '连载中' }}
            </van-button>
            <van-button size="mini" round plain type="danger" @click="removeItem(item)">删除</van-button>
          </div>
        </div>
      </div>

      <div class="list-end">
        <van-button
          v-if="currentPage < totalPages && !loading"
          plain size="small"
          round
          @click="loadList(currentPage + 1)"
        >加载更多</van-button>
        <span v-else>没有更多了</span>
      </div>
    </template>

    <van-empty v-else description="还没有投稿">
      <van-button round type="primary" color="#FF6699" size="small" @click="$emit('go-submit')">去投稿</van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getMyContributions, toggleVideoOngoing, deleteMyContribution } from '../../api/video'
import { formatCount } from '../../utils/format'
import { formatDate } from '../../utils/fileUpload'
import { fileUrl } from '../../config'

const emit = defineEmits(['edit', 'go-submit'])
const router = useRouter()

const list = ref([])
const loading = ref(false)
const searchKey = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const total = ref(0)
const PAGE_SIZE = 10

const statusOptions = [
  { label: '全部', value: '' },
  { label: '已通过', value: 1 },
  { label: '审核中', value: 0 },
  { label: '未通过', value: 2 }
]

const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))

const statusText = (s) => {
  const map = { 0: '审核中', 1: '已通过', 2: '未通过', 3: '已下架' }
  return map[s] ?? ''
}

const loadList = async (page = 1) => {
  if (loading.value) return
  loading.value = true
  try {
    const params = { page, size: PAGE_SIZE }
    if (searchKey.value) params.keyword = searchKey.value
    if (statusFilter.value !== '') params.status = statusFilter.value
    const res = await getMyContributions(params)
    const records = res?.records || []
    total.value = res?.total || 0
    list.value = page === 1 ? records : [...list.value, ...records]
    currentPage.value = page
  } catch (e) {
    console.error('获取稿件列表失败:', e)
    if (page === 1) list.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => loadList(1)

const changeStatus = (v) => {
  statusFilter.value = v
  loadList(1)
}

const playItem = (item) => {
  if (item.playLink) {
    let path = item.playLink
    try {
      const url = new URL(path)
      path = url.pathname
    } catch {}
    if (path.startsWith('/api')) path = path.slice(4)
    router.push(path)
  }
}

const editItem = (item) => emit('edit', item.avid || item.videoUid)

const manageEpisodes = (item) => {
  router.push(`/contribution/episodes/${item.avid || item.videoUid}`)
}

const toggleOngoing = async (item) => {
  try {
    await toggleVideoOngoing(item.avid || item.videoUid)
    item.isOngoing = !item.isOngoing
    showToast(item.isOngoing ? '已切换为连载中' : '已标记完结')
  } catch (e) {
    showToast(e.message || '操作失败')
  }
}

const removeItem = async (item) => {
  try {
    await showConfirmDialog({ title: '删除稿件', message: '确定删除该稿件吗？删除后不可恢复。' })
    await deleteMyContribution(item.avid || item.videoUid)
    list.value = list.value.filter(x => x.id !== item.id)
    showToast('已删除')
  } catch {}
}

onMounted(() => loadList(1))
</script>

<style scoped>
.clist-toolbar {
  background: var(--bg1);
}

.status-chips {
  display: flex;
  gap: 8px;
  padding: 0 12px 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.status-chip {
  flex: 0 0 auto;
  height: 26px;
  padding: 0 12px;
  border: none;
  border-radius: 13px;
  background: var(--graph_bg_thin);
  color: var(--text2);
  font-size: 12px;
  cursor: pointer;
}

.status-chip.active {
  background: var(--brand_pink);
  color: #fff;
}

.page-loading {
  justify-content: center;
  padding: 50px 0;
}

.clist-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: var(--bg1);
  border-bottom: 1px solid var(--line-light);
  cursor: pointer;
}

.clist-cover {
  position: relative;
  width: 132px;
  flex-shrink: 0;
  aspect-ratio: 16 / 10;
  border-radius: 8px;
  overflow: hidden;
  background: var(--graph_bg_thin);
}

.clist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.clist-vip {
  position: absolute;
  top: 4px;
  right: 4px;
}

.clist-status {
  position: absolute;
  left: 4px;
  bottom: 4px;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
}

.clist-status.s-1 { background: rgba(7, 193, 96, 0.9); }
.clist-status.s-0 { background: rgba(255, 152, 56, 0.9); }
.clist-status.s-2 { background: rgba(238, 10, 36, 0.9); }

.clist-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.clist-title {
  font-size: 13px;
  line-height: 1.4;
  color: var(--text1);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.clist-meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: var(--text3);
  margin-top: 4px;
}

.clist-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
  padding-top: 8px;
}

.list-end {
  padding: 16px 0;
  text-align: center;
  font-size: 12px;
  color: var(--text4);
}
</style>
