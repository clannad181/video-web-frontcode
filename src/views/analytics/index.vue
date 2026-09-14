<template>
  <div class="data-analysis">
    <div class="page-header">
      <h1 class="page-title">数据分析</h1>
      <p class="page-subtitle">深入了解平台运营数据，洞察增长趋势</p>
    </div>

    <div class="stats-grid">
      <div
        v-for="(card, idx) in statCards"
        :key="card.key"
        class="stat-card"
        :style="{ animationDelay: `${idx * 0.06}s` }"
      >
        <div class="stat-card__icon" :style="{ background: card.bgColor, color: card.color }">
          <el-icon :size="26"><component :is="card.icon" /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__label">{{ card.label }}</span>
          <span class="stat-card__value">{{ formatNum(overviewData[card.key]) }}</span>
        </div>
      </div>
    </div>

    <div class="chart-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="card-header">
            <div class="card-header__title">
              <span class="gradient-bar" />
              <span>视频趋势</span>
            </div>
            <div class="card-header__actions">
              <el-date-picker
                v-model="videoTrendRange"
                type="daterange"
                range-separator="~"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                size="small"
                :clearable="false"
                @change="loadVideoTrend"
              />
            </div>
          </div>
        </template>
        <div ref="videoTrendRef" class="chart-container" />
      </el-card>
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="card-header">
            <div class="card-header__title">
              <span class="gradient-bar" />
              <span>用户活跃度</span>
            </div>
            <div class="card-header__actions">
              <el-date-picker
                v-model="activeUserRange"
                type="daterange"
                range-separator="~"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                size="small"
                :clearable="false"
                @change="loadActiveUsers"
              />
            </div>
          </div>
        </template>
        <div ref="activeUserRef" class="chart-container" />
      </el-card>
    </div>

    <div class="chart-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="card-header">
            <div class="card-header__title">
              <span class="gradient-bar" />
              <span>内容分布</span>
            </div>
          </div>
        </template>
        <div ref="contentPieRef" class="chart-container" />
      </el-card>
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="card-header">
            <div class="card-header__title">
              <span class="gradient-bar" />
              <span>实时访客</span>
            </div>
          </div>
        </template>
        <div ref="hourlyActiveRef" class="chart-container" />
      </el-card>
    </div>

    <el-card shadow="never" class="chart-card chart-card--full">
      <template #header>
        <div class="card-header">
          <div class="card-header__title">
            <span class="gradient-bar" />
            <span>分类每日视频增量</span>
          </div>
          <div class="card-header__actions">
            <el-date-picker
              v-model="categoryIncrementRange"
              type="daterange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              size="small"
              :clearable="false"
              @change="loadCategoryIncrement"
            />
          </div>
        </div>
      </template>
      <div ref="categoryIncrementRef" class="chart-container chart-container--tall" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  VideoCamera, View, ChatDotRound, User,
  Upload, TrendCharts, ChatLineRound, UserFilled
} from '@element-plus/icons-vue'
import {
  getStatsOverview, getActiveUsers, getDailyIncrement,
  getCategoryDailyIncrement, getCategoryStats, getHourlyActive
} from '@/api/analytics'

const PALETTE = ['#00a1d6', '#fb7299', '#4caf50', '#e6a23c', '#7c5cfc', '#ff6b6b', '#1ecf54', '#ff9f43', '#5f7fff', '#a855f7']

const formatNum = (n) => {
  if (n == null) return '0'
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}

const getDateRange = (days) => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days + 1)
  return [
    start.toISOString().slice(0, 10),
    end.toISOString().slice(0, 10)
  ]
}

const overviewData = ref({})
const videoTrendRange = ref(getDateRange(7))
const activeUserRange = ref(getDateRange(7))
const categoryIncrementRange = ref(getDateRange(7))

const statCards = [
  { key: 'totalVideoCount', label: '视频总数', icon: VideoCamera, color: '#00a1d6', bgColor: 'rgba(0,161,214,0.1)' },
  { key: 'totalPlayCount', label: '总播放量', icon: View, color: '#fb7299', bgColor: 'rgba(251,114,153,0.1)' },
  { key: 'todayActiveUsers', label: '今日活跃用户', icon: TrendCharts, color: '#4caf50', bgColor: 'rgba(76,175,80,0.1)' },
  { key: 'totalCommentCount', label: '评论总数', icon: ChatDotRound, color: '#7c5cfc', bgColor: 'rgba(124,92,252,0.1)' },
  { key: 'todayNewVideos', label: '今日上传视频', icon: Upload, color: '#ff6b6b', bgColor: 'rgba(255,107,107,0.1)' },
  { key: 'todayPlayCount', label: '今日播放量', icon: View, color: '#1ecf54', bgColor: 'rgba(30,207,84,0.1)' },
  { key: 'todayNewComments', label: '今日新增评论', icon: ChatLineRound, color: '#5f7fff', bgColor: 'rgba(95,127,255,0.1)' },
  { key: 'todayLoginCount', label: '今日登录人数', icon: UserFilled, color: '#ff9f43', bgColor: 'rgba(255,159,67,0.1)' }
]

const videoTrendRef = ref(null)
const activeUserRef = ref(null)
const contentPieRef = ref(null)
const hourlyActiveRef = ref(null)
const categoryIncrementRef = ref(null)

let videoTrendChart = null
let activeUserChart = null
let contentPieChart = null
let hourlyActiveChart = null
let categoryIncrementChart = null

const baseTooltip = {
  backgroundColor: 'rgba(15, 23, 42, 0.92)',
  borderColor: 'rgba(99, 102, 241, 0.2)',
  borderWidth: 1,
  textStyle: { color: '#e2e8f0', fontSize: 12 }
}

function normalizeData(raw) {
  if (Array.isArray(raw)) return raw
  if (raw && Array.isArray(raw.data)) return raw.data
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return Object.entries(raw).map(([name, value]) => ({ name, value }))
  }
  return []
}

function normalizeObj(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw
  if (raw && raw.data && typeof raw.data === 'object') return raw.data
  return {}
}

async function loadOverview() {
  try {
    const res = await getStatsOverview()
    overviewData.value = normalizeObj(res.data)
  } catch (e) {
    console.error('获取数据概览失败', e)
  }
}

async function loadVideoTrend() {
  try {
    const [startTime, endTime] = videoTrendRange.value
    const res = await getDailyIncrement({ startTime, endTime })
    const data = normalizeData(res.data)
    if (!videoTrendRef.value) return
    if (!videoTrendChart) videoTrendChart = echarts.init(videoTrendRef.value)
    const dates = data.map(d => d.date)
    videoTrendChart.setOption({
      tooltip: {
        ...baseTooltip,
        trigger: 'axis',
        axisPointer: { type: 'cross', crossStyle: { color: '#999' } }
      },
      legend: { bottom: 0, textStyle: { color: '#909399', fontSize: 12 } },
      grid: { top: '5%', right: '4%', bottom: '15%', left: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
        axisTick: { show: false },
        axisLabel: { color: '#909399', fontSize: 11 }
      },
      yAxis: [
        {
          type: 'value',
          name: '数量',
          splitLine: { lineStyle: { color: 'rgba(0,0,0,0.04)' } },
          axisLabel: { color: '#909399', fontSize: 11 }
        },
        {
          type: 'value',
          name: '播放量',
          splitLine: { show: false },
          axisLabel: { color: '#909399', fontSize: 11 }
        }
      ],
      series: [
        {
          name: '新增视频',
          type: 'bar',
          barWidth: 16,
          itemStyle: { color: '#00a1d6', borderRadius: [3, 3, 0, 0] },
          data: data.map(d => d.videoCount ?? d.uploadCount ?? 0)
        },
        {
          name: '新增评论',
          type: 'bar',
          barWidth: 16,
          itemStyle: { color: '#fb7299', borderRadius: [3, 3, 0, 0] },
          data: data.map(d => d.commentCount ?? 0)
        },
        {
          name: '总播放量',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          lineStyle: { color: '#4caf50', width: 2.5 },
          itemStyle: { color: '#4caf50' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(76,175,80,0.25)' },
              { offset: 1, color: 'rgba(76,175,80,0.01)' }
            ])
          },
          data: data.map(d => d.playCount ?? 0)
        }
      ]
    }, true)
  } catch (e) {
    console.error('获取视频趋势数据失败', e)
  }
}

async function loadActiveUsers() {
  try {
    const [startTime, endTime] = activeUserRange.value
    const res = await getActiveUsers({ startTime, endTime })
    const data = normalizeData(res.data)
    if (!activeUserRef.value) return
    if (!activeUserChart) activeUserChart = echarts.init(activeUserRef.value)
    const dates = data.map(d => d.date)
    activeUserChart.setOption({
      tooltip: { ...baseTooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { bottom: 0, textStyle: { color: '#909399', fontSize: 12 } },
      grid: { top: '5%', right: '4%', bottom: '15%', left: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
        axisTick: { show: false },
        axisLabel: { color: '#909399', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.04)' } },
        axisLabel: { color: '#909399', fontSize: 11 }
      },
      series: [
        {
          name: '活跃用户',
          type: 'bar',
          barWidth: 24,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#4caf50' },
              { offset: 1, color: 'rgba(76,175,80,0.3)' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          data: data.map(d => d.activeCount ?? d.activeUsers ?? 0)
        }
      ]
    }, true)
  } catch (e) {
    console.error('获取活跃用户数据失败', e)
  }
}

async function loadContentPie() {
  try {
    const res = await getCategoryStats()
    let raw = res.data
    if (raw && typeof raw === 'object' && raw.data) raw = raw.data
    console.log('[内容分布] 原始数据:', raw)
    const data = normalizeData(raw)
    console.log('[内容分布] 解析后:', data)
    if (!contentPieRef.value) return
    if (!contentPieChart) contentPieChart = echarts.init(contentPieRef.value)
    const seriesData = data.map((d, i) => {
      const name = d.name ?? d.categoryName ?? d.category ?? d.label ?? d.type ?? d.title ?? ''
      const value = d.value ?? d.count ?? d.num ?? d.total ?? d.videoCount ?? 0
      return { name, value, itemStyle: { color: PALETTE[i % PALETTE.length] } }
    }).filter(d => d.name && d.value > 0)
    console.log('[内容分布] seriesData:', seriesData)
    contentPieChart.setOption({
      tooltip: {
        ...baseTooltip,
        trigger: 'item',
        formatter: (p) => `${p.name}: ${p.value.toLocaleString()} (${p.percent}%)`
      },
      legend: {
        orient: 'vertical',
        right: 10,
        bottom: 20,
        textStyle: { color: '#909399', fontSize: 12 }
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
            fontSize: 12,
            color: '#606266'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              formatter: '{b}\n{d}%'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.15)'
            }
          },
          data: seriesData
        }
      ]
    }, true)
  } catch (e) {
    console.error('获取内容分布数据失败', e)
  }
}

async function loadHourlyActive() {
  try {
    const res = await getHourlyActive()
    const data = normalizeData(res.data)
    if (!hourlyActiveRef.value) return
    if (!hourlyActiveChart) hourlyActiveChart = echarts.init(hourlyActiveRef.value)
    const hours = data.map(d => d.hour ?? d.time ?? `${String(d.hourOfDay ?? 0).padStart(2, '0')}:00`)
    hourlyActiveChart.setOption({
      tooltip: { ...baseTooltip, trigger: 'axis' },
      grid: { top: '8%', right: '4%', bottom: '12%', left: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: hours,
        boundaryGap: false,
        axisLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
        axisTick: { show: false },
        axisLabel: { color: '#909399', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.04)' } },
        axisLabel: { color: '#909399', fontSize: 11 }
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#00a1d6', width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0,161,214,0.30)' },
              { offset: 1, color: 'rgba(0,161,214,0.02)' }
            ])
          },
          data: data.map(d => d.activeCount ?? d.count ?? d.value ?? 0)
        }
      ]
    }, true)
  } catch (e) {
    console.error('获取实时访客数据失败', e)
  }
}

async function loadCategoryIncrement() {
  try {
    const [startTime, endTime] = categoryIncrementRange.value
    const res = await getCategoryDailyIncrement({ startTime, endTime })
    const rawData = normalizeData(res.data)
    const dateMap = {}
    const categoryNames = []
    const categoryMap = {}
    rawData.forEach(item => {
      const catName = item.categoryName ?? item.category ?? item.name
      const date = item.date
      if (!categoryMap[catName]) {
        categoryMap[catName] = catName
        categoryNames.push(catName)
      }
      if (!dateMap[date]) dateMap[date] = {}
      dateMap[date][catName] = item.videoCount ?? item.count ?? item.value ?? 0
    })
    const dates = Object.keys(dateMap).sort()
    categoryNames.forEach(cat => {
      dates.forEach(d => {
        if (dateMap[d][cat] == null) dateMap[d][cat] = 0
      })
    })
    if (!categoryIncrementRef.value) return
    if (!categoryIncrementChart) categoryIncrementChart = echarts.init(categoryIncrementRef.value)
    categoryIncrementChart.setOption({
      tooltip: {
        ...baseTooltip,
        trigger: 'axis',
        axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
        formatter: (params) => {
          if (!params || !params.length) return ''
          const date = params[0].axisValue
          const colCount = 2
          let rows = []
          for (let i = 0; i < params.length; i += colCount) {
            const cells = params.slice(i, i + colCount).map(p => {
              const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:4px"></span>`
              const val = p.value != null ? p.value.toLocaleString() : '0'
              return `<span style="display:inline-flex;align-items:center;min-width:120px;margin:2px 8px 2px 0">${dot}${p.seriesName}: <b style="margin-left:4px">${val}</b></span>`
            }).join('')
            rows.push(cells)
          }
          const title = `<div style="font-weight:600;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:4px">${date}</div>`
          const body = rows.map(r => `<div style="display:flex;flex-wrap:wrap">${r}</div>`).join('')
          return `<div style="max-width:520px">${title}${body}</div>`
        }
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#909399', fontSize: 12 },
        type: 'scroll'
      },
      grid: { top: '5%', right: '4%', bottom: '15%', left: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
        axisTick: { show: false },
        axisLabel: { color: '#909399', fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.04)' } },
        axisLabel: { color: '#909399', fontSize: 11 }
      },
      series: categoryNames.map((cat, i) => ({
        name: cat,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: PALETTE[i % PALETTE.length], width: 2 },
        itemStyle: { color: PALETTE[i % PALETTE.length] },
        data: dates.map(d => dateMap[d][cat] ?? 0)
      }))
    }, true)
  } catch (e) {
    console.error('获取分类每日增量数据失败', e)
  }
}

function handleResize() {
  videoTrendChart?.resize()
  activeUserChart?.resize()
  contentPieChart?.resize()
  hourlyActiveChart?.resize()
  categoryIncrementChart?.resize()
}

onMounted(async () => {
  await Promise.allSettled([
    loadOverview(),
    loadContentPie(),
    loadHourlyActive()
  ])
  await nextTick()
  await Promise.allSettled([
    loadActiveUsers(),
    loadCategoryIncrement()
  ])
  await nextTick()
  loadVideoTrend()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  videoTrendChart?.dispose()
  activeUserChart?.dispose()
  contentPieChart?.dispose()
  hourlyActiveChart?.dispose()
  categoryIncrementChart?.dispose()
})
</script>

<style lang="scss" scoped>
.data-analysis {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary, #909399);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #f2f3f5);
  border-radius: 12px;
  transition: all 0.3s ease;
  animation: fadeSlideUp 0.5s ease both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    border-color: transparent;
  }
}

.stat-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.stat-card__label {
  font-size: 14px;
  color: var(--text-secondary, #909399);
  white-space: nowrap;
}

.stat-card__value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-card {
  border: 1px solid var(--border-color, #f2f3f5);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  }

  :deep(.el-card__header) {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border-color, #f2f3f5);
    background: linear-gradient(135deg, rgba(251, 114, 153, 0.03), rgba(124, 92, 252, 0.03));
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.chart-card--full {
  margin-bottom: 0;

  .chart-container--tall {
    height: 400px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.gradient-bar {
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #fb7299, #7c5cfc);
}

.card-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 220px;
}

.chart-container {
  width: 100%;
  height: 320px;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .chart-row {
    grid-template-columns: 1fr;
  }
}
</style>
