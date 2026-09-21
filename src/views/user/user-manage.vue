<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <span class="page-sub">管理系统用户与管理员账号</span>
    </div>

    <div class="tab-bar">
      <div class="tab-track full-width">
        <div class="tab-slider" :style="{ transform: activeTab === 'admin' ? 'translateX(0)' : 'translateX(100%)' }">
        </div>
        <button class="tab-item" :class="{ active: activeTab === 'admin' }" @click="switchTab('admin')">管理人员</button>
        <button class="tab-item" :class="{ active: activeTab === 'user' }" @click="switchTab('user')">用户</button>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">用户名</label>
          <input v-model="filter.userName" class="filter-input" placeholder="输入用户名" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">昵称</label>
          <input v-model="filter.nikeName" class="filter-input" placeholder="输入昵称" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">邮箱</label>
          <input v-model="filter.email" class="filter-input" placeholder="输入邮箱" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">状态</label>
          <div class="select-wrap" :class="{ open: statusOpen }">
            <select v-model="filter.status" class="filter-select" @mousedown="statusOpen = true" @blur="statusOpen = false">
              <option value="">全部</option>
              <option value="0">启用</option>
              <option value="1">禁用</option>
            </select>
          </div>
        </div>
        <div v-if="activeTab === 'admin'" class="filter-item filter-item-role">
          <label class="filter-label">角色</label>
          <div class="select-wrap" :class="{ open: roleOpen }">
            <select v-model="filter.roleId" class="filter-select" @mousedown="roleOpen = true" @blur="roleOpen = false">
              <option value="">全部</option>
              <option v-for="r in roleOptions" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </div>
        </div>
        <div class="filter-actions" :class="{ 'filter-actions-inline': activeTab === 'admin' }">
          <button class="btn btn-outline" @click="onReset">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            重置
          </button>
          <button class="btn btn-primary" @click="onSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            搜索
          </button>
        </div>
      </div>
      <div class="filter-bottom">
        <button class="btn btn-add" @click="openAdd">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          新增用户
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>头像</th>
              <th>用户名</th>
              <th>昵称</th>
              <th>邮箱</th>
              <th v-if="activeTab === 'admin'">角色</th>
              <th v-if="activeTab === 'user'">大会员</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in list" :key="row.id" v-loading="loading">
              <td>{{ (pagination.page - 1) * pagination.size + idx + 1 }}</td>
              <td>
                <img v-if="row.avatar" :src="row.avatar" class="user-avatar" />
                <div v-else class="user-avatar avatar-fb">{{ (row.userName || '?')[0].toUpperCase() }}</div>
              </td>
              <td>{{ row.userName }}</td>
              <td>{{ row.nikeName || '-' }}</td>
              <td>{{ row.email || '-' }}</td>
              <td v-if="activeTab === 'admin'">{{ row.roleName || '-' }}</td>
              <td v-if="activeTab === 'user'">
                <span class="vip-pill" :class="{ active: row.isVip }">{{ row.isVip ? '是' : '否' }}</span>
              </td>
              <td>
                <span class="status-pill" :class="row.status === 0 ? 'active' : 'disabled'">{{ row.status === 0 ? '启用' :
                  '禁用' }}</span>
              </td>
              <td>{{ row.createTime }}</td>
              <td>
                <div v-if="canOperate(row)" class="action-group">
                  <button class="act-btn act-amber" @click="openEdit(row)">编辑</button>
                  <button class="act-btn act-pink" @click="handleResetPwd(row)">重置密码</button>
                  <button class="act-btn act-red" @click="handleDelete(row)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && list.length === 0" class="empty-state">暂无数据</div>

      <div class="pagination">
        <div class="page-info">共 {{ pagination.total }} 个用户</div>
        <div class="page-btns">
          <button class="pg-btn" :disabled="pagination.page <= 1" @click="goPage(pagination.page - 1)">&#8249;</button>
          <button v-for="p in visiblePages" :key="p" class="pg-btn" :class="{ active: p === pagination.page }"
            @click="goPage(p)">{{ p }}</button>
          <button class="pg-btn" :disabled="pagination.page >= totalPages"
            @click="goPage(pagination.page + 1)">&#8250;</button>
        </div>
        <select v-model="pagination.size" class="size-sel" @change="onPageSizeChange">
          <option :value="10">10 条/页</option>
          <option :value="20">20 条/页</option>
          <option :value="50">50 条/页</option>
          <option :value="100">100 条/页</option>
        </select>
      </div>
    </div>

    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="editVisible" class="modal-overlay" @click.self="closeEdit">
          <div class="modal-card modal-std" :class="{ closing: editClosing }" @click.stop>
            <div class="modal-header">
              <h3>{{ isEditing ? '编辑用户' : '新增用户' }}</h3>
              <button class="modal-close" @click="closeEdit">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-section">
                <div class="section-title">基础信息</div>
                <div class="fg">
                  <label class="fl">用户名 <span class="req">*</span></label>
                  <input v-model="editForm.userName" class="fi" placeholder="请输入用户名" :disabled="isEditing" />
                  <span v-if="isEditing" class="field-hint">用户名创建后不可修改</span>
                </div>
                <div v-if="!isEditing" class="fg">
                  <label class="fl">密码 <span class="req">*</span></label>
                  <input v-model="editForm.password" type="password" class="fi" placeholder="请输入密码" />
                </div>
                <div class="form-row">
                  <div class="fg half">
                    <label class="fl">昵称</label>
                    <input v-model="editForm.nikeName" class="fi" placeholder="请输入昵称" />
                  </div>
                  <div class="fg half">
                    <label class="fl">邮箱</label>
                    <input v-model="editForm.email" class="fi" placeholder="请输入邮箱" />
                  </div>
                </div>
              </div>

              <div class="form-section">
                <div class="section-title">账号设置</div>
                <div class="form-row">
                  <div v-if="isEditing && activeTab === 'admin'" class="fg half">
                    <label class="fl">角色</label>
                    <select v-model="editForm.roleId" class="fi">
                      <option v-for="r in roleOptions" :key="r.id" :value="r.id">{{ r.name }}</option>
                    </select>
                  </div>
                  <div v-if="activeTab === 'user'" class="fg half">
                    <label class="fl">是否大会员</label>
                    <div class="toggle-wrap">
                      <button class="toggle-btn" :class="{ on: editForm.isVip }" @click="editForm.isVip = editForm.isVip ? 0 : 1">
                        <span class="toggle-knob"></span>
                      </button>
                      <span class="toggle-label">{{ editForm.isVip ? '是' : '否' }}</span>
                    </div>
                  </div>
                </div>
                <div class="form-row">
                  <div class="fg half">
                    <label class="fl">性别</label>
                    <select v-model="editForm.sex" class="fi">
                      <option :value="true">男</option>
                      <option :value="false">女</option>
                    </select>
                  </div>
                  <div class="fg half">
                    <label class="fl">账号状态</label>
                    <div class="toggle-wrap">
                      <button class="toggle-btn" :class="{ on: editForm.status === 0 }" @click="editForm.status = editForm.status === 0 ? 1 : 0">
                        <span class="toggle-knob"></span>
                      </button>
                      <span class="toggle-label">{{ editForm.status === 0 ? '启用' : '禁用' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="activeTab === 'user'" class="form-section">
                <div class="section-title">用户资料</div>
                <div class="fg">
                  <label class="fl">个性签名</label>
                  <input v-model="editForm.descript" class="fi" placeholder="请输入个性签名" />
                </div>
                <div class="fg">
                  <label class="fl">头像</label>
                  <div class="avatar-editor">
                    <div class="cover-upload" @click="$refs.avatarInput.click()">
                      <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="onAvatarChange" />
                      <img v-if="editForm.avatar" :src="editForm.avatar" class="cover-preview" />
                      <div v-else class="cover-ph">
                        <el-icon :size="28"><Plus /></el-icon>
                        <span>上传头像</span>
                      </div>
                    </div>
                    <button v-if="editForm.avatar" class="btn btn-sm btn-outline btn-danger-text" @click.stop="editForm.avatar = ''">更换头像</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeEdit" :disabled="saving">取消</button>
              <button class="btn btn-primary" @click="onSave" :disabled="saving">
                <span v-if="saving" class="spinner"></span>
                {{ saving ? '保存中...' : '保存修改' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="resetPwdVisible" class="modal-overlay" @click.self="resetPwdVisible = false">
          <div class="modal-card modal-sm" @click.stop>
            <div class="modal-header">
              <h3>重置密码确认</h3>
              <button class="modal-close" @click="resetPwdVisible = false">&times;</button>
            </div>
            <div class="modal-body">
              <div class="confirm-icon warn"><el-icon :size="24"><WarningFilled /></el-icon></div>
              <p class="confirm-msg">确定要重置以下用户的密码？</p>
              <div class="confirm-field">
                <span class="field-label">用户名</span>
                <span class="field-val">{{ resetPwdUser?.userName }}</span>
              </div>
              <p class="confirm-warn">重置密码后，原密码将立即失效。</p>
              <p class="confirm-warn">请确认是否继续。</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="resetPwdVisible = false">取消</button>
              <button class="btn btn-danger" @click="confirmResetPwd" :disabled="resetPwdLoading">
                <span v-if="resetPwdLoading" class="spinner"></span>
                {{ resetPwdLoading ? '重置中...' : '确认重置' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="deleteVisible" class="modal-overlay" @click.self="deleteVisible = false">
          <div class="modal-card modal-sm" @click.stop>
            <div class="modal-header">
              <h3>删除用户</h3>
              <button class="modal-close" @click="deleteVisible = false">&times;</button>
            </div>
            <div class="modal-body">
              <div class="confirm-icon danger"><el-icon :size="24"><WarningFilled /></el-icon></div>
              <p class="confirm-msg">确定删除用户「{{ deleteTarget?.userName }}」？</p>
              <div class="confirm-consequences">
                <p>删除后：</p>
                <ul>
                  <li>用户将无法登录</li>
                  <li>用户将从人员列表中移除</li>
                  <li>相关数据可能受到影响</li>
                </ul>
              </div>
              <p class="confirm-warn">此操作请谨慎执行。</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="deleteVisible = false">取消</button>
              <button class="btn btn-danger" @click="confirmDelete" :disabled="deleteLoading">
                <span v-if="deleteLoading" class="spinner"></span>
                {{ deleteLoading ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, WarningFilled } from '@element-plus/icons-vue'
import { getUserList, addUser, updateUser, deleteUser, resetPassword, getRoleList } from '@/api/user'
import { uploadFile } from '@/api/file'

const loading = ref(false)
const statusOpen = ref(false)
const roleOpen = ref(false)
const list = ref([])
const activeTab = ref('admin')
const filter = reactive({ userName: '', nikeName: '', email: '', status: '', roleId: '' })
const pagination = ref({ page: 1, size: 10, total: 0 })
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.size) || 1)
const visiblePages = computed(() => {
  const pages = []; const cur = pagination.value.page; const total = totalPages.value
  for (let i = Math.max(1, cur - 2); i <= Math.min(total, cur + 2); i++) pages.push(i)
  return pages
})

const goPage = (p) => { if (p >= 1 && p <= totalPages.value) { pagination.value.page = p; fetchData() } }
const onPageSizeChange = () => { pagination.value.page = 1; fetchData() }

const roleOptions = ref([])
const currentUser = ref(null)

onMounted(() => {
  try { currentUser.value = JSON.parse(localStorage.getItem('user')) } catch { }
  fetchRoles()
  fetchData()
})

const fetchRoles = async () => {
  try {
    const res = await getRoleList()
    const d = res.data
    roleOptions.value = Array.isArray(d) ? d : (d?.records || d?.list || [])
  } catch { console.error('加载角色选项失败') }
}

const canOperate = (row) => {
  if (activeTab.value === 'user') return true
  if (!currentUser.value) return false
  return (row.level || 0) >= (currentUser.value.roleLevel || 0)
}

const fetchData = async () => {
  loading.value = true
  try {
    const p = { page: pagination.value.page, size: pagination.value.size, type: activeTab.value === 'admin' ? 1 : 0 }
    if (filter.userName) p.userName = filter.userName
    if (filter.nikeName) p.nikeName = filter.nikeName
    if (filter.email) p.email = filter.email
    if (filter.status !== '') p.status = filter.status
    if (activeTab.value === 'admin' && filter.roleId) p.roleId = filter.roleId
    const res = await getUserList(p)
    list.value = res.data?.records || []
    pagination.value.total = res.data?.total || 0
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const onSearch = () => { pagination.value.page = 1; fetchData() }
const onReset = () => { Object.assign(filter, { userName: '', nikeName: '', email: '', status: '', roleId: '' }); onSearch() }
const switchTab = (t) => { activeTab.value = t; pagination.value.page = 1; Object.assign(filter, { userName: '', nikeName: '', email: '', status: '', roleId: '' }); fetchData() }

const editVisible = ref(false)
const editClosing = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const saving = ref(false)
const editForm = reactive({ userName: '', password: '', nikeName: '', email: '', roleId: '', isVip: 0, sex: true, status: 0, descript: '', avatar: '' })

const resetEditForm = () => {
  Object.assign(editForm, { userName: '', password: '', nikeName: '', email: '', roleId: '', isVip: 0, sex: true, status: 0, descript: '', avatar: '' })
  editingId.value = null; saving.value = false
}

const openAdd = () => { isEditing.value = false; resetEditForm(); editVisible.value = true }
const openEdit = (row) => {
  isEditing.value = true; resetEditForm(); editingId.value = row.id
  Object.assign(editForm, {
    userName: row.userName || '', nikeName: row.nikeName || '', email: row.email || '',
    roleId: row.roleId || '', isVip: row.isVip || 0, sex: row.sex !== false,
    status: row.status || 0, descript: row.descript || '', avatar: row.avatar || ''
  })
  editVisible.value = true
}
const closeEdit = () => { editClosing.value = true; setTimeout(() => { editVisible.value = false; editClosing.value = false }, 200) }

const onAvatarChange = async (e) => {
  const file = e.target.files?.[0]; if (!file) return
  try { const r = await uploadFile(file, { category: 'image' }); editForm.avatar = r.url } catch (err) { ElMessage.error(err.message || '上传失败') }
}

const md5 = (str) => { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0 } return Math.abs(h).toString(16).padStart(8, '0') }

const onSave = async () => {
  if (!editForm.userName) return ElMessage.warning('请填写用户名')
  if (!isEditing.value && !editForm.password) return ElMessage.warning('请填写密码')
  if (saving.value) return
  saving.value = true
  try {
    if (isEditing.value) {
      const d = { id: editingId.value, nikeName: editForm.nikeName || undefined, email: editForm.email || undefined, roleId: editForm.roleId || undefined, avatar: editForm.avatar || undefined, isVip: editForm.isVip, sex: editForm.sex, descript: editForm.descript || undefined, status: editForm.status }
      await updateUser(d); ElMessage.success('用户更新成功')
    } else {
      const d = { userName: editForm.userName, password: md5(editForm.password), nikeName: editForm.nikeName || undefined, email: editForm.email || undefined, roleId: editForm.roleId || undefined, avatar: editForm.avatar || undefined, isVip: editForm.isVip, sex: editForm.sex, descript: editForm.descript || undefined, type: activeTab.value === 'admin' ? 1 : 0, status: editForm.status }
      await addUser(d); ElMessage.success('用户创建成功')
    }
    closeEdit(); fetchData()
  } catch (e) { console.error('保存用户失败'); ElMessage.error(e.message || '保存失败') } finally { saving.value = false }
}

const resetPwdVisible = ref(false)
const resetPwdUser = ref(null)
const resetPwdLoading = ref(false)

const handleResetPwd = (row) => { resetPwdUser.value = row; resetPwdVisible.value = true }
const confirmResetPwd = async () => {
  if (resetPwdLoading.value) return
  resetPwdLoading.value = true
  try {
    await resetPassword(resetPwdUser.value.id, activeTab.value === 'admin' ? 1 : 0)
    ElMessage.success('密码重置成功')
    resetPwdVisible.value = false
  } catch (e) { ElMessage.error(e.message || '重置失败') } finally { resetPwdLoading.value = false }
}

const deleteVisible = ref(false)
const deleteTarget = ref(null)
const deleteLoading = ref(false)

const handleDelete = (row) => { deleteTarget.value = row; deleteVisible.value = true }
const confirmDelete = async () => {
  if (deleteLoading.value) return
  deleteLoading.value = true
  try {
    await deleteUser(deleteTarget.value.id)
    ElMessage.success('用户删除成功')
    deleteVisible.value = false
    fetchData()
  } catch (e) { ElMessage.error(e.message || '删除失败') } finally { deleteLoading.value = false }
}
</script>

<style lang="scss" scoped>
.page-container {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px;
}

.page-sub {
  font-size: 13px;
  color: var(--text-secondary, #909399);
}

.tab-bar {
  margin-bottom: 16px;
}

.tab-track {
  display: flex;
  background: var(--card-bg, #fff);
  border-radius: 8px;
  padding: 4px;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.tab-track.full-width {
  width: 100%;
}

.tab-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.tab-item {
  flex: 1;
  padding: 8px 24px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  position: relative;
  z-index: 1;
  transition: color 0.2s;
  color: var(--text-secondary, #909399);
  text-align: center;
}

.tab-item.active {
  color: var(--color-primary, #fb7299);
}

.filter-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid var(--border-color, #e4e7ed);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  font-weight: 500;
}

.filter-input,
.filter-select {
  height: 40px;
  border-radius: 12px;
  border: none;
  padding: 0 14px;
  font-size: 13px;
  background-color: var(--bg-color, #f5f7fa);
  background-repeat: no-repeat;
  outline: none;
  transition: all 0.2s;
  color: var(--text-primary, #303133);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);

  &:focus {
    background-color: var(--card-bg, #fff);
    box-shadow: 0 0 0 2px rgba(251, 114, 153, 0.25);
  }
}

.filter-select {
  cursor: pointer;
  appearance: none;
  background-color: var(--bg-color, #f5f7fa);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
  padding-right: 32px;
  transition: all 0.2s;

  &:focus {
    background-color: var(--card-bg, #fff);
    box-shadow: 0 0 0 2px rgba(251,114,153,0.25);
  }
}

.select-wrap {
  position: relative;
  .filter-select { width: 100%; }
  &::after {
    content: '';
    position: absolute;
    right: 12px;
    top: 50%;
    width: 0;
    height: 0;
    border-left: 4.5px solid transparent;
    border-right: 4.5px solid transparent;
    border-top: 5.5px solid var(--text-secondary, #909399);
    pointer-events: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateY(-60%);
  }
  &:hover::after {
    border-top-color: var(--color-primary, #fb7299);
  }
  &.open::after {
    border-top-color: var(--color-primary, #fb7299);
    transform: translateY(-40%) rotate(180deg);
  }
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  justify-content: flex-end;
  grid-column: 1 / -1;
}

.filter-actions-inline {
  grid-column: 2 / -1;
}

.filter-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color, #e4e7ed);
}

.btn {
  height: 36px;
  padding: 0 22px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.3px;

  svg {
    flex-shrink: 0;
  }

  &.btn-primary {
    background: linear-gradient(135deg, var(--color-primary, #fb7299) 0%, #ff9ac6 100%);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(251, 114, 153, 0.25);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(251, 114, 153, 0.4);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(251, 114, 153, 0.25);
    }
  }

  &.btn-secondary {
    background: var(--bg-color, #f5f7fa);
    color: var(--text-primary, #303133);
    border-color: var(--border-color, #dcdfe6);

    &:hover {
      background: var(--border-color, #ebedf0);
      border-color: #c0c4cc;
    }
  }

  &.btn-outline {
    background: transparent;
    color: var(--text-secondary, #909399);
    border-color: var(--border-color, #dcdfe6);

    &:hover {
      color: var(--color-primary, #fb7299);
      border-color: var(--color-primary, #fb7299);
      background: rgba(251, 114, 153, 0.04);
    }
  }

  &.btn-add {
    background: linear-gradient(135deg, var(--color-primary, #fb7299) 0%, #ff9ac6 100%);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(251, 114, 153, 0.25);
    padding: 0 26px;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(251, 114, 153, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none !important;
  }
}

.table-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: center;
}

.data-table th {
  padding: 12px 14px;
  text-align: center;
  font-weight: 600;
  color: var(--text-secondary, #909399);
  background: var(--bg-color, #fafafa);
  border-bottom: 1px solid var(--border-color, #ebeef5);
  white-space: nowrap;
  font-size: 12px;
}

.data-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color, #f2f3f5);
  color: var(--text-primary, #303133);
  vertical-align: middle;
  text-align: center;
}

.data-table tbody tr:hover {
  background: var(--hover-bg, #f5f7fa);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  margin: 0 auto;
}

.avatar-fb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(251, 114, 153, 0.15), rgba(251, 114, 153, 0.3));
  color: var(--color-primary, #fb7299);
  font-weight: 600;
  font-size: 14px;
  border-radius: 50%;
}

.status-pill {
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
}

.status-pill.active {
  color: #67c23a;
  background: rgba(103,194,58,0.1);
}

.status-pill.disabled {
  color: #f56c6c;
  background: rgba(245,108,108,0.1);
}

.vip-pill {
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
}

.vip-pill.active {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
}

.vip-pill:not(.active) {
  color: var(--text-secondary, #909399);
  background: var(--bg-color, #f5f7fa);
}

.action-group {
  display: flex;
  gap: 6px;
  justify-content: center;
  white-space: nowrap;
}

.act-btn {
  padding: 7px 15px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.act-amber {
  color: #ffc107;
  background: rgba(255, 193, 7, 0.1);

  &:hover {
    color: #fff;
    background: #ffc107;
  }
}

.act-pink {
  color: var(--color-primary, #fb7299);
  background: rgba(251, 114, 153, 0.1);

  &:hover {
    color: #fff;
    background: var(--color-primary, #fb7299);
  }
}

.act-red {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);

  &:hover {
    color: #fff;
    background: #f56c6c;
  }
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary, #909399);
  font-size: 13px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 10px;
}

.page-info {
  font-size: 13px;
  color: var(--text-secondary, #909399);
}

.page-btns {
  display: flex;
  gap: 4px;
}

.pg-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-color, #dcdfe6);
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.pg-btn:hover:not(:disabled) {
  border-color: var(--color-primary, #fb7299);
  color: var(--color-primary, #fb7299);
}

.pg-btn.active {
  background: var(--color-primary, #fb7299);
  color: #fff;
  border-color: var(--color-primary, #fb7299);
}

.pg-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.size-sel {
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-color, #dcdfe6);
  padding: 0 8px;
  font-size: 12px;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-card {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-std {
  width: 480px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px 16px;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary, #909399);
  padding: 0;
  line-height: 1;
  transition: all 0.2s;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.modal-close:hover {
  color: var(--text-primary, #303133);
  background: var(--bg-color, #f5f7fa);
}

.modal-body {
  padding: 4px 28px 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 28px;
  border-top: 1px solid var(--border-color, #f2f3f5);
  flex-shrink: 0;
}

.fg {
  margin-bottom: 16px;
}

.fg:last-child {
  margin-bottom: 0;
}

.fl {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #303133);
  margin-bottom: 6px;
}

.req {
  color: #f56c6c;
}

.fi {
  width: 100%;
  height: 40px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #e4e7ed);
  padding: 0 14px;
  font-size: 13px;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  outline: none;
  transition: all 0.25s ease;
  box-sizing: border-box;
}

.fi:focus {
  border-color: var(--color-primary, #fb7299);
  box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.1);
}

.fi:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg-color, #f5f7fa);
}

select.fi {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23909399' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.toggle-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
}

.toggle-btn {
  width: 48px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background: var(--border-color, #dcdfe6);
  cursor: pointer;
  position: relative;
  transition: background 0.25s ease;
  padding: 0;
  flex-shrink: 0;
}

.toggle-btn.on {
  background: var(--color-primary, #fb7299);
}

.toggle-knob {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.toggle-btn.on .toggle-knob {
  transform: translateX(22px);
}

.toggle-label {
  font-size: 13px;
  color: var(--text-secondary, #909399);
}

.cover-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  position: relative;
}

.cover-upload {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px dashed var(--border-color, #dcdfe6);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.25s ease;
  position: relative;
  flex-shrink: 0;
}

.cover-upload:hover {
  border-color: var(--color-primary, #fb7299);
  transform: scale(1.03);
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-rm-x {
  position: absolute;
  top: 0;
  right: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.cover-ph {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--text-secondary, #909399);

  span {
    font-size: 11px;
  }
}

.form-section {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--bg-color, #f9fafc);
  border-radius: 12px;
  transition: background 0.2s;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid var(--color-primary, #fb7299);
}

.form-row {
  display: flex;
  gap: 14px;
}

.fg.half {
  flex: 1;
}

.field-hint {
  font-size: 11px;
  color: var(--text-secondary, #909399);
  margin-top: 4px;
  display: block;
}

.avatar-editor {
  display: flex;
  align-items: flex-end;
  gap: 14px;
}
.modal-sm { width: 420px; }
.confirm-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.confirm-icon.warn { background: rgba(255,193,7,0.12); color: #ffc107; }
.confirm-icon.danger { background: rgba(245,108,108,0.12); color: #f56c6c; }
.confirm-msg { text-align: center; font-size: 14px; font-weight: 500; color: var(--text-primary, #303133); margin: 0 0 14px; }
.confirm-field { background: var(--bg-color, #f5f7fa); border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.confirm-field .field-label { font-size: 12px; color: var(--text-secondary, #909399); }
.confirm-field .field-val { font-size: 13px; font-weight: 500; color: var(--text-primary, #303133); }
.confirm-consequences { margin-bottom: 10px; }
.confirm-consequences p { font-size: 13px; color: var(--text-primary, #303133); margin: 0 0 8px; font-weight: 500; }
.confirm-consequences ul { margin: 0; padding-left: 18px; }
.confirm-consequences li { font-size: 13px; color: var(--text-secondary, #606266); line-height: 1.8; }
.confirm-warn { font-size: 12px; color: var(--text-secondary, #909399); margin: 0 0 4px; }
.btn-danger { background: #f56c6c; color: #fff; border: none; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; &:hover { background: #f78989; } &:disabled { opacity: 0.6; cursor: not-allowed; } }
.btn-outline { background: transparent; border: 1px solid var(--border-color, #dcdfe6); color: var(--text-primary, #303133); padding: 6px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.2s; &:hover { border-color: var(--color-primary, #fb7299); color: var(--color-primary, #fb7299); } }
.btn-danger-text { color: #f56c6c; &:hover { color: #f78989; border-color: #f56c6c; } }

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-fade-enter-active {
  transition: opacity 0.2s ease;

  .modal-card {
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
  }
}

.modal-fade-leave-active {
  transition: opacity 0.2s ease;

  .modal-card {
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
}

.modal-fade-enter-from {
  opacity: 0;

  .modal-card {
    transform: scale(0.9) translateY(16px);
    opacity: 0;
  }
}

.modal-fade-leave-to {
  opacity: 0;

  .modal-card {
    transform: scale(0.95);
    opacity: 0;
  }
}

.modal-card.closing {
  animation: modalOut 0.2s ease forwards;
}

@keyframes modalOut {
  to {
    transform: scale(0.95);
    opacity: 0;
  }
}

html.dark-mode {

  .filter-card,
  .table-card {
    background: var(--card-bg);
    border-color: var(--border-color);
  }

  .data-table th {
    background: var(--bg-color);
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  .data-table td {
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  .data-table tbody tr:hover {
    background: var(--hover-bg);
  }

  .tab-track {
    background: var(--card-bg);
  }

  .tab-slider {
    background: var(--bg-color);
  }

  .filter-input,
  .filter-select,
  .fi {
    background: var(--bg-color);
    color: var(--text-primary);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
  }

  .fi:focus {
    background: var(--card-bg);
    box-shadow: 0 0 0 2px rgba(251, 114, 153, 0.3);
  }

  .pg-btn {
    background: var(--card-bg);
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  .size-sel {
    background: var(--card-bg);
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  .page-info {
    color: var(--text-secondary);
  }

  .act-amber {
    color: #ffc107 !important;
  }

  .act-pink {
    color: var(--color-primary) !important;
  }

  .act-red {
    color: #f87171 !important;
  }

  .modal-header {
    border-color: var(--border-color);

    h3 {
      color: var(--text-primary);
    }
  }

  .modal-footer {
    border-color: var(--border-color);
  }

  .cover-upload {
    border-color: var(--border-color);
  }

  .cover-ph {
    color: var(--text-secondary);
  }

  .form-section { border-color: var(--border-color); }
  .confirm-field { background: var(--card-bg); }
  .btn-danger { background: #f87171; &:hover { background: #f56c6c; } }
}
</style>
