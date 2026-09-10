export function getNoticeList(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = Array.from({ length: params?.pageSize || 10 }, (_, i) => ({
        id: i + 1,
        title: `系统通知 ${i + 1}`,
        content: `这是一条系统通知内容，包含了重要的更新信息。通知编号：${i + 1}`,
        type: ['system', 'video', 'comment', 'user'][Math.floor(Math.random() * 4)],
        isRead: Math.random() > 0.5,
        targetId: Math.floor(Math.random() * 1000) + 1,
        createTime: '2024-06-0' + (Math.floor(Math.random() * 9) + 1) + ' 12:00:00'
      }))
      resolve({ code: 200, data: { list, total: 50, unread: 12 }, message: 'success' })
    }, 500)
  })
}

export function readNotice(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 200)
  })
}

export function readAllNotices() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function deleteNotice(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 200)
  })
}

export function getUnreadCount() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: { count: Math.floor(Math.random() * 20) }, message: 'success' })
    }, 200)
  })
}
