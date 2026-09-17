import request from '@/utils/request'

/**
 * 小文件直传
 * @param {FormData} formData - 包含 file 和 category
 * @param {Object} config - axios 配置（onUploadProgress 等）
 */
export function uploadFile(formData, config = {}) {
  return request.post('/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
    ...config
  })
}

/**
 * 文件检查（秒传/断点续传）
 * @param {Object} params - {fileMd5, fileName, fileSize, totalChunks, chunkSize, category}
 */
export function checkFile(params) {
  return request.post('/file/check', params)
}

/**
 * 上传单个分片
 * @param {FormData} formData - 包含 fileMd5, chunkIndex, file
 * @param {Object} config - axios 配置
 */
export function uploadChunk(formData, config = {}) {
  return request.post('/file/chunk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
    ...config
  })
}

/**
 * 合并分片
 * @param {Object} data - {fileMd5}
 */
export function mergeChunks(data) {
  return request.post('/file/merge', data)
}
