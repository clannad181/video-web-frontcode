import request from '@/utils/request'

export function getReportList(params) {
  return request.get('/admin/report/list', { params })
}

export function handleReport(data) {
  return request.post('/admin/report/handle', data)
}
