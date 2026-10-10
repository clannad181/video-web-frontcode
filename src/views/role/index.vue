<template>
  <div class="role-manage">
    <el-card shadow="never" class="table-card fade-in">
      <template #header>
        <div class="card-header">
          <span class="header-title">{{ $t('角色管理') }}</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">{{ $t('新增角色') }}</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe row-key="id" class="role-table">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="name" :label="$t('角色名称')" width="140">
          <template #default="{ row }">
            <span class="role-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" :label="$t('角色标识')" width="140">
          <template #default="{ row }">
            <span class="mono-text">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="level" :label="$t('等级')" width="80" align="center">
          <template #default="{ row }">
            <span class="level-num">{{ row.level }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('状态')" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
              style="--el-switch-on-color: #67c23a"
            />
          </template>
        </el-table-column>
        <el-table-column prop="isSystem" :label="$t('系统保留')" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isSystem" type="warning" effect="dark" size="small" round>
              {{ $t('系统') }}
            </el-tag>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="creator" :label="$t('创建人')" width="100" />
        <el-table-column prop="createTime" :label="$t('创建时间')" width="170" />
        <el-table-column :label="$t('操作')" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">{{ $t('编辑') }}</el-button>
            <el-popconfirm
              :title="$t('确定删除角色「{name}」吗？', { name: row.name })"
              :confirm-button-text="$t('确定')"
              :cancel-button-text="$t('取消')"
              :icon="WarningFilled"
              icon-color="#E6A23C"
              :disabled="row.isSystem"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button type="danger" link size="small" :disabled="row.isSystem">{{ $t('删除') }}</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      destroy-on-close
      class="edit-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
        class="edit-form"
      >
        <el-form-item :label="$t('角色名称')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('请输入角色名称')" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('角色标识')" prop="code">
          <el-input v-model="form.code" :placeholder="$t('如 admin, editor')" :disabled="isEditing" />
        </el-form-item>
        <el-form-item :label="$t('等级')" prop="level">
          <el-input-number v-model="form.level" :min="1" :max="99" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$t('描述')">
          <el-input v-model="form.description" type="textarea" :rows="3" :placeholder="$t('请输入角色描述')" />
        </el-form-item>
        <el-form-item :label="$t('状态')">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">{{ $t('正常') }}</el-radio>
            <el-radio :value="0">{{ $t('禁用') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('菜单权限')">
          <div class="menu-tree-wrap">
            <el-tree
              ref="menuTreeRef"
              :data="menuTree"
              :props="{ label: 'title', children: 'children' }"
              show-checkbox
              node-key="id"
              :default-checked-keys="form.menuIds"
              class="menu-tree"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
          <el-button type="primary" :loading="saving" @click="handleSave">{{ $t('确定') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, WarningFilled } from '@element-plus/icons-vue'
import { getRoleList, addRole as createRole, updateRole, deleteRole } from '@/api/role'
import { getMenuList } from '@/api/menu'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const loading = ref(false)
const tableData = ref([])
const saving = ref(false)

const dialogVisible = ref(false)
const isEditing = ref(false)
const formRef = ref(null)
const menuTreeRef = ref(null)
const menuTree = ref([])

const dialogTitle = computed(() => (isEditing.value ? t('编辑角色') : t('新增角色')))

const form = reactive({
  id: null,
  name: '',
  code: '',
  level: 1,
  description: '',
  status: 1,
  menuIds: []
})

const rules = {
  name: [{ required: true, message: t('请输入角色名称'), trigger: 'blur' }],
  code: [{ required: true, message: t('请输入角色标识'), trigger: 'blur' }],
  level: [{ required: true, message: t('请输入等级'), trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRoleList()
    tableData.value = res.data.list
  } finally {
    loading.value = false
  }
}

const fetchMenuTree = async () => {
  const res = await getMenuList()
  menuTree.value = res.data
}

const resetForm = () => {
  form.id = null
  form.name = ''
  form.code = ''
  form.level = 1
  form.description = ''
  form.status = 1
  form.menuIds = []
}

const handleAdd = () => {
  isEditing.value = false
  resetForm()
  dialogVisible.value = true
  nextTick(() => {
    menuTreeRef.value?.setCheckedKeys([])
  })
}

const handleEdit = (row) => {
  isEditing.value = true
  resetForm()
  form.id = row.id
  form.name = row.name
  form.code = row.code
  form.level = row.level
  form.description = row.description
  form.status = row.status
  form.menuIds = row.menuIds || []
  dialogVisible.value = true
  nextTick(() => {
    menuTreeRef.value?.setCheckedKeys(form.menuIds)
  })
}

const handleSave = async () => {
  await formRef.value.validate()
  saving.value = true
  try {
    const data = { ...form }
    data.menuIds = menuTreeRef.value?.getCheckedKeys() || []
    if (isEditing.value) {
      await updateRole(form.id, data)
      ElMessage.success(t('更新成功'))
    } else {
      await createRole(data)
      ElMessage.success(t('创建成功'))
    }
    dialogVisible.value = false
    fetchData()
  } finally {
    saving.value = false
  }
}

const handleStatusChange = async (row) => {
  await updateRole({ id: row.id, status: row.status })
  ElMessage.success(t('状态已更新'))
}

const handleDelete = async (id) => {
  await deleteRole(id)
  ElMessage.success(t('删除成功'))
  fetchData()
}

onMounted(() => {
  fetchData()
  fetchMenuTree()
})
</script>

<style lang="scss" scoped>
.role-manage {
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

.role-table {
  :deep(.el-table__header th) {
    background: #fafafa;
    font-weight: 600;
    color: #606266;
    font-size: 13px;
  }
}

.role-name {
  color: #303133;
  font-weight: 500;
}

.mono-text {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 13px;
  color: #606266;
}

.level-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 24px;
  background: #f0f9ff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #409eff;
}

.text-muted {
  color: #c0c4cc;
}

.edit-form {
  max-height: 480px;
  overflow-y: auto;
  padding-right: 8px;
}

.menu-tree-wrap {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
  max-height: 240px;
  overflow-y: auto;
  width: 100%;
  background: #fafafa;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 4px; }
}

.menu-tree {
  :deep(.el-tree-node__content) {
    height: 32px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
