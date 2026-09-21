import request from '@/utils/request'

export function getCommentList(params) {
  return request.get('/admin/comment/list', { params })
}

export function getCommentDetail(commentId) {
  return request.get(`/admin/comment/detail/${commentId}`)
}

export function batchDeleteComments(ids) {
  return request.post('/admin/comment/batchDelete', { ids })
}

export function toggleCommentStatus(id) {
  return request.get(`/admin/comment/admin-delete/${id}`)
}

export function getVideoDetail(id) {
  return request.get(`/admin/video/${id}`)
}
