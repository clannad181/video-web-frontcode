import request from '@/utils/request'

export function getOperationLogList(params) {
  return request.get('/admin/operationLog/list', { params })
}

export function getOperationLogDetail(id) {
  return request.get(`/admin/operationLog/${id}`)
}

export function getOperationLogOverview(params) {
  return request.get('/admin/operationLog/overview', { params })
}

export function getOperationLogTrend(params) {
  return request.get('/admin/operationLog/trend', { params })
}

export function getOperationLogAccountRank(params) {
  return request.get('/admin/operationLog/accountRank', { params })
}

export function getOperationLogIpRank(params) {
  return request.get('/admin/operationLog/ipRank', { params })
}
