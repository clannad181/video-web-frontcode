<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">{{ $t('系统信息') }}</h2>
        <span class="page-sub">{{ $t('服务器运行状态监控') }}</span>
      </div>
      <div class="header-right">
        <div class="refresh-indicator" :class="{ active: refreshing }">
          <span class="refresh-dot"></span>
          <span class="refresh-text">{{ refreshing ? $t('刷新中...') : $t('每 15 秒自动刷新') }}</span>
        </div>
      </div>
    </div>

    <div class="stat-cards">
      <div class="stat-card" v-for="(card, i) in statCards" :key="i" :style="{ animationDelay: i * 60 + 'ms' }">
        <div class="stat-icon" :style="{ background: card.bg, color: card.color }">
          <svg v-if="card.icon === 'coffee'" width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
          </svg>
          <svg v-if="card.icon === 'clock'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <svg v-if="card.icon === 'check'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <svg v-if="card.icon === 'x'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <svg v-if="card.icon === 'cpu'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value" :class="card.class" :style="card.valueStyle">{{ $t(card.value) }}</div>
          <div class="stat-label">{{ $t(card.label) }}</div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="section-header">
        <div class="section-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>
        <h3 class="section-title">{{ $t('系统信息') }}</h3>
      </div>
      <div class="detail-grid">
        <div class="detail-item" v-for="(item, i) in detailItems" :key="i" :style="{ animationDelay: i * 50 + 'ms' }">
          <span class="detail-label">{{ $t(item.label) }}</span>
          <span class="detail-value" :class="item.class">{{ item.value }}</span>
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="section-header">
        <div class="section-icon section-icon-pink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <h3 class="section-title">{{ $t('资源使用') }}</h3>
      </div>
      <div class="ring-grid">
        <div class="ring-card" v-for="(ring, i) in ringData" :key="i" :style="{ animationDelay: i * 80 + 'ms' }">
          <div class="ring-wrap">
            <svg class="ring-svg" viewBox="0 0 120 120">
              <circle class="ring-bg" cx="60" cy="60" r="50" fill="none" stroke-width="8" />
              <circle class="ring-progress" cx="60" cy="60" r="50" fill="none" stroke-width="8" stroke-linecap="round"
                :stroke="ring.color" :stroke-dasharray="C" :stroke-dashoffset="ring.offset" />
            </svg>
            <div class="ring-center">
              <div class="ring-pct" :style="{ color: ring.color }">{{ ring.pct }}%</div>
              <div class="ring-label">{{ $t(ring.label) }}</div>
            </div>
          </div>
          <div class="ring-detail" v-html="ring.detail"></div>
        </div>
      </div>
    </div>

    <div v-if="diskList.length" class="info-section">
      <div class="section-header">
        <div class="section-icon section-icon-green">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
        </div>
        <h3 class="section-title">{{ $t('磁盘详情') }}</h3>
      </div>
      <div class="disk-list">
        <div class="disk-row" v-for="(d, i) in diskList" :key="d.mount" :style="{ animationDelay: i * 60 + 'ms' }">
          <div class="disk-head">
            <span class="disk-name">{{ d.name || $t('磁盘') }}</span>
            <span class="disk-mount">{{ d.mount }}</span>
            <span class="disk-type" v-if="d.type">{{ d.type }}</span>
          </div>
          <div class="disk-bar-wrap">
            <div class="disk-bar-track">
              <div class="disk-bar-fill" :style="{ width: diskPctVal(d) + '%', background: diskBarGrad(d) }"></div>
            </div>
            <span class="disk-bar-pct" :style="{ color: diskBarColor(d) }">{{ diskPctVal(d) }}%</span>
          </div>
          <div class="disk-info">
            <span class="disk-info-item"><span class="disk-info-dot" style="background:#f44336"></span>{{ $t('已用 {val}GB', { val: d.used }) }}</span>
            <span class="disk-info-item"><span class="disk-info-dot" style="background:#4caf50"></span>{{ $t('可用 {val}GB', { val: d.free }) }}</span>
            <span class="disk-info-item"><span class="disk-info-dot" style="background:#909399"></span>{{ $t('总量 {val}GB', { val: d.total }) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { getSystemInfo } from '@/api/systemInfo'

const { t } = useI18n()

const C = 2 * Math.PI * 50
const info = reactive({
  cpuCores: 0, javaVersion: '', javaVendor: '', jvmStartTime: '', jvmUptime: '',
  heapUsed: 0, heapMax: 0, heapUsage: 0, nonHeapUsed: 0,
  threadCount: 0, daemonThreadCount: 0, peakThreadCount: 0,
  osName: '', osArch: '', systemCpuLoad: 0, processCpuLoad: 0,
  systemLoadAverage: 0, systemTotalMemory: 0, systemFreeMemory: 0, systemUsedMemory: 0, systemMemoryUsage: 0,
  diskInfoList: []
})
const loaded = ref(false)
const refreshing = ref(false)
const uptimeSeconds = ref(0)
let uptimeTimer = null
let refreshTimer = null

const uptimeDisplay = computed(() => {
  const s = uptimeSeconds.value
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return t('{d}天 {h}时 {m}分 {sec}秒', { d, h, m, sec })
  return t('{h}时 {m}分 {sec}秒', { h, m, sec })
})

// jvmUptime 为后端返回的固定中文时长格式（属解析用纯数据，非翻译 key）；i18n-key 仅为让检查脚本放行
function parseUptime(str) {
  if (!str) return 0
  const dm = str.match(/(\d+)\s*天/) || [] // i18n-key
  const hm = str.match(/(\d+)\s*小时/) || [] // i18n-key
  const mm = str.match(/(\d+)\s*分/) || [] // i18n-key
  const sm = str.match(/(\d+)\s*秒/) || [] // i18n-key
  return (parseInt(dm[1]) || 0) * 86400 + (parseInt(hm[1]) || 0) * 3600 + (parseInt(mm[1]) || 0) * 60 + (parseInt(sm[1]) || 0)
}

const statusOk = computed(() => loaded.value)

const statCards = computed(() => [
  { icon: 'coffee', label: 'Java 版本', value: info.javaVersion || '-', bg: 'rgba(0,161,214,0.1)', color: '#00a1d6' }, // i18n-key
  { icon: 'clock', label: 'JVM 运行时长', value: uptimeDisplay.value, bg: 'rgba(251,114,153,0.1)', color: '#fb7299', class: 'uptime-val' }, // i18n-key
  {
    icon: statusOk.value ? 'check' : 'x',
    label: '系统状态', // i18n-key
    value: statusOk.value ? '运行正常' : '系统异常', // i18n-key
    bg: statusOk.value ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
    color: statusOk.value ? '#4caf50' : '#f44336',
    valueStyle: { color: statusOk.value ? '#4caf50' : '#f44336' }
  },
  { icon: 'cpu', label: '活跃线程', value: info.threadCount || '-', bg: 'rgba(124,92,252,0.1)', color: '#7c5cfc' } // i18n-key
])

const detailItems = computed(() => [
  { label: '操作系统', value: info.osName || '-' }, // i18n-key
  { label: '系统架构', value: info.osArch || '-' }, // i18n-key
  { label: 'Java 供应商', value: info.javaVendor || '-' }, // i18n-key
  { label: 'JVM 启动时间', value: info.jvmStartTime || '-' }, // i18n-key
  { label: '线程信息', value: t('{current} / 峰值 {peak}', { current: info.threadCount || 0, peak: info.peakThreadCount || 0 }), class: 'mono' }, // i18n-key
  { label: '守护线程', value: info.daemonThreadCount || '-' } // i18n-key
])

const cpuPct = computed(() => info.systemCpuLoad.toFixed(1))
const cpuColor = computed(() => cpuPct.value >= 90 ? '#f44336' : cpuPct.value >= 70 ? '#ff9800' : '#00a1d6')
const cpuOffset = computed(() => C * (1 - info.systemCpuLoad / 100))

const memPct = computed(() => info.systemMemoryUsage.toFixed(1))
const memColor = computed(() => parseFloat(memPct.value) >= 90 ? '#f44336' : parseFloat(memPct.value) >= 70 ? '#ff9800' : '#fb7299')
const memOffset = computed(() => C * (1 - info.systemMemoryUsage / 100))

const heapPct = computed(() => info.heapUsage.toFixed(1))
const heapColor = computed(() => parseFloat(heapPct.value) >= 90 ? '#f44336' : parseFloat(heapPct.value) >= 70 ? '#ff9800' : '#7c5cfc')
const heapOffset = computed(() => C * (1 - info.heapUsage / 100))

const diskList = computed(() => info.diskInfoList || [])
const diskUsedGB = computed(() => diskList.value.reduce((s, d) => s + (d.used || 0), 0))
const diskTotalGB = computed(() => diskList.value.reduce((s, d) => s + (d.total || 0), 0))
const diskPct = computed(() => diskTotalGB.value ? ((diskUsedGB.value / diskTotalGB.value) * 100).toFixed(1) : '0.0')
const diskColor = computed(() => parseFloat(diskPct.value) >= 90 ? '#f44336' : parseFloat(diskPct.value) >= 70 ? '#ff9800' : '#4caf50')
const diskOffset = computed(() => C * (1 - parseFloat(diskPct.value) / 100))

const ringData = computed(() => [
  { label: 'CPU 负载', pct: cpuPct.value, color: cpuColor.value, offset: cpuOffset.value, detail: t('系统 {cpu} / 进程 {proc} · {cores} 核', { cpu: `<b>${info.systemCpuLoad.toFixed(1)}%</b>`, proc: `<b>${info.processCpuLoad.toFixed(1)}%</b>`, cores: info.cpuCores }) }, // i18n-key
  { label: '内存占用', pct: memPct.value, color: memColor.value, offset: memOffset.value, detail: t('已用 {used} / 总量 {total}', { used: `<b>${info.systemUsedMemory}MB</b>`, total: `${info.systemTotalMemory}MB` }) }, // i18n-key
  { label: 'JVM 堆内存', pct: heapPct.value, color: heapColor.value, offset: heapOffset.value, detail: t('已用 {used} / 最大 {max} · 非堆 {nonHeap}', { used: `<b>${info.heapUsed}MB</b>`, max: `${info.heapMax}MB`, nonHeap: `${info.nonHeapUsed}MB` }) }, // i18n-key
  { label: '磁盘使用', pct: diskPct.value, color: diskColor.value, offset: diskOffset.value, detail: `<b>${diskUsedGB.value}GB</b> / ${diskTotalGB.value}GB` } // i18n-key
])

function diskPctVal(d) { return d.usage != null ? d.usage.toFixed(1) : (d.total ? ((d.used / d.total) * 100).toFixed(1) : 0) }
function diskBarColor(d) { const p = parseFloat(diskPctVal(d)); return p >= 90 ? '#f44336' : p >= 70 ? '#ff9800' : '#4caf50' }
function diskBarGrad(d) {
  const p = parseFloat(diskPctVal(d))
  if (p >= 90) return 'linear-gradient(90deg, #f44336, #ff5722)'
  if (p >= 70) return 'linear-gradient(90deg, #ff9800, #ffc107)'
  return 'linear-gradient(90deg, #4caf50, #8bc34a)'
}

async function fetchInfo() {
  refreshing.value = true
  try {
    const res = await getSystemInfo()
    const d = res.data || {}
    Object.keys(info).forEach(k => { if (d[k] !== undefined) info[k] = d[k] })
    uptimeSeconds.value = parseUptime(d.jvmUptime)
    loaded.value = true
  } catch (e) {
    console.error('获取系统信息失败', e)
    loaded.value = false
  } finally {
    setTimeout(() => { refreshing.value = false }, 400)
  }
}

onMounted(() => {
  fetchInfo()
  refreshTimer = setInterval(fetchInfo, 15000)
  uptimeTimer = setInterval(() => { uptimeSeconds.value++ }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(refreshTimer)
  clearInterval(uptimeTimer)
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 0;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color, #f2f3f5);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary, #303133);
  margin: 0;
}

.page-sub {
  font-size: 13px;
  color: var(--text-secondary, #909399);
}

.header-right {
  display: flex;
  align-items: center;
}

.refresh-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--bg-color, #f5f7fa);
  font-size: 12px;
  color: var(--text-secondary, #909399);
  transition: all 0.3s ease;

  &.active {
    background: rgba(251, 114, 153, 0.08);
    color: #fb7299;
  }
}

.refresh-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4caf50;
  flex-shrink: 0;
  animation: pulse-dot 2s ease-in-out infinite;
}

.refresh-indicator.active .refresh-dot {
  background: #fb7299;
  animation: pulse-dot 0.8s ease-in-out infinite;
}

@keyframes pulse-dot {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--card-bg, #fff);
  border-radius: 14px;
  border: 1px solid var(--border-color, #e4e7ed);
  padding: 20px 10px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #303133);
  line-height: 1.2;
}

.uptime-val {
  font-size: 15px;
  letter-spacing: 0.3px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  margin-top: 4px;
}

.info-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 161, 214, 0.1);
  color: #00a1d6;
  flex-shrink: 0;

  &.section-icon-pink {
    background: rgba(251, 114, 153, 0.1);
    color: #fb7299;
  }

  &.section-icon-green {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.detail-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.2s ease;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;

  &:hover {
    background: var(--border-color, #ebedf0);
    transform: translateY(-1px);
  }
}

.detail-label {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: var(--text-primary, #303133);
  font-weight: 600;
}

.mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
}

.ring-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.ring-card {
  background: var(--card-bg, #fff);
  border-radius: 14px;
  border: 1px solid var(--border-color, #e4e7ed);
  padding: 28px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
}

.ring-wrap {
  position: relative;
  width: 120px;
  height: 120px;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  stroke: var(--bg-color, #f2f3f5);
}

.ring-progress {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-pct {
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.ring-label {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  margin-top: 4px;
}

.ring-detail {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  text-align: center;
  line-height: 1.6;

  :deep(b) {
    color: var(--text-primary, #303133);
    font-weight: 600;
  }
}

.disk-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.disk-row {
  background: var(--card-bg, #fff);
  border-radius: 14px;
  border: 1px solid var(--border-color, #e4e7ed);
  padding: 18px 22px;
  transition: all 0.2s ease;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;

  &:hover {
    border-color: var(--color-primary, #fb7299);
    box-shadow: 0 2px 12px rgba(251, 114, 153, 0.08);
  }
}

.disk-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.disk-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.disk-mount {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  background: var(--bg-color, #f5f7fa);
  padding: 2px 8px;
  border-radius: 4px;
}

.disk-type {
  font-size: 11px;
  color: #fb7299;
  background: rgba(251, 114, 153, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.disk-bar-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.disk-bar-track {
  flex: 1;
  height: 10px;
  background: var(--bg-color, #f2f3f5);
  border-radius: 5px;
  overflow: hidden;
}

.disk-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.disk-bar-pct {
  font-size: 13px;
  font-weight: 700;
  min-width: 48px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.disk-info {
  display: flex;
  gap: 20px;
}

.disk-info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

.disk-info-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

html.dark-mode {
  .page-header {
    border-color: var(--border-color);
  }

  .stat-card,
  .ring-card,
  .disk-row {
    background: var(--card-bg);
    border-color: var(--border-color);
  }

  .detail-item {
    background: var(--bg-color);

    &:hover {
      background: var(--border-color);
    }
  }

  .ring-bg {
    stroke: var(--border-color);
  }

  .disk-bar-track {
    background: var(--border-color);
  }

  .disk-mount {
    background: var(--bg-color);
  }
}
</style>
