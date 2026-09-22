import request from '@/utils/request'

export function getLoginLogList(params) {
  return request.get('/admin/loginLog/list', { params })
}

export function getLoginLogTrend(params) {
  return request.get('/admin/loginLog/trend', { params })
}
