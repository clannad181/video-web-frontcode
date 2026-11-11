<template>
  <div class="submit-form">
    <!-- 基本信息 -->
    <div class="form-section">
      <div class="section-label">基本信息</div>
      <van-cell-group inset>
        <van-field v-model="form.title" label="标题" placeholder="请输入视频标题（必填）" maxlength="80" show-word-limit />
        <van-field
          v-model="categoryName"
          is-link
          readonly
          label="分区"
          placeholder="选择分区（必填）"
          @click="showCategoryPicker = true"
        />
      </van-cell-group>

      <!-- 封面 -->
      <div class="cover-block">
        <div class="cover-label">封面</div>
        <div class="cover-pick" @click="triggerCoverUpload">
          <img v-if="coverPreview" :src="coverPreview" alt="" />
          <template v-else>
            <van-icon name="photograph" size="26" />
            <span>点击上传封面</span>
          </template>
        </div>
        <input ref="coverInput" type="file" accept="image/*" hidden @change="handleCoverChange" />
      </div>

      <van-cell-group inset>
        <van-field
          v-model="form.description"
          label="简介"
          type="textarea"
          rows="3"
          autosize
          maxlength="1000"
          show-word-limit
          placeholder="介绍一下你的视频"
        />
      </van-cell-group>

      <!-- 标签 -->
      <div class="tag-block">
        <div class="section-label">标签（最多10个）</div>
        <div class="tag-list">
          <span v-for="(tag, i) in form.tags" :key="i" class="tag-chip">
            {{ tag }}
            <van-icon name="cross" @click="removeTag(i)" />
          </span>
          <div class="tag-add" v-if="form.tags.length < 10">
            <van-field
              v-model="tagInput"
              placeholder="输入后回车"
              maxlength="10"
              @keyup.enter="addTag"
              @blur="addTag"
            />
          </div>
        </div>
      </div>

      <van-cell-group inset>
        <van-cell title="是否完结" label="完结后用户一次看全">
          <template #right-icon>
            <van-switch v-model="form.isFinished" size="20px" active-color="#FF6699" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 剧集管理 -->
    <div class="form-section">
      <div class="section-label">
        剧集
        <span class="section-hint">支持单视频投稿</span>
      </div>

      <div v-for="(ep, index) in episodes" :key="ep.id" class="episode-card">
        <div class="episode-head">
          <span class="episode-index">P{{ index + 1 }}</span>
          <button
            v-if="ep.videoPreviewUrl || ep.file"
            class="episode-clear"
            type="button"
            @click="clearVideo(index)"
          >移除</button>
        </div>

        <div class="episode-file" @click="triggerVideoUpload(index)">
          <template v-if="ep.videoPreviewUrl">
            <van-icon name="video-o" size="20" />
            <span class="episode-file-name">{{ ep.title || '已选择视频' }}</span>
            <span v-if="ep.duration" class="episode-file-dur">{{ formatDuration(ep.duration) }}</span>
          </template>
          <template v-else>
            <van-icon name="add-square" size="20" />
            <span>点击选择视频文件</span>
          </template>
        </div>
        <input
          :ref="el => setVideoInputRef(el, index)"
          type="file"
          accept="video/*"
          hidden
          @change="e => handleVideoChange(e, index)"
        />

        <van-field
          v-model="ep.title"
          label="剧集名"
          placeholder="如：第1集（选填）"
          maxlength="50"
          class="episode-title-field"
        />

        <!-- 大会员开关 -->
        <div class="vip-switch-row" :class="{ active: ep.needVip }">
          <div class="vip-switch-info">
            <van-icon name="diamond" size="16" class="vip-switch-icon" />
            <div>
              <div class="vip-switch-title">是否需要大会员观看</div>
              <div class="vip-switch-sub">{{ ep.needVip ? '仅大会员可观看此剧集' : '所有用户可观看' }}</div>
            </div>
          </div>
          <van-switch v-model="ep.needVip" size="20px" active-color="#FF6699" />
        </div>

        <div v-if="ep.uploading" class="episode-progress">
          <van-progress :percentage="ep.progress" stroke-width="4" color="#FF6699" />
        </div>
      </div>

      <van-button plain block size="small" color="#FF6699" round class="add-episode-btn" @click="addEpisode">
        + 添加剧集
      </van-button>
    </div>

    <!-- 操作 -->
    <div class="form-actions">
      <van-button plain round size="small" :loading="saving" @click="saveDraft">存草稿</van-button>
      <van-button
        type="primary"
        color="#FF6699"
        round
        block
        class="submit-btn"
        :loading="submitting"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >{{ editVideoUid ? '保存修改' : '提交投稿' }}</van-button>
    </div>

    <!-- 分区选择 -->
    <van-action-sheet v-model:show="showCategoryPicker" title="选择分区">
      <div class="category-picker">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-option"
          :class="{ active: form.categoryId === cat.id }"
          @click="selectCategory(cat)"
        >{{ cat.name }}</div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { showToast } from 'vant'
import {
  getCategoryList
} from '../../api/category'
import {
  submitVideo, updateVideo, saveDraft as saveDraftApi, getDraft, deleteDraft,
  getVideoDetailByUid
} from '../../api/video'
import { uploadFile } from '../../utils/fileUpload'
import { formatDuration } from '../../utils/format'

const props = defineProps({
  editVideoUid: { type: String, default: '' }
})
const emit = defineEmits(['submitted'])

const steps = ['基本信息', '剧集管理', '确认投稿']

const categories = ref([])
const showCategoryPicker = ref(false)
const form = ref({
  title: '',
  categoryId: '',
  description: '',
  isFinished: false,
  tags: []
})
const tagInput = ref('')
const coverFile = ref(null)
const coverPreview = ref('')
const coverInput = ref(null)
const videoInputs = ref({})
let episodeIdCounter = 1

function createEpisode() {
  return {
    id: episodeIdCounter++,
    serverId: null,
    title: '',
    file: null,
    videoPreviewUrl: '',
    duration: 0,
    needVip: false,
    uploading: false,
    progress: 0
  }
}

const episodes = ref([createEpisode()])
const submitting = ref(false)
const saving = ref(false)
const editingVideoUid = ref(props.editVideoUid)

const categoryName = computed(() => {
  const cat = categories.value.find(c => c.id === form.value.categoryId)
  return cat?.name || ''
})

const canSubmit = computed(() => {
  return form.value.title.trim() &&
    form.value.categoryId &&
    episodes.value.some(ep => ep.file || ep.videoPreviewUrl)
})

watch(() => props.editVideoUid, (val) => {
  editingVideoUid.value = val
  if (val) loadEditData(val)
})

const selectCategory = (cat) => {
  form.value.categoryId = cat.id
  showCategoryPicker.value = false
}

const loadEditData = async (videoUid) => {
  try {
    const res = await getVideoDetailByUid(videoUid)
    if (res) {
      form.value = {
        title: res.title || '',
        categoryId: res.categoryId || '',
        description: res.description || '',
        isFinished: !res.isOngoing,
        tags: res.tags || []
      }
      if (res.coverUrl) coverPreview.value = res.coverUrl
      if (res.episodes && res.episodes.length > 0) {
        episodes.value = res.episodes.map((ep, index) => ({
          id: ep.id || index + 1,
          serverId: ep.id,
          title: ep.title || '',
          file: null,
          videoPreviewUrl: ep.playUrl || '',
          duration: ep.duration || 0,
          needVip: !!ep.needVip,
          uploading: false,
          progress: 0
        }))
        episodeIdCounter = episodes.value.length + 1
      } else {
        episodes.value = [createEpisode()]
      }
    }
  } catch (e) {
    console.error('获取视频详情失败:', e)
    showToast('获取视频详情失败')
  }
}

const loadDraftIfNeeded = async () => {
  try {
    const res = await getDraft()
    if (!res) return
    form.value = {
      title: res.title || '',
      categoryId: res.categoryId || '',
      description: res.description || '',
      isFinished: !res.isOngoing,
      tags: res.tags || []
    }
    if (res.coverUrl) coverPreview.value = res.coverUrl
    if (res.episodes && res.episodes.length > 0) {
      episodes.value = res.episodes.map(ep => ({
        ...createEpisode(),
        title: ep.title,
        videoPreviewUrl: ep.playUrl,
        duration: ep.duration,
        needVip: !!ep.needVip
      }))
      episodeIdCounter = episodes.value.length + 1
    }
  } catch (e) {
    console.error('恢复草稿失败:', e)
  }
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && tag.length <= 10 && !form.value.tags.includes(tag) && form.value.tags.length < 10) {
    form.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index) => {
  form.value.tags.splice(index, 1)
}

const addEpisode = () => {
  episodes.value.push(createEpisode())
}

const triggerCoverUpload = () => coverInput.value?.click()

const handleCoverChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    coverFile.value = file
    coverPreview.value = URL.createObjectURL(file)
  }
}

const setVideoInputRef = (el, index) => {
  if (el) videoInputs.value[index] = el
}

const triggerVideoUpload = (index) => videoInputs.value[index]?.click()

const clearVideo = (index) => {
  const ep = episodes.value[index]
  if (ep.videoPreviewUrl && ep.videoPreviewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(ep.videoPreviewUrl)
  }
  ep.file = null
  ep.videoPreviewUrl = ''
  ep.duration = 0
  ep.serverId = null
  ep.title = ''
}

const handleVideoChange = (e, index) => {
  const file = e.target.files[0]
  if (file) {
    episodes.value[index].file = file
    episodes.value[index].title = file.name.replace(/\.[^/.]+$/, '')
    if (episodes.value[index].videoPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(episodes.value[index].videoPreviewUrl)
    }
    const previewUrl = URL.createObjectURL(file)
    episodes.value[index].videoPreviewUrl = previewUrl

    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      episodes.value[index].duration = Math.floor(video.duration)
    }
    video.src = previewUrl
  }
}

const getDraftData = () => ({
  title: form.value.title,
  categoryId: form.value.categoryId,
  description: form.value.description,
  isOngoing: !form.value.isFinished,
  tags: form.value.tags,
  coverUrl: coverPreview.value && !coverPreview.value.startsWith('blob:') ? coverPreview.value : '',
  episodes: episodes.value
    .filter(ep => ep.title || ep.videoPreviewUrl)
    .map(ep => ({
      title: ep.title,
      playUrl: ep.videoPreviewUrl,
      duration: ep.duration,
      needVip: !!ep.needVip
    }))
})

const saveDraft = async () => {
  if (saving.value) return
  saving.value = true
  try {
    await saveDraftApi(getDraftData())
    showToast('草稿已保存')
  } catch (e) {
    showToast('保存草稿失败')
  } finally {
    saving.value = false
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true

  try {
    let coverUrl = ''
    if (coverFile.value) {
      coverUrl = await uploadFile(coverFile.value, () => {}, 'image')
    } else if (coverPreview.value && !coverPreview.value.startsWith('blob:')) {
      coverUrl = coverPreview.value
    }

    const episodeData = []
    for (const ep of episodes.value) {
      if (ep.file) {
        const playUrl = await uploadFile(ep.file, (progress) => {
          ep.progress = progress
          ep.uploading = progress < 100
        }, 'video')
        episodeData.push({ title: ep.title, playUrl, duration: ep.duration, needVip: !!ep.needVip })
      } else if (ep.serverId || ep.videoPreviewUrl) {
        episodeData.push({
          id: ep.serverId,
          title: ep.title,
          playUrl: ep.videoPreviewUrl,
          duration: ep.duration,
          needVip: !!ep.needVip
        })
      }
    }

    const videoData = {
      title: form.value.title,
      categoryId: form.value.categoryId,
      description: form.value.description,
      isOngoing: !form.value.isFinished,
      tags: form.value.tags,
      coverUrl,
      episodes: episodeData
    }

    if (editingVideoUid.value) {
      videoData.videoUid = editingVideoUid.value
      await updateVideo(videoData)
      showToast('视频更新成功')
    } else {
      await submitVideo(videoData)
      showToast('投稿成功')
      try { await deleteDraft() } catch {}
    }

    resetForm()
    emit('submitted')
  } catch (e) {
    console.error('投稿失败:', e)
    showToast('投稿失败: ' + (e.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  form.value = { title: '', categoryId: '', description: '', isFinished: false, tags: [] }
  coverFile.value = null
  coverPreview.value = ''
  episodes.value = [createEpisode()]
  episodeIdCounter = 1
}

onMounted(async () => {
  try {
    const res = await getCategoryList()
    categories.value = (res || []).filter(c => c.id !== 1)
  } catch (e) {
    console.error('获取分类失败:', e)
  }
  if (editingVideoUid.value) {
    loadEditData(editingVideoUid.value)
  } else {
    await loadDraftIfNeeded()
  }
})

onUnmounted(() => {
  if (coverPreview.value?.startsWith('blob:')) URL.revokeObjectURL(coverPreview.value)
  episodes.value.forEach(ep => {
    if (ep.videoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(ep.videoPreviewUrl)
  })
})

defineExpose({ resetForm })
</script>

<style scoped>
.submit-form {
  padding-bottom: 24px;
}

.form-section {
  margin-bottom: 18px;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text1);
  padding: 0 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-hint {
  font-size: 11px;
  font-weight: 400;
  color: var(--text4);
}

.cover-block {
  padding: 10px 14px;
}

.cover-label {
  font-size: 13px;
  color: var(--text2);
  margin-bottom: 8px;
}

.cover-pick {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 1.5px dashed var(--line_regular);
  border-radius: 10px;
  background: var(--bg2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--text3);
  font-size: 12px;
  overflow: hidden;
  cursor: pointer;
}

.cover-pick img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tag-block {
  padding: 6px 0 10px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 14px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 10px;
  background: var(--brand_pink_thin);
  color: var(--brand_pink);
  font-size: 12px;
  border-radius: 14px;
}

.tag-chip .van-icon {
  font-size: 11px;
  cursor: pointer;
}

.tag-add {
  width: 130px;
}

.tag-add :deep(.van-field) {
  background: var(--bg2);
  border-radius: 14px;
  padding: 4px 12px;
  font-size: 12px;
}

.episode-card {
  margin: 0 12px 12px;
  padding: 12px;
  background: var(--bg1);
  border: 1px solid var(--line-light);
  border-radius: 12px;
}

.episode-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.episode-index {
  font-size: 13px;
  font-weight: 700;
  color: var(--brand_pink);
}

.episode-clear {
  background: none;
  border: none;
  font-size: 12px;
  color: var(--text4);
  cursor: pointer;
}

.episode-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px;
  background: var(--bg2);
  border: 1.5px dashed var(--line_regular);
  border-radius: 10px;
  color: var(--text3);
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 8px;
}

.episode-file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--text1);
}

.episode-file-dur {
  font-size: 11px;
  color: var(--text4);
}

.episode-title-field {
  background: var(--bg2);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 10px;
}

.vip-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg2);
  border: 1px solid var(--line-regular, var(--line_regular));
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

.episode-progress {
  margin-top: 10px;
}

.add-episode-btn {
  margin: 0 12px;
  width: calc(100% - 24px);
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px calc(16px + var(--sab));
}

.submit-btn {
  flex: 1;
}

.category-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 12px 16px calc(24px + var(--sab));
}

.category-option {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  background: var(--bg2);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
}

.category-option.active {
  background: var(--brand_pink);
  color: #fff;
  font-weight: 600;
}
</style>
