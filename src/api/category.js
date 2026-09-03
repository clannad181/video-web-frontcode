import request from './request'

export const getEnabledCategories = () => request.get('/admin/category/enabled')

export const getCategoryDetail = (id) => request.get(`/admin/category/${id}`)

export const getCategoryList = () => request.get('/client/category/list')
