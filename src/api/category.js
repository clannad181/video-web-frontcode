import request from '@/utils/request'

export function getCategoryList(params) {
  return request.get('/admin/category/list', { params })
}

export function createCategory(data) {
  return request.post('/admin/category/add', data)
}

export function updateCategory(id, data) {
  return request.post(`/admin/category/update/${id}`, data)
}

export function deleteCategory(id) {
  return request.get(`/admin/category/delete/${id}`)
}

export function updateCategorySort(ids) {
  return request.post('/admin/category/sort', { ids })
}
