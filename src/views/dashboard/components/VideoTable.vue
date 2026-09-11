<template>
  <div class="video-table-card">
    <div class="table-header">
      <span class="table-title">视频管理</span>
      <div class="filter-capsules">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-capsule"
          :class="{ active: currentFilter === f.value }"
          @click="currentFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>
    <div class="table-wrapper">
      <table class="video-table">
        <thead>
          <tr>
            <th>视频</th>
            <th>UP 主</th>
            <th>分类</th>
            <th>播放量</th>
            <th>收藏数</th>
            <th>集数</th>
            <th>状态</th>
            <th>上传时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in list" :key="row.id" class="table-row">
            <td>
              <div class="cell-video">
                <div class="video-thumb" :style="{ backgroundImage: `url(${fileBaseUrl}${row.coverUrl})` }" />
                <div class="video-info">
                  <div class="video-title">{{ row.title }}</div>
                  <div class="video-id">AVID: {{ row.avid }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="cell-user">
                <img
                  v-if="row.avatarUrl"
                  :src="fileBaseUrl + row.avatarUrl"
                  class="user-avatar-img"
                  @error="e => e.target.style.display='none'"
                />
                <div v-else class="user-avatar" :style="{ background: hashColor(row.nickName) }">
                  {{ (row.nickName || 'U')[0].toUpperCase() }}
                </div>
                <span class="user-name">{{ row.nickName }}</span>
              </div>
            </td>
            <td>{{ row.categoryName || '-' }}</td>
            <td class="cell-num">{{ formatNum(row.playCount) }}</td>
            <td class="cell-num">{{ formatNum(row.favoriteCount) }}</td>
            <td>{{ row.episodeCount || '-' }}</td>
            <td>
              <span class="status-badge" :class="statusClass(row.videoStatus)">
                {{ statusText(row.videoStatus) }}
              </span>
            </td>
            <td class="cell-time">{{ formatTime(row.createTime) }}</td>
          </tr>
          <tr v-if="!list.length">
            <td colspan="8" class="cell-empty">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="table-footer">
      <span class="total-text">共 {{ total }} 个视频</span>
      <div class="pagination">
        <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">«</button>
        <button
          v-for="p in visiblePages"
          :key="p"
          class="page-btn"
          :class="{ active: p === page }"
          @click="changePage(p)"
        >{{ p }}</button>
        <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">»</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || ''

const props = defineProps({
  data: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['page-change', 'filter-change'])

const filters = [
  { label: '全部', value: '' },
  { label: '已发布', value: 2 },
  { label: '审核中', value: 1 },
  { label: '草稿', value: 0 }
]

const currentFilter = ref('')
const page = ref(1)
const pageSize = 6

const list = computed(() => props.data)
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / pageSize)))

const visiblePages = computed(() => {
  const total = totalPages.value
  const cur = page.value
  const pages = []
  let start = Math.max(1, cur - 2)
  let end = Math.min(total, start + 4)
  start = Math.max(1, end - 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function changePage(p) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  emit('page-change', { page: p, size: pageSize, videoStatus: currentFilter.value })
}

function formatNum(n) {
  if (n === undefined || n === null) return '0'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}

function formatTime(t) {
  if (!t) return '-'
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function statusText(s) {
  return { 2: '已发布', 1: '审核中', 0: '草稿', 3: '已下架' }[s] || '未知'
}

function statusClass(s) {
  return { 2: 'published', 1: 'reviewing', 0: 'draft', 3: 'offline' }[s] || ''
}

function hashColor(str) {
  if (!str) return '#ccc'
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 55%, 65%)`
}

watch(currentFilter, (v) => {
  page.value = 1
  emit('filter-change', v)
  emit('page-change', { page: 1, size: pageSize, videoStatus: v })
})
</script>

<style scoped>
.video-table-card {
  background: var(--card-bg, #fff);
  border-radius: var(--radius-lg, 16px);
  padding: 20px;
}
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.table-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}
.filter-capsules {
  display: flex;
  gap: 8px;
}
.filter-capsule {
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid var(--border-color, #e4e7ed);
  background: transparent;
  color: var(--text-secondary, #909399);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-capsule.active {
  background: var(--color-primary, #fb7299);
  color: #fff;
  border-color: var(--color-primary, #fb7299);
}
.filter-capsule:hover:not(.active) {
  border-color: var(--color-primary, #fb7299);
  color: var(--color-primary, #fb7299);
}
.table-wrapper {
  overflow-x: auto;
}
.video-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.video-table th {
  text-align: center;
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary, #909399);
  border-bottom: 1px solid var(--border-color, #ebeef5);
  white-space: nowrap;
}
.video-table th:first-child,
.video-table td:first-child {
  text-align: left;
}
.video-table td {
  padding: 12px;
  color: var(--text-primary, #303133);
  border-bottom: 1px solid var(--border-color, #f0f2f5);
  vertical-align: middle;
  text-align: center;
}
.table-row {
  transition: background 0.15s;
}
.table-row:hover {
  background: var(--bg-hover, #f5f7fa);
}
.table-row:hover .video-thumb {
  transform: scale(1.1);
}
.cell-video {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
}
.video-thumb {
  width: 64px;
  height: 36px;
  border-radius: 6px;
  background: #e4e7ed;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.video-info {
  min-width: 0;
}
.video-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}
.video-id {
  font-size: 11px;
  color: var(--text-secondary, #c0c4cc);
}
.cell-user {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.user-avatar-img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}
.user-name {
  font-size: 13px;
  color: var(--text-primary, #303133);
}
.cell-num {
  font-variant-numeric: tabular-nums;
}
.cell-time {
  white-space: nowrap;
  color: var(--text-secondary, #909399);
  font-size: 12px;
}
.cell-empty {
  text-align: center;
  color: var(--text-secondary, #c0c4cc);
  padding: 40px 0;
}
.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
}
.status-badge.published {
  color: #67c23a;
  background: color-mix(in srgb, #67c23a 10%, transparent);
}
.status-badge.reviewing {
  color: #00a1d6;
  background: color-mix(in srgb, #00a1d6 10%, transparent);
}
.status-badge.draft {
  color: #9498a8;
  background: color-mix(in srgb, #9498a8 10%, transparent);
}
.status-badge.offline {
  color: #f56c6c;
  background: color-mix(in srgb, #f56c6c 10%, transparent);
}
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.total-text {
  font-size: 12px;
  color: var(--text-secondary, #909399);
}
.pagination {
  display: flex;
  gap: 4px;
}
.page-btn {
  min-width: 32px;
  height: 32px;
  border: 1px solid var(--border-color, #e4e7ed);
  border-radius: 6px;
  background: transparent;
  color: var(--text-primary, #606266);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-btn:hover:not(:disabled):not(.active) {
  border-color: var(--color-primary, #fb7299);
  color: var(--color-primary, #fb7299);
}
.page-btn.active {
  background: var(--color-primary, #fb7299);
  color: #fff;
  border-color: var(--color-primary, #fb7299);
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
