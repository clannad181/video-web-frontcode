import request from '@/utils/request'

export function getGoodsList(params) {
  return request.get('/admin/goods/list', { params })
}

export function getGoodsDetail(id) {
  return request.get(`/admin/goods/detail/${id}`)
}

export function addGoods(data) {
  return request.post('/admin/goods/add', data)
}

export function updateGoods(data) {
  return request.post('/admin/goods/update', data)
}

export function deleteGoods(id) {
  return request.get(`/admin/goods/delete/${id}`)
}
