<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">日志统计</h2>
      <span class="page-sub">登录与操作日志统计总览</span>
    </div>

    <div class="stats-section">
      <h3 class="section-title">登录统计</h3>
      <div class="stats-grid">
        <div class="stat-card" v-for="s in loginStats" :key="s.label">
          <div class="stat-icon" :style="{ background: s.bg, color: s.color }">
            <svg v-if="s.icon==='user'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <svg v-if="s.icon==='check'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            <svg v-if="s.icon==='x'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <h3 class="section-title">操作统计</h3>
      <div class="stats-grid">
        <div class="stat-card" v-for="s in operationStats" :key="s.label">
          <div class="stat-icon" :style="{ background: s.bg, color: s.color }">
            <svg v-if="s.icon==='gear'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-if="s.icon==='warning'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            <svg v-if="s.icon==='forbidden'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-header">登录趋势</div>
        <div ref="loginChartRef" class="chart-body"></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">操作趋势</div>
        <div ref="operationChartRef" class="chart-body"></div>
      </div>
    </div>

    <div class="top-row">
      <div class="top-card">
        <div class="top-header">失败次数 TOP 账号</div>
        <div class="top-body">
          <table class="top-table">
            <thead><tr><th>排名</th><th>账号</th><th>次数</th></tr></thead>
            <tbody>
              <tr v-if="accountRank.length === 0"><td colspan="3" class="empty-cell">暂无数据</td></tr>
              <tr v-for="(r, i) in accountRank" :key="i">
                <td class="rank-cell"><span class="rank-badge" :class="rankCls(i)">{{ i + 1 }}</span></td>
                <td>{{ r.account }}</td>
                <td class="num-cell">{{ r.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="top-card">
        <div class="top-header">访问 IP TOP</div>
        <div class="top-body">
          <table class="top-table">
            <thead><tr><th>排名</th><th>IP 地址</th><th>次数</th></tr></thead>
            <tbody>
              <tr v-if="ipRank.length === 0"><td colspan="3" class="empty-cell">暂无数据</td></tr>
              <tr v-for="(r, i) in ipRank" :key="i">
                <td class="rank-cell"><span class="rank-badge" :class="rankCls(i)">{{ i + 1 }}</span></td>
                <td class="mono">{{ r.ipAddress }}</td>
                <td class="num-cell">{{ r.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getLoginLogTrend } from '@/api/loginLog'
import {
  getOperationLogOverview,
  getOperationLogTrend,
  getOperationLogAccountRank,
  getOperationLogIpRank
} from '@/api/operationLog'

const loginChartRef = ref(null)
const operationChartRef = ref(null)
let loginChart = null
let operationChart = null

const overview = reactive({
  loginTotal: 0, loginSuccess: 0, loginFailure: 0,
  operationTotal: 0, businessException: 0, systemException: 0
})
const loginTrend = ref([])
const operationTrend = ref([])
const accountRank = ref([])
const ipRank = ref([])

const loginStats = ref([
  { label: '登录总次数', icon: 'user', color: '#00a1d6', bg: 'rgba(0,161,214,0.1)', value: 0 },
  { label: '登录成功', icon: 'check', color: '#4caf50', bg: 'rgba(76,175,80,0.1)', value: 0 },
  { label: '登录失败', icon: 'x', color: '#f56c6c', bg: 'rgba(245,108,108,0.1)', value: 0 }
])
const operationStats = ref([
  { label: '操作总次数', icon: 'gear', color: 'var(--color-primary, #fb7299)', bg: 'rgba(251,114,153,0.1)', value: 0 },
  { label: '业务异常', icon: 'warning', color: '#e6a23c', bg: 'rgba(230,162,60,0.1)', value: 0 },
  { label: '系统异常', icon: 'forbidden', color: '#f56c6c', bg: 'rgba(245,108,108,0.1)', value: 0 }
])

function rankCls(i) { return i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : '' }

function toArr(res, fallback) {
  const d = res && res.status === 'fulfilled' ? res.value?.data : null
  return Array.isArray(d) ? d : fallback
}

function baseChartOption(data, series, yAxis) {
  const dates = data.map(d => d.date || d.label)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,0,0,0.04)' } } },
    legend: { bottom: 0, textStyle: { fontSize: 12, color: '#666' } },
    grid: { left: '3%', right: '5%', bottom: '16%', top: '8%', containLabel: true },
    xAxis: { type: 'category', data: dates, axisLabel: { fontSize: 12 }, axisTick: { show: false }, axisLine: { lineStyle: { color: '#e5e7eb' } } },
    yAxis: yAxis || { type: 'value', axisLabel: { fontSize: 12 }, splitLine: { lineStyle: { color: '#f2f3f5' } } },
    series
  }
}

// 大数量级走左轴柱状，小数量级（异常/失败）走右轴折线，避免被压成一条看不见的细线
function dualAxis(leftName, rightName) {
  return [
    {
      type: 'value', name: leftName, position: 'left',
      axisLabel: { fontSize: 11 },
      nameTextStyle: { fontSize: 11, color: '#909399' },
      splitLine: { lineStyle: { color: '#f2f3f5' } }
    },
    {
      type: 'value', name: rightName, position: 'right', minInterval: 1,
      axisLabel: { fontSize: 11 },
      nameTextStyle: { fontSize: 11, color: '#909399' },
      splitLine: { show: false }
    }
  ]
}

function lineSeries(name, color, data) {
  return {
    name, type: 'line', yAxisIndex: 1, data, smooth: true,
    symbol: 'circle', symbolSize: 6, showSymbol: true,
    itemStyle: { color },
    lineStyle: { color, width: 2 },
    emphasis: { focus: 'series' }
  }
}

function initCharts() {
  if (loginChartRef.value) {
    loginChart = echarts.init(loginChartRef.value)
    loginChart.setOption(baseChartOption(loginTrend.value, [
      { name: '成功', type: 'bar', yAxisIndex: 0, data: loginTrend.value.map(d => d.loginSuccess || 0), itemStyle: { color: '#4caf50', borderRadius: [4, 4, 0, 0] }, emphasis: { focus: 'series' } },
      lineSeries('失败', '#f56c6c', loginTrend.value.map(d => d.loginFailure || 0))
    ], dualAxis('成功次数', '失败次数')))
  }
  if (operationChartRef.value) {
    operationChart = echarts.init(operationChartRef.value)
    operationChart.setOption(baseChartOption(operationTrend.value, [
      { name: '正常', type: 'bar', yAxisIndex: 0, data: operationTrend.value.map(d => d.normalCount || 0), itemStyle: { color: '#4caf50', borderRadius: [4, 4, 0, 0] }, emphasis: { focus: 'series' } },
      lineSeries('业务异常', '#e6a23c', operationTrend.value.map(d => d.businessException || 0)),
      lineSeries('系统异常', '#f56c6c', operationTrend.value.map(d => d.systemException || 0))
    ], dualAxis('正常次数', '异常次数')))
  }
}

function onResize() { loginChart?.resize(); operationChart?.resize() }

onMounted(async () => {
  window.addEventListener('resize', onResize)
  try {
    const [overviewRes, loginTrendRes, opTrendRes, accountRes, ipRes] = await Promise.allSettled([
      getOperationLogOverview(),
      getLoginLogTrend(),
      getOperationLogTrend(),
      getOperationLogAccountRank(),
      getOperationLogIpRank()
    ])

    const o = overviewRes.status === 'fulfilled' ? (overviewRes.value?.data || {}) : {}
    overview.loginTotal = o.loginTotal || 0
    overview.loginSuccess = o.loginSuccess || 0
    overview.loginFailure = o.loginFailure || 0
    overview.operationTotal = o.operationTotal || 0
    overview.businessException = o.businessException || 0
    overview.systemException = o.systemException || 0
    loginStats.value[0].value = overview.loginTotal
    loginStats.value[1].value = overview.loginSuccess
    loginStats.value[2].value = overview.loginFailure
    operationStats.value[0].value = overview.operationTotal
    operationStats.value[1].value = overview.businessException
    operationStats.value[2].value = overview.systemException

    loginTrend.value = toArr(loginTrendRes, [])
    operationTrend.value = toArr(opTrendRes, [])
    accountRank.value = toArr(accountRes, [])
    ipRank.value = toArr(ipRes, [])
  } catch (e) { console.error('获取统计数据失败', e) }

  await nextTick()
  initCharts()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  loginChart?.dispose()
  operationChart?.dispose()
})
</script>

<style lang="scss" scoped>
.page-container { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--el-text-color-primary, #303133); margin: 0 0 4px; }
.page-sub { font-size: 13px; color: var(--el-text-color-secondary, #909399); }

.stats-section { margin-bottom: 20px; }
.section-title { font-size: 14px; font-weight: 600; color: var(--text-primary, #303133); margin: 0 0 14px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

.stat-card {
  background: var(--card-bg, #fff); border-radius: 12px; border: 1px solid var(--border-color, #e4e7ed);
  padding: 20px 24px; display: flex; align-items: center; gap: 16px;
  transition: all 0.25s ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
}
.stat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-value { font-size: 28px; font-weight: 800; color: var(--text-primary, #303133); line-height: 1.1; }
.stat-label { font-size: 13px; color: var(--text-secondary, #909399); margin-top: 4px; }

.charts-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px; }
.chart-card {
  background: var(--card-bg, #fff); border-radius: 12px; border: 1px solid var(--border-color, #e4e7ed); overflow: hidden;
}
.chart-header { padding: 16px 20px; font-size: 14px; font-weight: 600; color: var(--text-primary, #303133); border-bottom: 1px solid var(--border-color, #ebeef5); }
.chart-body { height: 350px; padding: 12px; }

.top-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.top-card {
  background: var(--card-bg, #fff); border-radius: 12px; border: 1px solid var(--border-color, #e4e7ed); overflow: hidden;
}
.top-header { padding: 16px 20px; font-size: 14px; font-weight: 600; color: var(--text-primary, #303133); border-bottom: 1px solid var(--border-color, #ebeef5); }
.top-body { padding: 0; }
.top-table { width: 100%; border-collapse: collapse; font-size: 13px;
  th { padding: 12px 16px; text-align: left; font-size: 12px; color: var(--text-secondary, #909399); font-weight: 600; background: var(--bg-color, #f5f7fa); }
  td { padding: 14px 16px; border-bottom: 1px solid var(--border-color, #f2f3f5); color: var(--text-primary, #303133); }
  tbody tr:hover td { background: var(--hover-bg, #fafafa); }
  tbody tr:last-child td { border-bottom: none; }
}
.rank-badge {
  display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%;
  font-size: 12px; font-weight: 700; color: var(--text-secondary, #909399); background: var(--bg-color, #f5f7fa);
  &.rank-gold { background: linear-gradient(135deg, #ffd700, #ffb300); color: #7c5e00; }
  &.rank-silver { background: linear-gradient(135deg, #e0e0e0, #bdbdbd); color: #616161; }
  &.rank-bronze { background: linear-gradient(135deg, #cd7f32, #b8690e); color: #fff; }
}
.mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
.num-cell { font-weight: 600; font-variant-numeric: tabular-nums; }
.empty-cell { text-align: center; padding: 32px 16px !important; color: var(--text-secondary, #909399); }

html.dark-mode {
  .stats-section .section-title { color: var(--text-primary); }
  .stat-card { background: var(--card-bg); border-color: var(--border-color); }
  .chart-card, .top-card { background: var(--card-bg); border-color: var(--border-color); }
  .chart-header, .top-header { color: var(--text-primary); border-color: var(--border-color); }
  .top-table th { background: var(--bg-color); color: var(--text-secondary); border-color: var(--border-color); }
  .top-table td { border-color: var(--border-color); color: var(--text-primary); }
  .top-table tbody tr:hover td { background: var(--hover-bg); }
  .rank-badge { background: var(--bg-color); color: var(--text-secondary); }
}
</style>
