import SparkMD5 from 'spark-md5'
import { checkFile, uploadChunk, mergeChunks, uploadFile as apiUploadFile } from '@/api/file'
import i18n from '@/locales'

const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB
const DIRECT_UPLOAD_THRESHOLD = 5 * 1024 * 1024
const MAX_RETRY = 3

/**
 * 计算文件 MD5（SparkMD5，2MB 步进读取）
 */
export function calculateFileHash(file) {
  return new Promise((resolve, reject) => {
    const chunkSize = 2 * 1024 * 1024
    const chunks = Math.ceil(file.size / chunkSize)
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    let currentChunk = 0

    reader.onload = (e) => {
      spark.append(e.target.result)
      currentChunk++
      if (currentChunk < chunks) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }

    reader.onerror = () => reject(new Error(i18n.global.t('文件读取失败')))

    function loadNext() {
      const start = currentChunk * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      reader.readAsArrayBuffer(file.slice(start, end))
    }

    loadNext()
  })
}

/**
 * 根据文件 MIME 类型推断分类
 */
export function getCategoryByMime(file) {
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('audio/')) return 'audio'
  return 'document'
}

/**
 * URL 归一化：相对路径补 /api 前缀
 */
export function normalizeUrl(url) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('/api')) return url
  return `/api${url}`
}

/**
 * 探测视频时长
 */
export function probeVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const duration = video.duration
      URL.revokeObjectURL(video.src)
      resolve(isFinite(duration) ? duration : null)
    }
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      resolve(null)
    }
    video.src = URL.createObjectURL(file)
  })
}

/**
 * 带指数退避的重试执行器
 */
async function retryExecute(fn, maxRetries = MAX_RETRY) {
  let lastError
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 500
        await new Promise(r => setTimeout(r, delay))
      }
    }
  }
  throw lastError
}

/**
 * 小文件直传（≤5MB）
 */
async function directUpload(file, category, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)

  const res = await apiUploadFile(formData, {
    timeout: 60000,
    onUploadProgress: (e) => {
      if (e.total && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
  })

  return normalizeUrl(res.data?.url || res.data?.path || '')
}

/**
 * 大文件分片上传（>5MB）
 */
async function chunkedUpload(file, category, onProgress) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  onProgress && onProgress(0)

  // 1. 计算文件哈希
  const fileMd5 = await calculateFileHash(file)

  // 2. 检查文件（秒传/断点续传）
  const checkRes = await checkFileUpload({
    fileMd5,
    fileName: file.name,
    fileSize: file.size,
    totalChunks,
    chunkSize: CHUNK_SIZE,
    category
  })

  if (checkRes.exist && checkRes.file?.url) {
    onProgress && onProgress(100)
    return normalizeUrl(checkRes.file.url)
  }

  const uploadedChunks = checkRes.uploadedChunks || []

  // 3. 逐片上传（跳过已传分片）
  for (let i = 0; i < totalChunks; i++) {
    if (uploadedChunks.includes(i)) {
      onProgress && onProgress(Math.round(((i + 1) / totalChunks) * 100))
      continue
    }

    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)

    await retryExecute(() => uploadSingleChunk(fileMd5, i, chunk))

    onProgress && onProgress(Math.round(((i + 1) / totalChunks) * 100))
  }

  // 4. 合并分片
  const mergeRes = await mergeChunks({ fileMd5 })
  const url = mergeRes.data?.url || mergeRes.data?.path || ''

  return normalizeUrl(url)
}

/**
 * 上传单个分片（带重试）
 */
async function uploadSingleChunk(fileMd5, chunkIndex, chunkBlob) {
  const formData = new FormData()
  formData.append('fileMd5', fileMd5)
  formData.append('chunkIndex', String(chunkIndex))
  formData.append('file', chunkBlob)

  return await uploadChunk(formData, { timeout: 60000 })
}

/**
 * 检查文件（秒传/断点续传）
 */
async function checkFileUpload(params) {
  const res = await checkFile(params)
  return {
    exist: res.data?.exist || false,
    file: res.data?.file || null,
    uploadedChunks: res.data?.uploadedChunks || []
  }
}

/**
 * 统一文件上传入口
 * @param {File} file - 文件对象
 * @param {Object} options
 * @param {string} options.category - 分类（document/image/video/audio），为空自动推断
 * @param {Function} options.onProgress - 进度回调
 * @returns {Promise<{name: string, url: string, size: number, duration: number|null}>}
 */
export async function uploadFile(file, options = {}) {
  const category = options.category || getCategoryByMime(file)
  const onProgress = options.onProgress || null

  let url
  if (file.size <= DIRECT_UPLOAD_THRESHOLD) {
    url = await directUpload(file, category, onProgress)
  } else {
    url = await chunkedUpload(file, category, onProgress)
  }

  // 视频探测时长
  let duration = null
  if (category === 'video' || file.type.startsWith('video/')) {
    duration = await probeVideoDuration(file)
  }

  return {
    name: file.name,
    url,
    size: file.size,
    duration
  }
}
