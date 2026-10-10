<template>
  <div class="page-container">
    <div class="audit-header">
      <div class="header-left">
        <h2 class="page-title">{{ $t('视频审核') }}</h2>
        <el-badge :value="pendingCount" :max="99" class="pending-badge" type="warning">
          <el-button size="small" plain>{{ $t('待审核') }}</el-button>
        </el-badge>
      </div>
      <el-tabs v-model="activeTab" class="filter-tabs" @tab-change="handleTabChange">
        <el-tab-pane :label="$t('待审核')" name="pending" />
        <el-tab-pane :label="$t('全部')" name="all" />
      </el-tabs>
    </div>

    <div class="audit-layout" :class="{ 'is-mobile': isMobile }">
      <div class="audit-list-panel">
        <div class="list-header">
          <span>{{ $t('视频列表') }}</span>
          <span class="list-count">{{ $t('共 {total} 条', { total: pagination.total }) }}</span>
        </div>
        <div v-loading="loading" class="video-list">
          <div
            v-for="item in tableData"
            :key="item.id"
            class="video-card"
            :class="{ active: selectedVideo?.id === item.id }"
            @click="selectVideo(item)"
          >
            <div class="card-cover">
              <img v-if="item.cover" :src="item.cover" alt="" />
              <div v-else class="card-cover-placeholder">
                <el-icon :size="24"><VideoPlay /></el-icon>
              </div>
            </div>
            <div class="card-info">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-meta">
                <span>{{ item.username }}</span>
                <span class="meta-dot">·</span>
                <span>{{ item.createTime }}</span>
              </div>
              <el-tag
                :type="['warning', 'success', 'danger'][item.status]"
                size="small"
                effect="dark"
                round
                class="card-status"
              >
                {{ $t(auditStatusLbl(item.status)) }}
              </el-tag>
            </div>
          </div>
          <el-empty v-if="!loading && !tableData.length" :description="$t('暂无数据')" />
        </div>
        <div class="list-pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, prev, pager, next"
            small
            background
            @change="fetchData"
          />
        </div>
      </div>

      <div class="preview-panel" v-loading="previewLoading">
        <template v-if="selectedVideo">
          <div class="preview-player">
            <DPlayer
              v-if="selectedVideo.videoUrl"
              :src="selectedVideo.videoUrl"
              :title="selectedVideo.title"
              :poster="selectedVideo.cover"
              :height="'100%'"
            />
            <div v-else class="player-wrap">
              <img
                v-if="selectedVideo.cover"
                :src="selectedVideo.cover"
                class="player-cover"
                alt=""
              />
              <div v-else class="player-cover player-cover-empty">
                <el-icon :size="64"><VideoPlay /></el-icon>
              </div>
            </div>
          </div>

          <div class="preview-episodes">
            <h4 class="section-label">{{ $t('分集预览') }}</h4>
            <div class="episode-tabs">
              <div
                v-for="(ep, index) in episodes"
                :key="index"
                class="episode-tab"
                :class="{ active: activeEpisode === index }"
                @click="activeEpisode = index"
              >
                <span class="ep-name">{{ $t(ep.title) }}</span>
                <span class="ep-dur">{{ formatDuration(ep.duration) }}</span>
              </div>
            </div>
          </div>

          <div class="preview-details">
            <h4 class="section-label">{{ $t('视频详情') }}</h4>
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item :label="$t('标题')">{{ selectedVideo.title }}</el-descriptions-item>
              <el-descriptions-item :label="$t('上传者')">{{ selectedVideo.username }}</el-descriptions-item>
              <el-descriptions-item :label="$t('上传时间')">{{ selectedVideo.createTime }}</el-descriptions-item>
              <el-descriptions-item :label="$t('描述')">
                {{ selectedVideo.content || $t('暂无描述') }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="preview-actions">
            <el-button
              type="success"
              size="large"
              :icon="CircleCheckFilled"
              :loading="actionLoading"
              @click="handleApprove"
            >
              {{ $t('通过') }}
            </el-button>
            <el-button
              type="danger"
              size="large"
              :icon="CircleCloseFilled"
              :loading="actionLoading"
              @click="showRejectDialog"
            >
              {{ $t('驳回') }}
            </el-button>
          </div>
        </template>
        <el-empty v-else :description="$t('请选择要审核的视频')" :image-size="120" />
      </div>
    </div>

    <el-dialog
      v-model="rejectDialogVisible"
      :title="$t('驳回视频')"
      width="480px"
      destroy-on-close
      class="reject-dialog"
    >
      <div class="reject-body">
        <el-alert
          :title="$t('确定要驳回视频「{title}」吗？', { title: selectedVideo?.title })"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 16px"
        />
        <el-form-item :label="$t('驳回原因')" label-position="top">
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="4"
            :placeholder="$t('请填写驳回原因，将自动通知上传者')"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </div>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">{{ $t('取消') }}</el-button>
        <el-button type="danger" :loading="actionLoading" @click="handleReject">
          {{ $t('确认驳回') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { formatDuration } from '@/utils/format'
import { getVideoList } from '@/api/video'
import { auditItem, rejectItem, getAuditStats } from '@/api/audit'
import DPlayer from '@/components/DPlayer.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const loading = ref(false)
const previewLoading = ref(false)
const actionLoading = ref(false)
const tableData = ref([])
const selectedVideo = ref(null)
const activeTab = ref('pending')
const pagination = ref({ page: 1, pageSize: 10, total: 0 })
const pendingCount = ref(0)
const isMobile = ref(false)
const activeEpisode = ref(0)

const auditStatusLbl = (s) => ['待审核', '已通过', '已拒绝'][s] ?? '' // i18n-key

const episodes = computed(() => {
  if (!selectedVideo.value) return []
  return [
    { title: '第1集 - 开篇', duration: 1200 }, // i18n-key
    { title: '第2集 - 发展', duration: 980 }, // i18n-key
    { title: '第3集 - 高潮', duration: 1100 } // i18n-key
  ]
})

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      status: activeTab.value === 'pending' ? 0 : undefined
    }
    const res = await getVideoList(params)
    tableData.value = res.data.list.map(item => ({
      ...item,
      status: activeTab.value === 'pending' ? 0 : Math.floor(Math.random() * 3)
    }))
    pagination.value.total = res.data.total
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  pagination.value.page = 1
  selectedVideo.value = null
  fetchData()
}

const selectVideo = async (item) => {
  selectedVideo.value = item
  activeEpisode.value = 0
  previewLoading.value = true
  setTimeout(() => { previewLoading.value = false }, 300)
}

const handlePlay = () => {
  // DPlayer handles playback internally
}

const handleApprove = async () => {
  await ElMessageBox.confirm(
    t('确定通过视频「{title}」的审核吗？', { title: selectedVideo.value.title }),
    t('审核确认'),
    {
      type: 'success',
      confirmButtonText: t('确定通过'),
      cancelButtonText: t('取消'),
      confirmButtonClass: 'el-button--success'
    }
  )
  actionLoading.value = true
  try {
    await auditItem(selectedVideo.value.id, { status: 1 })
    ElMessage.success(t('审核已通过'))
    selectedVideo.value = null
    fetchData()
  } finally {
    actionLoading.value = false
  }
}

const rejectDialogVisible = ref(false)
const rejectReason = ref('')

const showRejectDialog = () => {
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning(t('请填写驳回原因'))
    return
  }
  actionLoading.value = true
  try {
    await rejectItem(selectedVideo.value.id, rejectReason.value)
    ElMessage.success(t('已驳回，通知已发送给上传者'))
    rejectDialogVisible.value = false
    selectedVideo.value = null
    fetchData()
  } finally {
    actionLoading.value = false
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  const statsRes = await getAuditStats()
  pendingCount.value = statsRes.data.pending
  fetchData()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 0;
}

.audit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.filter-tabs {
  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
}

.audit-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 16px;
  height: calc(100vh - 200px);
  min-height: 500px;

  &.is-mobile {
    grid-template-columns: 1fr;
    height: auto;

    .audit-list-panel {
      max-height: 400px;
    }
  }
}

.audit-list-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f2f3f5;
  font-weight: 600;
  color: #303133;
  flex-shrink: 0;

  .list-count {
    font-weight: 400;
    font-size: 13px;
    color: #909399;
  }
}

.video-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.video-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;

  &:hover {
    background: #f5f7fa;
  }

  &.active {
    background: #ecf5ff;
    border-color: #409eff;
  }
}

.card-cover {
  width: 120px;
  height: 68px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f0f2f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.card-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  font-size: 12px;
  color: #909399;

  .meta-dot {
    margin: 0 4px;
  }
}

.card-status {
  align-self: flex-start;
}

.list-pagination {
  padding: 12px 16px;
  border-top: 1px solid #f2f3f5;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.preview-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 20px;
  gap: 20px;
  overflow-y: auto;
}

.preview-player {
  width: 100%;
}

.player-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #000;
}

.player-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-cover-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
}

.player-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  transition: background 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
}

.section-label {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.episode-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.episode-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.25s ease;

  &:hover {
    border-color: #409eff;
    color: #409eff;
  }

  &.active {
    background: #409eff;
    color: #fff;
    border-color: #409eff;
  }
}

.ep-dur {
  color: #909399;
  font-family: 'SF Mono', monospace;
  font-size: 12px;

  .active & {
    color: rgba(255, 255, 255, 0.8);
  }
}

.preview-details {
  :deep(.el-descriptions) {
    width: 100%;
  }
}

.preview-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding-top: 8px;
  border-top: 1px solid #f2f3f5;

  .el-button {
    min-width: 140px;
    font-size: 15px;
    font-weight: 500;
  }
}

.reject-body {
  :deep(.el-textarea__inner) {
    resize: none;
  }
}

@media (max-width: 768px) {
  .audit-layout {
    grid-template-columns: 1fr;
  }

  .audit-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
