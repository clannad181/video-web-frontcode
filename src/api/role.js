export function getRoleList(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = [
        { id: 1, name: 'admin', label: '超级管理员', description: '拥有所有权限', status: 1, memberCount: 3, createTime: '2024-01-01 00:00:00' },
        { id: 2, name: 'editor', label: '编辑', description: '内容编辑权限', status: 1, memberCount: 15, createTime: '2024-01-01 00:00:00' },
        { id: 3, name: 'auditor', label: '审核员', description: '内容审核权限', status: 1, memberCount: 8, createTime: '2024-01-01 00:00:00' },
        { id: 4, name: 'user', label: '普通用户', description: '基础用户权限', status: 1, memberCount: 56763, createTime: '2024-01-01 00:00:00' }
      ]
      resolve({ code: 200, data: { list, total: list.length }, message: 'success' })
    }, 500)
  })
}

export function getRoleDetail(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          id,
          name: 'editor',
          label: '编辑',
          description: '内容编辑权限',
          status: 1,
          permissions: [1, 2, 3, 5, 6, 7],
          createTime: '2024-01-01 00:00:00'
        },
        message: 'success'
      })
    }, 300)
  })
}

export function createRole(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: { id: Date.now() }, message: 'success' })
    }, 500)
  })
}

export function updateRole(id, data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function deleteRole(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function assignPermissions(roleId, permissionIds) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function changeRoleStatus(id, status) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: '状态修改成功' })
    }, 300)
  })
}
