<template>
  <div class="contribution-list">
    <div class="list-header">
      <div class="list-filters">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input 
            v-model="searchKey" 
            type="text" 
            placeholder="搜索稿件标题" 
            @keyup.enter="search"
          />
          <svg v-if="searchKey" class="search-clear" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" @click="clearSearch">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
          </svg>
        </div>
        <div class="filter-tabs">
          <button 
            v-for="tab in statusTabs" 
            :key="tab.value"
            class="filter-tab"
            :class="{ active: statusFilter === tab.value }"
            @click="filterByStatus(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
      <div class="list-stats">
        共 <strong>{{ total }}</strong> 个稿件
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="list.length > 0" class="contributions-grid">
      <div v-for="item in list" :key="item.videoUid" class="contribution-card">
        <div class="card-cover" @click="goToVideo(item)">
          <img :src="item.coverUrl" :alt="item.title" />
          <span class="cover-badge" v-if="item.episodeCount">{{ item.episodeCount }}P</span>
          <div class="cover-hover">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
        </div>
        <div class="card-body">
          <div class="card-title" @click="goToVideo(item)">{{ item.title }}</div>
          <div class="card-meta">
            <span class="status-tag" :class="getStatusClass(item.videoStatus)">
              {{ getStatusText(item.videoStatus) }}
            </span>
            <span class="ongoing-tag" :class="{ active: item.isOngoing }">
              {{ item.isOngoing ? '连载中' : '已完结' }}
            </span>
          </div>
          <div class="card-stats">
            <span class="stat-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              {{ formatCount(item.playCount || 0) }}
            </span>
            <span class="stat-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              {{ formatCount(item.favoriteCount || 0) }}
            </span>
            <span class="stat-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              {{ formatCount(item.coinCount || 0) }}
            </span>
          </div>
          <div class="card-time">{{ formatDate(item.createTime) }}</div>
          <div class="card-actions">
            <button 
              v-if="item.isOngoing" 
              class="action-link" 
              @click="$emit('manage-episodes', item)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                <line x1="7" y1="2" x2="7" y2="22"/>
                <line x1="17" y1="2" x2="17" y2="22"/>
              </svg>
              剧集管理
            </button>
            <button class="action-link" @click="$emit('edit', item)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              编辑
            </button>
            <button class="action-link action-link--danger" @click="$emit('delete', item)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <p>暂无稿件</p>
      <span>点击左侧"投稿"按钮开始创作</span>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button 
        class="page-btn" 
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <template v-for="page in visiblePages" :key="page">
        <button 
          v-if="page !== '...'"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <span v-else class="page-ellipsis">...</span>
      </template>
      <button 
        class="page-btn" 
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getMyContributions, toggleVideoOngoing } from '../../api/video'
import { formatCount } from '../../utils/format'
import { ElMessage } from 'element-plus'

const props = defineProps({
  initialPage: { type: Number, default: 1 },
  initialStatus: { type: String, default: '' },
  initialSearch: { type: String, default: '' }
})

const emit = defineEmits(['edit', 'delete', 'manage-episodes'])

const router = useRouter()

const list = ref([])
const loading = ref(false)
const searchKey = ref(props.initialSearch)
const statusFilter = ref(props.initialStatus)
const currentPage = ref(props.initialPage)
const total = ref(0)
const pageSize = 12

const statusTabs = [
  { label: '全部', value: '' },
  { label: '草稿', value: '0' },
  { label: '待发布', value: '1' },
  { label: '已发布', value: '2' },
  { label: '已下架', value: '3' }
]

const totalPages = computed(() => Math.ceil(total.value / pageSize))

const visiblePages = computed(() => {
  const pages = []
  const tp = totalPages.value
  const cp = currentPage.value
  
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 3) pages.push('...')
    for (let i = Math.max(2, cp - 1); i <= Math.min(tp - 1, cp + 1); i++) {
      pages.push(i)
    }
    if (cp < tp - 2) pages.push('...')
    pages.push(tp)
  }
  return pages
})

onMounted(() => {
  loadList()
})

const loadList = async (page = 1) => {
  loading.value = true
  try {
    const params = { page, size: pageSize }
    if (searchKey.value.trim()) params.title = searchKey.value.trim()
    if (statusFilter.value !== '') params.videoStatus = statusFilter.value
    
    const res = await getMyContributions(params)
    list.value = res?.records || []
    total.value = res?.total || 0
    currentPage.value = page
  } catch (e) {
    console.error('获取稿件列表失败:', e)
    list.value = []
  } finally {
    loading.value = false
  }
}

const search = () => {
  loadList(1)
}

const clearSearch = () => {
  searchKey.value = ''
  loadList(1)
}

const filterByStatus = (status) => {
  statusFilter.value = status
  loadList(1)
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    loadList(page)
  }
}

const goToVideo = (item) => {
  if (item.playLink) {
    router.push(item.playLink)
  }
}

const getStatusClass = (status) => {
  const s = Number(status)
  const map = { 0: 'draft', 1: 'pending', 2: 'published', 3: 'offline' }
  return map[s] || 'draft'
}

const getStatusText = (status) => {
  const s = Number(status)
  const map = { 0: '草稿', 1: '待发布', 2: '已发布', 3: '已下架' }
  return map[s] || '未知'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

defineExpose({ loadList })
</script>

<style scoped>
.contribution-list {
  animation: fadeIn 0.4s ease;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.list-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg2);
  border: 1.5px solid var(--line_regular);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: var(--brand_pink);
  box-shadow: 0 0 0 3px rgba(255, 102, 153, 0.1);
}

.search-box svg {
  color: var(--text4);
  flex-shrink: 0;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: var(--text1);
  width: 180px;
}

.search-box input::placeholder {
  color: var(--text4);
}

.search-clear {
  cursor: pointer;
  color: var(--text4);
  transition: color 0.2s;
}

.search-clear:hover {
  color: var(--text2);
}

.filter-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg2);
  border-radius: 8px;
}

.filter-tab {
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: var(--text3);
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  color: var(--text1);
}

.filter-tab.active {
  background: var(--bg1);
  color: var(--brand_pink);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.list-stats {
  font-size: 13px;
  color: var(--text3);
}

.list-stats strong {
  color: var(--brand_pink);
  font-weight: 600;
}

.contributions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.contribution-card {
  background: var(--bg1);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.contribution-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-cover {
  position: relative;
  padding-top: 56.25%;
  cursor: pointer;
  overflow: hidden;
}

.card-cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.contribution-card:hover .card-cover img {
  transform: scale(1.05);
}

.cover-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
}

.cover-hover {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.contribution-card:hover .cover-hover {
  opacity: 1;
}

.card-body {
  padding: 14px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
  cursor: pointer;
  transition: color 0.2s;
}

.card-title:hover {
  color: var(--brand_pink);
}

.card-meta {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.status-tag.draft {
  background: var(--bg3);
  color: var(--text3);
}

.status-tag.pending {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.status-tag.published {
  background: rgba(0, 181, 120, 0.1);
  color: #00b578;
}

.status-tag.offline {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.ongoing-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: var(--bg3);
  color: var(--text3);
}

.ongoing-tag.active {
  background: rgba(0, 174, 236, 0.1);
  color: var(--brand_blue);
}

.card-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text3);
}

.stat-item svg {
  opacity: 0.6;
}

.card-time {
  font-size: 12px;
  color: var(--text4);
  margin-bottom: 10px;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  background: var(--bg2);
  color: var(--text2);
  font-size: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-link:hover {
  background: var(--bg3);
  color: var(--brand_pink);
}

.action-link--danger:hover {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text4);
}

.empty-state p {
  font-size: 16px;
  margin: 16px 0 8px;
  color: var(--text3);
}

.empty-state span {
  font-size: 13px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--line_regular);
  background: var(--bg1);
  color: var(--text2);
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--brand_pink);
  color: var(--brand_pink);
}

.page-btn.active {
  background: var(--brand_pink);
  border-color: var(--brand_pink);
  color: #fff;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-ellipsis {
  color: var(--text4);
  padding: 0 4px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--line_light);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .contributions-grid {
    grid-template-columns: 1fr;
  }
  
  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .list-filters {
    width: 100%;
  }
  
  .search-box {
    flex: 1;
  }
  
  .search-box input {
    width: 100%;
  }
}
</style>
