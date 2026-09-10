export function getMenuList() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: [
          {
            id: 1, parentId: 0, name: 'dashboard', title: '工作台', path: '/dashboard', icon: 'Odometer',
            component: 'dashboard/index', type: 1, sort: 1, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 2, parentId: 0, name: 'analytics', title: '数据分析', path: '/analytics', icon: 'TrendCharts',
            component: 'analytics/index', type: 1, sort: 2, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 10, parentId: 0, name: 'video', title: '视频管理', path: '/video', icon: 'VideoCamera',
            component: '', type: 0, sort: 3, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 11, parentId: 10, name: 'video-manage', title: '视频列表', path: '/video/video-manage',
            icon: '', component: 'video/video-manage', type: 1, sort: 1, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 12, parentId: 10, name: 'comment-manage', title: '评论管理', path: '/video/comment-manage',
            icon: '', component: 'video/comment-manage', type: 1, sort: 2, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 13, parentId: 10, name: 'danmaku-manage', title: '弹幕管理', path: '/video/danmaku-manage',
            icon: '', component: 'video/danmaku-manage', type: 1, sort: 3, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 20, parentId: 0, name: 'audit', title: '审核管理', path: '/audit', icon: 'Stamp',
            component: '', type: 0, sort: 4, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 21, parentId: 20, name: 'video-audit', title: '视频审核', path: '/audit/video-audit',
            icon: '', component: 'audit/video-audit', type: 1, sort: 1, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 22, parentId: 20, name: 'comment-audit', title: '评论审核', path: '/audit/comment-audit',
            icon: '', component: 'audit/comment-audit', type: 1, sort: 2, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 30, parentId: 0, name: 'user', title: '用户管理', path: '/user', icon: 'User',
            component: '', type: 0, sort: 5, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 31, parentId: 30, name: 'user-manage', title: '用户列表', path: '/user/user-manage',
            icon: '', component: 'user/user-manage', type: 1, sort: 1, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 32, parentId: 30, name: 'category-manage', title: '分类管理', path: '/user/category-manage',
            icon: '', component: 'user/category-manage', type: 1, sort: 2, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 100, parentId: 0, name: 'system', title: '系统管理', path: '/system', icon: 'Setting',
            component: '', type: 0, sort: 10, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 101, parentId: 100, name: 'website', title: '网站设置', path: '/system/website',
            icon: '', component: 'system/website', type: 1, sort: 1, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 102, parentId: 100, name: 'security', title: '安全设置', path: '/system/security',
            icon: '', component: 'system/security', type: 1, sort: 2, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 103, parentId: 100, name: 'token', title: '令牌安全', path: '/system/token',
            icon: '', component: 'system/token', type: 1, sort: 3, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 104, parentId: 100, name: 'notification', title: '通知设置', path: '/system/notification',
            icon: '', component: 'system/notification', type: 1, sort: 4, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 105, parentId: 100, name: 'appearance', title: '外观设置', path: '/system/appearance',
            icon: '', component: 'system/appearance', type: 1, sort: 5, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 106, parentId: 100, name: 'audit-config', title: '审核设置', path: '/system/audit-config',
            icon: '', component: 'system/audit-config', type: 1, sort: 6, status: 1, createTime: '2024-01-01 00:00:00'
          },
          {
            id: 107, parentId: 100, name: 'default', title: '默认设置', path: '/system/default',
            icon: '', component: 'system/default', type: 1, sort: 7, status: 1, createTime: '2024-01-01 00:00:00'
          }
        ],
        message: 'success'
      })
    }, 500)
  })
}

export function createMenu(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: { id: Date.now() }, message: 'success' })
    }, 500)
  })
}

export function updateMenu(id, data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 500)
  })
}

export function deleteMenu(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 200, data: null, message: 'success' })
    }, 300)
  })
}
