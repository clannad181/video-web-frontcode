import request from '@/utils/request'

export function getSettingsList() {
  return request.get('/admin/config/list')
}

export function updateSettings(data) {
  return request.post('/admin/config/update', data)
}

export function resetSettings() {
  return request.post('/admin/setting/reset')
}

export function changePassword(data) {
  return request.post('/admin/user/resetPassword', data)
}

export function getCaptcha(params) {
  return request.get('/admin/user/captcha', { params })
}
