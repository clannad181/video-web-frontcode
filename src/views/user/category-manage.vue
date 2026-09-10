<template>
  <div class="page-container">
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="header-title">分类管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增分类</el-button>
        </div>
      </template>

      <el-table
        ref="tableRef"
        :data="treeData"
        v-loading="loading"
        stripe
        row-key="id"
        default-expand-all
        class="category-table"
        :tree-props="{ children: 'children' }"
        :row-class-name="getRowClassName"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="分类名称" min-width="200">
          <template #default="{ row }">
            <div class="name-cell">
              <el-icon v-if="row.icon" class="name-icon"><component :is="row.icon" /></el-icon>
              <span class="name-text">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="80" align="center">
          <template #default="{ row }">
            <div class="icon-cell">
              <el-icon v-if="row.icon" :size="18"><component :is="row.icon" /></el-icon>
              <span v-else class="no-icon">—</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="{ row }">
            <div class="sort-cell" v-if="!row._editingSort">
              <span class="sort-value">{{ row.sort }}</span>
              <el-button type="primary" link :icon="Edit" size="small" @click="startEditSort(row)" />
            </div>
            <div v-else class="sort-edit">
              <el-input-number
                v-model="row._sortValue"
                :min="0"
                :max="9999"
                size="small"
                controls-position="right"
                style="width: 80px"
                @keyup.enter="saveEditSort(row)"
              />
              <el-button type="primary" link :icon="Check" size="small" @click="saveEditSort(row)" />
              <el-button type="info" link :icon="Close" size="small" @click="cancelEditSort(row)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="videoCount" label="视频数" width="100" align="right">
          <template #default="{ row }">
            <span class="count-text">{{ row.videoCount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'danger'"
              effect="light"
              size="small"
              round
            >
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link size="small" @click="handleAddChild(row)">添加子分类</el-button>
            <el-popconfirm
              :title="row.videoCount > 0 ? `该分类下有 ${row.videoCount} 个视频，确定删除吗？` : '确定删除该分类吗？'"
              :width="row.videoCount > 0 ? 300 : 220"
              confirm-button-text="确定"
              cancel-button-text="取消"
              :icon="row.videoCount > 0 ? WarningFilled : undefined"
              :icon-color="row.videoCount > 0 ? '#E6A23C' : undefined"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="editDialogVisible"
      :title="dialogTitle"
      width="520px"
      destroy-on-close
      class="edit-dialog"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
        class="edit-form"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入分类名称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-tree-select
            v-model="editForm.parentId"
            :data="parentTreeData"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="无（顶级分类）"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="图标">
          <div class="icon-upload-area">
            <el-upload
              class="icon-uploader"
              :show-file-list="false"
              :before-upload="beforeIconUpload"
              :http-request="handleIconUpload"
              accept=".jpg,.jpeg,.png,.svg"
            >
              <div v-if="editForm.iconPreview" class="icon-preview">
                <img :src="editForm.iconPreview" alt="" />
                <div class="icon-overlay">
                  <el-icon :size="14"><Upload /></el-icon>
                </div>
              </div>
              <div v-else class="icon-placeholder-upload">
                <el-icon :size="20"><Plus /></el-icon>
              </div>
            </el-upload>
            <div v-if="editForm.iconUploading" class="icon-progress">
              <el-progress :percentage="editForm.iconUploadProgress" :stroke-width="3" :show-text="false" />
            </div>
            <div class="icon-tip">支持 jpg/png/svg</div>
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="editForm.sort" :min="0" :max="9999" controls-position="right" />
          <span class="sort-hint">数值越小越靠前</span>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Check, Close, Upload, WarningFilled } from '@element-plus/icons-vue'
import { getCategoryList, createCategory, updateCategory, deleteCategory } from '@/api/category'

const loading = ref(false)
const tableData = ref([])
const tableRef = ref(null)

const buildTree = (list, parentId = 0) => {
  return list
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: buildTree(list, item.id),
      _editingSort: false,
      _sortValue: item.sort
    }))
    .sort((a, b) => a.sort - b.sort)
}

const treeData = ref([])

const parentTreeData = computed(() => {
  return [{ id: 0, name: '无（顶级分类）', children: buildTree(tableData.value, 0) }]
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCategoryList()
    tableData.value = res.data.list
    treeData.value = buildTree(res.data.list, 0)
  } finally {
    loading.value = false
  }
}

const getRowClassName = ({ row }) => {
  return row.status === 0 ? 'disabled-row' : ''
}

const startEditSort = (row) => {
  row._sortValue = row.sort
  row._editingSort = true
}

const saveEditSort = async (row) => {
  row.sort = row._sortValue
  row._editingSort = false
  ElMessage.success('排序已更新')
}

const cancelEditSort = (row) => {
  row._sortValue = row.sort
  row._editingSort = false
}

const isEditing = ref(false)
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editSaving = ref(false)
const editingParentId = ref(0)

const dialogTitle = computed(() => {
  if (isEditing.value) return '编辑分类'
  return editingParentId.value > 0 ? '添加子分类' : '新增分类'
})

const editForm = reactive({
  name: '',
  parentId: 0,
  sort: 0,
  status: 1,
  iconPreview: '',
  iconUploading: false,
  iconUploadProgress: 0
})

const editRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const resetEditForm = () => {
  editForm.name = ''
  editForm.parentId = 0
  editForm.sort = 0
  editForm.status = 1
  editForm.iconPreview = ''
  editForm.iconUploading = false
  editForm.iconUploadProgress = 0
}

const handleAdd = () => {
  isEditing.value = false
  editingParentId.value = 0
  resetEditForm()
  editDialogVisible.value = true
}

const handleAddChild = (row) => {
  isEditing.value = false
  editingParentId.value = row.id
  resetEditForm()
  editForm.parentId = row.id
  editDialogVisible.value = true
}

const handleEdit = (row) => {
  isEditing.value = true
  resetEditForm()
  editForm.name = row.name
  editForm.parentId = row.parentId
  editForm.sort = row.sort
  editForm.status = row.status
  editForm.iconPreview = ''
  editDialogVisible.value = true
}

const handleSaveEdit = async () => {
  await editFormRef.value.validate()
  editSaving.value = true
  try {
    const data = {
      name: editForm.name,
      parentId: editForm.parentId,
      sort: editForm.sort,
      status: editForm.status
    }
    if (isEditing.value) {
      await updateCategory(1, data)
      ElMessage.success('更新成功')
    } else {
      await createCategory(data)
      ElMessage.success('创建成功')
    }
    editDialogVisible.value = false
    fetchData()
  } finally {
    editSaving.value = false
  }
}

const handleDelete = async (row) => {
  await deleteCategory(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

const beforeIconUpload = (file) => {
  const isImage = ['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)
  if (!isImage) ElMessage.error('图标只能是 JPG/PNG/SVG 格式')
  return isImage
}

const handleIconUpload = async (options) => {
  editForm.iconUploading = true
  editForm.iconUploadProgress = 0
  try {
    let progress = 0
    await new Promise(resolve => {
      const timer = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(timer)
          editForm.iconUploadProgress = 100
          resolve()
        } else {
          editForm.iconUploadProgress = Math.min(Math.round(progress), 99)
        }
      }, 200)
    })
    const reader = new FileReader()
    reader.onload = (e) => {
      editForm.iconPreview = e.target.result
    }
    reader.readAsDataURL(options.file)
  } finally {
    editForm.iconUploading = false
  }
}

onMounted(fetchData)
</script>

<style lang="scss" scoped>
.page-container {
  padding: 0;
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

.category-table {
  :deep(.el-table__header th) {
    background: #fafafa;
    font-weight: 600;
    color: #606266;
    font-size: 13px;
  }

  :deep(.disabled-row) {
    opacity: 0.55;
  }
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-icon {
  color: #409eff;
  font-size: 16px;
}

.name-text {
  font-weight: 500;
  color: #303133;
}

.icon-cell {
  display: flex;
  justify-content: center;
}

.no-icon {
  color: #dcdfe6;
}

.sort-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.sort-value {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 13px;
  color: #606266;
}

.sort-edit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.count-text {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 13px;
  color: #606266;
}

.edit-form {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 8px;
}

.icon-upload-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.icon-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }
}

.icon-preview {
  position: relative;
  width: 48px;
  height: 48px;

  img {
    width: 48px;
    height: 48px;
    border-radius: 6px;
    object-fit: cover;
  }
}

.icon-overlay {
  position: absolute;
  inset: 0;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
}

.icon-preview:hover .icon-overlay {
  opacity: 1;
}

.icon-placeholder-upload {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c939d;
  background: #fafafa;
  border-radius: 6px;
}

.icon-progress {
  width: 48px;
}

.icon-tip {
  color: #909399;
  font-size: 12px;
}

.sort-hint {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
