<template>
  <div class="quick-actions">
    <button
      v-for="action in actions"
      :key="action.label"
      class="action-capsule"
      :style="{ '--action-color': action.color }"
      @click="handleAction(action)"
    >
      <span class="action-icon">{{ action.emoji }}</span>
      <span class="action-text">{{ $t(action.label) }}</span>
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const actions = [
  { label: '上传视频', emoji: '📤', color: '#fb7299', path: '/video-manage' }, // i18n-key
  { label: '批量审核', emoji: '✅', color: '#00a1d6', path: '/review' }, // i18n-key
  { label: '数据报告', emoji: '📊', color: '#7c5cfc', path: '/data-analysis' }, // i18n-key
  { label: '用户反馈', emoji: '💬', color: '#ff8c42', path: '/comment-manage' } // i18n-key
]

function handleAction(action) {
  if (action.path) router.push(action.path)
}
</script>

<style scoped>
.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.action-capsule {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 999px;
  border: 2px solid var(--border-color, #e4e7ed);
  background: var(--card-bg, #fff);
  color: var(--text-primary, #303133);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  outline: none;
}
.action-capsule:hover {
  border-color: var(--action-color);
  color: var(--action-color);
  background: color-mix(in srgb, var(--action-color) 8%, var(--card-bg, #fff));
  box-shadow: 0 4px 12px color-mix(in srgb, var(--action-color) 20%, transparent);
  transform: translateY(-2px);
}
.action-icon {
  font-size: 15px;
}
</style>
