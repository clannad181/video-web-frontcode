import request from '@/utils/request'

export function getVipList(params) {
  return request.get('/admin/vip/list', { params })
}

export function getVipDetail(id) {
  return request.get(`/admin/vip/detail/${id}`)
}

export function openVip(data) {
  return request.post('/admin/vip/open', data)
}

export function renewVip(data) {
  return request.post('/admin/vip/renew', data)
}

export function deleteVip(id) {
  return request.get(`/admin/vip/delete/${id}`)
}
