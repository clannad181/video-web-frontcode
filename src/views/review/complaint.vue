<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ $t('稿件投诉') }}</h2>
      <span class="page-sub">{{ $t('处理用户对已发布稿件的投诉与举报') }}</span>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">{{ $t('视频标题') }}</label>
          <input v-model="filter.videoTitle" class="filter-input" :placeholder="$t('搜索视频标题')" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">{{ $t('举报人昵称') }}</label>
          <input v-model="filter.reporterNickName" class="filter-input" :placeholder="$t('搜索举报人昵称')" @keyup.enter="onSearch" />
        </div>
        <div class="filter-item">
          <label class="filter-label">{{ $t('举报类型') }}</label>
          <div class="select-wrap" :class="{ open: typeOpen }">
            <select v-model="filter.reportType" class="filter-select" @mousedown="typeOpen = true"
              @blur="typeOpen = false">
              <option value="">{{ $t('全部') }}</option>
              <optgroup v-for="g in reportTypeGroups" :key="g.typeCode" :label="$t(g.typeName)">
                <option v-for="d in g.items" :key="d.id ?? d.value" :value="d.value">{{ d.label }}</option>
              </optgroup>
            </select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">{{ $t('处理状态') }}</label>
          <div class="select-wrap" :class="{ open: statusOpen }">
            <select v-model="filter.status" class="filter-select" @mousedown="statusOpen = true"
              @blur="statusOpen = false">
              <option value="">{{ $t('全部') }}</option>
              <option value="0">{{ $t('待处理') }}</option>
              <option value="1">{{ $t('已受理') }}</option>
              <option value="2">{{ $t('已驳回') }}</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="btn btn-outline" @click="onReset">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {{ $t('重置') }}
          </button>
          <button class="btn btn-primary" @click="onSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            {{ $t('搜索') }}
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
              <th>{{ $t('被举报稿件') }}</th>
              <th>{{ $t('UP主') }}</th>
              <th>{{ $t('举报类型') }}</th>
              <th>{{ $t('举报原因') }}</th>
              <th>{{ $t('举报人') }}</th>
              <th>{{ $t('举报时间') }}</th>
              <th>{{ $t('处理状态') }}</th>
              <th>{{ $t('处理人') }}</th>
              <th>{{ $t('操作') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="10" class="empty-cell">
                <div class="empty-state">
                  <p>{{ $t('加载中...') }}</p>
                </div>
              </td>
            </tr>
            <tr v-else-if="list.length === 0">
              <td colspan="10" class="empty-cell">
                <div class="empty-state">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path
                      d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <p>{{ $t('暂无投诉数据') }}</p>
                  <span class="empty-tip">{{ $t('没有符合条件的举报记录') }}</span>
                </div>
              </td>
            </tr>
            <tr v-for="(row, idx) in list" :key="row.id" class="table-row">
              <td>{{ (pagination.page - 1) * pagination.size + idx + 1 }}</td>
              <td>
                <div class="video-cell">
                  <img v-if="row.videoCover" class="cover-thumb" :src="coverUrl(row.videoCover)" :alt="row.videoTitle"
                    @click="viewDetail(row)" />
                  <div v-else class="cover-empty" @click="viewDetail(row)"><el-icon :size="16">
                      <VideoCamera />
                    </el-icon></div>
                  <div class="video-meta">
                    <div class="cell-main col-truncate" :title="row.videoTitle">{{ row.videoTitle || '-' }}</div>
                    <div class="cell-sub col-truncate" v-if="row.episodeAvid">
                      {{ $t('第{n}集', { n: row.episodeNumber ?? '-' }) }} <template v-if="row.episodeTitle">· {{ row.episodeTitle
                        }}</template><template v-if="row.episodeDuration"> · {{ formatDuration(row.episodeDuration)
                        }}</template>
                    </div>
                    <div class="cell-sub col-truncate" v-else>{{ $t('视频级举报') }}</div>
                  </div>
                </div>
              </td>
              <td>{{ row.upNickName || '-' }}</td>
              <td>{{ $t(typeLabel(row.reportType)) }}</td>
              <td class="col-truncate" :title="row.reason">{{ row.reason || '-' }}</td>
              <td>{{ row.reporterNickName || '-' }}</td>
              <td class="mono">{{ row.createTime || '-' }}</td>
              <td><span class="badge" :class="statusCls(row.status)">{{ $t(statusLabel(row.status)) }}</span></td>
              <td>
                <template v-if="row.handlerNickName">{{ row.handlerNickName }}</template>
                <span v-else class="cell-dash">-</span>
              </td>
              <td>
                <div class="action-group">
                  <button class="act-btn act-blue" @click="viewDetail(row)">{{ $t('查看') }}</button>
                  <button class="act-btn act-green" :disabled="!row.videoId" @click="openPreview(row)">{{ $t('播放') }}</button>
                  <button class="act-btn act-pink" :disabled="row.status !== 0"
                    :title="handleTitleOf(row)" @click="openHandle(row)">{{ $t('处置') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <div class="page-info">{{ $t('共 {total} 条投诉', { total: pagination.total }) }}</div>
        <div class="page-btns">
          <button class="pg-btn" :disabled="pagination.page <= 1" @click="goPage(pagination.page - 1)">&#8249;</button>
          <template v-for="p in visiblePages" :key="p">
            <span v-if="p === '...'" class="pg-ellipsis">...</span>
            <button v-else class="pg-btn" :class="{ active: p === pagination.page }" @click="goPage(p)">{{ p }}</button>
          </template>
          <button class="pg-btn" :disabled="pagination.page >= totalPages"
            @click="goPage(pagination.page + 1)">&#8250;</button>
        </div>
        <div class="page-size">{{ $t('每页') }} <select v-model.number="pagination.size" class="size-sel" @change="onPageSizeChange">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select> {{ $t('条') }}</div>
      </div>
    </div>

    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="visible" class="modal-overlay" @click.self="visible = false">
          <div class="modal-card modal-std" @click.stop>
            <div class="modal-header">
              <h3>{{ $t('投诉详情') }}</h3>
              <button class="modal-close" @click="visible = false">&times;</button>
            </div>
            <div class="modal-body" v-if="detailRow">
              <div class="detail-cover" v-if="detailRow.videoCover">
                <img :src="coverUrl(detailRow.videoCover)" :alt="detailRow.videoTitle" />
              </div>
              <div class="detail-row"><span class="dr-label">{{ $t('视频标题') }}</span><span class="dr-value">{{ detailRow.videoTitle
                  ||
                  '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">{{ $t('视频 avid') }}</span><span class="dr-value mono">{{
                detailRow.videoAvid || '-' }}</span></div>
              <div class="detail-row">
                <span class="dr-label">{{ $t('视频状态') }}</span>
                <span class="dr-value"><span class="badge" :class="videoStatusCls(detailRow.videoStatus)">{{
                  $t(videoStatusLabel(detailRow.videoStatus)) }}</span></span>
              </div>
              <div class="detail-row"><span class="dr-label">{{ $t('UP主昵称') }}</span><span class="dr-value">{{ detailRow.upNickName
                  ||
                  '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">{{ $t('剧集标题') }}</span><span class="dr-value">{{ detailRow.episodeTitle
                  ||
                  '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">{{ $t('剧集 avid') }}</span><span class="dr-value mono">{{
                detailRow.episodeAvid || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">{{ $t('剧集集号') }}</span><span class="dr-value">{{
                detailRow.episodeNumber ??
                  '-' }}</span></div>
              <div class="detail-row">
                <span class="dr-label">{{ $t('剧集时长') }}</span>
                <span class="dr-value mono">{{ detailRow.episodeDuration ? formatDuration(detailRow.episodeDuration) :
                  '-'
                  }}</span>
              </div>
              <div class="detail-row"><span class="dr-label">{{ $t('举报人') }}</span><span class="dr-value">{{
                detailRow.reporterNickName
                  || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">{{ $t('举报类型') }}</span><span class="dr-value">{{
                $t(typeLabel(detailRow.reportType)) }}</span></div>
              <div class="detail-row"><span class="dr-label">{{ $t('补充说明') }}</span><span class="dr-value">{{ detailRow.reason ||
                  '-'
                  }}</span></div>
              <div class="detail-row">
                <span class="dr-label">{{ $t('处理状态') }}</span>
                <span class="dr-value"><span class="badge" :class="statusCls(detailRow.status)">{{
                  $t(statusLabel(detailRow.status)) }}</span></span>
              </div>
              <div class="detail-row"><span class="dr-label">{{ $t('处理人') }}</span><span class="dr-value">{{
                detailRow.handlerNickName
                  || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">{{ $t('处理备注') }}</span><span class="dr-value">{{ detailRow.handlerNote
                  ||
                  '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">{{ $t('处理时间') }}</span><span class="dr-value mono">{{
                detailRow.handleTime
                  || '-' }}</span></div>
              <div class="detail-row"><span class="dr-label">{{ $t('举报时间') }}</span><span class="dr-value mono">{{
                detailRow.createTime
                  || '-' }}</span></div>
            </div>
            <div class="modal-footer">
              <button v-if="detailRow?.status === 0" class="btn btn-primary"
                @click="openHandle(detailRow)">{{ $t('处置举报') }}</button>
              <button v-if="detailRow?.videoId" class="btn btn-outline" @click="openPreview(detailRow)">{{ $t('播放预览') }}</button>
              <button v-if="detailRow?.videoId" class="btn btn-outline" @click="goVideo(detailRow)">{{ $t('查看稿件') }}</button>
              <button class="btn btn-secondary" @click="visible = false">{{ $t('关闭') }}</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="previewVisible" class="modal-overlay" @click.self="closePreview">
          <div class="modal-card modal-wide" @click.stop>
            <div class="modal-header">
              <h3>{{ $t('播放预览') }}</h3>
              <button class="modal-close" @click="closePreview">&times;</button>
            </div>
            <div class="modal-body" style="padding: 24px;">
              <div v-if="previewLoading" class="play-state">
                <el-icon class="is-loading" :size="26">
                  <Loading />
                </el-icon>
                <p>{{ $t('正在加载稿件视频...') }}</p>
              </div>

              <div v-else-if="!currentSrc" class="play-state">
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                  <line x1="4" y1="21" x2="4" y2="19" />
                </svg>
                <p>{{ $t('暂无可播放的视频') }}</p>
                <span class="empty-tip">{{ $t('该稿件尚未上传视频，或接口未返回播放地址') }}</span>
              </div>

              <template v-else>
                <div class="player-box">
                  <DPlayer :src="currentSrc" :poster="previewPoster" :autoPlay="true" />
                </div>

                <div class="play-meta">
                  <span class="play-title">{{ previewRow?.videoTitle || '-' }}</span>
                  <span class="badge" :class="videoStatusCls(previewRow?.videoStatus)">{{
                    $t(videoStatusLabel(previewRow?.videoStatus)) }}</span>
                  <span v-if="currentTrack" class="play-tag">{{ currentTrack.epNumber != null ? $t('第{n}集', { n: currentTrack.epNumber }) : $t('视频') }}</span>
                  <span v-if="currentTrack?.title" class="play-tag play-tag-sub">{{ currentTrack.title }}</span>
                  <span v-if="currentTrack?.duration" class="play-tag play-tag-sub mono">{{
                    formatDuration(currentTrack.duration) }}</span>
                </div>

                <div v-if="previewTracks.length > 1" class="ep-chips">
                  <button v-for="(tr, i) in previewTracks" :key="tr.key" class="ep-chip"
                    :class="{ active: i === trackIdx }" @click="trackIdx = i">{{ tr.epNumber != null ? $t('第{n}集', { n: tr.epNumber }) : $t('视频') }}</button>
                </div>
              </template>
            </div>
            <div class="modal-footer">
              <button v-if="previewRow?.videoId" class="btn btn-outline" @click="goVideo(previewRow)">{{ $t('查看稿件') }}</button>
              <button class="btn btn-secondary" @click="closePreview">{{ $t('关闭') }}</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="handleVisible" class="modal-overlay" @click.self="handleVisible = false">
          <div class="modal-card modal-std" @click.stop>
            <div class="modal-header">
              <h3>{{ $t('处置举报') }}</h3>
              <button class="modal-close" @click="handleVisible = false">&times;</button>
            </div>
            <div class="modal-body" v-if="handleRow">
              <div class="handle-summary">
                <div class="hs-video">
                  <div class="hs-title">{{ handleRow.videoTitle || '-' }}</div>
                  <div class="hs-sub" v-if="handleRow.episodeAvid">
                    {{ $t('第{n}集', { n: handleRow.episodeNumber ?? '-' }) }}<template v-if="handleRow.episodeTitle"> · {{
                      handleRow.episodeTitle }}</template>
                  </div>
                  <div class="hs-sub" v-else>{{ $t('视频级举报') }}</div>
                </div>
                <div class="detail-row"><span class="dr-label">{{ $t('举报类型') }}</span><span class="dr-value">{{
                  $t(typeLabel(handleRow.reportType)) }}</span></div>
                <div class="detail-row"><span class="dr-label">{{ $t('举报人') }}</span><span class="dr-value">{{
                  handleRow.reporterNickName || '-' }}</span></div>
                <div class="detail-row"><span class="dr-label">{{ $t('补充说明') }}</span><span class="dr-value">{{ handleRow.reason ||
                    '-'
                    }}</span></div>
              </div>

              <div class="handle-field">
                <label class="filter-label">{{ $t('处理结果') }} <em class="req">*</em></label>
                <div class="result-options">
                  <label class="result-opt" :class="{ active: handleForm.handleResult === 1 }">
                    <input type="radio" :value="1" v-model="handleForm.handleResult" />
                    <span class="ro-dot"></span>
                    <span class="ro-body">
                      <span class="ro-title">{{ $t('已受理') }}</span>
                      <span class="ro-desc">{{ $t('确认违规，已发布的视频将同步下架并通知 UP 主') }}</span>
                    </span>
                  </label>
                  <label class="result-opt" :class="{ active: handleForm.handleResult === 2 }">
                    <input type="radio" :value="2" v-model="handleForm.handleResult" />
                    <span class="ro-dot"></span>
                    <span class="ro-body">
                      <span class="ro-title">{{ $t('已驳回') }}</span>
                      <span class="ro-desc">{{ $t('判定未违规，稿件与视频状态保持不变') }}</span>
                    </span>
                  </label>
                </div>
              </div>

              <div class="handle-field">
                <label class="filter-label">{{ $t('处理备注') }} <em class="opt">{{ $t('选填 · 最多 500 字') }}</em></label>
                <textarea v-model="handleForm.handlerNote" class="handle-textarea" rows="4" maxlength="500"
                  :placeholder="$t('填写处理说明，便于后续复核...')"></textarea>
                <div class="ta-count">{{ handleForm.handlerNote.length }}/500</div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" :disabled="handleLoading" @click="submitHandle">
                {{ handleLoading ? $t('提交中...') : $t('确认处置') }}
              </button>
              <button class="btn btn-secondary" :disabled="handleLoading" @click="handleVisible = false">{{ $t('取消') }}</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { VideoCamera, Loading } from '@element-plus/icons-vue'
import { getReportList, handleReport } from '@/api/report'
import { getVideoDetail } from '@/api/video'
import DPlayer from '@/components/DPlayer.vue'
import { formatDuration } from '@/utils/format'
import { ElMessage } from 'element-plus'
import { getEnabledDictData, getDictTypeList } from '@/api/dict'
import { useI18n } from 'vue-i18n'
import { OSS_BASE_URL } from '@/config'

const { t } = useI18n()

const fileBaseUrl = OSS_BASE_URL

// 举报类型来自两个字典：report_type_equity（合法权益）、report_type_rule（社区规则）
const REPORT_TYPE_CODES = ['report_type_equity', 'report_type_rule']
const FALLBACK_TYPE_NAMES = { report_type_equity: '合法权益', report_type_rule: '社区规则' } // i18n-key

const reportTypeGroups = ref([])   // [{ typeCode, typeName, items }]
const reportTypeLabelMap = ref({}) // 字典值 -> 标签

/** 每次进入页面都重新拉取举报类型字典，不走缓存 */
const fetchReportTypes = async () => {
  try {
    // 分组标题取字典类型名称，保证与字典管理里改名后同步
    let typeNames = {}
    try {
      const res = await getDictTypeList({ page: 1, size: 100 })
      const rows = Array.isArray(res?.data?.records) ? res.data.records : (Array.isArray(res?.data) ? res.data : [])
      rows.forEach(d => { if (d && d.typeCode) typeNames[d.typeCode] = d.typeName })
      // 拿不到类型名时走下面的兜底名
    } catch { }

    const results = await Promise.all(REPORT_TYPE_CODES.map(code => getEnabledDictData(code)))
    const groups = []
    const labelMap = {}
    REPORT_TYPE_CODES.forEach((code, i) => {
      const items = (Array.isArray(results[i]?.data) ? results[i].data : [])
        .filter(it => it && it.value !== undefined && it.value !== null)
      items.forEach(it => { labelMap[String(it.value)] = it.label })
      groups.push({ typeCode: code, typeName: typeNames[code] || FALLBACK_TYPE_NAMES[code] || code, items })
    })
    reportTypeGroups.value = groups
    reportTypeLabelMap.value = labelMap
  } catch (e) {
    reportTypeGroups.value = []
    reportTypeLabelMap.value = {}
    console.warn('[complaint] 加载举报类型字典失败：', e?.message || e)
  }
}

const STATUS_MAP = { 0: '待处理', 1: '已受理', 2: '已驳回' } // i18n-key

const VIDEO_STATUS_MAP = { 0: '草稿', 1: '待发布', 2: '已发布', 3: '已下架' } // i18n-key

const router = useRouter()

const typeOpen = ref(false)
const statusOpen = ref(false)

const filter = reactive({ videoTitle: '', reporterNickName: '', reportType: '', status: '' })
const list = ref([])
const loading = ref(false)
const pagination = reactive({ page: 1, size: 10, total: 0 })

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

function coverUrl(u) {
  if (!u) return ''
  if (/^(https?:)?\/\//i.test(u) || u.startsWith('data:')) return u
  return fileBaseUrl + (u.startsWith('/') ? u : '/' + u)
}

function typeLabel(v) { return reportTypeLabelMap.value[String(v)] || '其他' } // i18n-key
function statusLabel(s) { return STATUS_MAP[s] ?? '待处理' } // i18n-key
function handleTitleOf(row) { return row.status === 0 ? '' : t('该举报已处理') }
function statusCls(s) { return s === 0 ? 'badge-amber' : s === 1 ? 'badge-blue' : 'badge-gray' }
function videoStatusLabel(s) { return VIDEO_STATUS_MAP[s] ?? '-' }
function videoStatusCls(s) { return s === 2 ? 'badge-green' : s === 3 ? 'badge-red' : s === 1 ? 'badge-amber' : 'badge-gray' }

function buildParams() {
  const p = { page: pagination.page, size: pagination.size }
  if (filter.videoTitle) p.videoTitle = filter.videoTitle
  if (filter.reporterNickName) p.reporterNickName = filter.reporterNickName
  if (filter.reportType !== '') p.reportType = Number(filter.reportType)
  if (filter.status !== '') p.status = Number(filter.status)
  return p
}

async function loadData() {
  loading.value = true
  try {
    const res = await getReportList(buildParams())
    const data = res.data || {}
    list.value = data.records || []
    pagination.total = data.total || 0
  } catch (e) { console.error(e) } finally { loading.value = false }
}

function onSearch() { pagination.page = 1; loadData() }
function onReset() {
  filter.videoTitle = ''
  filter.reporterNickName = ''
  filter.reportType = ''
  filter.status = ''
  onSearch()
}
function goPage(p) { if (p >= 1 && p <= totalPages.value) { pagination.page = p; loadData() } }
function onPageSizeChange() { pagination.page = 1; loadData() }

function viewDetail(row) { detailRow.value = row; visible.value = true }

const handleVisible = ref(false)
const handleRow = ref(null)
const handleLoading = ref(false)
const handleForm = reactive({ handleResult: 1, handlerNote: '' })

function openHandle(row) {
  if (!row || row.status !== 0) return
  visible.value = false
  handleRow.value = row
  handleForm.handleResult = 1
  handleForm.handlerNote = ''
  handleVisible.value = true
}

async function submitHandle() {
  if (!handleRow.value || handleLoading.value) return
  handleLoading.value = true
  try {
    const res = await handleReport({
      reportId: handleRow.value.id,
      handleResult: handleForm.handleResult,
      handlerNote: handleForm.handlerNote.trim() || undefined
    })
    ElMessage.success(typeof res?.data === 'string' && res.data ? res.data : t('处理举报成功'))
    handleVisible.value = false
    handleRow.value = null
    loadData()
  } catch (e) {
    if (!e?.fromRequest) ElMessage.error(e?.message || t('处理失败'))
  } finally {
    handleLoading.value = false
  }
}

const previewVisible = ref(false)
const previewLoading = ref(false)
const previewRow = ref(null)
const previewTracks = ref([])
const trackIdx = ref(0)

const currentTrack = computed(() => previewTracks.value[trackIdx.value] || null)
const currentSrc = computed(() => currentTrack.value?.src || '')
const previewPoster = computed(() => coverUrl(currentTrack.value?.poster) || coverUrl(previewRow.value?.videoCover) || '')

function buildTracks(data) {
  const eps = (data.episodes || []).filter(e => e.playUrl)
  if (eps.length) {
    return eps.map((e, i) => ({
      key: e.id ?? `ep-${i}`,
      epNumber: e.episodeNumber ?? i + 1,
      title: e.title || '',
      duration: e.duration || 0,
      src: e.playUrl,
      poster: e.coverUrl || e.cover || '',
      epId: e.id ?? null
    }))
  }
  if (data.videoUrl) {
    return [{ key: 'video', epNumber: null, title: data.title || '', duration: 0, src: data.videoUrl, poster: '', epId: null }]
  }
  return []
}

async function openPreview(row) {
  if (!row?.videoId) return
  visible.value = false
  previewRow.value = row
  previewTracks.value = []
  trackIdx.value = 0
  previewVisible.value = true
  previewLoading.value = true
  try {
    const res = await getVideoDetail(row.videoId)
    const data = res.data || {}
    previewTracks.value = buildTracks(data)
    if (row.episodeId) {
      const i = previewTracks.value.findIndex(tr => tr.epId != null && tr.epId === row.episodeId)
      if (i >= 0) trackIdx.value = i
    }
  } catch (e) { console.error(e) } finally { previewLoading.value = false }
}

function closePreview() {
  const v = document.querySelector('.modal-wide video')
  if (v) { try { v.pause(); v.removeAttribute('src'); v.load() } catch { } }
  previewVisible.value = false
  previewTracks.value = []
}

function goVideo(row) {
  if (!row?.videoId) return
  visible.value = false // 关闭稿件详情弹窗
  closePreview()        // 关闭播放预览弹窗
  router.push(`/video-manage?videoId=${row.videoAvid}`)
}

onMounted(() => {
  fetchReportTypes()
  loadData()
})

// keep-alive 复用实例，每次重新进入页面都重新拉取最新字典，不使用旧数据
const isInitialActivation = ref(true)
onActivated(() => {
  if (isInitialActivation.value) {
    isInitialActivation.value = false // 首次进入已由 onMounted 拉取
    return
  }
  fetchReportTypes()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--el-text-color-primary, #303133);
  margin: 0 0 4px;
}

.page-sub {
  font-size: 13px;
  color: var(--el-text-color-secondary, #909399);
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
  padding-right: 32px;
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
  grid-column: 1 / -1;
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

  &.btn-secondary {
    background: var(--bg-color, #f5f7fa);
    color: var(--text-primary, #303133);
    border-color: var(--border-color, #dcdfe6);

    &:hover {
      background: var(--border-color, #ebedf0);
      border-color: #c0c4cc;
    }
  }
}

.table-card {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e4e7ed);
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;

  th {
    padding: 14px 16px;
    text-align: center;
    font-size: 12px;
    color: var(--text-primary, #303133);
    background: var(--bg-color, #f8f9fc);
    font-weight: 600;
    white-space: nowrap;
    border-bottom: 2px solid var(--border-color, #e4e7ed);
    user-select: none;
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border-color, #f2f3f5);
    vertical-align: middle;
    background: var(--card-bg, #fff);
    text-align: center;
    white-space: nowrap;
  }

  .table-row:hover td {
    background: var(--bg-color, #fafafa);
  }
}

.col-truncate {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.cover-thumb {
  width: 64px;
  height: 36px;
  border-radius: 4px;
  object-fit: cover;
  display: block;
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;
  background: var(--bg-color, #f5f7fa);

  &:hover {
    transform: scale(1.06);
  }
}

.cover-empty {
  width: 64px;
  height: 36px;
  border-radius: 4px;
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color, #f5f7fa);
  color: var(--el-text-color-placeholder, #c0c4cc);
}

.video-meta {
  min-width: 0;
  text-align: left;
}

.cell-main {
  font-weight: 500;
  color: var(--text-primary, #303133);
  max-width: 168px;
}

.cell-sub {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  margin-top: 3px;
  max-width: 168px;
}

.cell-dash {
  color: var(--el-text-color-placeholder, #c0c4cc);
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  &.badge-amber {
    color: #e6a23c;
    background: rgba(230, 162, 60, 0.1);
  }

  &.badge-blue {
    color: #00a1d6;
    background: rgba(0, 161, 214, 0.1);
  }

  &.badge-green {
    color: #4caf50;
    background: rgba(76, 175, 80, 0.1);
  }

  &.badge-red {
    color: #f56c6c;
    background: rgba(245, 108, 108, 0.1);
  }

  &.badge-gray {
    color: #909399;
    background: rgba(144, 147, 153, 0.1);
  }
}

.mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
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
  transition: all 0.2s ease;

  &.act-blue {
    color: #00a1d6;
    background: rgba(0, 161, 214, 0.1);

    &:hover {
      color: #fff;
      background: #00a1d6;
      box-shadow: 0 2px 8px rgba(0, 161, 214, 0.35);
    }
  }

  &.act-green {
    color: #67c23a;
    background: rgba(103, 194, 58, 0.1);

    &:hover:not(:disabled) {
      color: #fff;
      background: #67c23a;
      box-shadow: 0 2px 8px rgba(103, 194, 58, 0.35);
    }
  }

  &.act-pink {
    color: #fb7299;
    background: rgba(251, 114, 153, 0.1);

    &:hover:not(:disabled) {
      color: #fff;
      background: #fb7299;
      box-shadow: 0 2px 8px rgba(251, 114, 153, 0.35);
    }
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none !important;
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 10px;
}

.page-info {
  padding-left: 10px;
  font-size: 13px;
  color: var(--text-secondary, #909399);
}

.page-btns {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pg-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border-color, #dcdfe6);
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: var(--color-primary, #fb7299);
    color: var(--color-primary, #fb7299);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.active {
    background: var(--color-primary, #fb7299);
    color: #fff;
    border-color: var(--color-primary, #fb7299);
  }
}

.pg-ellipsis {
  width: 32px;
  text-align: center;
  color: var(--text-secondary, #909399);
}

.page-size {
  font-size: 13px;
  color: var(--text-secondary, #909399);
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 10px;
}

.size-sel {
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border-color, #dcdfe6);
  padding: 0 8px;
  font-size: 13px;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  cursor: pointer;
}

.empty-cell {
  text-align: center;
  padding: 64px 0 !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--el-text-color-secondary, #909399);

  svg {
    opacity: 0.55;
  }

  p {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary, #606266);
  }
}

.empty-tip {
  font-size: 12px;
  color: var(--el-text-color-placeholder, #c0c4cc);
}

html.dark-mode {

  .filter-card,
  .table-card {
    background: var(--card-bg);
    border-color: var(--border-color);
  }

  .filter-input,
  .filter-select {
    background: var(--bg-color);
    color: var(--text-primary);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
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

  .data-table .table-row:hover td {
    background: var(--hover-bg);
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

  .cover-thumb,
  .cover-empty {
    background: var(--bg-color);
  }

  .badge-amber {
    color: #f3b95f !important;
    background: rgba(230, 162, 60, 0.15) !important;
  }

  .badge-blue {
    color: #6cb4ee !important;
    background: rgba(0, 161, 214, 0.15) !important;
  }

  .badge-green {
    color: #6fcf73 !important;
    background: rgba(76, 175, 80, 0.15) !important;
  }

  .badge-red {
    color: #f87171 !important;
    background: rgba(245, 108, 108, 0.15) !important;
  }

  .badge-gray {
    color: #a8abb2 !important;
    background: rgba(144, 147, 153, 0.18) !important;
  }

  .act-blue {
    color: #6cb4ee !important;
  }

  .act-green {
    color: #6fcf73 !important;
  }

  .act-pink {
    color: #ff9ac6 !important;
  }

  .empty-state p {
    color: var(--text-primary);
  }

  .empty-tip {
    color: var(--el-text-color-placeholder);
  }
}
</style>

<style lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
}

.modal-std {
  width: 600px;
}

.modal-wide {
  width: 920px;
  max-width: calc(100vw - 48px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color, #ebeef5);
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
  font-size: 22px;
  cursor: pointer;
  color: var(--el-text-color-secondary, #909399);
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.15s;

  &:hover {
    background: var(--bg-color, #f5f7fa);
    color: var(--text-primary, #303133);
  }
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color, #ebeef5);
  flex-shrink: 0;
}

.detail-cover {
  margin-bottom: 16px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border-color, #ebeef5);
  background: var(--bg-color, #f5f7fa);

  img {
    display: block;
    width: 100%;
    height: auto;
    max-height: 240px;
    object-fit: cover;
  }
}

.detail-row {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color, #f2f3f5);

  &:last-child {
    border-bottom: none;
  }
}

.dr-label {
  width: 96px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--text-secondary, #909399);
  font-weight: 500;
}

.dr-value {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary, #303133);
  word-break: break-all;
}

.handle-summary {
  margin-bottom: 20px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-color, #f2f3f5);
}

.hs-video {
  padding: 0 0 8px;
}

.hs-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.hs-sub {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  margin-top: 3px;
}

.handle-field {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.handle-field .filter-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--text-secondary, #909399);
  font-weight: 500;
}

.handle-field .filter-label em {
  font-style: normal;
}

.handle-field .filter-label .req {
  color: #f56c6c;
}

.handle-field .filter-label .opt {
  color: var(--el-text-color-placeholder, #c0c4cc);
  font-weight: 400;
}

.result-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-opt {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 15px;
  cursor: pointer;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 10px;
  background: var(--card-bg, #fff);
  transition: all 0.2s ease;

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &:hover {
    border-color: rgba(251, 114, 153, 0.5);
  }

  &.active {
    border-color: var(--color-primary, #fb7299);
    background: rgba(251, 114, 153, 0.05);
    box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.1);
  }
}

.ro-dot {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
  border-radius: 50%;
  border: 2px solid var(--border-color, #dcdfe6);
  background: var(--card-bg, #fff);
  position: relative;
  transition: all 0.2s ease;
}

.result-opt.active .ro-dot {
  border-color: var(--color-primary, #fb7299);

  &::after {
    content: '';
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: var(--color-primary, #fb7299);
  }
}

.ro-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.ro-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.ro-desc {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  line-height: 1.5;
}

.handle-textarea {
  width: 100%;
  min-height: 96px;
  padding: 12px 14px;
  resize: vertical;
  border-radius: 10px;
  border: none;
  outline: none;
  font-size: 13px;
  line-height: 1.6;
  background: var(--bg-color, #f5f7fa);
  color: var(--text-primary, #303133);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
  font-family: inherit;

  &::placeholder {
    color: var(--el-text-color-placeholder, #c0c4cc);
  }

  &:focus {
    background: var(--card-bg, #fff);
    box-shadow: 0 0 0 2px rgba(251, 114, 153, 0.25);
  }
}

.ta-count {
  margin-top: 6px;
  text-align: right;
  font-size: 11px;
  color: var(--el-text-color-placeholder, #c0c4cc);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.player-box {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  overflow: hidden;
  background: #000;
  position: relative;
}

.play-state {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--bg-color, #f5f7fa);
  border: 1px dashed var(--border-color, #dcdfe6);
  border-radius: 10px;
  color: var(--text-secondary, #909399);

  svg {
    opacity: 0.5;
  }

  p {
    margin: 8px 0 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary, #606266);
  }
}

.play-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-bottom: 4px;
}

.play-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.play-tag {
  display: inline-block;
  padding: 4px 11px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary, #fb7299);
  background: rgba(251, 114, 153, 0.1);

  &.play-tag-sub {
    color: var(--text-secondary, #909399);
    background: var(--bg-color, #f5f7fa);
    font-weight: 400;
  }
}

.ep-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.ep-chip {
  padding: 7px 15px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border-color, #dcdfe6);
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary, #fb7299);
    color: var(--color-primary, #fb7299);
  }

  &.active {
    background: var(--color-primary, #fb7299);
    border-color: var(--color-primary, #fb7299);
    color: #fff;
    box-shadow: 0 2px 8px rgba(251, 114, 153, 0.3);
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
    transform: scale(0.95) translateY(0);
    opacity: 0;
  }
}

html.dark-mode {
  .modal-card {
    background: var(--card-bg);
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

  .detail-row {
    border-color: var(--border-color);
  }

  .detail-cover {
    border-color: var(--border-color);
    background: var(--bg-color);
  }

  .play-state {
    background: var(--bg-color);
    border-color: var(--border-color);
  }

  .play-title {
    color: var(--text-primary);
  }

  .play-tag-sub {
    background: var(--bg-color);
    color: var(--text-secondary);
  }

  .ep-chip {
    background: var(--card-bg);
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  .ep-chip.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;
  }

  .handle-summary {
    border-color: var(--border-color);
  }

  .handle-field .filter-label {
    color: var(--text-secondary);
  }

  .result-opt {
    background: var(--card-bg);
    border-color: var(--border-color);
  }

  .result-opt.active {
    background: rgba(251, 114, 153, 0.08);
  }

  .ro-dot {
    background: var(--card-bg);
    border-color: var(--border-color);
  }

  .ro-title {
    color: var(--text-primary);
  }

  .handle-textarea {
    background: var(--bg-color);
    color: var(--text-primary);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
  }

  .handle-textarea:focus {
    background: var(--card-bg);
  }
}
</style>
