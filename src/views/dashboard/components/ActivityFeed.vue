<template>
  <div class="activity-feed">
    <div class="feed-header">
      <span class="feed-title">最近动态</span>
      <button class="view-all">查看全部</button>
    </div>
    <div class="feed-list">
      <div
        v-for="(item, idx) in activities"
        :key="idx"
        class="feed-item"
      >
        <div class="feed-dot-wrap">
          <span class="feed-dot" :style="{ background: item.color }" />
          <span class="feed-ring" :style="{ borderColor: item.color }" />
        </div>
        <div class="feed-content">
          <div class="feed-line">
            <span class="feed-user">{{ item.user }}</span>
            <span class="feed-action">{{ item.action }}</span>
          </div>
          <div class="feed-detail">{{ item.detail }}</div>
        </div>
        <div class="feed-time">{{ item.time }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const activities = [
  { user: '张三', action: '上传了', detail: '《Vue 3 高级教程》第 3 集', time: '5分钟前', color: '#fb7299' },
  { user: '李四', action: '发送了弹幕', detail: '"这个讲解太清晰了！"', time: '12分钟前', color: '#7c5cfc' },
  { user: '系统', action: '自动审核通过', detail: '《React 最佳实践》已发布', time: '28分钟前', color: '#ff8c42' },
  { user: '王五', action: '完成了实名认证', detail: '身份信息已验证', time: '1小时前', color: '#00a1d6' },
  { user: '赵六', action: '提交了反馈', detail: '"希望增加倍速播放功能"', time: '2小时前', color: '#67c23a' }
]
</script>

<style scoped>
.activity-feed {
  background: var(--card-bg, #fff);
  border-radius: var(--radius-lg, 16px);
  padding: 20px;
}
.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.feed-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}
.view-all {
  font-size: 12px;
  color: var(--color-primary, #fb7299);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.view-all:hover {
  text-decoration: underline;
}
.feed-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.feed-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 8px;
  transition: background 0.2s;
  cursor: default;
}
.feed-item:hover {
  background: var(--bg-hover, rgba(0, 0, 0, 0.04));
}
.feed-dot-wrap {
  position: relative;
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  margin-top: 5px;
}
.feed-dot {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: relative;
  z-index: 1;
}
.feed-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.5px solid;
  transform: translate(-50%, -50%);
  animation: ripple-out 3s ease-out infinite;
  pointer-events: none;
}
@keyframes ripple-out {
  0% { width: 10px; height: 10px; opacity: 0.6; }
  100% { width: 30px; height: 30px; opacity: 0; }
}
.feed-content {
  flex: 1;
  min-width: 0;
}
.feed-line {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary, #303133);
}
.feed-user {
  font-weight: 600;
}
.feed-action {
  margin-left: 4px;
}
.feed-detail {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}
.feed-time {
  font-size: 11px;
  color: var(--text-secondary, #c0c4cc);
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 2px;
}
</style>
