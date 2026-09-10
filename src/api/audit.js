import request from '@/utils/request'

export function getAuditList(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = Array.from({ length: params?.pageSize || 10 }, (_, i) => ({
        id: i + 1,
        type: 'video',
        targetId: Math.floor(Math.random() * 1000) + 1,
        title: `待审核视频 ${i + 1}`,
        content: `这是待审核视频的描述 ${i + 1}`,
        cover: '',
        userId: Math.floor(Math.random() * 100) + 1,
        username: `user${i + 1}`,
        status: params?.status !== undefined ? params.status : Math.floor(Math.random() * 3),
        reason: '',
        auditor: '',
        auditTime: '',
        createTime: '2024-' + String(Math.floor(Math.random() * 6) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') + ' ' + String(Math.floor(Math.random() * 24)).padStart(2, '0') + ':00:00'
      }))
      resolve({ code: 200, data: { list, total: 80 }, message: 'success' })
    }, 500)
  })
}

export function auditItem(id, data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function batchAudit(ids, data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function rejectItem(id, reason) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function getAuditStats() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          pending: 23,
          today: 45,
          approved: 1200,
          rejected: 56
        },
        message: 'success'
      })
    }, 300)
  })
}
