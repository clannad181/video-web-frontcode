<template>
  <div class="log-statistics">
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card fade-in" style="animation-delay: 0.1s">
          <template #header>
            <div class="card-header">
              <span class="card-title">登录趋势</span>
              <div class="legend-row">
                <span class="legend-dot" style="background:#67c23a" />成功
                <span class="legend-dot" style="background:#f56c6c" />失败
              </div>
            </div>
          </template>
          <div ref="loginChartRef" class="chart-container" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card fade-in" style="animation-delay: 0.15s">
          <template #header>
            <div class="card-header">
              <span class="card-title">操作趋势</span>
            </div>
          </template>
          <div ref="operationChartRef" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="never" class="rank-card fade-in" style="animation-delay: 0.2s">
          <template #header>
            <div class="card-header">
              <span class="card-title">近7天登录 TOP3</span>
            </div>
          </template>
          <div class="rank-list">
            <div
              v-for="(item, idx) in loginTop3"
              :key="item.username"
              class="rank-item"
              :style="{ animationDelay: `${0.25 + idx * 0.08}s` }"
            >
              <span class="rank-num" :class="`rank-${idx + 1}`">{{ idx + 1 }}</span>
              <span class="rank-name">{{ item.username }}</span>
              <div class="rank-bar-wrap">
                <div
                  class="rank-bar"
                  :style="{ width: `${(item.count / loginTop3[0]?.count || 1) * 100}%` }"
                />
              </div>
              <span class="rank-count mono">{{ item.count }} 次</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="rank-card fade-in" style="animation-delay: 0.25s">
          <template #header>
            <div class="card-header">
              <span class="card-title">近7天 IP TOP3</span>
            </div>
          </template>
          <div class="rank-list">
            <div
              v-for="(item, idx) in ipTop3"
              :key="item.ip"
              class="rank-item"
              :style="{ animationDelay: `${0.3 + idx * 0.08}s` }"
            >
              <span class="rank-num" :class="`rank-${idx + 1}`">{{ idx + 1 }}</span>
              <span class="rank-name mono">{{ item.ip }}</span>
              <div class="rank-bar-wrap">
                <div
                  class="rank-bar ip-bar"
                  :style="{ width: `${(item.count / ipTop3[0]?.count || 1) * 100}%` }"
                />
              </div>
              <span class="rank-count mono">{{ item.count }} 次</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getLogStatistics } from '@/api/log'

const loginChartRef = ref(null)
const operationChartRef = ref(null)
let loginChart = null
let operationChart = null

const loginTop3 = ref([])
const ipTop3 = ref([])

const baseTooltip = {
  backgroundColor: 'rgba(15, 23, 42, 0.92)',
  borderColor: 'rgba(99, 102, 241, 0.2)',
  borderWidth: 1,
  textStyle: { color: '#e2e8f0', fontSize: 12 }
}

function initLoginChart(data) {
  if (!loginChartRef.value) return
  loginChart = echarts.init(loginChartRef.value)
  const dates = data.map(d => d.date)
  loginChart.setOption({
    tooltip: { ...baseTooltip, trigger: 'axis' },
    grid: { top: 20, right: 20, bottom: 32, left: 50 },
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
        name: '成功', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { width: 2.5, color: '#67c23a' },
        itemStyle: { color: '#67c23a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.25)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.01)' }
          ])
        },
        data: data.map(d => d.successCount)
      },
      {
        name: '失败', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { width: 2.5, color: '#f56c6c' },
        itemStyle: { color: '#f56c6c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.25)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.01)' }
          ])
        },
        data: data.map(d => d.failCount)
      }
    ]
  })
}

function initOperationChart(data) {
  if (!operationChartRef.value) return
  operationChart = echarts.init(operationChartRef.value)
  const dates = data.map(d => d.date)
  operationChart.setOption({
    tooltip: { ...baseTooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 20, right: 20, bottom: 32, left: 50 },
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
    series: [{
      name: '操作次数', type: 'bar', barWidth: 24,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(99, 102, 241, 0.8)' },
          { offset: 1, color: 'rgba(99, 102, 241, 0.2)' }
        ])
      },
      data: data.map(d => d.operationCount)
    }]
  })
}

function handleResize() {
  loginChart?.resize()
  operationChart?.resize()
}

onMounted(async () => {
  const res = await getLogStatistics({ days: 7 })
  const daily = res.data.dailyStats || []
  loginTop3.value = res.data.loginTop3 || []
  ipTop3.value = res.data.ipTop3 || []

  await nextTick()
  initLoginChart(daily)
  initOperationChart(daily)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  loginChart?.dispose()
  operationChart?.dispose()
})
</script>

<style lang="scss" scoped>
.log-statistics {
  padding: 0;
}

.chart-card, .rank-card {
  border-radius: 12px;
  border: 1px solid #f2f3f5;

  :deep(.el-card__header) {
    padding: 14px 20px;
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
  gap: 14px;
  font-size: 12px;
  color: #909399;
}

.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 2px;
}

.chart-container {
  height: 300px;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  animation: fadeSlideUp 0.5s ease both;
}

.rank-num {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;

  &.rank-1 { background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff; }
  &.rank-2 { background: linear-gradient(135deg, #94a3b8, #64748b); color: #fff; }
  &.rank-3 { background: linear-gradient(135deg, #d97706, #b45309); color: #fff; }
}

.rank-name {
  width: 120px;
  font-size: 13px;
  color: #303133;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-bar-wrap {
  flex: 1;
  height: 8px;
  background: #f2f3f5;
  border-radius: 4px;
  overflow: hidden;
}

.rank-bar {
  height: 100%;
  background: linear-gradient(90deg, #67c23a, #85ce61);
  border-radius: 4px;
  transition: width 0.6s ease;

  &.ip-bar {
    background: linear-gradient(90deg, #409eff, #66b1ff);
  }
}

.rank-count {
  font-size: 13px;
  color: #909399;
  flex-shrink: 0;
  min-width: 60px;
  text-align: right;
}

.mono {
  font-family: 'SF Mono', 'Menlo', monospace;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
