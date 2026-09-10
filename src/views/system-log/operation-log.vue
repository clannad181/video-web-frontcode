<template>
  <div class="operation-log">
    <el-card shadow="never" class="search-card fade-in">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="模块">
          <el-select v-model="searchForm.module" placeholder="全部模块" clearable>
            <el-option v-for="m in modules" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item label="URI">
          <el-input v-model="searchForm.uri" placeholder="搜索 URI" clearable :prefix-icon="Search" />
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="searchForm.operator" placeholder="搜索操作人" clearable :prefix-icon="Search" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card fade-in" style="animation-delay: 0.1s">
      <template #header>
        <div class="card-header">
          <span class="header-title">操作日志</span>
          <div class="header-actions">
            <el-button type="danger" plain :icon="Delete" @click="handleBatchDelete" :disabled="!selectedIds.length">
              批量删除
            </el-button>
            <el-button type="success" plain :icon="Download" @click="handleExport">
              导出
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="selectedIds.length" class="batch-bar">
        <span class="batch-count">已选择 <strong>{{ selectedIds.length }}</strong> 项</span>
        <el-button link type="primary" @click="clearSelection">取消选择</el-button>
      </div>

      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        row-key="id"
        class="log-table"
      >
        <el-table-column type="selection" width="50" reserve-selection />
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="module" label="模块" width="110" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="moduleTagType(row.module)">{{ row.module }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="action" label="操作描述" min-width="160" show-overflow-tooltip />
        <el-table-column prop="uri" label="请求 URI" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="mono-text">{{ row.uri }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="method" label="方法" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="methodTagType(row.method)" effect="dark" round>
              {{ row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP" width="140">
          <template #default="{ row }">
            <span class="mono-text">{{ row.ip }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时" width="90" align="center">
          <template #default="{ row }">
            <span :class="durationClass(row.duration)">{{ row.duration }}ms</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="dark" round size="small">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operateTime" label="操作时间" width="170" />
        <el-table-column label="详情" width="70" align="center" fixed="right">
          <template #default="{ row }">
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

    <el-drawer
      v-model="detailVisible"
      title="操作详情"
      size="560px"
      class="detail-drawer"
    >
      <div v-if="detailData" class="detail-content">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="操作模块">{{ detailData.module }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ detailData.operator }}</el-descriptions-item>
          <el-descriptions-item label="请求方法">
            <el-tag size="small" :type="methodTagType(detailData.method)" effect="dark" round>
              {{ detailData.method }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="请求 URI" :span="2">
            <span class="mono-text">{{ detailData.uri }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="IP 地址">{{ detailData.ip }}</el-descriptions-item>
          <el-descriptions-item label="耗时">
            <span :class="durationClass(detailData.duration)">{{ detailData.duration }}ms</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detailData.status === 1 ? 'success' : 'danger'" size="small">
              {{ detailData.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ detailData.operateTime }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4 class="section-title">请求参数</h4>
          <pre class="code-block">{{ detailData.requestParams || '无' }}</pre>
        </div>

        <div class="detail-section">
          <h4 class="section-title">响应结果</h4>
          <pre class="code-block">{{ detailData.response || '无' }}</pre>
        </div>

        <div v-if="detailData.exception" class="detail-section">
          <h4 class="section-title error">异常堆栈</h4>
          <pre class="code-block error">{{ detailData.exception }}</pre>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, Download } from '@element-plus/icons-vue'
import { getOperationLogList, deleteLogs, batchDeleteLogs, exportLogs } from '@/api/log'

const loading = ref(false)
const tableData = ref([])
const selectedIds = ref([])
const tableRef = ref(null)
const detailVisible = ref(false)
const detailData = ref(null)

const modules = ['视频管理', '用户管理', '系统设置', '审核管理', '角色管理', '菜单管理']
const searchForm = ref({ module: '', uri: '', operator: '', status: '', dateRange: null })
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

const moduleTagType = (m) => {
  const map = { '视频管理': 'primary', '用户管理': 'success', '系统设置': 'warning', '审核管理': 'danger', '角色管理': '', '菜单管理': 'info' }
  return map[m] || 'info'
}

const methodTagType = (m) => {
  const map = { GET: 'success', POST: 'primary', PUT: 'warning', DELETE: 'danger' }
  return map[m] || 'info'
}

const durationClass = (d) => {
  if (d > 500) return 'duration-slow'
  if (d > 100) return 'duration-medium'
  return 'duration-fast'
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    if (params.dateRange) {
      params.startDate = params.dateRange[0]
      params.endDate = params.dateRange[1]
    }
    delete params.dateRange
    const res = await getOperationLogList(params)
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
  searchForm.value = { module: '', uri: '', operator: '', status: '', dateRange: null }
  handleSearch()
}

const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map(r => r.id)
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
}

const handleBatchDelete = async () => {
  await ElMessageBox.confirm(
    `确定要批量删除选中的 ${selectedIds.value.length} 条日志吗？`,
    '批量删除确认',
    { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
  )
  await batchDeleteLogs(selectedIds.value)
  ElMessage.success('批量删除成功')
  fetchData()
}

const handleExport = async () => {
  await exportLogs('operation', searchForm.value)
  ElMessage.success('导出成功')
}

const showDetail = (row) => {
  detailData.value = {
    ...row,
    requestParams: JSON.stringify({ userId: 1, action: row.action, module: row.module }, null, 2),
    response: JSON.stringify({ code: 200, message: 'success', data: null }, null, 2),
    exception: row.status === 0 ? 'java.lang.NullPointerException: Cannot invoke method on null reference\n\tat com.example.service.UserService.getUser(UserService.java:42)\n\tat com.example.controller.UserController.getUser(UserController.java:28)' : null
  }
  detailVisible.value = true
}

onMounted(fetchData)
</script>

<style lang="scss" scoped>
.operation-log {
  padding: 0;
}

.search-card {
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px solid #f2f3f5;

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
  border-radius: 12px;
  border: 1px solid #f2f3f5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-bottom: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #d4e8ff;
  animation: slideDown 0.25s ease;

  .batch-count {
    color: #606266;
    font-size: 13px;

    strong {
      color: #409eff;
      font-weight: 600;
    }
  }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.log-table {
  :deep(.el-table__header th) {
    background: #fafafa;
    font-weight: 600;
    color: #606266;
    font-size: 13px;
  }
}

.mono-text {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 13px;
  color: #606266;
}

.duration-fast {
  color: #67c23a;
  font-weight: 600;
}

.duration-medium {
  color: #e6a23c;
  font-weight: 600;
}

.duration-slow {
  color: #f56c6c;
  font-weight: 600;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 4px 0;
}

.detail-content {
  padding: 0 4px;
}

.detail-section {
  margin-top: 20px;
}

.section-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-left: 10px;
  border-left: 3px solid #409eff;

  &.error {
    color: #f56c6c;
    border-left-color: #f56c6c;
  }
}

.code-block {
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 14px;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #303133;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;

  &.error {
    background: #fef0f0;
    border-color: #fde2e2;
    color: #f56c6c;
  }
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
