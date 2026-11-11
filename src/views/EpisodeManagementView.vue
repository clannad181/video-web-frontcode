<template>
  <div class="epm-page">
    <!-- 顶栏 -->
    <div class="c-topbar">
      <van-icon name="arrow-left" size="20" @click="goBack" />
      <div class="c-topbar-main">
        <span class="c-topbar-title">剧集管理</span>
        <span v-if="videoTitle" class="c-topbar-sub">{{ videoTitle }}</span>
      </div>
      <van-button size="mini" type="primary" color="#FF6699" round @click="openAddDialog">新增</van-button>
    </div>

    <van-loading v-if="loading && !episodeList.length" class="page-loading" color="#FF6699">加载中…</van-loading>

    <template v-else-if="episodeList.length">
      <div class="ep-list">
        <div v-for="ep in episodeList" :key="ep.avid || ep.id" class="ep-item">
          <div class="ep-info">
            <div class="ep-title-row">
              <span class="ep-title">{{ ep.title || '未命名剧集' }}</span>
              <span v-if="ep.needVip" class="vip-badge ep-vip">大会员</span>
            </div>
            <div class="ep-meta">
              <span v-if="ep.duration">{{ formatDuration(ep.duration) }}</span>
              <span>{{ getReviewStatusText(ep.status) }}</span>
              <span>{{ formatTime(ep.createTime) }}</span>
            </div>
            <div class="ep-url" v-if="ep.playUrl">{{ ep.playUrl }}</div>
          </div>
          <div class="ep-actions">
            <van-button size="mini" round plain color="#FF6699" @click="openEditDialog(ep)">编辑</van-button>
            <van-button size="mini" round plain type="danger" @click="handleDelete(ep)">删除</van-button>
          </div>
        </div>
      </div>

      <div class="list-end">
        <template v-if="totalPages > 1">
          <van-button
            size="small"
            plain
            round
            :disabled="currentPage <= 1"
            @click="handlePageChange(currentPage - 1)"
          >上一页</van-button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <van-button
            size="small"
            plain
            round
            :disabled="currentPage >= totalPages"
            @click="handlePageChange(currentPage + 1)"
          >下一页</van-button>
        </template>
        <span v-else>没有更多了</span>
      </div>
    </template>

    <van-empty v-else description="暂无剧集">
      <van-button round type="primary" color="#FF6699" size="small" @click="openAddDialog">新增剧集</van-button>
    </van-empty>

    <!-- 新增剧集弹层 -->
    <van-popup v-model:show="showAddDialog" position="bottom" round safe-area-inset-bottom>
      <div class="ep-dialog">
        <div class="ep-dialog-header">
          <h3>新增剧集</h3>
          <van-icon name="cross" size="20" @click="showAddDialog = false" />
        </div>
        <div class="ep-dialog-body">
          <div class="ep-file" @click="triggerNewFile">
            <template v-if="newEpisode.previewUrl">
              <van-icon name="video-o" size="20" />
              <span class="ep-file-name">{{ newEpisode.title || '已选择视频' }}</span>
            </template>
            <template v-else>
              <van-icon name="add-square" size="20" />
              <span>点击选择视频文件</span>
            </template>
          </div>
          <input ref="newFileInput" type="file" accept="video/*" hidden @change="handleNewFileChange" />

          <van-cell-group inset>
            <van-field
              v-model="newEpisode.title"
              label="剧集名"
              placeholder="如：第1集"
              maxlength="50"
            />
          </van-cell-group>

          <div class="vip-switch-row" :class="{ active: newEpisode.needVip }">
            <div class="vip-switch-info">
              <van-icon name="diamond" size="16" class="vip-switch-icon" />
              <div>
                <div class="vip-switch-title">是否需要大会员观看</div>
                <div class="vip-switch-sub">{{ newEpisode.needVip ? '仅大会员可观看此剧集' : '所有用户可观看' }}</div>
              </div>
            </div>
            <van-switch v-model="newEpisode.needVip" size="20px" active-color="#FF6699" />
          </div>
        </div>
        <div class="ep-dialog-footer">
          <van-button
            block
            type="primary"
            color="#FF6699"
            round
            :loading="adding"
            :disabled="!newEpisode.file"
            @click="submitNewEpisode"
          >{{ adding ? '上传中…' : '确认新增' }}</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 编辑剧集弹层 -->
    <van-popup v-model:show="showEditDialog" position="bottom" round safe-area-inset-bottom>
      <div class="ep-dialog">
        <div class="ep-dialog-header">
          <h3>编辑剧集</h3>
          <van-icon name="cross" size="20" @click="showEditDialog = false" />
        </div>
        <div class="ep-dialog-body">
          <div class="ep-file" @click="triggerEditFile">
            <template v-if="currentEditEpisode.newPreviewUrl || currentEditEpisode.playUrl">
              <van-icon name="video-o" size="20" />
              <span class="ep-file-name">{{ currentEditEpisode.newFile ? '已选择新视频（将覆盖原视频）' : '原视频' }}</span>
              <van-button
                v-if="currentEditEpisode.playUrl && !currentEditEpisode.newFile"
                size="mini"
                plain
                type="danger"
                @click.stop="removeEditVideo"
              >移除</van-button>
            </template>
            <template v-else>
              <van-icon name="add-square" size="20" />
              <span>点击选择视频文件</span>
            </template>
          </div>
          <input ref="editFileInput" type="file" accept="video/*" hidden @change="handleEditFileChange" />

          <van-cell-group inset>
            <van-field
              v-model="currentEditEpisode.title"
              label="剧集名"
              placeholder="剧集名称"
              maxlength="50"
            />
          </van-cell-group>

          <div class="vip-switch-row" :class="{ active: currentEditEpisode.needVip }">
            <div class="vip-switch-info">
              <van-icon name="diamond" size="16" class="vip-switch-icon" />
              <div>
                <div class="vip-switch-title">是否需要大会员观看</div>
                <div class="vip-switch-sub">{{ currentEditEpisode.needVip ? '仅大会员可观看此剧集' : '所有用户可观看' }}</div>
              </div>
            </div>
            <van-switch v-model="currentEditEpisode.needVip" size="20px" active-color="#FF6699" />
          </div>
        </div>
        <div class="ep-dialog-footer">
          <van-button
            block
            type="primary"
            color="#FF6699"
            round
            :loading="editing"
            @click="submitEditEpisode"
          >{{ editing ? '保存中…' : '保存修改' }}</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getVideoDetailByUid, getVideoEpisodeList, addVideoEpisode, updateVideoEpisode, deleteVideoEpisode } from '../api/video'
import { uploadFile } from '../utils/fileUpload'
import { formatDuration } from '../utils/format'

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
const adding = ref(false)
const editing = ref(false)
const newFileInput = ref(null)
const editFileInput = ref(null)

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
    totalPages.value = Math.ceil((res?.total || 0) / pageSize) || 1
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
  router.push({ path: '/contribution', query: route.query })
}

const openAddDialog = () => {
  newEpisode.value = { title: '', file: null, duration: 0, previewUrl: '', needVip: false }
  showAddDialog.value = true
}

const triggerNewFile = () => newFileInput.value?.click()

const handleNewFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    newEpisode.value.file = file
    newEpisode.value.title = file.name.replace(/\.[^/.]+$/, '')
    if (newEpisode.value.previewUrl) URL.revokeObjectURL(newEpisode.value.previewUrl)
    newEpisode.value.previewUrl = URL.createObjectURL(file)

    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      newEpisode.value.duration = Math.floor(video.duration)
    }
    video.src = newEpisode.value.previewUrl
  }
}

const submitNewEpisode = async () => {
  if (!newEpisode.value.file || adding.value) return
  adding.value = true
  try {
    const playUrl = await uploadFile(newEpisode.value.file, () => {}, 'video')
    await addVideoEpisode({
      videoUid: videoUid.value,
      title: newEpisode.value.title,
      playUrl,
      duration: newEpisode.value.duration,
      needVip: !!newEpisode.value.needVip
    })
    showToast('剧集添加成功')
    showAddDialog.value = false
    currentPage.value = 1
    loadEpisodeList()
  } catch (e) {
    console.error('添加剧集失败:', e)
    showToast('添加剧集失败')
  } finally {
    adding.value = false
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

const triggerEditFile = () => editFileInput.value?.click()

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
  if (editing.value) return
  editing.value = true
  try {
    let playUrl = currentEditEpisode.value.playUrl
    if (currentEditEpisode.value.newFile) {
      playUrl = await uploadFile(currentEditEpisode.value.newFile, () => {}, 'video')
    }
    await updateVideoEpisode({
      episodeUid: currentEditEpisode.value.avid,
      title: currentEditEpisode.value.title,
      playUrl,
      needVip: !!currentEditEpisode.value.needVip
    })
    showToast('剧集更新成功')
    showEditDialog.value = false
    loadEpisodeList()
  } catch (e) {
    console.error('更新剧集失败:', e)
    showToast('更新剧集失败')
  } finally {
    editing.value = false
  }
}

const handleDelete = async (episode) => {
  try {
    await showConfirmDialog({ title: '删除剧集', message: '确定要删除这个剧集吗？' })
    await deleteVideoEpisode(episode.avid)
    showToast('删除成功')
    loadEpisodeList()
  } catch (e) {
    if (e !== 'cancel' && e?.message) {
      console.error('删除剧集失败:', e)
      showToast('删除剧集失败')
    }
  }
}

const getReviewStatusText = (status) => {
  const s = Number(status)
  const map = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
  return map[s] || ''
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
.epm-page {
  min-height: 100vh;
  background: var(--bg3);
}

.c-topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 12px;
  height: calc(48px + var(--sat));
  padding: var(--sat) 14px 0;
  background: var(--bg1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.c-topbar-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.c-topbar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
}

.c-topbar-sub {
  font-size: 11px;
  color: var(--text3);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.page-loading {
  justify-content: center;
  padding: 50px 0;
}

.ep-list {
  padding: 10px 12px;
}

.ep-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 10px;
  background: var(--bg1);
  border-radius: 12px;
}

.ep-info {
  flex: 1;
  min-width: 0;
}

.ep-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ep-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ep-vip {
  flex-shrink: 0;
}

.ep-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
  font-size: 11px;
  color: var(--text3);
}

.ep-url {
  margin-top: 5px;
  font-size: 10px;
  color: var(--text4);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ep-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.list-end {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 16px 0 32px;
  font-size: 12px;
  color: var(--text4);
}

.page-info {
  font-size: 13px;
  color: var(--text2);
}

.ep-dialog {
  padding-bottom: calc(16px + var(--sab));
}

.ep-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 8px;
}

.ep-dialog-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text1);
}

.ep-dialog-body {
  padding: 8px 0;
}

.ep-file {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px 12px;
  padding: 16px;
  background: var(--bg2);
  border: 1.5px dashed var(--line_regular);
  border-radius: 10px;
  color: var(--text3);
  font-size: 13px;
  cursor: pointer;
}

.ep-file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--text1);
}

.vip-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 12px 16px 0;
  padding: 10px 12px;
  background: var(--bg2);
  border: 1px solid var(--line_regular);
  border-radius: 10px;
}

.vip-switch-row.active {
  background: linear-gradient(135deg, #FFF6E9 0%, var(--brand_pink_thin) 100%);
  border-color: #FFD9E4;
}

.vip-switch-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.vip-switch-icon {
  color: var(--text4);
  flex-shrink: 0;
}

.vip-switch-row.active .vip-switch-icon {
  color: #FF9838;
}

.vip-switch-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text1);
}

.vip-switch-sub {
  font-size: 11px;
  color: var(--text3);
  margin-top: 2px;
}

.ep-dialog-footer {
  padding: 16px;
}
</style>
