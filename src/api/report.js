import request from './request'

export const createReport = (data) => request.post('/client/report/create', data)
