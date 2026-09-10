export function getCategoryList(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = [
        { id: 1, name: '科技', parentId: 0, sort: 1, icon: 'Monitor', status: 1, videoCount: 2345, createTime: '2024-01-01 00:00:00' },
        { id: 2, name: '编程', parentId: 1, sort: 1, icon: '', status: 1, videoCount: 890, createTime: '2024-01-01 00:00:00' },
        { id: 3, name: '游戏', parentId: 0, sort: 2, icon: 'GamePad', status: 1, videoCount: 1890, createTime: '2024-01-01 00:00:00' },
        { id: 4, name: '生活', parentId: 0, sort: 3, icon: 'Coffee', status: 1, videoCount: 1567, createTime: '2024-01-01 00:00:00' },
        { id: 5, name: '教育', parentId: 0, sort: 4, icon: 'Reading', status: 1, videoCount: 1234, createTime: '2024-01-01 00:00:00' },
        { id: 6, name: '娱乐', parentId: 0, sort: 5, icon: 'Music', status: 1, videoCount: 987, createTime: '2024-01-01 00:00:00' },
        { id: 7, name: '硬件', parentId: 1, sort: 2, icon: '', status: 1, videoCount: 456, createTime: '2024-01-01 00:00:00' },
        { id: 8, name: '手游', parentId: 3, sort: 1, icon: '', status: 1, videoCount: 678, createTime: '2024-01-01 00:00:00' },
        { id: 9, name: '单机', parentId: 3, sort: 2, icon: '', status: 1, videoCount: 543, createTime: '2024-01-01 00:00:00' },
        { id: 10, name: '已禁用', parentId: 0, sort: 6, icon: '', status: 0, videoCount: 0, createTime: '2024-01-01 00:00:00' }
      ]
      resolve({ code: 200, data: { list, total: list.length }, message: 'success' })
    }, 500)
  })
}

export function createCategory(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: { id: Date.now() }, message: 'success' })
    }, 500)
  })
}

export function updateCategory(id, data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function deleteCategory(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function updateCategorySort(ids) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}
