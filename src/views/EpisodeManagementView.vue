<template>
  <div class="contribution-page">
    <CreatorHeader />
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          剧集管理
        </h1>
      </div>

      <div class="contribution-layout">
        <aside class="sidebar-menu">
          <div class="sidebar-top">
            <button class="new-contribution-btn" @click="goToSubmit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              投稿
            </button>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-group">
              <div class="nav-group-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                内容管理
              </div>
              <div class="nav-submenu">
                <a class="nav-subitem active" @click.prevent="goToContributions">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  稿件管理
                </a>
              </div>
            </div>

            <div class="nav-group">
              <div class="nav-group-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                数据中心
              </div>
              <div class="nav-submenu">
                <a class="nav-subitem" @click.prevent="goToContributions">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 20V10"/>
                    <path d="M12 20V4"/>
                    <path d="M6 20v-6"/>
                  </svg>
                  数据概览
                </a>
              </div>
            </div>
          </nav>
        </aside>

        <div class="contribution-content">
          <div class="episode-management fade-in">
            <div class="manage-header">
              <div class="manage-header-left">
                <button class="back-btn" @click="goToContributions">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  返回稿件列表
                </button>
                <h3 class="episode-management-title">剧集管理 - {{ videoTitle }}</h3>
              </div>
              <button class="btn btn-primary btn-sm" @click="openAddEpisodeDialog">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                添加剧集
              </button>
            </div>

            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
            </div>
            <div v-else-if="episodeList.length > 0" class="episode-table">
              <div class="table-header">
                <div class="ep-col-index">集数</div>
                <div class="ep-col-title">标题</div>
                <div class="ep-col-duration">时长</div>
                <div class="ep-col-time">上传时间</div>
                <div class="ep-col-status">审核状态</div>
                <div class="ep-col-stats">数据</div>
                <div class="ep-col-action">操作</div>
              </div>
              <div v-for="episode in episodeList" :key="episode.avid" class="table-row">
                <div class="ep-col-index">
                  <span class="episode-badge">P{{ episode.episodeNumber || episode.sort }}</span>
                </div>
                <div class="ep-col-title">
                  <div class="episode-title-text">{{ episode.title || '未命名' }}</div>
                </div>
                <div class="ep-col-duration">{{ formatDuration(episode.duration) }}</div>
                <div class="ep-col-time">{{ formatTime(episode.createTime) }}</div>
                <div class="ep-col-status">
                  <span class="status-tag" :class="getReviewStatusClass(episode.reviewStatus)">
                    {{ getReviewStatusText(episode.reviewStatus) }}
                  </span>
                </div>
                <div class="ep-col-stats">
                  <div class="stat-row">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span>{{ formatCount(episode.playCount || 0) }}</span>
                  </div>
                  <div class="stat-row">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span>{{ formatCount(episode.likeCount || 0) }}</span>
                  </div>
                </div>
                <div class="ep-col-action">
                  <button class="action-btn" title="编辑" @click="openEditEpisodeDialog(episode)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="action-btn delete-btn" title="删除" @click="handleDeleteEpisode(episode)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                <line x1="7" y1="2" x2="7" y2="22"/>
                <line x1="17" y1="2" x2="17" y2="22"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
              </svg>
              <p>暂无剧集</p>
              <button class="btn btn-primary btn-sm" @click="openAddEpisodeDialog">添加第一个剧集</button>
            </div>

            <div v-if="totalPages > 1" class="pagination">
              <button class="page-btn" :disabled="currentPage <= 1" @click="handlePageChange(currentPage - 1)">上一页</button>
              <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
              <button class="page-btn" :disabled="currentPage >= totalPages" @click="handlePageChange(currentPage + 1)">下一页</button>
            </div>
          </div>
        </div>
      </div>
    </div>

<!-- 添加剧集弹窗 -->
<Teleport to="body">
  <Transition name="fav-overlay" mode="out-in">
    <div v-if="showAddDialog" class="fav-overlay" @click.self="showAddDialog = false">
      <Transition name="fav-dialog" appear>
        <div v-if="showAddDialog" class="fav-dialog fav-dialog-small">
              <div class="fav-dialog-header">
                <h3>添加剧集</h3>
                <button class="fav-close-btn" @click="showAddDialog = false">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div class="fav-dialog-body">
                <div class="edit-form-item">
                  <label class="edit-form-label">剧集标题</label>
                  <input v-model="newEpisode.title" class="edit-form-input" placeholder="请输入剧集标题" />
                </div>
                <div v-if="!newEpisode.file" class="edit-form-item">
                  <label class="edit-form-label">视频文件</label>
                  <div class="cover-upload-area">
                    <input type="file" accept="video/*" class="cover-upload-input" @change="handleNewEpisodeFileChange" />
                    <label class="cover-upload-btn">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>点击选择视频文件</span>
                    </label>
                  </div>
                </div>
                <div v-if="newEpisode.previewUrl" class="edit-form-item">
                  <label class="edit-form-label">视频预览</label>
                  <video :src="newEpisode.previewUrl" controls class="episode-video-preview"></video>
                </div>
              </div>
              <div class="fav-dialog-footer">
                <button class="fav-btn fav-btn-cancel" @click="showAddDialog = false">取消</button>
                <button class="fav-btn fav-btn-confirm" :disabled="!newEpisode.file" @click="submitNewEpisode">添加</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

<!-- 编辑剧集弹窗 -->
<Teleport to="body">
  <Transition name="fav-overlay" mode="out-in">
    <div v-if="showEditDialog" class="fav-overlay" @click.self="showEditDialog = false">
      <Transition name="fav-dialog" appear>
        <div v-if="showEditDialog" class="fav-dialog fav-dialog-small">
              <div class="fav-dialog-header">
                <h3>编辑剧集</h3>
                <button class="fav-close-btn" @click="showEditDialog = false">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div class="fav-dialog-body">
                <div class="edit-form-item">
                  <label class="edit-form-label">剧集标题</label>
                  <input v-model="currentEditEpisode.title" class="edit-form-input" placeholder="请输入剧集标题" />
                </div>
                <div v-if="currentEditEpisode.playUrl && !currentEditEpisode.newFile" class="edit-form-item">
                  <label class="edit-form-label">当前视频</label>
                  <div class="video-preview-wrap">
                    <video :src="currentEditEpisode.playUrl" controls class="episode-video-preview"></video>
                    <button class="remove-video-btn" @click="removeEditVideo" title="删除视频">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div v-if="!currentEditEpisode.playUrl || currentEditEpisode.newFile" class="edit-form-item">
                  <label class="edit-form-label">视频文件</label>
                  <div v-if="!currentEditEpisode.newFile" class="cover-upload-area">
                    <input type="file" accept="video/*" class="cover-upload-input" @change="handleEditEpisodeFileChange" />
                    <label class="cover-upload-btn">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>点击选择视频文件</span>
                    </label>
                  </div>
                </div>
                <div v-if="currentEditEpisode.newPreviewUrl" class="edit-form-item">
                  <video :src="currentEditEpisode.newPreviewUrl" controls class="episode-video-preview"></video>
                </div>
              </div>
              <div class="fav-dialog-footer">
                <button class="fav-btn fav-btn-cancel" @click="showEditDialog = false">取消</button>
                <button class="fav-btn fav-btn-confirm" @click="submitEditEpisode">保存</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CreatorHeader from '../components/layout/CreatorHeader.vue'
import { getVideoDetailByUid, getVideoEpisodeList, addVideoEpisode, updateVideoEpisode, deleteVideoEpisode } from '../api/video'
import { uploadFile } from '../utils/fileUpload'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const videoUid = ref('')
const videoTitle = ref('')
const episodeList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 10

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const currentEditEpisode = ref({ avid: '', title: '', duration: 0, playUrl: '', newFile: null, newPreviewUrl: '' })
const newEpisode = ref({ title: '', file: null, duration: 0, previewUrl: '' })

onMounted(async () => {
  videoUid.value = route.params.videoUid
  await loadVideoInfo()
  await loadEpisodeList()
})

const loadVideoInfo = async () => {
  try {
    const res = await getVideoDetailByUid(videoUid.value)
    videoTitle.value = res?.title || ''
  } catch (e) {
    console.error('获取视频信息失败:', e)
  }
}

const loadEpisodeList = async () => {
  loading.value = true
  try {
    const res = await getVideoEpisodeList({
      videoUid: videoUid.value,
      page: currentPage.value,
      size: pageSize
    })
    episodeList.value = res?.records || []
    totalPages.value = res?.pages || 1
  } catch (e) {
    console.error('获取剧集列表失败:', e)
    episodeList.value = []
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadEpisodeList()
}

const goToContributions = () => {
  const query = {}
  if (route.query.page) query.page = route.query.page
  if (route.query.status) query.status = route.query.status
  if (route.query.search) query.search = route.query.search
  router.push({ path: '/contribution', query })
}

const goToSubmit = () => {
  router.push('/contribution')
}

const openAddEpisodeDialog = () => {
  newEpisode.value = { title: '', file: null, duration: 0, previewUrl: '' }
  showAddDialog.value = true
}

const handleNewEpisodeFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    newEpisode.value.file = file
    if (!newEpisode.value.title) {
      newEpisode.value.title = file.name.replace(/\.[^/.]+$/, '')
    }
    newEpisode.value.previewUrl = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      newEpisode.value.duration = Math.floor(video.duration)
    }
    video.src = newEpisode.value.previewUrl
  }
}

const handleEditEpisodeFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    currentEditEpisode.value.newFile = file
    if (!currentEditEpisode.value.title) {
      currentEditEpisode.value.title = file.name.replace(/\.[^/.]+$/, '')
    }
    currentEditEpisode.value.newPreviewUrl = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      currentEditEpisode.value.duration = Math.floor(video.duration)
    }
    video.src = currentEditEpisode.value.newPreviewUrl
  }
}

const removeEditVideo = () => {
  currentEditEpisode.value.playUrl = ''
  currentEditEpisode.value.newFile = null
  currentEditEpisode.value.newPreviewUrl = ''
}

const submitNewEpisode = async () => {
  if (!newEpisode.value.file) {
    ElMessage.warning('请选择视频文件')
    return
  }
  try {
    const result = await uploadFile(newEpisode.value.file)
    await addVideoEpisode({
      videoUid: videoUid.value,
      title: newEpisode.value.title || undefined,
      playUrl: result?.url || result?.filePath || '',
      duration: newEpisode.value.duration || 0
    })
    ElMessage.success('剧集添加成功')
    showAddDialog.value = false
    loadEpisodeList()
  } catch (e) {
    console.error('添加剧集失败:', e)
    ElMessage.error('添加剧集失败')
  }
}

const openEditEpisodeDialog = (episode) => {
  currentEditEpisode.value = {
    avid: episode.avid,
    title: episode.title || '',
    duration: episode.duration || 0,
    playUrl: episode.playUrl || '',
    newFile: null,
    newPreviewUrl: ''
  }
  showEditDialog.value = true
}

const submitEditEpisode = async () => {
  try {
    let playUrl = currentEditEpisode.value.playUrl
    if (currentEditEpisode.value.newFile) {
      const result = await uploadFile(currentEditEpisode.value.newFile)
      playUrl = result?.url || result?.filePath || ''
    }
    await updateVideoEpisode({
      episodeUid: currentEditEpisode.value.avid,
      title: currentEditEpisode.value.title,
      duration: currentEditEpisode.value.duration,
      playUrl: playUrl
    })
    ElMessage.success('剧集更新成功')
    showEditDialog.value = false
    loadEpisodeList()
  } catch (e) {
    console.error('更新剧集失败:', e)
    ElMessage.error('更新剧集失败')
  }
}

const handleDeleteEpisode = async (episode) => {
  try {
    await deleteVideoEpisode(episode.avid)
    ElMessage.success('剧集删除成功')
    loadEpisodeList()
  } catch (e) {
    console.error('删除剧集失败:', e)
    ElMessage.error('删除剧集失败')
  }
}

const getReviewStatusClass = (status) => {
  const s = Number(status)
  const map = { 0: 'pending', 1: 'approved', 2: 'rejected' }
  return map[s] || 'pending'
}

const getReviewStatusText = (status) => {
  const s = Number(status)
  const map = { 0: '待审核', 1: '审核通过', 2: '审核拒绝' }
  return map[s] || '未知'
}

const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}
</script>

<style scoped>
.contribution-page {
  min-height: 100vh;
  background: var(--bg1);
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  /* padding: 76px 24px 40px; */
  padding-top: 76px;
  padding-left: 24px;
  padding-right: 24px;
  padding-bottom: 40px;
}

.page-header {
  margin-bottom: 32px;
  padding-top: 8px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text1);
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.contribution-layout {
  display: flex;
  gap: 24px;
}

.sidebar-menu {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 76px;
  height: fit-content;
}

.sidebar-top {
  margin-bottom: 16px;
}

.new-contribution-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff6b9d 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 92, 122, 0.3);
}

.new-contribution-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 92, 122, 0.4);
}

.sidebar-nav {
  background: var(--bg2);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.nav-group {
  margin-bottom: 8px;
}

.nav-group:last-child {
  margin-bottom: 0;
}

.nav-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
}

.nav-submenu {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-subitem {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 10px 36px;
  font-size: 14px;
  color: var(--text3);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-subitem:hover {
  background: var(--bg3);
  color: var(--text1);
}

.nav-subitem.active {
  background: rgba(255, 92, 122, 0.1);
  color: var(--brand_pink);
}

.contribution-content {
  flex: 1;
  min-width: 0;
}

.episode-management {
  background: var(--bg2);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.manage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.manage-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg1);
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--bg3);
  color: var(--brand_blue);
  border-color: var(--brand_blue);
}

.episode-management-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
  margin: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--brand_pink);
  color: #fff;
}

.btn-primary:hover {
  background: #e63e8a;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--line_light);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.episode-table {
  border: 1px solid var(--line_light);
  border-radius: 8px;
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 100px 140px 100px 120px 100px;
  gap: 16px;
  padding: 12px 16px;
  background: var(--bg3);
  font-size: 12px;
  color: var(--text3);
  font-weight: 500;
  text-align: center;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 100px 140px 100px 120px 100px;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--line_light);
  align-items: center;
  transition: background 0.15s;
  text-align: center;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--bg1);
}

.ep-col-index {
  text-align: center;
}

.episode-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--brand_pink);
  color: #fff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.ep-col-title {
  text-align: left;
  min-width: 0;
}

.episode-title-text {
  font-size: 14px;
  color: var(--text1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ep-col-duration {
  font-size: 13px;
  color: var(--text3);
}

.ep-col-time {
  font-size: 13px;
  color: var(--text3);
}

.ep-col-status {
  text-align: center;
}

.status-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.pending {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.status-tag.approved {
  background: rgba(0, 181, 120, 0.1);
  color: #00b578;
}

.status-tag.rejected {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.ep-col-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text3);
}

.ep-col-action {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text3);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--bg3);
  color: var(--brand_blue);
}

.action-btn.delete-btn:hover {
  color: #f56c6c;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text4);
}

.empty-state p {
  margin: 16px 0;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--line_light);
}

.page-btn {
  padding: 6px 14px;
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  background: var(--bg1);
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--brand_blue);
  color: var(--brand_blue);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: var(--text3);
}

.fav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.fav-dialog {
  background: var(--bg2);
  border-radius: 12px;
  width: 480px;
  max-height: 80vh;
  overflow: hidden;
}

.fav-dialog-small {
  width: 560px;
}

.fav-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line_light);
}

.fav-dialog-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
  margin: 0;
}

.fav-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text3);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.fav-close-btn:hover {
  background: var(--bg3);
  color: var(--text1);
}

.fav-dialog-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.fav-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--line_light);
}

.fav-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.fav-btn-cancel {
  background: var(--bg1);
  color: var(--text2);
}

.fav-btn-cancel:hover {
  background: var(--bg3);
}

.fav-btn-confirm {
  background: var(--brand_pink);
  color: #fff;
}

.fav-btn-confirm:hover {
  background: #e63e8a;
}

.fav-btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.edit-form-item {
  margin-bottom: 16px;
}

.edit-form-item:last-child {
  margin-bottom: 0;
}

.edit-form-label {
  display: block;
  font-size: 14px;
  color: var(--text2);
  margin-bottom: 8px;
}

.edit-form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text1);
  background: var(--bg1);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.edit-form-input:focus {
  border-color: var(--brand_pink);
}

.cover-upload-area {
  position: relative;
}

.cover-upload-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.cover-upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  border: 2px dashed var(--line_regular);
  border-radius: 8px;
  color: var(--text4);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cover-upload-btn:hover {
  border-color: var(--brand_pink);
  color: var(--brand_pink);
}

.video-preview-wrap {
  position: relative;
  display: inline-block;
  width: 100%;
}

.remove-video-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 2;
}

.remove-video-btn:hover {
  background: #f56c6c;
}

.fav-dialog-enter-active {
  transition: all 0.3s ease;
}

.fav-dialog-leave-active {
  transition: all 0.2s ease;
}

.fav-dialog-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fav-dialog-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.episode-video-preview {
  width: 100%;
  max-height: 200px;
  border-radius: 8px;
  background: #000;
}

.fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>