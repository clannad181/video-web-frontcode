import request from '@/utils/request'

export function getReviewStats() {
  return request({ url: '/admin/video/review-stats', method: 'get' })
}

export function getDailyIncrement(params) {
  return request({ url: '/admin/stats/daily-increment', method: 'get', params })
}

export function getVideoList(params) {
  return request({ url: '/admin/video/list', method: 'get', params })
}
