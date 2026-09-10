<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="视频关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索视频标题"
            clearable
            :prefix-icon="Search"
          />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="header-title">弹幕列表</span>
          <div class="header-stats">
            <el-tag type="info" size="small">共 {{ pagination.total }} 条</el-tag>
          </div>
        </div>
      </template>

      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        stripe
        row-key="id"
        class="danmaku-table"
      >
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="content" label="弹幕内容" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="danmaku-content" :style="{ color: row.color }">{{ row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="110">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="24" class="user-avatar">
                {{ row.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <span class="user-name">{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="视频" width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="video-link" @click="goToVideo(row.videoId)">
              {{ row.videoTitle }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="时间点" width="90" align="center">
          <template #default="{ row }">
            <span class="mono-text">{{ formatDuration(row.timePoint) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="颜色" width="70" align="center">
          <template #default="{ row }">
            <span class="color-dot" :style="{ background: row.color }"></span>
            <span class="color-hex">{{ row.color }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="danmakuTypeMap[row.position]?.type">
              {{ danmakuTypeMap[row.position]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发送时间" width="160" />
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="locateVideo(row)">
              定位视频
            </el-button>
            <el-popconfirm
              :title="`确定删除弹幕「${row.content}」吗？`"
              confirm-button-text="确定"
              cancel-button-text="取消"
              :icon="WarningFilled"
              icon-color="#F56C6C"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @change="fetchData"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="locateDialogVisible"
      title="定位弹幕"
      width="720px"
      destroy-on-close
      class="locate-dialog"
    >
      <div v-if="locateData" class="locate-body">
        <div class="locate-player">
          <div class="player-wrap">
            <img
              v-if="locateData.videoCover"
              :src="locateData.videoCover"
              class="player-cover"
              alt=""
            />
            <div v-else class="player-cover player-cover-empty">
              <el-icon :size="48"><VideoPlay /></el-icon>
            </div>
            <div class="player-overlay">
              <el-icon :size="48" color="#fff"><VideoPlay /></el-icon>
            </div>
            <div class="time-indicator">
              <el-icon><Clock /></el-icon>
              {{ formatDuration(locateData.timePoint) }}
            </div>
          </div>
        </div>

        <div class="locate-info">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="弹幕内容" :span="2">
              <span :style="{ color: locateData.color, fontWeight: 600 }">
                {{ locateData.content }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="发送用户">{{ locateData.username }}</el-descriptions-item>
            <el-descriptions-item label="时间点">
              {{ formatDuration(locateData.timePoint) }}
            </el-descriptions-item>
            <el-descriptions-item label="颜色">
              <span class="color-dot" :style="{ background: locateData.color }"></span>
              {{ locateData.color }}
            </el-descriptions-item>
            <el-descriptions-item label="类型">
              {{ danmakuTypeMap[locateData.position]?.label }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, WarningFilled, VideoPlay, Clock } from '@element-plus/icons-vue'
import { formatDuration } from '@/utils/format'
import { getDanmakuList, deleteDanmaku } from '@/api/danmaku'

const danmakuTypeMap = {
  0: { label: '滚动', type: 'primary' },
  1: { label: '顶部', type: 'success' },
  2: { label: '底部', type: 'warning' }
}

const loading = ref(false)
const tableData = ref([])
const tableRef = ref(null)

const searchForm = reactive({
  keyword: '',
  timeRange: null
})
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    if (params.timeRange) {
      params.startTime = params.timeRange[0]
      params.endTime = params.timeRange[1]
    }
    delete params.timeRange
    const res = await getDanmakuList(params)
    tableData.value = res.data.list
    pagination.value.total = res.data.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.timeRange = null
  handleSearch()
}

const handleDelete = async (id) => {
  await deleteDanmaku(id)
  ElMessage.success('删除成功')
  fetchData()
}

const locateDialogVisible = ref(false)
const locateData = ref(null)

const locateVideo = (row) => {
  locateData.value = {
    ...row,
    videoCover: ''
  }
  locateDialogVisible.value = true
}

const goToVideo = (videoId) => {
  ElMessage.info(`跳转到视频 ID: ${videoId}`)
}

onMounted(fetchData)
</script>

<style lang="scss" scoped>
.page-container {
  padding: 0;
}

.search-card {
  margin-bottom: 16px;
  border-radius: 8px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0;

  .el-form-item {
    margin-bottom: 16px;
    margin-right: 16px;
  }
}

.table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.danmaku-table {
  :deep(.el-table__header th) {
    background: #fafafa;
    font-weight: 600;
    color: #606266;
    font-size: 13px;
  }
}

.danmaku-content {
  font-weight: 500;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-avatar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  color: #303133;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-link {
  color: #409eff;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    color: #66b1ff;
    text-decoration: underline;
  }
}

.mono-text {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 13px;
  color: #606266;
}

.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-hex {
  font-size: 12px;
  color: #909399;
  font-family: 'SF Mono', monospace;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 4px 0;
}

.locate-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.locate-player {
  width: 100%;
}

.player-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
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
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
}

.time-indicator {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border-radius: 20px;
  font-size: 13px;
  font-family: 'SF Mono', monospace;
  backdrop-filter: blur(4px);
}

.locate-info {
  :deep(.el-descriptions) {
    width: 100%;
  }
}
</style>
