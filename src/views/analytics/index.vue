<template>
  <div class="analytics">
    <div class="metric-cards">
      <div
        v-for="(item, idx) in metricCards"
        :key="item.label"
        class="metric-card"
        :class="`metric-card--${item.theme}`"
        :style="{ animationDelay: `${idx * 0.08}s` }"
      >
        <div class="metric-card__icon">
          <el-icon :size="20"><component :is="item.icon" /></el-icon>
        </div>
        <div class="metric-card__body">
          <span class="metric-card__label">{{ item.label }}</span>
          <span class="metric-card__value">{{ item.value }}</span>
          <span class="metric-card__trend" :class="item.up ? 'up' : 'down'">
            <el-icon :size="12"><Top v-if="item.up" /><Bottom v-else /></el-icon>
            {{ Math.abs(item.change) }}%
          </span>
        </div>
      </div>
    </div>

    <div class="toolbar fade-in" style="animation-delay: 0.4s">
      <div class="toolbar__left">
        <el-radio-group v-model="activeRange" size="small" class="range-group" @change="handleRangeChange">
          <el-radio-button value="7">近7天</el-radio-button>
          <el-radio-button value="30">近30天</el-radio-button>
          <el-radio-button value="90">近90天</el-radio-button>
        </el-radio-group>
      </div>
      <div class="toolbar__right">
        <el-date-picker
          v-model="customDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          size="small"
          :clearable="true"
          @change="handleCustomRange"
        />
      </div>
    </div>

    <el-row :gutter="20" class="chart-row fade-in" style="animation-delay: 0.45s">
      <el-col :span="24">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">视频趋势</span>
              <div class="legend-row">
                <span class="legend-dot" style="background:#6366f1" />上传数
                <span class="legend-dot" style="background:#22c55e" />播放量
              </div>
            </div>
          </template>
          <div ref="videoTrendRef" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row fade-in" style="animation-delay: 0.5s">
      <el-col :span="14">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">用户活跃趋势</span>
              <div class="legend-row">
                <span class="legend-dot" style="background:#8b5cf6" />活跃用户
                <span class="legend-dot" style="background:#06b6d4" />登录用户
                <span class="legend-dot" style="background:#f59e0b" />新用户
              </div>
            </div>
          </template>
          <div ref="userActivityRef" class="chart-container" />
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">内容分布</span>
            </div>
          </template>
          <div ref="contentPieRef" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row fade-in" style="animation-delay: 0.55s">
      <el-col :span="16">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">分类每日增量</span>
              <div class="legend-row">
                <span v-for="cat in categoryNames" :key="cat" class="legend-item">
                  <span class="legend-dot" :style="{ background: categoryColorMap[cat] }" />{{ cat }}
                </span>
              </div>
            </div>
          </template>
          <div ref="categoryIncrementRef" class="chart-container" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="chart-card realtime-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">实时访客</span>
              <span class="online-badge">
                <span class="online-dot" />
                {{ realtimeVisitors.length }} 在线
              </span>
            </div>
          </template>
          <div class="visitor-list">
            <div
              v-for="(v, idx) in realtimeVisitors"
              :key="v.id"
              class="visitor-item"
              :style="{ animationDelay: `${0.6 + idx * 0.05}s` }"
            >
              <div class="visitor-info">
                <span class="visitor-ip">{{ v.ip }}</span>
                <span class="visitor-location">{{ v.location }}</span>
              </div>
              <div class="visitor-meta">
                <el-tag size="small" type="info" effect="plain" round>{{ v.page }}</el-tag>
                <span class="visitor-duration">{{ formatDuration(v.duration) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  VideoCamera, View, ChatDotRound, User,
  Upload, TrendCharts, ChatLineRound, UserFilled,
  Top, Bottom
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import {
  getDashboardStats, getVideoTrend, getUserActivityTrend,
  getCategoryDistribution, getCategoryDailyIncrement, getRealtimeVisitors
} from '@/api/dashboard'

const formatNum = (n) => {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}

const formatDuration = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

const activeRange = ref('7')
const customDateRange = ref(null)

const metricCards = ref([
  { label: '视频总数', value: '0', icon: VideoCamera, theme: 'indigo', change: 5.2, up: true },
  { label: '总播放量', value: '0', icon: View, theme: 'green', change: 12.8, up: true },
  { label: '今日活跃', value: '0', icon: TrendCharts, theme: 'purple', change: 3.6, up: true },
  { label: '评论总数', value: '0', icon: ChatDotRound, theme: 'pink', change: 1.4, up: true },
  { label: '今日上传', value: '0', icon: Upload, theme: 'cyan', change: 8.1, up: true },
  { label: '今日播放', value: '0', icon: View, theme: 'blue', change: 2.3, up: true },
  { label: '新增评论', value: '0', icon: ChatLineRound, theme: 'orange', change: 4.7, up: true },
  { label: '登录人数', value: '0', icon: UserFilled, theme: 'teal', change: 0.8, up: false }
])

const videoTrendRef = ref(null)
const userActivityRef = ref(null)
const contentPieRef = ref(null)
const categoryIncrementRef = ref(null)

const categoryNames = ref(['科技', '游戏', '生活', '教育', '娱乐'])
const categoryColorMap = {
  '科技': '#6366f1',
  '游戏': '#22c55e',
  '生活': '#f59e0b',
  '教育': '#06b6d4',
  '娱乐': '#ec4899'
}

const realtimeVisitors = ref([])

const makeGradient = (color, opacity1 = 0.25, opacity2 = 0.01) =>
  new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: color.replace(')', `, ${opacity1})`).replace('rgb', 'rgba') },
    { offset: 1, color: color.replace(')', `, ${opacity2})`).replace('rgb', 'rgba') }
  ])

const baseTooltip = {
  backgroundColor: 'rgba(15, 23, 42, 0.92)',
  borderColor: 'rgba(99, 102, 241, 0.2)',
  borderWidth: 1,
  textStyle: { color: '#e2e8f0', fontSize: 12 },
  axisPointer: { lineStyle: { color: 'rgba(99, 102, 241, 0.15)' } }
}

const baseAxis = (dates) => ({
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
  }
})

let videoTrendChart = null
let userActivityChart = null
let contentPieChart = null
let categoryIncrementChart = null

function initVideoTrend(data) {
  if (!videoTrendRef.value) return
  videoTrendChart = echarts.init(videoTrendRef.value)
  const dates = data.map(d => d.date)
  videoTrendChart.setOption({
    tooltip: { ...baseTooltip, trigger: 'axis' },
    grid: { top: 20, right: 24, bottom: 32, left: 56 },
    legend: { show: false },
    ...baseAxis(dates),
    series: [
      {
        name: '上传数', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { width: 2.5, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        areaStyle: { color: makeGradient('rgb(99,102,241)') },
        data: data.map(d => d.uploadCount)
      },
      {
        name: '播放量', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { width: 2.5, color: '#22c55e' },
        itemStyle: { color: '#22c55e' },
        areaStyle: { color: makeGradient('rgb(34,197,94)') },
        data: data.map(d => d.playCount)
      }
    ]
  })
}

function initUserActivity(data) {
  if (!userActivityRef.value) return
  userActivityChart = echarts.init(userActivityRef.value)
  const dates = data.map(d => d.date)
  userActivityChart.setOption({
    tooltip: { ...baseTooltip, trigger: 'axis' },
    grid: { top: 20, right: 24, bottom: 32, left: 56 },
    legend: { show: false },
    ...baseAxis(dates),
    series: [
      {
        name: '登录用户', type: 'bar', barWidth: 14, itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(6,182,212,0.8)' },
            { offset: 1, color: 'rgba(6,182,212,0.2)' }
          ])
        },
        data: data.map(d => d.loginUsers)
      },
      {
        name: '活跃用户', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { width: 2.5, color: '#8b5cf6' },
        itemStyle: { color: '#8b5cf6' },
        areaStyle: { color: makeGradient('rgb(139,92,246)') },
        data: data.map(d => d.activeUsers)
      },
      {
        name: '新用户', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { width: 2, color: '#f59e0b', type: 'dashed' },
        itemStyle: { color: '#f59e0b' },
        data: data.map(d => d.newUsers)
      }
    ]
  })
}

function initContentPie(data) {
  if (!contentPieRef.value) return
  contentPieChart = echarts.init(contentPieRef.value)
  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#06b6d4', '#ec4899']
  contentPieChart.setOption({
    tooltip: {
      ...baseTooltip,
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    color: colors,
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['50%', '52%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: {
        show: true,
        color: '#606266',
        fontSize: 12,
        formatter: '{b}\n{d}%'
      },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.15)' }
      },
      data
    }]
  })
}

function initCategoryIncrement(data) {
  if (!categoryIncrementRef.value) return
  categoryIncrementChart = echarts.init(categoryIncrementRef.value)
  const dates = data.map(d => d.date)
  const series = categoryNames.value.map((cat, i) => ({
    name: cat,
    type: 'bar',
    stack: 'total',
    barWidth: 20,
    itemStyle: {
      color: categoryColorMap[cat],
      borderRadius: i === categoryNames.value.length - 1 ? [3, 3, 0, 0] : 0
    },
    data: data.map(d => d[cat])
  }))
  categoryIncrementChart.setOption({
    tooltip: { ...baseTooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 20, right: 24, bottom: 32, left: 56 },
    legend: { show: false },
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
    series
  })
}

function handleResize() {
  videoTrendChart?.resize()
  userActivityChart?.resize()
  contentPieChart?.resize()
  categoryIncrementChart?.resize()
}

async function loadCharts(days) {
  const [videoRes, activityRes, pieRes, incrementRes] = await Promise.all([
    getVideoTrend({ days }),
    getUserActivityTrend({ days }),
    getCategoryDistribution(),
    getCategoryDailyIncrement({ days })
  ])

  await nextTick()
  initVideoTrend(videoRes.data)
  initUserActivity(activityRes.data)
  initContentPie(pieRes.data)
  initCategoryIncrement(incrementRes.data)
}

function handleRangeChange(val) {
  customDateRange.value = null
  loadCharts(Number(val))
}

function handleCustomRange(val) {
  if (val) {
    activeRange.value = ''
  }
}

onMounted(async () => {
  const statsRes = await getDashboardStats()
  const s = statsRes.data
  metricCards.value[0].value = formatNum(s.totalVideos)
  metricCards.value[1].value = formatNum(s.totalViews)
  metricCards.value[2].value = formatNum(s.todayActive)
  metricCards.value[3].value = formatNum(s.totalComments)
  metricCards.value[4].value = String(s.todayUploads)
  metricCards.value[5].value = formatNum(s.todayViews)
  metricCards.value[6].value = String(s.todayComments)
  metricCards.value[7].value = formatNum(s.todayLogins)

  const visitorRes = await getRealtimeVisitors()
  realtimeVisitors.value = visitorRes.data

  await loadCharts(7)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  videoTrendChart?.dispose()
  userActivityChart?.dispose()
  contentPieChart?.dispose()
  categoryIncrementChart?.dispose()
})
</script>

<style lang="scss" scoped>
.analytics {
  padding: 0;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: #fff;
  border: 1px solid #f2f3f5;
  border-radius: 12px;
  transition: all 0.3s ease;
  animation: fadeSlideUp 0.5s ease both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    border-color: transparent;
  }

  &--indigo .metric-card__icon { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
  &--green .metric-card__icon { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
  &--purple .metric-card__icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
  &--pink .metric-card__icon { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
  &--cyan .metric-card__icon { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }
  &--blue .metric-card__icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
  &--orange .metric-card__icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
  &--teal .metric-card__icon { background: rgba(20, 184, 166, 0.1); color: #14b8a6; }
}

.metric-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.metric-card__label {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.metric-card__value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.metric-card__trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  font-weight: 600;

  &.up { color: #10b981; }
  &.down { color: #ef4444; }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  animation: fadeSlideUp 0.5s ease both;
}

.range-group {
  :deep(.el-radio-button__inner) {
    border-radius: 6px;
    border: 1px solid #dcdfe6;
    font-size: 13px;

    &:first-child { border-radius: 6px 0 0 6px; }
    &:last-child { border-radius: 0 6px 6px 0; }
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: #409eff;
    border-color: #409eff;
  }
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 12px;
  border: 1px solid #f2f3f5;
  overflow: hidden;

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #f2f3f5;
  }

  :deep(.el-card__body) {
    padding: 16px 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 2px;
}

.chart-container {
  height: 320px;
}

.realtime-card {
  max-height: 400px;
}

.online-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #10b981;
  font-weight: 500;
}

.online-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.visitor-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 320px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
}

.visitor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  transition: background 0.2s;
  animation: fadeSlideUp 0.4s ease both;

  &:hover { background: #f9fafb; }
}

.visitor-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.visitor-ip {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.visitor-location {
  font-size: 11px;
  color: #909399;
}

.visitor-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.visitor-duration {
  font-size: 11px;
  color: #909399;
  font-family: 'SF Mono', 'Menlo', monospace;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1200px) {
  .metric-cards { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .metric-cards { grid-template-columns: 1fr; }
  .metric-card { padding: 16px; }
  .metric-card__value { font-size: 20px; }
  .chart-container { height: 240px; }
}
</style>
