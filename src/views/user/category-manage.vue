<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">分类管理</h1>
      <p class="page-subtitle">管理内容分类标签</p>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">分类名称</label>
          <input v-model="query.name" class="filter-input" placeholder="请输入分类名称" @keyup.enter="search" />
        </div>
        <div class="filter-item">
          <label class="filter-label">状态</label>
          <div class="select-wrap" :class="{ open: statusOpen }">
            <select v-model="query.status" class="filter-select" @mousedown="statusOpen = true" @blur="statusOpen = false">
              <option value="">全部</option>
              <option v-for="d in statusOptions" :key="d.id ?? d.value" :value="d.value">{{ d.label }}</option>
            </select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">是否展示</label>
          <div class="select-wrap" :class="{ open: showOpen }">
            <select v-model="query.isShow" class="filter-select" @mousedown="showOpen = true" @blur="showOpen = false">
              <option value="">全部</option>
              <option :value="true">展示</option>
              <option :value="false">隐藏</option>
            </select>
          </div>
        </div>
      </div>
      <div class="filter-actions">
        <button class="btn btn-secondary" @click="resetQuery">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          重置
        </button>
        <button class="btn btn-primary" @click="search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          搜索
        </button>
      </div>
      <div class="filter-bottom">
        <button class="btn btn-add" @click="openAddModal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
          新增分类
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-wrap" v-loading="loading">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-index">#</th>
              <th>分类名称</th>
              <th class="sortable" @click="toggleSort('sort')">
                排序
                <span class="sort-icon" :class="{ active: sortField === 'sort' }">
                  <span class="tri tri-up" :class="{ highlight: sortField === 'sort' && sortDir === 'asc' }">▲</span>
                  <span class="tri tri-down" :class="{ highlight: sortField === 'sort' && sortDir === 'desc' }">▼</span>
                </span>
              </th>
              <th>是否展示</th>
              <th>系统分类</th>
              <th>状态</th>
              <th class="sortable" @click="toggleSort('createTime')">
                创建时间
                <span class="sort-icon" :class="{ active: sortField === 'createTime' }">
                  <span class="tri tri-up" :class="{ highlight: sortField === 'createTime' && sortDir === 'asc' }">▲</span>
                  <span class="tri tri-down" :class="{ highlight: sortField === 'createTime' && sortDir === 'desc' }">▼</span>
                </span>
              </th>
              <th class="sticky-col">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="records.length === 0 && !loading">
              <td colspan="8" class="empty-row">暂无数据</td>
            </tr>
            <tr v-for="(row, idx) in records" :key="row.id" class="table-row">
              <td class="col-index">{{ (query.page - 1) * query.size + idx + 1 }}</td>
              <td class="name-cell">{{ row.name }}</td>
              <td><span class="sort-num">{{ row.sort }}</span></td>
              <td>
                <span class="status-badge" :class="row.isShow ? 'badge-show' : 'badge-hide'">
                  {{ row.isShow ? '展示' : '隐藏' }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="row.isSystem ? 'badge-sys' : 'badge-normal'">
                  {{ row.isSystem ? '是' : '否' }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="row.status ? 'badge-on' : 'badge-off'">
                  {{ row.status ? '启用' : '禁用' }}
                </span>
              </td>
              <td class="cell-muted">{{ row.createTime }}</td>
              <td class="sticky-col">
                <div class="action-group">
                  <button class="btn-action btn-edit" @click="openEditModal(row)">编辑</button>
                  <button class="btn-action btn-delete" @click="confirmDelete(row)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="total > 0" class="pagination-wrap">
        <div class="page-info">共 {{ total }} 条</div>
        <div class="page-btns">
          <button class="pg-btn" :disabled="query.page <= 1" @click="goPage(query.page - 1)">&#8249;</button>
          <template v-for="p in pageNumbers" :key="p">
            <span v-if="p === '...'" class="pg-ellipsis">...</span>
            <button v-else class="pg-btn" :class="{ active: p === query.page }" @click="goPage(p)">{{ p }}</button>
          </template>
          <button class="pg-btn" :disabled="query.page >= totalPages" @click="goPage(query.page + 1)">&#8250;</button>
        </div>
        <select v-model.number="query.size" class="page-size-sel" @change="onPageSizeChange">
          <option :value="10">10 条/页</option>
          <option :value="20">20 条/页</option>
          <option :value="50">50 条/页</option>
        </select>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-card modal-std" @click.stop>
            <div class="modal-header">
              <h3>{{ isEdit ? '编辑分类' : '新增分类' }}</h3>
              <button class="modal-close" @click="closeModal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="fg">
                <label class="fl">分类名称 <span class="req">*</span></label>
                <input v-model="editForm.name" class="fi" placeholder="请输入分类名称" />
              </div>
              <div class="fg">
                <label class="fl">排序</label>
                <input v-model.number="editForm.sort" class="fi" type="number" min="0" placeholder="请输入排序值" />
              </div>
              <div class="fg">
                <label class="fl">状态</label>
                <div class="toggle-wrap" @click="editForm.status = !editForm.status">
                  <button class="toggle-btn" :class="{ on: editForm.status }">
                    <span class="toggle-knob"></span>
                  </button>
                  <span class="toggle-label">{{ editForm.status ? '启用' : '禁用' }}</span>
                </div>
              </div>
              <div class="fg">
                <label class="fl">是否展示</label>
                <div class="toggle-wrap" @click="editForm.isShow = !editForm.isShow">
                  <button class="toggle-btn" :class="{ on: editForm.isShow }">
                    <span class="toggle-knob"></span>
                  </button>
                  <span class="toggle-label">{{ editForm.isShow ? '展示' : '隐藏' }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal">取消</button>
              <button class="btn btn-primary" @click="handleSave">确认</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onActivated, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoryList, addCategory, updateCategory, deleteCategory } from '@/api/category'
import { getEnabledDictData } from '@/api/dict'

const loading = ref(false)
const records = ref([])
const total = ref(0)
const statusOpen = ref(false)
const showOpen = ref(false)

const query = reactive({ name: '', status: '', isShow: '', page: 1, size: 10 })
const statusOptions = ref([])
const sortField = ref('')
const sortDir = ref('')

// --- 分页 ---
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / query.size)))

const pageNumbers = computed(() => {
  const pages = []
  const tp = totalPages.value
  const cp = query.page
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 4) pages.push('...')
    const start = Math.max(2, cp - 2)
    const end = Math.min(tp - 1, cp + 2)
    for (let i = start; i <= end; i++) pages.push(i)
    if (cp < tp - 3) pages.push('...')
    pages.push(tp)
  }
  return pages
})

function goPage(p) {
  query.page = p
  fetchData()
}

function onPageSizeChange() {
  query.page = 1
  fetchData()
}

// --- 排序 ---
function toggleSort(field) {
  if (sortField.value !== field) {
    sortField.value = field
    sortDir.value = 'asc'
  } else if (sortDir.value === 'asc') {
    sortDir.value = 'desc'
  } else {
    sortField.value = ''
    sortDir.value = ''
  }
  query.page = 1
  fetchData()
}

// --- 筛选 ---
function search() {
  query.page = 1
  fetchData()
}

function resetQuery() {
  query.name = ''
  query.status = ''
  query.isShow = ''
  query.page = 1
  sortField.value = ''
  sortDir.value = ''
  fetchData()
}

// --- 数据加载 ---
async function fetchData() {
  loading.value = true
  try {
    const params = { page: query.page, size: query.size }
    if (query.name) params.name = query.name
    if (query.status !== '') params.status = query.status
    if (query.isShow !== '') params.isShow = query.isShow
    if (sortField.value) {
      params.field = sortField.value
      params.descOrAsc = sortDir.value
    }
    const res = await getCategoryList(params)
    records.value = res.data?.records || []
    total.value = res.data?.total ?? 0
  } catch (e) {
    console.error('加载分类失败', e)
  } finally {
    loading.value = false
  }
}

// --- 弹窗 ---
const showModal = ref(false)
const isEdit = ref(false)
const editForm = reactive({ id: null, name: '', sort: 0, status: true, isShow: true, isSystem: false })

function openAddModal() {
  isEdit.value = false
  editForm.id = null
  editForm.name = ''
  editForm.sort = 0
  editForm.status = true
  editForm.isShow = true
  editForm.isSystem = false
  showModal.value = true
}

function openEditModal(row) {
  isEdit.value = true
  editForm.id = row.id
  editForm.name = row.name
  editForm.sort = row.sort
  editForm.status = row.status
  editForm.isShow = row.isShow
  editForm.isSystem = row.isSystem
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function handleSave() {
  if (!editForm.name || editForm.name.trim() === '') {
    ElMessage.warning('请填写必填项')
    return
  }
  try {
    if (isEdit.value) {
      await updateCategory({
        id: editForm.id,
        name: editForm.name,
        sort: editForm.sort,
        status: editForm.status,
        isShow: editForm.isShow,
        isSystem: editForm.isSystem
      })
      ElMessage.success('分类更新成功')
    } else {
      await addCategory({
        name: editForm.name,
        sort: editForm.sort,
        status: editForm.status,
        isShow: editForm.isShow
      })
      ElMessage.success('分类创建成功')
    }
    showModal.value = false
    fetchData()
  } catch (e) {
    console.error('保存分类失败', e)
  }
}

// --- 删除 ---
async function confirmDelete(row) {
  try {
    await ElMessageBox.confirm(`确定要删除分类「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error('删除失败', e)
  }
}

/** 状态下拉：GET /admin/dict/data/enabled/category_status（启用中的字典数据） */
const fetchStatusOptions = async () => {
  try {
    const res = await getEnabledDictData('category_status')
    const d = res?.data
    statusOptions.value = (Array.isArray(d) ? d : []).filter(item => item && item.value !== undefined && item.value !== null)
  } catch (e) {
    statusOptions.value = []
    console.warn('[category-manage] 加载 category_status 字典失败：', e?.message || e)
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
.page-container { padding: 0; }

/* ---- Page Header ---- */
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
    &.sortable { cursor: pointer; &:hover { color: var(--color-primary, #fb7299); } }
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

.name-cell { font-weight: 400; }
.sort-num { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 24px; background: var(--bg-color, #f5f7fa); border-radius: 6px; font-size: 13px; font-weight: 500; color: var(--text-primary, #606266); }
.cell-muted { color: var(--text-secondary, #909399); }

/* Sort icons */
.sort-icon {
  display: inline-flex;
  flex-direction: column;
  margin-left: 4px;
  vertical-align: middle;
  line-height: 1;
  &.active { opacity: 1; }
  &:not(.active) { opacity: 0.4; }
}
.tri { font-size: 10px; line-height: 1; color: var(--text-secondary, #909399); &.highlight { color: var(--color-primary, #fb7299); } }

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
}
.badge-show { color: #67c23a; background: rgba(103,194,58,0.1); }
.badge-hide { color: #909399; background: rgba(144,147,153,0.08); }
.badge-sys { color: #409eff; background: rgba(64,158,255,0.1); }
.badge-normal { color: #909399; background: rgba(144,147,153,0.08); }
.badge-on { color: #67c23a; background: rgba(103,194,58,0.1); }
.badge-off { color: #f56c6c; background: rgba(245,108,108,0.1); }

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
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.18);
  max-height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.modal-std { width: 480px; }
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 28px 16px; flex-shrink: 0;
  h3 { margin: 0; font-size: 17px; font-weight: 600; color: #303133; }
}
.modal-close {
  background: none; border: none; font-size: 20px; cursor: pointer;
  color: #909399; padding: 0; line-height: 1;
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; transition: all 0.2s;
  &:hover { color: #303133; background: #f5f7fa; }
}
.modal-body { padding: 4px 28px 20px; overflow-y: auto; flex: 1; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 28px; border-top: 1px solid #f2f3f5; flex-shrink: 0;
}

/* Form */
.fg { margin-bottom: 16px; &:last-child { margin-bottom: 0; } }
.fl { display: block; font-size: 13px; font-weight: 500; color: #303133; margin-bottom: 6px; }
.req { color: #f56c6c; }
.fi {
  width: 100%; height: 40px; border-radius: 10px;
  border: 1.5px solid #e4e7ed;
  padding: 0 14px; font-size: 13px;
  background: #fff;
  color: #303133;
  outline: none; transition: all 0.25s ease; box-sizing: border-box;
  &:focus { border-color: var(--color-primary, #fb7299); box-shadow: 0 0 0 3px rgba(251,114,153,0.1); }
}

/* Toggle */
.toggle-wrap { display: flex; align-items: center; gap: 10px; min-height: 40px; cursor: pointer; }
.toggle-btn {
  width: 48px; height: 26px; border-radius: 13px; border: none;
  background: #dcdfe6; cursor: pointer;
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
.toggle-label { font-size: 13px; color: #909399; }

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
  .modal-card { background: var(--card-bg); }
  .modal-header { border-color: var(--border-color); h3 { color: var(--text-primary); } }
  .modal-footer { border-color: var(--border-color); }
  .fi { background: var(--bg-color); color: var(--text-primary); }
  .btn-edit { color: #ffd54f !important; }
  .btn-delete { color: #f87171 !important; }
  .sticky-col { background: var(--card-bg); }
  .table-row:hover .sticky-col { background: var(--hover-bg); }
}
</style>
