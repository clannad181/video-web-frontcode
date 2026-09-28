<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ pageTitle }}</h2>
      <span class="page-sub">{{ pageSub }}</span>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">登录账号</label>
          <input v-model="filter.account" class="filter-input" placeholder="搜索登录账号" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">系统类型</label>
          <div class="select-wrap" :class="{ open: systemTypeOpen }">
            <select v-model="filter.systemType" class="filter-select" @mousedown="systemTypeOpen = true" @blur="systemTypeOpen = false">
              <option value="">全部</option>
              <option value="0">后台</option>
              <option value="1">前台</option>
            </select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">登录状态</label>
          <div class="select-wrap" :class="{ open: loginStatusOpen }">
            <select v-model="filter.loginStatus" class="filter-select" @mousedown="loginStatusOpen = true" @blur="loginStatusOpen = false">
              <option value="">全部</option>
              <option value="1">成功</option>
              <option value="0">失败</option>
            </select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">登录方式</label>
          <div class="select-wrap" :class="{ open: loginTypeOpen }">
            <select v-model="filter.loginType" class="filter-select" @mousedown="loginTypeOpen = true" @blur="loginTypeOpen = false">
              <option value="">全部</option>
              <option value="img_captcha">账号登录</option>
              <option value="email_captcha">邮箱登录</option>
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
              <th>登录账号</th>
              <th>登录方式</th>
              <th>系统类型</th>
              <th>IP 地址</th>
              <th>登录状态</th>
              <th>失败原因</th>
              <th>登录时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="list.length === 0 && !loading">
              <td colspan="9" class="empty-cell"><div class="empty-state"><p>暂无数据</p></div></td>
            </tr>
            <tr v-for="(row, idx) in list" :key="row.id" class="table-row">
              <td>{{ (pagination.page - 1) * pagination.size + idx + 1 }}</td>
              <td>{{ row.account || '-' }}</td>
              <td>{{ row.loginType === 'img_captcha' ? '账号登录' : '邮箱登录' }}</td>
              <td>{{ row.systemType === 0 ? '后台' : '前台' }}</td>
              <td class="mono">{{ row.ipAddress || '-' }}</td>
              <td><span class="badge" :class="row.loginStatus === 1 ? 'badge-green' : 'badge-red'">{{ row.loginStatus === 1 ? '成功' : '失败' }}</span></td>
              <td class="col-truncate">{{ row.failReason || '-' }}</td>
              <td class="mono">{{ row.loginTime || '-' }}</td>
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
        <div v-if="visible" class="modal-overlay" @click.self="visible = false">
          <div class="modal-card modal-std" @click.stop>
            <div class="modal-header">
              <h3>登录详情</h3>
              <button class="modal-close" @click="visible = false">&times;</button>
            </div>
            <div class="modal-body" v-if="detailRow">
              <div class="detail-row"><span class="dr-label">登录账号</span><span class="dr-value">{{ detailRow.account || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">登录方式</span><span class="dr-value">{{ detailRow.loginType === 'img_captcha' ? '账号登录' : '邮箱登录' }}</span></div>
              <div class="detail-row"><span class="dr-label">系统类型</span><span class="dr-value">{{ detailRow.systemType === 0 ? '后台' : '前台' }}</span></div>
              <div class="detail-row"><span class="dr-label">IP 地址</span><span class="dr-value mono">{{ detailRow.ipAddress || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">登录状态</span><span class="dr-value"><span class="badge" :class="detailRow.loginStatus === 1 ? 'badge-green' : 'badge-red'">{{ detailRow.loginStatus === 1 ? '成功' : '失败' }}</span></span></div>
              <div class="detail-row"><span class="dr-label">失败原因</span><span class="dr-value">{{ detailRow.failReason || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">用户代理</span><span class="dr-value ua-text">{{ detailRow.userAgent || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">登录时间</span><span class="dr-value mono">{{ detailRow.loginTime || '-' }}</span></div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="visible = false">关闭</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getLoginLogList } from '@/api/loginLog'

const route = useRoute()
const pageTitle = computed(() => route.meta?.title || '登录日志')
const pageSub = computed(() =>
  route.path === '/system-log'
    ? '查看系统运行与登录安全审计记录'
    : '查看系统用户登录记录和安全审计'
)

const loading = ref(false)
const list = ref([])
const pagination = reactive({ page: 1, size: 10, total: 0 })
const filter = reactive({ account: '', systemType: '', loginStatus: '', loginType: '', startTime: '', endTime: '' })

const systemTypeOpen = ref(false)
const loginStatusOpen = ref(false)
const loginTypeOpen = ref(false)

const visible = ref(false)
const detailRow = ref(null)

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

function buildParams() {
  const p = { page: pagination.page, size: pagination.size }
  if (filter.account) p.account = filter.account
  if (filter.systemType !== '') p.systemType = filter.systemType
  if (filter.loginStatus !== '') p.loginStatus = filter.loginStatus
  if (filter.loginType) p.loginType = filter.loginType
  if (filter.startTime) p.startTime = filter.startTime.replace('T', ' ') + ':00'
  if (filter.endTime) p.endTime = filter.endTime.replace('T', ' ') + ':00'
  return p
}

async function loadData() {
  loading.value = true
  try {
    const res = await getLoginLogList(buildParams())
    const data = res.data || {}
    list.value = data.records || []
    pagination.total = data.total || 0
  } catch (e) { console.error(e) } finally { loading.value = false }
}

function onSearch() { pagination.page = 1; loadData() }
function onReset() {
  filter.account = ''; filter.systemType = ''; filter.loginStatus = ''
  filter.loginType = ''; filter.startTime = ''; filter.endTime = ''
  onSearch()
}
function goPage(p) { if (p >= 1 && p <= totalPages.value) { pagination.page = p; loadData() } }
function onPageSizeChange() { pagination.page = 1; loadData() }

function viewDetail(row) { detailRow.value = row; visible.value = true }

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
.col-truncate { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.badge {
  display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; white-space: nowrap;
  &.badge-green { color: #4caf50; background: rgba(76,175,80,0.1); }
  &.badge-red { color: #f56c6c; background: rgba(245,108,108,0.1); }
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
.modal-std { width: 520px; }
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
.ua-text { font-size: 12px; line-height: 1.5; }

.modal-fade-enter-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease; } }
.modal-fade-leave-active { transition: opacity 0.2s ease; .modal-card { transition: transform 0.15s ease, opacity 0.15s ease; } }
.modal-fade-enter-from { opacity: 0; .modal-card { transform: scale(0.9) translateY(16px); opacity: 0; } }
.modal-fade-leave-to { opacity: 0; .modal-card { transform: scale(0.95); opacity: 0; } }

html.dark-mode {
  .modal-card { background: var(--card-bg); }
  .modal-header { border-color: var(--border-color); h3 { color: var(--text-primary); } }
  .modal-footer { border-color: var(--border-color); }
}
</style>
