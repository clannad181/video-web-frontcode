<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="dashboard-title">工作台</h1>
      <p class="dashboard-subtitle">欢迎回来，这是您的视频平台数据概览</p>
    </div>

    <div class="stats-grid">
      <StatCard
        label="今日新增"
        :value="stats.todayNewCount"
        :diff="stats.todayNewDiff"
        color="#fb7299"
        icon="plus"
      />
      <StatCard
        label="今日待审核"
        :value="stats.todayPendingCount"
        :diff="stats.todayPendingDiff"
        color="#ff8c42"
        icon="clock"
      />
      <!-- <div class="stat-card stat-placeholder"> -->
        <!-- <div class="placeholder-text">预留</div> -->
      <!-- </div> -->
      <!-- <div class="stat-card stat-placeholder"> -->
        <!-- <div class="placeholder-text">预留</div> -->
      <!-- </div> -->
    </div>

    <QuickActions />

    <div class="main-row">
      <div class="col-chart">
        <ChartCard :data="chartData" />
      </div>
      <div class="col-feed">
        <ActivityFeed />
      </div>
    </div>

    <VideoTable
      :data="videoList"
      :total="videoTotal"
      :loading="videoLoading"
      @page-change="handlePageChange"
      @filter-change="handleFilterChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getReviewStats, getDailyIncrement, getVideoList } from '@/api/stats'
import StatCard from './components/StatCard.vue'
import QuickActions from './components/QuickActions.vue'
import ChartCard from './components/ChartCard.vue'
import ActivityFeed from './components/ActivityFeed.vue'
import VideoTable from './components/VideoTable.vue'

const stats = ref({
  todayNewCount: 0,
  todayNewDiff: 0,
  todayPendingCount: 0,
  todayPendingDiff: 0
})

const chartData = ref([])
const videoList = ref([])
const videoTotal = ref(0)
const videoLoading = ref(false)
let videoFilter = ''
let videoPage = 1
let timer = null

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

function getStartTime(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function getEndTime() {
  return new Date().toISOString().slice(0, 10)
}

async function fetchStats() {
  try {
    const res = await getReviewStats()
    if (res.code === 200 && res.data) {
      stats.value = {
        todayNewCount: res.data.todayNewCount ?? 0,
        todayNewDiff: res.data.todayNewDiff ?? 0,
        todayPendingCount: res.data.todayPendingCount ?? 0,
        todayPendingDiff: res.data.todayPendingDiff ?? 0
      }
    }
  } catch (e) {
    console.error('Failed to fetch review stats:', e)
  }
}

async function fetchChart() {
  try {
    const res = await getDailyIncrement({
      startTime: getStartTime(7),
      endTime: getEndTime()
    })
    if (res.code === 200 && res.data?.length) {
      chartData.value = res.data.map(d => ({
        date: d.date?.slice(5) || d.date,
        videoCount: d.videoCount ?? 0,
        commentCount: d.commentCount ?? 0
      }))
    } else {
      chartData.value = getDefaultData()
    }
  } catch (e) {
    console.error('Failed to fetch daily increment:', e)
    chartData.value = getDefaultData()
  }
}

async function fetchVideos() {
  videoLoading.value = true
  try {
    const params = { page: videoPage, size: 6 }
    if (videoFilter !== '') params.videoStatus = videoFilter
    const res = await getVideoList(params)
    if (res.code === 200 && res.data) {
      videoList.value = res.data.records || []
      videoTotal.value = res.data.total || 0
    }
  } catch (e) {
    console.error('Failed to fetch video list:', e)
  } finally {
    videoLoading.value = false
  }
}

async function fetchAll() {
  await Promise.allSettled([fetchStats(), fetchChart(), fetchVideos()])
}

function handlePageChange({ page, videoStatus }) {
  videoPage = page
  if (videoStatus !== undefined) videoFilter = videoStatus
  fetchVideos()
}

function handleFilterChange(v) {
  videoFilter = v
  videoPage = 1
  fetchVideos()
}

onMounted(() => {
  fetchAll()
  timer = setInterval(fetchAll, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.dashboard {
  /* padding: 24px; */
  max-width: 1400px;
  margin: 0 auto;
}
.dashboard-header {
  margin-bottom: 24px;
}
.dashboard-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #303133);
  margin: 0;
}
.dashboard-subtitle {
  font-size: 13px;
  color: var(--text-secondary, #909399);
  margin: 4px 0 0;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.stat-card {
  background: var(--bg-card, #fff);
  border-radius: var(--radius-lg, 16px);
  padding: 24px;
  transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.stat-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border-color, #e4e7ed);
  background: transparent;
}
.placeholder-text {
  font-size: 13px;
  color: var(--text-secondary, #c0c4cc);
}
.main-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
  margin: 20px 0;
}
.col-chart, .col-feed {
  min-width: 0;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .main-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
