import request from '@/utils/request'

// ===== 后台 · 字典类型 /admin/dict/type =====

export function getDictTypeList(params) {
  return request.get('/admin/dict/type/list', { params })
}

export function getDictTypeDetail(id) {
  return request.get(`/admin/dict/type/${id}`)
}

export function addDictType(data) {
  return request.post('/admin/dict/type/add', data)
}

export function updateDictType(data) {
  return request.post('/admin/dict/type/update', data)
}

export function deleteDictType(id) {
  return request.get(`/admin/dict/type/delete/${id}`)
}

// ===== 后台 · 字典数据 /admin/dict/data =====

export function getDictDataList(params) {
  return request.get('/admin/dict/data/list', { params })
}

export function getDictDataDetail(id) {
  return request.get(`/admin/dict/data/${id}`)
}

export function addDictData(data) {
  return request.post('/admin/dict/data/add', data)
}

export function updateDictData(data) {
  return request.post('/admin/dict/data/update', data)
}

export function deleteDictData(id) {
  return request.get(`/admin/dict/data/delete/${id}`)
}

// ===== 后台 · 按类型编码获取启用字典数据（供下拉选择）=====

/**
 * 根据字典类型编码查询启用中的所有字典数据（每次调用都回源，不走缓存）
 * GET /admin/dict/data/enabled/{typeCode}
 * @param {string} typeCode 字典类型编码
 * @returns {Promise<Array<{id:number,label:string,value:string,sort:number,isDefault:boolean}>>}
 */
export function getEnabledDictData(typeCode) {
  return request.get(`/admin/dict/data/enabled/${encodeURIComponent(typeCode)}`, {
    // 时间戳参数 + 请求头双重去缓存，确保每次拿到的都是最新字典
    params: { _t: Date.now() },
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
  })
}
