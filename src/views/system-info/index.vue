<template>
  <div class="system-info">
    <div class="status-bar fade-in">
      <div class="status-indicator">
        <span class="status-dot pulse" />
        <span class="status-text">运行中</span>
      </div>
      <el-switch
        v-model="autoRefresh"
        active-text="自动刷新 (5s)"
        size="small"
        @change="handleAutoRefresh"
      />
    </div>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never" class="info-card fade-in" style="animation-delay: 0.1s">
          <template #header>
            <div class="card-header">
              <el-icon :size="18"><Monitor /></el-icon>
              <span>服务器信息</span>
            </div>
          </template>
          <div v-loading="loading" class="info-grid">
            <div class="info-item" v-for="item in serverInfo" :key="item.label">
              <span class="info-label">{{ item.label }}</span>
              <span class="info-value mono">{{ item.value }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="info-card fade-in" style="animation-delay: 0.15s">
          <template #header>
            <div class="card-header">
              <el-icon :size="18"><Cpu /></el-icon>
              <span>运行环境</span>
            </div>
          </template>
          <div v-loading="loading" class="info-grid">
            <div class="info-item" v-for="item in runtimeInfo" :key="item.label">
              <span class="info-label">{{ item.label }}</span>
              <span class="info-value mono">{{ item.value }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="8">
        <el-card shadow="never" class="resource-card fade-in" style="animation-delay: 0.2s">
          <template #header>
            <div class="card-header">
              <el-icon :size="18"><Cpu /></el-icon>
              <span>CPU 使用率</span>
            </div>
          </template>
          <div v-loading="loading" class="cpu-wrap">
            <el-progress
              type="circle"
              :percentage="sysInfo.cpuUsage"
              :width="140"
              :stroke-width="10"
              :color="cpuColor"
            />
            <div class="cpu-detail">
              <span>{{ sysInfo.cpuCores }} 核心</span>
              <span>{{ sysInfo.cpuThreads }} 线程</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="resource-card fade-in" style="animation-delay: 0.25s">
          <template #header>
            <div class="card-header">
              <el-icon :size="18"><Coin /></el-icon>
              <span>内存使用率</span>
            </div>
          </template>
          <div v-loading="loading" class="mem-wrap">
            <el-progress
              :percentage="sysInfo.memoryUsage"
              :stroke-width="18"
              :color="memoryColors"
              text-inside
            />
            <div class="mem-text">
              <span class="mem-used">{{ sysInfo.memoryUsed }} GB</span>
              <span class="mem-total">/ {{ sysInfo.memoryTotal }} GB</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="resource-card fade-in" style="animation-delay: 0.3s">
          <template #header>
            <div class="card-header">
              <el-icon :size="18"><Box /></el-icon>
              <span>磁盘使用率</span>
            </div>
          </template>
          <div v-loading="loading" class="disk-list">
            <div v-for="disk in sysInfo.disks" :key="disk.name" class="disk-item">
              <div class="disk-header">
                <span class="disk-name">{{ disk.name }}</span>
                <span class="disk-pct mono">{{ disk.used }} / {{ disk.total }} GB</span>
              </div>
              <el-progress
                :percentage="disk.percentage"
                :stroke-width="10"
                :color="diskColor(disk.percentage)"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="network-card fade-in" style="animation-delay: 0.35s; margin-top: 16px">
      <template #header>
        <div class="card-header">
          <el-icon :size="18"><Connection /></el-icon>
          <span>网络信息</span>
        </div>
      </template>
      <div v-loading="loading" class="network-grid">
        <div class="net-item" v-for="item in networkInfo" :key="item.label">
          <span class="net-label">{{ item.label }}</span>
          <span class="net-value mono">{{ item.value }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Monitor, Cpu, Coin, Box, Connection } from '@element-plus/icons-vue'
import { getSystemInfo } from '@/api/system'

const loading = ref(false)
const autoRefresh = ref(false)
let timer = null

const sysInfo = ref({
  os: 'Windows 11',
  arch: 'x64',
  nodeVersion: 'v20.11.0',
  uptime: '15天 8小时 32分钟',
  pid: 18432,
  cpuUsage: 34,
  cpuCores: 8,
  cpuThreads: 16,
  memoryUsage: 62,
  memoryUsed: 9.9,
  memoryTotal: 16.0,
  disks: [
    { name: 'C:', used: 186, total: 256, percentage: 73 },
    { name: 'D:', used: 312, total: 512, percentage: 61 }
  ],
  ips: ['192.168.1.100', '10.0.0.1'],
  port: 3000,
  domain: 'admin.video.com'
})

const cpuColor = computed(() => {
  const v = sysInfo.value.cpuUsage
  if (v > 80) return '#f56c6c'
  if (v > 50) return '#e6a23c'
  return '#67c23a'
})

const memoryColors = [
  { color: '#67c23a', percentage: 50 },
  { color: '#e6a23c', percentage: 75 },
  { color: '#f56c6c', percentage: 100 }
]

const diskColor = (pct) => {
  if (pct > 85) return '#f56c6c'
  if (pct > 70) return '#e6a23c'
  return '#67c23a'
}

const serverInfo = computed(() => [
  { label: '操作系统', value: sysInfo.value.os },
  { label: '系统架构', value: sysInfo.value.arch },
  { label: 'Node.js 版本', value: sysInfo.value.nodeVersion },
  { label: '运行时间', value: sysInfo.value.uptime }
])

const runtimeInfo = computed(() => [
  { label: 'CPU 核心数', value: sysInfo.value.cpuCores },
  { label: '线程数', value: sysInfo.value.cpuThreads },
  { label: '进程 ID', value: sysInfo.value.pid },
  { label: '内存使用', value: `${sysInfo.value.memoryUsed} / ${sysInfo.value.memoryTotal} GB` }
])

const networkInfo = computed(() => [
  { label: 'IP 地址', value: sysInfo.value.ips.join(', ') },
  { label: '端口', value: sysInfo.value.port },
  { label: '域名', value: sysInfo.value.domain }
])

const fetchInfo = async () => {
  loading.value = true
  try {
    const res = await getSystemInfo()
    if (res.data) {
      Object.assign(sysInfo.value, res.data)
    }
  } finally {
    loading.value = false
  }
}

const handleAutoRefresh = (val) => {
  if (val) {
    timer = setInterval(fetchInfo, 5000)
  } else {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  fetchInfo()
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.system-info {
  padding: 0;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  animation: fadeSlideUp 0.5s ease both;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #67c23a;

  &.pulse {
    animation: pulse 2s ease-in-out infinite;
  }
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #67c23a;
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(103, 194, 58, 0); }
}

.info-card, .resource-card, .network-card {
  border-radius: 12px;
  border: 1px solid #f2f3f5;

  :deep(.el-card__header) {
    padding: 14px 20px;
    border-bottom: 1px solid #f2f3f5;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;

  .el-icon { color: #409eff; }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #909399;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.mono {
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
}

.cpu-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  :deep(.el-progress-circle__text) {
    font-size: 28px !important;
    font-weight: 700;
  }
}

.cpu-detail {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #909399;
}

.mem-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mem-text {
  text-align: center;
  font-size: 14px;
}

.mem-used {
  font-weight: 700;
  color: #303133;
}

.mem-total {
  color: #909399;
}

.disk-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.disk-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.disk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.disk-name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.disk-pct {
  font-size: 12px;
  color: #909399;
}

.network-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.net-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.net-label {
  font-size: 12px;
  color: #909399;
}

.net-value {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
