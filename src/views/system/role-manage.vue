<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">{{ $t('角色管理') }}</h1>
      <p class="page-subtitle">{{ $t('管理系统角色和权限配置') }}</p>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">{{ $t('角色名称') }}</label>
          <input v-model="query.name" class="filter-input" :placeholder="$t('请输入角色名称')" @keyup.enter="search" />
        </div>
        <div class="filter-item">
          <label class="filter-label">{{ $t('状态') }}</label>
          <div class="select-wrap" :class="{ open: statusOpen }">
            <select v-model="query.status" class="filter-select" @mousedown="statusOpen = true" @blur="statusOpen = false">
              <option value="">{{ $t('全部') }}</option>
              <option v-for="d in statusOptions" :key="d.id ?? d.value" :value="d.value">{{ d.label }}</option>
            </select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">{{ $t('创建人') }}</label>
          <input v-model="query.createUserName" class="filter-input" :placeholder="$t('请输入创建人')" @keyup.enter="search" />
        </div>
      </div>
      <div class="filter-actions">
        <button class="btn btn-secondary" @click="resetQuery">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          {{ $t('重置') }}
        </button>
        <button class="btn btn-primary" @click="search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          {{ $t('搜索') }}
        </button>
      </div>
      <div class="filter-bottom">
        <button class="btn btn-add" @click="openAddModal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
          {{ $t('新增角色') }}
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-wrap" v-loading="loading">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-index">#</th>
              <th>{{ $t('角色名称') }}</th>
              <th>{{ $t('描述') }}</th>
              <th>{{ $t('等级') }}</th>
              <th>{{ $t('状态') }}</th>
              <th>{{ $t('系统保留') }}</th>
              <th>{{ $t('创建人') }}</th>
              <th>{{ $t('创建时间') }}</th>
              <th class="sticky-col">{{ $t('操作') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="roles.length === 0 && !loading">
              <td colspan="9" class="empty-row">{{ $t('暂无数据') }}</td>
            </tr>
            <tr v-for="(row, idx) in roles" :key="row.id" class="table-row">
              <td class="col-index">{{ (query.page - 1) * query.size + idx + 1 }}</td>
              <td class="cell-bold">{{ row.name }}</td>
              <td class="cell-desc" :title="row.description">{{ row.description || '-' }}</td>
              <td>{{ row.level ?? '-' }}</td>
              <td>
                <span class="status-badge" :class="row.status ? 'active' : 'inactive'">
                  {{ row.status ? $t('启用') : $t('禁用') }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="row.sysDef ? 'active' : 'inactive'">
                  {{ row.sysDef ? $t('是') : $t('否') }}
                </span>
              </td>
              <td>
                <template v-if="row.createUserName">
                  <span class="cell-creator" @mouseenter="showTip($event, row.createUserNickname || row.createUserName)" @mousemove="moveTip" @mouseleave="hideTip">
                    {{ row.createUserNickname || row.createUserName }}
                  </span>
                </template>
                <template v-else>
                  <span class="cell-strike">-</span>
                </template>
              </td>
              <td class="cell-muted">{{ row.createTime }}</td>
              <td class="sticky-col">
                <div v-if="canOperate(row)" class="action-group">
                  <button class="btn-action btn-edit" @click="openEditModal(row)">{{ $t('编辑') }}</button>
                  <button class="btn-action btn-bind" @click="openMenuModal(row)">{{ $t('绑定菜单') }}</button>
                  <button v-if="!row.sysDef" class="btn-action btn-delete" @click="confirmDelete(row)">{{ $t('删除') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="total > 0" class="pagination-wrap">
        <div class="page-info">{{ $t('共 {total} 条', { total }) }}</div>
        <div class="page-btns">
          <button class="pg-btn" :disabled="query.page <= 1" @click="goPage(query.page - 1)">&#8249;</button>
          <template v-for="p in pageNumbers" :key="p">
            <span v-if="p === '...'" class="pg-ellipsis">...</span>
            <button v-else class="pg-btn" :class="{ active: p === query.page }" @click="goPage(p)">{{ p }}</button>
          </template>
          <button class="pg-btn" :disabled="query.page >= totalPages" @click="goPage(query.page + 1)">&#8250;</button>
        </div>
        <select v-model.number="query.size" class="page-size-sel" @change="onPageSizeChange">
          <option :value="10">{{ $t('10 条/页') }}</option>
          <option :value="20">{{ $t('20 条/页') }}</option>
          <option :value="50">{{ $t('50 条/页') }}</option>
          <option :value="100">{{ $t('100 条/页') }}</option>
        </select>
      </div>
    </div>

    <!-- Role Edit Modal -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showRoleModal" class="modal-overlay" @click.self="showRoleModal = false">
          <div class="modal-card modal-std" @click.stop>
            <div class="modal-header">
              <h3>{{ editingRole ? $t('编辑角色') : $t('新增角色') }}</h3>
              <button class="modal-close" @click="showRoleModal = false">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-section">
                <div class="section-title">{{ $t('基础信息') }}</div>
                <div class="fg">
                  <label class="fl">{{ $t('角色名称') }} <span class="req">*</span></label>
                  <input v-model="form.name" class="fi" :placeholder="$t('请输入角色名称')" />
                </div>
                <div class="fg">
                  <label class="fl">{{ $t('描述') }}</label>
                  <input v-model="form.description" class="fi" :placeholder="$t('请输入描述')" />
                </div>
                <div class="form-row">
                  <div class="fg half">
                    <label class="fl">{{ $t('角色等级') }}</label>
                    <input v-model.number="form.level" type="number" class="fi" :placeholder="$t('请输入角色等级')" />
                  </div>
                  <div class="fg half">
                    <label class="fl">{{ $t('状态') }}</label>
                    <div class="toggle-wrap" @click="form.status = !form.status">
                      <button class="toggle-btn" :class="{ on: form.status }">
                        <span class="toggle-knob"></span>
                      </button>
                      <span class="toggle-label">{{ form.status ? $t('启用') : $t('禁用') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showRoleModal = false" :disabled="saving">{{ $t('取消') }}</button>
              <button class="btn btn-primary" @click="submitRole" :disabled="saving">
                <span v-if="saving" class="btn-loading"></span>
                {{ saving ? $t('保存中...') : $t('确认') }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Bind Menu Modal -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showMenuModal" class="modal-overlay" @click.self="showMenuModal = false">
          <div class="modal-card modal-wide" @click.stop>
            <div class="modal-header">
              <h3>{{ $t('绑定菜单') }} - {{ currentMenuRole?.name }}</h3>
              <button class="modal-close" @click="showMenuModal = false">&times;</button>
            </div>
            <div class="modal-body">
              <div v-if="menuLoading" class="menu-loading">{{ $t('加载中...') }}</div>
              <div v-else class="menu-tree-wrap">
                <div v-for="menu in menuOptions" :key="menu.id" class="menu-node">
                  <div class="menu-check menu-check-parent">
                    <label class="checkbox-wrap">
                      <input type="checkbox" :checked="menu.children && menu.children.length ? isParentChecked(menu) : boundMenuIds.includes(menu.id)" :indeterminate.prop="isIndeterminate(menu)" @change="toggleParentMenu(menu)" />
                      <span v-if="menu.icon" class="menu-icon">
                        <el-icon :size="14"><component :is="menu.icon" /></el-icon>
                      </span>
                      <span class="checkbox-label">{{ menu.menuName || menu.name }}</span>
                    </label>
                  </div>
                  <div v-if="menu.children && menu.children.length" class="menu-children">
                    <div v-for="child in menu.children" :key="child.id" class="menu-check menu-check-child">
                      <label class="checkbox-wrap">
                        <input type="checkbox" :checked="boundMenuIds.includes(child.id)" @change="toggleChildMenu(child, menu)" />
                        <span v-if="child.icon" class="menu-icon">
                          <el-icon :size="14"><component :is="child.icon" /></el-icon>
                        </span>
                        <span class="checkbox-label">{{ child.menuName || child.name }}</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div v-if="menuOptions.length === 0" class="empty-row">{{ $t('暂无菜单数据') }}</div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showMenuModal = false" :disabled="saving">{{ $t('取消') }}</button>
              <button class="btn btn-primary" @click="submitMenu" :disabled="saving">
                <span v-if="saving" class="btn-loading"></span>
                {{ saving ? $t('保存中...') : $t('确认') }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Creator Tooltip -->
    <div ref="tipRef" class="creator-tip" v-show="tipVisible" :style="{ left: tipX + 'px', top: tipY + 'px' }">
      {{ tipText }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onActivated, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUser } from '@/utils/auth'
import {
  getRoleList, addRole, updateRole, deleteRole,
  toggleMenu, getBindMenuIds, getMenuOptions
} from '@/api/role'
import { getEnabledDictData } from '@/api/dict'

const { t } = useI18n()

const roles = ref([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ name: '', status: '', createUserName: '', page: 1, size: 10 })
const statusOptions = ref([])
const currentUser = getUser()

const totalPages = computed(() => Math.ceil(total.value / query.size) || 1)
const pageNumbers = computed(() => {
  const tp = totalPages.value
  const c = query.page
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const pages = [1]
  if (c > 3) pages.push('...')
  for (let i = Math.max(2, c - 1); i <= Math.min(tp - 1, c + 1); i++) pages.push(i)
  if (c < tp - 2) pages.push('...')
  pages.push(tp)
  return pages
})

const showRoleModal = ref(false)
const editingRole = ref(null)
const form = reactive({ name: '', description: '', level: 0, status: true })

const showMenuModal = ref(false)
const currentMenuRole = ref(null)
const menuOptions = ref([])
const boundMenuIds = ref([])
const menuLoading = ref(false)

const saving = ref(false)
const statusOpen = ref(false)

// Creator tooltip state
const tipRef = ref(null)
const tipVisible = ref(false)
const tipText = ref('')
const tipX = ref(0)
const tipY = ref(0)

function showTip(e, text) {
  tipText.value = text
  tipVisible.value = true
  nextTick(() => { moveTip(e) })
}

function moveTip(e) {
  tipX.value = e.clientX + 12
  tipY.value = e.clientY - 8
}

function hideTip() {
  tipVisible.value = false
}

const canOperate = (row) => {
  if (!currentUser) return false
  return (row.level || 0) >= (currentUser.roleLevel || 0)
}

async function loadRoles() {
  loading.value = true
  try {
    const p = { page: query.page, size: query.size }
    if (query.name) p.name = query.name
    if (query.status !== '') p.status = query.status
    if (query.createUserName) p.createUserName = query.createUserName
    const res = await getRoleList(p)
    roles.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function search() { query.page = 1; loadRoles() }

function resetQuery() {
  query.name = ''
  query.status = ''
  query.createUserName = ''
  query.page = 1
  loadRoles()
}

function goPage(p) {
  if (p >= 1 && p <= totalPages.value) { query.page = p; loadRoles() }
}

function onPageSizeChange() { query.page = 1; loadRoles() }

function openAddModal() {
  editingRole.value = null
  form.name = ''
  form.description = ''
  form.level = 0
  form.status = true
  showRoleModal.value = true
}

function openEditModal(role) {
  editingRole.value = role
  form.name = role.name
  form.description = role.description || ''
  form.level = role.level || 0
  form.status = role.status
  showRoleModal.value = true
}

async function submitRole() {
  if (!form.name || !form.name.trim()) {
    ElMessage.warning(t('请填写必填项'))
    return
  }
  if (saving.value) return
  saving.value = true
  try {
    if (editingRole.value) {
      await updateRole({ id: editingRole.value.id, name: form.name, description: form.description || undefined, level: form.level, status: form.status })
      ElMessage.success(t('角色更新成功'))
    } else {
      const user = getUser()
      await addRole({ name: form.name, description: form.description || undefined, level: form.level, status: form.status, createUser: user?.id })
      ElMessage.success(t('角色创建成功'))
    }
    showRoleModal.value = false
    loadRoles()
  } catch (e) {
    console.error('保存角色失败', e)
  } finally {
    saving.value = false
  }
}

function confirmDelete(role) {
  ElMessageBox.confirm(t('确定要删除角色「{name}」吗？', { name: role.name }), t('删除确认'), { type: 'warning' })
    .then(async () => {
      await deleteRole(role.id)
      ElMessage.success(t('角色删除成功'))
      loadRoles()
    }).catch(() => {})
}

// ---- Bind Menu ----

function collectDescendantIds(menu) {
  const ids = []
  if (menu.children) {
    menu.children.forEach(c => {
      ids.push(c.id)
      ids.push(...collectDescendantIds(c))
    })
  }
  return ids
}

async function openMenuModal(role) {
  currentMenuRole.value = role
  showMenuModal.value = true
  menuLoading.value = true
  boundMenuIds.value = []
  try {
    const [bindRes, menuRes] = await Promise.all([getBindMenuIds(role.id), getMenuOptions()])
    boundMenuIds.value = bindRes.data || []
    menuOptions.value = menuRes.data || []
  } catch (e) {
    console.error('加载菜单数据失败', e)
  } finally {
    menuLoading.value = false
  }
}

function toggleParentMenu(menu) {
  if (menu.children && menu.children.length) {
    const allChecked = isParentChecked(menu)
    const desc = collectDescendantIds(menu)
    if (allChecked) {
      removeId(menu.id)
      desc.forEach(id => removeId(id))
    } else {
      addId(menu.id)
      desc.forEach(id => addId(id))
    }
  } else {
    // 叶子节点：直接切换自身
    if (boundMenuIds.value.includes(menu.id)) {
      removeId(menu.id)
    } else {
      addId(menu.id)
    }
  }
}

function toggleChildMenu(child, parentMenu) {
  const wasChecked = boundMenuIds.value.includes(child.id)
  if (wasChecked) {
    removeId(child.id)
    // 若父级在集合中 → 移除父级
    removeId(parentMenu.id)
  } else {
    addId(child.id)
    // 若兄弟全部已选 → 父级也加入
    if (parentMenu.children && parentMenu.children.every(c => boundMenuIds.value.includes(c.id) || c.id === child.id)) {
      addId(parentMenu.id)
    }
  }
}

function addId(id) {
  if (!boundMenuIds.value.includes(id)) boundMenuIds.value.push(id)
}

function removeId(id) {
  const idx = boundMenuIds.value.indexOf(id)
  if (idx !== -1) boundMenuIds.value.splice(idx, 1)
}

function isParentChecked(menu) {
  if (!menu.children || !menu.children.length) return false
  return menu.children.every(child => boundMenuIds.value.includes(child.id))
}

function isIndeterminate(menu) {
  if (!menu.children || !menu.children.length) return false
  const checked = menu.children.filter(child => boundMenuIds.value.includes(child.id)).length
  return checked > 0 && checked < menu.children.length
}

async function submitMenu() {
  if (!currentMenuRole.value) return
  if (saving.value) return
  saving.value = true
  try {
    // 再补一次祖先兜底
    const menuIds = [...boundMenuIds.value]
    menuOptions.value.forEach(menu => {
      if (menu.children && menu.children.length) {
        const hasChecked = menu.children.some(child => menuIds.includes(child.id))
        if (hasChecked && !menuIds.includes(menu.id)) {
          menuIds.push(menu.id)
        }
      }
    })
    await toggleMenu(currentMenuRole.value.id, menuIds)
    ElMessage.success(t('菜单绑定成功'))
    showMenuModal.value = false
    loadRoles()
    window.dispatchEvent(new Event('menu-updated'))
  } catch (e) {
    console.error('绑定菜单失败', e)
  } finally {
    saving.value = false
  }
}

/** 状态下拉：GET /admin/dict/data/enabled/role_status（启用中的字典数据） */
const fetchStatusOptions = async () => {
  try {
    const res = await getEnabledDictData('role_status')
    const d = res?.data
    statusOptions.value = (Array.isArray(d) ? d : []).filter(item => item && item.value !== undefined && item.value !== null)
  } catch (e) {
    statusOptions.value = []
    console.warn('[role-manage] 加载 role_status 字典失败：', e?.message || e)
  }
}

onMounted(() => {
  fetchStatusOptions()
  loadRoles()
})

// keep-alive 复用实例，每次重新进入页面都重新拉取最新字典，不使用旧数据
const isInitialActivation = ref(true)
onActivated(() => {
  if (isInitialActivation.value) {
    isInitialActivation.value = false // 首次进入已由 onMounted 拉取
    return
  }
  fetchStatusOptions()
})
</script>

<style lang="scss" scoped>
.page-container { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--el-text-color-primary, #303133);
  margin: 0 0 4px;
}
.page-subtitle {
  font-size: 13px;
  color: var(--el-text-color-secondary, #909399);
  margin: 0;
}

/* ---- Filter Card ---- */
.filter-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid var(--border-color, #e4e7ed);
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.filter-item { display: flex; flex-direction: column; gap: 6px; }
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
  outline: none;
  transition: all 0.2s;
  color: var(--text-primary, #303133);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
  &:focus {
    background-color: var(--card-bg, #fff);
    box-shadow: 0 0 0 2px rgba(251,114,153,0.25);
  }
}
.filter-select {
  cursor: pointer;
  appearance: none;
  background-color: var(--bg-color, #f5f7fa);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
  padding-right: 32px;
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
}
.filter-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color, #e4e7ed);
}

/* ---- Buttons ---- */
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
  svg { flex-shrink: 0; }
  &.btn-primary {
    background: linear-gradient(135deg, var(--color-primary, #fb7299) 0%, #ff9ac6 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(251,114,153,0.25);
    &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(251,114,153,0.4); }
    &:active { transform: translateY(0); }
  }
  &.btn-secondary {
    background: var(--bg-color, #f5f7fa);
    color: var(--text-primary, #303133);
    border-color: var(--border-color, #dcdfe6);
    &:hover { background: var(--border-color, #ebedf0); }
  }
  &.btn-add {
    background: linear-gradient(135deg, var(--color-primary, #fb7299) 0%, #ff9ac6 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(251,114,153,0.25);
    padding: 0 26px;
    &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(251,114,153,0.4); }
    &:active { transform: translateY(0); }
  }
  &:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }
}
.btn-loading {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: btn-spin 0.6s linear infinite;
}
@keyframes btn-spin { to { transform: rotate(360deg); } }

/* ---- Table Card ---- */
.table-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e4e7ed);
  overflow: hidden;
}
.table-wrap {
  overflow-x: auto;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { border-radius: 3px; background: rgba(0,0,0,0.15); }
}
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  min-width: 900px;
  th {
    padding: 14px 16px;
    text-align: center;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary, #909399);
    background: var(--bg-color, #f8f9fc);
    font-weight: 600;
    white-space: nowrap;
    border-bottom: 2px solid var(--border-color, #e4e7ed);
    user-select: none;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border-color, #f2f3f5);
    vertical-align: middle;
    background: var(--card-bg, #fff);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .table-row:hover td { background: var(--bg-color, #fafafa); }
  .col-index { width: 60px; }
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  &.active { color: #67c23a; background: rgba(103,194,58,0.1); }
  &.inactive { color: #f56c6c; background: rgba(245,108,108,0.1); }
}
.cell-bold { font-weight: 600; color: var(--text-primary, #303133); }
.cell-desc { color: var(--text-secondary, #909399); max-width: 180px; }
.cell-muted { color: var(--text-secondary, #909399); }

.cell-creator {
  cursor: help;
  color: var(--text-primary, #303133);
  border-bottom: 1px dashed var(--border-color, #dcdfe6);
  &:hover { color: var(--color-primary, #fb7299); }
}
.cell-strike {
  text-decoration: line-through;
  font-style: italic;
  color: var(--text-secondary, #909399);
}

/* Sticky Action Column */
.sticky-col {
  position: sticky;
  right: 0;
  z-index: 3;
  background: var(--card-bg, #fff);
  border-left: 1px solid var(--border-color, #e4e7ed);
  box-shadow: -2px 0 8px rgba(0,0,0,0.06);
}
.table-row:hover .sticky-col { background: var(--bg-color, #fafafa); }
.action-group { display: flex; gap: 6px; justify-content: center; white-space: nowrap; }
.btn-action {
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-edit { color: #ffc107; background: rgba(255,193,7,0.1); &:hover { color: #fff; background: #ffc107; } }
.btn-bind { color: var(--color-primary, #fb7299); background: rgba(251,114,153,0.1); &:hover { color: #fff; background: var(--color-primary, #fb7299); } }
.btn-delete { color: #f56c6c; background: rgba(245,108,108,0.1); &:hover { color: #fff; background: #f56c6c; } }
.empty-row { padding: 40px; text-align: center; color: var(--text-secondary, #909399); }

/* ---- Pagination ---- */
.pagination-wrap { display: flex; align-items: center; justify-content: space-between; padding: 16px 10px; }
.page-info { font-size: 13px; color: var(--text-secondary, #909399); }
.page-btns { display: flex; gap: 4px; }
.pg-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid var(--border-color, #dcdfe6);
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  &:hover:not(:disabled) { border-color: var(--color-primary, #fb7299); color: var(--color-primary, #fb7299); }
  &.active { background: var(--color-primary, #fb7299); color: #fff; border-color: var(--color-primary, #fb7299); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}
.pg-ellipsis { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--text-secondary, #909399); }
.page-size-sel {
  height: 32px; border-radius: 8px;
  border: 1px solid var(--border-color, #dcdfe6);
  padding: 0 8px; font-size: 12px;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  cursor: pointer;
}

/* ---- Modals ---- */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
}
.modal-card {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.18);
  max-height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.modal-std { width: 480px; }
.modal-wide { width: 520px; }
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 28px 16px; flex-shrink: 0;
  h3 { margin: 0; font-size: 17px; font-weight: 600; color: var(--text-primary, #303133); }
}
.modal-close {
  background: none; border: none; font-size: 20px; cursor: pointer;
  color: var(--text-secondary, #909399); padding: 0; line-height: 1;
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; transition: all 0.2s;
  &:hover { color: var(--text-primary, #303133); background: var(--bg-color, #f5f7fa); }
}
.modal-body { padding: 4px 28px 20px; overflow-y: auto; flex: 1; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 28px; border-top: 1px solid var(--border-color, #f2f3f5); flex-shrink: 0;
}

/* Form Section */
.form-section { margin-bottom: 0; padding: 16px; background: var(--bg-color, #f9fafc); border-radius: 12px; }
.section-title {
  font-size: 13px; font-weight: 600; color: var(--text-primary, #303133);
  margin-bottom: 16px; padding-left: 10px;
  border-left: 3px solid var(--color-primary, #fb7299);
}
.form-row { display: flex; gap: 14px; }
.fg { margin-bottom: 16px; &:last-child { margin-bottom: 0; } &.half { flex: 1; } }
.fl { display: block; font-size: 13px; font-weight: 500; color: var(--text-primary, #303133); margin-bottom: 6px; }
.req { color: #f56c6c; }
.fi {
  width: 100%; height: 40px; border-radius: 10px;
  border: 1.5px solid var(--border-color, #e4e7ed);
  padding: 0 14px; font-size: 13px;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  outline: none; transition: all 0.25s ease; box-sizing: border-box;
  &:focus { border-color: var(--color-primary, #fb7299); box-shadow: 0 0 0 3px rgba(251,114,153,0.1); }
  &:disabled { opacity: 0.5; cursor: not-allowed; background: var(--bg-color, #f5f7fa); }
}

/* Toggle */
.toggle-wrap { display: flex; align-items: center; gap: 10px; min-height: 40px; cursor: pointer; }
.toggle-btn {
  width: 48px; height: 26px; border-radius: 13px; border: none;
  background: var(--border-color, #dcdfe6); cursor: pointer;
  position: relative; transition: background 0.25s ease; padding: 0; flex-shrink: 0;
  &.on { background: var(--color-primary, #fb7299); }
}
.toggle-knob {
  width: 22px; height: 22px; border-radius: 50%; background: #fff;
  position: absolute; top: 2px; left: 2px;
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}
.toggle-btn.on .toggle-knob { transform: translateX(22px); }
.toggle-label { font-size: 13px; color: var(--text-secondary, #909399); }

/* ---- Menu Tree ---- */
.menu-loading { text-align: center; padding: 40px; color: var(--text-secondary, #909399); }
.menu-tree-wrap { max-height: 400px; overflow-y: auto; }
.menu-node { margin-bottom: 4px; }
.menu-check {
  display: flex; align-items: center;
  &.menu-check-parent { padding: 8px 12px; border-radius: var(--radius-sm, 6px); }
  &.menu-check-child { padding: 8px 12px; margin-left: 28px; border-radius: var(--radius-sm, 6px); }
  &:hover { background: var(--bg-color, #f5f7fa); }
}
.menu-children { margin-top: 2px; }
.menu-icon { display: inline-flex; align-items: center; color: var(--text-secondary, #909399); margin-right: 6px; }
.checkbox-wrap {
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  input[type="checkbox"] {
    width: 16px; height: 16px; accent-color: var(--color-primary, #fb7299); cursor: pointer;
  }
  .checkbox-label { font-size: 13px; color: var(--text-primary, #303133); font-weight: 500; }
}

/* ---- Creator Tooltip ---- */
.creator-tip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  background: #fff;
  border: 1px solid var(--border-color, #e4e7ed);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--text-primary, #303133);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  max-width: 260px;
  word-break: break-all;
  line-height: 1.5;
}

/* ---- Animations ---- */
.modal-fade-enter-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease; } }
.modal-fade-leave-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.15s ease, opacity 0.15s ease; } }
.modal-fade-enter-from { opacity: 0; .modal-card { transform: scale(0.9) translateY(16px); opacity: 0; } }
.modal-fade-leave-to { opacity: 0; .modal-card { transform: scale(0.95); opacity: 0; } }

/* ---- Dark Mode ---- */
html.dark-mode {
  .filter-card, .table-card { background: var(--card-bg); border-color: var(--border-color); }
  .data-table th { background: var(--bg-color); border-color: var(--border-color); color: var(--text-primary); }
  .data-table td { border-color: var(--border-color); color: var(--text-primary); }
  .data-table tbody tr:hover td { background: var(--hover-bg); }
  .filter-input, .filter-select, .fi { background: var(--bg-color); color: var(--text-primary); box-shadow: inset 0 1px 3px rgba(0,0,0,0.15); }
  .fi:focus { background: var(--card-bg); box-shadow: 0 0 0 2px rgba(251,114,153,0.3); }
  .pg-btn { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .page-size-sel { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .modal-header { border-color: var(--border-color); h3 { color: var(--text-primary); } }
  .modal-footer { border-color: var(--border-color); }
  .btn-edit { color: #ffd54f !important; }
  .btn-bind { color: var(--color-primary) !important; }
  .btn-delete { color: #f87171 !important; }
  .sticky-col { background: var(--card-bg); }
  .table-row:hover .sticky-col { background: var(--hover-bg); }
  .menu-check:hover { background: var(--hover-bg); }
  .creator-tip { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
}
</style>
