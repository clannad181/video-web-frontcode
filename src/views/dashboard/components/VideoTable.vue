<template>
  <div class="video-table-card">
    <div class="table-header">
      <span class="table-title">{{ $t('视频管理') }}</span>
      <div class="filter-capsules">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-capsule"
          :class="{ active: currentFilter === f.value }"
          @click="currentFilter = f.value"
        >
          {{ $t(f.label) }}
        </button>
      </div>
    </div>
    <div class="table-wrapper">
      <table class="video-table">
        <thead>
          <tr>
            <th>{{ $t('视频') }}</th>
            <th>{{ $t('UP 主') }}</th>
            <th>{{ $t('分类') }}</th>
            <th>{{ $t('播放量') }}</th>
            <th>{{ $t('收藏数') }}</th>
            <th>{{ $t('集数') }}</th>
            <th>{{ $t('状态') }}</th>
            <th>{{ $t('上传时间') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in list" :key="row.id" class="table-row">
            <td>
              <div class="cell-video">
                <div class="video-thumb" :style="{ backgroundImage: `url(${resUrl(row.coverUrl)})` }" />
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
                  :src="resUrl(row.avatarUrl)"
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
                {{ $t(statusText(row.videoStatus)) }}
              </span>
            </td>
            <td class="cell-time">{{ formatTime(row.createTime) }}</td>
          </tr>
          <tr v-if="!list.length">
            <td colspan="8" class="cell-empty">{{ $t('暂无数据') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="table-footer">
      <span class="total-text">{{ $t('共 {total} 个视频', { total }) }}</span>
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
import { useI18n } from 'vue-i18n'
import { resUrl } from '@/utils/resUrl'

const { t, locale } = useI18n()

const props = defineProps({
  data: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['page-change', 'filter-change'])

const filters = [
  { label: '全部', value: '' }, // i18n-key
  { label: '已发布', value: 2 }, // i18n-key
  { label: '审核中', value: 1 }, // i18n-key
  { label: '草稿', value: 0 } // i18n-key
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
  if (n >= 10000) {
    return locale.value === 'zh-cn' ? (n / 10000).toFixed(1) + t('万') : Math.round(n / 1000) + 'K'
  }
  return n.toLocaleString()
}

function formatTime(time) {
  if (!time) return '-'
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function statusText(s) {
  return { 2: '已发布', 1: '审核中', 0: '草稿', 3: '已下架' }[s] || '未知' // i18n-key
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
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-color, #f0f2f5);
}
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.table-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #303133);
  position: relative;
  padding-left: 14px;
}
.filter-capsules {
  display: flex;
  gap: 6px;
  background: var(--bg-color, #f5f7fa);
  padding: 4px;
  border-radius: 10px;
}
.filter-capsule {
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #909399);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
}
.filter-capsule.active {
  background: var(--card-bg, #fff);
  color: var(--color-primary, #fb7299);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.filter-capsule:hover:not(.active) {
  color: var(--text-primary, #303133);
}
.table-wrapper {
  overflow-x: auto;
  margin: 0 -4px;
  padding: 0 4px;
}
.video-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}
.video-table th {
  text-align: center;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #909399);
  background: var(--bg-color, #f5f7fa);
  border-bottom: 1px solid var(--border-color, #ebeef5);
  white-space: nowrap;
}
.video-table th:first-child {
  border-radius: 8px 0 0 8px;
}
.video-table th:last-child {
  border-radius: 0 8px 8px 0;
}
.video-table th:first-child,
.video-table td:first-child {
  text-align: left;
}
.video-table td {
  padding: 14px;
  color: var(--text-primary, #303133);
  border-bottom: 1px solid var(--border-color, #f0f2f5);
  vertical-align: middle;
  text-align: center;
}
.table-row {
  transition: all 0.2s;
}
.table-row:hover {
  background: linear-gradient(90deg, rgba(251, 114, 153, 0.03), rgba(124, 92, 252, 0.03));
}
.table-row:hover .video-thumb {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
.cell-video {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
}
.video-thumb {
  width: 72px;
  height: 40px;
  border-radius: 8px;
  background: #e4e7ed;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  transition: all 0.25s;
  border: 2px solid transparent;
}
.table-row:hover .video-thumb {
  border-color: var(--color-primary, #fb7299);
}
.video-info {
  min-width: 0;
}
.video-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
  font-size: 14px;
  color: var(--text-primary, #303133);
}
.video-id {
  font-size: 12px;
  color: var(--text-secondary, #c0c4cc);
  margin-top: 2px;
}
.cell-user {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.user-avatar-img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--border-color, #f0f2f5);
}
.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}
.user-name {
  font-size: 14px;
  color: var(--text-primary, #303133);
  font-weight: 500;
}
.cell-num {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  color: var(--text-primary, #303133);
}
.cell-time {
  white-space: nowrap;
  color: var(--text-secondary, #909399);
  font-size: 13px;
}
.cell-empty {
  text-align: center;
  color: var(--text-secondary, #c0c4cc);
  padding: 48px 0;
  font-size: 14px;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}
.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
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
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color, #f0f2f5);
  flex-wrap: wrap;
  gap: 12px;
}
.total-text {
  font-size: 13px;
  color: var(--text-secondary, #909399);
}
.pagination {
  display: flex;
  gap: 4px;
}
.page-btn {
  min-width: 34px;
  height: 34px;
  border: 1px solid var(--border-color, #e4e7ed);
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary, #606266);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-btn:hover:not(:disabled):not(.active) {
  border-color: var(--color-primary, #fb7299);
  color: var(--color-primary, #fb7299);
  background: color-mix(in srgb, #fb7299 5%, transparent);
}
.page-btn.active {
  background: linear-gradient(135deg, #fb7299, #7c5cfc);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(251, 114, 153, 0.3);
}
.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
