<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名/邮箱/手机"
            clearable
            :prefix-icon="Search"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="全部" clearable>
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
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

    <el-card class="table-card" shadow="never">
      <el-tabs v-model="activeTab" class="user-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="管理员" name="admin" />
        <el-tab-pane label="普通用户" name="user" />
      </el-tabs>

      <div v-if="selectedIds.length" class="batch-bar">
        <span class="batch-count">已选择 <strong>{{ selectedIds.length }}</strong> 项</span>
        <el-button type="danger" plain :icon="Delete" @click="handleBatchDelete">批量删除</el-button>
        <el-button link type="primary" @click="clearSelection">取消选择</el-button>
      </div>

      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        row-key="id"
        class="user-table"
      >
        <el-table-column type="selection" width="50" reserve-selection />

        <template v-if="activeTab === 'admin'">
          <el-table-column prop="id" label="ID" width="70" align="center" />
          <el-table-column label="头像" width="70" align="center">
            <template #default="{ row }">
              <div class="avatar-cell">
                <img v-if="row.avatar" :src="row.avatar" class="avatar-img" alt="" />
                <div v-else class="avatar-placeholder">
                  <span>{{ (row.username || '').charAt(0).toUpperCase() }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="用户名" min-width="120">
            <template #default="{ row }">
              <span class="username-text">{{ row.username }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
          <el-table-column prop="role" label="角色" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.role === 'admin' ? 'danger' : ''" effect="dark" round size="small">
                {{ row.role === 'admin' ? '管理员' : '用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(row)"
                style="--el-switch-on-color: #10b981"
              />
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="170" />
          <el-table-column label="操作" width="210" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="warning" link size="small" @click="handleResetPwd(row)">重置密码</el-button>
              <el-popconfirm
                :title="`确定删除管理员「${row.username}」吗？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                :icon="WarningFilled"
                icon-color="#E6A23C"
                @confirm="handleDelete(row.id)"
              >
                <template #reference>
                  <el-button type="danger" link size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </template>

        <template v-else>
          <el-table-column prop="id" label="ID" width="70" align="center" />
          <el-table-column label="头像" width="70" align="center">
            <template #default="{ row }">
              <div class="avatar-cell">
                <img v-if="row.avatar" :src="row.avatar" class="avatar-img" alt="" />
                <div v-else class="avatar-placeholder">
                  <span>{{ (row.nickname || row.username || '').charAt(0).toUpperCase() }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="nickname" label="昵称" min-width="120">
            <template #default="{ row }">
              <span class="username-text">{{ row.nickname }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
          <el-table-column prop="gender" label="性别" width="80" align="center">
            <template #default="{ row }">
              <span class="gender-text">{{ ['保密', '男', '女'][row.gender] || '保密' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="signature" label="个性签名" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="signature-text">{{ row.signature || '暂无签名' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="vipStatus" label="VIP" width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.vipStatus" type="warning" effect="dark" size="small" round>
                VIP
              </el-tag>
              <span v-else class="no-vip">—</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="注册时间" width="170" />
          <el-table-column prop="lastLoginTime" label="最后登录" width="170" />
          <el-table-column label="操作" width="160" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewUser(row)">详情</el-button>
              <el-popconfirm
                :title="`确定删除用户「${row.nickname || row.username}」吗？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                :icon="WarningFilled"
                icon-color="#E6A23C"
                @confirm="handleDelete(row.id)"
              >
                <template #reference>
                  <el-button type="danger" link size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </template>
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
      v-model="editDialogVisible"
      :title="isEditing ? '编辑管理员' : '新增管理员'"
      width="520px"
      destroy-on-close
      class="edit-dialog"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="90px"
        class="edit-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" maxlength="30" show-word-limit :disabled="isEditing" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item v-if="!isEditing" label="密码" prop="password">
          <el-input v-model="editForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-upload-area">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="handleAvatarUpload"
              accept=".jpg,.jpeg,.png"
            >
              <div v-if="editForm.avatarPreview" class="avatar-preview">
                <img :src="editForm.avatarPreview" alt="" />
                <div class="avatar-overlay">
                  <el-icon :size="18"><Upload /></el-icon>
                </div>
              </div>
              <div v-else class="avatar-placeholder-upload">
                <el-icon :size="24"><Plus /></el-icon>
                <span>上传头像</span>
              </div>
            </el-upload>
            <div v-if="editForm.uploading" class="avatar-progress">
              <el-progress :percentage="editForm.uploadProgress" :stroke-width="4" :show-text="false" />
            </div>
            <div class="avatar-tip">支持 jpg/png，不超过 5MB</div>
          </div>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="管理员" value="admin" />
            <el-option label="编辑" value="editor" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="editSaving" @click="handleSaveEdit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer
      v-model="detailDrawerVisible"
      title="用户详情"
      size="480px"
      class="detail-drawer"
    >
      <div v-loading="detailLoading" class="detail-content" v-if="detailData">
        <div class="detail-header">
          <div class="detail-avatar">
            <img v-if="detailData.avatar" :src="detailData.avatar" alt="" />
            <div v-else class="avatar-placeholder large">
              <span>{{ (detailData.nickname || detailData.username || '').charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          <div class="detail-name">{{ detailData.nickname || detailData.username }}</div>
          <el-tag v-if="detailData.vipStatus" type="warning" effect="dark" round>VIP</el-tag>
        </div>
        <el-descriptions :column="1" border size="small" class="detail-desc">
          <el-descriptions-item label="用户ID">{{ detailData.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ detailData.username }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ detailData.nickname }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ detailData.email }}</el-descriptions-item>
          <el-descriptions-item label="手机">{{ detailData.phone }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ ['保密', '男', '女'][detailData.gender] || '保密' }}</el-descriptions-item>
          <el-descriptions-item label="签名">{{ detailData.signature || '暂无签名' }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="detailData.role === 'admin' ? 'danger' : ''" size="small">
              {{ detailData.role === 'admin' ? '管理员' : '用户' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detailData.status === 1 ? 'success' : 'danger'" size="small">
              {{ detailData.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="视频数">{{ detailData.videoCount }}</el-descriptions-item>
          <el-descriptions-item label="粉丝数">{{ detailData.fansCount }}</el-descriptions-item>
          <el-descriptions-item label="关注数">{{ detailData.followCount }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ detailData.createTime }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ detailData.lastLoginTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, Plus, Upload, WarningFilled } from '@element-plus/icons-vue'
import {
  getUserList, getUserDetail, createUser, updateUser,
  deleteUser, batchDeleteUser, changeUserStatus, resetPassword,
  uploadAvatar
} from '@/api/user'

const loading = ref(false)
const tableData = ref([])
const selectedIds = ref([])
const activeTab = ref('admin')
const tableRef = ref(null)

const searchForm = ref({
  keyword: '',
  role: '',
  status: '',
  dateRange: null
})
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm.value,
      role: activeTab.value === 'admin' ? 'admin' : 'user',
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    if (params.dateRange) {
      params.startDate = params.dateRange[0]
      params.endDate = params.dateRange[1]
    }
    delete params.dateRange
    const res = await getUserList(params)
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
  searchForm.value = { keyword: '', role: '', status: '', dateRange: null }
  handleSearch()
}

const handleTabChange = () => {
  selectedIds.value = []
  tableRef.value?.clearSelection()
  pagination.value.page = 1
  fetchData()
}

const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map(r => r.id)
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
}

const handleBatchDelete = async () => {
  await ElMessageBox.confirm(
    `确定要批量删除选中的 ${selectedIds.value.length} 个用户吗？`,
    '批量删除确认',
    { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
  )
  await batchDeleteUser(selectedIds.value)
  ElMessage.success('批量删除成功')
  fetchData()
}

const handleStatusChange = async (row) => {
  await changeUserStatus(row.id, row.status)
  ElMessage.success('状态已更新')
}

const handleResetPwd = async (row) => {
  await ElMessageBox.confirm(
    `确定要重置用户「${row.username}」的密码吗？`,
    '重置密码确认',
    { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
  )
  await resetPassword(row.id)
  ElMessage.success('密码已重置')
}

const handleDelete = async (id) => {
  await deleteUser(id)
  ElMessage.success('删除成功')
  fetchData()
}

const isEditing = ref(false)
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editSaving = ref(false)

const editForm = reactive({
  username: '',
  email: '',
  password: '',
  role: 'admin',
  status: 1,
  avatarPreview: '',
  uploading: false,
  uploadProgress: 0
})

const editRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const resetEditForm = () => {
  editForm.username = ''
  editForm.email = ''
  editForm.password = ''
  editForm.role = 'admin'
  editForm.status = 1
  editForm.avatarPreview = ''
  editForm.uploading = false
  editForm.uploadProgress = 0
}

const handleAdd = () => {
  isEditing.value = false
  resetEditForm()
  editDialogVisible.value = true
}

const handleEdit = async (row) => {
  isEditing.value = true
  resetEditForm()
  const res = await getUserDetail(row.id)
  const d = res.data
  editForm.username = d.username
  editForm.email = d.email
  editForm.role = d.role
  editForm.status = d.status
  editForm.avatarPreview = d.avatar || ''
  editDialogVisible.value = true
}

const handleSaveEdit = async () => {
  await editFormRef.value.validate()
  editSaving.value = true
  try {
    const data = {
      username: editForm.username,
      email: editForm.email,
      role: editForm.role,
      status: editForm.status
    }
    if (!isEditing.value) {
      data.password = editForm.password
      await createUser(data)
      ElMessage.success('创建成功')
    } else {
      await updateUser(1, data)
      ElMessage.success('更新成功')
    }
    editDialogVisible.value = false
    fetchData()
  } finally {
    editSaving.value = false
  }
}

const beforeAvatarUpload = (file) => {
  const isImage = ['image/jpeg', 'image/png'].includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) ElMessage.error('头像只能是 JPG/PNG 格式')
  if (!isLt5M) ElMessage.error('头像大小不能超过 5MB')
  return isImage && isLt5M
}

const handleAvatarUpload = async (options) => {
  editForm.uploading = true
  editForm.uploadProgress = 0
  try {
    const res = await uploadAvatar(options.file, (p) => {
      editForm.uploadProgress = p
    })
    editForm.avatarPreview = res.data.url
  } finally {
    editForm.uploading = false
  }
}

const detailDrawerVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref(null)

const handleViewUser = async (row) => {
  detailDrawerVisible.value = true
  detailLoading.value = true
  try {
    const res = await getUserDetail(row.id)
    detailData.value = { ...res.data, vipStatus: row.vipStatus, signature: row.signature }
  } finally {
    detailLoading.value = false
  }
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

.user-tabs {
  margin-bottom: 16px;

  :deep(.el-tabs__header) {
    margin: 0 0 0 -4px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
    border-radius: 3px;
  }
}

.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-bottom: 16px;
  background: #f0f9ff;
  border-radius: 6px;
  border: 1px solid #d4e8ff;
  animation: slideDown 0.25s ease;

  .batch-count {
    color: #606266;
    font-size: 14px;

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

.user-table {
  :deep(.el-table__header th) {
    background: #fafafa;
    font-weight: 600;
    color: #606266;
    font-size: 13px;
  }
}

.avatar-cell {
  display: flex;
  justify-content: center;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f2f3f5;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;

  &.large {
    width: 72px;
    height: 72px;
    font-size: 28px;
  }
}

.username-text {
  color: #303133;
  font-weight: 500;

  &:hover {
    color: #409eff;
    cursor: pointer;
  }
}

.gender-text {
  color: #606266;
  font-size: 13px;
}

.signature-text {
  color: #909399;
  font-size: 13px;
  font-style: italic;
}

.no-vip {
  color: #dcdfe6;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 4px 0;
}

.edit-form {
  max-height: 480px;
  overflow-y: auto;
  padding-right: 8px;
}

.avatar-upload-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }
}

.avatar-preview {
  position: relative;
  width: 80px;
  height: 80px;

  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
  }
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-placeholder-upload {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #8c939d;
  font-size: 12px;
  background: #fafafa;
}

.avatar-progress {
  width: 80px;
}

.avatar-tip {
  color: #909399;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.detail-content {
  padding: 0 8px;
}

.detail-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 0 28px;
  border-bottom: 1px solid #f2f3f5;
  margin-bottom: 24px;
}

.detail-avatar {
  img {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #f2f3f5;
  }
}

.detail-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.detail-desc {
  :deep(.el-descriptions__label) {
    width: 80px;
    font-weight: 500;
  }
}
</style>
