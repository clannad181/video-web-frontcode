<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">评论管理</h1>
      <p class="page-subtitle">管理用户评论与互动内容</p>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">内容关键词</label>
          <input v-model="query.keyword" class="filter-input" placeholder="搜索评论内容" @keyup.enter="search" />
        </div>
        <div class="filter-item">
          <label class="filter-label">评论者昵称</label>
          <input v-model="query.nickName" class="filter-input" placeholder="搜索评论者昵称" @keyup.enter="search" />
        </div>
        <div class="filter-item">
          <label class="filter-label">视频ID</label>
          <input v-model="query.videoId" class="filter-input" placeholder="输入视频ID" @keyup.enter="search" />
        </div>
        <div class="filter-item">
          <label class="filter-label">状态</label>
          <div class="select-wrap" :class="{ open: statusOpen }">
            <select v-model="query.status" class="filter-select" @mousedown="statusOpen = true" @blur="statusOpen = false">
              <option value="">全部</option>
              <option :value="0">正常</option>
              <option :value="1">用户删除</option>
              <option :value="2">运营屏蔽</option>
              <option :value="3">待审核</option>
            </select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">开始时间</label>
          <input v-model="query.startTime" type="datetime-local" class="filter-input" />
        </div>
        <div class="filter-item">
          <label class="filter-label">结束时间</label>
          <input v-model="query.endTime" type="datetime-local" class="filter-input" />
        </div>
      </div>
      <div class="filter-actions">
        <button class="btn btn-secondary" @click="resetQuery">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          重置
        </button>
        <button class="btn btn-primary" @click="search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          搜索
        </button>
      </div>
      <div v-if="selectedIds.length > 0" class="filter-bottom">
        <span class="selected-count">已选择 {{ selectedIds.length }} 条</span>
        <button class="btn btn-danger" @click="handleBatchDelete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
          批量删除
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-scroll-wrapper" v-loading="loading">
        <table class="data-table">
          <thead>
            <tr>
              <th class="checkbox-col">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
              </th>
              <th class="col-index">#</th>
              <th>评论内容</th>
              <th>评论用户</th>
              <th>视频信息</th>
              <th>点赞数</th>
              <th>回复数</th>
              <th>状态</th>
              <th>评论时间</th>
              <th class="sticky-col">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="records.length === 0 && !loading">
              <td colspan="10" class="empty-row">暂无数据</td>
            </tr>
            <tr v-for="(row, idx) in records" :key="row.id" class="table-row">
              <td class="checkbox-col">
                <input type="checkbox" :checked="selectedIds.includes(row.id)" @change="toggleSelect(row.id)" />
              </td>
              <td class="col-index">{{ (query.page - 1) * query.size + idx + 1 }}</td>
              <td class="comment-content" :title="row.content">{{ row.content }}</td>
              <td>
                <div class="user-cell">
                  <div class="user-avatar" v-if="row.avatar">
                    <img :src="fileBaseUrl + row.avatar" alt="" />
                  </div>
                  <div class="user-avatar user-avatar-placeholder" v-else>
                    {{ (row.nickName || row.username || 'A')[0].toUpperCase() }}
                  </div>
                  <span class="user-name">{{ row.nickName || row.username }}</span>
                </div>
              </td>
              <td>
                <div class="video-cell" @click="openVideoDetail(row)">
                  <img v-if="getVideoCover(row)" :src="getVideoCover(row)" class="video-cover-thumb" />
                  <div v-else class="video-cover-thumb video-cover-empty"></div>
                  <span class="video-title-text" :title="row.videoTitle">{{ row.videoTitle }}</span>
                </div>
              </td>
              <td class="cell-center">{{ row.likeCount || 0 }}</td>
              <td class="cell-center">{{ row.replyCount || 0 }}</td>
              <td>
                <span class="status-badge" :class="statusClass(row.status)">{{ statusText(row.status) }}</span>
              </td>
              <td class="cell-muted">{{ row.createTime }}</td>
              <td class="sticky-col">
                <div class="action-group">
                  <button class="btn-action btn-detail" @click="openDetail(row)">详情</button>
                  <button
                    v-if="row.status === 2"
                    class="btn-action btn-recover"
                    @click="handleToggleStatus(row)"
                  >恢复</button>
                  <button
                    v-else
                    class="btn-action btn-block"
                    @click="handleToggleStatus(row)"
                  >屏蔽</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="total > 0" class="pagination-wrap">
        <div class="page-info">共 {{ total }} 条</div>
        <div class="page-btns">
          <button class="pg-btn" :disabled="query.page <= 1" @click="goPage(query.page - 1)">&#8249;</button>
          <template v-for="p in pageNumbers" :key="p">
            <span v-if="p === '...'" class="pg-ellipsis">...</span>
            <button v-else class="pg-btn" :class="{ active: p === query.page }" @click="goPage(p)">{{ p }}</button>
          </template>
          <button class="pg-btn" :disabled="query.page >= totalPages" @click="goPage(query.page + 1)">&#8250;</button>
        </div>
        <select v-model.number="query.size" class="page-size-sel" @change="onPageSizeChange">
          <option :value="10">10 条/页</option>
          <option :value="20">20 条/页</option>
          <option :value="50">50 条/页</option>
        </select>
      </div>
    </div>

    <!-- 评论详情弹窗 -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
          <div class="modal-card detail-modal" @click.stop>
            <div class="modal-header">
              <h3>评论详情</h3>
              <button class="modal-close" @click="showDetailModal = false">&times;</button>
            </div>
            <div class="modal-body" v-loading="detailLoading">
              <!-- 视频信息卡片 -->
              <div v-if="detailData.rootComment" class="detail-video-card" @click="openVideoDetail(detailData.rootComment)">
                <div class="video-cover-wrap">
                  <img v-if="detailData.rootComment.videoCover" :src="detailData.rootComment.videoCover" class="detail-video-cover" />
                  <div v-else class="detail-video-cover detail-video-cover-empty">
                    <span class="cover-play-icon">▶</span>
                  </div>
                  <div class="cover-play-badge">▶</div>
                </div>
                <div class="video-info-text">
                  <div class="detail-video-title">{{ detailData.rootComment.videoTitle }}</div>
                  <div class="video-link-hint">点击查看详情 ›</div>
                </div>
              </div>

              <!-- 评论树 -->
              <div v-if="detailData.rootComment" class="comment-tree">
                <div class="tree-label">评论上下文</div>
                <comment-node
                  :comment="detailData.rootComment"
                  :target-id="detailData.targetId"
                  :depth="0"
                  :file-base-url="fileBaseUrl"
                  :status-class="statusClass"
                  :status-text="statusText"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showDetailModal = false">关闭</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- 视频详情弹窗 -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showVideoModal" class="modal-overlay" @click.self="showVideoModal = false">
          <div class="modal-card video-modal" @click.stop>
            <div class="modal-header">
              <h3>视频详情</h3>
              <button class="modal-close" @click="showVideoModal = false">&times;</button>
            </div>
            <div class="modal-body video-modal-body">
              <div class="video-player-wrap">
                <div v-if="videoUrl" class="video-player-container">
                  <video ref="videoRef" :src="videoUrl" controls class="video-player"></video>
                </div>
                <div v-else class="video-player-placeholder">暂无播放源</div>
              </div>
              <div class="video-info-panel">
                <h2 class="video-detail-title">{{ videoInfo.title }}</h2>
                <div class="video-author">
                  <div class="author-avatar" v-if="videoInfo.avatarUrl">
                    <img :src="fileBaseUrl + videoInfo.avatarUrl" alt="" />
                  </div>
                  <div class="author-avatar author-avatar-placeholder" v-else>
                    {{ (videoInfo.nickName || 'U')[0].toUpperCase() }}
                  </div>
                  <div class="author-info">
                    <span class="author-name">{{ videoInfo.nickName }}</span>
                    <span class="author-uid">UID: {{ videoInfo.uid }}</span>
                  </div>
                </div>
                <div class="video-desc">{{ videoInfo.description || '暂无简介' }}</div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showVideoModal = false">关闭</button>
              <button class="btn btn-primary" @click="goToVideoManage">前往视频管理</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCommentList, getCommentDetail, batchDeleteComments, toggleCommentStatus, getVideoDetail } from '@/api/comment'

const router = useRouter()
const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || ''

const loading = ref(false)
const records = ref([])
const total = ref(0)
const selectedIds = ref([])
const statusOpen = ref(false)

function getVideoCover(row) {
  return row.coverUrl || row.videoCover || row.cover || ''
}

const query = reactive({
  keyword: '', nickName: '', videoId: '', status: '',
  startTime: '', endTime: '', page: 1, size: 10
})

// --- 状态映射 ---
function statusClass(s) {
  return { 0: 'badge-success', 1: 'badge-info', 2: 'badge-danger', 3: 'badge-pending' }[s] || ''
}
function statusText(s) {
  return { 0: '正常', 1: '用户删除', 2: '运营屏蔽', 3: '待审核' }[s] || '未知'
}

// --- 分页 ---
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / query.size)))
const pageNumbers = computed(() => {
  const pages = []
  const tp = totalPages.value
  const cp = query.page
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 4) pages.push('...')
    const start = Math.max(2, cp - 2)
    const end = Math.min(tp - 1, cp + 2)
    for (let i = start; i <= end; i++) pages.push(i)
    if (cp < tp - 3) pages.push('...')
    pages.push(tp)
  }
  return pages
})
function goPage(p) { query.page = p; fetchData() }
function onPageSizeChange() { query.page = 1; fetchData() }

// --- 选择 ---
const isAllSelected = computed(() => {
  if (records.value.length === 0) return false
  return records.value.every(r => selectedIds.value.includes(r.id))
})
function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = records.value.map(r => r.id)
  }
}
function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

// --- 筛选 ---
function search() { query.page = 1; selectedIds.value = []; fetchData() }
function resetQuery() {
  query.keyword = ''; query.nickName = ''; query.videoId = ''; query.status = ''
  query.startTime = ''; query.endTime = ''; query.page = 1
  selectedIds.value = []
  fetchData()
}

// --- 数据加载 ---
function formatDateTime(val) {
  if (!val) return ''
  // datetime-local returns "yyyy-MM-ddTHH:mm", need "yyyy-MM-dd HH:mm:ss"
  return val.replace('T', ' ') + ':00'
}

async function fetchData() {
  loading.value = true
  try {
    const params = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    if (query.nickName) params.nickName = query.nickName
    if (query.videoId) params.videoId = query.videoId
    if (query.status !== '') params.status = query.status
    if (query.startTime) params.startTime = formatDateTime(query.startTime)
    if (query.endTime) params.endTime = formatDateTime(query.endTime)
    const res = await getCommentList(params)
    records.value = res.data?.records || []
    total.value = res.data?.total ?? 0
    selectedIds.value = []
  } catch (e) {
    console.error('加载评论失败', e)
  } finally {
    loading.value = false
  }
}

// --- 批量删除 ---
async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条评论吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await batchDeleteComments(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error('批量删除失败', e)
  }
}

// --- 屏蔽/恢复 ---
async function handleToggleStatus(row) {
  const isBlock = row.status !== 2
  const title = isBlock ? '屏蔽' : '恢复'
  const type = isBlock ? 'warning' : 'info'
  const msg = isBlock ? '确定要屏蔽该评论吗？' : '确定要恢复该评论吗？'
  try {
    await ElMessageBox.confirm(msg, title, { confirmButtonText: '确定', cancelButtonText: '取消', type })
    await toggleCommentStatus(row.id)
    ElMessage.success(`${title}成功`)
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error(`${title}失败`, e)
  }
}

// --- 评论详情 ---
const showDetailModal = ref(false)
const detailLoading = ref(false)
const detailData = ref({ targetId: null, rootComment: null })

async function openDetail(row) {
  showDetailModal.value = true
  detailLoading.value = true
  try {
    const res = await getCommentDetail(row.id)
    detailData.value = res.data || { targetId: row.id, rootComment: null }
  } catch (e) {
    console.error('加载评论详情失败', e)
    // fallback to list row data
    detailData.value = {
      targetId: row.id,
      rootComment: {
        id: row.id,
        userId: row.userId,
        nickName: row.nickName || row.username,
        avatar: row.avatar,
        content: row.content,
        likeCount: row.likeCount,
        replyCount: row.replyCount,
        status: row.status,
        createTime: row.createTime,
        videoTitle: row.videoTitle,
        videoCover: getVideoCover(row),
        replies: []
      }
    }
  } finally {
    detailLoading.value = false
  }
}

function isTargetComment(comment) {
  return comment.id === detailData.value.targetId
}

// --- 视频详情 ---
const showVideoModal = ref(false)
const videoInfo = ref({})
const videoUrl = ref('')
const videoRef = ref(null)

async function openVideoDetail(row) {
  if (!row.videoId) return
  try {
    const res = await getVideoDetail(row.videoId)
    const data = res.data
    videoInfo.value = data
    const episodes = data.episodes || []
    if (episodes.length > 0) {
      episodes.sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id))
      videoUrl.value = episodes[0].playUrl
    } else {
      videoUrl.value = data.videoUrl || ''
    }
    showDetailModal.value = false
    showVideoModal.value = true
  } catch (e) {
    ElMessage.error('加载视频信息失败')
    console.error('加载视频详情失败', e)
  }
}

function goToVideoManage() {
  const id = videoInfo.value.id
  showVideoModal.value = false
  showDetailModal.value = false
  router.push(`/video-manage?videoId=${id}`)
}

onMounted(fetchData)
</script>

<style lang="scss" scoped>
/* ---- Page Container ---- */
.page-container { padding: 0; }

/* ---- Page Header ---- */
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--el-text-color-primary, #303133); margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: var(--el-text-color-secondary, #909399); margin: 0; }

/* ---- Filter Card ---- */
.filter-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid var(--border-color, #e4e7ed);
}
.filter-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
.filter-item { display: flex; flex-direction: column; gap: 6px; }
.filter-label { font-size: 12px; color: var(--text-secondary, #909399); font-weight: 500; }
.filter-input,
.filter-select {
  height: 40px; border-radius: 12px; border: none; padding: 0 14px; font-size: 13px;
  background-color: var(--bg-color, #f5f7fa); outline: none; transition: all 0.2s;
  color: var(--text-primary, #303133); box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
  &:focus { background-color: var(--card-bg, #fff); box-shadow: 0 0 0 2px rgba(251,114,153,0.25); }
}
.filter-select {
  cursor: pointer; appearance: none; padding-right: 32px;
  background-color: var(--bg-color, #f5f7fa); box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
  &:focus { background-color: var(--card-bg, #fff); box-shadow: 0 0 0 2px rgba(251,114,153,0.25); }
}
.select-wrap {
  position: relative;
  .filter-select { width: 100%; }
  &::after {
    content: ''; position: absolute; right: 12px; top: 50%; width: 0; height: 0;
    border-left: 4.5px solid transparent; border-right: 4.5px solid transparent;
    border-top: 5.5px solid var(--text-secondary, #909399); pointer-events: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); transform: translateY(-60%);
  }
  &:hover::after { border-top-color: var(--color-primary, #fb7299); }
  &.open::after { border-top-color: var(--color-primary, #fb7299); transform: translateY(-40%) rotate(180deg); }
}
.filter-actions { display: flex; align-items: flex-end; gap: 10px; justify-content: flex-end; }
.filter-bottom {
  display: flex; align-items: center; justify-content: flex-end; gap: 12px;
  margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border-color, #e4e7ed);
}
.selected-count { font-size: 13px; color: var(--text-secondary, #909399); }

/* ---- Buttons ---- */
.btn {
  height: 36px; padding: 0 22px; border-radius: 8px; font-size: 13px; font-weight: 500;
  cursor: pointer; border: 1px solid transparent; transition: all 0.25s ease;
  display: inline-flex; align-items: center; gap: 6px; svg { flex-shrink: 0; }
  &.btn-primary {
    background: linear-gradient(135deg, var(--color-primary, #fb7299) 0%, #ff9ac6 100%);
    color: #fff; box-shadow: 0 2px 8px rgba(251,114,153,0.25);
    &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(251,114,153,0.4); }
    &:active { transform: translateY(0); }
  }
  &.btn-secondary {
    background: var(--bg-color, #f5f7fa); color: var(--text-primary, #303133);
    border-color: var(--border-color, #dcdfe6); &:hover { background: var(--border-color, #ebedf0); }
  }
  &.btn-danger {
    background: rgba(245,108,108,0.08); color: #f56c6c; border-color: rgba(245,108,108,0.3);
    &:hover { background: #f56c6c; color: #fff; }
  }
}

/* ---- Table Card ---- */
.table-card {
  background: var(--card-bg, #fff); border-radius: 12px;
  border: 1px solid var(--border-color, #e4e7ed); overflow: hidden;
}
.table-scroll-wrapper {
  overflow-x: auto;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { border-radius: 3px; background: rgba(0,0,0,0.15); }
}
.data-table {
  width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; min-width: 1100px;
  th {
    padding: 14px 16px; text-align: center; font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.5px; color: var(--text-secondary, #909399); background: var(--bg-color, #f8f9fc);
    font-weight: 600; white-space: nowrap; border-bottom: 2px solid var(--border-color, #e4e7ed);
    user-select: none; position: sticky; top: 0; z-index: 1;
  }
  td {
    padding: 14px 16px; border-bottom: 1px solid var(--border-color, #f2f3f5);
    vertical-align: middle; background: var(--card-bg, #fff); text-align: center;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .table-row:hover td { background: var(--bg-color, #fafafa); }
}
.checkbox-col { width: 40px; input[type="checkbox"] { accent-color: var(--color-primary, #fb7299); cursor: pointer; } }
.col-index { width: 50px; }
.comment-content { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; }
.cell-center { text-align: center; }
.cell-muted { color: var(--text-secondary, #909399); }

/* User cell */
.user-cell { display: flex; align-items: center; gap: 8px; justify-content: center; }
.user-avatar { width: 28px; height: 28px; border-radius: 50%; overflow: hidden; flex-shrink: 0; img { width: 100%; height: 100%; object-fit: cover; } }
.user-avatar-placeholder { display: flex; align-items: center; justify-content: center; background: rgba(251,114,153,0.1); color: var(--color-primary, #fb7299); font-size: 12px; font-weight: 600; }
.user-name { font-size: 13px; }

/* Video cell */
.video-cell { display: flex; align-items: center; gap: 8px; cursor: pointer; justify-content: center; &:hover .video-title-text { color: var(--color-primary, #fb7299); } }
.video-cover-thumb { width: 48px; height: 32px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
.video-cover-empty { background: var(--bg-color, #f5f7fa); }
.video-title-text { max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.2s; }

/* Badges */
.status-badge { display: inline-block; padding: 2px 10px; border-radius: 100px; font-size: 12px; font-weight: 500; }
.badge-success { color: #67c23a; background: rgba(103,194,58,0.1); }
.badge-info { color: #909399; background: rgba(144,147,153,0.08); }
.badge-danger { color: #f56c6c; background: rgba(245,108,108,0.1); }
.badge-pending { color: #e6a23c; background: rgba(230,162,60,0.1); }

/* Sticky Action Column */
.sticky-col {
  position: sticky; right: 0; z-index: 3; background: var(--card-bg, #fff);
  border-left: 1px solid var(--border-color, #e4e7ed); box-shadow: -2px 0 8px rgba(0,0,0,0.06);
}
.table-row:hover .sticky-col { background: var(--bg-color, #fafafa); }
.action-group { display: flex; gap: 6px; justify-content: center; white-space: nowrap; }
.btn-action { padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; }
.btn-detail { color: var(--color-primary, #fb7299); background: rgba(251,114,153,0.1); &:hover { color: #fff; background: var(--color-primary, #fb7299); } }
.btn-block { color: #f56c6c; background: rgba(245,108,108,0.1); &:hover { color: #fff; background: #f56c6c; } }
.btn-recover { color: #67c23a; background: rgba(103,194,58,0.1); &:hover { color: #fff; background: #67c23a; } }
.empty-row { padding: 40px; text-align: center; color: var(--text-secondary, #909399); }

/* ---- Pagination ---- */
.pagination-wrap { display: flex; align-items: center; justify-content: space-between; padding: 16px 10px; }
.page-info { font-size: 13px; color: var(--text-secondary, #909399); }
.page-btns { display: flex; gap: 4px; }
.pg-btn {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-color, #dcdfe6);
  background: var(--card-bg, #fff); color: var(--text-primary, #303133); font-size: 13px;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
  &:hover:not(:disabled) { border-color: var(--color-primary, #fb7299); color: var(--color-primary, #fb7299); }
  &.active { background: var(--color-primary, #fb7299); color: #fff; border-color: var(--color-primary, #fb7299); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}
.pg-ellipsis { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--text-secondary, #909399); }
.page-size-sel { height: 32px; border-radius: 8px; border: 1px solid var(--border-color, #dcdfe6); padding: 0 8px; font-size: 12px; background: var(--card-bg, #fff); color: var(--text-primary, #303133); cursor: pointer; }

/* ---- Modals ---- */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal-card {
  background: var(--card-bg, #fff); border-radius: 16px; box-shadow: 0 24px 80px rgba(0,0,0,0.18);
  max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;
}
.detail-modal { width: 520px; }
.video-modal { width: 800px; }
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 28px 16px; flex-shrink: 0;
  h3 { margin: 0; font-size: 17px; font-weight: 600; color: var(--text-primary, #303133); }
}
.modal-close {
  background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-secondary, #909399);
  padding: 0; line-height: 1; width: 30px; height: 30px; display: flex; align-items: center;
  justify-content: center; border-radius: 8px; transition: all 0.2s;
  &:hover { color: var(--text-primary, #303133); background: var(--bg-color, #f5f7fa); }
}
.modal-body { padding: 4px 28px 20px; overflow-y: auto; flex: 1; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 28px; border-top: 1px solid var(--border-color, #f2f3f5); flex-shrink: 0;
}

/* Detail modal */
.detail-modal .modal-body { padding: 24px 28px; }

.detail-user-section { display: flex; align-items: center; gap: 14px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color, #f2f3f5); }
.detail-avatar { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); img { width: 100%; height: 100%; object-fit: cover; } }
.detail-avatar-placeholder {
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(251,114,153,0.15), rgba(251,114,153,0.05));
  color: var(--color-primary, #fb7299); font-size: 18px; font-weight: 700;
  border: 2px solid rgba(251,114,153,0.2);
}
.detail-user-info { flex: 1; }
.detail-nickname { font-size: 15px; font-weight: 600; color: var(--text-primary, #303133); }
.detail-meta { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
.detail-time { font-size: 12px; color: var(--text-secondary, #909399); }

.detail-content-card {
  margin-top: 20px; padding: 16px; border-radius: 12px;
  background: var(--bg-color, #f9fafc); border: 1px solid var(--border-color, #f2f3f5);
}
.content-label {
  font-size: 11px; font-weight: 600; color: var(--text-secondary, #909399);
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;
}
.detail-content {
  font-size: 14px; line-height: 1.7; color: var(--text-primary, #303133);
  word-break: break-all; white-space: pre-wrap;
}
.detail-content-empty {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--text-secondary, #c0c4cc);
  padding: 12px 0;
}
.empty-icon { font-size: 16px; opacity: 0.6; }

.detail-video-card {
  display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
  padding: 10px 12px; border-radius: 8px;
  background: var(--bg-color, #f5f7fa); border: 1px solid var(--border-color, #e4e7ed);
  cursor: pointer; transition: all 0.2s ease;
  &:hover { border-color: var(--color-primary, #fb7299); }
}
.video-cover-wrap { position: relative; width: 64px; height: 42px; border-radius: 6px; overflow: hidden; flex-shrink: 0; }
.detail-video-cover { width: 100%; height: 100%; object-fit: cover; }
.detail-video-cover-empty {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #e8e8e8, #f5f5f5);
}
.cover-play-icon { font-size: 16px; color: #ccc; }
.cover-play-badge {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.3); color: #fff; font-size: 14px; opacity: 0;
  transition: opacity 0.2s;
  .detail-video-card:hover & { opacity: 1; }
}
.video-info-text { flex: 1; min-width: 0; }
.detail-video-title {
  font-size: 13px; font-weight: 500; color: var(--text-primary, #303133);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  transition: color 0.2s;
  .detail-video-card:hover & { color: var(--color-primary, #fb7299); }
}
.video-link-hint { font-size: 11px; color: var(--text-secondary, #909399); margin-top: 4px; }

.detail-stats-row {
  display: flex; align-items: center; gap: 20px; margin-top: 16px;
  padding-top: 16px; border-top: 1px solid var(--border-color, #f2f3f5);
}
.stat-inline {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 13px; color: var(--text-secondary, #909399);
}
.stat-inline .stat-icon { font-size: 13px; }
.stat-reply {
  flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* Video modal */
.video-modal-body { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.video-player-wrap { aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; background: #000; }
.video-player { width: 100%; height: 100%; object-fit: contain; }
.video-player-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-secondary, #909399); font-size: 14px; }
.video-info-panel { display: flex; flex-direction: column; gap: 16px; }
.video-detail-title { font-size: 18px; font-weight: 600; color: var(--text-primary, #303133); margin: 0; }
.video-author { display: flex; align-items: center; gap: 10px; }
.author-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; flex-shrink: 0; img { width: 100%; height: 100%; object-fit: cover; } }
.author-avatar-placeholder { display: flex; align-items: center; justify-content: center; background: rgba(251,114,153,0.1); color: var(--color-primary, #fb7299); font-size: 13px; font-weight: 600; }
.author-info { display: flex; flex-direction: column; }
.author-name { font-size: 13px; font-weight: 500; color: var(--text-primary, #303133); }
.author-uid { font-size: 11px; color: var(--text-secondary, #909399); }
.video-desc { font-size: 13px; color: var(--text-secondary, #909399); line-height: 1.5; }

/* ---- Animations ---- */
.modal-fade-enter-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease; } }
.modal-fade-leave-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.15s ease, opacity 0.15s ease; } }
.modal-fade-enter-from { opacity: 0; .modal-card { transform: scale(0.9) translateY(16px); opacity: 0; } }
.modal-fade-leave-to { opacity: 0; .modal-card { transform: scale(0.95); opacity: 0; } }

/* ---- Dark Mode ---- */
html.dark-mode {
  .filter-card, .table-card { background: var(--card-bg); border-color: var(--border-color); }
  .data-table th { background: var(--bg-color); border-color: var(--border-color); color: var(--text-primary); }
  .data-table td { border-color: var(--border-color); color: var(--text-primary); }
  .data-table tbody tr:hover td { background: var(--hover-bg); }
  .filter-input, .filter-select { background: var(--bg-color); color: var(--text-primary); box-shadow: inset 0 1px 3px rgba(0,0,0,0.15); }
  .pg-btn { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .page-size-sel { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .modal-card { background: var(--card-bg); }
  .modal-header h3 { color: var(--text-primary); }
  .modal-footer { border-color: var(--border-color); }
  .sticky-col { background: var(--card-bg); }
  .table-row:hover .sticky-col { background: var(--hover-bg); }
  .detail-video-card { background: var(--bg-color); &:hover { background: var(--border-color); } }
}
</style>

<style lang="scss">
.tree-label {
  font-size: 11px; font-weight: 600; color: var(--text-secondary, #909399);
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;
}
.comment-node { margin-bottom: 2px; }
.comment-node-body {
  display: flex; gap: 10px; padding: 10px 12px; border-radius: 8px;
  transition: all 0.25s ease;
}
.comment-node-body.target-highlight {
  background: rgba(251,114,153,0.06);
  border-left: 3px solid var(--color-primary, #fb7299);
}
.comment-node-avatar {
  width: 28px; height: 28px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
  img { width: 100%; height: 100%; object-fit: cover; }
}
.comment-node-avatar-placeholder {
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(251,114,153,0.15), rgba(251,114,153,0.05));
  color: var(--color-primary, #fb7299); font-size: 11px; font-weight: 700;
}
.comment-node-content { flex: 1; min-width: 0; }
.comment-node-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; flex-wrap: wrap; }
.comment-node-name { font-size: 12px; font-weight: 600; color: var(--text-primary, #303133); }
.comment-node-time { font-size: 10px; color: var(--text-secondary, #909399); }
.comment-node-text { font-size: 12px; line-height: 1.5; color: var(--text-primary, #303133); word-break: break-all; }
.comment-node-text.empty { color: var(--text-secondary, #c0c4cc); font-style: italic; }
.comment-node-stats { display: flex; gap: 12px; margin-top: 4px; }
.comment-node-stat { font-size: 11px; color: var(--text-secondary, #909399); display: flex; align-items: center; gap: 2px; }
.comment-node-replies { margin-left: 18px; padding-left: 12px; border-left: 1px solid var(--border-color, #e4e7ed); }
</style>

<script>
import { defineComponent, h } from 'vue'

export default { name: 'CommentManage' }

export const CommentNode = defineComponent({
  name: 'CommentNode',
  props: {
    comment: Object,
    targetId: [Number, String],
    depth: { type: Number, default: 0 },
    fileBaseUrl: String,
    statusClass: Function,
    statusText: Function
  },
  setup(props) {
    return () => {
      const c = props.comment
      if (!c) return null
      const isTarget = c.id === props.targetId
      const replies = c.replies || []

      const avatarNode = c.avatar
        ? h('div', { class: 'comment-node-avatar' }, [h('img', { src: c.avatar, alt: '' })])
        : h('div', { class: 'comment-node-avatar comment-node-avatar-placeholder' }, (c.nickName || 'A')[0].toUpperCase())

      const headerNodes = [h('span', { class: 'comment-node-name' }, c.nickName || '匿名用户')]
      if (c.status !== undefined && c.status !== 0) {
        headerNodes.push(h('span', { class: `status-badge ${props.statusClass(c.status)}` }, props.statusText(c.status)))
      }
      headerNodes.push(h('span', { class: 'comment-node-time' }, c.createTime))

      const statsNodes = []
      if (c.likeCount !== undefined) {
        statsNodes.push(h('span', { class: 'comment-node-stat' }, [h('span', null, '♥'), ` ${c.likeCount || 0}`]))
      }
      if (c.replyCount !== undefined) {
        statsNodes.push(h('span', { class: 'comment-node-stat' }, [h('span', null, '💬'), ` ${c.replyCount || 0}`]))
      }

      const contentNode = c.content
        ? h('div', { class: 'comment-node-text' }, c.content)
        : h('div', { class: 'comment-node-text empty' }, '暂无评论内容')

      const bodyNode = h('div', { class: ['comment-node-body', { 'target-highlight': isTarget }] }, [
        avatarNode,
        h('div', { class: 'comment-node-content' }, [
          h('div', { class: 'comment-node-header' }, headerNodes),
          contentNode,
          statsNodes.length ? h('div', { class: 'comment-node-stats' }, statsNodes) : null
        ].filter(Boolean))
      ])

      const children = [bodyNode]
      if (replies.length > 0) {
        children.push(h('div', { class: 'comment-node-replies' },
          replies.map(reply => h(CommentNode, {
            comment: reply,
            targetId: props.targetId,
            depth: props.depth + 1,
            fileBaseUrl: props.fileBaseUrl,
            statusClass: props.statusClass,
            statusText: props.statusText,
            key: reply.id
          }))
        ))
      }
      return h('div', { class: 'comment-node' }, children)
    }
  }
})
</script>
