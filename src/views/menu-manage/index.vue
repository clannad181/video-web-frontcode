<template>
  <div class="menu-manage">
    <el-card shadow="never" class="table-card fade-in">
      <template #header>
        <div class="card-header">
          <span class="header-title">菜单管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd()">新增菜单</el-button>
        </div>
      </template>

      <el-table
        :data="tableData"
        v-loading="loading"
        row-key="id"
        default-expand-all
        class="menu-table"
        :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="title" label="菜单名称" min-width="200">
          <template #default="{ row }">
            <div class="menu-name-cell">
              <el-icon v-if="row.icon" :size="16" class="menu-icon"><component :is="row.icon" /></el-icon>
              <span>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="70" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.icon" :size="18" color="#909399"><component :is="row.icon" /></el-icon>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" width="180">
          <template #default="{ row }">
            <span class="mono-text">{{ row.path || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="component" label="组件路径" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="mono-text">{{ row.component || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="70" align="center">
          <template #default="{ row }">
            <span class="sort-num">{{ row.sort }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag
              :type="['', 'success', 'warning'][row.type]"
              size="small"
              effect="dark"
              round
            >
              {{ ['目录', '菜单', '按钮'][row.type] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permission" label="权限标识" width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="mono-text" v-if="row.permission">{{ row.permission }}</span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="row.type !== 2" type="primary" link size="small" @click="handleAdd(row.id)">添加子菜单</el-button>
            <el-popconfirm
              :title="`确定删除「${row.title}」吗？`"
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
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑菜单' : '新增菜单'"
      width="560px"
      destroy-on-close
      class="edit-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="edit-form"
      >
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="form.parentId"
            :data="menuTree"
            :props="{ label: 'title', children: 'children' }"
            check-strictly
            :render-after-expand="false"
            placeholder="选择上级菜单（不选则为顶级）"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="0">目录</el-radio>
            <el-radio :value="1">菜单</el-radio>
            <el-radio :value="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item v-if="form.type !== 2" label="图标">
          <el-select v-model="form.icon" placeholder="选择图标" clearable style="width: 100%">
            <el-option v-for="icon in iconOptions" :key="icon" :label="icon" :value="icon">
              <div class="icon-option">
                <el-icon><component :is="icon" /></el-icon>
                <span>{{ icon }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type !== 2" label="路由路径" prop="path">
          <el-input v-model="form.path" placeholder="如 /user/manage" />
        </el-form-item>
        <el-form-item v-if="form.type === 1" label="组件路径" prop="component">
          <el-input v-model="form.component" placeholder="如 views/user/manage" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.type === 2" label="权限标识">
          <el-input v-model="form.permission" placeholder="如 user:add, user:edit" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, WarningFilled } from '@element-plus/icons-vue'
import { getMenuList, createMenu, updateMenu, deleteMenu } from '@/api/menu'

const loading = ref(false)
const saving = ref(false)
const tableData = ref([])
const menuTree = ref([])

const dialogVisible = ref(false)
const isEditing = ref(false)
const formRef = ref(null)

const iconOptions = [
  'HomeFilled', 'Setting', 'User', 'UserFilled', 'VideoCamera', 'ChatDotRound',
  'View', 'Document', 'Folder', 'Menu', 'Lock', 'Key', 'Bell', 'Warning',
  'SuccessFilled', 'CircleCloseFilled', 'InfoFilled', 'Search', 'Download',
  'Upload', 'Plus', 'Delete', 'Edit', 'Refresh', 'DataLine', 'TrendCharts'
]

const form = reactive({
  id: null,
  parentId: null,
  type: 0,
  title: '',
  icon: '',
  path: '',
  component: '',
  sort: 0,
  status: 1,
  permission: ''
})

const rules = {
  title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getMenuList()
    tableData.value = res.data
    menuTree.value = [{ id: 0, title: '顶级菜单', children: res.data }]
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.id = null
  form.parentId = null
  form.type = 0
  form.title = ''
  form.icon = ''
  form.path = ''
  form.component = ''
  form.sort = 0
  form.status = 1
  form.permission = ''
}

const handleAdd = (parentId) => {
  isEditing.value = false
  resetForm()
  form.parentId = parentId || null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEditing.value = true
  resetForm()
  form.id = row.id
  form.parentId = row.parentId
  form.type = row.type
  form.title = row.title
  form.icon = row.icon
  form.path = row.path
  form.component = row.component
  form.sort = row.sort
  form.status = row.status
  form.permission = row.permission
  dialogVisible.value = true
}

const handleSave = async () => {
  await formRef.value.validate()
  saving.value = true
  try {
    if (isEditing.value) {
      await updateMenu(form.id, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createMenu({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id) => {
  await deleteMenu(id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(fetchData)
</script>

<style lang="scss" scoped>
.menu-manage {
  padding: 0;
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

.menu-table {
  :deep(.el-table__header th) {
    background: #fafafa;
    font-weight: 600;
    color: #606266;
    font-size: 13px;
  }
}

.menu-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-icon {
  color: #409eff;
}

.mono-text {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 13px;
  color: #606266;
}

.sort-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 24px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.text-muted {
  color: #c0c4cc;
}

.edit-form {
  max-height: 480px;
  overflow-y: auto;
  padding-right: 8px;
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
