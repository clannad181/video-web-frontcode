<template>
  <div class="login-log">
    <el-card shadow="never" class="search-card fade-in">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="搜索用户名"
            clearable
            :prefix-icon="Search"
          />
        </el-form-item>
        <el-form-item label="IP 地址">
          <el-input
            v-model="searchForm.ip"
            placeholder="搜索 IP 地址"
            clearable
            :prefix-icon="Search"
          />
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
          <span class="header-title">登录日志</span>
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
        <el-table-column prop="username" label="用户名" width="120">
          <template #default="{ row }">
            <span class="username-text">{{ row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="loginMethod" label="登录方式" width="130" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.loginMethod === '账号密码' ? 'primary' : 'success'">
              {{ row.loginMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP 地址" width="140">
          <template #default="{ row }">
            <span class="mono-text">{{ row.ip }}</span>
          </template>
        </el-table-column>
        <el-table-column label="浏览器 / 系统" min-width="180">
          <template #default="{ row }">
            <div class="ua-info">
              <span class="ua-browser">{{ row.browser }}</span>
              <span class="ua-os">{{ row.os }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="登录地点" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="dark" round size="small">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="失败原因" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.status === 0" class="fail-reason">{{ row.message }}</span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="loginTime" label="登录时间" width="170" />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, Download } from '@element-plus/icons-vue'
import { getLoginLogList, deleteLogs, batchDeleteLogs, exportLogs } from '@/api/log'

const loading = ref(false)
const tableData = ref([])
const selectedIds = ref([])
const tableRef = ref(null)

const searchForm = ref({
  username: '',
  ip: '',
  status: '',
  dateRange: null
})
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

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
    const res = await getLoginLogList(params)
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
  searchForm.value = { username: '', ip: '', status: '', dateRange: null }
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
  await exportLogs('login', searchForm.value)
  ElMessage.success('导出成功')
}

onMounted(fetchData)
</script>

<style lang="scss" scoped>
.login-log {
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

.username-text {
  color: #303133;
  font-weight: 500;
}

.mono-text {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 13px;
  color: #606266;
}

.ua-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ua-browser {
  font-size: 13px;
  color: #303133;
}

.ua-os {
  font-size: 11px;
  color: #909399;
}

.fail-reason {
  color: #f56c6c;
  font-size: 12px;
}

.text-muted {
  color: #c0c4cc;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 4px 0;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
