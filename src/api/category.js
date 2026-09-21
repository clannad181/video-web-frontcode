import request from '@/utils/request'

export function getCategoryList(params) {
  return request.get('/admin/category/list', { params })
}

export function getEnabledCategories() {
  return request.get('/admin/category/enabled')
}

export function addCategory(data) {
  return request.post('/admin/category/add', data)
}

export function updateCategory(data) {
  return request.post('/admin/category/update', data)
}

export function deleteCategory(id) {
  return request.get(`/admin/category/delete/${id}`)
}
