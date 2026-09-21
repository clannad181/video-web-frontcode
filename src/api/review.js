import request from '@/utils/request'

export function getVideoReviewList(params) {
  return request.get('/admin/video/review-list', { params })
}

export function getCommentReviewList(params) {
  return request.get('/admin/comment/review-list', { params })
}

export function getVideoDetail(id) {
  return request.get(`/admin/video/${id}`)
}

export function reviewVideo(id, videoStatus) {
  return request.post('/admin/video/update', { id, videoStatus })
}

export function reviewEpisode(id, reviewStatus) {
  return request.post('/admin/video/review', { id, reviewStatus })
}

export function reviewComment(commentId, reviewStatus) {
  return request.post('/admin/comment/review', { commentId, reviewStatus })
}

export function getVideoReviewStats() {
  return request.get('/admin/video/review-stats')
}

export function getCommentStatusStats() {
  return request.get('/admin/comment/status-stats')
}
