<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">运行日志</h2>
      <span class="page-sub">查看系统操作记录和接口调用日志</span>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">操作用户</label>
          <input v-model="filter.username" class="filter-input" placeholder="搜索操作用户" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">所属模块</label>
          <input v-model="filter.module" class="filter-input" placeholder="搜索所属模块" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">操作结果</label>
          <div class="select-wrap" :class="{ open: resultOpen }">
            <select v-model="filter.resultStatus" class="filter-select" @mousedown="resultOpen = true" @blur="resultOpen = false">
              <option value="">全部</option>
              <option value="2">成功</option>
              <option value="1">业务异常</option>
              <option value="0">系统异常</option>
            </select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">系统类型</label>
          <div class="select-wrap" :class="{ open: systemTypeOpen }">
            <select v-model="filter.systemType" class="filter-select" @mousedown="systemTypeOpen = true" @blur="systemTypeOpen = false">
              <option value="">全部</option>
              <option value="1">后台</option>
              <option value="0">前台</option>
            </select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">开始时间</label>
          <input v-model="filter.startTime" type="datetime-local" class="filter-input" />
        </div>
        <div class="filter-item">
          <label class="filter-label">结束时间</label>
          <input v-model="filter.endTime" type="datetime-local" class="filter-input" />
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
              <th>操作用户</th>
              <th>所属模块</th>
              <th>操作描述</th>
              <th>请求 URI</th>
              <th>请求方式</th>
              <th>IP 地址</th>
              <th>执行耗时</th>
              <th>操作结果</th>
              <th>操作时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="list.length === 0 && !loading">
              <td colspan="11" class="empty-cell"><div class="empty-state"><p>暂无数据</p></div></td>
            </tr>
            <tr v-for="(row, idx) in list" :key="row.id" class="table-row">
              <td>{{ (pagination.page - 1) * pagination.size + idx + 1 }}</td>
              <td>{{ row.username || '-' }}</td>
              <td>{{ row.module || '-' }}</td>
              <td class="col-truncate">{{ row.operationDesc || '-' }}</td>
              <td class="url-cell">{{ row.requestUri || '-' }}</td>
              <td><span class="method-badge" :class="'method-' + (row.requestMethod || '').toLowerCase()">{{ row.requestMethod || '-' }}</span></td>
              <td class="mono">{{ row.ipAddress || '-' }}</td>
              <td class="mono">{{ row.executionTime != null ? row.executionTime + 'ms' : '-' }}</td>
              <td><span class="badge" :class="resultBadgeCls(row.resultStatus)">{{ resultLbl(row.resultStatus) }}</span></td>
              <td class="mono">{{ row.operationTime || '-' }}</td>
              <td>
                <div class="action-group">
                  <button class="act-btn act-blue" @click="viewDetail(row)">查看</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <div class="page-info">共 {{ pagination.total }} 条日志</div>
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

    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="visible" class="modal-overlay" @click.self="closeModal">
          <div class="modal-card modal-detail" :class="{ closing: closing }" @click.stop>
            <div class="modal-header">
              <h3>操作详情</h3>
              <button class="modal-close" @click="closeModal">&times;</button>
            </div>
            <div class="modal-body" v-if="detail">
              <div class="detail-row"><span class="dr-label">操作用户</span><span class="dr-value">{{ detail.username || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">所属模块</span><span class="dr-value detail-code">{{ detail.module || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">操作描述</span><span class="dr-value">{{ detail.operationDesc || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">类名.方法</span><span class="dr-value detail-code">{{ detail.className || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">请求 URI</span><span class="dr-value detail-code">{{ detail.requestUri || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">请求方式</span><span class="dr-value">{{ detail.requestMethod || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">请求参数</span><span class="dr-value detail-code">{{ detail.requestParams || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">IP 地址</span><span class="dr-value mono">{{ detail.ipAddress || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">执行耗时</span><span class="dr-value mono">{{ detail.executionTime != null ? detail.executionTime + 'ms' : '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">操作结果</span><span class="dr-value"><span class="badge" :class="resultBadgeCls(detail.resultStatus)">{{ resultLbl(detail.resultStatus) }}</span></span></div>
              <div class="detail-row"><span class="dr-label">错误信息</span><span class="dr-value">{{ detail.errorMessage || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">异常堆栈</span><span class="dr-value detail-code">{{ detail.stackTrace || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">日志类型</span><span class="dr-value">{{ detail.logType === 1 ? '业务日志' : '系统日志' }}</span></div>
              <div class="detail-row"><span class="dr-label">系统类型</span><span class="dr-value">{{ detail.systemType === 1 ? '后台' : '前台' }}</span></div>
              <div class="detail-row"><span class="dr-label">操作时间</span><span class="dr-value mono">{{ detail.operationTime || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">创建时间</span><span class="dr-value mono">{{ detail.createTime || '-' }}</span></div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal">关闭</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getOperationLogList, getOperationLogDetail } from '@/api/operationLog'

const loading = ref(false)
const list = ref([])
const pagination = reactive({ page: 1, size: 10, total: 0 })
const filter = reactive({ username: '', module: '', resultStatus: '', systemType: '', startTime: '', endTime: '' })

const resultOpen = ref(false)
const systemTypeOpen = ref(false)

const visible = ref(false)
const closing = ref(false)
const detail = ref(null)

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

function resultBadgeCls(s) { return s === 2 ? 'badge-green' : s === 1 ? 'badge-amber' : 'badge-red' }
function resultLbl(s) { return s === 2 ? '成功' : s === 1 ? '业务异常' : '系统异常' }

function buildParams() {
  const p = { page: pagination.page, size: pagination.size }
  if (filter.username) p.username = filter.username
  if (filter.module) p.module = filter.module
  if (filter.resultStatus !== '') p.resultStatus = filter.resultStatus
  if (filter.systemType !== '') p.systemType = filter.systemType
  if (filter.startTime) p.startTime = filter.startTime.replace('T', ' ') + ':00'
  if (filter.endTime) p.endTime = filter.endTime.replace('T', ' ') + ':00'
  return p
}

async function loadData() {
  loading.value = true
  try {
    const res = await getOperationLogList(buildParams())
    const data = res.data || {}
    list.value = data.records || []
    pagination.total = data.total || 0
  } catch (e) { console.error(e) } finally { loading.value = false }
}

function onSearch() { pagination.page = 1; loadData() }
function onReset() {
  filter.username = ''; filter.module = ''; filter.resultStatus = ''
  filter.systemType = ''; filter.startTime = ''; filter.endTime = ''
  onSearch()
}
function goPage(p) { if (p >= 1 && p <= totalPages.value) { pagination.page = p; loadData() } }
function onPageSizeChange() { pagination.page = 1; loadData() }

async function viewDetail(row) {
  try {
    const res = await getOperationLogDetail(row.id)
    detail.value = res.data || row
    closing.value = false
    visible.value = true
  } catch (e) { console.error(e) }
}

function closeModal() {
  closing.value = true
  setTimeout(() => { visible.value = false; closing.value = false; detail.value = null }, 200)
}

onMounted(loadData)
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
.filter-select {
  cursor: pointer; appearance: none; padding-right: 32px;
  background-color: var(--bg-color, #f5f7fa); box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);
  &:focus { background-color: var(--card-bg, #fff); box-shadow: 0 0 0 2px rgba(251,114,153,0.25); }
}
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
  &.btn-secondary {
    background: var(--bg-color, #f5f7fa); color: var(--text-primary, #303133); border-color: var(--border-color, #dcdfe6);
    &:hover { background: var(--border-color, #ebedf0); border-color: #c0c4cc; }
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
.col-truncate { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.url-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.badge {
  display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; white-space: nowrap;
  &.badge-green { color: #4caf50; background: rgba(76,175,80,0.1); }
  &.badge-amber { color: #e6a23c; background: rgba(230,162,60,0.1); }
  &.badge-red { color: #f56c6c; background: rgba(245,108,108,0.1); }
}

.method-badge {
  display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;
  &.method-get { color: #4caf50; background: rgba(76,175,80,0.1); }
  &.method-post { color: #409eff; background: rgba(64,158,255,0.1); }
  &.method-put { color: #e6a23c; background: rgba(230,162,60,0.1); }
  &.method-delete { color: #f56c6c; background: rgba(245,108,108,0.1); }
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

.empty-cell { text-align: center; padding: 48px 0 !important; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--el-text-color-secondary, #909399); p { margin: 0; font-size: 14px; } }

html.dark-mode {
  .filter-card, .table-card { background: var(--card-bg); border-color: var(--border-color); }
  .filter-input, .filter-select { background: var(--bg-color); color: var(--text-primary); box-shadow: inset 0 1px 3px rgba(0,0,0,0.15); }
  .data-table th { background: var(--bg-color); border-color: var(--border-color); color: var(--text-primary); }
  .data-table td { border-color: var(--border-color); color: var(--text-primary); }
  .data-table .table-row:hover td { background: var(--hover-bg); }
  .pg-btn { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .size-sel { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .badge-green { color: #6fcf73 !important; background: rgba(76,175,80,0.15) !important; }
  .badge-amber { color: #f0c060 !important; background: rgba(230,162,60,0.15) !important; }
  .badge-red { color: #f87171 !important; background: rgba(245,108,108,0.15) !important; }
  .act-blue { color: #6cb4ee !important; }
}
</style>

<style lang="scss">
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  z-index: 2000; display: flex; align-items: center; justify-content: center;
}
.modal-card {
  background: var(--card-bg, #fff); border-radius: 16px; max-height: 90vh;
  display: flex; flex-direction: column; box-shadow: 0 24px 80px rgba(0,0,0,0.18);
}
.modal-detail { width: 600px; max-height: 80vh; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; border-bottom: 1px solid var(--border-color, #ebeef5); flex-shrink: 0;
  h3 { margin: 0; font-size: 17px; font-weight: 600; color: var(--text-primary, #303133); }
}
.modal-close {
  background: none; border: none; font-size: 22px; cursor: pointer; color: var(--el-text-color-secondary, #909399);
  padding: 4px 8px; border-radius: 8px; transition: all 0.15s;
  &:hover { background: var(--bg-color, #f5f7fa); color: var(--text-primary, #303133); }
}
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px;
  border-top: 1px solid var(--border-color, #ebeef5); flex-shrink: 0;
}

.detail-row {
  display: flex; align-items: flex-start; padding: 12px 0;
  border-bottom: 1px solid var(--border-color, #f2f3f5);
  &:last-child { border-bottom: none; }
}
.dr-label {
  width: 100px; flex-shrink: 0; font-size: 13px; color: var(--text-secondary, #909399); font-weight: 500;
}
.dr-value {
  flex: 1; font-size: 14px; color: var(--text-primary, #303133); word-break: break-all;
}
.detail-code {
  background: var(--bg-color, #f5f7fa); padding: 8px 12px; border-radius: 6px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; line-height: 1.5;
  overflow-x: auto; white-space: pre;
}

.modal-fade-enter-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease; } }
.modal-fade-leave-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.15s ease, opacity 0.15s ease; } }
.modal-fade-enter-from { opacity: 0; .modal-card { transform: scale(0.9) translateY(16px); opacity: 0; } }
.modal-fade-leave-to { opacity: 0; .modal-card { transform: scale(0.95); opacity: 0; } }
.modal-card.closing { animation: modalOut 0.2s ease forwards; }
@keyframes modalOut { to { transform: scale(0.95); opacity: 0; } }

html.dark-mode {
  .modal-card { background: var(--card-bg); }
  .modal-header { border-color: var(--border-color); h3 { color: var(--text-primary); } }
  .modal-footer { border-color: var(--border-color); }
  .detail-code { background: var(--bg-color); }
}
</style>
