<template>
  <div
    class="fav-hover-panel"
    :style="panelStyle"
    @mouseenter="$emit('panel-enter')"
    @mouseleave="$emit('panel-leave')"
  >
    <div class="fav-panel-inner">
      <!-- 左侧收藏夹列表 -->
      <div class="fav-panel-left">
        <div v-if="loading" class="fav-panel-loading">
          <div class="loading-spinner"></div>
        </div>
        <div v-else class="fav-folder-list">
          <div
            v-for="folder in folders"
            :key="folder.folderUid"
            class="fav-folder-item"
            :class="{ active: selectedFolderUid === folder.folderUid }"
            @click="handleFolderHover(folder.folderUid)"
          >
            <span class="folder-name">{{ folder.name }}</span>
            <span class="folder-count">{{ folder.count }}</span>
            <svg class="folder-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
          <div v-if="folders.length === 0" class="fav-empty-hint">
            暂无收藏夹
          </div>
        </div>
      </div>

      <!-- 右侧视频列表 -->
      <div class="fav-panel-right">
        <div v-if="loadingContent" class="fav-panel-loading">
          <div class="loading-spinner"></div>
        </div>
        <div v-else-if="folderVideos.length > 0" class="fav-video-list">
          <div
            v-for="video in folderVideos"
            :key="video.episodeAvid"
            class="fav-video-item"
            @click="handleVideoClick(video, router)"
          >
            <div class="video-cover">
              <img :src="fileUrl(video.videoCover)" :alt="video.videoTitle" />
              <span class="video-duration">{{ formatDuration(video.duration) }}</span>
            </div>
            <div class="video-info">
              <div class="video-title">{{ video.videoTitle }}</div>
              <div class="video-meta">
                <span class="video-author">{{ video.nickName }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="fav-empty-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>暂无收藏内容</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getFavoriteFolderList, getFavoriteFolderDetail } from '../api/video'
import { handleVideoClick } from '../utils/video'
import { formatDuration } from '../utils/format'
import { fileUrl } from '../config'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

defineEmits(['panel-enter', 'panel-leave'])

const router = useRouter()
const loading = ref(false)
const loadingContent = ref(false)
const folders = ref([])
const selectedFolderUid = ref('')
const folderVideos = ref([])

const panelStyle = computed(() => ({
  display: props.visible ? 'block' : 'none'
}))

watch(() => props.visible, async (val) => {
  if (val) {
    await loadFolders()
  }
})

const handleFolderHover = async (folderUid) => {
  if (selectedFolderUid.value === folderUid) return
  selectedFolderUid.value = folderUid
  await loadFolderContent(folderUid)
}

const loadFolders = async () => {
  loading.value = true
  try {
    const res = await getFavoriteFolderList()
    if (res && res.length > 0) {
      folders.value = res
      if (!selectedFolderUid.value) {
        selectedFolderUid.value = res[0].folderUid
      }
      await loadFolderContent(selectedFolderUid.value)
    } else {
      folders.value = []
    }
  } catch (e) {
    console.error('获取收藏夹列表失败:', e)
  } finally {
    loading.value = false
  }
}

const loadFolderContent = async (folderUid) => {
  loadingContent.value = true
  try {
    const res = await getFavoriteFolderDetail({ folderUid, page: 1, size: 15 })
    folderVideos.value = res?.list?.records || []
  } catch (e) {
    console.error('获取收藏夹内容失败:', e)
    folderVideos.value = []
  } finally {
    loadingContent.value = false
  }
}

loadFolders()

</script>

<style scoped>
.fav-hover-panel {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 420px;
  background: var(--bg1);
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--line_light);
  z-index: 1003;
  margin-top: -1px;
  transform-origin: top center;
}

.fav-hover-panel::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 0;
  right: 0;
  height: 10px;
}

.fav-panel-inner {
  display: flex;
  min-height: 280px;
  max-height: 420px;
  overflow: hidden;
  border-radius: 8px;
}

.fav-panel-left {
  width: 120px;
  border-right: 1px solid var(--line_light);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.fav-panel-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  flex: 1;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--line_regular);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.fav-folder-list {
  flex: 1;
  overflow-y: auto;
}

.fav-folder-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.fav-folder-item:hover {
  background: var(--bg2);
}

.fav-folder-item.active {
  background: rgba(0, 174, 236, 0.08);
}

.folder-name {
  flex: 1;
  font-size: 13px;
  color: var(--text2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fav-folder-item.active .folder-name {
  color: var(--text1);
  font-weight: 500;
}

.folder-count {
  font-size: 12px;
  color: var(--text4);
}

.folder-arrow {
  color: var(--text4);
  flex-shrink: 0;
  visibility: hidden;
  transition: visibility 0.15s ease;
}

.fav-folder-item:hover .folder-arrow {
  visibility: visible;
}

.fav-empty-hint {
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text4);
}

.fav-panel-right {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.fav-video-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fav-video-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.fav-video-item:hover {
  background: var(--bg2);
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

.video-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text3);
}

.video-author {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fav-empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: var(--text4);
  font-size: 13px;
}
</style>