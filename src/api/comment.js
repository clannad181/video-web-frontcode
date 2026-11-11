import request from './request'

export const getComments = (params) => request.get('/admin/comment/list', { params })

export const addComment = (data) => request.post('/admin/comment/add', data)

export const deleteComment = (id) => request.delete(`/admin/comment/${id}`)

export const likeComment = (id) => request.post(`/admin/comment/${id}/like`)

export const replyComment = (data) => request.post('/admin/comment/reply', data)

export const getCommentTree = (videoUid, episodeUid, params) => 
  request.get(`/client/comments/${videoUid}/episode/${episodeUid}/comments`, { params })

export const postComment = (data) => 
  request.post('/client/comments/comments', data)

export const likeClientComment = (commentId) => 
  request.post(`/client/comments/${commentId}/like`)
