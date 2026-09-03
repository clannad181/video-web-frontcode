import request from '../api/request'
import { ElMessage } from 'element-plus'
import md5 from 'md5'

const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB分片大小

/**
 * 格式化播放时长
 * @param {number} seconds
 * @returns {string}
 */
export const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化数量（万）
 * @param {number} count
 * @returns {string}
 */
export const formatCount = (count) => {
  if (!count) return '0'
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

/**
 * 格式化日期
 * @param {string|number} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 计算文件MD5（使用SparkMD5）
 * @param {File} file
 * @param {Function} onProgress
 * @returns {Promise<string>}
 */
export const calculateFileMD5 = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const chunks = Math.ceil(file.size / CHUNK_SIZE)
    let currentChunk = 0
    const fileReader = new FileReader()
    const spark = { append: function() {}, end: function() { return '' } }
    const results = []

    fileReader.onload = (e) => {
      results.push(e.target.result)
      currentChunk++
      if (onProgress) {
        onProgress(Math.round((currentChunk / chunks) * 100))
      }
      if (currentChunk < chunks) {
        loadNext()
      } else {
        const allData = new Uint8Array(results.reduce((acc, buf) => acc + buf.byteLength, 0))
        let offset = 0
        for (const buf of results) {
          allData.set(new Uint8Array(buf), offset)
          offset += buf.byteLength
        }
        const hash = md5(Array.from(allData).map(b => String.fromCharCode(b)).join(''))
        resolve(hash)
      }
    }

    fileReader.onerror = reject

    const loadNext = () => {
      const start = currentChunk * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      fileReader.readAsArrayBuffer(file.slice(start, end))
    }

    loadNext()
  })
}

/**
 * 文件预检查（秒传）
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export const checkFile = (params) => {
  return request.post('/file/check', params)
}

/**
 * 上传分片
 * @param {Object} params
 * @returns {Promise<string>}
 */
export const uploadChunk = (params) => {
  const { fileMd5, chunkIndex, file } = params
  const formData = new FormData()
  formData.append('fileMd5', fileMd5)
  formData.append('chunkIndex', chunkIndex)
  formData.append('file', file)
  return request.post('/file/chunk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 合并分片
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export const mergeChunks = (params) => {
  return request.post('/file/merge', params)
}

/**
 * 小文件直传
 * @param {File} file
 * @param {String} category
 * @returns {Promise<Object>}
 */
export const uploadSmallFile = (file, category = 'image') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)
  return request.post('/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 大文件分片上传
 * @param {File} file
 * @param {Function} onProgress - 进度回调 (percent: number) => void
 * @returns {Promise<Object>}
 */
export const uploadLargeFile = async (file, onProgress) => {
  const fileMd5 = await calculateFileMD5(file, (md5Progress) => {
    if (onProgress) onProgress(md5Progress * 0.3) // MD5计算占30%
  })

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

  // 预检查
  const checkResult = await checkFile({
    fileMd5,
    fileName: file.name,
    fileSize: file.size,
    totalChunks,
    chunkSize: CHUNK_SIZE
  })

  // 秒传成功
  if (checkResult.exist) {
    if (onProgress) onProgress(100)
    return checkResult.file
  }

  // 获取已上传的分片，跳过已上传的
  const uploadedChunks = checkResult.uploadedChunks || []
  const serverChunkSize = checkResult.chunkSize || CHUNK_SIZE

  // 上传剩余分片
  for (let i = 0; i < totalChunks; i++) {
    if (uploadedChunks.includes(i)) continue

    const start = i * serverChunkSize
    const end = Math.min(start + serverChunkSize, file.size)
    const chunk = file.slice(start, end)

    await uploadChunk({
      fileMd5,
      chunkIndex: i,
      file: chunk
    })

    // 进度回调（70%用于分片上传）
    if (onProgress) {
      const uploadProgress = Math.round(((i + 1) / totalChunks) * 70)
      onProgress(30 + uploadProgress)
    }
  }

  // 合并分片
  const result = await mergeChunks({ fileMd5 })

  if (onProgress) onProgress(100)
  return result
}

/**
 * 统一上传入口：根据文件大小自动选择直传或分片上传
 * @param {File} file
 * @param {Function} onProgress
 * @returns {Promise<Object>}
 */
export const uploadFile = async (file, onProgress) => {
  // 小于5MB直接上传
  if (file.size <= CHUNK_SIZE) {
    if (onProgress) onProgress(50)
    const result = await uploadSmallFile(file, 'image')
    if (onProgress) onProgress(100)
    return result
  }

  // 大于5MB分片上传
  return await uploadLargeFile(file, onProgress)
}
