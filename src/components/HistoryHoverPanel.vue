<template>
  <div
    v-show="visible"
    class="history-hover-panel"
    @mouseenter="$emit('panel-enter')"
    @mouseleave="$emit('panel-leave')"
  >
    <div class="history-panel-header">
      <span class="history-panel-title">观看历史</span>
    </div>
    <div class="history-panel-content">
      <div v-if="loading" class="history-panel-loading">
        <div class="loading-spinner"></div>
      </div>
      <div v-else-if="videos.length > 0" class="history-video-list">
        <div
          v-for="video in videos"
          :key="video.episodeAvid"
          class="history-video-item"
          :class="{ 'is-offline': !video.videoAvid }"
          @click="video.videoAvid && handleVideoClick(video, router)"
        >
          <div class="video-cover">
            <img v-if="video.videoCover" :src="video.videoCover" :alt="video.videoTitle" />
            <div v-else class="video-cover-offline">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <span class="video-duration">{{ video.watchedTime || formatDuration(video.duration) }}</span>
          </div>
          <div class="video-info">
            <div class="video-title">
              <template v-if="video.videoAvid">{{ video.videoTitle }}</template>
              <span v-else class="offline-text">该稿件已下架</span>
            </div>
            <div class="video-meta">
              <span class="video-author">{{ video.videoAvid ? video.nickName : '-' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="history-empty-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>暂无观看记录</span>
      </div>
    </div>
    <div class="history-panel-footer">
      <router-link to="/history" class="view-all-link" @click="$emit('panel-leave')">
        查看全部
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getWatchHistoryList } from '../api/video'
import { handleVideoClick } from '../utils/video'
import { formatDuration } from '../utils/format'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

defineEmits(['panel-enter', 'panel-leave'])

const router = useRouter()
const loading = ref(false)
const videos = ref([])
const isMounted = ref(true)

onUnmounted(() => {
  isMounted.value = false
})

watch(() => props.visible, (val) => {
  if (val) {
    loadHistory()
  }
})

const loadHistory = async () => {
  loading.value = true
  try {
    const res = await getWatchHistoryList({ page: 1, size: 15 })
    if (!isMounted.value) return
    videos.value = res?.records || []
  } catch (e) {
    console.error('获取观看历史失败:', e)
    if (isMounted.value) videos.value = []
  } finally {
    if (isMounted.value) loading.value = false
  }
}


</script>

<style scoped>
.history-hover-panel {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  background: var(--bg1);
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--line_light);
  z-index: 1003;
  margin-top: -1px;
}

.history-hover-panel::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 0;
  right: 0;
  height: 10px;
}

.history-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line_light);
}

.history-panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
}

.history-panel-content {
  min-height: 200px;
  max-height: 380px;
  overflow-y: auto;
}

.history-panel-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--line_regular);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.history-video-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
}

.history-video-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.history-video-item:hover {
  background: var(--bg2);
}

.history-video-item.is-offline {
  opacity: 0.6;
  cursor: not-allowed;
}

.history-video-item.is-offline:hover {
  background: transparent;
}

.video-cover {
  width: 96px;
  height: 54px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.video-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-cover-offline {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg2);
  color: var(--text4);
}

.video-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  padding: 1px 4px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 11px;
  border-radius: 2px;
}

.video-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2px 0;
}

.video-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text1);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.offline-text {
  color: var(--text4);
  font-style: italic;
}

.video-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text3);
}

.video-author {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

.video-time {
  flex-shrink: 0;
}

.history-empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 8px;
  color: var(--text4);
  font-size: 13px;
}

.history-panel-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--line_light);
}

.view-all-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  color: var(--brand_pink);
  text-decoration: none;
  transition: opacity 0.15s;
}

.view-all-link:hover {
  opacity: 0.8;
}
</style>
