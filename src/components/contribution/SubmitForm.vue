<template>
  <div class="submit-form">
    <div v-if="editingVideoUid" class="edit-notice">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span>正在编辑视频：<strong>{{ editingVideoUid }}</strong></span>
      <button class="notice-close" @click="$emit('cancel-edit')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="step-indicator">
      <div 
        v-for="(step, index) in steps" 
        :key="index" 
        class="step-item"
        :class="{ active: currentStep === index, completed: currentStep > index }"
      >
        <div class="step-dot">
          <svg v-if="currentStep > index" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span class="step-label">{{ step }}</span>
        <div v-if="index < steps.length - 1" class="step-line"></div>
      </div>
    </div>

    <div class="form-card">
      <div v-show="currentStep === 0" class="step-content fade-in">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          基本信息
        </h2>

        <div class="form-grid">
          <div class="form-group full-width">
            <label class="form-label">
              视频标题
              <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <input 
                v-model="form.title" 
                type="text" 
                class="form-input" 
                placeholder="请输入视频标题"
                maxlength="80"
              />
              <span class="char-count">{{ form.title.length }}/80</span>
            </div>
            <span class="form-hint">好的标题更容易被观众发现，建议包含关键词</span>
          </div>

          <div class="form-group">
            <label class="form-label">
              视频分类
              <span class="required">*</span>
            </label>
            <div class="select-wrapper">
              <select v-model="form.categoryId" class="form-select">
                <option value="">请选择分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
              <svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">连载状态</label>
            <div class="radio-group">
              <label class="radio-item" :class="{ active: !form.isFinished }">
                <input type="radio" :value="false" v-model="form.isFinished" />
                <span class="radio-dot"></span>
                <span class="radio-label">连载中</span>
                <span class="radio-hint">支持后续添加剧集</span>
              </label>
              <label class="radio-item" :class="{ active: form.isFinished }">
                <input type="radio" :value="true" v-model="form.isFinished" />
                <span class="radio-dot"></span>
                <span class="radio-label">已完结</span>
                <span class="radio-hint">全集已上传完毕</span>
              </label>
            </div>
          </div>

          <div class="form-group full-width">
            <label class="form-label">视频标签</label>
            <div class="tags-input-wrapper">
              <div class="tags-list">
                <span v-for="(tag, index) in form.tags" :key="index" class="tag-item">
                  {{ tag }}
                  <button class="tag-remove" @click="removeTag(index)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </span>
                <input 
                  v-model="tagInput"
                  type="text" 
                  class="tag-input"
                  :placeholder="form.tags.length === 0 ? '输入标签后按回车添加' : ''"
                  maxlength="10"
                  @keydown.enter.prevent="addTag"
                />
              </div>
              <span class="tags-hint">每个标签最多 {{ maxTagLength }} 个字</span>
            </div>
          </div>

          <div class="form-group full-width">
            <label class="form-label">视频简介</label>
            <div class="input-wrapper">
              <textarea 
                v-model="form.description" 
                class="form-textarea" 
                placeholder="请输入视频简介，让更多人了解你的作品"
                rows="4"
                maxlength="2000"
              ></textarea>
              <span class="char-count">{{ form.description.length }}/2000</span>
            </div>
            <span class="form-hint">详细的简介有助于观众了解视频内容</span>
          </div>
        </div>
      </div>

      <div v-show="currentStep === 1" class="step-content fade-in">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/>
            <line x1="17" y1="2" x2="17" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
          </svg>
          剧集管理
        </h2>

        <div class="cover-section">
          <div class="cover-section-header">
            <div class="cover-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              封面图
            </div>
            <span class="cover-section-hint">建议尺寸 16:9，支持 JPG/PNG</span>
          </div>
          <div class="cover-upload-area">
            <div class="cover-upload" @click="triggerCoverUpload">
              <input 
                ref="coverInput" 
                type="file" 
                accept="image/*" 
                style="display: none" 
                @change="handleCoverChange"
              />
              <div v-if="coverPreview" class="cover-preview">
                <img :src="coverPreview" alt="封面预览" />
                <div class="cover-overlay">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <span>更换封面</span>
                </div>
              </div>
              <div v-else class="cover-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span class="upload-text">点击上传封面</span>
              </div>
            </div>
            <button 
              v-if="episodes.some(ep => ep.videoPreviewUrl)" 
              class="capture-btn" 
              @click="$emit('capture-cover')"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              从视频截取封面
            </button>
          </div>
        </div>

        <div class="episodes-list">
          <div class="episodes-list-header">
            <span class="episodes-count">共 {{ episodes.length }} 个剧集</span>
            <button class="add-episode-btn" @click="addEpisode">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              添加剧集
            </button>
          </div>
          <div class="episodes-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>至少上传一个剧集，支持拖拽排序</span>
          </div>
          <TransitionGroup name="episode">
            <div 
              v-for="(episode, index) in reversedEpisodes" 
              :key="episode.id" 
              class="episode-card"
              :class="{ 
                'dragging': dragState.dragging && dragState.draggedIndex === getOriginalIndex(index),
                'drag-over': dragState.draggedOverIndex === getOriginalIndex(index)
              }"
              :style="{ '--index': index }"
              draggable="true"
              @dragstart="handleDragStart(getOriginalIndex(index), $event)"
              @dragover="handleDragOver(getOriginalIndex(index), $event)"
              @dragleave="handleDragLeave"
              @drop="handleDrop(getOriginalIndex(index), $event)"
              @dragend="handleDragEnd"
            >
              <div class="episode-card-header">
                <div class="drag-handle" title="拖拽排序">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="6" r="1"/>
                    <circle cx="15" cy="6" r="1"/>
                    <circle cx="9" cy="12" r="1"/>
                    <circle cx="15" cy="12" r="1"/>
                    <circle cx="9" cy="18" r="1"/>
                    <circle cx="15" cy="18" r="1"/>
                  </svg>
                </div>
                <div class="episode-badge">
                  <span class="episode-index">P{{ episodes.length - index }}</span>
                </div>
                <input 
                  v-model="episode.title"
                  type="text" 
                  class="episode-title-input"
                  :placeholder="'P' + (episodes.length - index) + ' 剧集标题'"
                />
                <button 
                  v-if="episodes.length > 1"
                  class="episode-delete-btn" 
                  @click="removeEpisode(getOriginalIndex(index))"
                  title="删除剧集"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
              <div class="episode-card-body">
                <div v-if="episode.videoPreviewUrl" class="video-preview">
                  <video :src="episode.videoPreviewUrl" class="preview-video" controls></video>
                  <div class="video-info">
                    <span class="video-name">{{ episode.file?.name || '已上传视频' }}</span>
                    <span class="video-duration" v-if="episode.duration">{{ formatDuration(episode.duration) }}</span>
                  </div>
                  <div class="video-actions">
                    <button class="video-action-btn" @click="triggerVideoUpload(getOriginalIndex(index))" title="重新上传">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 2v6h-6"/>
                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                        <path d="M3 22v-6h6"/>
                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                      </svg>
                      重新上传
                    </button>
                    <button class="video-action-btn danger" @click="clearVideo(getOriginalIndex(index))" title="移除视频">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      移除
                    </button>
                  </div>
                </div>
                <div v-else class="video-upload-zone" @click="triggerVideoUpload(getOriginalIndex(index))">
                  <input 
                    :ref="el => setVideoInputRef(el, getOriginalIndex(index))"
                    type="file" 
                    accept="video/*" 
                    style="display: none" 
                    @change="e => handleVideoChange(e, getOriginalIndex(index))"
                  />
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>点击上传视频</span>
                </div>
                <div v-if="episode.uploading" class="upload-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: episode.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ episode.progress }}%</span>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <div v-show="currentStep === 2" class="step-content fade-in">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          确认投稿
        </h2>

        <div class="confirm-section">
          <div class="confirm-notice">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>请仔细检查投稿信息，提交后将进入审核流程</span>
          </div>
          <div class="confirm-card">
            <div class="confirm-item">
              <span class="confirm-label">视频标题</span>
              <span class="confirm-value">{{ form.title || '未填写' }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">视频分类</span>
              <span class="confirm-value">{{ selectedCategoryName || '未选择' }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">连载状态</span>
              <span class="confirm-value">{{ form.isFinished ? '已完结' : '连载中' }}</span>
            </div>
            <div class="confirm-item" v-if="form.tags.length">
              <span class="confirm-label">视频标签</span>
              <div class="confirm-tags">
                <span v-for="tag in form.tags" :key="tag" class="confirm-tag">{{ tag }}</span>
              </div>
            </div>
            <div class="confirm-item" v-if="form.description">
              <span class="confirm-label">视频简介</span>
              <span class="confirm-value">{{ form.description }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">剧集数量</span>
              <span class="confirm-value">{{ episodes.length }} 个剧集</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <div class="actions-left">
        <button v-if="editingVideoUid" class="action-btn action-btn--outline" @click="$emit('cancel-edit')">
          取消编辑
        </button>
      </div>
      <div class="actions-right">
        <button 
          v-if="currentStep > 0" 
          class="action-btn action-btn--outline" 
          @click="prevStep"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          上一步
        </button>
        <button 
          v-if="!editingVideoUid"
          class="action-btn action-btn--save" 
          :disabled="submitting || saving"
          @click="saveDraft"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          {{ saving ? '保存中...' : '暂存草稿' }}
        </button>
        <button 
          v-if="currentStep < 2" 
          class="action-btn action-btn--primary" 
          :disabled="!canNextStep"
          @click="nextStep"
        >
          下一步
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <button 
          v-else 
          class="action-btn action-btn--submit" 
          :disabled="!canSubmit || submitting" 
          @click="handleSubmit"
        >
          <svg v-if="!submitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13"/>
            <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
          <span v-else class="spinner"></span>
          {{ submitting ? '投稿中...' : '提交投稿' }}
        </button>
      </div>
    </div>
  </div>

  <!-- 视频截取封面弹窗 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showCaptureDialog" class="capture-overlay" @click.self="cancelCapture">
        <Transition name="modal-content" appear>
          <div v-if="showCaptureDialog" class="capture-dialog">
            <div class="capture-header">
              <h3 class="capture-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                截取封面帧
              </h3>
              <button class="capture-close" @click="cancelCapture">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div class="capture-body">
              <div class="capture-video-container">
                <video 
                  ref="captureVideoRef"
                  :src="captureVideoUrl" 
                  class="capture-video" 
                  controls
                  @loadedmetadata="onCaptureVideoLoaded"
                ></video>
                <canvas ref="captureCanvasRef" class="capture-canvas"></canvas>
              </div>
              <div class="capture-hint">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                拖动视频进度条选择满意的画面，然后点击下方按钮截取当前帧作为封面
              </div>
            </div>
            <div class="capture-footer">
              <button class="capture-btn capture-btn--ghost" @click="cancelCapture">取消</button>
              <button class="capture-btn capture-btn--primary" @click="confirmCapture">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                截取当前帧
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { getCategoryList } from '../../api/category'
import { uploadFile } from '../../utils/fileUpload'
import { submitVideo, updateVideo, getVideoDetailByUid, saveDraft as saveDraftApi, getDraft, deleteDraft } from '../../api/video'
import { ElMessage } from 'element-plus'
import { formatDuration } from '../../utils/format'

const props = defineProps({
  editVideoUid: { type: String, default: '' },
  addingEpisodeMode: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel-edit', 'capture-cover', 'submitted'])

const steps = ['基本信息', '剧集管理', '确认投稿']
const currentStep = ref(0)

const categories = ref([])
const form = ref({
  title: '',
  categoryId: '',
  description: '',
  isFinished: false,
  tags: []
})
const tagInput = ref('')
const maxTagLength = 10
const coverFile = ref(null)
const coverPreview = ref('')
const coverInput = ref(null)
const videoInputs = ref({})
let episodeIdCounter = 1

function createEpisode() {
  return {
    id: episodeIdCounter++,
    title: '',
    file: null,
    videoPreviewUrl: '',
    duration: 0,
    uploading: false,
    progress: 0
  }
}

const episodes = ref([createEpisode()])
const submitting = ref(false)
const saving = ref(false)
const editingVideoUid = ref(props.editVideoUid)

const reversedEpisodes = computed(() => [...episodes.value].reverse())
const getOriginalIndex = (reversedIndex) => episodes.value.length - 1 - reversedIndex

const canNextStep = computed(() => {
  if (currentStep.value === 0) {
    return form.value.title.trim() && form.value.categoryId
  }
  if (currentStep.value === 1) {
    return episodes.value.some(ep => ep.file || (editingVideoUid.value && ep.videoPreviewUrl))
  }
  return true
})

const canSubmit = computed(() => {
  return form.value.title.trim() && 
         form.value.categoryId && 
         episodes.value.some(ep => ep.file || (editingVideoUid.value && ep.videoPreviewUrl))
})

const selectedCategoryName = computed(() => {
  const cat = categories.value.find(c => c.id === form.value.categoryId)
  return cat?.name || ''
})

watch(() => props.editVideoUid, (val) => {
  editingVideoUid.value = val
  if (val) loadEditData(val)
})

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
  if (coverPreview.value && coverPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(coverPreview.value)
  }
  episodes.value.forEach(ep => {
    if (ep.videoPreviewUrl && ep.videoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(ep.videoPreviewUrl)
    }
  })
})

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
      if (res.coverUrl) {
        coverPreview.value = res.coverUrl
      }
      if (res.episodes && res.episodes.length > 0) {
        episodes.value = res.episodes.map((ep, index) => ({
          id: ep.id || index + 1,
          serverId: ep.id,
          title: ep.title || '',
          file: null,
          videoPreviewUrl: ep.playUrl || '',
          duration: ep.duration || 0,
          uploading: false,
          progress: 0
        }))
      } else {
        episodes.value = [createEpisode()]
      }
      currentStep.value = 0
    }
  } catch (e) {
    console.error('获取视频详情失败:', e)
    ElMessage.error('获取视频详情失败')
  }
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && tag.length <= maxTagLength && !form.value.tags.includes(tag) && form.value.tags.length < 10) {
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

const removeEpisode = (index) => {
  if (episodes.value.length > 1) {
    const ep = episodes.value[index]
    if (ep.videoPreviewUrl && ep.videoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(ep.videoPreviewUrl)
    }
    episodes.value.splice(index, 1)
  }
}

const triggerCoverUpload = () => {
  coverInput.value.click()
}

const handleCoverChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    coverFile.value = file
    coverPreview.value = URL.createObjectURL(file)
  }
}

const setVideoInputRef = (el, index) => {
  if (el) {
    videoInputs.value[index] = el
  }
}

const triggerVideoUpload = (index) => {
  videoInputs.value[index]?.click()
}

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
  ep.progress = 0
  ep.uploading = false
}

const handleVideoChange = (e, index) => {
  const file = e.target.files[0]
  if (file) {
    episodes.value[index].file = file
    episodes.value[index].title = file.name.replace(/\.[^/.]+$/, '')
    if (episodes.value[index].videoPreviewUrl) {
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

const getDraftData = () => {
  return {
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
        duration: ep.duration
      })),
    step: currentStep.value
  }
}

const saveDraft = async () => {
  if (saving.value) return
  saving.value = true
  
  try {
    const draftData = getDraftData()
    await saveDraftApi(draftData)
    ElMessage.success('草稿已保存')
  } catch (e) {
    console.error('保存草稿失败:', e)
    ElMessage.error('保存草稿失败')
  } finally {
    saving.value = false
  }
}

const loadDraftIfNeeded = async () => {
  try {
    const res = await getDraft()
    if (!res) return
    
    currentStep.value = res.step || 0
    form.value = {
      title: res.title || '',
      categoryId: res.categoryId || '',
      description: res.description || '',
      isFinished: !res.isOngoing,
      tags: res.tags || []
    }
    if (res.coverUrl) {
      coverPreview.value = res.coverUrl
    }
    if (res.episodes && res.episodes.length > 0) {
      episodes.value = res.episodes.map(ep => ({
        ...createEpisode(),
        title: ep.title,
        videoPreviewUrl: ep.playUrl,
        duration: ep.duration
      }))
      episodeIdCounter = episodes.value.length + 1
    }
  } catch (e) {
    console.error('恢复草稿失败:', e)
  }
}

const clearDraft = async () => {
  try {
    await deleteDraft()
  } catch (e) {
    console.error('删除草稿失败:', e)
  }
}

const nextStep = () => {
  if (canNextStep.value && currentStep.value < 2) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true

  try {
    let coverUrl = ''
    if (coverFile.value) {
      coverUrl = await uploadFile(coverFile.value, (progress) => {
        console.log('封面上传进度:', progress)
      }, 'image')
    } else if (coverPreview.value && !coverPreview.value.startsWith('blob:')) {
      coverUrl = coverPreview.value
    }

    const episodeData = []
    for (const ep of episodes.value) {
      if (ep.file) {
        const playUrl = await uploadFile(ep.file, (progress) => {
          ep.progress = progress
        }, 'video')
        episodeData.push({
          title: ep.title,
          playUrl,
          duration: ep.duration
        })
      } else if (ep.serverId) {
        episodeData.push({
          id: ep.serverId,
          title: ep.title,
          playUrl: ep.videoPreviewUrl,
          duration: ep.duration
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
      ElMessage.success('视频更新成功')
    } else {
      await submitVideo(videoData)
      ElMessage.success('投稿成功')
      clearDraft()
    }

    resetForm()
    emit('submitted')
  } catch (e) {
    console.error('投稿失败:', e)
    ElMessage.error('投稿失败: ' + (e.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

const captureCoverFromVideo = () => {
  const videoEp = episodes.value.find(ep => ep.videoPreviewUrl)
  if (!videoEp) {
    ElMessage.warning('请先上传视频')
    return
  }
  showCaptureDialog.value = true
  captureVideoUrl.value = videoEp.videoPreviewUrl
}

const captureVideoUrl = ref('')
const showCaptureDialog = ref(false)
const captureVideoRef = ref(null)

const onCaptureVideoLoaded = () => {
  // 视频加载完成
}

const confirmCapture = () => {
  if (captureVideoRef.value) {
    const video = captureVideoRef.value
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    canvas.toBlob((blob) => {
      if (blob) {
        if (coverFile.value && coverPreview.value.startsWith('blob:')) {
          URL.revokeObjectURL(coverPreview.value)
        }
        const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' })
        coverFile.value = file
        coverPreview.value = URL.createObjectURL(file)
        ElMessage.success('封面截取成功')
        showCaptureDialog.value = false
      }
    }, 'image/jpeg', 0.9)
  }
}

const cancelCapture = () => {
  showCaptureDialog.value = false
}

// 拖拽排序相关
const dragState = ref({
  dragging: false,
  draggedIndex: null,
  draggedOverIndex: null
})

const handleDragStart = (index, event) => {
  dragState.value.dragging = true
  dragState.value.draggedIndex = index
  event.dataTransfer.effectAllowed = 'move'
  event.target.classList.add('dragging')
}

const handleDragOver = (index, event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  dragState.value.draggedOverIndex = index
}

const handleDragLeave = () => {
  dragState.value.draggedOverIndex = null
}

const handleDrop = (index, event) => {
  event.preventDefault()
  const fromIndex = dragState.value.draggedIndex
  const toIndex = index
  
  if (fromIndex !== null && fromIndex !== toIndex) {
    const item = episodes.value.splice(fromIndex, 1)[0]
    episodes.value.splice(toIndex, 0, item)
  }
  
  dragState.value.dragging = false
  dragState.value.draggedIndex = null
  dragState.value.draggedOverIndex = null
}

const handleDragEnd = () => {
  dragState.value.dragging = false
  dragState.value.draggedIndex = null
  dragState.value.draggedOverIndex = null
}

const resetForm = () => {
  editingVideoUid.value = ''
  form.value = { title: '', categoryId: '', description: '', isFinished: false, tags: [] }
  coverFile.value = null
  coverPreview.value = ''
  episodes.value = [createEpisode()]
  currentStep.value = 0
}

defineExpose({ resetForm, captureCoverFromVideo })
</script>

<style scoped>
.submit-form {
  animation: fadeIn 0.4s ease;
}

.edit-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 20px;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  color: #e6a23c;
  font-size: 14px;
}

.edit-notice strong {
  color: #d48806;
}

.notice-close {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: #e6a23c;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.notice-close:hover {
  background: rgba(255, 152, 0, 0.2);
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 32px;
  padding: 24px;
  background: var(--bg1);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  background: var(--bg3);
  color: var(--text4);
  transition: all 0.3s ease;
}

.step-item.active .step-dot {
  background: var(--brand_pink);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 102, 153, 0.4);
}

.step-item.completed .step-dot {
  background: #00b578;
  color: #fff;
}

.step-label {
  font-size: 14px;
  color: var(--text3);
  font-weight: 500;
}

.step-item.active .step-label {
  color: var(--text1);
  font-weight: 600;
}

.step-item.completed .step-label {
  color: var(--text2);
}

.step-line {
  width: 60px;
  height: 2px;
  background: var(--bg3);
  margin: 0 16px;
  transition: background 0.3s ease;
}

.step-item.completed + .step-item .step-line,
.step-item.completed .step-line {
  background: #00b578;
}

.form-card {
  background: var(--bg1);
  border-radius: 12px;
  padding: 32px;
  box-shadow: var(--shadow-sm);
  min-height: 400px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text1);
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line_light);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
  margin-bottom: 8px;
}

.required {
  color: var(--brand_pink);
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--line_regular);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text1);
  background: var(--bg1);
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--brand_pink);
  box-shadow: 0 0 0 3px rgba(255, 102, 153, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text4);
}

.char-count {
  position: absolute;
  right: 12px;
  bottom: 12px;
  font-size: 12px;
  color: var(--text4);
}

.select-wrapper {
  position: relative;
}

.form-select {
  appearance: none;
  padding-right: 40px;
  cursor: pointer;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text3);
  pointer-events: none;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.radio-group {
  display: flex;
  gap: 12px;
}

.radio-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border: 1.5px solid var(--line_regular);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-item:hover {
  border-color: var(--brand_pink);
}

.radio-item.active {
  border-color: var(--brand_pink);
  background: rgba(255, 102, 153, 0.05);
}

.radio-item input {
  display: none;
}

.radio-dot {
  display: none;
}

.radio-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
}

.radio-hint {
  font-size: 12px;
  color: var(--text3);
}

.tags-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px;
  border: 1.5px solid var(--line_regular);
  border-radius: 8px;
  min-height: 44px;
  transition: all 0.2s ease;
}

.tags-list:focus-within {
  border-color: var(--brand_pink);
  box-shadow: 0 0 0 3px rgba(255, 102, 153, 0.1);
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(255, 102, 153, 0.1);
  color: var(--brand_pink);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  color: var(--brand_pink);
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.tag-remove:hover {
  opacity: 1;
}

.tag-input {
  flex: 1;
  min-width: 100px;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--text1);
  background: transparent;
}

.tag-input::placeholder {
  color: var(--text4);
}

.tags-hint {
  font-size: 12px;
  color: var(--text4);
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text4);
}

.cover-section {
  margin-bottom: 24px;
}

.cover-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cover-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text1);
}

.cover-section-hint {
  font-size: 12px;
  color: var(--text4);
}

.cover-upload-area {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.cover-upload {
  width: 200px;
  height: 112px;
  border: 2px dashed var(--line_regular);
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.cover-upload:hover {
  border-color: var(--brand_pink);
}

.cover-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.cover-upload:hover .cover-overlay {
  opacity: 1;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text4);
}

.upload-text {
  font-size: 13px;
}

.capture-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1.5px solid var(--line_regular);
  border-radius: 8px;
  background: var(--bg1);
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.capture-btn:hover {
  border-color: var(--brand_pink);
  color: var(--brand_pink);
}

.episodes-list {
  margin-top: 24px;
}

.episodes-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.episodes-count {
  font-size: 14px;
  color: var(--text3);
}

.add-episode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1.5px dashed var(--brand_pink);
  border-radius: 8px;
  background: transparent;
  color: var(--brand_pink);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-episode-btn:hover {
  background: rgba(255, 102, 153, 0.05);
}

.episodes-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  margin-bottom: 16px;
  background: rgba(0, 174, 236, 0.08);
  border-radius: 8px;
  font-size: 13px;
  color: var(--brand_blue);
}

.episodes-hint svg {
  flex-shrink: 0;
}

.episode-card {
  background: var(--bg2);
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
  animation: slideInUp 0.3s ease forwards;
  animation-delay: calc(var(--index) * 0.05s);
  opacity: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  cursor: default;
}

.episode-card.dragging {
  opacity: 0.5;
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.episode-card.drag-over {
  border-top: 3px solid var(--brand_pink);
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--text4);
  cursor: grab;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.drag-handle:hover {
  color: var(--text2);
}

.drag-handle:active {
  cursor: grabbing;
}

.episode-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line_light);
}

.episode-badge {
  flex-shrink: 0;
}

.episode-index {
  display: inline-block;
  padding: 4px 10px;
  background: var(--brand_pink);
  color: #fff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.episode-title-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text1);
  outline: none;
}

.episode-title-input::placeholder {
  color: var(--text4);
}

.episode-delete-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text4);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.episode-delete-btn:hover {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.episode-card-body {
  padding: 16px;
}

.video-preview {
  position: relative;
}

.preview-video {
  width: 100%;
  max-height: 200px;
  border-radius: 8px;
  background: #000;
}

.video-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.video-name {
  font-size: 13px;
  color: var(--text2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.video-duration {
  font-size: 12px;
  color: var(--text3);
}

.video-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.video-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  background: var(--bg1);
  color: var(--text2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.video-action-btn:hover {
  border-color: var(--brand_pink);
  color: var(--brand_pink);
}

.video-action-btn.danger:hover {
  border-color: #f56c6c;
  color: #f56c6c;
}

.video-upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  border: 2px dashed var(--line_regular);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text4);
  transition: all 0.2s ease;
}

.video-upload-zone:hover {
  border-color: var(--brand_pink);
  color: var(--brand_pink);
}

.video-upload-zone span {
  font-size: 13px;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand_pink) 0%, #ff8cb0 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--text3);
  min-width: 40px;
  text-align: right;
}

.confirm-section {
  max-width: 600px;
}

.confirm-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  color: #e6a23c;
  font-size: 14px;
}

.confirm-card {
  background: var(--bg2);
  border-radius: 10px;
  padding: 20px;
}

.confirm-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid var(--line_light);
}

.confirm-item:last-child {
  border-bottom: none;
}

.confirm-label {
  width: 80px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--text3);
}

.confirm-value {
  font-size: 14px;
  color: var(--text1);
  word-break: break-all;
}

.confirm-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.confirm-tag {
  padding: 2px 10px;
  background: rgba(255, 102, 153, 0.1);
  color: var(--brand_pink);
  border-radius: 4px;
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding: 20px 0;
}

.actions-left,
.actions-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-btn--outline {
  background: var(--bg1);
  border: 1.5px solid var(--line_regular);
  color: var(--text2);
}

.action-btn--outline:hover {
  border-color: var(--brand_pink);
  color: var(--brand_pink);
}

.action-btn--primary {
  background: linear-gradient(135deg, var(--brand_pink) 0%, #ff8cb0 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 102, 153, 0.3);
}

.action-btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 102, 153, 0.4);
}

.action-btn--submit {
  background: linear-gradient(135deg, #00b578 0%, #00d68f 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 181, 120, 0.3);
}

.action-btn--submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 181, 120, 0.4);
}

.action-btn--save {
  background: var(--bg1);
  border: 1.5px solid var(--brand_blue);
  color: var(--brand_blue);
}

.action-btn--save:hover:not(:disabled) {
  background: rgba(0, 174, 236, 0.08);
  transform: translateY(-1px);
}

.action-btn--draft {
  background: rgba(0, 174, 236, 0.08);
  border: 1.5px solid var(--brand_blue);
  color: var(--brand_blue);
}

.action-btn--draft:hover {
  background: rgba(0, 174, 236, 0.15);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 视频截取封面弹窗样式 */
.capture-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.capture-dialog {
  width: 700px;
  max-width: 90vw;
  max-height: 90vh;
  background: var(--bg1);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.capture-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--line_light);
}

.capture-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text1);
  margin: 0;
}

.capture-title svg {
  color: var(--brand_pink);
}

.capture-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text4);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.capture-close:hover {
  background: var(--bg2);
  color: var(--text1);
}

.capture-body {
  padding: 24px;
  overflow-y: auto;
}

.capture-video-container {
  position: relative;
  margin-bottom: 20px;
}

.capture-video {
  width: 100%;
  max-height: 300px;
  border-radius: 8px;
  background: #000;
}

.capture-canvas {
  display: none;
}

.capture-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-top: 16px;
  background: rgba(0, 174, 236, 0.08);
  border-radius: 8px;
  font-size: 13px;
  color: var(--brand_blue);
}

.capture-hint svg {
  flex-shrink: 0;
}

.capture-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--line_light);
}

.capture-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.capture-btn--ghost {
  background: var(--bg2);
  color: var(--text2);
}

.capture-btn--ghost:hover {
  background: var(--bg3);
}

.capture-btn--primary {
  background: var(--brand_pink);
  color: #fff;
}

.capture-btn--primary:hover {
  background: var(--brand_pink_hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 102, 153, 0.3);
}

/* Modal动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-content-leave-active {
  transition: all 0.2s ease;
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-in {
  animation: fadeIn 0.3s ease;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .step-indicator {
    flex-direction: column;
    gap: 12px;
  }
  
  .step-line {
    width: 2px;
    height: 20px;
    margin: 0;
  }
  
  .cover-upload-area {
    flex-direction: column;
  }
  
  .cover-upload {
    width: 100%;
  }
}
</style>
