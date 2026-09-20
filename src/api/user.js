import request from '@/utils/request'

export function getUserList(params) {
  return request.get('/admin/user/list', { params })
}

export function addUser(data) {
  return request.post('/admin/user/add', data)
}

export function updateUser(data) {
  return request.post('/admin/user/update', data)
}

export function deleteUser(id) {
  return request.get(`/admin/user/delete/${id}`)
}

export function resetPassword(id, type) {
  return request.post('/admin/user/reset', { userId: id, type })
}

export function getRoleList() {
  return request.get('/admin/role/list')
}
