<template>
  <div class="review-page">
    <div class="page-header">
      <h2 class="page-title">内容审核</h2>
      <span class="page-subtitle">管理和审核平台内容，确保内容质量和合规性</span>
    </div>

    <div class="stats-row">
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

    <el-card class="table-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane name="video">
          <template #label>
            <span class="tab-label">待审核视频</span>
            <el-badge :value="pendingVideoCount" :max="99" class="tab-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane name="comment">
          <template #label>
            <span class="tab-label">待审核评论</span>
            <el-badge :value="pendingCommentCount" :max="99" class="tab-badge" />
          </template>
        </el-tab-pane>
      </el-tabs>

      <div v-if="activeTab === 'video'" class="tab-content">
        <div class="filter-card">
          <div class="filter-items">
            <el-input
              v-model="videoFilter.title"
              placeholder="视频标题"
              clearable
              class="filter-input"
              @keyup.enter="searchVideo"
              @clear="searchVideo"
            />
            <el-input
              v-model="videoFilter.nickName"
              placeholder="UP主昵称"
              clearable
              class="filter-input"
              @keyup.enter="searchVideo"
              @clear="searchVideo"
            />
            <el-button type="primary" :icon="Search" @click="searchVideo">搜索</el-button>
            <el-button :icon="Refresh" @click="resetVideoFilter">重置</el-button>
          </div>
        </div>

        <div class="table-wrapper">
          <el-table
            v-loading="videoLoading"
            :data="videoTableData"
            stripe
            style="width: 100%"
            row-key="id"
          >
            <el-table-column type="index" label="#" width="50" />
            <el-table-column label="封面" width="80">
              <template #default="{ row }">
                <div class="cover-thumb">
                  <img v-if="row.cover" :src="row.cover" alt="" />
                  <div v-else class="cover-empty">
                    <el-icon :size="16"><VideoPlay /></el-icon>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
            <el-table-column label="UP主" min-width="120">
              <template #default="{ row }">
                <div class="user-cell">
                  <div class="user-avatar-sm">
                    <img v-if="row.avatar" :src="row.avatar" alt="" />
                    <span v-else>{{ (row.nickName || 'A')[0] }}</span>
                  </div>
                  <span class="user-name">{{ row.nickName || '匿名用户' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="审核状态" width="100">
              <template #default="{ row }">
                <span :class="['status-badge', getReviewStatusClass(row.reviewStatus)]">
                  {{ getReviewStatusText(row.reviewStatus) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="视频状态" width="100">
              <template #default="{ row }">
                <span :class="['status-badge', getVideoStatusClass(row.videoStatus)]">
                  {{ getVideoStatusText(row.videoStatus) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="170" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="primary" link size="small" @click="previewVideo(row)">
                    预览
                  </el-button>
                  <el-button type="success" link size="small" @click="approveVideo(row)">
                    通过
                  </el-button>
                  <el-button type="danger" link size="small" @click="rejectVideo(row)">
                    驳回
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-wrap">
          <el-pagination
            v-model:current-page="videoPagination.page"
            v-model:page-size="videoPagination.size"
            :total="videoPagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="loadVideoList"
            @current-change="loadVideoList"
          />
        </div>
      </div>

      <div v-if="activeTab === 'comment'" class="tab-content">
        <div class="filter-card">
          <div class="filter-items">
            <el-input
              v-model="commentFilter.content"
              placeholder="评论内容"
              clearable
              class="filter-input"
              @keyup.enter="searchComment"
              @clear="searchComment"
            />
            <el-input
              v-model="commentFilter.nickName"
              placeholder="评论者昵称"
              clearable
              class="filter-input"
              @keyup.enter="searchComment"
              @clear="searchComment"
            />
            <el-input
              v-model="commentFilter.videoTitle"
              placeholder="相关视频标题"
              clearable
              class="filter-input"
              @keyup.enter="searchComment"
              @clear="searchComment"
            />
            <el-button type="primary" :icon="Search" @click="searchComment">搜索</el-button>
            <el-button :icon="Refresh" @click="resetCommentFilter">重置</el-button>
          </div>
        </div>

        <div class="table-wrapper">
          <el-table
            v-loading="commentLoading"
            :data="commentTableData"
            stripe
            style="width: 100%"
            row-key="id"
          >
            <el-table-column type="index" label="#" width="50" />
            <el-table-column label="评论用户" min-width="120">
              <template #default="{ row }">
                <div class="user-cell">
                  <div class="user-avatar-sm">
                    <img v-if="row.avatar" :src="row.avatar" alt="" />
                    <span v-else>{{ (row.nickName || 'A')[0] }}</span>
                  </div>
                  <span class="user-name">{{ row.nickName || '匿名用户' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="评论内容" min-width="200" show-overflow-tooltip />
            <el-table-column label="相关视频" min-width="180">
              <template #default="{ row }">
                <div class="video-cell">
                  <div class="video-thumb-sm">
                    <img v-if="row.videoCover" :src="row.videoCover" alt="" />
                    <div v-else class="cover-empty-sm">
                      <el-icon :size="12"><VideoPlay /></el-icon>
                    </div>
                  </div>
                  <span class="video-title-sm">{{ row.videoTitle || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="评论时间" width="170" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button type="success" link size="small" @click="approveComment(row)">
                    通过
                  </el-button>
                  <el-button type="danger" link size="small" @click="rejectComment(row)">
                    驳回
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-wrap">
          <el-pagination
            v-model:current-page="commentPagination.page"
            v-model:page-size="commentPagination.size"
            :total="commentPagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="loadCommentList"
            @current-change="loadCommentList"
          />
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="episodeVisible"
      title="剧集审核"
      width="900px"
      class="episode-modal"
      :close-on-click-modal="false"
      @close="episodeVisible = false"
    >
      <div class="episode-layout">
        <div class="episode-player-area">
          <div v-if="currentEpisode" class="player-container">
            <vue3-video-play
              v-bind="videoPlayerOptions"
              :src="currentEpisode.playUrl"
            />
          </div>
          <div v-else class="player-empty">
            <el-icon :size="40"><VideoPlay /></el-icon>
            <p>暂无剧集</p>
          </div>
          <div v-if="currentEpisode" class="episode-meta">
            <h4 class="episode-title">{{ currentEpisode.title || `第${currentEpisodeIndex + 1}集` }}</h4>
            <div class="episode-info">
              <span>集数：{{ currentEpisodeIndex + 1 }}</span>
              <span v-if="currentEpisode.duration">时长：{{ formatDuration(currentEpisode.duration) }}</span>
            </div>
            <div class="episode-actions" v-if="currentEpisode.reviewStatus === 0 || currentEpisode.reviewStatus === undefined">
              <el-button type="success" @click="approveEpisode(currentEpisode)">通过</el-button>
              <el-button type="danger" @click="rejectEpisode(currentEpisode)">驳回</el-button>
            </div>
            <div v-else class="episode-reviewed">
              <span :class="['status-badge', currentEpisode.reviewStatus === 1 ? 'badge-success' : 'badge-danger']">
                {{ currentEpisode.reviewStatus === 1 ? '已通过' : '已驳回' }}
              </span>
            </div>
          </div>
        </div>
        <div class="episode-list-panel">
          <div class="episode-list-header">剧集列表</div>
          <div class="episode-list-body">
            <div
              v-for="(ep, idx) in episodeList"
              :key="ep.id"
              class="episode-item"
              :class="{ active: idx === currentEpisodeIndex, reviewed: ep.reviewStatus === 1 || ep.reviewStatus === 2 }"
              @click="selectEpisode(idx)"
            >
              <div class="ep-index">{{ idx + 1 }}</div>
              <div class="ep-info">
                <div class="ep-title">{{ ep.title || `第${idx + 1}集` }}</div>
                <div class="ep-meta">
                  <span v-if="ep.duration">{{ formatDuration(ep.duration) }}</span>
                  <span :class="['status-badge status-badge-sm', getEpisodeStatusClass(ep.reviewStatus)]">
                    {{ getEpisodeStatusText(ep.reviewStatus) }}
                  </span>
                </div>
              </div>
            </div>
            <div v-if="episodeList.length === 0" class="episode-empty">暂无剧集</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Search, Refresh, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getVideoReviewList,
  getCommentReviewList,
  getVideoDetail,
  reviewVideo,
  reviewEpisode,
  reviewComment
} from '@/api/review'

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

function getReviewStatusClass(status) {
  const map = { 0: 'status-pending', 1: 'badge-primary', 2: 'badge-success' }
  return map[status] || 'status-pending'
}
function getReviewStatusText(status) {
  const map = { 0: '待审核', 1: '部分审核', 2: '审核完成' }
  return map[status] || '待审核'
}
function getVideoStatusClass(status) {
  const map = { 0: 'badge-info', 1: 'status-pending', 2: 'badge-success', 3: 'badge-inactive' }
  return map[status] || 'badge-info'
}
function getVideoStatusText(status) {
  const map = { 0: '草稿', 1: '待发布', 2: '已发布', 3: '已下架' }
  return map[status] || '未知'
}
function getEpisodeStatusClass(status) {
  if (status === 1) return 'badge-success'
  if (status === 2) return 'badge-danger'
  return 'status-pending'
}
function getEpisodeStatusText(status) {
  if (status === 1) return '已通过'
  if (status === 2) return '已驳回'
  return '待审核'
}

function formatDuration(seconds) {
  if (!seconds) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function handleTabChange(tab) {
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
    videoTableData.value = res.records || []
    videoPagination.total = res.total || 0
    pendingVideoCount.value = res.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    videoLoading.value = false
  }
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
    commentTableData.value = res.records || []
    commentPagination.total = res.total || 0
    pendingCommentCount.value = res.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    commentLoading.value = false
  }
}

function searchVideo() {
  videoPagination.page = 1
  loadVideoList()
}
function resetVideoFilter() {
  videoFilter.title = ''
  videoFilter.nickName = ''
  searchVideo()
}
function searchComment() {
  commentPagination.page = 1
  loadCommentList()
}
function resetCommentFilter() {
  commentFilter.content = ''
  commentFilter.nickName = ''
  commentFilter.videoTitle = ''
  searchComment()
}

function dispatchReviewUpdated() {
  window.dispatchEvent(new Event('review-updated'))
}

async function approveVideo(row) {
  try {
    await ElMessageBox.confirm('确定要通过该视频吗？', '通过审核', {
      type: 'success',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await reviewVideo(row.id, 2)
    ElMessage.success('审核通过')
    dispatchReviewUpdated()
    loadVideoList()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

async function rejectVideo(row) {
  try {
    await ElMessageBox.confirm('确定要驳回该视频吗？', '驳回审核', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await reviewVideo(row.id, 3)
    ElMessage.success('已驳回')
    dispatchReviewUpdated()
    loadVideoList()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

async function previewVideo(row) {
  currentVideo.value = row
  currentEpisodeIndex.value = -1
  episodeList.value = []
  episodeVisible.value = true
  try {
    const res = await getVideoDetail(row.id)
    episodeList.value = res.episodes || []
    if (episodeList.value.length > 0) {
      currentEpisodeIndex.value = 0
    }
  } catch (e) {
    console.error(e)
  }
}

function selectEpisode(idx) {
  currentEpisodeIndex.value = idx
}

async function approveEpisode(ep) {
  try {
    await ElMessageBox.confirm('确定要通过该集吗？', '通过审核', {
      type: 'success',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await reviewEpisode(ep.id, 1)
    ep.reviewStatus = 1
    ElMessage.success('审核通过')
    dispatchReviewUpdated()
    checkAllReviewed()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

async function rejectEpisode(ep) {
  try {
    await ElMessageBox.confirm('确定要驳回该集吗？', '驳回审核', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await reviewEpisode(ep.id, 2)
    ep.reviewStatus = 2
    ElMessage.success('已驳回')
    dispatchReviewUpdated()
    checkAllReviewed()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

function checkAllReviewed() {
  const allDone = episodeList.value.length > 0 && episodeList.value.every(ep => ep.reviewStatus === 1 || ep.reviewStatus === 2)
  if (allDone) {
    episodeVisible.value = false
    loadVideoList()
  }
}

async function approveComment(row) {
  try {
    await ElMessageBox.confirm('确定要通过该评论吗？', '通过审核', {
      type: 'success',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await reviewComment(row.id, 0)
    ElMessage.success('审核通过')
    dispatchReviewUpdated()
    loadCommentList()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

async function rejectComment(row) {
  try {
    await ElMessageBox.confirm('确定要驳回该评论吗？', '驳回审核', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await reviewComment(row.id, 2)
    ElMessage.success('已驳回')
    dispatchReviewUpdated()
    loadCommentList()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

onMounted(() => {
  loadVideoList()
  loadCommentList()
})
</script>

<style lang="scss" scoped>
.review-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary, #303133);
  margin: 0 0 4px;
}
.page-subtitle {
  font-size: 13px;
  color: var(--text-secondary, #909399);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--card-bg, #fff);
  border-radius: 16px;
  border: 1px solid var(--border-color, #f2f3f5);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.stat-video .stat-icon {
  background: rgba(251, 114, 153, 0.1);
}
.stat-comment .stat-icon {
  background: rgba(144, 104, 255, 0.1);
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #303133);
  line-height: 1.2;
}
.stat-label {
  font-size: 13px;
  color: var(--text-secondary, #909399);
  margin-top: 2px;
}

.table-card {
  border-radius: 16px;
  border: 1px solid var(--border-color, #f2f3f5);
}

.tab-label {
  font-weight: 500;
}
.tab-badge {
  margin-left: 6px;
  :deep(.el-badge__content) {
    font-size: 10px;
    padding: 0 6px;
    height: 18px;
    line-height: 18px;
  }
}

.tab-content {
  margin-top: 16px;
}

.filter-card {
  margin-bottom: 16px;
}
.filter-items {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}
.filter-input {
  width: 180px;
}

.table-wrapper {
  margin-bottom: 16px;
}

.cover-thumb {
  width: 64px;
  height: 42px;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f7fa;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.cover-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(251, 114, 153, 0.15), rgba(251, 114, 153, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  span {
    font-size: 11px;
    font-weight: 700;
    color: #fb7299;
  }
}
.user-name {
  font-size: 13px;
  color: var(--text-primary, #303133);
}

.video-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.video-thumb-sm {
  width: 48px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.cover-empty-sm {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}
.video-title-sm {
  font-size: 13px;
  color: var(--text-primary, #303133);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
}
.status-pending {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}
.badge-primary {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}
.badge-success {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}
.badge-danger {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}
.badge-info {
  background: rgba(144, 147, 153, 0.1);
  color: #909399;
}
.badge-inactive {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}
.status-badge-sm {
  font-size: 10px;
  padding: 1px 6px;
}

.action-btns {
  display: flex;
  gap: 4px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

:deep(.dark-mode) {
  .stat-card { background: var(--card-bg); border-color: var(--border-color); }
  .cover-empty { background: #2a2a2a; }
  .cover-empty-sm { background: #2a2a2a; }
}
</style>

<style lang="scss">
.episode-modal {
  .el-dialog__body {
    padding: 0;
  }
}

.episode-layout {
  display: flex;
  height: 480px;
}

.episode-player-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  min-width: 0;
}

.player-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}

.player-empty {
  width: 100%;
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  border-radius: 12px;
  color: #666;
  p {
    margin: 12px 0 0;
    font-size: 14px;
  }
}

.episode-meta {
  margin-top: 16px;
}
.episode-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin: 0 0 8px;
}
.episode-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary, #909399);
  margin-bottom: 12px;
}
.episode-actions {
  display: flex;
  gap: 12px;
}
.episode-reviewed {
  display: flex;
  align-items: center;
}

.episode-list-panel {
  width: 280px;
  border-left: 1px solid var(--border-color, #f2f3f5);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.episode-list-header {
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  border-bottom: 1px solid var(--border-color, #f2f3f5);
  background: var(--bg-color, #f9fafc);
}
.episode-list-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.episode-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: var(--hover-bg, #f5f7fa);
  }
  &.active {
    background: rgba(251, 114, 153, 0.08);
  }
  &.reviewed {
    opacity: 0.6;
  }
}

.ep-index {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(251, 114, 153, 0.1);
  color: #fb7299;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.ep-info {
  flex: 1;
  min-width: 0;
}
.ep-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #303133);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ep-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-secondary, #909399);
}

.episode-empty {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary, #c0c4cc);
  font-size: 14px;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.status-pending {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}
.badge-success {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}
.badge-danger {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}
.status-badge-sm {
  font-size: 10px;
  padding: 1px 6px;
}
</style>
