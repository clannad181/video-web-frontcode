<template>
  <div class="stat-card" :style="{ '--card-color': color }">
    <div class="card-glow" />
    <div class="card-body">
      <div class="card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="icon === 'plus'" d="M12 5v14M5 12h14" />
          <path v-else-if="icon === 'clock'" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2" />
          <path v-else d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <div class="card-info">
        <div class="card-label">{{ label }}</div>
        <div class="card-value">{{ displayValue }}</div>
        <div class="card-trend" v-if="diff !== undefined && diff !== null">
          <span class="trend-arrow" :class="diff >= 0 ? 'up' : 'down'">
            {{ diff >= 0 ? '▲' : '▼' }}
          </span>
          <span class="trend-value">{{ formatDiff(Math.abs(diff)) }}</span>
          <span class="trend-label">较昨日</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  value: { type: Number, default: 0 },
  diff: { type: Number, default: undefined },
  color: { type: String, default: '#fb7299' },
  icon: { type: String, default: 'plus' }
})

const displayValue = ref('0')

function animateValue(target) {
  const duration = 1200
  const start = performance.now()
  const from = parseInt(displayValue.value.replace(/,/g, '')) || 0

  function step(now) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = Math.round(from + (target - from) * eased)
    displayValue.value = current.toLocaleString()
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function formatDiff(n) {
  return n.toLocaleString()
}

onMounted(() => animateValue(props.value))
watch(() => props.value, (v) => animateValue(v))
</script>

<style scoped>
.stat-card {
  position: relative;
  background: var(--card-bg, #fff);
  border-radius: var(--radius-lg, 16px);
  padding: 24px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: default;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}
.card-glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--card-color);
  opacity: 0.15;
  filter: blur(30px);
  transition: all 0.4s ease;
  pointer-events: none;
}
.stat-card:hover .card-glow {
  opacity: 0.25;
  transform: scale(1.3);
}
.card-body {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}
.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--card-color) 10%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--card-color);
}
.card-icon svg {
  width: 24px;
  height: 24px;
}
.card-info {
  flex: 1;
  min-width: 0;
}
.card-label {
  font-size: 13px;
  color: var(--text-secondary, #909399);
  margin-bottom: 4px;
}
.card-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary, #303133);
  line-height: 1.2;
  letter-spacing: -0.5px;
}
.card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
}
.trend-arrow {
  font-size: 11px;
}
.trend-arrow.up {
  color: var(--color-success, #67c23a);
}
.trend-arrow.down {
  color: var(--color-danger, #f56c6c);
}
.trend-value {
  font-weight: 600;
  color: var(--text-primary, #303133);
}
.trend-label {
  color: var(--text-secondary, #909399);
}
</style>
