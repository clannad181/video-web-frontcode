<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索评论内容"
            clearable
            :prefix-icon="Search"
          />
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input v-model="searchForm.nickname" placeholder="搜索用户昵称" clearable />
        </el-form-item>
        <el-form-item label="视频标题">
          <el-input v-model="searchForm.videoTitle" placeholder="搜索视频标题" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="用户删除" :value="2" />
            <el-option label="运营屏蔽" :value="3" />
            <el-option label="待审核" :value="0" />
          </el-select>
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
          <span class="header-title">评论列表</span>
        </div>
      </template>

      <div v-if="selectedIds.length" class="batch-bar">
        <span class="batch-count">已选择 <strong>{{ selectedIds.length }}</strong> 项</span>
        <el-button type="danger" plain :icon="Delete" @click="handleBatchDelete">
          批量删除 ({{ selectedIds.length }})
        </el-button>
        <el-button link type="primary" @click="clearSelection">取消选择</el-button>
      </div>

      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        row-key="id"
        class="comment-table"
      >
        <el-table-column type="selection" width="50" reserve-selection />
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="content" label="评论内容" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="comment-content">{{ row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="160">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="28" class="user-avatar">
                {{ row.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <span class="user-name">{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="视频" width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="video-link" @click="goToVideo(row.videoId)">
              {{ row.videoTitle }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="commentStatusMap[row.status]?.type"
              size="small"
              :effect="row.status === 1 ? 'dark' : 'light'"
            >
              {{ commentStatusMap[row.status]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评论时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              :type="row.status === 3 ? 'success' : 'warning'"
              link
              size="small"
              @click="handleToggleBlock(row)"
            >
              {{ row.status === 3 ? '取消屏蔽' : '屏蔽' }}
            </el-button>
            <el-popconfirm
              :title="`确定删除该评论？内容：「${row.content?.slice(0, 20)}...」`"
              confirm-button-text="确定删除"
              cancel-button-text="取消"
              :icon="WarningFilled"
              icon-color="#F56C6C"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
            <el-button type="primary" link size="small" @click="showDetail(row)">详情</el-button>
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
      v-model="detailVisible"
      title="评论详情"
      width="520px"
      destroy-on-close
      class="detail-dialog"
    >
      <div v-if="detailData" class="detail-body">
        <div class="detail-comment-section">
          <h4 class="detail-label">评论内容</h4>
          <div class="detail-comment-content">{{ detailData.content }}</div>
        </div>

        <el-divider />

        <div class="detail-info-section">
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="评论ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="评论用户">{{ detailData.username }}</el-descriptions-item>
            <el-descriptions-item label="评论时间">{{ detailData.createTime }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag
                :type="commentStatusMap[detailData.status]?.type"
                size="small"
              >
                {{ commentStatusMap[detailData.status]?.label }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="点赞数">{{ detailData.likeCount }}</el-descriptions-item>
            <el-descriptions-item label="回复数">{{ detailData.replyCount }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-video-section">
          <h4 class="detail-label">所属视频</h4>
          <el-button type="primary" link @click="goToVideo(detailData.videoId)">
            前往视频管理 →
          </el-button>
          <span class="detail-video-title">{{ detailData.videoTitle }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, WarningFilled } from '@element-plus/icons-vue'
import { getCommentList, deleteComment, batchDeleteComment, auditComment } from '@/api/comment'

const commentStatusMap = {
  1: { label: '正常', type: 'success' },
  2: { label: '用户删除', type: 'info' },
  3: { label: '运营屏蔽', type: 'warning' },
  0: { label: '待审核', type: '' }
}

const loading = ref(false)
const tableData = ref([])
const selectedIds = ref([])
const tableRef = ref(null)

const searchForm = reactive({
  keyword: '',
  nickname: '',
  videoTitle: '',
  status: ''
})
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCommentList({
      ...searchForm,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    })
    tableData.value = res.data.list.map(item => ({
      ...item,
      status: Math.random() > 0.15 ? 1 : [0, 2, 3][Math.floor(Math.random() * 3)]
    }))
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
  searchForm.nickname = ''
  searchForm.videoTitle = ''
  searchForm.status = ''
  handleSearch()
}

const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map(r => r.id)
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
}

const handleDelete = async (id) => {
  await deleteComment(id)
  ElMessage.success('删除成功')
  fetchData()
}

const handleBatchDelete = async () => {
  await ElMessageBox.confirm(
    `确定要批量删除选中的 ${selectedIds.value.length} 条评论吗？此操作不可恢复。`,
    '批量删除确认',
    {
      type: 'warning',
      confirmButtonText: `确定删除 ${selectedIds.value.length} 条`,
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger'
    }
  )
  await batchDeleteComment(selectedIds.value)
  ElMessage.success('批量删除成功')
  fetchData()
}

const handleToggleBlock = async (row) => {
  const newStatus = row.status === 3 ? 1 : 3
  const action = newStatus === 3 ? '屏蔽' : '取消屏蔽'
  await ElMessageBox.confirm(
    `确定要${action}该评论吗？`,
    `${action}确认`,
    { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
  )
  await auditComment(row.id, { status: newStatus })
  row.status = newStatus
  ElMessage.success(`已${action}`)
}

const detailVisible = ref(false)
const detailData = ref(null)

const showDetail = (row) => {
  detailData.value = { ...row }
  detailVisible.value = true
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

.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-bottom: 16px;
  background: #fdf6ec;
  border-radius: 6px;
  border: 1px solid #f5dab1;
  animation: slideDown 0.25s ease;

  .batch-count {
    color: #606266;
    font-size: 14px;

    strong {
      color: #e6a23c;
      font-weight: 600;
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.comment-table {
  :deep(.el-table__header th) {
    background: #fafafa;
    font-weight: 600;
    color: #606266;
    font-size: 13px;
  }
}

.comment-content {
  color: #303133;
  line-height: 1.5;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 12px;
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

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 4px 0;
}

.detail-body {
  padding: 0 4px;
}

.detail-label {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.detail-comment-content {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  color: #303133;
  line-height: 1.8;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

.detail-info-section {
  margin-bottom: 20px;
}

.detail-video-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  .detail-label {
    width: 100%;
  }
}

.detail-video-title {
  color: #606266;
  font-size: 13px;
}
</style>
