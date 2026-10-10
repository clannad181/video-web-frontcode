import request from '@/utils/request'

/** 管理端全局搜索：视频/用户/评论 三类结果（GET /admin/search?keyword=&limit=） */
export function globalSearch(params) {
  return request.get('/admin/search', { params })
}
