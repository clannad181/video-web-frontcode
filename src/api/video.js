import request from '@/utils/request'

export function getVideoList(params) {
  const clean = {}
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) clean[k] = v
  })
  return request.get('/admin/video/list', { params: clean })
}

export function getVideoDetail(id) {
  return request.get(`/admin/video/${id}`)
}

export function createVideo(data) {
  return request.post('/admin/video/add', data)
}

export function updateVideo(data) {
  return request.post('/admin/video/update', data)
}

export function deleteVideo(id) {
  return request.get(`/admin/video/delete/${id}`)
}

export function batchDeleteVideo(ids) {
  return request.post('/admin/video/batchDelete', { ids })
}

export function saveEpisodes(data) {
  return request.post('/admin/video/episode/save', data)
}
