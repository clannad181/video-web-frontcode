import request from '@/utils/request'

export function getUserList(params) {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = Array.from({ length: params?.pageSize || 10 }, (_, i) => ({
        id: i + 1,
        username: `user${i + 1}`,
        nickname: `用户${i + 1}`,
        avatar: '',
        email: `user${i + 1}@example.com`,
        phone: `1380013800${i % 10}`,
        gender: Math.floor(Math.random() * 3),
        status: Math.random() > 0.2 ? 1 : 0,
        role: Math.random() > 0.8 ? 'admin' : 'user',
        signature: ['这个人很懒，什么都没写', '热爱生活，热爱编程', '分享技术，分享快乐', ''][Math.floor(Math.random() * 4)],
        vipStatus: Math.random() > 0.7 ? 1 : 0,
        videoCount: Math.floor(Math.random() * 100),
        fansCount: Math.floor(Math.random() * 10000),
        followCount: Math.floor(Math.random() * 500),
        createTime: '2024-01-01 00:00:00',
        lastLoginTime: '2024-06-01 12:00:00'
      }))
      resolve({ code: 200, data: { list, total: 500 }, message: 'success' })
    }, 500)
  })
}

export function getUserDetail(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          id,
          username: 'admin',
          nickname: '管理员',
          avatar: '',
          email: 'admin@example.com',
          phone: '13800138000',
          gender: 1,
          bio: '这是个人简介',
          signature: '热爱生活，热爱编程',
          status: 1,
          role: 'admin',
          vipStatus: 1,
          videoCount: 50,
          fansCount: 1234,
          followCount: 100,
          createTime: '2024-01-01 00:00:00',
          lastLoginTime: '2024-06-01 12:00:00'
        },
        message: 'success'
      })
    }, 300)
  })
}

export function createUser(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: { id: Date.now() }, message: 'success' })
    }, 500)
  })
}

export function updateUser(id, data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function deleteUser(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function batchDeleteUser(ids) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function changeUserStatus(id, status) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function resetPassword(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function getUserRoles(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: { roles: ['admin', 'editor'], roleIds: [1, 2] },
        message: 'success'
      })
    }, 300)
  })
}

export function assignRoles(id, roleIds) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}

export function uploadAvatar(file, onProgress) {
  return new Promise(resolve => {
    let progress = 0
    const timer = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(timer)
        onProgress?.(100)
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({ code: 200, data: { url: e.target.result }, message: 'success' })
        }
        reader.readAsDataURL(file)
      } else {
        onProgress?.(Math.min(Math.round(progress), 99))
      }
    }, 200)
  })
}
