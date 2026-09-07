import request from './request'

export const getMessageList = (params) => request.get('/client/message/list', { params })

export const getUnreadCount = () => request.get('/client/message/unreadCount')

export const markAsRead = (messageUid) => request.post('/client/message/read', { messageUid })

export const markAllAsRead = () => request.post('/client/message/readAll')
