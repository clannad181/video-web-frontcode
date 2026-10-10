<template>
  <div
    class="file-upload"
    :class="{ 'is-dragover': isDragover, 'is-disabled': uploading }"
    @dragover.prevent="isDragover = true"
    @dragleave="isDragover = false"
    @drop.prevent="handleDrop"
  >
    <!-- 无值：上传区 -->
    <div v-if="!displayValue" class="upload-zone" @click="triggerFileInput">
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        class="file-input"
        @change="handleFileChange"
      />
      <div class="upload-icon">
        <el-icon :size="48" color="var(--color-primary)"><Upload /></el-icon>
      </div>
      <div class="upload-text">{{ $t('点击或拖拽文件到此处') }}</div>
      <div class="upload-hint">{{ $t('支持大文件自动分片上传') }}</div>
      <div v-if="uploading" class="upload-progress-overlay">
        <el-progress
          :percentage="progress"
          :stroke-width="8"
          :format="() => `${progress}%`"
        />
        <div class="upload-progress-text">{{ $t('上传中 {progress}%', { progress }) }}</div>
      </div>
    </div>

    <!-- 有值：预览区 -->
    <div v-else class="preview-zone">
      <!-- 视频预览 -->
      <div v-if="isVideo" class="video-preview">
        <video
          :src="previewSrc"
          controls
          class="video-player"
          preload="metadata"
        />
      </div>

      <!-- 图片预览 -->
      <div v-else-if="isImage" class="image-preview" @click="$emit('preview', previewSrc)">
        <img :src="previewSrc" class="preview-img" />
      </div>

      <!-- 其他文件 -->
      <div v-else class="file-preview">
        <el-icon :size="40" color="var(--color-primary)"><Document /></el-icon>
      </div>

      <!-- 文件信息 -->
      <div class="file-info">
        <span class="file-name">{{ fileName }}</span>
        <span v-if="fileSizeText" class="file-size">{{ fileSizeText }}</span>
      </div>

      <!-- 移除按钮 -->
      <el-icon class="remove-btn" @click.stop="handleRemove"><Close /></el-icon>
    </div>

    <!-- 上传中（有值时也可能在上传） -->
    <div v-if="uploading && displayValue" class="upload-progress-bar">
      <el-progress :percentage="progress" :stroke-width="6" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Upload, Document, Close } from '@element-plus/icons-vue'
import { uploadFile, probeVideoDuration } from '@/utils/upload'
import { formatFileSize } from '@/utils/format'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: [Object, String, null], default: null },
  accept: { type: String, default: '*' },
  category: { type: String, default: '' },
  maxSize: { type: Number, default: 0 }
})

const emit = defineEmits(['update:modelValue', 'success', 'error', 'preview'])

const fileInputRef = ref(null)
const isDragover = ref(false)
const uploading = ref(false)
const progress = ref(0)

// 视频扩展名和图片扩展名
const VIDEO_EXTS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm3u8']
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']

// 文件扩展名
const fileExt = computed(() => {
  const name = displayValue.value?.name || displayValue.value || ''
  const ext = String(name).split('.').pop()?.toLowerCase() || ''
  return ext
})

// 是否为视频
const isVideo = computed(() => {
  if (displayValue.value?.type?.startsWith('video/')) return true
  return VIDEO_EXTS.includes(fileExt.value)
})

// 是否为图片
const isImage = computed(() => {
  if (displayValue.value?.type?.startsWith('image/')) return true
  return IMAGE_EXTS.includes(fileExt.value)
})

// 显示值：归一化为对象或 null
const displayValue = computed(() => {
  const val = props.modelValue
  if (!val) return null
  if (typeof val === 'string') {
    return { name: val.split('/').pop(), url: val, size: 0 }
  }
  return val
})

// 预览 URL
const previewSrc = computed(() => {
  return displayValue.value?.url || displayValue.value || ''
})

// 文件名
const fileName = computed(() => {
  const val = displayValue.value
  if (!val) return ''
  return val.name || val.url?.split('/').pop() || t('未知文件')
})

// 文件大小文本
const fileSizeText = computed(() => {
  const size = displayValue.value?.size
  if (!size) return ''
  return formatFileSize(size)
})

// 触发文件选择
function triggerFileInput() {
  if (uploading.value) return
  fileInputRef.value?.click()
}

// 文件选择变更
function handleFileChange(e) {
  const file = e.target.files[0]
  if (file) processFile(file)
  e.target.value = ''
}

// 拖拽放下
function handleDrop(e) {
  isDragover.value = false
  const file = e.dataTransfer.files[0]
  if (file) processFile(file)
}

// 处理文件
async function processFile(file) {
  // 校验文件类型
  if (props.accept !== '*') {
    const acceptList = props.accept.split(',').map(s => s.trim().toLowerCase())
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    const matched = acceptList.some(a => {
      if (a.startsWith('.')) return ext === a
      if (a.endsWith('/*')) return file.type.startsWith(a.replace('/*', '/'))
      return file.type === a
    })
    if (!matched) {
      ElMessage.error(t('文件类型不匹配'))
      return
    }
  }

  // 校验文件大小
  if (props.maxSize > 0 && file.size > props.maxSize) {
    ElMessage.error(t('文件大小不能超过 {size}', { size: formatFileSize(props.maxSize) }))
    return
  }

  // 开始上传
  uploading.value = true
  progress.value = 0

  try {
    // 视频探测时长
    let duration = null
    if (file.type.startsWith('video/')) {
      duration = await probeVideoDuration(file)
    }

    const result = await uploadFile(file, {
      category: props.category,
      onProgress: (p) => { progress.value = p }
    })

    // 归一化结果
    const fileData = {
      name: result.name,
      url: result.url,
      size: result.size,
      duration: result.duration ?? duration
    }

    emit('update:modelValue', fileData)
    emit('success', fileData)
    ElMessage.success(t('文件上传成功'))
  } catch (err) {
    ElMessage.error(err.message || t('文件上传失败'))
    emit('error', err)
  } finally {
    uploading.value = false
    progress.value = 0
  }
}

// 移除文件
function handleRemove() {
  emit('update:modelValue', null)
  emit('success', null)
}
</script>

<style lang="scss" scoped>
.file-upload {
  position: relative;
  display: inline-block;
}

.file-input {
  display: none;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 140px;
  border: 2px dashed var(--border-color, #dcdfe6);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s;
  padding: 24px;

  &:hover,
  &.is-dragover {
    border-color: var(--color-primary, #fb7299);
    background: rgba(251, 114, 153, 0.04);
  }

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.upload-icon {
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  color: var(--text-primary, #303133);
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

.upload-progress-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 24px;

  .el-progress {
    width: 80%;
  }
}

.upload-progress-text {
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-primary, #fb7299);
  font-weight: 500;
}

// 预览区
.preview-zone {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 8px;
  position: relative;
  background: var(--card-bg, #fff);
}

.video-preview {
  flex-shrink: 0;
  width: 240px;
  height: 135px;
  border-radius: 6px;
  overflow: hidden;
  background: #000;

  .video-player {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.image-preview {
  flex-shrink: 0;
  width: 128px;
  height: 128px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.file-preview {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(251, 114, 153, 0.06);
  border-radius: 8px;
}

.file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .file-name {
    font-size: 14px;
    color: var(--text-primary, #303133);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-size {
    font-size: 12px;
    color: var(--text-secondary, #909399);
  }
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.6);
  }
}

.upload-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 12px 8px;
}
</style>
