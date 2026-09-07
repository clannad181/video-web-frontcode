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
 * 计算文件MD5
 * @param {File} file
 * @param {Function} onProgress - 进度回调 0-100
 * @returns {Promise<string>}
 */
export const calculateFileMD5 = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const chunks = Math.ceil(file.size / CHUNK_SIZE)
    let currentChunk = 0
    const fileReader = new FileReader()
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
        // 合并所有分片并计算MD5
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
 * 文件预检查（秒传检测）
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
 * 小文件直传（小于5MB）
 * @param {File} file
 * @param {String} category - 文件类别 image/video
 * @param {Function} onProgress - 进度回调 0-100
 * @returns {Promise<string>} 返回文件URL
 */
export const uploadSmallFile = async (file, category = 'image', onProgress) => {
  // 1. 计算文件MD5（占进度 0-40%）
  const fileMd5 = await calculateFileMD5(file, (md5Progress) => {
    if (onProgress) onProgress(Math.round(md5Progress * 0.4))
  })

  // 2. 调用check接口检测文件是否存在（占进度 40-50%）
  if (onProgress) onProgress(40)
  const checkResult = await checkFile({
    fileMd5,
    fileName: file.name,
    fileSize: file.size,
    totalChunks: 1,
    chunkSize: file.size
  })

  // 3. 秒传成功，直接返回
  if (checkResult && checkResult.exist) {
    if (onProgress) onProgress(100)
    return extractFileUrl(checkResult)
  }

  // 4. 上传文件（占进度 50-90%）
  if (onProgress) onProgress(50)
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)
  formData.append('fileMd5', fileMd5)
  
  const result = await request.post('/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  // 5. 上传完成（进度 100%）
  if (onProgress) onProgress(100)
  return extractFileUrl(result)
}

/**
 * 大文件分片上传（大于5MB）
 * @param {File} file
 * @param {String} category - 文件类别 image/video
 * @param {Function} onProgress - 进度回调 0-100
 * @returns {Promise<string>} 返回文件URL
 */
export const uploadLargeFile = async (file, category = 'video', onProgress) => {
  // 1. 计算文件MD5（占进度 0-30%）
  const fileMd5 = await calculateFileMD5(file, (md5Progress) => {
    if (onProgress) onProgress(Math.round(md5Progress * 0.3))
  })

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

  // 2. 预检查（占进度 30-35%）
  if (onProgress) onProgress(30)
  const checkResult = await checkFile({
    fileMd5,
    fileName: file.name,
    fileSize: file.size,
    totalChunks,
    chunkSize: CHUNK_SIZE
  })

  // 3. 秒传成功，直接返回
  if (checkResult && checkResult.exist) {
    if (onProgress) onProgress(100)
    return extractFileUrl(checkResult)
  }

  // 4. 获取已上传的分片，跳过已上传的
  const uploadedChunks = checkResult?.uploadedChunks || []
  const serverChunkSize = checkResult?.chunkSize || CHUNK_SIZE

  // 5. 上传剩余分片（占进度 35-90%）
  const chunkProgressWeight = 55
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

    // 进度回调
    if (onProgress) {
      const uploadedCount = uploadedChunks.filter(idx => idx < i).length + i + 1 - uploadedChunks.filter(idx => idx < i).length
      const uploadProgress = Math.round(((i + 1) / totalChunks) * chunkProgressWeight)
      onProgress(35 + uploadProgress)
    }
  }

  // 6. 合并分片（占进度 90-100%）
  if (onProgress) onProgress(90)
  const result = await mergeChunks({ fileMd5, category })

  if (onProgress) onProgress(100)
  return extractFileUrl(result)
}

/**
 * 从API响应中提取文件URL
 * @param {any} result - API响应
 * @returns {string} 文件URL
 */
const extractFileUrl = (result) => {
  if (typeof result === 'string') {
    return result
  }
  if (result && typeof result === 'object') {
    // 尝试多种可能的返回格式
    return result.url || result.data?.url || result.data?.fileUrl || result.fileUrl || result.file || ''
  }
  return ''
}

/**
 * 统一上传入口：根据文件大小自动选择直传或分片上传
 * @param {File} file
 * @param {Function} onProgress - 进度回调 0-100
 * @param {String} category - 文件类别 image/video，默认根据文件类型判断
 * @returns {Promise<string>} 返回文件URL字符串
 */
export const uploadFile = async (file, onProgress, category) => {
  // 自动判断类别
  if (!category) {
    category = file.type?.startsWith('video/') ? 'video' : 'image'
  }
  
  let result
  
  // 根据文件大小选择上传方式
  if (file.size <= CHUNK_SIZE) {
    // 小于5MB直接上传
    result = await uploadSmallFile(file, category, onProgress)
  } else {
    // 大于5MB分片上传
    result = await uploadLargeFile(file, category, onProgress)
  }
  
  return result
}
