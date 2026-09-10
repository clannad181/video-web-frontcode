<template>
  <div class="dashboard">
    <div class="stat-cards">
      <div
        v-for="(item, idx) in statCards"
        :key="item.label"
        class="stat-card"
        :class="`stat-card--${item.theme}`"
        :style="{ animationDelay: `${idx * 0.1}s` }"
      >
        <div class="stat-card__icon">
          <el-icon :size="22"><component :is="item.icon" /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__label">{{ item.label }}</span>
          <span class="stat-card__value">{{ item.value }}</span>
          <span class="stat-card__change" :class="item.up ? 'up' : 'down'">
            <el-icon :size="12"><Top v-if="item.up" /><Bottom v-else /></el-icon>
            {{ Math.abs(item.change) }}% 较昨日
          </span>
        </div>
      </div>
    </div>

    <div class="main-grid">
      <div class="grid-left">
        <div class="panel chart-panel fade-in" style="animation-delay: 0.4s">
          <div class="panel-header">
            <h3>7日趋势</h3>
            <div class="legend-row">
              <span class="legend-dot" style="background:#6366f1" />视频
              <span class="legend-dot" style="background:#22c55e" />评论
              <span class="legend-dot" style="background:#f472b6" />弹幕
            </div>
          </div>
          <div ref="trendChartRef" class="chart-container" />
        </div>

        <div class="panel activity-panel fade-in" style="animation-delay: 0.5s">
          <div class="panel-header">
            <h3>最近动态</h3>
          </div>
          <div class="activity-list">
            <div
              v-for="(act, idx) in activities"
              :key="idx"
              class="activity-item"
              :style="{ animationDelay: `${0.5 + idx * 0.06}s` }"
            >
              <div class="activity-icon" :class="`activity-icon--${act.type}`">
                <el-icon :size="14">
                  <SuccessFilled v-if="act.type === 'green'" />
                  <WarningFilled v-else-if="act.type === 'orange'" />
                  <CircleCloseFilled v-else-if="act.type === 'red'" />
                  <InfoFilled v-else />
                </el-icon>
              </div>
              <div class="activity-body">
                <span class="activity-text" v-html="act.text" />
                <span class="activity-time">{{ act.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-right">
        <div class="panel audit-panel fade-in" style="animation-delay: 0.45s">
          <div class="panel-header">
            <h3>待审核内容</h3>
            <el-button type="primary" text size="small" @click="$router.push('/audit')">
              查看全部
            </el-button>
          </div>
          <el-table :data="pendingAudit" style="width: 100%" :header-cell-style="headerStyle" :cell-style="cellStyle" stripe>
            <el-table-column prop="title" label="标题" min-width="140" show-overflow-tooltip />
            <el-table-column prop="username" label="用户" width="100" />
            <el-table-column prop="type" label="类型" width="80">
              <template #default="{ row }">
                <el-tag size="small" :type="typeTagMap[row.type] || 'info'">
                  {{ typeLabelMap[row.type] || row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="$router.push('/audit')">
                  去审核
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  User, Warning, TrendCharts, ChatDotRound,
  Top, Bottom,
  SuccessFilled, WarningFilled, CircleCloseFilled, InfoFilled
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getDashboardStats, getVisitTrend } from '@/api/dashboard'
import { getAuditList } from '@/api/audit'

const trendChartRef = ref(null)
let trendChart = null
const pendingAudit = ref([])

const statCards = ref([
  { label: '今日新增用户', value: '0', icon: User, color: '#6366f1', theme: 'blue', change: 12.5, up: true },
  { label: '今日待审核', value: '0', icon: Warning, color: '#f59e0b', theme: 'orange', change: 3.2, up: true },
  { label: '活跃用户', value: '0', icon: TrendCharts, color: '#22c55e', theme: 'green', change: 8.7, up: true },
  { label: '弹幕总量', value: '0', icon: ChatDotRound, color: '#ec4899', theme: 'pink', change: 1.3, up: false }
])

const typeLabelMap = { video: '视频', comment: '评论', danmaku: '弹幕' }
const typeTagMap = { video: 'primary', comment: 'success', danmaku: 'warning' }

const headerStyle = { background: 'rgba(255,255,255,0.02)', color: '#94a3b8', border: 'none', fontSize: '13px', fontWeight: 500 }
const cellStyle = { background: 'transparent', color: '#cbd5e1', border: 'none', fontSize: '13px' }

const activities = ref([
  { type: 'green', text: '视频「<b>Vue3 高级进阶教程</b>」已发布', time: '2 分钟前' },
  { type: 'red', text: '用户「<b>user_5823</b>」被举报', time: '8 分钟前' },
  { type: 'orange', text: '检测到违规内容「<b>低俗广告</b>」', time: '15 分钟前' },
  { type: 'blue', text: '用户「<b>张三</b>」完成实名认证', time: '22 分钟前' },
  { type: 'green', text: '新用户「<b>coder_007</b>」注册', time: '30 分钟前' },
  { type: 'green', text: '视频「<b>Python 数据分析实战</b>」已发布', time: '45 分钟前' },
  { type: 'red', text: '用户「<b>spam_bot</b>」被举报', time: '1 小时前' },
  { type: 'orange', text: '检测到违规内容「<b>虚假宣传</b>」', time: '1 小时前' },
  { type: 'blue', text: '用户「<b>李四</b>」完成实名认证', time: '2 小时前' },
  { type: 'green', text: '新用户「<b>dev_master</b>」注册', time: '2 小时前' },
  { type: 'green', text: '视频「<b>WebGL 粒子特效</b>」已发布', time: '3 小时前' },
  { type: 'red', text: '用户「<b>fake_acct</b>」被举报', time: '3 小时前' }
])

function formatNum(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}

function initTrendChart(data) {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)

  const dates = data.map(d => d.date)
  const makeGradient = (color) => new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: color.replace(')', ', 0.25)').replace('rgb', 'rgba') },
    { offset: 1, color: color.replace(')', ', 0.01)').replace('rgb', 'rgba') }
  ])

  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      axisPointer: { lineStyle: { color: 'rgba(99, 102, 241, 0.3)' } }
    },
    grid: { top: 20, right: 20, bottom: 32, left: 50 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLabel: { color: '#64748b', fontSize: 11 }
    },
    series: [
      {
        name: '视频', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { width: 2.5, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        areaStyle: { color: makeGradient('rgb(99,102,241)') },
        data: data.map(d => d.videos)
      },
      {
        name: '评论', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { width: 2.5, color: '#22c55e' },
        itemStyle: { color: '#22c55e' },
        areaStyle: { color: makeGradient('rgb(34,197,94)') },
        data: data.map(d => d.comments)
      },
      {
        name: '弹幕', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { width: 2.5, color: '#f472b6' },
        itemStyle: { color: '#f472b6' },
        areaStyle: { color: makeGradient('rgb(244,114,182)') },
        data: data.map(d => d.danmaku)
      }
    ]
  })
}

function handleResize() {
  trendChart?.resize()
}

onMounted(async () => {
  const [statsRes, trendRes, auditRes] = await Promise.all([
    getDashboardStats(),
    getVisitTrend({ days: 7 }),
    getAuditList({ pageSize: 5 })
  ])

  const s = statsRes.data
  statCards.value[0].value = formatNum(s.todayNewUsers)
  statCards.value[1].value = String(s.todayNewVideos)
  statCards.value[2].value = formatNum(Math.floor(s.todayViews / 10))
  statCards.value[3].value = formatNum(Math.floor(s.todayComments * 12))

  pendingAudit.value = auditRes.data.list

  const trendData = trendRes.data.map(d => ({
    date: d.date,
    videos: Math.floor(Math.random() * 200) + 80,
    comments: Math.floor(Math.random() * 500) + 200,
    danmaku: Math.floor(Math.random() * 1500) + 600
  }))

  await nextTick()
  initTrendChart(trendData)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 0;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  transition: all 0.3s ease;
  animation: fadeSlideUp 0.6s ease both;
  backdrop-filter: blur(8px);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }

  &--blue .stat-card__icon { background: rgba(99, 102, 241, 0.12); color: #818cf8; }
  &--orange .stat-card__icon { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
  &--green .stat-card__icon { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
  &--pink .stat-card__icon { background: rgba(236, 72, 153, 0.12); color: #f472b6; }
}

.stat-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
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
  font-size: 13px;
  color: #64748b;
}

.stat-card__value {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.stat-card__change {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 500;

  &.up { color: #4ade80; }
  &.down { color: #f87171; }
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
}

.grid-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 24px;
  animation: fadeSlideUp 0.6s ease both;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0;
  }
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  color: #64748b;
}

.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.chart-container {
  height: 320px;
}

.activity-panel {
  max-height: 420px;
  display: flex;
  flex-direction: column;
}

.activity-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 8px;
  border-radius: 10px;
  transition: background 0.2s;
  animation: fadeSlideUp 0.5s ease both;

  &:hover { background: rgba(255, 255, 255, 0.03); }
}

.activity-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--green { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
  &--red { background: rgba(239, 68, 68, 0.12); color: #f87171; }
  &--orange { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
  &--blue { background: rgba(99, 102, 241, 0.12); color: #818cf8; }
}

.activity-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.activity-text {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.5;

  :deep(b) { color: #e2e8f0; font-weight: 600; }
}

.activity-time {
  font-size: 11px;
  color: #475569;
}

.audit-panel {
  :deep(.el-table) {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: transparent;
    --el-table-border-color: rgba(255, 255, 255, 0.04);
    --el-table-row-hover-bg-color: rgba(255, 255, 255, 0.03);
    --el-table-stripe-bg-color: rgba(255, 255, 255, 0.015);
  }

  :deep(.el-table .el-table__row) {
    color: #cbd5e1;
  }

  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
    background: rgba(255, 255, 255, 0.015);
  }

  :deep(.el-table td.el-table__cell) {
    border-bottom-color: rgba(255, 255, 255, 0.04);
  }

  :deep(.el-tag) {
    border: none;
    font-size: 11px;
    border-radius: 6px;
  }

  :deep(.el-table__empty-text) {
    color: #475569;
  }
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .stat-cards { grid-template-columns: repeat(2, 1fr); }
  .main-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .stat-cards { grid-template-columns: 1fr; }
  .stat-card { padding: 18px; }
  .stat-card__value { font-size: 22px; }
  .panel { padding: 18px; }
  .chart-container { height: 240px; }
}
</style>
