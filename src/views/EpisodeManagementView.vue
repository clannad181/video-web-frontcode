<template>
  <div class="contribution-page">
    <CreatorHeader />
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/>
            <line x1="17" y1="2" x2="17" y2="22"/>
          </svg>
          剧集管理
        </h1>
      </div>

      <div class="episode-container">
        <div class="manage-header">
          <div class="header-left">
            <button class="back-btn" @click="goBack">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              返回稿件列表
            </button>
            <h3 class="video-title">{{ videoTitle }}</h3>
          </div>
          <button class="add-btn" @click="openAddDialog">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            添加剧集
          </button>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
        </div>

        <div v-else-if="episodeList.length > 0" class="episode-table">
          <div class="table-header">
            <div class="col-index">集数</div>
            <div class="col-title">标题</div>
            <div class="col-duration">时长</div>
            <div class="col-time">上传时间</div>
            <div class="col-status">审核状态</div>
            <div class="col-stats">数据</div>
            <div class="col-action">操作</div>
          </div>
          <div v-for="episode in episodeList" :key="episode.avid" class="table-row">
            <div class="col-index">
              <span class="episode-badge">P{{ episode.episodeNumber || episode.sort }}</span>
            </div>
            <div class="col-title">
              <div class="episode-title-text">{{ episode.title || '未命名' }}</div>
            </div>
            <div class="col-duration">{{ formatDuration(episode.duration) }}</div>
            <div class="col-time">{{ formatTime(episode.createTime) }}</div>
            <div class="col-status">
              <span class="status-tag" :class="getReviewStatusClass(episode.reviewStatus)">
                {{ getReviewStatusText(episode.reviewStatus) }}
              </span>
            </div>
            <div class="col-stats">
              <div class="stat-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
                <span>{{ formatCount(episode.playCount || 0) }}</span>
              </div>
              <div class="stat-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <span>{{ formatCount(episode.likeCount || 0) }}</span>
              </div>
            </div>
            <div class="col-action">
              <button class="action-btn" title="编辑" @click="openEditDialog(episode)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="action-btn action-btn--danger" title="删除" @click="handleDelete(episode)">
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
          </svg>
          <p>暂无剧集</p>
          <button class="add-btn" @click="openAddDialog">添加第一个剧集</button>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="currentPage <= 1" @click="handlePageChange(currentPage - 1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="handlePageChange(currentPage + 1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 添加剧集弹窗 -->
    <Teleport to="body">
      <Transition name="modal-overlay">
        <div v-if="showAddDialog" class="modal-overlay" @click.self="showAddDialog = false">
          <Transition name="modal-dialog" appear>
            <div v-if="showAddDialog" class="modal-dialog">
              <div class="modal-header">
                <h3>添加剧集</h3>
                <button class="modal-close" @click="showAddDialog = false">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div class="modal-body">
                <div class="form-item">
                  <label class="form-label">剧集标题</label>
                  <input v-model="newEpisode.title" class="form-input" placeholder="请输入剧集标题" />
                </div>
                <div class="form-item">
                  <label class="form-label">大会员观看</label>
                  <label class="vip-switch" :class="{ active: newEpisode.needVip }">
                    <input type="checkbox" v-model="newEpisode.needVip" />
                    <span class="vip-switch-track"><span class="vip-switch-thumb"></span></span>
                    <span class="vip-switch-text">{{ newEpisode.needVip ? '需要大会员观看' : '所有用户可观看' }}</span>
                  </label>
                </div>
                <div v-if="!newEpisode.file" class="form-item">
                  <label class="form-label">视频文件</label>
                  <div class="upload-zone">
                    <input type="file" accept="video/*" class="upload-input" @change="handleNewFileChange" />
                    <label class="upload-label">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>点击选择视频文件</span>
                    </label>
                  </div>
                </div>
                <div v-if="newEpisode.previewUrl" class="form-item">
                  <label class="form-label">视频预览</label>
                  <video :src="fileUrl(newEpisode.previewUrl)" controls class="video-preview"></video>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn--outline" @click="showAddDialog = false">取消</button>
                <button class="btn btn--primary" :disabled="!newEpisode.file" @click="submitNewEpisode">添加</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- 编辑剧集弹窗 -->
    <Teleport to="body">
      <Transition name="modal-overlay">
        <div v-if="showEditDialog" class="modal-overlay" @click.self="showEditDialog = false">
          <Transition name="modal-dialog" appear>
            <div v-if="showEditDialog" class="modal-dialog">
              <div class="modal-header">
                <h3>编辑剧集</h3>
                <button class="modal-close" @click="showEditDialog = false">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div class="modal-body">
                <div class="form-item">
                  <label class="form-label">剧集标题</label>
                  <input v-model="currentEditEpisode.title" class="form-input" placeholder="请输入剧集标题" />
                </div>
                <div class="form-item">
                  <label class="form-label">大会员观看</label>
                  <label class="vip-switch" :class="{ active: currentEditEpisode.needVip }">
                    <input type="checkbox" v-model="currentEditEpisode.needVip" />
                    <span class="vip-switch-track"><span class="vip-switch-thumb"></span></span>
                    <span class="vip-switch-text">{{ currentEditEpisode.needVip ? '需要大会员观看' : '所有用户可观看' }}</span>
                  </label>
                </div>
                <div v-if="currentEditEpisode.playUrl && !currentEditEpisode.newFile" class="form-item">
                  <label class="form-label">当前视频</label>
                  <div class="video-preview-wrap">
                    <video :src="fileUrl(currentEditEpisode.playUrl)" controls class="video-preview"></video>
                    <button class="remove-video-btn" @click="removeEditVideo" title="删除视频">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div v-if="!currentEditEpisode.playUrl || currentEditEpisode.newFile" class="form-item">
                  <label class="form-label">视频文件</label>
                  <div v-if="!currentEditEpisode.newFile" class="upload-zone">
                    <input type="file" accept="video/*" class="upload-input" @change="handleEditFileChange" />
                    <label class="upload-label">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>点击选择视频文件</span>
                    </label>
                  </div>
                </div>
                <div v-if="currentEditEpisode.newPreviewUrl" class="form-item">
                  <video :src="fileUrl(currentEditEpisode.newPreviewUrl)" controls class="video-preview"></video>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn--outline" @click="showEditDialog = false">取消</button>
                <button class="btn btn--primary" @click="submitEditEpisode">保存</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CreatorHeader from '../components/layout/CreatorHeader.vue'
import { getVideoDetailByUid, getVideoEpisodeList, addVideoEpisode, updateVideoEpisode, deleteVideoEpisode } from '../api/video'
import { uploadFile } from '../utils/fileUpload'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fileUrl } from '../config'
import { formatCount, formatDuration } from '../utils/format'

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
const currentEditEpisode = ref({ avid: '', title: '', duration: 0, playUrl: '', newFile: null, newPreviewUrl: '', needVip: false })
const newEpisode = ref({ title: '', file: null, duration: 0, previewUrl: '', needVip: false })

onMounted(async () => {
  videoUid.value = route.params.videoUid
  await loadVideoInfo()
  await loadEpisodeList()
})

onUnmounted(() => {
  if (newEpisode.value.previewUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(newEpisode.value.previewUrl)
  }
  if (currentEditEpisode.value.newPreviewUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(currentEditEpisode.value.newPreviewUrl)
  }
  episodeList.value.forEach(ep => {
    if (ep.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(ep.previewUrl)
    }
  })
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
    totalPages.value = Math.ceil((res?.total || 0) / pageSize)
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

const goBack = () => {
  const query = route.query
  router.push({ path: '/contribution', query })
}

const openAddDialog = () => {
  newEpisode.value = { title: '', file: null, duration: 0, previewUrl: '', needVip: false }
  showAddDialog.value = true
}

const handleNewFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    newEpisode.value.file = file
    newEpisode.value.title = file.name.replace(/\.[^/.]+$/, '')
    if (newEpisode.value.previewUrl) URL.revokeObjectURL(newEpisode.value.previewUrl)
    newEpisode.value.previewUrl = URL.createObjectURL(file)
  }
}

const submitNewEpisode = async () => {
  if (!newEpisode.value.file) return
  try {
    const playUrl = await uploadFile(newEpisode.value.file, (p) => console.log('上传进度:', p))
    await addVideoEpisode({
      videoUid: videoUid.value,
      title: newEpisode.value.title,
      playUrl,
      duration: newEpisode.value.duration,
      needVip: !!newEpisode.value.needVip
    })
    ElMessage.success('剧集添加成功')
    showAddDialog.value = false
    loadEpisodeList()
  } catch (e) {
    console.error('添加剧集失败:', e)
    ElMessage.error('添加剧集失败')
  }
}

const openEditDialog = (episode) => {
  currentEditEpisode.value = {
    avid: episode.avid,
    title: episode.title || '',
    duration: episode.duration || 0,
    playUrl: episode.playUrl || '',
    newFile: null,
    newPreviewUrl: '',
    needVip: !!episode.needVip
  }
  showEditDialog.value = true
}

const handleEditFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    currentEditEpisode.value.newFile = file
    if (currentEditEpisode.value.newPreviewUrl) URL.revokeObjectURL(currentEditEpisode.value.newPreviewUrl)
    currentEditEpisode.value.newPreviewUrl = URL.createObjectURL(file)
  }
}

const removeEditVideo = () => {
  currentEditEpisode.value.playUrl = ''
}

const submitEditEpisode = async () => {
  try {
    let playUrl = currentEditEpisode.value.playUrl
    if (currentEditEpisode.value.newFile) {
      playUrl = await uploadFile(currentEditEpisode.value.newFile, (p) => console.log('上传进度:', p))
    }
    await updateVideoEpisode({
      episodeUid: currentEditEpisode.value.avid,
      title: currentEditEpisode.value.title,
      playUrl,
      needVip: !!currentEditEpisode.value.needVip
    })
    ElMessage.success('剧集更新成功')
    showEditDialog.value = false
    loadEpisodeList()
  } catch (e) {
    console.error('更新剧集失败:', e)
    ElMessage.error('更新剧集失败')
  }
}

const handleDelete = (episode) => {
  ElMessageBox.confirm('确定要删除这个剧集吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteVideoEpisode(episode.avid)
      ElMessage.success('删除成功')
      loadEpisodeList()
    } catch (e) {
      console.error('删除剧集失败:', e)
      ElMessage.error('删除剧集失败')
    }
  }).catch(() => {})
}

const getReviewStatusClass = (status) => {
  const s = Number(status)
  const map = { 0: 'pending', 1: 'approved', 2: 'rejected' }
  return map[s] || 'pending'
}

const getReviewStatusText = (status) => {
  const s = Number(status)
  const map = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
  return map[s] || '未知'
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
</script>

<style scoped>
.contribution-page {
  min-height: 100vh;
  background: var(--bg3);
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 32px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 700;
  color: var(--text1);
  margin: 0;
}

.page-title svg {
  color: var(--brand_pink);
}

.episode-container {
  background: var(--bg1);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.manage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line_light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--line_regular);
  background: var(--bg1);
  color: var(--text2);
  font-size: 13px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  border-color: var(--brand_pink);
  color: var(--brand_pink);
}

.video-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text1);
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff8cb0 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 102, 153, 0.3);
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 102, 153, 0.4);
}

.episode-table {
  border: 1px solid var(--line_light);
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 100px 120px 100px 140px 100px;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg2);
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 100px 120px 100px 140px 100px;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line_light);
  align-items: center;
  transition: background 0.2s ease;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--bg2);
}

.episode-badge {
  display: inline-block;
  padding: 4px 10px;
  background: var(--brand_pink);
  color: #fff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.episode-title-text {
  font-size: 14px;
  color: var(--text1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-duration,
.col-time {
  font-size: 13px;
  color: var(--text3);
}

.status-tag {
  display: inline-block;
  padding: 3px 10px;
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
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text3);
  margin-bottom: 4px;
}

.stat-row:last-child {
  margin-bottom: 0;
}

.stat-row svg {
  opacity: 0.6;
}

.col-action {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg2);
  color: var(--text3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg3);
  color: var(--brand_pink);
}

.action-btn--danger:hover {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
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
  font-size: 16px;
  margin: 16px 0 20px;
  color: var(--text3);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--line_regular);
  background: var(--bg1);
  color: var(--text2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--brand_pink);
  color: var(--brand_pink);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: var(--text3);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--line_light);
  border-top-color: var(--brand_pink);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-dialog {
  background: var(--bg1);
  border-radius: 12px;
  width: 480px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line_light);
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
  margin: 0;
}

.modal-close {
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

.modal-close:hover {
  background: var(--bg2);
  color: var(--text1);
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--line_light);
}

.form-item {
  margin-bottom: 16px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--line_regular);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text1);
  background: var(--bg1);
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--brand_pink);
  box-shadow: 0 0 0 3px rgba(255, 102, 153, 0.1);
}

.vip-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.vip-switch input {
  display: none;
}

.vip-switch-track {
  position: relative;
  width: 34px;
  height: 18px;
  border-radius: 9px;
  background: var(--bg3);
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.vip-switch.active .vip-switch-track {
  background: var(--brand_pink);
}

.vip-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.vip-switch.active .vip-switch-thumb {
  transform: translateX(16px);
}

.vip-switch-text {
  font-size: 13px;
  color: var(--text3);
  transition: color 0.2s ease;
}

.vip-switch.active .vip-switch-text {
  color: var(--brand_pink);
  font-weight: 600;
}

.upload-zone {
  position: relative;
}

.upload-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  border: 2px dashed var(--line_regular);
  border-radius: 8px;
  color: var(--text4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-label:hover {
  border-color: var(--brand_pink);
  color: var(--brand_pink);
}

.upload-label span {
  font-size: 13px;
}

.video-preview {
  width: 100%;
  max-height: 200px;
  border-radius: 8px;
  background: #000;
}

.video-preview-wrap {
  position: relative;
}

.remove-video-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-video-btn:hover {
  background: rgba(255, 77, 79, 0.8);
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn--outline {
  background: var(--bg1);
  border: 1.5px solid var(--line_regular);
  color: var(--text2);
}

.btn--outline:hover {
  border-color: var(--brand_pink);
  color: var(--brand_pink);
}

.btn--primary {
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff8cb0 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 102, 153, 0.3);
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 102, 153, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transitions */
.modal-overlay-enter-active,
.modal-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

.modal-dialog-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-dialog-leave-active {
  transition: all 0.2s ease;
}

.modal-dialog-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.modal-dialog-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .table-header,
  .table-row {
    grid-template-columns: 60px 1fr 80px 100px;
  }
  
  .col-time,
  .col-stats,
  .col-action {
    display: none;
  }
}
</style>
