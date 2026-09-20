import request from '@/utils/request'

export function getRoleList(params) {
  return request.get('/admin/role/list', { params })
}

export function addRole(data) {
  return request.post('/admin/role/add', data)
}

export function updateRole(data) {
  return request.post('/admin/role/update', data)
}

export function deleteRole(id) {
  return request.get(`/admin/role/delete/${id}`)
}

export function toggleMenu(roleId, menuIds) {
  return request.post('/admin/role/toggleMenu', { roleId, menuIds })
}

export function getBindMenuIds(roleId) {
  return request.get('/admin/role/getBindMenuIds', { params: { roleId } })
}

export function getMenuOptions() {
  return request.get('/admin/menu/options')
}
