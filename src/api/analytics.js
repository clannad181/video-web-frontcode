import request from '@/utils/request'

export function getStatsOverview() {
  return request({ url: '/admin/stats/overview', method: 'get' })
}

export function getActiveUsers(params) {
  return request({ url: '/admin/stats/active-users', method: 'get', params })
}

export function getDailyIncrement(params) {
  return request({ url: '/admin/stats/daily-increment', method: 'get', params })
}

export function getCategoryDailyIncrement(params) {
  return request({ url: '/admin/stats/category-daily-increment', method: 'get', params })
}

export function getCategoryStats() {
  return request({ url: '/admin/video/category-stats', method: 'get' })
}

export function getHourlyActive() {
  return request({ url: '/admin/operationLog/hourlyActive', method: 'get' })
}
