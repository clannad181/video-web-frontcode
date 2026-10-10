import request from './request'

export const createReport = (data) => request.post('/client/report/create', data)

export const getDict = (typeCode) => request.get(`/client/dict/${typeCode}`)
