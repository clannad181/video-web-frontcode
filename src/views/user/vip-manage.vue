<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">{{ $t('大会员管理') }}</h1>
      <p class="page-subtitle">{{ $t('管理用户大会员开通与续期记录') }}</p>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">{{ $t('用户 UID') }}</label>
          <input v-model="query.userUid" class="filter-input" :placeholder="$t('输入用户 UID')" @keyup.enter="search" />
        </div>
        <div class="filter-item">
          <label class="filter-label">{{ $t('用户名') }}</label>
          <input v-model="query.userName" class="filter-input" :placeholder="$t('输入用户名')" @keyup.enter="search" />
        </div>
        <div class="filter-item">
          <label class="filter-label">{{ $t('状态') }}</label>
          <div class="select-wrap" :class="{ open: statusOpen }">
            <select v-model="query.status" class="filter-select" @mousedown="statusOpen = true" @blur="statusOpen = false">
              <option value="">{{ $t('全部') }}</option>
              <option :value="0">{{ $t('生效中') }}</option>
              <option :value="1">{{ $t('已到期') }}</option>
              <option :value="2">{{ $t('已撤销') }}</option>
            </select>
          </div>
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
          {{ $t('开通大会员') }}
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-wrap" v-loading="loading">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-index">#</th>
              <th>{{ $t('用户') }}</th>
              <th>{{ $t('用户名') }}</th>
              <th>{{ $t('昵称') }}</th>
              <th>{{ $t('时长（月）') }}</th>
              <th>{{ $t('开始生效时间') }}</th>
              <th>{{ $t('到期时间') }}</th>
              <th>{{ $t('状态') }}</th>
              <th>{{ $t('备注') }}</th>
              <th>{{ $t('创建时间') }}</th>
              <th class="sticky-col">{{ $t('操作') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="records.length === 0 && !loading">
              <td colspan="11" class="empty-row">{{ $t('暂无数据') }}</td>
            </tr>
            <tr v-for="(row, idx) in records" :key="row.id" class="table-row">
              <td class="col-index">{{ (query.page - 1) * query.size + idx + 1 }}</td>
              <td>
                <div class="user-cell">
                  <img v-if="row.avatar && !avatarErr.has(row.userUid)" class="user-avatar" :src="row.avatar" @error="onAvatarErr(row.userUid)" />
                  <div v-else class="user-avatar avatar-fb">{{ (row.userName || '?')[0].toUpperCase() }}</div>
                  <span class="user-uid">UID {{ row.userUid }}</span>
                </div>
              </td>
              <td class="name-cell">{{ row.userName }}</td>
              <td class="cell-muted">{{ row.nikeName || '-' }}</td>
              <td>{{ row.durationMonths ?? '—' }}</td>
              <td>{{ row.startTime || '-' }}</td>
              <td>{{ row.expireTime || '-' }}</td>
              <td>
                <span class="status-badge" :class="row.status === 0 ? 'badge-on' : 'badge-off'">
                  {{ statusLabel(row.status) }}
                </span>
              </td>
              <td class="cell-remark">{{ row.remark || '-' }}</td>
              <td class="cell-muted">{{ row.createTime }}</td>
              <td class="sticky-col">
                <div class="action-group">
                  <button class="btn-action btn-detail" @click="openDetail(row)">{{ $t('详情') }}</button>
                  <button v-if="row.status === 0" class="btn-action btn-renew" @click="openRenewModal(row)">{{ $t('续期') }}</button>
                  <button v-if="row.status !== 2" class="btn-action btn-delete" @click="confirmDelete(row)">{{ $t('撤销') }}</button>
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
        </select>
      </div>
    </div>

    <!-- 开通大会员弹窗 -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showOpenModal" class="modal-overlay" @click.self="closeOpenModal">
          <div class="modal-card modal-std" @click.stop>
            <div class="modal-header">
              <h3>{{ $t('开通大会员') }}</h3>
              <button class="modal-close" @click="closeOpenModal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="fg">
                <label class="fl">{{ $t('用户 UID') }} <span class="req">*</span></label>
                <input v-model="openForm.userUid" class="fi" :placeholder="$t('请输入用户 UID')" />
              </div>
              <div class="fg">
                <label class="fl">{{ $t('开通方式') }}</label>
                <div class="seg-row">
                  <button type="button" class="seg-btn" :class="{ active: openForm.mode === 'months' }" @click="openForm.mode = 'months'">{{ $t('按月数开通') }}</button>
                  <button type="button" class="seg-btn" :class="{ active: openForm.mode === 'expire' }" @click="openForm.mode = 'expire'">{{ $t('指定到期时间') }}</button>
                </div>
              </div>
              <div v-if="openForm.mode === 'months'" class="fg">
                <label class="fl">{{ $t('时长（月）') }} <span class="req">*</span></label>
                <input v-model.number="openForm.months" class="fi" type="number" min="1" max="120" :placeholder="$t('请输入开通时长（月）')" />
              </div>
              <div v-else class="fg">
                <label class="fl">{{ $t('到期时间') }} <span class="req">*</span></label>
                <input v-model="openForm.expireTime" class="fi" type="datetime-local" :placeholder="$t('请输入到期时间')" />
                <p class="fh">{{ $t('格式：2030-01-01 00:00:00') }}</p>
              </div>
              <div class="fg">
                <label class="fl">{{ $t('开通备注') }}</label>
                <textarea v-model="openForm.remark" class="fi fi-text" rows="3" :placeholder="$t('备注')"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeOpenModal">{{ $t('取消') }}</button>
              <button class="btn btn-primary" :disabled="openSaving" @click="handleOpen">{{ $t('确认开通') }}</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- 续期/修改到期时间弹窗 -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showRenewModal" class="modal-overlay" @click.self="closeRenewModal">
          <div class="modal-card modal-std" @click.stop>
            <div class="modal-header">
              <h3>{{ $t('续期/修改到期时间') }}</h3>
              <button class="modal-close" @click="closeRenewModal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="fg">
                <label class="fl">{{ $t('用户') }}</label>
                <p class="fh-strong">{{ renewForm.userName }}（UID {{ renewForm.userUid }}）</p>
                <p class="fh">{{ $t('当前到期时间：{time}', { time: renewForm.currentExpire || '-' }) }}</p>
              </div>
              <div class="fg">
                <label class="fl">{{ $t('开通方式') }}</label>
                <div class="seg-row">
                  <button type="button" class="seg-btn" :class="{ active: renewForm.mode === 'months' }" @click="renewForm.mode = 'months'">{{ $t('按月数开通') }}</button>
                  <button type="button" class="seg-btn" :class="{ active: renewForm.mode === 'expire' }" @click="renewForm.mode = 'expire'">{{ $t('指定到期时间') }}</button>
                </div>
              </div>
              <div v-if="renewForm.mode === 'months'" class="fg">
                <label class="fl">{{ $t('时长（月）') }} <span class="req">*</span></label>
                <input v-model.number="renewForm.months" class="fi" type="number" min="1" max="120" :placeholder="$t('请输入续期时长（月）')" />
              </div>
              <div v-else class="fg">
                <label class="fl">{{ $t('到期时间') }} <span class="req">*</span></label>
                <input v-model="renewForm.expireTime" class="fi" type="datetime-local" :placeholder="$t('请输入到期时间')" />
                <p class="fh">{{ $t('格式：2030-01-01 00:00:00') }}</p>
              </div>
              <div class="fg">
                <label class="fl">{{ $t('续期备注（将覆盖原备注）') }}</label>
                <textarea v-model="renewForm.remark" class="fi fi-text" rows="3" :placeholder="$t('备注')"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeRenewModal">{{ $t('取消') }}</button>
              <button class="btn btn-primary" :disabled="renewSaving" @click="handleRenew">{{ $t('确认续期') }}</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- 详情弹窗 -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
          <div class="modal-card modal-std" @click.stop>
            <div class="modal-header">
              <h3>{{ $t('开通记录详情') }}</h3>
              <button class="modal-close" @click="showDetail = false">&times;</button>
            </div>
            <div class="modal-body" v-loading="detailLoading">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="dk">{{ $t('用户 UID') }}</span>
                  <span class="dv">{{ detail.userUid ?? '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('用户名') }}</span>
                  <span class="dv">{{ detail.userName || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('昵称') }}</span>
                  <span class="dv">{{ detail.nikeName || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('时长（月）') }}</span>
                  <span class="dv">{{ detail.durationMonths ?? '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('到期时间') }}</span>
                  <span class="dv">{{ detail.expireTime || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('状态') }}</span>
                  <span class="dv">
                    <span class="status-badge" :class="detail.status === 0 ? 'badge-on' : 'badge-off'">
                      {{ statusLabel(detail.status) }}
                    </span>
                  </span>
                </div>
                <div class="detail-item detail-full">
                  <span class="dk">{{ $t('备注') }}</span>
                  <span class="dv">{{ detail.remark || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('订单号') }}</span>
                  <span class="dv">{{ detail.orderNo || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('订单金额') }}</span>
                  <span class="dv">{{ detail.orderAmount != null ? '¥ ' + detail.orderAmount : '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('订单状态') }}</span>
                  <span class="dv">
                    <span v-if="detail.orderStatus != null" class="order-badge" :class="'ost-' + detail.orderStatus">{{ orderStatusLabel(detail.orderStatus) }}</span>
                    <template v-else>-</template>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('支付方式') }}</span>
                  <span class="dv">
                    <template v-if="detail.orderPayMethod === 1 || detail.orderPayMethod === 2">
                      <span class="pay-logo" :class="detail.orderPayMethod === 1 ? 'pay-alipay' : 'pay-wechat'">{{ payMethodLabel(detail.orderPayMethod).charAt(0) }}</span>{{ payMethodLabel(detail.orderPayMethod) }}
                    </template>
                    <template v-else>-</template>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('支付时间') }}</span>
                  <span class="dv">{{ detail.orderPayTime || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('创建人') }}</span>
                  <span class="dv">{{ detail.createUser ?? '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('创建时间') }}</span>
                  <span class="dv">{{ detail.createTime || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="dk">{{ $t('更新时间') }}</span>
                  <span class="dv">{{ detail.updateTime || '-' }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showDetail = false">{{ $t('取消') }}</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getVipList, getVipDetail, openVip, renewVip, deleteVip } from '@/api/vip'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const loading = ref(false)
const records = ref([])
const total = ref(0)
const statusOpen = ref(false)
const avatarErr = ref(new Set())

const query = reactive({ userUid: '', userName: '', status: '', page: 1, size: 10 })

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

function search() {
  query.page = 1
  fetchData()
}

function resetQuery() {
  query.userUid = ''
  query.userName = ''
  query.status = ''
  query.page = 1
  fetchData()
}

function onAvatarErr(uid) {
  const next = new Set(avatarErr.value)
  next.add(uid)
  avatarErr.value = next
}

// --- 数据加载 ---
async function fetchData() {
  loading.value = true
  try {
    const params = { page: query.page, size: query.size }
    if (query.userUid) params.userUid = query.userUid
    if (query.userName) params.userName = query.userName
    if (query.status !== '') params.status = query.status
    const res = await getVipList(params)
    records.value = res.data?.records || []
    total.value = res.data?.total ?? 0
  } catch (e) {
    console.error('加载大会员记录失败', e)
  } finally {
    loading.value = false
  }
}

// --- 时间与数值校验 ---
function localToBackend(v) {
  return v ? v.replace('T', ' ') + (v.length === 16 ? ':00' : '') : ''
}

function validateMode(mode, months, expireTime) {
  if (mode === 'months') {
    const n = Number(months)
    if (!Number.isInteger(n) || n < 1 || n > 120) {
      ElMessage.warning(t('开通时长必须为 1~120 的整数月'))
      return null
    }
    return { durationMonths: n }
  }
  const local = localToBackend(expireTime)
  if (!local || Number.isNaN(new Date(local).getTime()) || new Date(local).getTime() <= Date.now()) {
    ElMessage.warning(t('到期时间必须晚于当前时间'))
    return null
  }
  return { expireTime: local }
}

// --- 开通大会员 ---
const showOpenModal = ref(false)
const openSaving = ref(false)
const openForm = reactive({ userUid: '', mode: 'months', months: 12, expireTime: '', remark: '' })

function openAddModal() {
  openForm.userUid = ''
  openForm.mode = 'months'
  openForm.months = 12
  openForm.expireTime = ''
  openForm.remark = ''
  showOpenModal.value = true
}

function closeOpenModal() {
  if (openSaving.value) return
  showOpenModal.value = false
}

async function handleOpen() {
  if (!String(openForm.userUid).trim()) {
    ElMessage.warning(t('请输入用户 UID'))
    return
  }
  const modePayload = validateMode(openForm.mode, openForm.months, openForm.expireTime)
  if (!modePayload) return
  openSaving.value = true
  try {
    const data = { userUid: String(openForm.userUid).trim(), ...modePayload }
    if (openForm.remark.trim()) data.remark = openForm.remark.trim()
    await openVip(data)
    ElMessage.success(t('开通成功'))
    showOpenModal.value = false
    fetchData()
  } catch (e) {
    console.error('开通大会员失败', e)
  } finally {
    openSaving.value = false
  }
}

// --- 续期 ---
const showRenewModal = ref(false)
const renewSaving = ref(false)
const renewForm = reactive({ id: null, userUid: '', userName: '', currentExpire: '', mode: 'months', months: 6, expireTime: '', remark: '' })

function openRenewModal(row) {
  renewForm.id = row.id
  renewForm.userUid = row.userUid
  renewForm.userName = row.userName
  renewForm.currentExpire = row.expireTime || ''
  renewForm.mode = 'months'
  renewForm.months = 6
  renewForm.expireTime = ''
  renewForm.remark = ''
  showRenewModal.value = true
}

function closeRenewModal() {
  if (renewSaving.value) return
  showRenewModal.value = false
}

async function handleRenew() {
  const modePayload = validateMode(renewForm.mode, renewForm.months, renewForm.expireTime)
  if (!modePayload) return
  renewSaving.value = true
  try {
    const data = { id: renewForm.id, ...modePayload }
    if (renewForm.remark.trim()) data.remark = renewForm.remark.trim()
    await renewVip(data)
    ElMessage.success(t('续期成功'))
    showRenewModal.value = false
    fetchData()
  } catch (e) {
    console.error('续期失败', e)
  } finally {
    renewSaving.value = false
  }
}

// --- 详情 ---
const showDetail = ref(false)
const detailLoading = ref(false)
const detail = ref({})

function orderStatusLabel(s) {
  return { 0: t('待支付'), 1: t('已支付'), 2: t('已取消'), 3: t('已关闭') }[s] ?? '-'
}

function payMethodLabel(m) {
  return { 1: t('支付宝'), 2: t('微信') }[m] ?? '-'
}

async function openDetail(row) {
  showDetail.value = true
  detailLoading.value = true
  detail.value = {}
  try {
    const res = await getVipDetail(row.id)
    detail.value = res.data || {}
  } catch (e) {
    console.error('加载大会员详情失败', e)
  } finally {
    detailLoading.value = false
  }
}

// --- 撤销 ---
function statusLabel(s) {
  if (s === 0) return t('生效中')
  if (s === 2) return t('已撤销')
  return t('已到期')
}
async function confirmDelete(row) {
  try {
    await ElMessageBox.confirm(t('确定要撤销 UID {uid} 的大会员记录吗？', { uid: row.userUid }), t('撤销确认'), {
      confirmButtonText: t('确定'),
      cancelButtonText: t('取消'),
      type: 'warning'
    })
    await deleteVip(row.id)
    ElMessage.success(t('撤销成功'))
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error('撤销失败', e)
  }
}

onMounted(() => {
  fetchData()
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
  min-width: 1270px;
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

.name-cell { font-weight: 400; }
.cell-muted { color: var(--text-secondary, #909399); }
.cell-remark {
  max-width: 180px;
  color: var(--text-secondary, #909399);
}

.user-cell { display: inline-flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--bg-color, #f5f7fa);
}
.avatar-fb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffd1e3, #ff9ac6);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
.user-uid { color: var(--text-secondary, #909399); font-size: 12px; }

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
}
.badge-on { color: #67c23a; background: rgba(103,194,58,0.1); }
.badge-off { color: #909399; background: rgba(144,147,153,0.08); }

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
.btn-detail { color: #409eff; background: rgba(64,158,255,0.1); &:hover { color: #fff; background: #409eff; } }
.btn-renew { color: #7c5cfc; background: rgba(124,92,252,0.1); &:hover { color: #fff; background: #7c5cfc; } }
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
.fi-text {
  height: auto;
  min-height: 80px;
  padding: 10px 14px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}
.fh { margin: 6px 0 0; font-size: 12px; color: #909399; }
.fh-strong { margin: 0; font-size: 14px; font-weight: 600; color: #303133; }

/* Segmented mode switch */
.seg-row { display: flex; gap: 8px; }
.seg-btn {
  flex: 1;
  height: 40px;
  border-radius: 10px;
  border: 1.5px solid #e4e7ed;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: #d0d3d9; }
  &.active {
    border-color: var(--color-primary, #fb7299);
    color: var(--color-primary, #fb7299);
    background: rgba(251,114,153,0.06);
    font-weight: 600;
  }
}

/* Detail grid */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
  padding: 8px 0;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  &.detail-full { grid-column: 1 / -1; }
}
.dk { font-size: 12px; color: #909399; }
.dv { font-size: 13px; color: #303133; font-weight: 500; word-break: break-all; white-space: normal; text-align: left; }

/* Order status badge */
.order-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  &.ost-0 { color: #e6a23c; background: rgba(230,162,60,0.1); }
  &.ost-1 { color: #67c23a; background: rgba(103,194,58,0.1); }
  &.ost-2 { color: #909399; background: rgba(144,147,153,0.08); }
  &.ost-3 { color: #f56c6c; background: rgba(245,108,108,0.1); }
}

/* Payment method logo */
.pay-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  margin-right: 6px;
  position: relative;
  top: -1px;
  flex-shrink: 0;
  &.pay-alipay { background: #1677ff; box-shadow: 0 1px 3px rgba(22,119,255,0.35); }
  &.pay-wechat { background: #07c160; box-shadow: 0 1px 3px rgba(7,193,96,0.35); }
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
  .data-table td { border-color: var(--border-color); color: var(--text-primary); background: var(--card-bg); }
  .data-table tbody tr:hover td { background: var(--hover-bg); }
  .filter-input, .filter-select { background: var(--bg-color); color: var(--text-primary); box-shadow: inset 0 1px 3px rgba(0,0,0,0.15); }
  .filter-input:focus { background: var(--card-bg); box-shadow: 0 0 0 2px rgba(251,114,153,0.3); }
  .pg-btn { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .page-size-sel { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
  .modal-card { background: var(--card-bg); }
  .modal-header {
    h3 { color: var(--text-primary); }
    .modal-close { color: var(--text-secondary); &:hover { color: var(--text-primary); background: var(--bg-color); } }
  }
  .modal-footer { border-color: var(--border-color); }
  .fl, .fh-strong { color: var(--text-primary); }
  .fi { background: var(--bg-color); color: var(--text-primary); border-color: var(--border-color); }
  .fi:focus { background: var(--card-bg); box-shadow: 0 0 0 2px rgba(251,114,153,0.3); }
  .seg-btn { background: var(--bg-color); border-color: var(--border-color); color: var(--text-primary); &.active { border-color: var(--color-primary); color: var(--color-primary); background: rgba(251,114,153,0.12); } }
  .dk, .fh, .user-uid, .cell-remark { color: var(--text-secondary); }
  .dv { color: var(--text-primary); }
  .btn-detail { color: #79bbff !important; }
  .btn-renew { color: #a78bfa !important; }
  .btn-delete { color: #f87171 !important; }
  .sticky-col { background: var(--card-bg); }
  .table-row:hover .sticky-col { background: var(--hover-bg); }
}
</style>
