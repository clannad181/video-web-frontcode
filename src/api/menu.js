import request from '@/utils/request'

export function getMenuList(params) {
  return request.get('/admin/menu/list', { params })
}

export function getMenuOptions() {
  return request.get('/admin/menu/options')
}

export function updateMenu(data) {
  return request.post('/admin/menu/update', data)
}

export function deleteMenu(id) {
  return request.get(`/admin/menu/delete/${id}`)
}
