<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">{{ $t('菜单管理') }}</h1>
      <p class="page-subtitle">{{ $t('管理系统菜单结构与层级') }}</p>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">{{ $t('菜单名称') }}</label>
          <input v-model="query.menuName" class="filter-input" :placeholder="$t('请输入菜单名称')" @keyup.enter="search" />
        </div>
        <div class="filter-item">
          <label class="filter-label">{{ $t('状态') }}</label>
          <div class="select-wrap" :class="{ open: statusOpen }">
            <select v-model="query.status" class="filter-select" @mousedown="statusOpen = true"
              @blur="statusOpen = false">
              <option value="">{{ $t('全部') }}</option>
              <option v-for="d in statusOptions" :key="d.id ?? d.value" :value="d.value">{{ d.label ? $t(d.label) : d.label }}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="filter-actions">
        <button class="btn btn-secondary" @click="resetQuery">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
            {{ $t('重置') }}
          </button>
        <button class="btn btn-primary" @click="search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
            {{ $t('搜索') }}
          </button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-wrap" v-loading="loading">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-index">#</th>
              <th>{{ $t('菜单名称') }}</th>
              <th>{{ $t('图标') }}</th>
              <th>{{ $t('路由标识') }}</th>
              <th>{{ $t('排序') }}</th>
              <th>{{ $t('状态') }}</th>
              <th class="sticky-col">{{ $t('操作') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pagedData.length === 0 && !loading">
              <td colspan="7" class="empty-row">{{ $t('暂无数据') }}</td>
            </tr>
            <tr v-for="(row, idx) in pagedData" :key="row.id" class="table-row">
              <td class="col-index">{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
              <td>
                <div class="menu-name-cell" :style="{ paddingLeft: row._level * 24 + 'px' }">
                  <span v-if="row._hasChildren" class="tree-indent">
                    <span class="tree-line">└</span>
                  </span>
                  <button v-if="row._hasChildren" class="expand-btn" :class="{ expanded: expandedIds.has(row.id) }"
                    @click="toggleExpand(row.id)">▶</button>
                  <span v-else class="expand-spacer"></span>
                  <el-icon v-if="row.icon" :size="15" class="menu-icon">
                    <component :is="row.icon" />
                  </el-icon>
                  <span class="cell-bold">{{ row.menuName }}</span>
                </div>
              </td>
              <td>
                <el-icon v-if="row.icon" :size="17" class="icon-preview">
                  <component :is="row.icon" />
                </el-icon>
                <span v-else class="cell-muted">—</span>
              </td>
              <td class="cell-mono">{{ row.menuIdentification || '—' }}</td>
              <td><span class="sort-num">{{ row.descSort }}</span></td>
              <td>
                <span class="status-badge" :class="row.status ? 'active' : 'inactive'">
                  {{ row.status ? $t('启用') : $t('禁用') }}
                </span>
              </td>
              <td class="sticky-col">
                <div class="action-group">
                  <button class="btn-action btn-edit" @click="openEditModal(row)">{{ $t('编辑') }}</button>
                  <button class="btn-action btn-delete" @click="confirmDelete(row)">{{ $t('删除') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalFiltered > 0" class="pagination-wrap">
        <div class="page-info">{{ $t('共 {total} 条', { total: totalFiltered }) }}</div>
        <div class="page-btns">
          <button class="pg-btn" :disabled="currentPage <= 1" @click="goPage(currentPage - 1)">&#8249;</button>
          <template v-for="p in totalPages" :key="p">
            <span v-if="p === '...'" class="pg-ellipsis">...</span>
            <button v-else class="pg-btn" :class="{ active: currentPage === p }" @click="goPage(p)">{{ p }}</button>
          </template>
          <button class="pg-btn" :disabled="currentPage >= totalPages" @click="goPage(currentPage + 1)">&#8250;</button>
        </div>
        <select v-model.number="pageSize" class="page-size-sel">
          <option :value="10">{{ $t('10 条/页') }}</option>
          <option :value="20">{{ $t('20 条/页') }}</option>
          <option :value="50">{{ $t('50 条/页') }}</option>
          <option :value="100">{{ $t('100 条/页') }}</option>
        </select>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
          <div class="modal-card modal-std" @click.stop>
            <div class="modal-header">
              <h3>{{ editForm.id ? $t('编辑菜单') : $t('新增菜单') }}</h3>
              <button class="modal-close" @click="closeEditModal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="fg">
                <label class="fl">{{ $t('菜单名称') }} <span class="req">*</span></label>
                <input v-model="editForm.menuName" class="fi" :placeholder="$t('请输入菜单名称')" />
              </div>
              <div class="fg">
                <label class="fl">{{ $t('菜单图标') }}</label>
                <div class="icon-select-trigger" @click="showIconPicker = true">
                  <template v-if="editForm.icon">
                    <el-icon :size="18">
                      <component :is="editForm.icon" />
                    </el-icon>
                    <span class="icon-selected-name">{{ editForm.icon }}</span>
                  </template>
                  <span v-else class="icon-placeholder">{{ $t('点击选择图标') }}</span>
                </div>
              </div>
              <div class="fg">
                <label class="fl">{{ $t('路由标识') }}</label>
                <input v-model="editForm.menuIdentification" class="fi" :placeholder="$t('建议填路由 name，如 ReviewManage')" />
                <span class="fh">{{ $t('填路由 name（推荐）或 /path，改路由/图标/名称都不影响跳转') }}</span>
              </div>
              <div class="fg">
                <label class="fl">{{ $t('排序') }} <span class="req">*</span></label>
                <input v-model.number="editForm.descSort" class="fi" type="number" :placeholder="$t('请输入排序值')" />
              </div>
              <div class="fg">
                <label class="fl">{{ $t('上级菜单') }}</label>
                <div class="select-wrap" :class="{ open: parentOpen }">
                  <select v-model="editForm.parentId" class="filter-select" @mousedown="parentOpen = true"
                    @blur="parentOpen = false">
                    <option :value="null">{{ $t('无父级') }}</option>
                    <option v-for="opt in parentOptions" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
                  </select>
                </div>
              </div>
              <div class="fg">
                <label class="fl">{{ $t('状态') }}</label>
                <div class="toggle-wrap" @click="editForm.status = !editForm.status">
                  <button class="toggle-btn" :class="{ on: editForm.status }">
                    <span class="toggle-knob"></span>
                  </button>
                  <span class="toggle-label">{{ editForm.status ? $t('启用') : $t('禁用') }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeEditModal">{{ $t('取消') }}</button>
              <button class="btn btn-primary" @click="handleSave">{{ $t('确认') }}</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <IconPicker v-model="editForm.icon" :visible="showIconPicker" @close="showIconPicker = false" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onActivated, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { getMenuList, updateMenu, deleteMenu } from '@/api/menu'
import { getEnabledDictData } from '@/api/dict'
import IconPicker from '@/components/IconPicker.vue'

const { t } = useI18n()
const loading = ref(false)
const rawList = ref([])
const total = ref(0)
const statusOpen = ref(false)
const parentOpen = ref(false)

const query = reactive({ menuName: '', status: '' })
const appliedFilter = reactive({ menuName: '', status: '' })
const statusOptions = ref([])

// --- 树构建 ---
const expandedIds = ref(new Set())
const userToggled = ref(false)

// 后端 /admin/menu/list 仅分页一级菜单，子菜单嵌套在 children 里；
// buildTree 依赖平铺数组 + parentId 重新挂载，因此先把嵌套结构摊平。
function flattenServerTree(list) {
  const out = []
  const seen = new Set()
  const walk = (nodes, parent) => {
    if (!Array.isArray(nodes)) return
    nodes.forEach(n => {
      if (!n || n.id == null || seen.has(n.id)) return
      seen.add(n.id)
      out.push({ ...n, parentId: n.parentId ?? parent ?? null })
      if (Array.isArray(n.children) && n.children.length) walk(n.children, n.id)
    })
  }
  walk(list, null)
  return out
}

function buildTree(list) {
  const map = {}
  list.forEach(item => { map[item.id] = { ...item, children: [] } })
  const roots = []
  list.forEach(item => {
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id])
    } else {
      roots.push(map[item.id])
    }
  })
  function sortTree(nodes) {
    nodes.sort((a, b) => (a.descSort ?? 0) - (b.descSort ?? 0))
    nodes.forEach(n => sortTree(n.children))
  }
  sortTree(roots)
  return roots
}

function flattenTree(nodes, level = 0) {
  const result = []
  nodes.forEach(node => {
    const hasChildren = node.children && node.children.length > 0
    result.push({ ...node, _level: level, _hasChildren: hasChildren })
    if (hasChildren && expandedIds.value.has(node.id)) {
      result.push(...flattenTree(node.children, level + 1))
    }
  })
  return result
}

const treeData = computed(() => buildTree(rawList.value))
const flatTree = computed(() => flattenTree(treeData.value))

// 子节点命中时保留其祖先，避免搜索结果里出现没有父行的孤儿节点
function filterTree(nodes, cond) {
  const out = []
  nodes.forEach(n => {
    const kids = filterTree(Array.isArray(n.children) ? n.children : [], cond)
    if (cond(n) || kids.length) out.push({ ...n, children: kids })
  })
  return out
}

const filteredData = computed(() => {
  const mn = appliedFilter.menuName.trim().toLowerCase()
  const st = appliedFilter.status
  if (!mn && st === '') return flatTree.value
  return flattenTree(filterTree(treeData.value, n =>
    (!mn || String(n.menuName || '').toLowerCase().includes(mn)) && (st === '' || n.status === st)
  ))
})

const totalFiltered = computed(() => total.value)
const totalPages = computed(() => Math.max(1, Math.ceil(totalFiltered.value / pageSize.value)))
const currentPage = ref(1)
const pageSize = ref(10)

watch(pageSize, () => { currentPage.value = 1; fetchData() })

const pagedData = computed(() => filteredData.value)

function toggleExpand(id) {
  userToggled.value = true
  const s = new Set(expandedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  expandedIds.value = s
}

// --- 上级菜单选项 ---
function flattenForOptions(nodes, level = 0) {
  const result = []
  nodes.forEach(node => {
    const prefix = '\u3000'.repeat(level) + '└ '
    result.push({ id: node.id, label: prefix + node.menuName })
    if (node.children && node.children.length) {
      result.push(...flattenForOptions(node.children, level + 1))
    }
  })
  return result
}

const parentOptions = computed(() => {
  const roots = buildTree(rawList.value)
  const opts = flattenForOptions(roots)
  if (editForm.id) {
    const descIds = new Set()
    function collectDesc(nodes) {
      nodes.forEach(n => { descIds.add(n.id); if (n.children) collectDesc(n.children) })
    }
    const targetNode = buildTree(rawList.value).find(n => n.id === editForm.id)
    if (targetNode && targetNode.children) collectDesc(targetNode.children)
    return opts.filter(o => o.id !== editForm.id && !descIds.has(o.id))
  }
  return opts
})

// --- 筛选 ---
function goPage(p) {
  currentPage.value = p
  fetchData()
}
function search() {
  appliedFilter.menuName = query.menuName
  // 字典值是 "true"/"false" 字符串，这里归一成布尔，保证下面 `n.status === st` 的全等比较成立
  const s = String(query.status).toLowerCase()
  appliedFilter.status = query.status === '' ? '' : (s === 'true' || s === '1')
  currentPage.value = 1
  fetchData()
}
function resetQuery() {
  query.menuName = ''
  query.status = ''
  appliedFilter.menuName = ''
  appliedFilter.status = ''
  currentPage.value = 1
  fetchData()
}

// --- 编辑弹窗 ---
const showEditModal = ref(false)
const showIconPicker = ref(false)
const editForm = reactive({ id: null, menuName: '', icon: '', menuIdentification: '', descSort: 0, parentId: null, status: true })

function openEditModal(row) {
  editForm.id = row.id
  editForm.menuName = row.menuName
  editForm.icon = row.icon
  editForm.menuIdentification = row.menuIdentification
  editForm.descSort = row.descSort
  editForm.parentId = row.parentId || null
  editForm.status = row.status
  showEditModal.value = true
}

function closeEditModal() { showEditModal.value = false }

async function handleSave() {
  if (!editForm.menuName || editForm.menuName.trim() === '') {
    ElMessage.warning(t('请填写菜单名称'))
    return
  }
  if (editForm.descSort === '' || editForm.descSort == null) {
    ElMessage.warning(t('请填写排序值'))
    return
  }
  try {
    await updateMenu({
      id: editForm.id,
      menuName: editForm.menuName,
      icon: editForm.icon,
      menuIdentification: editForm.menuIdentification,
      descSort: editForm.descSort,
      parentId: editForm.parentId,
      status: editForm.status
    })
    ElMessage.success(t('菜单更新成功'))
    showEditModal.value = false
    fetchData()
    window.dispatchEvent(new Event('menu-updated'))
  } catch (e) {
    console.error('更新菜单失败', e)
  }
}

// --- 删除 ---
async function confirmDelete(row) {
  try {
    await ElMessageBox.confirm(t('确定要删除菜单「{name}」吗？', { name: row.menuName }), t('删除确认'), {
      confirmButtonText: t('确定'),
      cancelButtonText: t('取消'),
      type: 'warning'
    })
    await deleteMenu(row.id)
    ElMessage.success(t('删除成功'))
    fetchData()
    window.dispatchEvent(new Event('menu-updated'))
  } catch (e) {
    if (e !== 'cancel') console.error('删除失败', e)
  }
}

// --- 数据加载 ---
async function fetchData() {
  loading.value = true
  try {
    const params = { page: currentPage.value, size: pageSize.value }
    if (appliedFilter.menuName) params.menuName = appliedFilter.menuName
    if (appliedFilter.status !== '') params.status = appliedFilter.status
    const res = await getMenuList(params)
    const list = flattenServerTree(res.data?.records || res.data || [])
    rawList.value = list
    total.value = res.data?.total ?? list.length
    if (!userToggled.value) {
      expandedIds.value = new Set(list.filter(i => i.children && i.children.length).map(i => i.id))
    }
  } catch (e) {
    console.error('加载菜单失败', e)
  } finally {
    loading.value = false
  }
}

/** 状态下拉：GET /admin/dict/data/enabled/menu_status（启用中的字典数据） */
const fetchStatusOptions = async () => {
  try {
    const res = await getEnabledDictData('menu_status')
    const d = res?.data
    statusOptions.value = (Array.isArray(d) ? d : []).filter(item => item && item.value !== undefined && item.value !== null)
  } catch (e) {
    statusOptions.value = []
    console.warn('[menu-manage] 加载 menu_status 字典失败：', e?.message || e)
  }
}

onMounted(() => {
  fetchStatusOptions()
  fetchData()
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
/* ---- Page Container ---- */
.page-container {
  padding: 0;
}

/* ---- Page Header ---- */
.page-header {
  margin-bottom: 20px;
}

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
  grid-template-columns: repeat(2, 1fr);
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
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
  padding-right: 32px;

  &:focus {
    background-color: var(--card-bg, #fff);
    box-shadow: 0 0 0 2px rgba(251, 114, 153, 0.25);
  }
}

.select-wrap {
  position: relative;

  .filter-select {
    width: 100%;
  }

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

  svg {
    flex-shrink: 0;
  }

  &.btn-primary {
    background: linear-gradient(135deg, var(--color-primary, #fb7299) 0%, #ff9ac6 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(251, 114, 153, 0.25);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(251, 114, 153, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &.btn-secondary {
    background: var(--bg-color, #f5f7fa);
    color: var(--text-primary, #303133);
    border-color: var(--border-color, #dcdfe6);

    &:hover {
      background: var(--border-color, #ebedf0);
    }
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none !important;
  }
}

/* ---- Table Card ---- */
.table-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e4e7ed);
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.15);
  }
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  min-width: 800px;

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

  .table-row:hover td {
    background: var(--bg-color, #fafafa);
  }

  .col-index {
    width: 60px;
  }
}

.menu-name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-start;
}

.tree-indent {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  flex-shrink: 0;
}

.tree-line {
  color: var(--text-secondary, #c0c4cc);
  font-size: 12px;
  font-family: monospace;
}

.expand-btn {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg-color, #f5f7fa);
  border-radius: 6px;
  cursor: pointer;
  font-size: 9px;
  color: var(--text-secondary, #909399);
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
}

.expand-btn:hover {
  background: var(--color-primary, #fb7299);
  color: #fff;
  transform: scale(1.1);
}

.expand-btn.expanded {
  transform: rotate(90deg);
  background: var(--color-primary, #fb7299);
  color: #fff;
}

.expand-spacer {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: inline-block;
}

.menu-icon {
  color: var(--color-primary, #fb7299);
  flex-shrink: 0;
}

.icon-preview {
  color: var(--text-secondary, #909399);
}

.cell-bold {
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.cell-muted {
  color: var(--text-secondary, #909399);
}

.cell-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12.5px;
  color: var(--text-secondary, #909399);
}

.sort-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  background: var(--bg-color, #f5f7fa);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #606266);
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;

  &.active {
    color: #67c23a;
    background: rgba(103,194,58,0.1);
  }

  &.inactive {
    color: #f56c6c;
    background: rgba(245,108,108,0.1);
  }
}

/* Sticky Action Column */
.sticky-col {
  position: sticky;
  right: 0;
  z-index: 3;
  background: var(--card-bg, #fff);
  border-left: 1px solid var(--border-color, #e4e7ed);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.06);
}

.table-row:hover .sticky-col {
  background: var(--bg-color, #fafafa);
}

.action-group {
  display: flex;
  gap: 6px;
  justify-content: center;
  white-space: nowrap;
}

.btn-action {
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-edit {
  color: #ffc107;
  background: rgba(255, 193, 7, 0.1);

  &:hover {
    color: #fff;
    background: #ffc107;
  }
}

.btn-delete {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);

  &:hover {
    color: #fff;
    background: #f56c6c;
  }
}

.empty-row {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary, #909399);
}

/* ---- Pagination ---- */
.pagination-wrap {
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

  &:hover:not(:disabled) {
    border-color: var(--color-primary, #fb7299);
    color: var(--color-primary, #fb7299);
  }

  &.active {
    background: var(--color-primary, #fb7299);
    color: #fff;
    border-color: var(--color-primary, #fb7299);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.pg-ellipsis {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--text-secondary, #909399);
}

.page-size-sel {
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-color, #dcdfe6);
  padding: 0 8px;
  font-size: 12px;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  cursor: pointer;
}

/* ---- Modals ---- */
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

  h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary, #303133);
  }
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary, #909399);
  padding: 0;
  line-height: 1;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    color: var(--text-primary, #303133);
    background: var(--bg-color, #f5f7fa);
  }
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

/* Form */
.fg {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
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

  &:focus {
    border-color: var(--color-primary, #fb7299);
    box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.1);
  }
}

.fh {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary, #909399);
}

.icon-select-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #e4e7ed);
  padding: 0 14px;
  background: var(--bg-color, #f5f7fa);
  cursor: pointer;
  transition: all 0.25s ease;
  color: var(--text-primary, #303133);
}

.icon-select-trigger:hover {
  border-color: var(--color-primary, #fb7299);
}

.icon-selected-name {
  font-size: 13px;
}

.icon-placeholder {
  font-size: 13px;
  color: var(--text-secondary, #c0c4cc);
}

/* Toggle */
.toggle-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  cursor: pointer;
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

  &.on {
    background: var(--color-primary, #fb7299);
  }
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

/* ---- Animations ---- */
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

/* ---- Dark Mode ---- */
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

  .data-table tbody tr:hover td {
    background: var(--hover-bg);
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

  .page-size-sel {
    background: var(--card-bg);
    border-color: var(--border-color);
    color: var(--text-primary);
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

  .btn-edit {
    color: #ffd54f !important;
  }

  .btn-delete {
    color: #f87171 !important;
  }

  .sticky-col {
    background: var(--card-bg);
  }

  .table-row:hover .sticky-col {
    background: var(--hover-bg);
  }
}
</style>
