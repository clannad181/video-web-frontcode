import request from '@/utils/request'

export function getSystemInfo() {
  return request.get('/admin/system/info')
}
