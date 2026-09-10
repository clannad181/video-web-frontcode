export function getLoginLogList(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = Array.from({ length: params?.pageSize || 10 }, (_, i) => ({
        id: i + 1,
        userId: Math.floor(Math.random() * 100) + 1,
        username: `user${Math.floor(Math.random() * 100) + 1}`,
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
        os: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'][Math.floor(Math.random() * 5)],
        location: ['北京', '上海', '广州', '深圳', '杭州'][Math.floor(Math.random() * 5)],
        status: Math.random() > 0.1 ? 1 : 0,
        message: Math.random() > 0.1 ? '登录成功' : '密码错误',
        loginTime: '2024-06-0' + (Math.floor(Math.random() * 9) + 1) + ' ' + String(Math.floor(Math.random() * 24)).padStart(2, '0') + ':00:00'
      }))
      resolve({ code: 200, data: { list, total: 500 }, message: 'success' })
    }, 500)
  })
}

export function getOperationLogList(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = Array.from({ length: params?.pageSize || 10 }, (_, i) => ({
        id: i + 1,
        userId: Math.floor(Math.random() * 100) + 1,
        username: `user${Math.floor(Math.random() * 100) + 1}`,
        module: ['视频管理', '用户管理', '系统设置', '审核管理'][Math.floor(Math.random() * 4)],
        action: ['新增', '编辑', '删除', '查询'][Math.floor(Math.random() * 4)],
        method: ['POST', 'PUT', 'DELETE', 'GET'][Math.floor(Math.random() * 4)],
        url: '/api/v1/resource',
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        status: Math.random() > 0.05 ? 1 : 0,
        duration: Math.floor(Math.random() * 3000),
        operateTime: '2024-06-0' + (Math.floor(Math.random() * 9) + 1) + ' ' + String(Math.floor(Math.random() * 24)).padStart(2, '0') + ':00:00'
      }))
      resolve({ code: 200, data: { list, total: 1000 }, message: 'success' })
    }, 500)
  })
}

export function getLogStatistics(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const days = params?.days || 7
      resolve({
        code: 200,
        data: {
          dailyStats: Array.from({ length: days }, (_, i) => ({
            date: `2024-06-${String(i + 1).padStart(2, '0')}`,
            loginCount: Math.floor(Math.random() * 500) + 100,
            operationCount: Math.floor(Math.random() * 2000) + 500,
            errorCount: Math.floor(Math.random() * 50)
          })),
          moduleStats: [
            { module: '视频管理', count: 3456 },
            { module: '用户管理', count: 2345 },
            { module: '审核管理', count: 1234 },
            { module: '系统设置', count: 567 }
          ]
        },
        message: 'success'
      })
    }, 500)
  })
}

export function clearLogs(type) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function deleteLogs(ids) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: '删除成功' })
    }, 500)
  })
}

export function batchDeleteLogs(ids) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: '批量删除成功' })
    }, 500)
  })
}

export function exportLogs(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: { url: '/downloads/logs.xlsx' }, message: '导出成功' })
    }, 500)
  })
}
