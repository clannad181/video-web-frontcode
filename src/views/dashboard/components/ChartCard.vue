<template>
  <div class="chart-card">
    <div class="chart-header">
      <div class="chart-title">
        <span>{{ $t('数据趋势') }}</span>
        <span class="realtime-badge">
          <span class="pulse-dot" />
          {{ $t('实时更新') }}
        </span>
      </div>
      <div class="chart-legend">
        <span
          v-for="item in legendItems"
          :key="item.key"
          class="legend-item"
          :class="{ inactive: !item.visible }"
          @click="toggleSeries(item.key)"
        >
          <span class="legend-dot" :style="{ background: item.color }" />
          {{ $t(item.label) }}
        </span>
      </div>
    </div>
    <div ref="chartRef" class="chart-container" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'

const { t, locale } = useI18n()
const appStore = useAppStore()
const isDark = computed(() => appStore.darkMode)

const fontMap = {
  '默认': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif", // i18n-key
  '微软雅黑': "'Microsoft YaHei', sans-serif", // i18n-key
  '宋体': "'SimSun', serif", // i18n-key
  '黑体': "'SimHei', sans-serif", // i18n-key
  '楷体': "'KaiTi', serif", // i18n-key
  '仿宋': "'FangSong', serif", // i18n-key
  '思源黑体': "'Noto Sans SC', sans-serif", // i18n-key
  '思源宋体': "'Noto Serif SC', sans-serif", // i18n-key
  '苹方': "'PingFang SC', 'Helvetica Neue', sans-serif", // i18n-key
  '等线': "'DengXian', sans-serif" // i18n-key
}

function getCurrentFontFamily() {
  return fontMap[appStore.fontFamily] || fontMap['默认'] // i18n-key
}

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref(null)
let chart = null

const legendItems = ref([
  { key: 'videoCount', label: '视频增量', color: '#fb7299', visible: true }, // i18n-key
  { key: 'commentCount', label: '评论增量', color: '#7c5cfc', visible: true } // i18n-key
])

function toggleSeries(key) {
  const item = legendItems.value.find(i => i.key === key)
  if (item) {
    item.visible = !item.visible
    updateChart()
  }
}

function getDefaultData() {
  const days = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push({
      date: `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      videoCount: Math.floor(Math.random() * 30) + 10,
      commentCount: Math.floor(Math.random() * 50) + 20
    })
  }
  return days
}

function buildOption(chartData) {
  const dates = chartData.map(d => d.date)
  const videoData = chartData.map(d => d.videoCount)
  const commentData = chartData.map(d => d.commentCount)
  const videoVisible = legendItems.value.find(i => i.key === 'videoCount')?.visible !== false
  const commentVisible = legendItems.value.find(i => i.key === 'commentCount')?.visible !== false

  const dark = isDark.value
  const textColor = dark ? '#8b949e' : '#909399'
  const lineColor = dark ? '#30363d' : '#e4e7ed'
  const splitColor = dark ? '#21262d' : '#f0f2f5'
  const tooltipBg = dark ? 'rgba(22,27,34,0.95)' : 'rgba(255,255,255,0.95)'
  const tooltipBorder = dark ? '#30363d' : '#e4e7ed'
  const tooltipText = dark ? '#e6edf3' : '#303133'

  return {
    textStyle: { fontFamily: getCurrentFontFamily() },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: tooltipText, fontSize: 12, fontFamily: getCurrentFontFamily() }
    },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: lineColor } },
      axisLabel: { color: textColor, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: splitColor, type: 'dashed' } },
      axisLabel: { color: textColor, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: t('视频增量'),
        type: 'bar',
        data: videoData,
        barWidth: 20,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#fb7299' },
            { offset: 1, color: 'rgba(251,114,153,0.15)' }
          ])
        },
        label: {
          show: true,
          position: 'top',
          color: '#fb7299',
          fontSize: 11,
          fontWeight: 600
        },
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(251,114,153,0.3)' } },
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        silent: !videoVisible,
        // eslint-disable-next-line no-undefined
        data: videoVisible ? videoData : videoData.map(() => undefined)
      },
      {
        name: t('评论增量'),
        type: 'line',
        data: commentData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#7c5cfc', width: 2.5 },
        itemStyle: { color: '#7c5cfc', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(124,92,252,0.25)' },
            { offset: 1, color: 'rgba(124,92,252,0)' }
          ])
        },
        animationDuration: 1200,
        animationEasing: 'cubicOut',
        silent: !commentVisible,
        data: commentVisible ? commentData : commentData.map(() => undefined)
      }
    ]
  }
}

function updateChart() {
  if (!chart) return
  const chartData = props.data.length ? props.data : getDefaultData()
  chart.setOption(buildOption(chartData), true)
}

onMounted(async () => {
  await nextTick()
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  updateChart()
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  chart?.dispose()
  chart = null
})

watch(() => props.data, () => updateChart(), { deep: true })
watch(isDark, () => updateChart())
watch(() => appStore.fontFamily, () => updateChart())
watch(locale, () => updateChart())
</script>

<style scoped>
.chart-card {
  background: var(--card-bg, #fff);
  border-radius: var(--radius-lg, 16px);
  padding: 20px;
}
.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.chart-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}
.realtime-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-success, #67c23a);
  background: color-mix(in srgb, var(--color-success, #67c23a) 10%, transparent);
  padding: 2px 8px;
  border-radius: 999px;
}
.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success, #67c23a);
  animation: pulse-glow 1.5s ease-in-out infinite;
}
@keyframes pulse-glow {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(103, 194, 58, 0); }
}
.chart-legend {
  display: flex;
  gap: 14px;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-primary, #303133);
  cursor: pointer;
  transition: opacity 0.2s;
  user-select: none;
}
.legend-item.inactive {
  opacity: 0.4;
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.chart-container {
  width: 100%;
  height: 300px;
}
</style>
