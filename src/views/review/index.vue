<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">内容审核</h2>
      <span class="page-sub">管理和审核平台内容，确保内容质量和合规性</span>
    </div>

    <div class="stats-row">
      <div class="stat-card stat-total">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <div class="stat-value">{{ pendingVideoCount + pendingCommentCount }}</div>
          <div class="stat-label">总待审核</div>
        </div>
      </div>
      <div class="stat-card stat-video">
        <div class="stat-icon">🎬</div>
        <div class="stat-info">
          <div class="stat-value">{{ pendingVideoCount }}</div>
          <div class="stat-label">待审核视频</div>
        </div>
      </div>
      <div class="stat-card stat-comment">
        <div class="stat-icon">💬</div>
        <div class="stat-info">
          <div class="stat-value">{{ pendingCommentCount }}</div>
          <div class="stat-label">待审核评论</div>
        </div>
      </div>
    </div>

    <div class="tab-bar">
      <div class="tab-track full-width">
        <div class="tab-slider" :style="{ transform: activeTab === 'video' ? 'translateX(0)' : 'translateX(100%)' }"></div>
        <button class="tab-item" :class="{ active: activeTab === 'video' }" @click="switchTab('video')">
          待审核视频<span class="tab-badge">{{ pendingVideoCount }}</span>
        </button>
        <button class="tab-item" :class="{ active: activeTab === 'comment' }" @click="switchTab('comment')">
          待审核评论<span class="tab-badge">{{ pendingCommentCount }}</span>
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'video'">
      <div class="filter-card">
        <div class="filter-grid">
          <div class="filter-item">
            <label class="filter-label">视频标题</label>
            <input v-model="videoFilter.title" class="filter-input" placeholder="搜索视频标题" @keyup.enter="searchVideo" />
          </div>
          <div class="filter-item">
            <label class="filter-label">UP主昵称</label>
            <input v-model="videoFilter.nickName" class="filter-input" placeholder="输入UP主昵称" @keyup.enter="searchVideo" />
          </div>
          <div class="filter-actions">
            <button class="btn btn-outline" @click="resetVideoFilter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
              </svg>
              重置
            </button>
            <button class="btn btn-primary" @click="searchVideo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              搜索
            </button>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>封面</th>
                <th>标题</th>
                <th>UP主</th>
                <th>剧集状态</th>
                <th>视频状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="videoTableData.length === 0 && !videoLoading">
                <td colspan="8" class="empty-cell"><div class="empty-state"><p>暂无数据</p></div></td>
              </tr>
              <tr v-for="(row, idx) in videoTableData" :key="row.id" class="table-row">
                <td>{{ (videoPagination.page - 1) * videoPagination.size + idx + 1 }}</td>
                <td>
                  <div class="cover-thumb-wrap">
                    <img v-if="row.coverUrl" :src="row.coverUrl" class="cover-thumb" />
                    <div v-else class="cover-empty"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                  </div>
                </td>
                <td class="col-title"><span class="title-text">{{ row.title }}</span></td>
                <td>
                  <div class="user-cell">
                    <img v-if="row.avatarUrl" :src="row.avatarUrl" class="user-avatar" />
                    <div v-else class="user-avatar avatar-fb">{{ (row.nickName || '?')[0].toUpperCase() }}</div>
                    <span class="user-name">{{ row.nickName || '匿名用户' }}</span>
                  </div>
                </td>
                <td><span class="badge" :class="reviewBadgeCls(row.reviewStatus)">{{ reviewLbl(row.reviewStatus) }}</span></td>
                <td><span class="badge" :class="videoStatusBadgeCls(row.videoStatus)">{{ videoStatusLbl(row.videoStatus) }}</span></td>
                <td class="mono">{{ row.createTime }}</td>
                <td>
                  <div class="action-group">
                    <button class="act-btn act-blue" @click="previewVideo(row)">预览</button>
                    <button class="act-btn act-green" @click="approveVideo(row)">通过</button>
                    <button class="act-btn act-red" @click="rejectVideo(row)">驳回</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <div class="page-info">共 {{ videoPagination.total }} 个视频</div>
          <div class="page-btns">
            <button class="pg-btn" :disabled="videoPagination.page <= 1" @click="goVideoPage(videoPagination.page - 1)">&#8249;</button>
            <template v-for="p in videoVisiblePages" :key="p">
              <span v-if="p === '...'" class="pg-ellipsis">...</span>
              <button v-else class="pg-btn" :class="{ active: p === videoPagination.page }" @click="goVideoPage(p)">{{ p }}</button>
            </template>
            <button class="pg-btn" :disabled="videoPagination.page >= videoTotalPages" @click="goVideoPage(videoPagination.page + 1)">&#8250;</button>
          </div>
          <div class="page-size">每页 <select v-model.number="videoPagination.size" class="size-sel" @change="onVideoPageSizeChange">
            <option :value="10">10</option><option :value="20">20</option><option :value="50">50</option>
          </select> 条</div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'comment'">
      <div class="filter-card">
        <div class="filter-grid">
          <div class="filter-item">
            <label class="filter-label">评论内容</label>
            <input v-model="commentFilter.content" class="filter-input" placeholder="搜索评论内容" @keyup.enter="searchComment" />
          </div>
          <div class="filter-item">
            <label class="filter-label">评论者昵称</label>
            <input v-model="commentFilter.nickName" class="filter-input" placeholder="输入评论者昵称" @keyup.enter="searchComment" />
          </div>
          <div class="filter-item">
            <label class="filter-label">相关视频标题</label>
            <input v-model="commentFilter.videoTitle" class="filter-input" placeholder="搜索视频标题" @keyup.enter="searchComment" />
          </div>
          <div class="filter-actions">
            <button class="btn btn-outline" @click="resetCommentFilter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
              </svg>
              重置
            </button>
            <button class="btn btn-primary" @click="searchComment">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              搜索
            </button>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>评论用户</th>
                <th>评论内容</th>
                <th>相关视频</th>
                <th>评论时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="commentTableData.length === 0 && !commentLoading">
                <td colspan="6" class="empty-cell"><div class="empty-state"><p>暂无数据</p></div></td>
              </tr>
              <tr v-for="(row, idx) in commentTableData" :key="row.id" class="table-row">
                <td>{{ (commentPagination.page - 1) * commentPagination.size + idx + 1 }}</td>
                <td>
                  <div class="user-cell">
                    <img v-if="row.avatarUrl || row.avatar" :src="row.avatarUrl || row.avatar" class="user-avatar" />
                    <div v-else class="user-avatar avatar-fb">{{ (row.nickName || '?')[0].toUpperCase() }}</div>
                    <span class="user-name">{{ row.nickName || '匿名用户' }}</span>
                  </div>
                </td>
                <td class="col-title"><span class="title-text">{{ row.content }}</span></td>
                <td>
                  <div class="user-cell">
                    <div v-if="row.videoCover" class="cover-thumb-mini"><img :src="row.videoCover" /></div>
                    <span class="user-name">{{ row.videoTitle || '-' }}</span>
                  </div>
                </td>
                <td class="mono">{{ row.createTime }}</td>
                <td>
                  <div class="action-group">
                    <button class="act-btn act-green" @click="approveComment(row)">通过</button>
                    <button class="act-btn act-red" @click="rejectComment(row)">驳回</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <div class="page-info">共 {{ commentPagination.total }} 条评论</div>
          <div class="page-btns">
            <button class="pg-btn" :disabled="commentPagination.page <= 1" @click="goCommentPage(commentPagination.page - 1)">&#8249;</button>
            <template v-for="p in commentVisiblePages" :key="p">
              <span v-if="p === '...'" class="pg-ellipsis">...</span>
              <button v-else class="pg-btn" :class="{ active: p === commentPagination.page }" @click="goCommentPage(p)">{{ p }}</button>
            </template>
            <button class="pg-btn" :disabled="commentPagination.page >= commentTotalPages" @click="goCommentPage(commentPagination.page + 1)">&#8250;</button>
          </div>
          <div class="page-size">每页 <select v-model.number="commentPagination.size" class="size-sel" @change="onCommentPageSizeChange">
            <option :value="10">10</option><option :value="20">20</option><option :value="50">50</option>
          </select> 条</div>
        </div>
      </div>
    </div>

    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="episodeVisible" class="modal-overlay" @click.self="episodeVisible = false">
          <div class="modal-card modal-wide" @click.stop>
            <div class="modal-header">
              <h3>剧集审核</h3>
              <button class="modal-close" @click="episodeVisible = false">&times;</button>
            </div>
            <div class="modal-body" style="padding:0;">
              <div class="episode-layout">
                <div class="episode-player-area">
                  <div v-if="currentEpisode" class="player-box">
                    <vue3-video-play v-bind="videoPlayerOptions" :src="currentEpisode.playUrl" />
                  </div>
                  <div v-else class="player-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    <p>暂无剧集</p>
                  </div>
                  <div v-if="currentEpisode" class="episode-meta">
                    <div class="detail-title-row">
                      <span class="detail-vtitle">{{ currentEpisode.title || `第${currentEpisodeIndex + 1}集` }}</span>
                      <span class="badge" :class="epReviewBadgeCls(currentEpisode.reviewStatus)">{{ epReviewLbl(currentEpisode.reviewStatus) }}</span>
                    </div>
                    <div class="episode-info-row">
                      <span class="il">集数</span><span class="iv">{{ currentEpisodeIndex + 1 }}</span>
                      <span v-if="currentEpisode.duration" class="il" style="margin-left:16px;">时长</span>
                      <span v-if="currentEpisode.duration" class="iv mono">{{ formatDuration(currentEpisode.duration) }}</span>
                    </div>
                    <div v-if="currentEpisode.reviewStatus === 0 || currentEpisode.reviewStatus === undefined" class="episode-actions">
                      <button class="btn btn-primary" @click="approveEpisode(currentEpisode)">通过</button>
                      <button class="btn btn-danger" @click="rejectEpisode(currentEpisode)">驳回</button>
                    </div>
                  </div>
                </div>
                <div class="episode-list-panel">
                  <div class="episode-list-header">剧集列表</div>
                  <div class="episode-list-body">
                    <div v-for="(ep, idx) in episodeList" :key="ep.id" class="episode-item"
                      :class="{ active: idx === currentEpisodeIndex }" @click="selectEpisode(idx)">
                      <div class="ep-num-badge">{{ idx + 1 }}</div>
                      <div class="ep-item-info">
                        <div class="ep-item-title">{{ ep.title || `第${idx + 1}集` }}</div>
                        <div class="ep-item-meta">
                          <span v-if="ep.duration" class="ep-dur">{{ formatDuration(ep.duration) }}</span>
                          <span class="badge badge-sm" :class="epReviewBadgeCls(ep.reviewStatus)">{{ epReviewLbl(ep.reviewStatus) }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="episodeList.length === 0" class="empty-state"><p>暂无剧集</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onActivated } from 'vue'
import {
  getVideoReviewList,
  getCommentReviewList,
  getVideoDetail,
  reviewVideo,
  reviewEpisode,
  reviewComment
} from '@/api/review'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('video')
const pendingVideoCount = ref(0)
const pendingCommentCount = ref(0)

const videoFilter = reactive({ title: '', nickName: '' })
const commentFilter = reactive({ content: '', nickName: '', videoTitle: '' })

const videoLoading = ref(false)
const commentLoading = ref(false)
const videoTableData = ref([])
const commentTableData = ref([])

const videoPagination = reactive({ page: 1, size: 10, total: 0 })
const commentPagination = reactive({ page: 1, size: 10, total: 0 })

const episodeVisible = ref(false)
const episodeList = ref([])
const currentEpisodeIndex = ref(-1)
const currentVideo = ref(null)

const currentEpisode = computed(() => {
  if (currentEpisodeIndex.value >= 0 && currentEpisodeIndex.value < episodeList.value.length) {
    return episodeList.value[currentEpisodeIndex.value]
  }
  return null
})

const videoPlayerOptions = computed(() => ({
  color: '#fb7299',
  volume: 0.3,
  speedRate: [0.75, 1.0, 1.25, 1.5, 2.0],
  controlBtns: ['audioTrack', 'speedRate', 'volume', 'setting', 'pip', 'pageFullScreen', 'fullScreen'],
  autoPlay: false
}))

const videoTotalPages = computed(() => Math.max(1, Math.ceil(videoPagination.total / videoPagination.size)))
const commentTotalPages = computed(() => Math.max(1, Math.ceil(commentPagination.total / commentPagination.size)))

function makePages(current, total) {
  const pages = []
  if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i); return pages }
  pages.push(1)
  if (current > 3) pages.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

const videoVisiblePages = computed(() => makePages(videoPagination.page, videoTotalPages.value))
const commentVisiblePages = computed(() => makePages(commentPagination.page, commentTotalPages.value))

function reviewBadgeCls(s) { return s === 0 ? 'badge-amber' : s === 1 ? 'badge-blue' : 'badge-green' }
function reviewLbl(s) { return s === 0 ? '待审核' : s === 1 ? '部分审核' : '审核完成' }
function videoStatusBadgeCls(s) { return s === 0 ? 'badge-gray' : s === 1 ? 'badge-amber' : s === 2 ? 'badge-green' : 'badge-red' }
function videoStatusLbl(s) { return s === 0 ? '草稿' : s === 1 ? '待发布' : s === 2 ? '已发布' : '已下架' }
function epReviewBadgeCls(s) { return s === 1 ? 'badge-green' : s === 2 ? 'badge-red' : 'badge-amber' }
function epReviewLbl(s) { return s === 1 ? '已通过' : s === 2 ? '已驳回' : '待审核' }

function formatDuration(sec) {
  if (!sec) return '00:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function dispatchReviewUpdated() { window.dispatchEvent(new Event('review-updated')) }

function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'video') loadVideoList()
  else loadCommentList()
}

async function loadVideoList() {
  videoLoading.value = true
  try {
    const res = await getVideoReviewList({
      page: videoPagination.page,
      size: videoPagination.size,
      title: videoFilter.title || undefined,
      nickName: videoFilter.nickName || undefined
    })
    const data = res.data || {}
    videoTableData.value = data.records || []
    videoPagination.total = data.total || 0
    pendingVideoCount.value = data.total || 0
  } catch (e) { console.error(e) } finally { videoLoading.value = false }
}

async function loadCommentList() {
  commentLoading.value = true
  try {
    const res = await getCommentReviewList({
      page: commentPagination.page,
      size: commentPagination.size,
      content: commentFilter.content || undefined,
      nickName: commentFilter.nickName || undefined,
      videoTitle: commentFilter.videoTitle || undefined
    })
    const data = res.data || {}
    commentTableData.value = data.records || []
    commentPagination.total = data.total || 0
    pendingCommentCount.value = data.total || 0
  } catch (e) { console.error(e) } finally { commentLoading.value = false }
}

function searchVideo() { videoPagination.page = 1; loadVideoList() }
function resetVideoFilter() { videoFilter.title = ''; videoFilter.nickName = ''; searchVideo() }
function searchComment() { commentPagination.page = 1; loadCommentList() }
function resetCommentFilter() { commentFilter.content = ''; commentFilter.nickName = ''; commentFilter.videoTitle = ''; searchComment() }

function goVideoPage(p) { if (p >= 1 && p <= videoTotalPages.value) { videoPagination.page = p; loadVideoList() } }
function onVideoPageSizeChange() { videoPagination.page = 1; loadVideoList() }
function goCommentPage(p) { if (p >= 1 && p <= commentTotalPages.value) { commentPagination.page = p; loadCommentList() } }
function onCommentPageSizeChange() { commentPagination.page = 1; loadCommentList() }

async function approveVideo(row) {
  try {
    await ElMessageBox.confirm('确定要通过该视频吗？', '通过审核', { type: 'success', confirmButtonText: '确定', cancelButtonText: '取消' })
    await reviewVideo(row.id, 2)
    ElMessage.success('审核通过')
    dispatchReviewUpdated()
    loadVideoList()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

async function rejectVideo(row) {
  try {
    await ElMessageBox.confirm('确定要驳回该视频吗？', '驳回审核', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    await reviewVideo(row.id, 3)
    ElMessage.success('已驳回')
    dispatchReviewUpdated()
    loadVideoList()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

async function previewVideo(row) {
  currentVideo.value = row
  currentEpisodeIndex.value = -1
  episodeList.value = []
  episodeVisible.value = true
  try {
    const res = await getVideoDetail(row.id)
    const data = res.data || {}
    episodeList.value = data.episodes || []
    if (episodeList.value.length > 0) currentEpisodeIndex.value = 0
  } catch (e) { console.error(e) }
}

function selectEpisode(idx) { currentEpisodeIndex.value = idx }

async function approveEpisode(ep) {
  try {
    await ElMessageBox.confirm('确定要通过该集吗？', '通过审核', { type: 'success', confirmButtonText: '确定', cancelButtonText: '取消' })
    await reviewEpisode(ep.id, 1)
    ep.reviewStatus = 1
    ElMessage.success('审核通过')
    dispatchReviewUpdated()
    checkAllReviewed()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

async function rejectEpisode(ep) {
  try {
    await ElMessageBox.confirm('确定要驳回该集吗？', '驳回审核', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    await reviewEpisode(ep.id, 2)
    ep.reviewStatus = 2
    ElMessage.success('已驳回')
    dispatchReviewUpdated()
    checkAllReviewed()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

function checkAllReviewed() {
  if (episodeList.value.length > 0 && episodeList.value.every(ep => ep.reviewStatus === 1 || ep.reviewStatus === 2)) {
    episodeVisible.value = false
    loadVideoList()
  }
}

async function approveComment(row) {
  try {
    await ElMessageBox.confirm('确定要通过该评论吗？', '通过审核', { type: 'success', confirmButtonText: '确定', cancelButtonText: '取消' })
    await reviewComment(row.id, 0)
    ElMessage.success('审核通过')
    dispatchReviewUpdated()
    loadCommentList()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

async function rejectComment(row) {
  try {
    await ElMessageBox.confirm('确定要驳回该评论吗？', '驳回审核', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    await reviewComment(row.id, 2)
    ElMessage.success('已驳回')
    dispatchReviewUpdated()
    loadCommentList()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

onMounted(() => { loadVideoList(); loadCommentList() })
onActivated(() => { loadVideoList(); loadCommentList() })
</script>

<style lang="scss" scoped>
.page-container { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--el-text-color-primary, #303133); margin: 0 0 4px; }
.page-sub { font-size: 13px; color: var(--el-text-color-secondary, #909399); }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
.stat-card {
  display: flex; align-items: center; gap: 16px; padding: 20px;
  background: var(--card-bg, #fff); border-radius: 12px; border: 1px solid var(--border-color, #e4e7ed);
}
.stat-icon {
  width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px;
}
.stat-video .stat-icon { background: rgba(251, 114, 153, 0.1); }
.stat-comment .stat-icon { background: rgba(144, 104, 255, 0.1); }
.stat-total .stat-icon { background: rgba(255, 193, 7, 0.1); }
.stat-value { font-size: 28px; font-weight: 700; color: var(--el-text-color-primary, #303133); line-height: 1.2; }
.stat-label { font-size: 13px; color: var(--el-text-color-secondary, #909399); margin-top: 2px; }

.tab-bar { margin-bottom: 16px; }
.tab-track {
  display: flex; background: var(--card-bg, #fff); border-radius: 8px; padding: 4px;
  position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.tab-track.full-width { width: 100%; }
.tab-slider {
  position: absolute; top: 4px; left: 4px; width: calc(50% - 4px); height: calc(100% - 8px);
  background: #fff; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); z-index: 0;
}
.tab-item {
  flex: 1; padding: 8px 24px; border: none; background: transparent; font-size: 13px; font-weight: 500;
  cursor: pointer; border-radius: 6px; position: relative; z-index: 1; transition: color 0.2s;
  color: var(--text-secondary, #909399); text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;
}
.tab-item.active { color: var(--color-primary, #fb7299); }
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px;
  padding: 0 5px; border-radius: 9px; font-size: 10px; font-weight: 600;
  background: var(--color-primary, #fb7299); color: #fff; line-height: 1;
}

.filter-card {
  background: var(--card-bg, #fff); border-radius: 12px; padding: 20px; margin-bottom: 16px;
  border: 1px solid var(--border-color, #e4e7ed);
}
.filter-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 0;
}
.filter-item { display: flex; flex-direction: column; gap: 6px; }
.filter-label { font-size: 12px; color: var(--text-secondary, #909399); font-weight: 500; }
.filter-input, .filter-select {
  height: 40px; border-radius: 12px; border: none; padding: 0 14px; font-size: 13px;
  background-color: var(--bg-color, #f5f7fa); outline: none; transition: all 0.2s;
  color: var(--text-primary, #303133); box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
  &:focus { background-color: var(--card-bg, #fff); box-shadow: 0 0 0 2px rgba(251,114,153,0.25); }
}
.filter-actions {
  display: flex; align-items: flex-end; gap: 10px; justify-content: flex-end; grid-column: 1 / -1;
}

.btn {
  height: 36px; padding: 0 22px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;
  border: 1px solid transparent; transition: all 0.25s ease; display: inline-flex; align-items: center; gap: 6px;
  svg { flex-shrink: 0; }
  &.btn-primary {
    background: linear-gradient(135deg, var(--color-primary, #fb7299) 0%, #ff9ac6 100%); color: #fff; border-color: transparent;
    box-shadow: 0 2px 8px rgba(251,114,153,0.25);
    &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(251,114,153,0.4); }
  }
  &.btn-outline {
    background: transparent; color: var(--text-secondary, #909399); border-color: var(--border-color, #dcdfe6);
    &:hover { color: var(--color-primary, #fb7299); border-color: var(--color-primary, #fb7299); background: rgba(251,114,153,0.04); }
  }
  &.btn-danger {
    background: #f56c6c; color: #fff; border-color: transparent;
    &:hover { background: #f78989; }
  }
  &:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }
}

.table-card {
  background: var(--card-bg, #fff); border-radius: 12px; border: 1px solid var(--border-color, #e4e7ed); overflow: hidden;
}
.table-scroll { overflow-x: auto; }
.data-table {
  width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px;
  th {
    padding: 14px 16px; text-align: center; font-size: 12px; color: var(--text-primary, #303133);
    background: var(--bg-color, #f8f9fc); font-weight: 600; white-space: nowrap;
    border-bottom: 2px solid var(--border-color, #e4e7ed); user-select: none;
  }
  td {
    padding: 14px 16px; border-bottom: 1px solid var(--border-color, #f2f3f5); vertical-align: middle;
    background: var(--card-bg, #fff); text-align: center; white-space: nowrap;
  }
  .table-row:hover td { background: var(--bg-color, #fafafa); }
}
.col-title { text-align: center; max-width: 280px; }
.title-text { font-weight: 500; color: var(--el-text-color-primary, #303133); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.cover-thumb-wrap { display: flex; justify-content: center; }
.cover-thumb { width: 80px; height: 45px; border-radius: 4px; object-fit: cover; display: block; }
.cover-empty {
  width: 80px; height: 45px; border-radius: 4px; background: var(--el-fill-color-light, #f5f7fa);
  display: flex; align-items: center; justify-content: center; color: #c0c4cc;
}
.cover-thumb-mini { width: 48px; height: 32px; border-radius: 4px; overflow: hidden; flex-shrink: 0; img { width: 100%; height: 100%; object-fit: cover; } }

.user-cell { display: flex; align-items: center; justify-content: center; gap: 8px; }
.user-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.avatar-fb {
  width: 28px; height: 28px; border-radius: 50%; background: var(--el-color-primary-light-9, #fce4ec);
  color: var(--el-color-primary, #fb7299); display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; flex-shrink: 0;
}
.user-name { font-size: 12px; color: var(--el-text-color-regular, #303133); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 1; min-width: 0; }

.badge {
  display: inline-block; padding: 5px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; white-space: nowrap;
  &.badge-green { color: #4caf50; background: rgba(76,175,80,0.1); }
  &.badge-blue { color: #409eff; background: rgba(64,158,255,0.1); }
  &.badge-amber { color: #e6a23c; background: rgba(230,162,60,0.1); }
  &.badge-red { color: #f56c6c; background: rgba(245,108,108,0.1); }
  &.badge-gray { color: #909399; background: rgba(144,147,153,0.1); }
  &.badge-sm { padding: 2px 8px; font-size: 10px; }
}

.mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13px; }

.action-group { display: flex; gap: 6px; justify-content: center; white-space: nowrap; }
.act-btn {
  padding: 7px 15px; border-radius: 100px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s ease;
  &.act-blue { color: #00a1d6; background: rgba(0,161,214,0.1); &:hover { color: #fff; background: #00a1d6; box-shadow: 0 2px 8px rgba(0,161,214,0.35); } }
  &.act-green { color: #67c23a; background: rgba(103,194,58,0.1); &:hover { color: #fff; background: #67c23a; box-shadow: 0 2px 8px rgba(103,194,58,0.35); } }
  &.act-red { color: #f56c6c; background: rgba(245,108,108,0.1); &:hover { color: #fff; background: #f56c6c; box-shadow: 0 2px 8px rgba(245,108,108,0.35); } }
}

.pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 10px; }
.page-info { padding-left: 10px; font-size: 13px; color: var(--text-secondary, #909399); }
.page-btns { display: flex; align-items: center; gap: 4px; }
.pg-btn {
  width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--border-color, #dcdfe6);
  background: var(--card-bg, #fff); color: var(--text-primary, #303133); cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.2s;
  &:hover:not(:disabled) { border-color: var(--color-primary, #fb7299); color: var(--color-primary, #fb7299); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &.active { background: var(--color-primary, #fb7299); color: #fff; border-color: var(--color-primary, #fb7299); }
}
.pg-ellipsis { width: 32px; text-align: center; color: var(--text-secondary, #909399); }
.page-size { font-size: 13px; color: var(--text-secondary, #909399); display: flex; align-items: center; gap: 6px; padding-right: 10px; }
.size-sel {
  height: 32px; border-radius: 6px; border: 1px solid var(--border-color, #dcdfe6); padding: 0 8px; font-size: 13px;
  background: var(--card-bg, #fff); color: var(--text-primary, #303133); cursor: pointer;
}

.empty-cell { text-align: center; padding: 48px 0 !important; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--el-text-color-secondary, #909399); p { margin: 0; font-size: 14px; } }

html.dark-mode {
  .stat-card, .filter-card, .table-card { background: var(--card-bg); border-color: var(--border-color); }
  .tab-track { background: var(--card-bg); }
  .tab-slider { background: var(--bg-color); }
  .filter-input, .filter-select { background: var(--bg-color); color: var(--text-primary); box-shadow: inset 0 1px 3px rgba(0,0,0,0.15); }
  .data-table th { background: var(--bg-color); border-color: var(--border-color); color: var(--text-primary); }
  .data-table td { border-color: var(--border-color); color: var(--text-primary); }
  .data-table .table-row:hover td { background: var(--hover-bg); }
  .pg-btn { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .size-sel { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .cover-empty { background: var(--bg-color); }
  .badge-green { color: #6fcf73 !important; background: rgba(76,175,80,0.15) !important; }
  .badge-blue { color: #6cb4ee !important; background: rgba(64,158,255,0.15) !important; }
  .badge-amber { color: #f0c060 !important; background: rgba(230,162,60,0.15) !important; }
  .badge-red { color: #f87171 !important; background: rgba(245,108,108,0.15) !important; }
  .badge-gray { color: #a0aab4 !important; background: rgba(144,147,153,0.15) !important; }
  .act-blue { color: #6cb4ee !important; }
  .act-green { color: #6fcf73 !important; }
  .act-red { color: #f87171 !important; }
}
</style>

<style lang="scss">
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  z-index: 2000; display: flex; align-items: center; justify-content: center;
}
.modal-card {
  background: var(--el-bg-color, #fff); border-radius: 16px; max-height: 90vh;
  display: flex; flex-direction: column; box-shadow: 0 24px 80px rgba(0,0,0,0.18);
}
.modal-wide { width: 920px; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 22px 28px; border-bottom: 1px solid var(--border-color, #ebeef5); flex-shrink: 0;
  h3 { margin: 0; font-size: 17px; font-weight: 600; color: var(--text-primary, #303133); }
}
.modal-close {
  background: none; border: none; font-size: 22px; cursor: pointer; color: var(--el-text-color-secondary, #909399);
  padding: 4px 8px; border-radius: 8px; transition: all 0.15s;
  &:hover { background: var(--bg-color, #f5f7fa); color: var(--text-primary, #303133); }
}
.modal-body { padding: 24px 28px; overflow-y: auto; flex: 1; }

.modal-fade-enter-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease; } }
.modal-fade-leave-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.15s ease, opacity 0.15s ease; } }
.modal-fade-enter-from { opacity: 0; .modal-card { transform: scale(0.9) translateY(16px); opacity: 0; } }
.modal-fade-leave-to { opacity: 0; .modal-card { transform: scale(0.95); opacity: 0; } }

.episode-layout { display: flex; height: 480px; }
.episode-player-area { flex: 1; display: flex; flex-direction: column; padding: 20px; min-width: 0; }
.player-box { width: 100%; border-radius: 8px; overflow: hidden; background: #000; }
.player-empty {
  width: 100%; height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: #1a1a1a; border-radius: 8px; color: #666;
  p { margin: 12px 0 0; font-size: 14px; }
}
.episode-meta { margin-top: 16px; }
.detail-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.detail-vtitle { font-size: 16px; font-weight: 600; color: var(--text-primary, #303133); }
.episode-info-row { display: flex; align-items: center; gap: 4px; font-size: 13px; margin-bottom: 12px; }
.il { font-size: 11px; color: var(--el-text-color-secondary, #909399); }
.iv { font-size: 13px; color: var(--el-text-color-primary, #303133); font-weight: 500; }
.episode-actions { display: flex; gap: 12px; }

.episode-list-panel {
  width: 280px; border-left: 1px solid var(--border-color, #ebeef5); display: flex; flex-direction: column; flex-shrink: 0;
}
.episode-list-header {
  padding: 14px 16px; font-size: 14px; font-weight: 600; color: var(--text-primary, #303133);
  border-bottom: 1px solid var(--border-color, #ebeef5); background: var(--bg-color, #f8f9fc); flex-shrink: 0;
}
.episode-list-body { flex: 1; overflow-y: auto; padding: 8px; }
.episode-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px;
  cursor: pointer; transition: all 0.2s;
  &:hover { background: var(--bg-color, #f5f7fa); }
  &.active { background: rgba(251,114,153,0.08); }
}
.ep-num-badge {
  width: 28px; height: 28px; border-radius: 50%; background: rgba(251,114,153,0.1);
  color: #fb7299; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; flex-shrink: 0;
}
.ep-item-info { flex: 1; min-width: 0; }
.ep-item-title { font-size: 13px; font-weight: 500; color: var(--text-primary, #303133); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ep-item-meta { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.ep-dur { font-size: 11px; color: var(--text-secondary, #909399); }

html.dark-mode {
  .modal-card { background: var(--card-bg); }
  .modal-header { border-color: var(--border-color); h3 { color: var(--text-primary); } }
  .episode-list-header { background: var(--bg-color); border-color: var(--border-color); color: var(--text-primary); }
  .episode-list-panel { border-color: var(--border-color); }
  .player-empty { background: #111; }
}
</style>
