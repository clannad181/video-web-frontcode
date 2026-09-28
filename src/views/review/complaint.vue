<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">稿件投诉</h2>
      <span class="page-sub">处理用户对已发布稿件的投诉与举报</span>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">稿件标题</label>
          <input v-model="filter.videoTitle" class="filter-input" placeholder="搜索稿件标题" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">投诉人</label>
          <input v-model="filter.nickName" class="filter-input" placeholder="搜索投诉人昵称" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">处理状态</label>
          <div class="select-wrap" :class="{ open: statusOpen }">
            <select v-model="filter.status" class="filter-select" @mousedown="statusOpen = true" @blur="statusOpen = false">
              <option value="">全部</option>
              <option value="0">待处理</option>
              <option value="1">已处理</option>
              <option value="2">已驳回</option>
            </select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">投诉时间</label>
          <input v-model="filter.startTime" type="datetime-local" class="filter-input" />
        </div>
        <div class="filter-actions">
          <button class="btn btn-outline" @click="onReset">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
            </svg>
            重置
          </button>
          <button class="btn btn-primary" @click="onSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            搜索
          </button>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>稿件标题</th>
              <th>投诉人</th>
              <th>投诉原因</th>
              <th>投诉时间</th>
              <th>处理状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="list.length === 0">
              <td colspan="7" class="empty-cell">
                <div class="empty-state">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <p>暂无投诉数据</p>
                  <span class="empty-tip">投诉接口接入后，这里将展示待处理的稿件投诉</span>
                </div>
              </td>
            </tr>
            <tr v-for="(row, idx) in list" :key="row.id" class="table-row">
              <td>{{ (pagination.page - 1) * pagination.size + idx + 1 }}</td>
              <td class="col-truncate">{{ row.videoTitle || '-' }}</td>
              <td>{{ row.nickName || '-' }}</td>
              <td class="col-truncate">{{ row.reason || '-' }}</td>
              <td class="mono">{{ row.createTime || '-' }}</td>
              <td>
                <span class="badge" :class="statusCls(row.status)">{{ statusLbl(row.status) }}</span>
              </td>
              <td>
                <div class="action-group">
                  <button class="act-btn act-blue">查看</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <div class="page-info">共 {{ pagination.total }} 条投诉</div>
        <div class="page-btns">
          <button class="pg-btn" :disabled="pagination.page <= 1" @click="goPage(pagination.page - 1)">&#8249;</button>
          <template v-for="p in visiblePages" :key="p">
            <span v-if="p === '...'" class="pg-ellipsis">...</span>
            <button v-else class="pg-btn" :class="{ active: p === pagination.page }" @click="goPage(p)">{{ p }}</button>
          </template>
          <button class="pg-btn" :disabled="pagination.page >= totalPages" @click="goPage(pagination.page + 1)">&#8250;</button>
        </div>
        <div class="page-size">每页 <select v-model.number="pagination.size" class="size-sel" @change="onPageSizeChange">
          <option :value="10">10</option><option :value="20">20</option><option :value="50">50</option><option :value="100">100</option>
        </select> 条</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const statusOpen = ref(false)

const filter = reactive({ videoTitle: '', nickName: '', status: '', startTime: '' })
const list = ref([])
const pagination = reactive({ page: 1, size: 10, total: 0 })

const totalPages = computed(() => Math.max(1, Math.ceil(pagination.total / pagination.size)))

function makePages(cur, total) {
  const pages = []
  if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i); return pages }
  pages.push(1)
  if (cur > 3) pages.push('...')
  const start = Math.max(2, cur - 1)
  const end = Math.min(total - 1, cur + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
const visiblePages = computed(() => makePages(pagination.page, totalPages.value))

function statusLbl(s) { return s === 0 ? '待处理' : s === 1 ? '已处理' : '已驳回' }
function statusCls(s) { return s === 0 ? 'badge-amber' : s === 1 ? 'badge-green' : 'badge-gray' }

function onSearch() { pagination.page = 1 }
function onReset() {
  filter.videoTitle = ''; filter.nickName = ''; filter.status = ''; filter.startTime = ''
  onSearch()
}
function goPage(p) { if (p >= 1 && p <= totalPages.value) pagination.page = p }
function onPageSizeChange() { pagination.page = 1 }
</script>

<style lang="scss" scoped>
.page-container { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--el-text-color-primary, #303133); margin: 0 0 4px; }
.page-sub { font-size: 13px; color: var(--el-text-color-secondary, #909399); }

.filter-card {
  background: var(--card-bg, #fff); border-radius: 12px; padding: 20px; margin-bottom: 16px;
  border: 1px solid var(--border-color, #e4e7ed);
}
.filter-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.filter-item { display: flex; flex-direction: column; gap: 6px; }
.filter-label { font-size: 12px; color: var(--text-secondary, #909399); font-weight: 500; }
.filter-input, .filter-select {
  height: 40px; border-radius: 12px; border: none; padding: 0 14px; font-size: 13px;
  background-color: var(--bg-color, #f5f7fa); outline: none; transition: all 0.2s;
  color: var(--text-primary, #303133); box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
  &:focus { background-color: var(--card-bg, #fff); box-shadow: 0 0 0 2px rgba(251,114,153,0.25); }
}
.filter-select { cursor: pointer; appearance: none; padding-right: 32px; }
.select-wrap {
  position: relative;
  .filter-select { width: 100%; }
  &::after {
    content: ''; position: absolute; right: 12px; top: 50%; width: 0; height: 0;
    border-left: 4.5px solid transparent; border-right: 4.5px solid transparent;
    border-top: 5.5px solid var(--text-secondary, #909399); pointer-events: none;
    transition: all 0.25s cubic-bezier(0.4,0,0.2,1); transform: translateY(-60%);
  }
  &:hover::after { border-top-color: var(--color-primary, #fb7299); }
  &.open::after { border-top-color: var(--color-primary, #fb7299); transform: translateY(-40%) rotate(180deg); }
}
.filter-actions { display: flex; align-items: flex-end; gap: 10px; justify-content: flex-end; grid-column: 1 / -1; }

.btn {
  height: 36px; padding: 0 22px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;
  border: 1px solid transparent; transition: all 0.25s ease; display: inline-flex; align-items: center; gap: 6px;
  svg { flex-shrink: 0; }
  &.btn-primary {
    background: linear-gradient(135deg, var(--color-primary, #fb7299) 0%, #ff9ac6 100%); color: #fff;
    box-shadow: 0 2px 8px rgba(251,114,153,0.25);
    &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(251,114,153,0.4); }
  }
  &.btn-outline {
    background: transparent; color: var(--text-secondary, #909399); border-color: var(--border-color, #dcdfe6);
    &:hover { color: var(--color-primary, #fb7299); border-color: var(--color-primary, #fb7299); background: rgba(251,114,153,0.04); }
  }
}

.table-card {
  background: var(--card-bg, #fff); border-radius: 12px; border: 1px solid var(--border-color, #e4e7ed); overflow: hidden;
}
.table-scroll { overflow-x: auto; }
.data-table {
  width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px;
  th {
    padding: 14px 16px; text-align: center; font-size: 12px; color: var(--text-primary, #303133);
    background: var(--bg-color, #f8f9fc); font-weight: 600; white-space: nowrap;
    border-bottom: 2px solid var(--border-color, #e4e7ed); user-select: none;
  }
  td {
    padding: 14px 16px; border-bottom: 1px solid var(--border-color, #f2f3f5); vertical-align: middle;
    background: var(--card-bg, #fff); text-align: center; white-space: nowrap;
  }
  .table-row:hover td { background: var(--bg-color, #fafafa); }
}
.col-truncate { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.badge {
  display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; white-space: nowrap;
  &.badge-amber { color: #e6a23c; background: rgba(230,162,60,0.1); }
  &.badge-green { color: #4caf50; background: rgba(76,175,80,0.1); }
  &.badge-gray { color: #909399; background: rgba(144,147,153,0.1); }
}

.mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13px; }

.action-group { display: flex; gap: 6px; justify-content: center; white-space: nowrap; }
.act-btn {
  padding: 7px 15px; border-radius: 100px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s ease;
  &.act-blue { color: #00a1d6; background: rgba(0,161,214,0.1); &:hover { color: #fff; background: #00a1d6; box-shadow: 0 2px 8px rgba(0,161,214,0.35); } }
}

.pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 10px; }
.page-info { padding-left: 10px; font-size: 13px; color: var(--text-secondary, #909399); }
.page-btns { display: flex; align-items: center; gap: 4px; }
.pg-btn {
  width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--border-color, #dcdfe6);
  background: var(--card-bg, #fff); color: var(--text-primary, #303133); cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.2s;
  &:hover:not(:disabled) { border-color: var(--color-primary, #fb7299); color: var(--color-primary, #fb7299); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &.active { background: var(--color-primary, #fb7299); color: #fff; border-color: var(--color-primary, #fb7299); }
}
.pg-ellipsis { width: 32px; text-align: center; color: var(--text-secondary, #909399); }
.page-size { font-size: 13px; color: var(--text-secondary, #909399); display: flex; align-items: center; gap: 6px; padding-right: 10px; }
.size-sel {
  height: 32px; border-radius: 6px; border: 1px solid var(--border-color, #dcdfe6); padding: 0 8px; font-size: 13px;
  background: var(--card-bg, #fff); color: var(--text-primary, #303133); cursor: pointer;
}

.empty-cell { text-align: center; padding: 64px 0 !important; }
.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  color: var(--el-text-color-secondary, #909399);
  svg { opacity: 0.55; }
  p { margin: 0; font-size: 15px; font-weight: 500; color: var(--text-primary, #606266); }
}
.empty-tip { font-size: 12px; color: var(--el-text-color-placeholder, #c0c4cc); }

html.dark-mode {
  .filter-card, .table-card { background: var(--card-bg); border-color: var(--border-color); }
  .filter-input, .filter-select { background: var(--bg-color); color: var(--text-primary); box-shadow: inset 0 1px 3px rgba(0,0,0,0.15); }
  .data-table th { background: var(--bg-color); border-color: var(--border-color); color: var(--text-primary); }
  .data-table td { border-color: var(--border-color); color: var(--text-primary); }
  .data-table .table-row:hover td { background: var(--hover-bg); }
  .pg-btn { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .size-sel { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .badge-amber { color: #f3b95f !important; background: rgba(230,162,60,0.15) !important; }
  .badge-green { color: #6fcf73 !important; background: rgba(76,175,80,0.15) !important; }
  .badge-gray { color: #a8abb2 !important; background: rgba(144,147,153,0.18) !important; }
  .act-blue { color: #6cb4ee !important; }
  .empty-state p { color: var(--text-primary); }
  .empty-tip { color: var(--el-text-color-placeholder); }
}
</style>
